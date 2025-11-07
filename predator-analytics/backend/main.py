"""
Predator Analytics - Main FastAPI Application
"""

import logging
from contextlib import asynccontextmanager

from api.routes import agents, analytics, tasks, voice
from auth.keycloak import keycloak_health_check, get_current_user, KeycloakUser
from core.config import settings
from core.database import Base, engine
from core.monitoring import setup_monitoring
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 Starting Predator Analytics...")

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database initialized")

    # Setup monitoring
    setup_monitoring()
    logger.info("✅ Monitoring configured")

    yield

    logger.info("👋 Shutting down Predator Analytics...")


# Initialize FastAPI app
app = FastAPI(
    title="Predator Analytics API",
    description="AI-Powered Analytics Platform with Multi-Agent System",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred",
        },
    )


# Health check endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    keycloak_status = "healthy" if await keycloak_health_check() else "unhealthy"
    return {
        "status": "healthy",
        "service": "predator-analytics",
        "version": "1.0.0",
        "keycloak": keycloak_status
    }


@app.get("/ready", tags=["Health"])
async def readiness_check():
    """Readiness check endpoint"""
    keycloak_ready = await keycloak_health_check()
    # TODO: Add database and Redis connectivity checks
    return {
        "status": "ready" if keycloak_ready else "not ready",
        "checks": {
            "database": "ok",
            "redis": "ok",
            "agents": "ok",
            "keycloak": "ok" if keycloak_ready else "unavailable"
        }
    }


# Auth endpoints
@app.get("/api/v1/auth/me", tags=["Auth"])
async def get_current_user_info(user: KeycloakUser = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "sub": user.sub,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "roles": user.roles,
        "groups": user.groups,
        "email_verified": user.email_verified,
    }


# API Routes
app.include_router(agents.router, prefix="/api/v1", tags=["Agents"])
app.include_router(tasks.router, prefix="/api/v1", tags=["Tasks"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(voice.router, prefix="/api/v1", tags=["Voice"])


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Predator Analytics API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "health": "/health",
        "metrics": "/metrics",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
