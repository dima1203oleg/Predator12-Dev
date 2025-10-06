from celery import Celery
import time
from .metrics import track_task_metrics

app = Celery(
    'predator_analytics', 
    broker='redis://localhost:6379/0', 
    backend='redis://localhost:6379/1'
)

app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)


@app.task(bind=True)
def process_analysis_task(self, query):
    start_time = time.time()
    try:
        # Placeholder for actual task processing logic
        result = f"Processed analysis for: {query}"
        duration = time.time() - start_time
        track_task_metrics('process_analysis_task', 'success', duration)
        return result
    except Exception as e:
        duration = time.time() - start_time
        track_task_metrics('process_analysis_task', 'failure', duration)
        raise self.retry(exc=e, countdown=60, max_retries=3)
