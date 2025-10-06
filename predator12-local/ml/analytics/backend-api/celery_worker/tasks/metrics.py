from prometheus_client import Counter, Histogram

# Prometheus metrics for Celery tasks
celery_tasks_total = Counter(
    'celery_tasks_total',
    'Total number of Celery tasks processed',
    ['task_name', 'status']
)
celery_task_duration_seconds = Histogram(
    'celery_task_duration_seconds',
    'Duration of Celery task execution',
    ['task_name']
)


def track_task_metrics(task_name, status, duration):
    """
    Track metrics for a Celery task.
    
    Args:
        task_name (str): Name of the task.
        status (str): Status of the task execution ('success' or 'failure').
        duration (float): Duration of task execution in seconds.
    """
    celery_tasks_total.labels(task_name=task_name, status=status).inc()
    celery_task_duration_seconds.labels(task_name=task_name).observe(duration) 