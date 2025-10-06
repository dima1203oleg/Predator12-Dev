"""
Workflow Manager - Manages workflow execution, persistence, and caching
"""

from __future__ import annotations

import json
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Optional

import redis.asyncio as aioredis
import structlog
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

logger = structlog.get_logger()


# Workflow status enumeration
class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class WorkflowExecution:
    """Workflow execution data structure"""

    task_id: str
    dataset_id: str
    analyses: list[str]
    params: dict[str, Any]
    status: WorkflowStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    current_step: Optional[str] = None
    steps_completed: list[str] = None
    progress: int = 0
    results: dict[str, Any] = None
    error_message: Optional[str] = None
    duration_seconds: Optional[float] = None

    def __post_init__(self):
        if self.steps_completed is None:
            self.steps_completed = []
        if self.results is None:
            self.results = {}


# SQLAlchemy model for persistence
Base = declarative_base()


class WorkflowRecord(Base):
    __tablename__ = "workflows"

    task_id = Column(String, primary_key=True)
    dataset_id = Column(String, nullable=False)
    analyses = Column(Text, nullable=False)  # JSON string
    params = Column(Text, nullable=False)  # JSON string
    status = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    current_step = Column(String)
    steps_completed = Column(Text)  # JSON string
    progress = Column(Integer, default=0)
    results = Column(Text)  # JSON string
    error_message = Column(Text)
    duration_seconds = Column(Float)


class WorkflowManager:
    """Manages workflow execution, persistence, and caching"""

    def __init__(
        self,
        redis_url: str = "redis://localhost:6379/0",
        database_url: str = "postgresql://postgres:postgres@localhost:5432/predator11",
        cache_ttl: int = 3600,
    ):
        self.redis_url = redis_url
        self.database_url = database_url
        self.cache_ttl = cache_ttl
        self.redis_client = None
        self.db_engine = None
        self.db_session = None
        self.active_workflows: dict[str, WorkflowExecution] = {}

    async def initialize(self):
        """Initialize connections and database"""
        try:
            # Initialize Redis
            self.redis_client = aioredis.from_url(self.redis_url, decode_responses=True)
            await self.redis_client.ping()
            logger.info("Redis connection established")

            # Initialize Database (in production)
            # For now, we'll use in-memory storage
            logger.info("Workflow manager initialized")

        except Exception as e:
            logger.error("Failed to initialize workflow manager", error=str(e))
            # Fallback to in-memory only
            self.redis_client = None

    async def create_workflow(
        self, dataset_id: str, analyses: list[str], params: dict[str, Any]
    ) -> str:
        """Create a new workflow"""
        task_id = str(uuid.uuid4())

        workflow = WorkflowExecution(
            task_id=task_id,
            dataset_id=dataset_id,
            analyses=analyses,
            params=params,
            status=WorkflowStatus.PENDING,
            created_at=datetime.utcnow(),
        )

        # Store in memory
        self.active_workflows[task_id] = workflow

        # Cache in Redis if available
        if self.redis_client:
            try:
                await self.redis_client.setex(
                    f"workflow:{task_id}", self.cache_ttl, json.dumps(asdict(workflow), default=str)
                )
            except Exception as e:
                logger.warning("Failed to cache workflow in Redis", error=str(e))

        logger.info("Workflow created", task_id=task_id, dataset_id=dataset_id)
        return task_id

    async def start_workflow(self, task_id: str):
        """Mark workflow as started"""
        workflow = await self.get_workflow(task_id)
        if workflow:
            workflow.status = WorkflowStatus.RUNNING
            workflow.started_at = datetime.utcnow()
            await self._update_workflow(workflow)
            logger.info("Workflow started", task_id=task_id)

    async def update_workflow_progress(self, task_id: str, current_step: str, progress: int):
        """Update workflow progress"""
        workflow = await self.get_workflow(task_id)
        if workflow:
            workflow.current_step = current_step
            workflow.progress = progress
            if current_step not in workflow.steps_completed:
                workflow.steps_completed.append(current_step)
            await self._update_workflow(workflow)
            logger.info(
                "Workflow progress updated", task_id=task_id, step=current_step, progress=progress
            )

    async def complete_workflow(self, task_id: str, results: dict[str, Any]):
        """Mark workflow as completed"""
        workflow = await self.get_workflow(task_id)
        if workflow:
            workflow.status = WorkflowStatus.COMPLETED
            workflow.completed_at = datetime.utcnow()
            workflow.current_step = None
            workflow.progress = 100
            workflow.results = results

            if workflow.started_at:
                workflow.duration_seconds = (
                    workflow.completed_at - workflow.started_at
                ).total_seconds()

            await self._update_workflow(workflow)
            logger.info("Workflow completed", task_id=task_id)

    async def fail_workflow(self, task_id: str, error_message: str):
        """Mark workflow as failed"""
        workflow = await self.get_workflow(task_id)
        if workflow:
            workflow.status = WorkflowStatus.FAILED
            workflow.completed_at = datetime.utcnow()
            workflow.error_message = error_message

            if workflow.started_at:
                workflow.duration_seconds = (
                    workflow.completed_at - workflow.started_at
                ).total_seconds()

            await self._update_workflow(workflow)
            logger.error("Workflow failed", task_id=task_id, error=error_message)

    async def cancel_workflow(self, task_id: str):
        """Cancel a running workflow"""
        workflow = await self.get_workflow(task_id)
        if workflow:
            workflow.status = WorkflowStatus.CANCELLED
            workflow.completed_at = datetime.utcnow()

            if workflow.started_at:
                workflow.duration_seconds = (
                    workflow.completed_at - workflow.started_at
                ).total_seconds()

            await self._update_workflow(workflow)
            logger.info("Workflow cancelled", task_id=task_id)
            return True
        return False

    async def get_workflow(self, task_id: str) -> Optional[WorkflowExecution]:
        """Get workflow by task ID"""
        # Check memory first
        if task_id in self.active_workflows:
            return self.active_workflows[task_id]

        # Check Redis cache
        if self.redis_client:
            try:
                cached = await self.redis_client.get(f"workflow:{task_id}")
                if cached:
                    data = json.loads(cached)
                    # Convert string dates back to datetime
                    for field in ["created_at", "started_at", "completed_at"]:
                        if data.get(field):
                            data[field] = datetime.fromisoformat(data[field])

                    workflow = WorkflowExecution(**data)
                    self.active_workflows[task_id] = workflow
                    return workflow
            except Exception as e:
                logger.warning("Failed to get workflow from Redis", error=str(e))

        return None

    async def list_workflows(
        self, limit: int = 10, offset: int = 0, status_filter: Optional[WorkflowStatus] = None
    ) -> dict[str, Any]:
        """List workflows with pagination"""
        workflows = list(self.active_workflows.values())

        # Filter by status if specified
        if status_filter:
            workflows = [w for w in workflows if w.status == status_filter]

        # Sort by creation time (newest first)
        workflows.sort(key=lambda w: w.created_at, reverse=True)

        # Apply pagination
        total = len(workflows)
        workflows = workflows[offset : offset + limit]

        return {
            "workflows": [
                {
                    "task_id": w.task_id,
                    "dataset_id": w.dataset_id,
                    "analyses": w.analyses,
                    "status": w.status,
                    "created_at": w.created_at.isoformat(),
                    "progress": w.progress,
                    "current_step": w.current_step,
                    "duration_seconds": w.duration_seconds,
                }
                for w in workflows
            ],
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    async def get_workflow_statistics(self) -> dict[str, Any]:
        """Get workflow execution statistics"""
        workflows = list(self.active_workflows.values())

        stats = {
            "total_workflows": len(workflows),
            "by_status": {},
            "average_duration": 0,
            "success_rate": 0,
            "most_common_analyses": {},
            "recent_activity": [],
        }

        if not workflows:
            return stats

        # Count by status
        for status in WorkflowStatus:
            count = len([w for w in workflows if w.status == status])
            stats["by_status"][status] = count

        # Calculate success rate
        completed = stats["by_status"].get(WorkflowStatus.COMPLETED, 0)
        failed = stats["by_status"].get(WorkflowStatus.FAILED, 0)
        total_finished = completed + failed
        if total_finished > 0:
            stats["success_rate"] = completed / total_finished

        # Calculate average duration
        durations = [w.duration_seconds for w in workflows if w.duration_seconds]
        if durations:
            stats["average_duration"] = sum(durations) / len(durations)

        # Most common analyses
        analysis_counts = {}
        for workflow in workflows:
            for analysis in workflow.analyses:
                analysis_counts[analysis] = analysis_counts.get(analysis, 0) + 1

        stats["most_common_analyses"] = dict(
            sorted(analysis_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        )

        # Recent activity (last 24 hours)
        recent_cutoff = datetime.utcnow() - timedelta(hours=24)
        recent_workflows = [w for w in workflows if w.created_at >= recent_cutoff]
        stats["recent_activity"] = len(recent_workflows)

        return stats

    async def cleanup_old_workflows(self, max_age_hours: int = 24):
        """Clean up old completed workflows"""
        cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)

        to_remove = []
        for task_id, workflow in self.active_workflows.items():
            is_finished = workflow.status in [
                WorkflowStatus.COMPLETED,
                WorkflowStatus.FAILED,
                WorkflowStatus.CANCELLED,
            ]
            is_old = bool(workflow.completed_at and workflow.completed_at < cutoff_time)
            if is_finished and is_old:
                to_remove.append(task_id)

        for task_id in to_remove:
            del self.active_workflows[task_id]

            # Remove from Redis cache
            if self.redis_client:
                try:
                    await self.redis_client.delete(f"workflow:{task_id}")
                except Exception as e:
                    logger.warning("Failed to delete workflow from Redis", error=str(e))

        if to_remove:
            logger.info("Cleaned up old workflows", count=len(to_remove))

        return len(to_remove)

    async def _update_workflow(self, workflow: WorkflowExecution):
        """Update workflow in storage"""
        # Update in memory
        self.active_workflows[workflow.task_id] = workflow

        # Update in Redis cache
        if self.redis_client:
            try:
                await self.redis_client.setex(
                    f"workflow:{workflow.task_id}",
                    self.cache_ttl,
                    json.dumps(asdict(workflow), default=str),
                )
            except Exception as e:
                logger.warning("Failed to update workflow in Redis", error=str(e))

    async def close(self):
        """Close connections"""
        if self.redis_client:
            await self.redis_client.close()


# Global workflow manager instance
workflow_manager = WorkflowManager()
