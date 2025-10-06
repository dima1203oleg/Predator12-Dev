#!/usr/bin/env python3
"""
Production Health Monitor for Predator Analytics
Comprehensive system health checking and alerting
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from typing import Dict, List, Any
import aiohttp
import asyncpg
import redis.asyncio as redis
from opensearchpy import AsyncOpenSearch
import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/app/logs/health_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class HealthStatus:
    service: str
    status: str  # healthy, degraded, unhealthy
    response_time: float
    message: str
    timestamp: datetime
    details: Dict[str, Any] = None

class HealthMonitor:
    def __init__(self):
        backend_internal = os.getenv("BACKEND_INTERNAL_URL", "http://backend:5001/health")

        self.postgres_user = os.getenv("POSTGRES_USER", "predator_user")
        self.postgres_password = os.getenv("POSTGRES_PASSWORD", "secure_postgres_password_2024")
        self.postgres_db = os.getenv("POSTGRES_DB", "predator11")
        postgres_host = os.getenv("POSTGRES_HOST", "db")
        postgres_port = os.getenv("POSTGRES_PORT", "5432")
        postgres_conn = (
            f"postgresql://{self.postgres_user}:{self.postgres_password}" \
            f"@{postgres_host}:{postgres_port}/{self.postgres_db}"
        )

        redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

        opensearch_base = os.getenv("OPENSEARCH_URL", "http://opensearch:9200").rstrip('/')
        self.opensearch_base = opensearch_base

        qdrant_base = os.getenv("QDRANT_URL", "http://qdrant:6333").rstrip('/')

        grafana_health = os.getenv("GRAFANA_HEALTH_URL", "http://grafana:3000/api/health")
        prometheus_health = os.getenv("PROMETHEUS_HEALTH_URL", "http://prometheus:9090/-/healthy")
        minio_health = os.getenv("MINIO_HEALTH_URL", "http://minio:9000/minio/health/live")
        keycloak_health = os.getenv("KEYCLOAK_HEALTH_URL", "http://keycloak:8080/realms/master")

        self.services = {
            'backend_api': backend_internal,
            'postgres': postgres_conn,
            'redis': redis_url,
            'opensearch': f"{opensearch_base}/_cluster/health",
            'qdrant': f"{qdrant_base}/healthz",
            'grafana': grafana_health,
            'prometheus': prometheus_health,
            'minio': minio_health,
            'keycloak': keycloak_health
        }
        self.thresholds = {
            'response_time': 5.0,  # seconds
            'cpu_usage': 80.0,      # percent
            'memory_usage': 85.0,   # percent
            'disk_usage': 90.0,     # percent
            'error_rate': 5.0       # percent
        }
        self.alert_webhook = 'http://alertmanager-webhook:8080/webhook'
        
    async def check_http_service(self, service_name: str, url: str) -> HealthStatus:
        """Check HTTP-based service health"""
        start_time = time.time()
        
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(url) as response:
                    response_time = time.time() - start_time
                    
                    if response.status == 200:
                        data = await response.json() if 'json' in response.headers.get('content-type', '') else {}
                        return HealthStatus(
                            service=service_name,
                            status='healthy',
                            response_time=response_time,
                            message='Service is responding normally',
                            timestamp=datetime.now(),
                            details=data
                        )
                    else:
                        return HealthStatus(
                            service=service_name,
                            status='degraded',
                            response_time=response_time,
                            message=f'Service returned status {response.status}',
                            timestamp=datetime.now()
                        )
                        
        except asyncio.TimeoutError:
            return HealthStatus(
                service=service_name,
                status='unhealthy',
                response_time=time.time() - start_time,
                message='Service request timed out',
                timestamp=datetime.now()
            )
        except Exception as e:
            return HealthStatus(
                service=service_name,
                status='unhealthy',
                response_time=time.time() - start_time,
                message=f'Service check failed: {str(e)}',
                timestamp=datetime.now()
            )

    async def check_postgres(self) -> HealthStatus:
        """Check PostgreSQL database health"""
        start_time = time.time()
        
        try:
            conn = await asyncpg.connect(self.services['postgres'])
            
            # Test query
            await conn.fetchval('SELECT 1')
            
            # Get database stats
            stats = await conn.fetchrow(
                """
                SELECT 
                    numbackends,
                    xact_commit,
                    xact_rollback,
                    tup_returned,
                    tup_fetched
                FROM pg_stat_database 
                WHERE datname = $1
                """,
                self.postgres_db,
            )
            
            await conn.close()
            
            response_time = time.time() - start_time
            
            return HealthStatus(
                service='postgres',
                status='healthy',
                response_time=response_time,
                message='Database is responding normally',
                timestamp=datetime.now(),
                details=dict(stats) if stats else {}
            )
            
        except Exception as e:
            return HealthStatus(
                service='postgres',
                status='unhealthy',
                response_time=time.time() - start_time,
                message=f'Database check failed: {str(e)}',
                timestamp=datetime.now()
            )

    async def check_redis(self) -> HealthStatus:
        """Check Redis cache health"""
        start_time = time.time()
        
        try:
            r = redis.from_url(self.services['redis'])
            
            # Test ping
            await r.ping()
            
            # Get Redis info
            info = await r.info()
            
            await r.close()
            
            response_time = time.time() - start_time
            
            memory_usage = info.get('used_memory_percent', 0)
            status = 'healthy' if memory_usage < 90 else 'degraded'
            
            return HealthStatus(
                service='redis',
                status=status,
                response_time=response_time,
                message=f'Redis is responding (memory: {memory_usage:.1f}%)',
                timestamp=datetime.now(),
                details={
                    'connected_clients': info.get('connected_clients', 0),
                    'used_memory_human': info.get('used_memory_human', 'N/A'),
                    'keyspace_hits': info.get('keyspace_hits', 0),
                    'keyspace_misses': info.get('keyspace_misses', 0)
                }
            )
            
        except Exception as e:
            return HealthStatus(
                service='redis',
                status='unhealthy',
                response_time=time.time() - start_time,
                message=f'Redis check failed: {str(e)}',
                timestamp=datetime.now()
            )

    async def check_opensearch(self) -> HealthStatus:
        """Check OpenSearch cluster health"""
        start_time = time.time()
        
        try:
            client = AsyncOpenSearch(hosts=[self.opensearch_base])
            
            health = await client.cluster.health()
            
            await client.close()
            
            response_time = time.time() - start_time
            
            cluster_status = health.get('status', 'red')
            status_map = {'green': 'healthy', 'yellow': 'degraded', 'red': 'unhealthy'}
            
            return HealthStatus(
                service='opensearch',
                status=status_map.get(cluster_status, 'unhealthy'),
                response_time=response_time,
                message=f'Cluster status: {cluster_status}',
                timestamp=datetime.now(),
                details={
                    'cluster_name': health.get('cluster_name'),
                    'number_of_nodes': health.get('number_of_nodes'),
                    'active_primary_shards': health.get('active_primary_shards'),
                    'active_shards': health.get('active_shards'),
                    'relocating_shards': health.get('relocating_shards'),
                    'unassigned_shards': health.get('unassigned_shards')
                }
            )
            
        except Exception as e:
            return HealthStatus(
                service='opensearch',
                status='unhealthy',
                response_time=time.time() - start_time,
                message=f'OpenSearch check failed: {str(e)}',
                timestamp=datetime.now()
            )

    async def check_system_resources(self) -> HealthStatus:
        """Check system resource usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Determine overall status
            status = 'healthy'
            issues = []
            
            if cpu_percent > self.thresholds['cpu_usage']:
                status = 'degraded'
                issues.append(f'High CPU usage: {cpu_percent:.1f}%')
                
            if memory.percent > self.thresholds['memory_usage']:
                status = 'degraded'
                issues.append(f'High memory usage: {memory.percent:.1f}%')
                
            if disk.percent > self.thresholds['disk_usage']:
                status = 'unhealthy'
                issues.append(f'High disk usage: {disk.percent:.1f}%')
            
            message = 'System resources normal'
            if issues:
                message = '; '.join(issues)
            
            return HealthStatus(
                service='system_resources',
                status=status,
                response_time=0.0,
                message=message,
                timestamp=datetime.now(),
                details={
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_available_gb': memory.available / (1024**3),
                    'disk_percent': disk.percent,
                    'disk_free_gb': disk.free / (1024**3)
                }
            )
            
        except Exception as e:
            return HealthStatus(
                service='system_resources',
                status='unhealthy',
                response_time=0.0,
                message=f'System check failed: {str(e)}',
                timestamp=datetime.now()
            )

    async def send_alert(self, status: HealthStatus):
        """Send alert for unhealthy services"""
        if status.status == 'healthy':
            return
            
        alert_data = {
            'receiver': 'health-monitor',
            'status': 'firing' if status.status == 'unhealthy' else 'resolved',
            'alerts': [{
                'status': 'firing' if status.status == 'unhealthy' else 'resolved',
                'labels': {
                    'alertname': 'ServiceHealthCheck',
                    'service': status.service,
                    'severity': 'critical' if status.status == 'unhealthy' else 'warning'
                },
                'annotations': {
                    'summary': f'Service {status.service} is {status.status}',
                    'description': status.message,
                    'response_time': str(status.response_time)
                },
                'startsAt': status.timestamp.isoformat(),
                'generatorURL': f'http://health-monitor:8080/health/{status.service}'
            }]
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.alert_webhook, json=alert_data) as response:
                    if response.status == 200:
                        logger.info(f"Alert sent for {status.service}")
                    else:
                        logger.warning(f"Failed to send alert: {response.status}")
                        
        except Exception as e:
            logger.error(f"Error sending alert: {e}")

    async def run_health_checks(self) -> List[HealthStatus]:
        """Run all health checks"""
        logger.info("Starting health checks...")
        
        tasks = []
        
        # HTTP services
        for service, url in self.services.items():
            if service in ['postgres', 'redis', 'opensearch']:
                continue  # These have specialized checks
            tasks.append(self.check_http_service(service, url))
        
        # Specialized checks
        tasks.extend([
            self.check_postgres(),
            self.check_redis(),
            self.check_opensearch(),
            self.check_system_resources()
        ])
        
        # Run all checks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and log them
        health_statuses = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Health check failed with exception: {result}")
                # Create a failure status
                health_statuses.append(HealthStatus(
                    service=f"check_{i}",
                    status='unhealthy',
                    response_time=0.0,
                    message=f"Check failed: {result}",
                    timestamp=datetime.now()
                ))
            else:
                health_statuses.append(result)
        
        return health_statuses

    async def generate_report(self, statuses: List[HealthStatus]) -> Dict[str, Any]:
        """Generate health report"""
        overall_status = 'healthy'
        if any(s.status == 'unhealthy' for s in statuses):
            overall_status = 'unhealthy'
        elif any(s.status == 'degraded' for s in statuses):
            overall_status = 'degraded'
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overall_status': overall_status,
            'services': {s.service: asdict(s) for s in statuses},
            'summary': {
                'total_services': len(statuses),
                'healthy': len([s for s in statuses if s.status == 'healthy']),
                'degraded': len([s for s in statuses if s.status == 'degraded']),
                'unhealthy': len([s for s in statuses if s.status == 'unhealthy'])
            }
        }

    async def monitor_loop(self, interval: int = 60):
        """Main monitoring loop"""
        logger.info(f"Starting health monitor loop (interval: {interval}s)")
        
        while True:
            try:
                # Run health checks
                statuses = await self.run_health_checks()
                
                # Generate report
                report = await self.generate_report(statuses)
                
                # Log summary
                summary = report['summary']
                logger.info(f"Health check complete: {summary['healthy']}/{summary['total_services']} healthy")
                
                # Send alerts for unhealthy services
                for status in statuses:
                    if status.status in ['unhealthy', 'degraded']:
                        await self.send_alert(status)
                
                # Save report to file
                with open('/app/logs/health_report.json', 'w') as f:
                    json.dump(report, f, indent=2, default=str)
                
                # Wait for next check
                await asyncio.sleep(interval)
                
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                await asyncio.sleep(30)  # Shorter retry interval

async def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Predator Analytics Health Monitor")
    parser.add_argument('--interval', type=int, default=60, help='Check interval in seconds')
    parser.add_argument('--once', action='store_true', help='Run checks once and exit')
    args = parser.parse_args()
    
    monitor = HealthMonitor()
    
    if args.once:
        # Single run
        statuses = await monitor.run_health_checks()
        report = await monitor.generate_report(statuses)
        print(json.dumps(report, indent=2, default=str))
    else:
        # Continuous monitoring
        await monitor.monitor_loop(args.interval)

if __name__ == "__main__":
    asyncio.run(main())
