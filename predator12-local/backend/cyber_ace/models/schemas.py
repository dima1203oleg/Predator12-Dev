"""
CYBER-ACE Data Models
=====================

Pydantic models для валідації даних.

Author: CYBER-ACE Team
Version: 1.0.0
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class Language(str, Enum):
    """Підтримувані мови."""

    UKRAINIAN = "uk"
    ENGLISH = "en"


class IntentType(str, Enum):
    """Типи намірів."""

    QUERY = "query"
    ANALYZE = "analyze"
    SEARCH = "search"
    CONTROL = "control"
    DELEGATE = "delegate"


class AgentStatus(str, Enum):
    """Статус агента."""

    IDLE = "idle"
    BUSY = "busy"
    ERROR = "error"
    OFFLINE = "offline"


class Message(BaseModel):
    """Модель повідомлення."""

    content: str
    user_id: str
    language: Language = Language.UKRAINIAN
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class Intent(BaseModel):
    """Модель наміру."""

    type: IntentType
    confidence: float = Field(ge=0.0, le=1.0)
    entities: Dict[str, Any] = {}


class AgentConfig(BaseModel):
    """Конфігурація агента."""

    id: str
    name: str
    specialization: str
    capabilities: List[str] = []
    max_concurrent_tasks: int = 1


class Task(BaseModel):
    """Модель завдання."""

    id: str
    agent_id: str
    type: str
    parameters: Dict[str, Any]
    priority: int = Field(ge=1, le=10, default=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TaskResult(BaseModel):
    """Результат виконання завдання."""

    task_id: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    completed_at: datetime = Field(default_factory=datetime.utcnow)
