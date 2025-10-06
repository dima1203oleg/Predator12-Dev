"""
Granular Rate Limiting by Endpoint/User
"""
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from typing import Optional
import redis
import time

class RateLimiter:
    """Redis-backed rate limiting"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        
    async def check_limit(
        self,
        request: Request,
        user_id: Optional[str] = None,
        limit: int = 10,
        window: int = 60
    ) -> bool:
        """Check if request exceeds rate limit"""
        key = f"rate_limit:{request.url.path}:{user_id or request.client.host}"
        
        # Use Redis transactions
        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, window)
        count, _ = pipe.execute()
        
        if count > limit:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded: {limit} requests per {window} seconds"
            )
        return True

# Default limits per endpoint
DEFAULT_LIMITS = {
    "/api/search": {"limit": 30, "window": 60},
    "/api/admin": {"limit": 5, "window": 60}
}

# Dependency for FastAPI
async def rate_limit(
    request: Request,
    user: Optional[str] = None,
    redis: redis.Redis = Depends(get_redis)
):
    """Apply configured rate limits"""
    config = DEFAULT_LIMITS.get(request.url.path, {"limit": 10, "window": 60})
    limiter = RateLimiter(redis)
    await limiter.check_limit(
        request=request,
        user_id=user,
        limit=config["limit"],
        window=config["window"]
    )
