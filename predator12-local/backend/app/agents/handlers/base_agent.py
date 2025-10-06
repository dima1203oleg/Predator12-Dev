"""
Базовий клас агента для Predator Analytics
"""

from __future__ import annotations

import asyncio
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from enum import Enum
from typing import Any

import structlog
from pydantic import BaseModel

logger = structlog.get_logger()


class AgentStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    ERROR = "error"
    COMPLETED = "completed"


class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class AgentTask(BaseModel):
    id: str
    type: str
    payload: dict[str, Any]
    priority: TaskPriority = TaskPriority.MEDIUM
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    status: AgentStatus = AgentStatus.IDLE
    result: dict[str, Any] | None = None
    error: str | None = None


class BaseAgent(ABC):
    """Базовий клас для всіх агентів системи"""
    
    def __init__(self, name: str, config: dict[str, Any] | None = None):
        self.name = name
        self.config = config or {}
        self.status = AgentStatus.IDLE
        self.tasks: dict[str, AgentTask] = {}
        self.logger = logger.bind(agent=name)
        
    def generate_task_id(self) -> str:
        """Генерує унікальний ID завдання"""
        return str(uuid.uuid4())
        
    async def submit_task(self, task_type: str, payload: dict[str, Any], 
                         priority: TaskPriority = TaskPriority.MEDIUM) -> str:
        """Підтверджує завдання для виконання"""
        task_id = self.generate_task_id()
        task = AgentTask(
            id=task_id,
            type=task_type,
            payload=payload,
            priority=priority,
            created_at=datetime.utcnow()
        )
        
        self.tasks[task_id] = task
        self.logger.info("Task submitted", task_id=task_id, task_type=task_type)
        
        # Запускаємо завдання асинхронно
        asyncio.create_task(self._execute_task(task_id))
        return task_id
        
    async def _execute_task(self, task_id: str):
        """Виконує завдання"""
        if task_id not in self.tasks:
            self.logger.error("Task not found", task_id=task_id)
            return
            
        task = self.tasks[task_id]
        task.status = AgentStatus.RUNNING
        task.started_at = datetime.utcnow()
        self.status = AgentStatus.RUNNING
        
        try:
            self.logger.info("Executing task", task_id=task_id, task_type=task.type)
            result = await self.execute(task.type, task.payload)
            
            task.result = result
            task.status = AgentStatus.COMPLETED
            task.completed_at = datetime.utcnow()
            self.status = AgentStatus.IDLE
            
            self.logger.info("Task completed", task_id=task_id)
            
        except Exception as e:
            self.logger.error("Task failed", task_id=task_id, error=str(e))
            task.error = str(e)
            task.status = AgentStatus.ERROR
            task.completed_at = datetime.utcnow()
            self.status = AgentStatus.ERROR
    
    def get_task_status(self, task_id: str) -> dict[str, Any] | None:
        """Повертає статус завдання"""
        if task_id not in self.tasks:
            return None
            
        task = self.tasks[task_id]
        return {
            "id": task.id,
            "type": task.type,
            "status": task.status.value,
            "created_at": task.created_at.isoformat(),
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "result": task.result,
            "error": task.error
        }
    
    def get_all_tasks(self) -> list[dict[str, Any]]:
        """Повертає всі завдання агента"""
        return [self.get_task_status(task_id) for task_id in self.tasks.keys()]
    
    def get_capabilities(self) -> list[str]:
        """Повертає список можливостей агента"""
        return self.capabilities()
    
    @abstractmethod
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує конкретне завдання (має бути реалізовано в дочірньому класі)"""
        ...
    
    @abstractmethod
    def capabilities(self) -> list[str]:
        """Повертає список типів завдань, які може виконувати агент"""
        ...
    
    def health_check(self) -> dict[str, Any]:
        """Перевіряє стан агента"""
        return {
            "name": self.name,
            "status": self.status.value,
            "active_tasks": len([t for t in self.tasks.values() if t.status == AgentStatus.RUNNING]),
            "total_tasks": len(self.tasks),
            "capabilities": self.capabilities()
        }
