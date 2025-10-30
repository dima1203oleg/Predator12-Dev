"""
Analytics API Routes
"""

from datetime import datetime, timedelta

from core.database import get_db
from fastapi import APIRouter, Depends
from models.agent import Agent
from models.task import Task, TaskStatus
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/analytics/overview")
async def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get analytics overview with key metrics
    """
    # Total tasks
    total_tasks = db.query(func.count(Task.id)).scalar()

    # Tasks by status
    tasks_by_status = {}
    for status in TaskStatus:
        count = db.query(func.count(Task.id)).filter(Task.status == status).scalar()
        tasks_by_status[status.value] = count

    # Active agents
    active_agents = db.query(func.count(Agent.id)).filter(Agent.is_active == True).scalar()

    # Recent tasks (last 24h)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_tasks = db.query(func.count(Task.id)).filter(Task.created_at >= yesterday).scalar()

    # Average execution time
    avg_exec_time = (
        db.query(func.avg(Task.execution_time_seconds))
        .filter(Task.status == TaskStatus.COMPLETED)
        .scalar()
    )

    return {
        "total_tasks": total_tasks,
        "tasks_by_status": tasks_by_status,
        "active_agents": active_agents,
        "recent_tasks_24h": recent_tasks,
        "avg_execution_time_seconds": float(avg_exec_time) if avg_exec_time else 0,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/analytics/agents")
async def get_agent_analytics(db: Session = Depends(get_db)):
    """
    Get analytics for agents
    """
    agents = db.query(Agent).all()

    agent_stats = []
    for agent in agents:
        total_tasks = (
            db.query(func.count(Task.id)).filter(Task.agent_type == agent.agent_type).scalar()
        )

        completed_tasks = (
            db.query(func.count(Task.id))
            .filter(Task.agent_type == agent.agent_type, Task.status == TaskStatus.COMPLETED)
            .scalar()
        )

        failed_tasks = (
            db.query(func.count(Task.id))
            .filter(Task.agent_type == agent.agent_type, Task.status == TaskStatus.FAILED)
            .scalar()
        )

        agent_stats.append(
            {
                "agent_id": agent.id,
                "agent_name": agent.name,
                "agent_type": agent.agent_type,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
                "failed_tasks": failed_tasks,
                "success_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                "is_active": agent.is_active,
            }
        )

    return agent_stats


@router.get("/analytics/timeline")
async def get_task_timeline(days: int = 7, db: Session = Depends(get_db)):
    """
    Get task timeline for the last N days
    """
    timeline = []

    for i in range(days):
        date = datetime.utcnow().date() - timedelta(days=i)
        start_time = datetime.combine(date, datetime.min.time())
        end_time = datetime.combine(date, datetime.max.time())

        tasks_count = (
            db.query(func.count(Task.id))
            .filter(Task.created_at >= start_time, Task.created_at <= end_time)
            .scalar()
        )

        completed_count = (
            db.query(func.count(Task.id))
            .filter(
                Task.created_at >= start_time,
                Task.created_at <= end_time,
                Task.status == TaskStatus.COMPLETED,
            )
            .scalar()
        )

        timeline.append(
            {
                "date": date.isoformat(),
                "total_tasks": tasks_count,
                "completed_tasks": completed_count,
            }
        )

    return timeline[::-1]  # Reverse to show oldest first
