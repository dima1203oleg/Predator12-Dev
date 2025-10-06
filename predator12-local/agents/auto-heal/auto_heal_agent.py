#!/usr/bin/env python3
"""
AutoHeal Agent for Predator11
Automatically detects and remediates system issues
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

import aioredis
import asyncpg
from kafka import KafkaProducer, KafkaConsumer
from prometheus_client import Counter, Histogram, Gauge
import docker
import subprocess
import psutil

# Metrics
HEAL_ACTIONS_COUNTER = Counter('auto_heal_actions_total', 'Total healing actions performed')
INCIDENTS_DETECTED = Counter('incidents_detected_total', 'Total incidents detected')
HEAL_SUCCESS_RATE = Gauge('heal_success_rate', 'Success rate of healing actions')

class IncidentType(Enum):
    SERVICE_DOWN = "service_down"
    HIGH_CPU = "high_cpu"
    HIGH_MEMORY = "high_memory"
    HIGH_ERROR_RATE = "high_error_rate"
    DATABASE_ISSUES = "database_issues"
    DISK_FULL = "disk_full"
    NETWORK_ISSUES = "network_issues"

class HealingAction(Enum):
    RESTART_SERVICE = "restart_service"
    SCALE_UP = "scale_up"
    SCALE_DOWN = "scale_down"
    CLEAR_CACHE = "clear_cache"
    ROLLBACK = "rollback"
    KILL_PROCESSES = "kill_processes"
    CLEANUP_DISK = "cleanup_disk"

@dataclass
class Incident:
    type: IncidentType
    severity: str  # low, medium, high, critical
    description: str
    affected_component: str
    metrics: Dict[str, Any]
    timestamp: datetime

@dataclass
class RemediationPlan:
    incident: Incident
    actions: List[HealingAction]
    priority: int
    estimated_downtime: int  # seconds
    rollback_plan: List[str]

class AutoHealAgent:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.running = False

        # Connections
        self.redis: Optional[aioredis.Redis] = None
        self.postgres_pool: Optional[asyncpg.Pool] = None
        self.kafka_producer: Optional[KafkaProducer] = None
        self.kafka_consumer: Optional[KafkaConsumer] = None
        self.docker_client = docker.from_env()

        # Healing state
        self.active_incidents: List[Incident] = []
        self.healing_history: List[Dict] = []
        self.check_interval = config.get('check_interval', 60)  # 1 minute

        # Thresholds
        self.thresholds = {
            'cpu_usage': config.get('cpu_threshold', 85),
            'memory_usage': config.get('memory_threshold', 90),
            'error_rate': config.get('error_rate_threshold', 0.05),
            'response_time': config.get('response_time_threshold', 5000)
        }

    async def initialize(self):
        """Initialize connections and resources"""
        try:
            # Redis connection
            self.redis = aioredis.from_url(
                self.config['redis_url'],
                encoding="utf-8",
                decode_responses=True
            )

            # PostgreSQL connection pool
            self.postgres_pool = await asyncpg.create_pool(
                self.config['database_url'],
                min_size=2,
                max_size=10
            )

            # Kafka producer for notifications
            self.kafka_producer = KafkaProducer(
                bootstrap_servers=self.config['kafka_brokers'],
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )

            # Start Kafka consumer for incident notifications
            self.kafka_consumer = KafkaConsumer(
                'system.incidents',
                'monitoring.alerts',
                bootstrap_servers=self.config['kafka_brokers'],
                value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                group_id='autoheal-agent'
            )

            self.logger.info("AutoHealAgent initialized successfully")

        except Exception as e:
            self.logger.error(f"Failed to initialize AutoHealAgent: {e}")
            raise

    async def start(self):
        """Start the auto-heal agent"""
        self.running = True
        self.logger.info("Starting AutoHealAgent")

        # Start monitoring loop
        monitoring_task = asyncio.create_task(self._monitoring_loop())

        # Start Kafka consumer loop
        consumer_task = asyncio.create_task(self._kafka_consumer_loop())

        # Start remediation loop
        remediation_task = asyncio.create_task(self._remediation_loop())

        await asyncio.gather(monitoring_task, consumer_task, remediation_task)

    async def stop(self):
        """Stop the agent gracefully"""
        self.running = False
        self.logger.info("Stopping AutoHealAgent")

        if self.postgres_pool:
            await self.postgres_pool.close()
        if self.redis:
            await self.redis.close()
        if self.kafka_producer:
            self.kafka_producer.close()
        if self.kafka_consumer:
            self.kafka_consumer.close()

    async def _monitoring_loop(self):
        """Main monitoring loop to detect incidents"""
        while self.running:
            try:
                # Collect system metrics
                metrics = await self._collect_system_health()

                # Detect incidents
                incidents = await self._detect_incidents(metrics)

                # Add new incidents to active list
                for incident in incidents:
                    if not self._is_duplicate_incident(incident):
                        self.active_incidents.append(incident)
                        INCIDENTS_DETECTED.inc()

                        # Notify other systems
                        await self._notify_incident_detected(incident)

                        self.logger.warning(f"Incident detected: {incident.description}")

                await asyncio.sleep(self.check_interval)

            except Exception as e:
                self.logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(60)

    async def _kafka_consumer_loop(self):
        """Process incoming Kafka messages about incidents"""
        while self.running:
            try:
                # Poll for messages with timeout
                message_pack = self.kafka_consumer.poll(timeout_ms=1000)

                for topic_partition, messages in message_pack.items():
                    for message in messages:
                        await self._process_kafka_incident(message.value)

            except Exception as e:
                self.logger.error(f"Error in Kafka consumer loop: {e}")
                await asyncio.sleep(5)

    async def _remediation_loop(self):
        """Process active incidents and execute remediation plans"""
        while self.running:
            try:
                if self.active_incidents:
                    # Sort incidents by severity and priority
                    sorted_incidents = sorted(
                        self.active_incidents,
                        key=lambda x: (
                            {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}[x.severity],
                            x.timestamp
                        ),
                        reverse=True
                    )

                    # Process top priority incident
                    incident = sorted_incidents[0]

                    # Create remediation plan
                    plan = await self._create_remediation_plan(incident)

                    if plan:
                        # Execute remediation
                        success = await self._execute_remediation_plan(plan)

                        if success:
                            # Remove from active incidents
                            self.active_incidents.remove(incident)
                            self.logger.info(f"Successfully remediated incident: {incident.description}")
                        else:
                            # Mark as failed and try later
                            incident.severity = 'critical' if incident.severity != 'critical' else 'critical'
                            self.logger.error(f"Failed to remediate incident: {incident.description}")

                await asyncio.sleep(30)  # Check every 30 seconds

            except Exception as e:
                self.logger.error(f"Error in remediation loop: {e}")
                await asyncio.sleep(60)

    async def _collect_system_health(self) -> Dict[str, Any]:
        """Collect comprehensive system health metrics"""
        health_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'system': await self._collect_system_metrics(),
            'services': await self._collect_service_health(),
            'database': await self._collect_database_health(),
            'redis': await self._collect_redis_health(),
            'disk': await self._collect_disk_metrics(),
            'network': await self._collect_network_metrics()
        }

        return health_data

    async def _collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system-level metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            load_avg = psutil.getloadavg()

            return {
                'cpu_usage': cpu_percent,
                'memory_usage': memory.percent,
                'memory_available': memory.available,
                'load_average': load_avg[0],  # 1-minute average
                'processes': len(psutil.pids())
            }
        except Exception as e:
            self.logger.error(f"Failed to collect system metrics: {e}")
            return {}

    async def _collect_service_health(self) -> Dict[str, Any]:
        """Collect health status of Docker services"""
        services_health = {}

        try:
            containers = self.docker_client.containers.list()

            for container in containers:
                service_name = container.name

                # Get container stats
                stats = container.stats(stream=False)

                # Calculate CPU usage
                cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - \
                           stats['precpu_stats']['cpu_usage']['total_usage']
                system_delta = stats['cpu_stats']['system_cpu_usage'] - \
                              stats['precpu_stats']['system_cpu_usage']

                cpu_usage = 0
                if system_delta > 0:
                    cpu_usage = (cpu_delta / system_delta) * 100

                # Calculate memory usage
                memory_usage = stats['memory_stats']['usage']
                memory_limit = stats['memory_stats']['limit']
                memory_percent = (memory_usage / memory_limit) * 100

                services_health[service_name] = {
                    'status': container.status,
                    'cpu_usage': cpu_usage,
                    'memory_usage': memory_usage,
                    'memory_percent': memory_percent,
                    'restart_count': container.attrs['RestartCount'],
                    'health': container.attrs.get('State', {}).get('Health', {}).get('Status', 'unknown')
                }

        except Exception as e:
            self.logger.error(f"Failed to collect service health: {e}")

        return services_health

    async def _collect_database_health(self) -> Dict[str, Any]:
        """Collect database health metrics"""
        try:
            async with self.postgres_pool.acquire() as conn:
                # Check connection count
                conn_count = await conn.fetchval("""
                    SELECT count(*) FROM pg_stat_activity 
                    WHERE state = 'active'
                """)

                # Check for long-running queries
                long_queries = await conn.fetch("""
                    SELECT count(*) as count, max(now() - query_start) as max_duration 
                    FROM pg_stat_activity 
                    WHERE state = 'active' AND query_start < now() - interval '5 minutes'
                """)

                # Check database size
                db_size = await conn.fetchval("""
                    SELECT pg_database_size(current_database())
                """)

                return {
                    'active_connections': conn_count,
                    'long_running_queries': long_queries[0]['count'] if long_queries else 0,
                    'max_query_duration': str(long_queries[0]['max_duration']) if long_queries else None,
                    'database_size': db_size,
                    'status': 'healthy'
                }

        except Exception as e:
            self.logger.error(f"Failed to collect database health: {e}")
            return {'status': 'unhealthy', 'error': str(e)}

    async def _collect_redis_health(self) -> Dict[str, Any]:
        """Collect Redis health metrics"""
        try:
            info = await self.redis.info()

            return {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory': info.get('used_memory', 0),
                'used_memory_peak': info.get('used_memory_peak', 0),
                'keyspace_hits': info.get('keyspace_hits', 0),
                'keyspace_misses': info.get('keyspace_misses', 0),
                'status': 'healthy'
            }

        except Exception as e:
            self.logger.error(f"Failed to collect Redis health: {e}")
            return {'status': 'unhealthy', 'error': str(e)}

    async def _collect_disk_metrics(self) -> Dict[str, Any]:
        """Collect disk usage metrics"""
        try:
            disk_usage = psutil.disk_usage('/')

            return {
                'total': disk_usage.total,
                'used': disk_usage.used,
                'free': disk_usage.free,
                'percent': (disk_usage.used / disk_usage.total) * 100
            }

        except Exception as e:
            self.logger.error(f"Failed to collect disk metrics: {e}")
            return {}

    async def _collect_network_metrics(self) -> Dict[str, Any]:
        """Collect network metrics"""
        try:
            net_io = psutil.net_io_counters()

            return {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv,
                'errin': net_io.errin,
                'errout': net_io.errout
            }

        except Exception as e:
            self.logger.error(f"Failed to collect network metrics: {e}")
            return {}

    async def _detect_incidents(self, health_data: Dict[str, Any]) -> List[Incident]:
        """Detect incidents from health data"""
        incidents = []
        timestamp = datetime.utcnow()

        system_data = health_data.get('system', {})
        services_data = health_data.get('services', {})
        database_data = health_data.get('database', {})
        disk_data = health_data.get('disk', {})

        # High CPU usage
        if system_data.get('cpu_usage', 0) > self.thresholds['cpu_usage']:
            incidents.append(Incident(
                type=IncidentType.HIGH_CPU,
                severity='high' if system_data['cpu_usage'] > 95 else 'medium',
                description=f"High CPU usage: {system_data['cpu_usage']:.1f}%",
                affected_component='system',
                metrics={'cpu_usage': system_data['cpu_usage']},
                timestamp=timestamp
            ))

        # High memory usage
        if system_data.get('memory_usage', 0) > self.thresholds['memory_usage']:
            incidents.append(Incident(
                type=IncidentType.HIGH_MEMORY,
                severity='critical' if system_data['memory_usage'] > 95 else 'high',
                description=f"High memory usage: {system_data['memory_usage']:.1f}%",
                affected_component='system',
                metrics={'memory_usage': system_data['memory_usage']},
                timestamp=timestamp
            ))

        # Service down
        for service_name, service_data in services_data.items():
            if service_data.get('status') not in ['running', 'healthy']:
                incidents.append(Incident(
                    type=IncidentType.SERVICE_DOWN,
                    severity='critical',
                    description=f"Service {service_name} is {service_data.get('status')}",
                    affected_component=service_name,
                    metrics=service_data,
                    timestamp=timestamp
                ))

        # Database issues
        if database_data.get('status') == 'unhealthy':
            incidents.append(Incident(
                type=IncidentType.DATABASE_ISSUES,
                severity='critical',
                description="Database connectivity issues",
                affected_component='database',
                metrics=database_data,
                timestamp=timestamp
            ))

        # Disk full
        if disk_data.get('percent', 0) > 90:
            incidents.append(Incident(
                type=IncidentType.DISK_FULL,
                severity='critical' if disk_data['percent'] > 95 else 'high',
                description=f"Disk usage high: {disk_data['percent']:.1f}%",
                affected_component='disk',
                metrics=disk_data,
                timestamp=timestamp
            ))

        return incidents

    async def _is_duplicate_incident(self, incident: Incident) -> bool:
        """Check if incident is already being handled"""
        for active_incident in self.active_incidents:
            if (active_incident.type == incident.type and
                active_incident.affected_component == incident.affected_component):
                return True
        return False

    async def _create_remediation_plan(self, incident: Incident) -> Optional[RemediationPlan]:
        """Create a remediation plan for the incident"""
        actions = []
        priority = 1
        estimated_downtime = 0
        rollback_plan = []

        if incident.type == IncidentType.SERVICE_DOWN:
            actions = [HealingAction.RESTART_SERVICE]
            priority = 1
            estimated_downtime = 30
            rollback_plan = ["Manual service verification required"]

        elif incident.type == IncidentType.HIGH_CPU:
            if incident.severity == 'critical':
                actions = [HealingAction.KILL_PROCESSES, HealingAction.SCALE_UP]
            else:
                actions = [HealingAction.SCALE_UP]
            priority = 2
            estimated_downtime = 0

        elif incident.type == IncidentType.HIGH_MEMORY:
            actions = [HealingAction.CLEAR_CACHE, HealingAction.RESTART_SERVICE]
            priority = 1
            estimated_downtime = 60
            rollback_plan = ["Restore from backup if data loss occurs"]

        elif incident.type == IncidentType.DATABASE_ISSUES:
            actions = [HealingAction.RESTART_SERVICE]
            priority = 1
            estimated_downtime = 120
            rollback_plan = ["Failover to replica database"]

        elif incident.type == IncidentType.DISK_FULL:
            actions = [HealingAction.CLEANUP_DISK]
            priority = 1
            estimated_downtime = 0

        if not actions:
            return None

        return RemediationPlan(
            incident=incident,
            actions=actions,
            priority=priority,
            estimated_downtime=estimated_downtime,
            rollback_plan=rollback_plan
        )

    async def _execute_remediation_plan(self, plan: RemediationPlan) -> bool:
        """Execute a remediation plan"""
        success = True

        self.logger.info(f"Executing remediation plan for: {plan.incident.description}")

        for action in plan.actions:
            try:
                action_success = await self._execute_healing_action(action, plan.incident)
                if not action_success:
                    success = False
                    break

                HEAL_ACTIONS_COUNTER.inc()

            except Exception as e:
                self.logger.error(f"Failed to execute healing action {action}: {e}")
                success = False
                break

        # Update success rate metric
        current_success_rate = HEAL_ACTIONS_COUNTER._value.get() / max(1, INCIDENTS_DETECTED._value.get())
        HEAL_SUCCESS_RATE.set(current_success_rate)

        # Record healing attempt
        self.healing_history.append({
            'incident': {
                'type': plan.incident.type.value,
                'severity': plan.incident.severity,
                'description': plan.incident.description,
                'component': plan.incident.affected_component
            },
            'actions': [action.value for action in plan.actions],
            'success': success,
            'timestamp': datetime.utcnow().isoformat()
        })

        # Notify about remediation result
        await self._notify_remediation_result(plan, success)

        return success

    async def _execute_healing_action(self, action: HealingAction, incident: Incident) -> bool:
        """Execute a specific healing action"""
        try:
            if action == HealingAction.RESTART_SERVICE:
                return await self._restart_service(incident.affected_component)

            elif action == HealingAction.SCALE_UP:
                return await self._scale_service(incident.affected_component, 'up')

            elif action == HealingAction.SCALE_DOWN:
                return await self._scale_service(incident.affected_component, 'down')

            elif action == HealingAction.CLEAR_CACHE:
                return await self._clear_cache()

            elif action == HealingAction.KILL_PROCESSES:
                return await self._kill_high_cpu_processes()

            elif action == HealingAction.CLEANUP_DISK:
                return await self._cleanup_disk()

            elif action == HealingAction.ROLLBACK:
                return await self._rollback_service(incident.affected_component)

            else:
                self.logger.warning(f"Unknown healing action: {action}")
                return False

        except Exception as e:
            self.logger.error(f"Error executing healing action {action}: {e}")
            return False

    async def _restart_service(self, service_name: str) -> bool:
        """Restart a Docker service"""
        try:
            container = self.docker_client.containers.get(service_name)
            container.restart()

            # Wait for service to be healthy
            await asyncio.sleep(10)

            container.reload()
            return container.status == 'running'

        except Exception as e:
            self.logger.error(f"Failed to restart service {service_name}: {e}")
            return False

    async def _scale_service(self, service_name: str, direction: str) -> bool:
        """Scale a service up or down using docker-compose"""
        try:
            scale_factor = 2 if direction == 'up' else 1

            result = subprocess.run([
                'docker-compose', 'scale', f'{service_name}={scale_factor}'
            ], capture_output=True, text=True)

            return result.returncode == 0

        except Exception as e:
            self.logger.error(f"Failed to scale service {service_name}: {e}")
            return False

    async def _clear_cache(self) -> bool:
        """Clear Redis cache"""
        try:
            await self.redis.flushdb()
            return True
        except Exception as e:
            self.logger.error(f"Failed to clear cache: {e}")
            return False

    async def _kill_high_cpu_processes(self) -> bool:
        """Kill processes consuming high CPU"""
        try:
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
                try:
                    if proc.info['cpu_percent'] > 50:  # High CPU threshold
                        processes.append(proc)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            # Kill top 3 CPU consumers (excluding system processes)
            killed_count = 0
            for proc in sorted(processes, key=lambda x: x.info['cpu_percent'], reverse=True)[:3]:
                try:
                    if proc.info['name'] not in ['systemd', 'kernel', 'init']:
                        proc.terminate()
                        killed_count += 1
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            return killed_count > 0

        except Exception as e:
            self.logger.error(f"Failed to kill high CPU processes: {e}")
            return False

    async def _cleanup_disk(self) -> bool:
        """Clean up disk space"""
        try:
            # Clean Docker system
            subprocess.run(['docker', 'system', 'prune', '-f'], check=True)

            # Clean logs older than 7 days
            subprocess.run([
                'find', '/var/log', '-name', '*.log', '-mtime', '+7', '-delete'
            ], check=False)

            return True

        except Exception as e:
            self.logger.error(f"Failed to cleanup disk: {e}")
            return False

    async def _rollback_service(self, service_name: str) -> bool:
        """Rollback a service to previous version"""
        try:
            # This would typically involve deploying previous container version
            # For now, just restart the service
            return await self._restart_service(service_name)

        except Exception as e:
            self.logger.error(f"Failed to rollback service {service_name}: {e}")
            return False

    async def _process_kafka_incident(self, incident_data: Dict[str, Any]):
        """Process incident received from Kafka"""
        try:
            incident = Incident(
                type=IncidentType(incident_data.get('type', 'service_down')),
                severity=incident_data.get('severity', 'medium'),
                description=incident_data.get('description', 'Unknown incident'),
                affected_component=incident_data.get('component', 'unknown'),
                metrics=incident_data.get('metrics', {}),
                timestamp=datetime.fromisoformat(incident_data.get('timestamp', datetime.utcnow().isoformat()))
            )

            if not self._is_duplicate_incident(incident):
                self.active_incidents.append(incident)
                INCIDENTS_DETECTED.inc()
                self.logger.info(f"Incident received from Kafka: {incident.description}")

        except Exception as e:
            self.logger.error(f"Failed to process Kafka incident: {e}")

    async def _notify_incident_detected(self, incident: Incident):
        """Notify other systems about detected incident"""
        notification = {
            'type': 'incident_detected',
            'incident': {
                'type': incident.type.value,
                'severity': incident.severity,
                'description': incident.description,
                'component': incident.affected_component,
                'metrics': incident.metrics
            },
            'timestamp': incident.timestamp.isoformat(),
            'agent': 'auto_heal'
        }

        self.kafka_producer.send('system.notifications', notification)

    async def _notify_remediation_result(self, plan: RemediationPlan, success: bool):
        """Notify about remediation result"""
        notification = {
            'type': 'remediation_completed',
            'incident': {
                'type': plan.incident.type.value,
                'severity': plan.incident.severity,
                'description': plan.incident.description,
                'component': plan.incident.affected_component
            },
            'actions': [action.value for action in plan.actions],
            'success': success,
            'timestamp': datetime.utcnow().isoformat(),
            'agent': 'auto_heal'
        }

        self.kafka_producer.send('system.notifications', notification)

async def main():
    """Main entry point for the Auto-Heal Agent"""
    import os

    config = {
        'redis_url': os.getenv('REDIS_URL', 'redis://localhost:6379'),
        'database_url': os.getenv('DATABASE_URL', 'postgresql://postgres:predator_secure_pass_2024@localhost:5432/predator11'),
        'kafka_brokers': os.getenv('KAFKA_BROKERS', 'localhost:19092').split(','),
        'check_interval': int(os.getenv('HEAL_CHECK_INTERVAL', 60)),
        'cpu_threshold': float(os.getenv('CPU_THRESHOLD', 85)),
        'memory_threshold': float(os.getenv('MEMORY_THRESHOLD', 90)),
        'error_rate_threshold': float(os.getenv('ERROR_RATE_THRESHOLD', 0.05))
    }

    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    agent = AutoHealAgent(config)

    try:
        await agent.initialize()
        await agent.start()
    except KeyboardInterrupt:
        logging.info("Received interrupt signal")
    finally:
        await agent.stop()

if __name__ == "__main__":
    asyncio.run(main())
