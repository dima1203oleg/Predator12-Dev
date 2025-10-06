# Connection pool settings
MAX_CONNECTIONS = 200  # Increased from 100
KEEPALIVE_TIMEOUT = 75  # Seconds
RETRY_ATTEMPTS = 2

from aiohttp import ExponentialRetry


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
