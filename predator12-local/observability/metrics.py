"""
Prometheus Metrics Configuration with Cache Support
"""
from prometheus_client import start_http_server, Counter, Gauge, Histogram
from typing import Optional
import time

# Request Metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP Requests',
    ['method', 'endpoint', 'status'],
    namespace='predator'
)

REQUEST_LATENCY = Histogram(
    'http_request_latency_seconds',
    'HTTP Request Latency',
    ['method', 'endpoint'],
    namespace='predator'
)

# Agent Metrics
AGENT_TASKS = Counter(
    'agent_tasks_total',
    'Total Agent Tasks Executed',
    ['agent_name', 'status'],
    namespace='predator'
)

# Circuit Breaker Metrics
CIRCUIT_BREAKER_STATE = Gauge(
    'circuit_breaker_state',
    'Circuit Breaker State (0=closed, 1=open, 2=half-open)',
    ['agent_name'],
    namespace='predator'
)

# Cache Metrics
CACHE_HITS = Counter(
    'cache_hits_total',
    'Total Cache Hits',
    ['cache_type'],
    namespace='predator'
)

CACHE_MISSES = Counter(
    'cache_misses_total',
    'Total Cache Misses',
    ['cache_type'],
    namespace='predator'
)

CACHE_SIZE = Gauge(
    'cache_size_bytes',
    'Cache Size in Bytes',
    ['cache_type'],
    namespace='predator'
)

def start_metrics_server(port: int = 8001) -> None:
    """Start Prometheus metrics server"""
    start_http_server(port)

class RequestMetrics:
    """Context manager for request metrics"""
    
    def __init__(self, method: str, endpoint: str):
        self.method = method
        self.endpoint = endpoint
        self.start_time = time.time()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type: Optional[type], exc_val: Optional[Exception], exc_tb: Optional[object]) -> None:
        latency = time.time() - self.start_time
        status = '500' if exc_type else '200'
        
        REQUEST_LATENCY.labels(
            method=self.method,
            endpoint=self.endpoint
        ).observe(latency)
        
        REQUEST_COUNT.labels(
            method=self.method,
            endpoint=self.endpoint,
            status=status
        ).inc()

class CacheMetrics:
    """Context manager for cache metrics"""
    
    def __init__(self, cache_type: str):
        self.cache_type = cache_type
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type: Optional[type], exc_val: Optional[Exception], exc_tb: Optional[object]) -> None:
        if exc_type is None:
            CACHE_HITS.labels(cache_type=self.cache_type).inc()
        else:
            CACHE_MISSES.labels(cache_type=self.cache_type).inc()
