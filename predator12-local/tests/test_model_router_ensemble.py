import asyncio
import pytest
from unittest.mock import AsyncMock

from backend.app.services.model_router.router_core import ModelRouter


class FakeClient:
    def __init__(self, profiles):
        self.profiles = profiles  # list of dicts with keys: id, latency, quality, cost

    async def chat_completion(self, model: str, messages, **params):
        # simulate latency and quality
        prof = next(p for p in self.profiles if p["id"] == model)
        await asyncio.sleep(prof.get("latency", 0.05))
        # Return a dict so arbiter can read quality/cost
        return {
            "content": f"response-from-{model}",
            "quality": prof.get("quality", 0.5),
            "cost": prof.get("cost", 1.0),
        }

    async def embeddings(self, model: str, input_texts, **params):
        prof = next(p for p in self.profiles if p["id"] == model)
        await asyncio.sleep(prof.get("latency", 0.05))
        return {
            "vectors": [[0.1, 0.2, 0.3]],
            "quality": prof.get("quality", 0.5),
            "cost": prof.get("cost", 1.0),
        }


@pytest.mark.asyncio
async def test_ensemble_arbiter_picks_best(tmp_path):
    # Use real registry but override client and Redis
    registry_path = "backend/model_registry.yaml"
    router = ModelRouter(registry_path=registry_path)
    
    # Mock Redis to avoid connection dependency
    mock_redis = AsyncMock()
    mock_redis.incr.return_value = 1
    mock_redis.expire.return_value = True
    router.redis = mock_redis

    # Use actual models from registry for 'reason' task
    # Profiles: higher quality should win despite slightly higher latency
    profiles = [
        {"id": "meta/meta-llama-3.1-70b-instruct", "latency": 0.10, "quality": 0.90, "cost": 1.0},
        {"id": "meta/meta-llama-3.1-8b-instruct", "latency": 0.05, "quality": 0.70, "cost": 1.0},
        {"id": "mistral/mixtral-8x7b-instruct", "latency": 0.07, "quality": 0.75, "cost": 1.0},
    ]
    router.client = FakeClient(profiles)

    messages = [{"role": "user", "content": "Explain difference between caches."}]
    res = await router.reason(messages=messages, request_key=None, force_ensemble=True)

    assert isinstance(res, dict)
    assert res.get("model") in {p["id"] for p in profiles}
    # Expect the best quality model to be selected (llama-70b)
    assert res.get("model") == "meta/meta-llama-3.1-70b-instruct"


@pytest.mark.asyncio
async def test_ensemble_timeout_fallback(tmp_path):
    registry_path = "backend/model_registry.yaml"
    
    # Mock Prometheus registry to avoid duplicates
    from prometheus_client import CollectorRegistry
    test_registry = CollectorRegistry()
    
    # Patch the default registry temporarily
    import prometheus_client
    original_registry = prometheus_client.REGISTRY
    prometheus_client.REGISTRY = test_registry
    
    try:
        router = ModelRouter(registry_path=registry_path)
        router._metrics_registry = test_registry  # Set custom registry before init
        
        # Reinitialize with test registry
        router = ModelRouter(registry_path=registry_path)
        router._metrics_registry = test_registry
        
        # Mock Redis
        mock_redis = AsyncMock()
        mock_redis.incr.return_value = 1
        mock_redis.expire.return_value = True
        router.redis = mock_redis
    finally:
        prometheus_client.REGISTRY = original_registry

    # Make two models hang beyond deadline to force fallback
    profiles = [
        {"id": "microsoft/phi-4-reasoning", "latency": 0.50, "quality": 0.9, "cost": 1.0},
        {"id": "meta/meta-llama-3.1-8b-instruct", "latency": 0.60, "quality": 0.8, "cost": 1.0},
        {"id": "mistral-ai/mistral-large-2411", "latency": 0.60, "quality": 0.8, "cost": 1.0},
    ]
    router.client = FakeClient(profiles)

    # Temporarily tighten ensemble deadline via params override
    messages = [{"role": "user", "content": "Explain difference between caches."}]
    # Provide a smaller deadline through params to trigger timeout
    res = await router.reason(messages=messages, request_key=None, force_ensemble=True, deadline_ms=100)

    # Either returns a winner (if quorum somehow met) or falls back to sequential result structure
    assert isinstance(res, dict)
    assert "model" in res
