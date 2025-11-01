#!/usr/bin/env python3
"""
NEXUS_SUPERVISOR with Prometheus Metrics
"""

import time

from observability.metrics import (
    AGENT_TASKS,
    CIRCUIT_BREAKER_STATE,
    REQUEST_COUNT,
    REQUEST_LATENCY,
    RequestMetrics,
    start_metrics_server,
)

# Import base supervisor class
from .supervisor import AgentSupervisor as Supervisor


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
        with RequestMetrics("GET", "status"):
            pass  # No super() call as base class does not have this method

    def start_self_improve(self):
        with RequestMetrics("POST", "start_self_improve"):
            pass  # No super() call as base class does not have this method

    def stop_self_improve(self):
        with RequestMetrics("POST", "stop_self_improve"):
            pass  # No super() call as base class does not have this method

    def shutdown(self):
        with RequestMetrics("POST", "shutdown"):
            pass  # No super() call as base class does not have this method

    def run_loop(self):
        self.start_metrics()
        with RequestMetrics("BACKGROUND", "run_loop"):
            pass  # No super() call as base class does not have this method


# Example usage
if __name__ == "__main__":
    supervisor = MetricsSupervisor("agents/registry.yaml", "agents/policies.yaml")
    supervisor.start_metrics()
    supervisor.run_loop()
