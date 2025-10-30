"""
Task Model
"""

from enum import Enum

from core.database import Base
from sqlalchemy import JSON, Column, DateTime
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import Integer, String
from sqlalchemy.sql import func


class TaskStatus(str, Enum):
    """Task status enum"""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    """Task priority enum"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Task(Base):
    """Task model for agent tasks"""

    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    agent_type = Column(String, nullable=False, index=True)
    task_type = Column(String, nullable=False)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, index=True)
    priority = Column(SQLEnum(TaskPriority), default=TaskPriority.MEDIUM)

    # Task data
    input_data = Column(JSON, nullable=True)
    result_data = Column(JSON, nullable=True)
    error_message = Column(String, nullable=True)

    # Metadata
    celery_task_id = Column(String, nullable=True, index=True)
    user_id = Column(String, nullable=True, index=True)

    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Metrics
    execution_time_seconds = Column(Integer, nullable=True)
    retries = Column(Integer, default=0)

    def __repr__(self):
        return f"<Task {self.id} - {self.agent_type} - {self.status}>"
