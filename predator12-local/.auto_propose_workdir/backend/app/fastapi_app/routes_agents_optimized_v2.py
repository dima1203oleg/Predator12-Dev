"""
Optimized Agent Routes with Enhanced Connection Pooling
"""

from contextlib import asynccontextmanager

import aiohttp
from aiohttp import ClientSession, TCPConnector
from aiohttp.retry import ExponentialRetry
from fastapi import APIRouter, Depends, HTTPException

router = APIRouter()

# Connection pool settings
MAX_CONNECTIONS = 200
KEEPALIVE_TIMEOUT = 75
RETRY_ATTEMPTS = 2
TIMEOUT = aiohttp.ClientTimeout(total=30)


@asynccontextmanager
async def get_http_session():
    """Optimized connection pool with:
    - Higher limits
    - Keepalive
    - Retry logic
    """
    connector = TCPConnector(
        limit=MAX_CONNECTIONS,
        keepalive_timeout=KEEPALIVE_TIMEOUT,
        force_close=False,
        enable_cleanup_closed=True,
        use_dns_cache=True,
    )

    retry_options = ExponentialRetry(attempts=RETRY_ATTEMPTS, start_timeout=1.0)

    session = ClientSession(connector=connector, timeout=TIMEOUT, retry_options=retry_options)

    try:
        yield session
    finally:
        await session.close()


@router.get("/agents/{agent_id}/status")
async def get_agent_status(agent_id: str, session: ClientSession = Depends(get_http_session)):
    """Get agent status with optimized connection"""
    try:
        async with session.get(f"http://agent-{agent_id}:9000/status") as resp:
            if resp.status == 200:
                return await resp.json()
            raise HTTPException(status_code=resp.status, detail=await resp.text())
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=503, detail=f"Agent connection failed: {str(e)}")
