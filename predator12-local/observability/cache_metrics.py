"""
Cache and Batch Metrics for Prometheus
"""
from prometheus_client import Counter, Gauge, Histogram
from typing import Optional
import time

# Cache Metrics
CACHE_HITS = Counter(
    'cache_hits_total',
    'Total Cache Hits',
    ['cache_type']
)

CACHE_MISSES = Counter(
    'cache_misses_total',
    'Total Cache Misses',
    ['cache_type']
)

CACHE_SIZE = Gauge(
    'cache_size_bytes',
    'Cache Size in Bytes',
    ['cache_type']
)

class CacheMetrics:
    """Context manager for cache metrics"""
    
    def __init__(self, cache_type: str):
        self.cache_type = cache_type
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type: Optional[type], 
                exc_val: Optional[Exception], 
                exc_tb: Optional[object]) -> None:
        if exc_type is None:
            CACHE_HITS.labels(cache_type=self.cache_type).inc()
        else:
            CACHE_MISSES.labels(cache_type=self.cache_type).inc()

# Batch Metrics
BATCH_REQUESTS = Counter(
    'batch_requests_total',
    'Total Batched Requests',
    ['agent_name', 'status']
)

BATCH_SIZE = Histogram(
    'batch_request_size',
    'Number of Requests in Batch',
    ['agent_name'],
    buckets=(1, 2, 5, 10, 20)
)

BATCH_LATENCY = Histogram(
    'batch_latency_seconds',
    'Batch Processing Latency',
    ['agent_name']
)

class BatchMetrics:
    """Context manager for batch metrics"""
    
    def __init__(self, agent_name: str, batch_size: int):
        self.agent_name = agent_name
        self.batch_size = batch_size
        self.start_time = time.time()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type: Optional[type], 
                exc_val: Optional[Exception], 
                exc_tb: Optional[object]) -> None:
        latency = time.time() - self.start_time
        status = 'error' if exc_type else 'success'
        
        BATCH_SIZE.labels(agent_name=self.agent_name).observe(self.batch_size)
        BATCH_LATENCY.labels(agent_name=self.agent_name).observe(latency)
        BATCH_REQUESTS.labels(agent_name=self.agent_name, status=status).inc()
