from prometheus_client import Counter, Histogram
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


# Prometheus metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status_code']
)
http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)


class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        endpoint = request.url.path
        
        response: Response = await call_next(request)
        
        duration = time.time() - start_time
        status_code = response.status_code
        
        # Record metrics
        http_requests_total.labels(
            method=method,
            endpoint=endpoint,
            status_code=status_code
        ).inc()
        http_request_duration_seconds.labels(
            method=method,
            endpoint=endpoint
        ).observe(duration)
        
        return response 