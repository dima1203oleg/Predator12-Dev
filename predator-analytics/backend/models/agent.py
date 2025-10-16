"""
Agent Model
"""
from sqlalchemy import Column, String, Boolean, DateTime, JSON, Integer
from sqlalchemy.sql import func
from core.database import Base


class Agent(Base):
    """Agent model for AI agents"""
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    agent_type = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_busy = Column(Boolean, default=False)
    
    # Configuration
    config = Column(JSON, nullable=True)
    capabilities = Column(JSON, nullable=True)
    
    # Metrics
    total_tasks_completed = Column(Integer, default=0)
    total_tasks_failed = Column(Integer, default=0)
    average_execution_time = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_task_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<Agent {self.name} ({self.agent_type})>"
