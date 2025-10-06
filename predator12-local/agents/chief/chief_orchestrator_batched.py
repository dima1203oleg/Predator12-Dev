#!/usr/bin/env python3
"""
Chief Orchestrator with Request Batching
"""
from typing import Dict, List, Any, Tuple
import asyncio
from agents.chief.chief_orchestrator_cached import CachedChiefOrchestrator

class BatchedChiefOrchestrator(CachedChiefOrchestrator):
    """ChiefOrchestrator with batched agent requests"""
    
    def __init__(self, *args, batch_window=0.1, **kwargs):
        """
        Args:
            batch_window: Time in seconds to wait for batching (0.1s default)
        """
        super().__init__(*args, **kwargs)
        self.batch_window = batch_window
        self._batch_queue = asyncio.Queue()
        self._batch_processor_task = asyncio.create_task(self._process_batches())
    
    async def _execute_agent_task(self, task: AgentTask, context_results: Dict) -> Dict[str, Any]:
        """Execute task with batching support"""
        # For batchable tasks, add to queue
        if self._is_batchable(task):
            future = asyncio.Future()
            await self._batch_queue.put((task, context_results, future))
            return await future
        
        # Non-batchable tasks execute normally
        return await super()._execute_agent_task(task, context_results)
    
    def _is_batchable(self, task: AgentTask) -> bool:
        """Determine if a task can be batched"""
        return task.task_type in [
            "quality_check",
            "detect_anomalies",
            "validate"
        ]
    
    async def _process_batches(self):
        """Process batch queue"""
        while True:
            batch = []
            
            # Wait for first item
            first_item = await self._batch_queue.get()
            batch.append(first_item)
            
            # Gather additional items in the batch window
            try:
                while True:
                    item = await asyncio.wait_for(
                        self._batch_queue.get(),
                        timeout=self.batch_window
                    )
                    batch.append(item)
            except asyncio.TimeoutError:
                pass
            
            # Process batch
            if batch:
                await self._execute_batch(batch)
    
    async def _execute_batch(self, batch: List[Tuple[AgentTask, Dict, asyncio.Future]]):
        """Execute a batch of tasks"""
        # Group by agent
        tasks_by_agent: Dict[str, List] = {}
        for task, context, future in batch:
            if task.agent_name not in tasks_by_agent:
                tasks_by_agent[task.agent_name] = []
            tasks_by_agent[task.agent_name].append((task, context, future))
        
        # Process each agent's batch
        for agent_name, agent_batch in tasks_by_agent.items():
            if len(agent_batch) == 1:
                # Single item, execute normally
                task, context, future = agent_batch[0]
                try:
                    result = await super()._execute_agent_task(task, context)
                    future.set_result(result)
                except Exception as e:
                    future.set_exception(e)
            else:
                # Batch processing
                try:
                    port = self._get_agent_port(agent_name)
                    results = await self._execute_batch_call(
                        agent_name,
                        port,
                        [t[0] for t in agent_batch],
                        [t[1] for t in agent_batch]
                    )
                    
                    for (_, _, future), result in zip(agent_batch, results):
                        future.set_result(result)
                except Exception as e:
                    for _, _, future in agent_batch:
                        future.set_exception(e)
    
    async def _execute_batch_call(self, agent_name: str, port: int, 
                                tasks: List[AgentTask], contexts: List[Dict]) -> List[Dict]:
        """Make batched HTTP call to agent"""
        agent_url = f"http://localhost:{port}"
        batch_payload = [
            {
                "task_type": task.task_type,
                "parameters": {**task.parameters, "context": ctx}
            }
            for task, ctx in zip(tasks, contexts)
        ]
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{agent_url}/batch",
                json={"batch": batch_payload},
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    return await response.json()
                raise Exception(f"Batch request failed: {response.status}")
