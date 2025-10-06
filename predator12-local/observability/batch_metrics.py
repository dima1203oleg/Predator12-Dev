"""
Batch Processing Metrics for Prometheus
"""
from prometheus_client import Counter, Histogram
import time
from typing import Optional

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
