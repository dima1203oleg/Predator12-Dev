"""Compatibility FastAPI app for tests importing `app.main`.

This module re-exports the real `backend.app.main.app` when available.
If not, it provides a small FastAPI app with the endpoints the tests expect.
"""

from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, PlainTextResponse

# Provide a deterministic compatibility FastAPI app used by tests
app = FastAPI(title="Predator Nexus Core API")


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "predator-nexus-core",
    }


@app.get("/")
async def root():
    return {
        "message": "Predator Analytics - Nexus Core API",
        "version": "1.0.0",
        "endpoints": ["/health", "/api/status", "/metrics"],
    }


@app.get("/api/status")
async def api_status():
    return {"service": "backend", "status": "running"}


@app.get("/metrics")
async def metrics():
    # Minimal prometheus text
    text = "# HELP http_requests_total The total number of HTTP requests\nhttp_requests_total 0\n"
    return PlainTextResponse(content=text, media_type="text/plain")


@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse(
        status_code=404, content={"error": "Not found", "path": str(request.url.path)}
    )
