"""
OpenTelemetry Instrumentation для Predator12 Backend
Централізована інструментація для всіх компонентів
"""

import os
from typing import Optional

from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

# Instrumentations
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor


class TelemetryConfig:
    """Конфігурація для OpenTelemetry"""

    def __init__(self):
        self.jaeger_host = os.getenv("JAEGER_HOST", "localhost")
        self.jaeger_port = int(os.getenv("JAEGER_PORT", 6831))
        self.tempo_endpoint = os.getenv("TEMPO_ENDPOINT", "http://localhost:4317")
        self.prometheus_port = int(os.getenv("PROMETHEUS_PORT", 8000))
        self.enabled = os.getenv("TELEMETRY_ENABLED", "true").lower() == "true"

    def setup_traces(self) -> TracerProvider:
        """Налаштувати трейсинг"""
        if not self.enabled:
            return TracerProvider()

        # Джерело даних для трейсинга
        jaeger_exporter = JaegerExporter(
            agent_host_name=self.jaeger_host,
            agent_port=self.jaeger_port,
        )

        # OTLP exporter для Tempo
        otlp_exporter = OTLPSpanExporter(endpoint=self.tempo_endpoint, insecure=True)

        # TracerProvider
        trace_provider = TracerProvider()
        trace_provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
        trace_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

        trace.set_tracer_provider(trace_provider)

        return trace_provider

    def setup_metrics(self) -> MeterProvider:
        """Налаштувати метрики"""
        if not self.enabled:
            return MeterProvider()

        # OTLP metric exporter
        otlp_metric_exporter = OTLPMetricExporter(
            endpoint=self.tempo_endpoint, insecure=True
        )

        # MeterProvider
        metric_provider = MeterProvider(
            metric_readers=[PeriodicExportingMetricReader(otlp_metric_exporter)]
        )

        metrics.set_meter_provider(metric_provider)

        return metric_provider

    def instrument_fastapi(self, app):
        """Інструментувати FastAPI додаток"""
        if not self.enabled:
            return

        FastAPIInstrumentor.instrument_app(
            app,
            root_span_name="fastapi-server",
            skip_paths=["/metrics", "/health", "/healthz"],
        )

    def instrument_all(self):
        """Інструментувати всі популярні бібліотеки"""
        if not self.enabled:
            return

        # HTTP інструментація
        RequestsInstrumentor().instrument()
        HTTPXClientInstrumentor().instrument()

        # Database
        SQLAlchemyInstrumentor().instrument()

        # Cache
        RedisInstrumentor().instrument()

        # Async tasks
        CeleryInstrumentor().instrument()


# Глобальна конфігурація
telemetry_config = TelemetryConfig()


def setup_telemetry(app) -> dict:
    """Встановити telemetry для додатку"""
    if not telemetry_config.enabled:
        print("⚠️  Telemetry disabled")
        return {}

    print("🔧 Setting up OpenTelemetry...")

    # Інструментація
    telemetry_config.setup_traces()
    telemetry_config.setup_metrics()
    telemetry_config.instrument_fastapi(app)
    telemetry_config.instrument_all()

    print("✅ Telemetry setup complete")

    return {
        "tracing": "enabled",
        "metrics": "enabled",
        "jaeger": f"{telemetry_config.jaeger_host}:{telemetry_config.jaeger_port}",
        "tempo": telemetry_config.tempo_endpoint,
    }


# Helper для отримання tracer
def get_tracer(name: str) -> trace.Tracer:
    """Отримати tracer для модуля"""
    return trace.get_tracer(name)


# Helper для отримання meter
def get_meter(name: str) -> metrics.Meter:
    """Отримати meter для модуля"""
    return metrics.get_meter(name)


# Приклад використання в backend коді:
"""
from observability.telemetry import get_tracer, get_meter

tracer = get_tracer(__name__)
meter = get_meter(__name__)

# Create a span
with tracer.start_as_current_span("process_agent") as span:
    span.set_attribute("agent.id", agent_id)
    # Your code here

# Create a metric
counter = meter.create_counter("requests_processed")
counter.add(1)
"""
