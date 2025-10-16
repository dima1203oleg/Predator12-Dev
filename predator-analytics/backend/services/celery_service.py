"""
Celery Service for Background Tasks
"""
from celery import Celery
from core.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Celery app
celery_app = Celery(
    "predator_analytics",
    broker=settings.CELERY_BROKER,
    backend=settings.CELERY_BACKEND
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=settings.TASK_TIMEOUT,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)


@celery_app.task(name="execute_agent_task")
def execute_agent_task(task_id: str, task_data: dict):
    """
    Execute an agent task in background
    """
    from models.task import Task, TaskStatus
    from core.database import SessionLocal
    from datetime import datetime
    
    db = SessionLocal()
    
    try:
        # Get task from database
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            logger.error(f"Task {task_id} not found")
            return {"error": "Task not found"}
        
        # Update task status
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.utcnow()
        db.commit()
        
        # Execute task based on agent type
        # This would integrate with your agent system
        result = {"success": True, "message": "Task executed"}
        
        # Update task with result
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.utcnow()
        task.result_data = result
        task.execution_time_seconds = (
            task.completed_at - task.started_at
        ).total_seconds()
        db.commit()
        
        return result
        
    except Exception as e:
        logger.error(f"Error executing task {task_id}: {e}", exc_info=True)
        
        task.status = TaskStatus.FAILED
        task.error_message = str(e)
        task.completed_at = datetime.utcnow()
        db.commit()
        
        return {"error": str(e)}
        
    finally:
        db.close()


def submit_task(task_id: str, task_data: dict):
    """Submit task to Celery"""
    execute_agent_task.delay(task_id, task_data)
    logger.info(f"Task {task_id} submitted to Celery")
