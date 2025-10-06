#!/usr/bin/env python3
"""
Celery конфігурація для Predator11 Multi-Agent System
Підтримує фонові задачі агентів та асинхронну обробку
"""

from celery import Celery
from kombu import Queue
import os

# Налаштування Redis з паролем
redis_url = os.getenv('CELERY_BROKER_URL', os.getenv('REDIS_URL', 'redis://:secure_redis_password@redis:6379/1'))
result_backend = os.getenv('CELERY_RESULT_BACKEND', 'redis://:secure_redis_password@redis:6379/2')

# Створення Celery застосунку
celery_app = Celery(
    'predator11-agents',
    broker=redis_url,
    backend=result_backend,
    include=[
        'app.workers.tasks',
    ]
)

# Конфігурація Celery
celery_app.conf.update(
    # Часові зони
    timezone='UTC',
    enable_utc=True,

    # Серіалізація
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',

    # Результати
    result_expires=3600,
    result_cache_max=10000,

    # Черги для різних типів задач
    task_routes={
        'app.workers.tasks.osint_analysis_task': {'queue': 'osint'},
        'app.workers.tasks.self_healing_check': {'queue': 'healing'},
        'app.workers.tasks.generate_report_task': {'queue': 'reports'},
        'app.workers.tasks.auto_train_model_task': {'queue': 'training'},
        'app.workers.tasks.data_quality_analysis_task': {'queue': 'quality'},
    },

    # Налаштування воркерів
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=100,

    # Моніторинг
    worker_send_task_events=True,
    task_send_sent_event=True,

    # Безпека
    worker_hijack_root_logger=False,
    worker_log_color=False,
)

# Конфігурація черг
celery_app.conf.task_default_queue = 'default'
celery_app.conf.task_queues = (
    Queue('default', routing_key='default'),
    Queue('osint', routing_key='osint'),
    Queue('healing', routing_key='healing'),
    Queue('reports', routing_key='reports'),
    Queue('training', routing_key='training'),
    Queue('quality', routing_key='quality'),
)

# Періодичні задачі (Celery Beat)
celery_app.conf.beat_schedule = {
    # Self-Healing перевірки кожні 5 хвилин
    'self-healing-check': {
        'task': 'app.workers.tasks.self_healing_check',
        'schedule': 300.0,  # 5 хвилин
    },

    # Очистка старих результатів щогодини
    'cleanup-results': {
        'task': 'app.workers.tasks.cleanup_old_results',
        'schedule': 3600.0,  # 1 година
    },

    # Перевірка якості моделей щодня
    'model-quality-check': {
        'task': 'app.workers.tasks.auto_train_model_task',
        'schedule': 86400.0,  # 24 години
        'args': ['baseline_model', 'default_dataset', {}]
    },

    # Аналіз даних кожні 4 години
    'data-quality-analysis': {
        'task': 'app.workers.tasks.data_quality_analysis_task',
        'schedule': 14400.0,  # 4 години
        'args': ['default_dataset', ['default_rules']]
    },
}

if __name__ == '__main__':
    celery_app.start()
