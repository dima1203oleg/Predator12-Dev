#!/usr/bin/env python3
"""
Chief Orchestrator with Tiered Caching (Lint-clean version)
"""
from typing import Dict, Any
import redis
from agents.chief.chief_orchestrator import ChiefOrchestratorAgent
from agents.chief.models import AgentTask
from observability.tiered_cache import TieredCache

class TieredCacheChiefOrchestrator(ChiefOrchestratorAgent):
    """ChiefOrchestrator with tiered caching support"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.redis_client = redis.Redis(
            host=self.redis_client.connection_pool.connection_kwargs.get('host', 'redis'),
            port=self.redis_client.connection_pool.connection_kwargs.get('port', 6379)
        )
        self.cache = TieredCache(self.redis_client)
    
    async def _execute_agent_task(self, task: AgentTask, context_results: Dict[str, Any]) -> Dict[str, Any]:
        """Wrapped with tiered caching"""
        async def cached_task_execution(t: AgentTask, ctx: Dict[str, Any]) -> Dict[str, Any]:
            return await super()._execute_agent_task(t, ctx)
            
        return await self.cache.cached(cached_task_execution)(task, context_results)
    
    async def warm_caches(self):
        """Pre-warm common agent tasks"""
        common_tasks = [
            AgentTask('DataQualityAgent', 'quality_check', {}),
            AgentTask('AnomalyAgent', 'detect_anomalies', {})
        ]
        
        for task in common_tasks:
            await self._execute_agent_task(task, {})
