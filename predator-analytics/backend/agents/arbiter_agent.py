"""
Arbiter Agent - Central Task Coordinator
"""

import asyncio
import logging
from typing import Any, Dict, List

from agents.base import BaseAgent

logger = logging.getLogger(__name__)


class ArbiterAgent(BaseAgent):
    """
    Central coordinator that delegates tasks to specialized agents.
    Inspired by multi-agent arbitration systems.
    """

    def __init__(self):
        super().__init__(agent_id="arbiter-001", name="Arbiter Agent", agent_type="coordinator")
        self.registered_agents = {}
        self.task_queue = asyncio.Queue()

    def register_agent(self, agent: BaseAgent):
        """Register a specialized agent"""
        self.registered_agents[agent.agent_type] = agent
        self.logger.info(f"Registered agent: {agent.name} ({agent.agent_type})")

    async def execute(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Coordinate task execution by delegating to appropriate agents

        Args:
            task_data: Task data including 'task_type' and 'data'

        Returns:
            Aggregated results from agents
        """
        task_type = task_data.get("task_type")

        if task_type == "delegate":
            return await self._delegate_task(task_data)
        elif task_type == "analyze_dataset":
            return await self._delegate_to_agent("dataset_inspector", task_data)
        elif task_type == "process_data":
            return await self._delegate_to_agent("data_processor", task_data)
        elif task_type == "train_model":
            return await self._delegate_to_agent("model_trainer", task_data)
        else:
            return await self._auto_delegate(task_data)

    async def _delegate_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Delegate task to specific agent"""
        target_agent = task_data.get("target_agent")

        if target_agent not in self.registered_agents:
            return {
                "success": False,
                "error": f"Agent '{target_agent}' not found",
                "available_agents": list(self.registered_agents.keys()),
            }

        agent = self.registered_agents[target_agent]
        result = await agent.run(task_data.get("data", {}))

        return {"success": True, "agent": target_agent, "result": result}

    async def _delegate_to_agent(
        self, agent_type: str, task_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Delegate to specific agent type"""
        if agent_type not in self.registered_agents:
            return {"success": False, "error": f"No agent registered for type '{agent_type}'"}

        agent = self.registered_agents[agent_type]
        result = await agent.run(task_data)

        return {
            "success": True,
            "agent_type": agent_type,
            "agent_name": agent.name,
            "result": result,
        }

    async def _auto_delegate(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Automatically determine which agent should handle the task
        based on task content and agent capabilities
        """
        # Analyze task to determine best agent
        task_keywords = str(task_data).lower()

        if "dataset" in task_keywords or "data quality" in task_keywords:
            return await self._delegate_to_agent("dataset_inspector", task_data)
        elif "process" in task_keywords or "transform" in task_keywords:
            return await self._delegate_to_agent("data_processor", task_data)
        elif "train" in task_keywords or "model" in task_keywords:
            return await self._delegate_to_agent("model_trainer", task_data)
        else:
            return {
                "success": False,
                "error": "Could not determine appropriate agent for task",
                "suggestion": "Please specify target_agent or task_type",
            }

    async def get_system_status(self) -> Dict[str, Any]:
        """Get status of all agents in the system"""
        agents_status = {}

        for agent_type, agent in self.registered_agents.items():
            agents_status[agent_type] = agent.get_status()

        return {
            "arbiter": self.get_status(),
            "registered_agents": agents_status,
            "total_agents": len(self.registered_agents),
            "queue_size": self.task_queue.qsize(),
        }

    async def parallel_execute(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Execute multiple tasks in parallel across different agents

        Args:
            tasks: List of task data dictionaries

        Returns:
            List of results from all tasks
        """
        task_coroutines = [self.execute(task) for task in tasks]
        results = await asyncio.gather(*task_coroutines, return_exceptions=True)

        return [
            (
                result
                if not isinstance(result, Exception)
                else {"success": False, "error": str(result)}
            )
            for result in results
        ]
