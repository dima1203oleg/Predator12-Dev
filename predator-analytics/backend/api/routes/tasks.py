"""
Tasks API Routes
"""

import uuid
from datetime import datetime
from typing import List, Optional

from core.database import get_db
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from models.task import Task, TaskPriority, TaskStatus
from pydantic import BaseModel
from services.celery_service import submit_task
from sqlalchemy.orm import Session

router = APIRouter()


class TaskCreate(BaseModel):
    """Task creation model"""

    agent_type: str
    task_type: str
    priority: TaskPriority = TaskPriority.MEDIUM
    input_data: dict


class TaskResponse(BaseModel):
    """Task response model"""

    id: str
    agent_type: str
    task_type: str
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/tasks", response_model=TaskResponse)
async def create_task(
    task: TaskCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)
):
    """
    Create a new task
    """
    # Create task in database
    db_task = Task(
        id=str(uuid.uuid4()),
        agent_type=task.agent_type,
        task_type=task.task_type,
        status=TaskStatus.PENDING,
        priority=task.priority,
        input_data=task.input_data,
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Submit to Celery
    background_tasks.add_task(submit_task, db_task.id, task.dict())

    return db_task


@router.get("/tasks", response_model=List[TaskResponse])
async def list_tasks(
    status: Optional[TaskStatus] = None,
    agent_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    List tasks with optional filters
    """
    query = db.query(Task)

    if status:
        query = query.filter(Task.status == status)
    if agent_type:
        query = query.filter(Task.agent_type == agent_type)

    tasks = query.order_by(Task.created_at.desc()).limit(limit).all()
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    """
    Get task by ID
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/tasks/{task_id}/result")
async def get_task_result(task_id: str, db: Session = Depends(get_db)):
    """
    Get task result
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return {
        "task_id": task.id,
        "status": task.status,
        "result": task.result_data,
        "error": task.error_message,
    }


@router.delete("/tasks/{task_id}")
async def cancel_task(task_id: str, db: Session = Depends(get_db)):
    """
    Cancel a pending or running task
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.status in [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Task cannot be cancelled")

    task.status = TaskStatus.CANCELLED
    db.commit()

    return {"message": "Task cancelled successfully"}
