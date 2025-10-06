"""
Tiered Caching System (Memory + Redis)
"""
import os
import redis
import hashlib
import pickle
from functools import wraps
import time
import asyncio
from collections import OrderedDict
from prometheus_client import Counter

# Module-level Prometheus counters (singletons)
HIT_MEM_COUNTER = Counter(
    "tiered_cache_hit_memory",
    "Memory cache hits",
    labelnames=["func"],
)
HIT_REDIS_COUNTER = Counter(
    "tiered_cache_hit_redis",
    "Redis cache hits",
    labelnames=["func"],
)
MISS_COUNTER = Counter(
    "tiered_cache_miss",
    "Cache misses",
    labelnames=["func"],
)
SET_COUNTER = Counter(
    "tiered_cache_set",
    "Items stored in cache",
    labelnames=["func"],
)
EVICT_COUNTER = Counter(
    "tiered_cache_evictions",
    "LRU evictions from memory cache",
    labelnames=["func"],
)

class TieredCache:
    """Two-level caching system"""
    
    def __init__(self, redis_client: redis.Redis, memory_ttl=60, redis_ttl=300, max_memory_items: int = 1000):
        self.redis = redis_client
        # Use LRU for in-memory cache with TTL entries
        self.memory_cache: OrderedDict[str, dict] = OrderedDict()
        # Allow overriding via ENV
        self.memory_ttl = int(os.getenv("CACHE_MEMORY_TTL", memory_ttl))
        self.redis_ttl = int(os.getenv("CACHE_REDIS_TTL", redis_ttl))
        self.max_memory_items = int(os.getenv("CACHE_MAX_ITEMS", max_memory_items))
        
    def _get_cache_key(self, func, args, kwargs) -> str:
        """Generate consistent cache key"""
        key = f"{func.__module__}:{func.__name__}:{args}:{kwargs}"
        return hashlib.md5(key.encode()).hexdigest()
    
    async def _redis_get(self, key: str):
        """Non-blocking Redis GET using a thread executor."""
        return await asyncio.to_thread(self.redis.get, key)
    
    async def _redis_setex(self, key: str, ttl: int, value: bytes):
        """Non-blocking Redis SETEX using a thread executor."""
        return await asyncio.to_thread(self.redis.setex, key, ttl, value)

    def cached(self, func):
        """Decorator for cached functions"""
        # Prometheus counters with a label per wrapped function (no re-registration)
        label = f"{func.__module__}.{func.__name__}"
        hit_mem = HIT_MEM_COUNTER.labels(func=label)
        hit_redis = HIT_REDIS_COUNTER.labels(func=label)
        miss = MISS_COUNTER.labels(func=label)
        set_ctr = SET_COUNTER.labels(func=label)
        evict_ctr = EVICT_COUNTER.labels(func=label)
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = self._get_cache_key(func, args, kwargs)
            
            # Check memory cache first
            cached = self.memory_cache.get(key)
            now = time.time()
            if cached is not None and now < cached['expires']:
                # Refresh LRU order
                self.memory_cache.move_to_end(key)
                hit_mem.inc()
                return cached['value']
            
            # Then check Redis
            redis_data = await self._redis_get(key)
            if redis_data:
                value = pickle.loads(redis_data)
                # Populate memory cache
                self.memory_cache[key] = {
                    'value': value,
                    'expires': now + self.memory_ttl
                }
                self.memory_cache.move_to_end(key)
                # Enforce LRU limit
                if len(self.memory_cache) > self.max_memory_items:
                    self.memory_cache.popitem(last=False)
                    evict_ctr.inc()
                hit_redis.inc()
                return value
            
            # Execute function if not cached
            miss.inc()
            result = await func(*args, **kwargs)
            
            # Store in both caches
            await self._redis_setex(key, self.redis_ttl, pickle.dumps(result))
            self.memory_cache[key] = {
                'value': result,
                'expires': now + self.memory_ttl
            }
            self.memory_cache.move_to_end(key)
            if len(self.memory_cache) > self.max_memory_items:
                self.memory_cache.popitem(last=False)
                evict_ctr.inc()
            set_ctr.inc()
            
            return result
        return wrapper
    
    async def warm_cache(self, func, common_args: list):
        """Pre-warm cache for common queries"""
        for args in common_args:
            await func(*args)
