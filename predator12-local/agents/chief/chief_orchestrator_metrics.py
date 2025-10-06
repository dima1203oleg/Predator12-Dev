#!/usr/bin/env python3
"""
Chief Orchestrator with Prometheus Metrics
"""

from observability.metrics import (
    REQUEST_COUNT,
    REQUEST_LATENCY,
    AGENT_TASKS,
    CIRCUIT_BREAKER_STATE,
    RequestMetrics
)
from prometheus_client import start_http_server
from typing import Dict, Any

# Import base orchestrator and types
from .chief_orchestrator import ChiefOrchestratorAgent, AgentTask

class MetricsChiefOrchestrator(ChiefOrchestratorAgent):
    """Chief Orchestrator with metrics support"""
    
    def __init__(self, *args, metrics_port=8002, **kwargs):
        super().__init__(*args, **kwargs)
        self.metrics_port = metrics_port
        self._start_metrics_server()
    
    def _start_metrics_server(self):
        """Start Prometheus metrics endpoint"""
        start_http_server(self.metrics_port)
    
    async def _execute_agent_task(self, task: AgentTask, context_results: Dict) -> Dict[str, Any]:
        """Track agent task execution metrics"""
        with RequestMetrics('POST', f'agent/{task.agent_name}'):
            try:
                result = await super()._execute_agent_task(task, context_results)
                AGENT_TASKS.labels(agent_name=task.agent_name, status='success').inc()
                return result
            except Exception as e:
                AGENT_TASKS.labels(agent_name=task.agent_name, status='error').inc()
                raise
    
    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Track event publishing metrics"""
        with RequestMetrics('PUBLISH', f'event/{event_type}'):
            await super()._publish_event(event_type, data)
    
    def _setup_routes(self):
        """Wrap API endpoints with metrics"""
        super()._setup_routes()
        
        # Store original endpoints to wrap
        original_ask = self.app.routes[-1].endpoint
        original_status = self.app.routes[-2].endpoint
        original_health = self.app.routes[-3].endpoint
        
        # Recreate with metrics
        @self.app.post("/ask")
        async def wrapped_ask(request: dict):
            with RequestMetrics('POST', 'ask'):
                return await original_ask(request)
        
        @self.app.get("/status/{task_id}")
        async def wrapped_status(task_id: str):
            with RequestMetrics('GET', 'status'):
                return await original_status(task_id)
        
        @self.app.get("/health")
        async def wrapped_health():
            with RequestMetrics('GET', 'health'):
                return await original_health()
