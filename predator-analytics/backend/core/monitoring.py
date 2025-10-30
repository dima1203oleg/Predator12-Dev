"""
Monitoring and Observability Setup
"""

import logging
import time

from prometheus_client import Counter, Gauge, Histogram

logger = logging.getLogger(__name__)

# Prometheus Metrics
request_count = Counter(
    "predator_http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
)

request_duration = Histogram(
    "predator_http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
)

active_tasks = Gauge("predator_active_tasks", "Number of active tasks", ["agent_type"])

task_execution_time = Histogram(
    "predator_task_execution_seconds", "Task execution time in seconds", ["agent_type", "task_type"]
)

agent_errors = Counter(
    "predator_agent_errors_total", "Total agent errors", ["agent_type", "error_type"]
)

celery_queue_length = Gauge("predator_celery_queue_length", "Celery queue length", ["queue_name"])

redis_operations = Counter(
    "predator_redis_operations_total", "Total Redis operations", ["operation", "status"]
)


def setup_monitoring():
    """Initialize monitoring and observability"""
    logger.info("📊 Setting up Prometheus metrics...")
    logger.info("✅ Monitoring configured successfully")


class MetricsMiddleware:
    """Middleware for collecting request metrics"""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            method = scope["method"]
            path = scope["path"]

            start_time = time.time()

            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    status = message["status"]
                    duration = time.time() - start_time

                    request_count.labels(method=method, endpoint=path, status=status).inc()

                    request_duration.labels(method=method, endpoint=path).observe(duration)

                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)
