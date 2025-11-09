#!/usr/bin/env python3
"""
Database Synchronization Orchestrator
======================================
Automated synchronization system for all Predator12 databases:
- PostgreSQL → OpenSearch (search indexing)
- PostgreSQL → Qdrant (vector embeddings)
- Redis cache invalidation
- MinIO metadata sync

This script can be run:
1. Manually for one-time sync
2. Via cron for scheduled sync
3. Via Celery for event-driven sync
4. Via ETL pipeline (Dagster/Airflow)
"""

import os
import sys
import time
import logging
import argparse
import subprocess
from datetime import datetime
from typing import List, Dict, Any, Optional
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Project paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
PG_TO_OPENSEARCH_SCRIPT = PROJECT_ROOT / "predator12-local" / "scripts" / "index_pg_to_opensearch.py"
PG_TO_QDRANT_SCRIPT = PROJECT_ROOT / "predator12-local" / "ml" / "analytics" / "backend-api" / "scripts" / "postgres_to_qdrant.py"


class DatabaseSync:
    """Base class for database synchronization"""
    
    def __init__(self, name: str):
        self.name = name
        self.start_time = None
        self.end_time = None
        self.success = False
        self.error_message = None
    
    def run(self) -> bool:
        """Execute the sync operation"""
        raise NotImplementedError
    
    def duration(self) -> float:
        """Get sync duration in seconds"""
        if self.start_time and self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return 0.0


class PostgreSQLToOpenSearchSync(DatabaseSync):
    """Sync PostgreSQL data to OpenSearch for full-text search"""
    
    def __init__(self):
        super().__init__("PostgreSQL → OpenSearch")
        self.script_path = PG_TO_OPENSEARCH_SCRIPT
    
    def run(self) -> bool:
        """Execute PostgreSQL to OpenSearch sync"""
        logger.info(f"Starting {self.name} sync...")
        self.start_time = datetime.now()
        
        try:
            if not self.script_path.exists():
                raise FileNotFoundError(f"Script not found: {self.script_path}")
            
            # Execute the sync script
            result = subprocess.run(
                [sys.executable, str(self.script_path)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                logger.info(f"{self.name} sync completed successfully")
                logger.debug(result.stdout)
                self.success = True
            else:
                logger.error(f"{self.name} sync failed")
                logger.error(result.stderr)
                self.error_message = result.stderr
                self.success = False
            
            self.end_time = datetime.now()
            return self.success
            
        except subprocess.TimeoutExpired:
            logger.error(f"{self.name} sync timed out")
            self.error_message = "Timeout after 5 minutes"
            self.end_time = datetime.now()
            return False
        except Exception as e:
            logger.error(f"{self.name} sync error: {e}")
            self.error_message = str(e)
            self.end_time = datetime.now()
            return False


class PostgreSQLToQdrantSync(DatabaseSync):
    """Sync PostgreSQL data to Qdrant for vector search"""
    
    def __init__(self):
        super().__init__("PostgreSQL → Qdrant")
        self.script_path = PG_TO_QDRANT_SCRIPT
    
    def run(self) -> bool:
        """Execute PostgreSQL to Qdrant sync"""
        logger.info(f"Starting {self.name} sync...")
        self.start_time = datetime.now()
        
        try:
            if not self.script_path.exists():
                raise FileNotFoundError(f"Script not found: {self.script_path}")
            
            # Check if required environment variables are set
            required_vars = ["PREDATOR_DB_URL", "QDRANT_URL"]
            missing_vars = [var for var in required_vars if not os.getenv(var)]
            if missing_vars:
                logger.warning(f"Missing environment variables: {missing_vars}")
                logger.warning("Using default values from script")
            
            # Execute the sync script
            result = subprocess.run(
                [sys.executable, str(self.script_path)],
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout (embeddings take longer)
            )
            
            if result.returncode == 0:
                logger.info(f"{self.name} sync completed successfully")
                logger.debug(result.stdout)
                self.success = True
            else:
                logger.error(f"{self.name} sync failed")
                logger.error(result.stderr)
                self.error_message = result.stderr
                self.success = False
            
            self.end_time = datetime.now()
            return self.success
            
        except subprocess.TimeoutExpired:
            logger.error(f"{self.name} sync timed out")
            self.error_message = "Timeout after 10 minutes"
            self.end_time = datetime.now()
            return False
        except Exception as e:
            logger.error(f"{self.name} sync error: {e}")
            self.error_message = str(e)
            self.end_time = datetime.now()
            return False


class RedisCacheInvalidation(DatabaseSync):
    """Invalidate Redis cache after database updates"""
    
    def __init__(self, selective: bool = True):
        super().__init__("Redis Cache Invalidation")
        self.selective = selective
    
    def run(self) -> bool:
        """Invalidate Redis cache"""
        logger.info(f"Starting {self.name}...")
        self.start_time = datetime.now()
        
        try:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            
            if self.selective:
                logger.info("Selective cache invalidation (pattern-based)")
                # In production, you'd invalidate specific keys
                # For now, just log the action
                logger.info("Would invalidate keys matching: customs_*, declarations_*")
                self.success = True
            else:
                logger.info("Full cache flush requested")
                # Try to flush using redis-cli if available
                try:
                    result = subprocess.run(
                        ["redis-cli", "-u", redis_url, "FLUSHDB"],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if result.returncode == 0:
                        logger.info("Redis cache flushed successfully")
                        self.success = True
                    else:
                        logger.warning("Redis flush failed, continuing anyway")
                        self.success = True  # Don't fail the whole sync
                except FileNotFoundError:
                    logger.warning("redis-cli not found, skipping cache invalidation")
                    self.success = True
            
            self.end_time = datetime.now()
            return self.success
            
        except Exception as e:
            logger.warning(f"{self.name} error (non-critical): {e}")
            self.error_message = str(e)
            self.end_time = datetime.now()
            return True  # Don't fail the whole sync for cache issues


class MinIOMetadataSync(DatabaseSync):
    """Sync MinIO object metadata if needed"""
    
    def __init__(self):
        super().__init__("MinIO Metadata Sync")
    
    def run(self) -> bool:
        """Sync MinIO metadata"""
        logger.info(f"Starting {self.name}...")
        self.start_time = datetime.now()
        
        try:
            # MinIO is typically self-contained
            # This is a placeholder for future metadata sync if needed
            logger.info("MinIO metadata sync not required (object storage is self-contained)")
            self.success = True
            self.end_time = datetime.now()
            return True
            
        except Exception as e:
            logger.warning(f"{self.name} error (non-critical): {e}")
            self.error_message = str(e)
            self.end_time = datetime.now()
            return True


class SyncOrchestrator:
    """Orchestrates all database synchronization tasks"""
    
    def __init__(self, skip_qdrant: bool = False, skip_opensearch: bool = False):
        self.syncs: List[DatabaseSync] = []
        self.skip_qdrant = skip_qdrant
        self.skip_opensearch = skip_opensearch
        
        # Add sync tasks in order of dependency
        if not skip_opensearch:
            self.syncs.append(PostgreSQLToOpenSearchSync())
        
        if not skip_qdrant:
            self.syncs.append(PostgreSQLToQdrantSync())
        
        self.syncs.append(RedisCacheInvalidation(selective=True))
        self.syncs.append(MinIOMetadataSync())
    
    def run_all(self, fail_fast: bool = False) -> bool:
        """
        Run all synchronization tasks
        
        Args:
            fail_fast: If True, stop on first failure
        
        Returns:
            True if all syncs succeeded, False otherwise
        """
        logger.info("=" * 70)
        logger.info("DATABASE SYNCHRONIZATION ORCHESTRATOR")
        logger.info("=" * 70)
        logger.info(f"Running {len(self.syncs)} synchronization tasks...")
        logger.info("")
        
        start_time = time.time()
        all_success = True
        
        for sync in self.syncs:
            try:
                success = sync.run()
                
                if not success:
                    all_success = False
                    if fail_fast:
                        logger.error(f"Stopping due to failure in {sync.name}")
                        break
                
                logger.info(f"  ✓ {sync.name}: {'SUCCESS' if success else 'FAILED'} "
                          f"({sync.duration():.2f}s)")
                logger.info("")
                
            except Exception as e:
                logger.error(f"  ✗ {sync.name}: EXCEPTION - {e}")
                logger.info("")
                all_success = False
                if fail_fast:
                    break
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        logger.info("=" * 70)
        logger.info("SYNCHRONIZATION SUMMARY")
        logger.info("=" * 70)
        logger.info(f"Total duration: {total_duration:.2f}s")
        logger.info(f"Tasks completed: {sum(1 for s in self.syncs if s.end_time is not None)}/{len(self.syncs)}")
        logger.info(f"Successful: {sum(1 for s in self.syncs if s.success)}")
        logger.info(f"Failed: {sum(1 for s in self.syncs if s.end_time and not s.success)}")
        
        if not all_success:
            logger.info("")
            logger.info("Failed tasks:")
            for sync in self.syncs:
                if sync.end_time and not sync.success:
                    logger.info(f"  - {sync.name}: {sync.error_message}")
        
        logger.info("=" * 70)
        
        return all_success
    
    def run_single(self, sync_name: str) -> bool:
        """Run a single synchronization task by name"""
        for sync in self.syncs:
            if sync_name.lower() in sync.name.lower():
                logger.info(f"Running single task: {sync.name}")
                return sync.run()
        
        logger.error(f"Sync task not found: {sync_name}")
        return False


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Database Synchronization Orchestrator for Predator12",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                           # Run all sync tasks
  %(prog)s --skip-qdrant            # Skip Qdrant sync (if embeddings not ready)
  %(prog)s --skip-opensearch        # Skip OpenSearch sync
  %(prog)s --fail-fast              # Stop on first failure
  %(prog)s --single opensearch      # Run only OpenSearch sync
  %(prog)s --verbose                # Enable debug logging

Environment Variables:
  PREDATOR_DB_URL                   PostgreSQL connection URL
  QDRANT_URL                        Qdrant server URL
  OPENSEARCH_URL                    OpenSearch server URL
  REDIS_URL                         Redis connection URL
        """
    )
    
    parser.add_argument(
        '--skip-qdrant',
        action='store_true',
        help='Skip PostgreSQL to Qdrant synchronization'
    )
    
    parser.add_argument(
        '--skip-opensearch',
        action='store_true',
        help='Skip PostgreSQL to OpenSearch synchronization'
    )
    
    parser.add_argument(
        '--fail-fast',
        action='store_true',
        help='Stop on first synchronization failure'
    )
    
    parser.add_argument(
        '--single',
        type=str,
        metavar='SYNC_NAME',
        help='Run only a single sync task (e.g., "opensearch", "qdrant", "redis")'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable debug logging'
    )
    
    args = parser.parse_args()
    
    # Set log level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create orchestrator
    orchestrator = SyncOrchestrator(
        skip_qdrant=args.skip_qdrant,
        skip_opensearch=args.skip_opensearch
    )
    
    # Run sync tasks
    try:
        if args.single:
            success = orchestrator.run_single(args.single)
        else:
            success = orchestrator.run_all(fail_fast=args.fail_fast)
        
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        logger.warning("\nSync interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"Orchestrator error: {e}", exc_info=args.verbose)
        sys.exit(1)


if __name__ == "__main__":
    main()
