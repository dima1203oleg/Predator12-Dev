#!/usr/bin/env python3
"""
Health Check and Self-Healing System for Predator Analytics
Implements comprehensive monitoring, probes, and automatic recovery.
Part of Delta Revision 1.1 - Block C
"""

import asyncio
import logging
import time
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

import psutil

logger = logging.getLogger(__name__)


class HealthStatus(Enum):
    """Health check status levels"""

    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


class ComponentType(Enum):
    """System component types"""

    DATABASE = "database"
    CACHE = "cache"
    STORAGE = "storage"
    API = "api"
    ETL = "etl"
    ML_MODEL = "ml_model"
    EXTERNAL_SERVICE = "external_service"


@dataclass
class HealthCheckResult:
    """Health check result"""

    component_name: str
    component_type: ComponentType
    status: HealthStatus
    response_time_ms: float
    timestamp: datetime
    details: Dict[str, Any]
    error_message: Optional[str] = None


@dataclass
class SystemMetrics:
    """System performance metrics"""

    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_io: Dict[str, int]
    process_count: int
    load_average: List[float]
    timestamp: datetime


class HealthChecker:
    """Comprehensive health checker"""

    def __init__(self):
        self.check_history: List[HealthCheckResult] = []
        self.system_metrics_history: List[SystemMetrics] = []
        self.alert_thresholds = {
            "cpu_percent": 80.0,
            "memory_percent": 85.0,
            "disk_percent": 90.0,
            "response_time_ms": 5000.0,
            "error_rate": 0.05,  # 5%
        }

    async def check_database_health(self) -> HealthCheckResult:
        """Check PostgreSQL database health"""
        start_time = time.time()

        try:
            # Mock database check - in production use actual DB connection
            await asyncio.sleep(0.01)  # Simulate DB query

            response_time = (time.time() - start_time) * 1000

            # Simulate database metrics
            details = {
                "active_connections": 25,
                "max_connections": 100,
                "database_size_mb": 1024,
                "slow_queries": 2,
                "replication_lag_ms": 50,
            }

            # Determine status based on metrics
            status = HealthStatus.HEALTHY
            if details["active_connections"] / details["max_connections"] > 0.8:
                status = HealthStatus.WARNING
            if details["slow_queries"] > 10:
                status = HealthStatus.CRITICAL

            return HealthCheckResult(
                component_name="postgresql",
                component_type=ComponentType.DATABASE,
                status=status,
                response_time_ms=response_time,
                timestamp=datetime.utcnow(),
                details=details,
            )

        except Exception as e:
            return HealthCheckResult(
                component_name="postgresql",
                component_type=ComponentType.DATABASE,
                status=HealthStatus.CRITICAL,
                response_time_ms=(time.time() - start_time) * 1000,
                timestamp=datetime.utcnow(),
                details={},
                error_message=str(e),
            )

    async def check_redis_health(self) -> HealthCheckResult:
        """Check Redis cache health"""
        start_time = time.time()

        try:
            # Mock Redis check
            await asyncio.sleep(0.005)  # Simulate Redis ping

            response_time = (time.time() - start_time) * 1000

            details = {
                "connected_clients": 15,
                "used_memory_mb": 512,
                "max_memory_mb": 2048,
                "keyspace_hits": 98547,
                "keyspace_misses": 1453,
                "evicted_keys": 0,
            }

            # Calculate hit ratio
            total_ops = details["keyspace_hits"] + details["keyspace_misses"]
            hit_ratio = details["keyspace_hits"] / total_ops if total_ops > 0 else 1.0
            details["hit_ratio"] = hit_ratio

            status = HealthStatus.HEALTHY
            if hit_ratio < 0.8:
                status = HealthStatus.WARNING
            if details["evicted_keys"] > 1000:
                status = HealthStatus.CRITICAL

            return HealthCheckResult(
                component_name="redis",
                component_type=ComponentType.CACHE,
                status=status,
                response_time_ms=response_time,
                timestamp=datetime.utcnow(),
                details=details,
            )

        except Exception as e:
            return HealthCheckResult(
                component_name="redis",
                component_type=ComponentType.CACHE,
                status=HealthStatus.CRITICAL,
                response_time_ms=(time.time() - start_time) * 1000,
                timestamp=datetime.utcnow(),
                details={},
                error_message=str(e),
            )

    async def check_opensearch_health(self) -> HealthCheckResult:
        """Check OpenSearch cluster health"""
        start_time = time.time()

        try:
            # Mock OpenSearch cluster check
            await asyncio.sleep(0.02)  # Simulate ES query

            response_time = (time.time() - start_time) * 1000

            details = {
                "cluster_status": "green",
                "active_nodes": 3,
                "active_shards": 15,
                "relocating_shards": 0,
                "unassigned_shards": 0,
                "pending_tasks": 0,
                "index_count": 8,
                "document_count": 1_500_000,
            }

            # Determine status from cluster state
            if details["cluster_status"] == "green":
                status = HealthStatus.HEALTHY
            elif details["cluster_status"] == "yellow":
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL

            return HealthCheckResult(
                component_name="opensearch",
                component_type=ComponentType.STORAGE,
                status=status,
                response_time_ms=response_time,
                timestamp=datetime.utcnow(),
                details=details,
            )

        except Exception as e:
            return HealthCheckResult(
                component_name="opensearch",
                component_type=ComponentType.STORAGE,
                status=HealthStatus.CRITICAL,
                response_time_ms=(time.time() - start_time) * 1000,
                timestamp=datetime.utcnow(),
                details={},
                error_message=str(e),
            )

    async def check_minio_health(self) -> HealthCheckResult:
        """Check MinIO object storage health"""
        start_time = time.time()

        try:
            # Mock MinIO check
            await asyncio.sleep(0.015)  # Simulate MinIO API call

            response_time = (time.time() - start_time) * 1000

            details = {
                "service_status": "online",
                "bucket_count": 5,
                "total_objects": 25000,
                "storage_used_gb": 150.5,
                "storage_available_gb": 850.0,
                "uptime_seconds": 3600 * 24 * 7,  # 7 days
            }

            # Check storage capacity
            storage_percent = (
                details["storage_used_gb"]
                / (details["storage_used_gb"] + details["storage_available_gb"])
                * 100
            )

            status = HealthStatus.HEALTHY
            if storage_percent > 80:
                status = HealthStatus.WARNING
            if storage_percent > 95:
                status = HealthStatus.CRITICAL

            details["storage_used_percent"] = storage_percent

            return HealthCheckResult(
                component_name="minio",
                component_type=ComponentType.STORAGE,
                status=status,
                response_time_ms=response_time,
                timestamp=datetime.utcnow(),
                details=details,
            )

        except Exception as e:
            return HealthCheckResult(
                component_name="minio",
                component_type=ComponentType.STORAGE,
                status=HealthStatus.CRITICAL,
                response_time_ms=(time.time() - start_time) * 1000,
                timestamp=datetime.utcnow(),
                details={},
                error_message=str(e),
            )

    async def check_ml_model_health(self) -> HealthCheckResult:
        """Check ML model health and performance"""
        start_time = time.time()

        try:
            # Mock ML model check
            await asyncio.sleep(0.05)  # Simulate model prediction

            response_time = (time.time() - start_time) * 1000

            details = {
                "active_models": 3,
                "model_versions": ["v1.2.0", "v1.1.5", "v1.0.8"],
                "prediction_latency_p95_ms": 85.5,
                "prediction_accuracy": 0.94,
                "drift_status": "stable",
                "memory_usage_mb": 2048,
                "gpu_utilization": 65.0,
            }

            status = HealthStatus.HEALTHY
            if details["prediction_accuracy"] < 0.90:
                status = HealthStatus.WARNING
            if details["prediction_latency_p95_ms"] > 1000:
                status = HealthStatus.CRITICAL

            return HealthCheckResult(
                component_name="ml_models",
                component_type=ComponentType.ML_MODEL,
                status=status,
                response_time_ms=response_time,
                timestamp=datetime.utcnow(),
                details=details,
            )

        except Exception as e:
            return HealthCheckResult(
                component_name="ml_models",
                component_type=ComponentType.ML_MODEL,
                status=HealthStatus.CRITICAL,
                response_time_ms=(time.time() - start_time) * 1000,
                timestamp=datetime.utcnow(),
                details={},
                error_message=str(e),
            )

    def collect_system_metrics(self) -> SystemMetrics:
        """Collect system performance metrics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)

            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent

            # Disk usage
            disk = psutil.disk_usage("/")
            disk_percent = disk.percent

            # Network I/O
            network = psutil.net_io_counters()
            network_io = {
                "bytes_sent": network.bytes_sent,
                "bytes_recv": network.bytes_recv,
                "packets_sent": network.packets_sent,
                "packets_recv": network.packets_recv,
            }

            # Process count
            process_count = len(psutil.pids())

            # Load average (Unix systems)
            try:
                load_avg = list(psutil.getloadavg())
            except AttributeError:
                load_avg = [0.0, 0.0, 0.0]  # Windows fallback

            return SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                disk_percent=disk_percent,
                network_io=network_io,
                process_count=process_count,
                load_average=load_avg,
                timestamp=datetime.utcnow(),
            )

        except Exception as e:
            logger.error(f"Failed to collect system metrics: {e}")
            return SystemMetrics(
                cpu_percent=0.0,
                memory_percent=0.0,
                disk_percent=0.0,
                network_io={},
                process_count=0,
                load_average=[0.0, 0.0, 0.0],
                timestamp=datetime.utcnow(),
            )

    async def run_comprehensive_health_check(self) -> Dict[str, Any]:
        """Run all health checks"""
        logger.info("Running comprehensive health check")

        # Collect system metrics
        system_metrics = self.collect_system_metrics()
        self.system_metrics_history.append(system_metrics)

        # Keep only last 100 metrics
        if len(self.system_metrics_history) > 100:
            self.system_metrics_history = self.system_metrics_history[-100:]

        # Run component health checks
        health_checks = await asyncio.gather(
            self.check_database_health(),
            self.check_redis_health(),
            self.check_opensearch_health(),
            self.check_minio_health(),
            self.check_ml_model_health(),
            return_exceptions=True,
        )

        # Process results
        results = {}
        overall_status = HealthStatus.HEALTHY
        critical_issues = []
        warnings = []

        for check_result in health_checks:
            if isinstance(check_result, Exception):
                logger.error(f"Health check failed: {check_result}")
                continue

            # Store result
            self.check_history.append(check_result)
            results[check_result.component_name] = asdict(check_result)

            # Update overall status
            if check_result.status == HealthStatus.CRITICAL:
                overall_status = HealthStatus.CRITICAL
                critical_issues.append(
                    f"{check_result.component_name}: {check_result.error_message or 'Critical status'}"
                )
            elif (
                check_result.status == HealthStatus.WARNING
                and overall_status != HealthStatus.CRITICAL
            ):
                overall_status = HealthStatus.WARNING
                warnings.append(f"{check_result.component_name}: Performance degraded")

        # Keep only last 1000 check results
        if len(self.check_history) > 1000:
            self.check_history = self.check_history[-1000:]

        # Check system resource alerts
        if system_metrics.cpu_percent > self.alert_thresholds["cpu_percent"]:
            if overall_status != HealthStatus.CRITICAL:
                overall_status = HealthStatus.WARNING
            warnings.append(f"High CPU usage: {system_metrics.cpu_percent:.1f}%")

        if system_metrics.memory_percent > self.alert_thresholds["memory_percent"]:
            overall_status = HealthStatus.CRITICAL
            critical_issues.append(f"High memory usage: {system_metrics.memory_percent:.1f}%")

        return {
            "overall_status": overall_status.value,
            "timestamp": datetime.utcnow().isoformat(),
            "system_metrics": asdict(system_metrics),
            "component_health": results,
            "critical_issues": critical_issues,
            "warnings": warnings,
            "health_score": self._calculate_health_score(results, system_metrics),
        }

    def _calculate_health_score(self, results: Dict[str, Any], metrics: SystemMetrics) -> float:
        """Calculate overall health score (0-100)"""
        try:
            component_scores = []

            for component_data in results.values():
                if component_data["status"] == "healthy":
                    score = 100.0
                elif component_data["status"] == "warning":
                    score = 70.0
                elif component_data["status"] == "critical":
                    score = 20.0
                else:
                    score = 50.0

                component_scores.append(score)

            # Factor in system metrics
            system_score = 100.0
            system_score -= max(0, metrics.cpu_percent - 50) * 0.5  # Penalty for high CPU
            system_score -= max(0, metrics.memory_percent - 60) * 0.8  # Penalty for high memory
            system_score -= max(0, metrics.disk_percent - 70) * 0.6  # Penalty for high disk

            # Weighted average
            if component_scores:
                component_avg = sum(component_scores) / len(component_scores)
                overall_score = (component_avg * 0.7) + (system_score * 0.3)
            else:
                overall_score = system_score

            return max(0.0, min(100.0, overall_score))

        except Exception as e:
            logger.error(f"Health score calculation failed: {e}")
            return 50.0


class SelfHealingManager:
    """Self-healing system manager"""

    def __init__(self, health_checker: HealthChecker):
        self.health_checker = health_checker
        self.healing_actions = {
            ComponentType.DATABASE: self._heal_database,
            ComponentType.CACHE: self._heal_cache,
            ComponentType.STORAGE: self._heal_storage,
            ComponentType.API: self._heal_api,
            ComponentType.ML_MODEL: self._heal_ml_model,
        }
        self.healing_history: List[Dict[str, Any]] = []

    async def _heal_database(self, issue: HealthCheckResult) -> Dict[str, Any]:
        """Database-specific healing actions"""
        actions_taken = []

        try:
            if "active_connections" in issue.details:
                conn_ratio = issue.details["active_connections"] / issue.details.get(
                    "max_connections", 100
                )
                if conn_ratio > 0.8:
                    actions_taken.append("Terminated idle connections")
                    logger.info("Simulated: Terminated idle database connections")

            if "slow_queries" in issue.details and issue.details["slow_queries"] > 10:
                actions_taken.append("Killed long-running queries")
                logger.info("Simulated: Killed slow database queries")

            return {
                "component": "database",
                "actions_taken": actions_taken,
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Database healing failed: {e}")
            return {"component": "database", "success": False, "error": str(e)}

    async def _heal_cache(self, issue: HealthCheckResult) -> Dict[str, Any]:
        """Cache-specific healing actions"""
        actions_taken = []

        try:
            if "hit_ratio" in issue.details and issue.details["hit_ratio"] < 0.8:
                actions_taken.append("Warmed up cache with frequent queries")
                logger.info("Simulated: Cache warm-up initiated")

            if "evicted_keys" in issue.details and issue.details["evicted_keys"] > 1000:
                actions_taken.append("Increased memory allocation")
                logger.info("Simulated: Redis memory increased")

            return {
                "component": "cache",
                "actions_taken": actions_taken,
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Cache healing failed: {e}")
            return {"component": "cache", "success": False, "error": str(e)}

    async def _heal_storage(self, issue: HealthCheckResult) -> Dict[str, Any]:
        """Storage-specific healing actions"""
        actions_taken = []

        try:
            if issue.component_name == "opensearch":
                if "cluster_status" in issue.details and issue.details["cluster_status"] != "green":
                    actions_taken.append("Rebalanced cluster shards")
                    logger.info("Simulated: OpenSearch cluster rebalancing")

            elif issue.component_name == "minio":
                if (
                    "storage_used_percent" in issue.details
                    and issue.details["storage_used_percent"] > 90
                ):
                    actions_taken.append("Triggered automated cleanup of old data")
                    logger.info("Simulated: MinIO storage cleanup")

            return {
                "component": "storage",
                "actions_taken": actions_taken,
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Storage healing failed: {e}")
            return {"component": "storage", "success": False, "error": str(e)}

    async def _heal_api(self, issue: HealthCheckResult) -> Dict[str, Any]:
        """API-specific healing actions"""
        actions_taken = []

        try:
            if issue.response_time_ms > 5000:
                actions_taken.append("Restarted slow API workers")
                logger.info("Simulated: API worker restart")

            return {
                "component": "api",
                "actions_taken": actions_taken,
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"API healing failed: {e}")
            return {"component": "api", "success": False, "error": str(e)}

    async def _heal_ml_model(self, issue: HealthCheckResult) -> Dict[str, Any]:
        """ML model-specific healing actions"""
        actions_taken = []

        try:
            if (
                "prediction_accuracy" in issue.details
                and issue.details["prediction_accuracy"] < 0.90
            ):
                actions_taken.append("Triggered model retraining")
                logger.info("Simulated: ML model retraining initiated")

            if "drift_status" in issue.details and issue.details["drift_status"] == "critical":
                actions_taken.append("Switched to backup model")
                logger.info("Simulated: Switched to backup ML model")

            return {
                "component": "ml_model",
                "actions_taken": actions_taken,
                "success": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"ML model healing failed: {e}")
            return {"component": "ml_model", "success": False, "error": str(e)}

    async def auto_heal_issues(self, health_report: Dict[str, Any]) -> Dict[str, Any]:
        """Automatically heal detected issues"""
        healing_results = []

        if health_report["overall_status"] in ["warning", "critical"]:
            logger.info("Initiating self-healing procedures")

            component_health = health_report.get("component_health", {})

            for component_name, component_data in component_health.items():
                if component_data["status"] in ["warning", "critical"]:
                    # Create mock HealthCheckResult for healing
                    issue = HealthCheckResult(
                        component_name=component_name,
                        component_type=ComponentType(component_data["component_type"]),
                        status=HealthStatus(component_data["status"]),
                        response_time_ms=component_data["response_time_ms"],
                        timestamp=datetime.fromisoformat(component_data["timestamp"]),
                        details=component_data["details"],
                        error_message=component_data.get("error_message"),
                    )

                    # Find appropriate healing action
                    healing_func = self.healing_actions.get(issue.component_type)
                    if healing_func:
                        healing_result = await healing_func(issue)
                        healing_results.append(healing_result)

            # Record healing actions
            self.healing_history.extend(healing_results)

            # Keep only last 100 healing records
            if len(self.healing_history) > 100:
                self.healing_history = self.healing_history[-100:]

        return {
            "healing_attempted": len(healing_results) > 0,
            "healing_results": healing_results,
            "timestamp": datetime.utcnow().isoformat(),
        }


# Global instances
health_checker = HealthChecker()
self_healing_manager = SelfHealingManager(health_checker)

# Export main components
__all__ = [
    "HealthStatus",
    "ComponentType",
    "HealthCheckResult",
    "SystemMetrics",
    "HealthChecker",
    "SelfHealingManager",
    "health_checker",
    "self_healing_manager",
]
