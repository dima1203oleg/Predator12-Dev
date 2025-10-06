#!/usr/bin/env python3
"""
Self-Diagnosis Agent for Predator11
Continuously monitors system health and diagnoses issues
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
import psutil
import httpx

# Metrics
DIAGNOSES_COUNTER = Counter('self_diagnosis_total', 'Total diagnoses performed')
HEALTH_CHECK_DURATION = Histogram('health_check_duration_seconds', 'Time spent on health checks')
SYSTEM_HEALTH_SCORE = Gauge('system_health_score', 'Current system health score (0-100)')

class DiagnosisType(Enum):
    PERFORMANCE_ISSUE = "performance_issue"
    RESOURCE_EXHAUSTION = "resource_exhaustion"
    SERVICE_DEGRADATION = "service_degradation"
    NETWORK_ISSUE = "network_issue"
    DATABASE_ISSUE = "database_issue"
    API_ISSUE = "api_issue"

class Severity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class DiagnosisResult:
    type: DiagnosisType
    severity: Severity
    component: str
    description: str
    metrics: Dict[str, Any]
    recommendations: List[str]
    timestamp: datetime
    confidence: float  # 0.0-1.0

@dataclass
class HealthReport:
    overall_score: float
    diagnoses: List[DiagnosisResult]
    system_metrics: Dict[str, Any]
    trends: Dict[str, List[float]]
    timestamp: datetime

class SelfDiagnosisAgent:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.running = False
        
        # Connections
        self.redis = None
        self.postgres_pool = None
        self.kafka_producer = None
        self.kafka_consumer = None
        
        # Configuration
        self.check_interval = config.get('check_interval', 60)  # seconds
        self.confidence_threshold = config.get('confidence_threshold', 0.7)
        self.analysis_window = config.get('analysis_window_minutes', 15)
        
        # Historical data for trend analysis
        self.metric_history = {}
        
        self.logger.info("SelfDiagnosisAgent initialized")

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

            # Start Kafka consumer for health events
            self.kafka_consumer = KafkaConsumer(
                'system.health',
                'monitoring.alerts',
                bootstrap_servers=self.config['kafka_brokers'],
                value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                group_id='selfdiagnosis-agent'
            )

            self.logger.info("SelfDiagnosisAgent initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize SelfDiagnosisAgent: {e}")
            raise

    async def start(self):
        """Start the self-diagnosis agent"""
        self.running = True
        self.logger.info("Starting SelfDiagnosisAgent")

        # Start diagnostic loop
        diagnostic_task = asyncio.create_task(self._diagnostic_loop())

        # Start Kafka consumer loop  
        consumer_task = asyncio.create_task(self._kafka_consumer_loop())

        # Start trend analysis loop
        trend_task = asyncio.create_task(self._trend_analysis_loop())

        await asyncio.gather(diagnostic_task, consumer_task, trend_task)

    async def stop(self):
        """Stop the agent gracefully"""
        self.running = False
        self.logger.info("Stopping SelfDiagnosisAgent")

        if self.postgres_pool:
            await self.postgres_pool.close()
        if self.redis:
            await self.redis.close()
        if self.kafka_producer:
            self.kafka_producer.close()
        if self.kafka_consumer:
            self.kafka_consumer.close()

    async def _diagnostic_loop(self):
        """Main diagnostic loop"""
        while self.running:
            try:
                with HEALTH_CHECK_DURATION.time():
                    # Collect system metrics
                    metrics = await self._collect_system_metrics()
                    
                    # Update metric history for trend analysis
                    await self._update_metric_history(metrics)
                    
                    # Perform diagnoses
                    diagnoses = await self._perform_diagnoses(metrics)
                    
                    # Calculate overall health score
                    health_score = await self._calculate_health_score(diagnoses, metrics)
                    SYSTEM_HEALTH_SCORE.set(health_score)
                    
                    # Create health report
                    report = HealthReport(
                        overall_score=health_score,
                        diagnoses=diagnoses,
                        system_metrics=metrics,
                        trends=await self._get_metric_trends(),
                        timestamp=datetime.utcnow()
                    )
                    
                    # Store and notify
                    await self._store_health_report(report)
                    await self._notify_diagnoses(diagnoses)
                    
                    DIAGNOSES_COUNTER.inc(len(diagnoses))

                await asyncio.sleep(self.check_interval)

            except Exception as e:
                self.logger.error(f"Error in diagnostic loop: {e}")
                await asyncio.sleep(30)  # Wait before retry

    async def _kafka_consumer_loop(self):
        """Process incoming Kafka messages"""
        while self.running:
            try:
                for message in self.kafka_consumer:
                    if not self.running:
                        break
                        
                    event = message.value
                    await self._process_health_event(event)
                    
            except Exception as e:
                self.logger.error(f"Error in Kafka consumer loop: {e}")
                await asyncio.sleep(10)

    async def _trend_analysis_loop(self):
        """Analyze metric trends for proactive diagnosis"""
        while self.running:
            try:
                trends = await self._analyze_trends()
                
                for trend in trends:
                    if trend.get('anomaly_detected'):
                        diagnosis = await self._create_trend_diagnosis(trend)
                        if diagnosis and diagnosis.confidence >= self.confidence_threshold:
                            await self._notify_diagnoses([diagnosis])
                
                await asyncio.sleep(300)  # Run every 5 minutes
                
            except Exception as e:
                self.logger.error(f"Error in trend analysis loop: {e}")
                await asyncio.sleep(60)

    async def _collect_system_metrics(self) -> Dict[str, Any]:
        """Collect comprehensive system metrics"""
        metrics = {}
        
        try:
            # System metrics
            metrics.update(await self._collect_system_info())
            
            # Service health metrics
            metrics.update(await self._collect_service_health())
            
            # Database metrics
            metrics.update(await self._collect_database_metrics())
            
            # API metrics
            metrics.update(await self._collect_api_metrics())
            
            # Agent metrics
            metrics.update(await self._collect_agent_metrics())
            
        except Exception as e:
            self.logger.error(f"Error collecting metrics: {e}")
            
        return metrics

    async def _collect_system_info(self) -> Dict[str, Any]:
        """Collect system-level information"""
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_usage': psutil.disk_usage('/').percent,
            'load_average': psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else 0,
            'network_io': psutil.net_io_counters()._asdict() if psutil.net_io_counters() else {},
            'disk_io': psutil.disk_io_counters()._asdict() if psutil.disk_io_counters() else {},
            'boot_time': psutil.boot_time(),
            'process_count': len(psutil.pids())
        }

    async def _collect_service_health(self) -> Dict[str, Any]:
        """Collect health status of services"""
        services = {}
        
        # Check common service endpoints
        endpoints = [
            ('backend_api', 'http://localhost:8000/health'),
            ('prometheus', 'http://localhost:9090/-/healthy'),
            ('grafana', 'http://localhost:3001/api/health'),
            ('opensearch', 'http://localhost:9200/_cluster/health')
        ]
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            for service_name, url in endpoints:
                try:
                    response = await client.get(url)
                    services[service_name] = {
                        'status': 'healthy' if response.status_code == 200 else 'unhealthy',
                        'response_time': response.elapsed.total_seconds(),
                        'status_code': response.status_code
                    }
                except Exception as e:
                    services[service_name] = {
                        'status': 'unreachable',
                        'error': str(e)
                    }
        
        return {'services': services}

    async def _collect_database_metrics(self) -> Dict[str, Any]:
        """Collect database performance metrics"""
        if not self.postgres_pool:
            return {}
            
        try:
            async with self.postgres_pool.acquire() as conn:
                # Basic connection test
                await conn.execute('SELECT 1')
                
                # Get connection count
                result = await conn.fetch("""
                    SELECT count(*) as connections,
                           count(*) FILTER (WHERE state = 'active') as active_connections
                    FROM pg_stat_activity
                    WHERE datname = current_database()
                """)
                
                return {
                    'database': {
                        'status': 'healthy',
                        'connections': result[0]['connections'],
                        'active_connections': result[0]['active_connections']
                    }
                }
        except Exception as e:
            return {
                'database': {
                    'status': 'error',
                    'error': str(e)
                }
            }

    async def _collect_api_metrics(self) -> Dict[str, Any]:
        """Collect API performance metrics from Redis"""
        if not self.redis:
            return {}
            
        try:
            # Get API request metrics
            api_metrics = await self.redis.hgetall('api:metrics')
            
            return {
                'api': {
                    'requests_total': int(api_metrics.get('requests_total', 0)),
                    'errors_total': int(api_metrics.get('errors_total', 0)),
                    'avg_response_time': float(api_metrics.get('avg_response_time', 0))
                }
            }
        except Exception as e:
            return {
                'api': {
                    'status': 'error',
                    'error': str(e)
                }
            }

    async def _collect_agent_metrics(self) -> Dict[str, Any]:
        """Collect metrics from other agents"""
        if not self.redis:
            return {}
            
        try:
            agents = {}
            
            # Get agent status from Redis
            agent_keys = await self.redis.keys('agent:*:status')
            
            for key in agent_keys:
                agent_name = key.split(':')[1]
                status_data = await self.redis.hgetall(key)
                agents[agent_name] = {
                    'status': status_data.get('status', 'unknown'),
                    'last_seen': status_data.get('last_seen'),
                    'tasks_completed': int(status_data.get('tasks_completed', 0))
                }
            
            return {'agents': agents}
            
        except Exception as e:
            return {
                'agents': {
                    'error': str(e)
                }
            }

    async def _perform_diagnoses(self, metrics: Dict[str, Any]) -> List[DiagnosisResult]:
        """Perform diagnostic analysis on collected metrics"""
        diagnoses = []
        
        # CPU diagnosis
        cpu_percent = metrics.get('cpu_percent', 0)
        if cpu_percent > 90:
            diagnoses.append(DiagnosisResult(
                type=DiagnosisType.PERFORMANCE_ISSUE,
                severity=Severity.HIGH,
                component='cpu',
                description=f'High CPU usage: {cpu_percent}%',
                metrics={'cpu_percent': cpu_percent},
                recommendations=['Scale up CPU resources', 'Check for CPU-intensive processes'],
                timestamp=datetime.utcnow(),
                confidence=0.9
            ))
        
        # Memory diagnosis
        memory_percent = metrics.get('memory_percent', 0)
        if memory_percent > 85:
            diagnoses.append(DiagnosisResult(
                type=DiagnosisType.RESOURCE_EXHAUSTION,
                severity=Severity.HIGH if memory_percent > 95 else Severity.MEDIUM,
                component='memory',
                description=f'High memory usage: {memory_percent}%',
                metrics={'memory_percent': memory_percent},
                recommendations=['Scale up memory', 'Check for memory leaks'],
                timestamp=datetime.utcnow(),
                confidence=0.9
            ))
        
        # Disk diagnosis
        disk_usage = metrics.get('disk_usage', 0)
        if disk_usage > 90:
            diagnoses.append(DiagnosisResult(
                type=DiagnosisType.RESOURCE_EXHAUSTION,
                severity=Severity.HIGH,
                component='disk',
                description=f'High disk usage: {disk_usage}%',
                metrics={'disk_usage': disk_usage},
                recommendations=['Clean up old logs', 'Expand disk space'],
                timestamp=datetime.utcnow(),
                confidence=0.95
            ))
        
        # Service health diagnosis
        services = metrics.get('services', {})
        for service_name, service_data in services.items():
            if service_data.get('status') != 'healthy':
                diagnoses.append(DiagnosisResult(
                    type=DiagnosisType.SERVICE_DEGRADATION,
                    severity=Severity.MEDIUM,
                    component=service_name,
                    description=f'Service {service_name} is {service_data.get("status")}',
                    metrics={'service_status': service_data},
                    recommendations=[f'Restart {service_name} service', 'Check service logs'],
                    timestamp=datetime.utcnow(),
                    confidence=0.8
                ))
        
        return diagnoses

    async def _update_metric_history(self, metrics: Dict[str, Any]):
        """Update historical metrics for trend analysis"""
        timestamp = int(time.time())
        
        # Keep metrics for the last hour
        cutoff_time = timestamp - 3600
        
        key_metrics = ['cpu_percent', 'memory_percent', 'disk_usage']
        
        for metric in key_metrics:
            if metric in metrics:
                if metric not in self.metric_history:
                    self.metric_history[metric] = []
                
                self.metric_history[metric].append((timestamp, metrics[metric]))
                
                # Remove old entries
                self.metric_history[metric] = [
                    (ts, val) for ts, val in self.metric_history[metric] 
                    if ts > cutoff_time
                ]

    async def _get_metric_trends(self) -> Dict[str, List[float]]:
        """Get recent metric trends"""
        trends = {}
        
        for metric, history in self.metric_history.items():
            if len(history) >= 2:
                values = [val for _, val in history[-10:]]  # Last 10 values
                trends[metric] = values
        
        return trends

    async def _analyze_trends(self) -> List[Dict[str, Any]]:
        """Analyze metric trends for anomalies"""
        trend_analyses = []
        
        for metric, history in self.metric_history.items():
            if len(history) >= 10:  # Need at least 10 data points
                values = [val for _, val in history]
                
                # Simple trend analysis - look for rapid increases
                recent_avg = sum(values[-3:]) / 3
                historical_avg = sum(values[:-3]) / len(values[:-3])
                
                if recent_avg > historical_avg * 1.5:  # 50% increase
                    trend_analyses.append({
                        'metric': metric,
                        'anomaly_detected': True,
                        'trend': 'increasing',
                        'recent_avg': recent_avg,
                        'historical_avg': historical_avg,
                        'increase_ratio': recent_avg / historical_avg
                    })
        
        return trend_analyses

    async def _create_trend_diagnosis(self, trend: Dict[str, Any]) -> Optional[DiagnosisResult]:
        """Create diagnosis based on trend analysis"""
        if not trend.get('anomaly_detected'):
            return None
        
        metric = trend['metric']
        increase_ratio = trend['increase_ratio']
        
        return DiagnosisResult(
            type=DiagnosisType.PERFORMANCE_ISSUE,
            severity=Severity.MEDIUM if increase_ratio < 2.0 else Severity.HIGH,
            component=metric.replace('_percent', ''),
            description=f'Trending increase in {metric}: {increase_ratio:.1f}x above normal',
            metrics=trend,
            recommendations=['Monitor closely', 'Investigate root cause'],
            timestamp=datetime.utcnow(),
            confidence=0.7
        )

    async def _calculate_health_score(self, diagnoses: List[DiagnosisResult], metrics: Dict[str, Any]) -> float:
        """Calculate overall system health score (0-100)"""
        base_score = 100.0
        
        # Deduct points based on diagnoses
        for diagnosis in diagnoses:
            if diagnosis.severity == Severity.CRITICAL:
                base_score -= 30
            elif diagnosis.severity == Severity.HIGH:
                base_score -= 20
            elif diagnosis.severity == Severity.MEDIUM:
                base_score -= 10
            else:  # LOW
                base_score -= 5
        
        # Additional deductions based on metrics
        cpu_percent = metrics.get('cpu_percent', 0)
        memory_percent = metrics.get('memory_percent', 0)
        
        if cpu_percent > 80:
            base_score -= (cpu_percent - 80) / 2
        if memory_percent > 80:
            base_score -= (memory_percent - 80) / 2
        
        return max(0.0, min(100.0, base_score))

    async def _store_health_report(self, report: HealthReport):
        """Store health report in database"""
        if not self.postgres_pool:
            return
            
        try:
            async with self.postgres_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO health_reports (timestamp, overall_score, diagnoses_count, metrics_data)
                    VALUES ($1, $2, $3, $4)
                """, report.timestamp, report.overall_score, len(report.diagnoses), 
                json.dumps(report.system_metrics))
                
        except Exception as e:
            self.logger.error(f"Failed to store health report: {e}")

    async def _notify_diagnoses(self, diagnoses: List[DiagnosisResult]):
        """Send notifications for significant diagnoses"""
        if not self.kafka_producer or not diagnoses:
            return
            
        try:
            for diagnosis in diagnoses:
                if diagnosis.confidence >= self.confidence_threshold:
                    notification = {
                        'type': 'diagnosis',
                        'diagnosis': {
                            'type': diagnosis.type.value,
                            'severity': diagnosis.severity.value,
                            'component': diagnosis.component,
                            'description': diagnosis.description,
                            'recommendations': diagnosis.recommendations,
                            'confidence': diagnosis.confidence
                        },
                        'timestamp': diagnosis.timestamp.isoformat(),
                        'agent': 'self_diagnosis'
                    }
                    
                    self.kafka_producer.send('system.incidents', notification)
                    
        except Exception as e:
            self.logger.error(f"Failed to send diagnosis notifications: {e}")

    async def _process_health_event(self, event: Dict[str, Any]):
        """Process incoming health events from Kafka"""
        try:
            event_type = event.get('type')
            
            if event_type == 'alert':
                # Process Prometheus alert
                await self._process_prometheus_alert(event)
            elif event_type == 'service_status':
                # Process service status change
                await self._process_service_status(event)
                
        except Exception as e:
            self.logger.error(f"Error processing health event: {e}")

    async def _process_prometheus_alert(self, alert: Dict[str, Any]):
        """Process Prometheus alert and create diagnosis"""
        alert_name = alert.get('alert_name')
        severity = alert.get('severity', 'low')
        
        diagnosis = DiagnosisResult(
            type=DiagnosisType.PERFORMANCE_ISSUE,
            severity=Severity(severity.lower()) if severity.lower() in [s.value for s in Severity] else Severity.MEDIUM,
            component=alert.get('instance', 'unknown'),
            description=f"Prometheus alert: {alert_name}",
            metrics=alert,
            recommendations=['Check Prometheus dashboard', 'Investigate alert source'],
            timestamp=datetime.utcnow(),
            confidence=0.8
        )
        
        await self._notify_diagnoses([diagnosis])

    async def _process_service_status(self, status_event: Dict[str, Any]):
        """Process service status change event"""
        service_name = status_event.get('service')
        status = status_event.get('status')
        
        if status != 'healthy':
            diagnosis = DiagnosisResult(
                type=DiagnosisType.SERVICE_DEGRADATION,
                severity=Severity.MEDIUM,
                component=service_name,
                description=f"Service {service_name} status changed to {status}",
                metrics=status_event,
                recommendations=[f'Check {service_name} service logs', 'Restart service if needed'],
                timestamp=datetime.utcnow(),
                confidence=0.9
            )
            
            await self._notify_diagnoses([diagnosis])

async def main():
    """Main entry point for the Self-Diagnosis Agent"""
    import os

    config = {
        'redis_url': os.getenv('REDIS_URL', 'redis://localhost:6379'),
        'database_url': os.getenv('DATABASE_URL', 'postgresql://postgres:predator_secure_pass_2024@localhost:5432/predator11'),
        'kafka_brokers': os.getenv('KAFKA_BROKERS', 'localhost:19092').split(','),
        'check_interval': 60,
        'confidence_threshold': 0.7,
        'analysis_window_minutes': 15
    }
    
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    agent = SelfDiagnosisAgent(config)
    
    try:
        await agent.initialize()
        await agent.start()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Agent error: {e}")
    finally:
        await agent.stop()

if __name__ == "__main__":
    asyncio.run(main())
