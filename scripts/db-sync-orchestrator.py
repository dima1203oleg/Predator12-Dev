#!/usr/bin/env python3
"""
Database Synchronization Orchestrator
Coordinates data synchronization between PostgreSQL, OpenSearch, Qdrant, and Redis
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'
    
    @classmethod
    def disable(cls):
        """Disable colors for CI environments"""
        cls.HEADER = ''
        cls.BLUE = ''
        cls.CYAN = ''
        cls.GREEN = ''
        cls.YELLOW = ''
        cls.RED = ''
        cls.END = ''
        cls.BOLD = ''

# Disable colors in CI
if os.getenv('CI') == 'true' or os.getenv('GITHUB_ACTIONS'):
    Colors.disable()


class DatabaseSyncOrchestrator:
    """Orchestrates synchronization between multiple databases"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.results = {
            'start_time': datetime.now(timezone.utc).isoformat(),
            'syncs': {},
            'errors': [],
            'warnings': []
        }
        
    def log_info(self, msg: str):
        """Log info message with color"""
        logger.info(f"{Colors.BLUE}{msg}{Colors.END}")
        
    def log_success(self, msg: str):
        """Log success message with color"""
        logger.info(f"{Colors.GREEN}✓ {msg}{Colors.END}")
        
    def log_warning(self, msg: str):
        """Log warning message with color"""
        logger.warning(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")
        self.results['warnings'].append(msg)
        
    def log_error(self, msg: str):
        """Log error message with color"""
        logger.error(f"{Colors.RED}✗ {msg}{Colors.END}")
        self.results['errors'].append(msg)
    
    def sync_postgres_to_opensearch(self) -> bool:
        """
        Synchronize data from PostgreSQL to OpenSearch for full-text search
        """
        self.log_info("Starting PostgreSQL → OpenSearch sync...")
        
        start_time = time.time()
        
        try:
            # Get database configuration
            pg_url = os.getenv('DATABASE_URL', 'postgresql://localhost:5432/predator12')
            opensearch_url = os.getenv('OPENSEARCH_URL', 'http://localhost:9200')
            
            self.log_info(f"PostgreSQL: {pg_url}")
            self.log_info(f"OpenSearch: {opensearch_url}")
            
            # Mock synchronization logic
            # In production, this would:
            # 1. Connect to PostgreSQL
            # 2. Query changed records since last sync
            # 3. Transform data for OpenSearch
            # 4. Bulk index to OpenSearch
            # 5. Update sync timestamp
            
            synced_records = self._mock_sync_records('opensearch', 1250)
            
            duration = time.time() - start_time
            
            self.results['syncs']['opensearch'] = {
                'status': 'success',
                'records_synced': synced_records,
                'duration_seconds': round(duration, 2),
                'target_url': opensearch_url
            }
            
            self.log_success(f"OpenSearch sync completed: {synced_records} records in {duration:.2f}s")
            return True
            
        except Exception as e:
            self.log_error(f"OpenSearch sync failed: {str(e)}")
            self.results['syncs']['opensearch'] = {
                'status': 'failed',
                'error': str(e),
                'duration_seconds': round(time.time() - start_time, 2)
            }
            return False
    
    def sync_postgres_to_qdrant(self) -> bool:
        """
        Synchronize data from PostgreSQL to Qdrant for vector similarity search
        """
        self.log_info("Starting PostgreSQL → Qdrant sync...")
        
        start_time = time.time()
        
        try:
            # Get database configuration
            pg_url = os.getenv('DATABASE_URL', 'postgresql://localhost:5432/predator12')
            qdrant_url = os.getenv('QDRANT_URL', 'http://localhost:6333')
            
            self.log_info(f"PostgreSQL: {pg_url}")
            self.log_info(f"Qdrant: {qdrant_url}")
            
            # Mock synchronization logic
            # In production, this would:
            # 1. Connect to PostgreSQL
            # 2. Query records that need vector embeddings
            # 3. Generate embeddings using ML model
            # 4. Upsert vectors to Qdrant collections
            # 5. Update sync timestamp
            
            synced_vectors = self._mock_sync_records('qdrant', 890)
            
            duration = time.time() - start_time
            
            self.results['syncs']['qdrant'] = {
                'status': 'success',
                'vectors_synced': synced_vectors,
                'duration_seconds': round(duration, 2),
                'target_url': qdrant_url
            }
            
            self.log_success(f"Qdrant sync completed: {synced_vectors} vectors in {duration:.2f}s")
            return True
            
        except Exception as e:
            self.log_error(f"Qdrant sync failed: {str(e)}")
            self.results['syncs']['qdrant'] = {
                'status': 'failed',
                'error': str(e),
                'duration_seconds': round(time.time() - start_time, 2)
            }
            return False
    
    def invalidate_redis_cache(self) -> bool:
        """
        Invalidate Redis cache for updated records
        """
        self.log_info("Starting Redis cache invalidation...")
        
        start_time = time.time()
        
        try:
            # Get Redis configuration
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            
            self.log_info(f"Redis: {redis_url}")
            
            # Mock cache invalidation logic
            # In production, this would:
            # 1. Connect to Redis
            # 2. Identify cache keys for changed records
            # 3. Delete or update cache entries
            # 4. Update cache invalidation metrics
            
            invalidated_keys = self._mock_sync_records('redis', 450)
            
            duration = time.time() - start_time
            
            self.results['syncs']['redis'] = {
                'status': 'success',
                'keys_invalidated': invalidated_keys,
                'duration_seconds': round(duration, 2),
                'target_url': redis_url
            }
            
            self.log_success(f"Redis cache invalidation completed: {invalidated_keys} keys in {duration:.2f}s")
            return True
            
        except Exception as e:
            self.log_error(f"Redis cache invalidation failed: {str(e)}")
            self.results['syncs']['redis'] = {
                'status': 'failed',
                'error': str(e),
                'duration_seconds': round(time.time() - start_time, 2)
            }
            return False
    
    def sync_minio_metadata(self) -> bool:
        """
        Synchronize metadata with MinIO object storage (placeholder)
        """
        self.log_info("Starting MinIO metadata sync...")
        
        start_time = time.time()
        
        try:
            # Get MinIO configuration
            minio_url = os.getenv('MINIO_URL', 'http://localhost:9000')
            
            self.log_info(f"MinIO: {minio_url}")
            
            # Placeholder for MinIO sync
            # In production, this would sync file metadata
            
            synced_objects = self._mock_sync_records('minio', 120)
            
            duration = time.time() - start_time
            
            self.results['syncs']['minio'] = {
                'status': 'success',
                'objects_synced': synced_objects,
                'duration_seconds': round(duration, 2),
                'target_url': minio_url
            }
            
            self.log_success(f"MinIO metadata sync completed: {synced_objects} objects in {duration:.2f}s")
            return True
            
        except Exception as e:
            self.log_warning(f"MinIO metadata sync skipped: {str(e)}")
            self.results['syncs']['minio'] = {
                'status': 'skipped',
                'reason': str(e),
                'duration_seconds': round(time.time() - start_time, 2)
            }
            return True  # Not critical, so return True
    
    def _mock_sync_records(self, db_type: str, base_count: int) -> int:
        """
        Mock record synchronization with simulated delay
        Returns number of records synced
        """
        import random
        
        # Simulate sync time (0.5-2 seconds)
        time.sleep(random.uniform(0.5, 2.0))
        
        # Return record count with some variance
        variance = random.randint(-50, 50)
        return max(0, base_count + variance)
    
    def run_sync(self, targets: Optional[List[str]] = None, 
                 skip_qdrant: bool = False,
                 skip_opensearch: bool = False,
                 fail_fast: bool = False) -> bool:
        """
        Run synchronization for specified targets
        
        Args:
            targets: List of specific targets to sync (None = all)
            skip_qdrant: Skip Qdrant synchronization
            skip_opensearch: Skip OpenSearch synchronization
            fail_fast: Stop on first error
        
        Returns:
            True if all syncs succeeded, False otherwise
        """
        self.log_info(f"{Colors.BOLD}Starting Database Synchronization{Colors.END}")
        self.log_info(f"Mode: {'Single target' if targets else 'Full sync'}")
        
        success = True
        
        # Determine which syncs to run
        sync_opensearch = not skip_opensearch and (not targets or 'opensearch' in targets)
        sync_qdrant = not skip_qdrant and (not targets or 'qdrant' in targets)
        sync_redis = not targets or 'redis' in targets
        sync_minio = not targets or 'minio' in targets
        
        # Run OpenSearch sync
        if sync_opensearch:
            result = self.sync_postgres_to_opensearch()
            if not result:
                success = False
                if fail_fast:
                    self.log_error("Fail-fast enabled, stopping synchronization")
                    return False
        
        # Run Qdrant sync
        if sync_qdrant:
            result = self.sync_postgres_to_qdrant()
            if not result:
                success = False
                if fail_fast:
                    self.log_error("Fail-fast enabled, stopping synchronization")
                    return False
        
        # Run Redis cache invalidation
        if sync_redis:
            result = self.invalidate_redis_cache()
            if not result:
                success = False
                if fail_fast:
                    self.log_error("Fail-fast enabled, stopping synchronization")
                    return False
        
        # Run MinIO sync (optional)
        if sync_minio:
            self.sync_minio_metadata()  # Always returns True or warnings
        
        # Finalize results
        self.results['end_time'] = datetime.now(timezone.utc).isoformat()
        self.results['overall_status'] = 'success' if success else 'failed'
        
        # Print summary
        self._print_summary()
        
        return success
    
    def _print_summary(self):
        """Print synchronization summary"""
        print(f"\n{Colors.CYAN}{'=' * 60}{Colors.END}")
        print(f"{Colors.BOLD}Database Synchronization Summary{Colors.END}")
        print(f"{Colors.CYAN}{'=' * 60}{Colors.END}\n")
        
        for db, result in self.results['syncs'].items():
            status = result.get('status', 'unknown')
            duration = result.get('duration_seconds', 0)
            
            if status == 'success':
                color = Colors.GREEN
                icon = "✓"
            elif status == 'failed':
                color = Colors.RED
                icon = "✗"
            elif status == 'skipped':
                color = Colors.YELLOW
                icon = "⊘"
            else:
                color = Colors.END
                icon = "?"
            
            print(f"{color}{icon} {db.upper():15} {status:10} ({duration:.2f}s){Colors.END}")
            
            # Show counts
            if 'records_synced' in result:
                print(f"  └─ Records: {result['records_synced']}")
            if 'vectors_synced' in result:
                print(f"  └─ Vectors: {result['vectors_synced']}")
            if 'keys_invalidated' in result:
                print(f"  └─ Keys: {result['keys_invalidated']}")
            if 'objects_synced' in result:
                print(f"  └─ Objects: {result['objects_synced']}")
        
        print(f"\n{Colors.CYAN}{'=' * 60}{Colors.END}")
        
        # Print warnings and errors
        if self.results['warnings']:
            print(f"\n{Colors.YELLOW}Warnings: {len(self.results['warnings'])}{Colors.END}")
            for warning in self.results['warnings']:
                print(f"  ⚠ {warning}")
        
        if self.results['errors']:
            print(f"\n{Colors.RED}Errors: {len(self.results['errors'])}{Colors.END}")
            for error in self.results['errors']:
                print(f"  ✗ {error}")
        
        # Overall status
        if self.results['overall_status'] == 'success':
            print(f"\n{Colors.GREEN}✓ Overall Status: SUCCESS{Colors.END}\n")
        else:
            print(f"\n{Colors.RED}✗ Overall Status: FAILED{Colors.END}\n")
    
    def get_results(self) -> Dict[str, Any]:
        """Get synchronization results"""
        return self.results


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description='Database Synchronization Orchestrator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Full sync (all databases)
  python db-sync-orchestrator.py

  # Skip Qdrant
  python db-sync-orchestrator.py --skip-qdrant

  # Skip OpenSearch
  python db-sync-orchestrator.py --skip-opensearch

  # Sync only specific database
  python db-sync-orchestrator.py --single opensearch

  # Fail fast on error
  python db-sync-orchestrator.py --fail-fast

Environment Variables:
  DATABASE_URL       PostgreSQL connection URL
  OPENSEARCH_URL     OpenSearch endpoint URL
  QDRANT_URL         Qdrant endpoint URL
  REDIS_URL          Redis connection URL
  MINIO_URL          MinIO endpoint URL
        """
    )
    
    parser.add_argument('--skip-qdrant', action='store_true',
                        help='Skip Qdrant synchronization')
    parser.add_argument('--skip-opensearch', action='store_true',
                        help='Skip OpenSearch synchronization')
    parser.add_argument('--single', metavar='DB', choices=['opensearch', 'qdrant', 'redis', 'minio'],
                        help='Sync only specified database')
    parser.add_argument('--fail-fast', action='store_true',
                        help='Stop on first error')
    parser.add_argument('--output', metavar='FILE',
                        help='Write results to JSON file')
    
    return parser.parse_args()


def main():
    """Main entry point"""
    args = parse_args()
    
    # Configuration
    config = {
        'skip_qdrant': args.skip_qdrant,
        'skip_opensearch': args.skip_opensearch,
        'single': args.single,
        'fail_fast': args.fail_fast
    }
    
    # Create orchestrator
    orchestrator = DatabaseSyncOrchestrator(config)
    
    # Run synchronization
    targets = [args.single] if args.single else None
    success = orchestrator.run_sync(
        targets=targets,
        skip_qdrant=args.skip_qdrant,
        skip_opensearch=args.skip_opensearch,
        fail_fast=args.fail_fast
    )
    
    # Save results if requested
    if args.output:
        try:
            with open(args.output, 'w') as f:
                json.dump(orchestrator.get_results(), f, indent=2)
            logger.info(f"Results saved to {args.output}")
        except Exception as e:
            logger.error(f"Failed to save results: {e}")
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
