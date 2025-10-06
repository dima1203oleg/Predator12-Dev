import os
from opentelemetry import trace
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter


def init_tracing(service_name: str = "predator-backend"):
    endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "http://tempo:4318")
    resource = Resource(attributes={SERVICE_NAME: service_name})
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)
    exporter = OTLPSpanExporter(endpoint=f"{endpoint}/v1/traces")
    processor = BatchSpanProcessor(exporter)
    provider.add_span_processor(processor)
