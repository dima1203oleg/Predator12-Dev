#!/usr/bin/env python3
"""
Self-Improvement Agent for Predator11
Continuously analyzes system performance and implements improvements
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
import qdrant_client
from qdrant_client.models import Distance, VectorParams, PointStruct

# Metrics
IMPROVEMENTS_COUNTER = Counter('self_improvement_total', 'Total improvements made')
ANALYSIS_DURATION = Histogram('analysis_duration_seconds', 'Time spent analyzing')
PERFORMANCE_SCORE = Gauge('system_performance_score', 'Current system performance score')

class ImprovementType(Enum):
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    RESOURCE_SCALING = "resource_scaling"
    ALGORITHM_TUNING = "algorithm_tuning"
    MODEL_OPTIMIZATION = "model_optimization"
    WORKFLOW_IMPROVEMENT = "workflow_improvement"

@dataclass
class ImprovementAction:
    type: ImprovementType
    description: str
    impact_score: float
    implementation_complexity: str
    estimated_benefit: str
    metadata: Dict[str, Any]

class SelfImprovementAgent:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.running = False

        # Connections
        self.redis: Optional[aioredis.Redis] = None
        self.postgres_pool: Optional[asyncpg.Pool] = None
        self.kafka_producer: Optional[KafkaProducer] = None
        self.qdrant_client: Optional[qdrant_client.QdrantClient] = None

        # Performance tracking
        self.performance_history: List[Dict] = []
        self.improvement_queue: List[ImprovementAction] = []
        self.analysis_interval = config.get('analysis_interval', 300)  # 5 minutes

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

            # Qdrant for vector storage of improvements
            self.qdrant_client = qdrant_client.QdrantClient(
                host=self.config['qdrant_host'],
                port=self.config.get('qdrant_port', 6333)
            )

            # Initialize improvement vectors collection
            await self._initialize_qdrant_collection()

            self.logger.info("SelfImprovementAgent initialized successfully")

        except Exception as e:
            self.logger.error(f"Failed to initialize SelfImprovementAgent: {e}")
            raise

    async def _initialize_qdrant_collection(self):
        """Initialize Qdrant collection for improvement vectors"""
        collection_name = "improvement_vectors"

        try:
            collections = self.qdrant_client.get_collections().collections
            if not any(c.name == collection_name for c in collections):
                self.qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=768, distance=Distance.COSINE)
                )
                self.logger.info(f"Created Qdrant collection: {collection_name}")
        except Exception as e:
            self.logger.error(f"Failed to initialize Qdrant collection: {e}")

    async def start(self):
        """Start the self-improvement agent"""
        self.running = True
        self.logger.info("Starting SelfImprovementAgent")

        # Start main improvement loop
        improvement_task = asyncio.create_task(self._improvement_loop())

        # Start performance monitoring
        monitoring_task = asyncio.create_task(self._performance_monitoring_loop())

        await asyncio.gather(improvement_task, monitoring_task)

    async def stop(self):
        """Stop the agent gracefully"""
        self.running = False
        self.logger.info("Stopping SelfImprovementAgent")

        if self.postgres_pool:
            await self.postgres_pool.close()
        if self.redis:
            await self.redis.close()
        if self.kafka_producer:
            self.kafka_producer.close()

    async def _improvement_loop(self):
        """Main improvement analysis and implementation loop"""
        while self.running:
            try:
                with ANALYSIS_DURATION.time():
                    # Collect system metrics
                    metrics = await self._collect_system_metrics()

                    # Analyze performance trends
                    improvements = await self._analyze_performance_trends(metrics)

                    # Prioritize improvements
                    prioritized = await self._prioritize_improvements(improvements)

                    # Implement top improvements
                    await self._implement_improvements(prioritized[:3])  # Top 3

                    # Update performance score
                    score = await self._calculate_performance_score(metrics)
                    PERFORMANCE_SCORE.set(score)

                await asyncio.sleep(self.analysis_interval)

            except Exception as e:
                self.logger.error(f"Error in improvement loop: {e}")
                await asyncio.sleep(60)  # Wait before retry

    async def _collect_system_metrics(self) -> Dict[str, Any]:
        """Collect comprehensive system metrics"""
        metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'database': await self._collect_database_metrics(),
            'api': await self._collect_api_metrics(),
            'agents': await self._collect_agent_metrics(),
            'resources': await self._collect_resource_metrics(),
            'external_apis': await self._collect_external_api_metrics()
        }

        # Store in performance history
        self.performance_history.append(metrics)

        # Keep only last 24 hours of data
        cutoff = datetime.utcnow() - timedelta(hours=24)
        self.performance_history = [
            m for m in self.performance_history
            if datetime.fromisoformat(m['timestamp']) > cutoff
        ]

        return metrics

    async def _collect_database_metrics(self) -> Dict[str, Any]:
        """Collect database performance metrics"""
        try:
            async with self.postgres_pool.acquire() as conn:
                # Query performance stats
                query_stats = await conn.fetch("""
                    SELECT 
                        schemaname,
                        tablename,
                        seq_scan,
                        seq_tup_read,
                        idx_scan,
                        idx_tup_fetch,
                        n_tup_ins,
                        n_tup_upd,
                        n_tup_del
                    FROM pg_stat_user_tables
                """)

                # Connection stats
                conn_stats = await conn.fetchrow("""
                    SELECT count(*) as active_connections
                    FROM pg_stat_activity 
                    WHERE state = 'active'
                """)

                # Slow queries
                slow_queries = await conn.fetch("""
                    SELECT query, mean_time, calls
                    FROM pg_stat_statements
                    WHERE mean_time > 1000
                    ORDER BY mean_time DESC
                    LIMIT 10
                """)

                return {
                    'query_stats': [dict(row) for row in query_stats],
                    'active_connections': conn_stats['active_connections'],
                    'slow_queries': [dict(row) for row in slow_queries]
                }
        except Exception as e:
            self.logger.error(f"Failed to collect database metrics: {e}")
            return {}

    async def _collect_api_metrics(self) -> Dict[str, Any]:
        """Collect API performance metrics from Redis"""
        try:
            # Get API response times
            response_times = await self.redis.hgetall("api:response_times")

            # Get error rates
            error_rates = await self.redis.hgetall("api:error_rates")

            # Get request counts
            request_counts = await self.redis.hgetall("api:request_counts")

            return {
                'response_times': {k: float(v) for k, v in response_times.items()},
                'error_rates': {k: float(v) for k, v in error_rates.items()},
                'request_counts': {k: int(v) for k, v in request_counts.items()}
            }
        except Exception as e:
            self.logger.error(f"Failed to collect API metrics: {e}")
            return {}

    async def _collect_agent_metrics(self) -> Dict[str, Any]:
        """Collect metrics from other agents"""
        try:
            # Get agent statuses
            agent_statuses = await self.redis.hgetall("agents:status")

            # Get agent performance
            agent_performance = await self.redis.hgetall("agents:performance")

            return {
                'statuses': agent_statuses,
                'performance': {k: json.loads(v) for k, v in agent_performance.items()}
            }
        except Exception as e:
            self.logger.error(f"Failed to collect agent metrics: {e}")
            return {}

    async def _collect_resource_metrics(self) -> Dict[str, Any]:
        """Collect system resource metrics"""
        try:
            # Get resource usage from Redis (updated by monitoring agents)
            cpu_usage = await self.redis.get("metrics:cpu_usage")
            memory_usage = await self.redis.get("metrics:memory_usage")
            disk_usage = await self.redis.get("metrics:disk_usage")

            return {
                'cpu_usage': float(cpu_usage) if cpu_usage else 0.0,
                'memory_usage': float(memory_usage) if memory_usage else 0.0,
                'disk_usage': float(disk_usage) if disk_usage else 0.0
            }
        except Exception as e:
            self.logger.error(f"Failed to collect resource metrics: {e}")
            return {}

    async def _collect_external_api_metrics(self) -> Dict[str, Any]:
        """Collect external API performance metrics"""
        try:
            # Get external API response times and error rates
            external_apis = await self.redis.hgetall("external_apis:performance")

            return {
                api: json.loads(metrics)
                for api, metrics in external_apis.items()
            }
        except Exception as e:
            self.logger.error(f"Failed to collect external API metrics: {e}")
            return {}

    async def _analyze_performance_trends(self, current_metrics: Dict[str, Any]) -> List[ImprovementAction]:
        """Analyze performance trends and identify improvement opportunities"""
        improvements = []

        # Database performance analysis
        db_improvements = await self._analyze_database_performance(current_metrics.get('database', {}))
        improvements.extend(db_improvements)

        # API performance analysis
        api_improvements = await self._analyze_api_performance(current_metrics.get('api', {}))
        improvements.extend(api_improvements)

        # Resource utilization analysis
        resource_improvements = await self._analyze_resource_utilization(current_metrics.get('resources', {}))
        improvements.extend(resource_improvements)

        # Agent performance analysis
        agent_improvements = await self._analyze_agent_performance(current_metrics.get('agents', {}))
        improvements.extend(agent_improvements)

        return improvements

    async def _analyze_database_performance(self, db_metrics: Dict[str, Any]) -> List[ImprovementAction]:
        """Analyze database performance and suggest improvements"""
        improvements = []

        # Check for tables with high sequential scans
        for table_stat in db_metrics.get('query_stats', []):
            if table_stat['seq_scan'] > table_stat.get('idx_scan', 0) * 2:
                improvements.append(ImprovementAction(
                    type=ImprovementType.PERFORMANCE_OPTIMIZATION,
                    description=f"Add index to table {table_stat['tablename']} to reduce sequential scans",
                    impact_score=0.8,
                    implementation_complexity="medium",
                    estimated_benefit="20-40% query performance improvement",
                    metadata={'table': table_stat['tablename'], 'type': 'index_optimization'}
                ))

        # Check for slow queries
        for slow_query in db_metrics.get('slow_queries', []):
            if slow_query['mean_time'] > 5000:  # 5 seconds
                improvements.append(ImprovementAction(
                    type=ImprovementType.ALGORITHM_TUNING,
                    description=f"Optimize slow query: {slow_query['query'][:100]}...",
                    impact_score=0.9,
                    implementation_complexity="high",
                    estimated_benefit="50-80% query performance improvement",
                    metadata={'query': slow_query['query'], 'mean_time': slow_query['mean_time']}
                ))

        # Check connection count
        if db_metrics.get('active_connections', 0) > 80:
            improvements.append(ImprovementAction(
                type=ImprovementType.RESOURCE_SCALING,
                description="Scale database connection pool",
                impact_score=0.7,
                implementation_complexity="low",
                estimated_benefit="Reduced connection wait times",
                metadata={'current_connections': db_metrics['active_connections']}
            ))

        return improvements

    async def _analyze_api_performance(self, api_metrics: Dict[str, Any]) -> List[ImprovementAction]:
        """Analyze API performance and suggest improvements"""
        improvements = []

        # Check response times
        for endpoint, response_time in api_metrics.get('response_times', {}).items():
            if response_time > 1000:  # 1 second
                improvements.append(ImprovementAction(
                    type=ImprovementType.PERFORMANCE_OPTIMIZATION,
                    description=f"Optimize slow endpoint: {endpoint}",
                    impact_score=0.8,
                    implementation_complexity="medium",
                    estimated_benefit="Improved user experience",
                    metadata={'endpoint': endpoint, 'response_time': response_time}
                ))

        # Check error rates
        for endpoint, error_rate in api_metrics.get('error_rates', {}).items():
            if error_rate > 0.05:  # 5% error rate
                improvements.append(ImprovementAction(
                    type=ImprovementType.WORKFLOW_IMPROVEMENT,
                    description=f"Reduce error rate for endpoint: {endpoint}",
                    impact_score=0.9,
                    implementation_complexity="high",
                    estimated_benefit="Improved system reliability",
                    metadata={'endpoint': endpoint, 'error_rate': error_rate}
                ))

        return improvements

    async def _analyze_resource_utilization(self, resource_metrics: Dict[str, Any]) -> List[ImprovementAction]:
        """Analyze resource utilization and suggest scaling"""
        improvements = []

        # CPU utilization
        cpu_usage = resource_metrics.get('cpu_usage', 0)
        if cpu_usage > 80:
            improvements.append(ImprovementAction(
                type=ImprovementType.RESOURCE_SCALING,
                description="Scale up CPU resources",
                impact_score=0.8,
                implementation_complexity="low",
                estimated_benefit="Better response times under load",
                metadata={'cpu_usage': cpu_usage}
            ))

        # Memory utilization
        memory_usage = resource_metrics.get('memory_usage', 0)
        if memory_usage > 85:
            improvements.append(ImprovementAction(
                type=ImprovementType.RESOURCE_SCALING,
                description="Scale up memory resources",
                impact_score=0.9,
                implementation_complexity="low",
                estimated_benefit="Prevent OOM errors and improve caching",
                metadata={'memory_usage': memory_usage}
            ))

        return improvements

    async def _analyze_agent_performance(self, agent_metrics: Dict[str, Any]) -> List[ImprovementAction]:
        """Analyze agent performance and suggest improvements"""
        improvements = []

        # Check agent performance
        for agent_name, performance in agent_metrics.get('performance', {}).items():
            if performance.get('avg_processing_time', 0) > 5000:  # 5 seconds
                improvements.append(ImprovementAction(
                    type=ImprovementType.ALGORITHM_TUNING,
                    description=f"Optimize {agent_name} processing time",
                    impact_score=0.7,
                    implementation_complexity="medium",
                    estimated_benefit="Faster agent responses",
                    metadata={'agent': agent_name, 'performance': performance}
                ))

        return improvements

    async def _prioritize_improvements(self, improvements: List[ImprovementAction]) -> List[ImprovementAction]:
        """Prioritize improvements based on impact and complexity"""
        def priority_score(improvement: ImprovementAction) -> float:
            complexity_weights = {
                'low': 1.0,
                'medium': 0.7,
                'high': 0.4
            }
            return improvement.impact_score * complexity_weights.get(improvement.implementation_complexity, 0.5)

        return sorted(improvements, key=priority_score, reverse=True)

    async def _implement_improvements(self, improvements: List[ImprovementAction]):
        """Implement the highest priority improvements"""
        for improvement in improvements:
            try:
                success = await self._execute_improvement(improvement)
                if success:
                    IMPROVEMENTS_COUNTER.inc()

                    # Store improvement in Qdrant for learning
                    await self._store_improvement_vector(improvement)

                    # Notify other systems
                    await self._notify_improvement_implemented(improvement)

                    self.logger.info(f"Implemented improvement: {improvement.description}")
                else:
                    self.logger.warning(f"Failed to implement improvement: {improvement.description}")

            except Exception as e:
                self.logger.error(f"Error implementing improvement {improvement.description}: {e}")

    async def _execute_improvement(self, improvement: ImprovementAction) -> bool:
        """Execute a specific improvement action"""
        try:
            if improvement.type == ImprovementType.RESOURCE_SCALING:
                return await self._handle_resource_scaling(improvement)
            elif improvement.type == ImprovementType.PERFORMANCE_OPTIMIZATION:
                return await self._handle_performance_optimization(improvement)
            elif improvement.type == ImprovementType.ALGORITHM_TUNING:
                return await self._handle_algorithm_tuning(improvement)
            elif improvement.type == ImprovementType.MODEL_OPTIMIZATION:
                return await self._handle_model_optimization(improvement)
            elif improvement.type == ImprovementType.WORKFLOW_IMPROVEMENT:
                return await self._handle_workflow_improvement(improvement)
            else:
                self.logger.warning(f"Unknown improvement type: {improvement.type}")
                return False

        except Exception as e:
            self.logger.error(f"Error executing improvement: {e}")
            return False

    async def _handle_resource_scaling(self, improvement: ImprovementAction) -> bool:
        """Handle resource scaling improvements"""
        # Send scaling request to orchestrator
        scaling_request = {
            'type': 'scale_request',
            'component': improvement.metadata.get('component', 'backend'),
            'action': 'scale_up',
            'reason': improvement.description,
            'timestamp': datetime.utcnow().isoformat()
        }

        self.kafka_producer.send('orchestrator.scaling', scaling_request)
        return True

    async def _handle_performance_optimization(self, improvement: ImprovementAction) -> bool:
        """Handle performance optimization improvements"""
        # For database index optimization
        if improvement.metadata.get('type') == 'index_optimization':
            table = improvement.metadata.get('table')
            # Send index creation request
            index_request = {
                'type': 'create_index',
                'table': table,
                'reason': improvement.description,
                'timestamp': datetime.utcnow().isoformat()
            }
            self.kafka_producer.send('database.optimization', index_request)
            return True

        return False

    async def _handle_algorithm_tuning(self, improvement: ImprovementAction) -> bool:
        """Handle algorithm tuning improvements"""
        # Send tuning request to relevant agent
        tuning_request = {
            'type': 'algorithm_tuning',
            'target': improvement.metadata.get('agent', 'unknown'),
            'optimization': improvement.description,
            'timestamp': datetime.utcnow().isoformat()
        }

        self.kafka_producer.send('agents.tuning', tuning_request)
        return True

    async def _handle_model_optimization(self, improvement: ImprovementAction) -> bool:
        """Handle ML model optimization improvements"""
        # Send model optimization request
        model_request = {
            'type': 'model_optimization',
            'model': improvement.metadata.get('model', 'unknown'),
            'optimization': improvement.description,
            'timestamp': datetime.utcnow().isoformat()
        }

        self.kafka_producer.send('models.optimization', model_request)
        return True

    async def _handle_workflow_improvement(self, improvement: ImprovementAction) -> bool:
        """Handle workflow improvement changes"""
        # Send workflow improvement request
        workflow_request = {
            'type': 'workflow_improvement',
            'workflow': improvement.metadata.get('workflow', 'unknown'),
            'improvement': improvement.description,
            'timestamp': datetime.utcnow().isoformat()
        }

        self.kafka_producer.send('workflows.improvement', workflow_request)
        return True

    async def _store_improvement_vector(self, improvement: ImprovementAction):
        """Store improvement as vector for future learning"""
        try:
            # Create embedding from improvement description
            # This would typically use a proper embedding model
            embedding = [0.1] * 768  # Placeholder

            point = PointStruct(
                id=int(time.time() * 1000),
                vector=embedding,
                payload={
                    'type': improvement.type.value,
                    'description': improvement.description,
                    'impact_score': improvement.impact_score,
                    'complexity': improvement.implementation_complexity,
                    'timestamp': datetime.utcnow().isoformat()
                }
            )

            self.qdrant_client.upsert(
                collection_name="improvement_vectors",
                points=[point]
            )

        except Exception as e:
            self.logger.error(f"Failed to store improvement vector: {e}")

    async def _notify_improvement_implemented(self, improvement: ImprovementAction):
        """Notify other systems about implemented improvement"""
        notification = {
            'type': 'improvement_implemented',
            'improvement': {
                'type': improvement.type.value,
                'description': improvement.description,
                'impact_score': improvement.impact_score,
                'complexity': improvement.implementation_complexity
            },
            'timestamp': datetime.utcnow().isoformat(),
            'agent': 'self_improvement'
        }

        self.kafka_producer.send('system.notifications', notification)

    async def _calculate_performance_score(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall system performance score"""
        scores = []

        # Database performance score
        db_score = 1.0
        if metrics.get('database', {}).get('active_connections', 0) > 80:
            db_score *= 0.8
        scores.append(db_score)

        # API performance score
        api_score = 1.0
        avg_response_time = sum(metrics.get('api', {}).get('response_times', {}).values()) / max(1, len(metrics.get('api', {}).get('response_times', {})))
        if avg_response_time > 1000:
            api_score *= 0.7
        scores.append(api_score)

        # Resource utilization score
        resource_score = 1.0
        resources = metrics.get('resources', {})
        if resources.get('cpu_usage', 0) > 80:
            resource_score *= 0.8
        if resources.get('memory_usage', 0) > 85:
            resource_score *= 0.7
        scores.append(resource_score)

        return sum(scores) / len(scores) if scores else 0.5

    async def _performance_monitoring_loop(self):
        """Continuous performance monitoring"""
        while self.running:
            try:
                # Update performance metrics in Redis for other agents
                metrics = await self._collect_system_metrics()
                await self.redis.hset(
                    "system:performance",
                    "self_improvement_agent",
                    json.dumps({
                        'last_analysis': datetime.utcnow().isoformat(),
                        'improvements_made': IMPROVEMENTS_COUNTER._value.get(),
                        'performance_score': PERFORMANCE_SCORE._value.get(),
                        'status': 'active'
                    })
                )

                await asyncio.sleep(60)  # Update every minute

            except Exception as e:
                self.logger.error(f"Error in performance monitoring loop: {e}")
                await asyncio.sleep(60)

async def main():
    """Main entry point for the Self-Improvement Agent"""
    import os

    config = {
        'redis_url': os.getenv('REDIS_URL', 'redis://localhost:6379'),
        'database_url': os.getenv('DATABASE_URL', 'postgresql://postgres:predator_secure_pass_2024@localhost:5432/predator11'),
        'kafka_brokers': os.getenv('KAFKA_BROKERS', 'localhost:19092').split(','),
        'qdrant_host': os.getenv('QDRANT_HOST', 'localhost'),
        'qdrant_port': int(os.getenv('QDRANT_PORT', 6333)),
        'analysis_interval': int(os.getenv('ANALYSIS_INTERVAL', 300))
    }

    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    agent = SelfImprovementAgent(config)

    try:
        await agent.initialize()
        await agent.start()
    except KeyboardInterrupt:
        logging.info("Received interrupt signal")
    finally:
        await agent.stop()

if __name__ == "__main__":
    asyncio.run(main())
