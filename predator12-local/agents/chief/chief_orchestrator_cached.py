#!/usr/bin/env python3
"""
Chief Orchestrator with Redis Caching
"""
import json
from typing import Dict, Any
from agents.chief.chief_orchestrator_metrics import MetricsChiefOrchestrator

class CachedChiefOrchestrator(MetricsChiefOrchestrator):
    """ChiefOrchestrator with Redis caching layer"""
    
    def __init__(self, *args, cache_ttl=300, **kwargs):
        super().__init__(*args, **kwargs)
        self.cache_ttl = cache_ttl  # Cache time-to-live in seconds
    
    async def _execute_agent_task(self, task: AgentTask, context_results: Dict) -> Dict[str, Any]:
        """Cached version of agent task execution"""
        # Generate cache key
        cache_key = f"agent:{task.agent_name}:{task.task_type}:{json.dumps(task.parameters)}"
        
        # Try to get cached result
        cached = self.redis_client.get(cache_key)
        if cached:
            logger.debug("Returning cached result", agent=task.agent_name)
            return json.loads(cached)
        
        # Execute and cache result
        result = await super()._execute_agent_task(task, context_results)
        if result and not result.get('error'):
            self.redis_client.setex(cache_key, self.cache_ttl, json.dumps(result))
        
        return result

    async def _call_model_router(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Cached LLM calls"""
        cache_key = f"llm:{request['model_type']}:{request['prompt'][:100]}"
        cached = self.redis_client.get(cache_key)
        if cached:
            logger.debug("Returning cached LLM response")
            return json.loads(cached)
        
        result = await super()._call_model_router(request)
        if result:
            self.redis_client.setex(cache_key, self.cache_ttl, json.dumps(result))
        
        return result
