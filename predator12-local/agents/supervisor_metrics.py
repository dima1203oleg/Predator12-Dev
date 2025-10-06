#!/usr/bin/env python3
"""
NEXUS_SUPERVISOR with Prometheus Metrics
"""

from observability.metrics import (
    REQUEST_COUNT, 
    REQUEST_LATENCY,
    AGENT_TASKS,
    CIRCUIT_BREAKER_STATE,
    RequestMetrics,
    start_metrics_server
)
import time

# Import base supervisor class
from .supervisor_enhanced import Supervisor

class MetricsSupervisor(Supervisor):
    """Supervisor with integrated Prometheus metrics"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.metrics_started = False
        
    def start_metrics(self, port=8001):
        """Start metrics server"""
        if not self.metrics_started:
            start_metrics_server(port)
            self.metrics_started = True
    
    def status(self):
        with RequestMetrics('GET', 'status'):
            super().status()
    
    def start_self_improve(self):
        with RequestMetrics('POST', 'start_self_improve'):
            super().start_self_improve()
    
    def stop_self_improve(self):
        with RequestMetrics('POST', 'stop_self_improve'):
            super().stop_self_improve()
    
    def shutdown(self):
        with RequestMetrics('POST', 'shutdown'):
            super().shutdown()
    
    def run_loop(self):
        self.start_metrics()
        with RequestMetrics('BACKGROUND', 'run_loop'):
            super().run_loop()

# Example usage
if __name__ == '__main__':
    supervisor = MetricsSupervisor('agents/registry.yaml', 'agents/policies.yaml')
    supervisor.start_metrics()
    supervisor.run_loop()
