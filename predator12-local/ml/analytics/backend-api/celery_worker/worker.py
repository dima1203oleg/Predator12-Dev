import os
import logging
from celery import Celery
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Configure Celery
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app = Celery(
    "predator_worker",
    broker=redis_url,
    backend=redis_url,
    include=["tasks.analytics", "tasks.etl", "tasks.notifications", "tasks.autoheal"]
)

# Configure Celery settings
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_track_started=True,
    worker_max_tasks_per_child=200,
    broker_connection_retry_on_startup=True,
    broker_connection_max_retries=10,
)

# Configure task routes
app.conf.task_routes = {
    "tasks.analytics.*": {"queue": "analytics"},
    "tasks.etl.*": {"queue": "etl"},
    "tasks.notifications.*": {"queue": "notifications"},
    "tasks.autoheal.*": {"queue": "autoheal"},
}

# Configure periodic tasks
app.conf.beat_schedule = {
    "run-system-health-check": {
        "task": "tasks.autoheal.check_system_health",
        "schedule": 60.0,  # every minute
    },
    "cleanup-old-data": {
        "task": "tasks.etl.cleanup_old_data",
        "schedule": 86400.0,  # every day
    },
    "update-analytics-models": {
        "task": "tasks.analytics.update_models",
        "schedule": 3600.0,  # every hour
    },
}

# Add OpenTelemetry instrumentation if enabled
if os.getenv("ENABLE_TELEMETRY", "false").lower() == "true":
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
    from opentelemetry.instrumentation.celery import CeleryInstrumentor
    
    # Setup OpenTelemetry
    tracer_provider = TracerProvider()
    processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=os.getenv("OTLP_ENDPOINT", "tempo:4317")))
    tracer_provider.add_span_processor(processor)
    trace.set_tracer_provider(tracer_provider)
    
    # Instrument Celery
    CeleryInstrumentor().instrument()
    logger.info("OpenTelemetry instrumentation enabled for Celery")

if __name__ == "__main__":
    app.start()
