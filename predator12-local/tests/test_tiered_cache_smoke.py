import asyncio
import time
import pickle
import pytest

from observability.tiered_cache import TieredCache


class FakeRedis:
    def __init__(self):
        self.store = {}
        self.expire_at = {}

    def get(self, key: str):
        now = time.time()
        exp = self.expire_at.get(key)
        if exp is not None and now >= exp:
            # expired
            self.store.pop(key, None)
            self.expire_at.pop(key, None)
            return None
        return self.store.get(key)

    def setex(self, key: str, ttl: int, value: bytes):
        self.store[key] = value
        self.expire_at[key] = time.time() + ttl
        return True


@pytest.mark.asyncio
async def test_cache_hit_memory_and_redis_paths():
    fake = FakeRedis()
    cache = TieredCache(redis_client=fake, memory_ttl=1, redis_ttl=5, max_memory_items=100)

    calls = {"n": 0}

    @cache.cached
    async def compute(x):
        calls["n"] += 1
        await asyncio.sleep(0)  # yield
        return {"val": x * 2}

    # First call: miss -> compute -> store in both caches
    r1 = await compute(10)
    assert r1 == {"val": 20}
    assert calls["n"] == 1

    # Second call soon after: should hit memory (no extra compute)
    r2 = await compute(10)
    assert r2 == {"val": 20}
    assert calls["n"] == 1

    # After memory TTL but within redis TTL: should hit Redis (no extra compute)
    await asyncio.sleep(1.05)
    r3 = await compute(10)
    assert r3 == {"val": 20}
    assert calls["n"] == 1  # still no recompute

    # After redis TTL: should recompute
    await asyncio.sleep(4.1)
    r4 = await compute(10)
    assert r4 == {"val": 20}
    assert calls["n"] == 2


@pytest.mark.asyncio
async def test_lru_eviction_and_redis_backfill():
    fake = FakeRedis()
    cache = TieredCache(redis_client=fake, memory_ttl=5, redis_ttl=10, max_memory_items=1)

    calls = {"a": 0, "b": 0}

    @cache.cached
    async def func_a(x):
        calls["a"] += 1
        return {"a": x}

    @cache.cached
    async def func_b(y):
        calls["b"] += 1
        return {"b": y}

    # First: compute and cache A
    ra1 = await func_a(1)
    assert ra1 == {"a": 1}
    assert calls["a"] == 1

    # Second: compute and cache B -> should evict A from memory (max 1)
    rb1 = await func_b(2)
    assert rb1 == {"b": 2}
    assert calls["b"] == 1

    # Now call A again: memory miss due to eviction, but should hit Redis (no recompute)
    ra2 = await func_a(1)
    assert ra2 == {"a": 1}
    assert calls["a"] == 1  # still 1, proves Redis served it
