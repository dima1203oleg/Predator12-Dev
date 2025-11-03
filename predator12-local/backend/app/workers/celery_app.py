#!/usr/bin/env python3
"""
Celery конфігурація для Predator11 Multi-Agent System
Підтримує фонові задачі агентів та асинхронну обробку
"""

import os

from celery import Celery
from kombu import Queue

# Налаштування Redis з паролем
redis_url = os.getenv(
    "CELERY_BROKER_URL",
    os.getenv("REDIS_URL", "redis://:secure_redis_password@redis:6379/1"),
)
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://:secure_redis_password@redis:6379/2")

# Створення Celery застосунку
celery_app = Celery(
    "predator11-agents",
    broker=redis_url,
    backend=result_backend,
    include=[
        "app.workers.tasks",
    ],
)

# Конфігурація Celery з оптимізаціями для production
celery_app.conf.update(
    # Часові зони
    timezone="UTC",
    enable_utc=True,

    # Серіалізація (оптимізована з использованием msgpack для더 швидко)
    task_serializer="json",
    accept_content=["json", "msgpack"],
    result_serializer="json",

    # Результати та кеш
    result_expires=3600,
    result_cache_max=50000,  # Збільшено для більших обсягів
    result_backend_transport_options={
        "master_name": "mymaster",
        "socket_connect_timeout": 5,
        "socket_timeout": 5,
        "retry_on_timeout": True,
        "db": 2,
    },

    # Батчинг для масових операцій
    task_max_retries=3,
    task_default_retry_delay=60,
    task_soft_time_limit=300,  # 5 хвилин
    task_time_limit=600,  # 10 хвилин (hard limit)

    # Черги для різних типів задач (пріоритизовані)
    task_routes={
        "app.workers.tasks.osint_analysis_task": {
            "queue": "osint",
            "priority": 8,
        },
        "app.workers.tasks.self_healing_check": {
            "queue": "healing",
            "priority": 9,  # Найвищий пріоритет
        },
        "app.workers.tasks.generate_report_task": {
            "queue": "reports",
            "priority": 5,
        },
        "app.workers.tasks.auto_train_model_task": {
            "queue": "training",
            "priority": 3,  # Низький пріоритет для довгих операцій
        },
        "app.workers.tasks.data_quality_analysis_task": {
            "queue": "quality",
            "priority": 6,
        },
        "app.workers.tasks.batch_*": {
            "queue": "batch",
            "priority": 2,
        },
    },

    # Налаштування воркерів (оптимізовані)
    worker_prefetch_multiplier=4,  # Дозволити воркеру брати більше задач одночасно
    task_acks_late=True,  # Підтвердження після виконання
    worker_max_tasks_per_child=1000,  # Збільшено для 64-бітних систем
    worker_disable_rate_limits=False,
    worker_request_timeout=300,
    worker_pool="solo",  # Для локальної розробки можна змінити на "prefork" для production

    # Моніторинг (вкл. метрики)
    worker_send_task_events=True,
    task_send_sent_event=True,
    worker_log_format="[%(levelname)s/%(processName)s] %(message)s",
    worker_task_log_format="[%(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s",

    # Комунікація
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    broker_heartbeat=30,
    broker_pool_limit=10,

    # Безпека
    worker_hijack_root_logger=False,
    worker_log_color=False,
    security_key=os.getenv("CELERY_SECURITY_KEY", ""),
)

# Конфігурація черг з пріоритизацією
celery_app.conf.task_default_queue = "default"
celery_app.conf.task_queues = (
    Queue("default", routing_key="default", priority=5),
    Queue("osint", routing_key="osint", priority=8),
    Queue("healing", routing_key="healing", priority=9),
    Queue("reports", routing_key="reports", priority=5),
    Queue("training", routing_key="training", priority=3),
    Queue("quality", routing_key="quality", priority=6),
    Queue("batch", routing_key="batch", priority=2),
)

# Періодичні задачі (Celery Beat) з оптимізаціями
celery_app.conf.beat_schedule = {
    # Self-Healing перевірки кожні 5 хвилин (найвищий пріоритет)
    "self-healing-check": {
        "task": "app.workers.tasks.self_healing_check",
        "schedule": 300.0,  # 5 хвилин
        "options": {
            "priority": 9,
            "queue": "healing",
        },
    },
    # Очистка старих результатів щогодини (batch операція)
    "cleanup-results": {
        "task": "app.workers.tasks.cleanup_old_results",
        "schedule": 3600.0,  # 1 година
        "options": {
            "priority": 1,
            "queue": "batch",
        },
    },
    # Перевірка якості моделей щодня
    "model-quality-check": {
        "task": "app.workers.tasks.auto_train_model_task",
        "schedule": 86400.0,  # 24 години (запускається вночі)
        "args": ["baseline_model", "default_dataset", {}],
        "options": {
            "priority": 3,
            "queue": "training",
        },
    },
    # Аналіз даних кожні 4 години (батчована)
    "data-quality-analysis": {
        "task": "app.workers.tasks.data_quality_analysis_task",
        "schedule": 14400.0,  # 4 години
        "args": ["default_dataset", ["default_rules"]],
        "options": {
            "priority": 2,
            "queue": "batch",
        },
    },
}

if __name__ == "__main__":
    celery_app.start()
