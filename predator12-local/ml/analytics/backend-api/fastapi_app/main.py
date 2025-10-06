from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import time
import logging
from datetime import datetime
from pydantic import BaseModel
from prometheus_client import make_asgi_app
from middleware.metrics import PrometheusMiddleware

# Import local modules
from routers import analytics, auth, datasets, models, query_router
from llm_client import LLMClient

# Імпорти для Prometheus та Starlette на початку файлу
from prometheus_client import Counter, Histogram
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Predator Analytics API",
    description="API for the Predator Analytics platform, providing advanced "
                "data analysis and insights.",
    version="1.0.0",
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Prometheus middleware
app.add_middleware(PrometheusMiddleware)

# Expose Prometheus metrics endpoint
app.mount('/metrics', make_asgi_app())

# Include routers
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(datasets.router)
app.include_router(models.router)
app.include_router(query_router.router)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return {"detail": exc.detail, "status_code": exc.status_code}

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    return {"detail": "Internal server error", "status_code": 500}

# Add OpenTelemetry middleware if enabled
if os.getenv("ENABLE_TELEMETRY", "false").lower() == "true":
    from opentelemetry import trace
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor
    from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import (
        OTLPSpanExporter
    )
    
    # Setup OpenTelemetry
    tracer_provider = TracerProvider()
    endpoint = os.getenv("OTLP_ENDPOINT", "tempo:4317")
    processor = BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint))
    tracer_provider.add_span_processor(processor)
    trace.set_tracer_provider(tracer_provider)
    
    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)
    logger.info("OpenTelemetry instrumentation enabled")

# Add AutoHeal middleware if enabled
if os.getenv("ENABLE_AUTOHEAL", "false").lower() == "true":
    from middleware.autoheal import AutoHealMiddleware
    app.add_middleware(AutoHealMiddleware)
    logger.info("AutoHeal middleware enabled")

class AnalysisRequest(BaseModel):
    """Request model for analysis endpoint"""
    query: str

# Initialize the LLM client for remote inference
llm_client = LLMClient()

@app.get("/")
async def root():
    """Root endpoint returning API information"""
    return {
        "name": "Predator Analytics API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat(),
    }

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', 
                        ['method', 'endpoint', 'http_status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 
                            'HTTP request latency', ['method', 'endpoint'])

@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    resp_time = time.time() - start_time
    endpoint = request.url.path
    REQUEST_COUNT.labels(request.method, endpoint, response.status_code).inc()
    REQUEST_LATENCY.labels(request.method, endpoint).observe(resp_time)
    return response

@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/analyze")
async def analyze_data(request: AnalysisRequest):
    """
    Endpoint to analyze data using remote LLM for insights.
    """
    try:
        # Use the remote LLM client for inference
        analysis_result = await llm_client.get_analysis(request.query)
        return {"status": "success", "result": analysis_result}
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    
    # Start the server
    logger.info(f"Starting Predator Analytics API server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, workers=1, reload=reload)
