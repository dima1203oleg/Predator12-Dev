#!/usr/bin/env python3
"""
Agent Routes with Rate Limiting
"""
from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

router = APIRouter()
security = HTTPBearer()

# Rate limiter setup
limiter = Limiter(
    key_func=get_remote_address, storage_uri="redis://localhost:6379", strategy="fixed-window"
)

# Rate limits (requests per minute)
RATE_LIMITS = {"default": "10/minute", "agent_status": "30/minute", "agent_command": "5/minute"}


@router.get("/agents/{agent_id}/status")
@limiter.limit(RATE_LIMITS["agent_status"])
async def get_agent_status(request: Request, agent_id: str, token: str = Depends(security)):
    """Get agent status with rate limiting"""
    # Implementation here


@router.post("/agents/{agent_id}/command")
@limiter.limit(RATE_LIMITS["agent_command"])
async def send_agent_command(
    request: Request, agent_id: str, command: dict, token: str = Depends(security)
):
    """Send command to agent with rate limiting"""
    # Implementation here


# Error handler for rate limits
@router.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"},
        headers={"Retry-After": str(exc.retry_after)},
    )
