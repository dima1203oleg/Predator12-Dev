"""
Base Agent Class
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all AI agents"""
    
    def __init__(self, agent_id: str, name: str, agent_type: str):
        self.agent_id = agent_id
        self.name = name
        self.agent_type = agent_type
        self.is_busy = False
        self.logger = logging.getLogger(f"agent.{name}")
    
    @abstractmethod
    async def execute(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's task
        
        Args:
            task_data: Input data for the task
            
        Returns:
            Result dictionary with task results
        """
        pass
    
    async def validate_input(self, task_data: Dict[str, Any]) -> bool:
        """
        Validate input data
        
        Args:
            task_data: Input data to validate
            
        Returns:
            True if valid, False otherwise
        """
        return True
    
    async def handle_error(self, error: Exception) -> Dict[str, Any]:
        """
        Handle execution errors
        
        Args:
            error: The exception that occurred
            
        Returns:
            Error response dictionary
        """
        self.logger.error(f"Error in {self.name}: {error}", exc_info=True)
        return {
            "success": False,
            "error": str(error),
            "agent": self.name,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "type": self.agent_type,
            "is_busy": self.is_busy,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def pre_execute(self, task_data: Dict[str, Any]):
        """Hook called before execution"""
        self.is_busy = True
        self.logger.info(f"Starting task execution for {self.name}")
    
    async def post_execute(self, result: Dict[str, Any]):
        """Hook called after execution"""
        self.is_busy = False
        self.logger.info(f"Completed task execution for {self.name}")
    
    async def run(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main entry point for running the agent
        
        Args:
            task_data: Input data for the task
            
        Returns:
            Result dictionary
        """
        try:
            # Pre-execution hook
            await self.pre_execute(task_data)
            
            # Validate input
            if not await self.validate_input(task_data):
                return {
                    "success": False,
                    "error": "Invalid input data",
                    "agent": self.name
                }
            
            # Execute task
            result = await self.execute(task_data)
            
            # Post-execution hook
            await self.post_execute(result)
            
            return result
            
        except Exception as e:
            return await self.handle_error(e)
