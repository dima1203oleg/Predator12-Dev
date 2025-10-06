"""
Adaptive Rate Limiting
"""
from typing import Optional
import redis
import time
from prometheus_client import Gauge

# Metrics
LOAD_FACTOR = Gauge('system_load_factor', 'Current system load factor')

class AdaptiveRateLimiter:
    """Limits that adjust based on system load"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.base_limits = {
            'high': 10,   # Requests per minute
            'medium': 30,
            'low': 60
        }
    
    async def get_current_limit(self, user_tier: str) -> int:
        """Calculate dynamic limit based on:
        - User tier
        - System load
        - Historical behavior
        """
        # Get current load (0-1 scale)
        load = LOAD_FACTOR.get() or 0
        
        # Base limit by tier
        limit = self.base_limits[user_tier]
        
        # Adjust for load
        if load > 0.8:   # High load
            limit = max(5, limit * 0.5)
        elif load > 0.5: # Moderate load
            limit = max(10, limit * 0.8)
            
        return int(limit)
    
    async def check_request(self, 
                          user_id: str, 
                          user_tier: str,
                          endpoint: str) -> bool:
        """Check if request is allowed"""
        # Get dynamic limit
        limit = await self.get_current_limit(user_tier)
        
        # Redis key (user + endpoint specific)
        key = f"adaptive_limit:{user_id}:{endpoint}"
        
        # Atomic counter
        pipe = self.redis.pipeline()
        pipe.incr(key)
        pipe.expire(key, 60)
        count, _ = pipe.execute()
        
        return count <= limit
