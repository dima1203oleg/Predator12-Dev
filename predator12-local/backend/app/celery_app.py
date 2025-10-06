from celery import Celery
import os

# Створення Celery додатку
celery_app = Celery(
    "predator_tasks",
    broker=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    include=[
        "app.agents.tasks.dataset_tasks",
        "app.agents.tasks.anomaly_tasks", 
        "app.agents.tasks.forecast_tasks",
        "app.agents.tasks.graph_tasks",
        "app.agents.tasks.security_tasks",
        "app.agents.tasks.self_healing_tasks",
        "app.agents.tasks.auto_improve_tasks"
    ]
)

# Конфігурація Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 хвилин
    task_soft_time_limit=25 * 60,  # 25 хвилин
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Налаштування маршрутизації завдань
celery_app.conf.task_routes = {
    "app.agents.tasks.dataset_tasks.*": {"queue": "dataset_queue"},
    "app.agents.tasks.anomaly_tasks.*": {"queue": "anomaly_queue"},
    "app.agents.tasks.forecast_tasks.*": {"queue": "forecast_queue"},
    "app.agents.tasks.graph_tasks.*": {"queue": "graph_queue"},
    "app.agents.tasks.security_tasks.*": {"queue": "security_queue"},
    "app.agents.tasks.self_healing_tasks.*": {"queue": "healing_queue"},
    "app.agents.tasks.auto_improve_tasks.*": {"queue": "improve_queue"},
}
