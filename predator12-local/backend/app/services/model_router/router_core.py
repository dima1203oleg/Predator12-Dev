from __future__ import annotations

import asyncio
import os
import time
from dataclasses import dataclass
from typing import Any

import yaml
import httpx
from redis import asyncio as aioredis
from prometheus_client import Counter

from .client import ModelSDKClient


@dataclass
class ModelEntry:
    id: str
    task: str
    primary: bool = False
    fallback: bool = False
    type: Optional[str] = None  # e.g., "embedding"
    free: bool = False  # Whether model is free/open source

class ModelRegistry:
    def __init__(self, path: str):
        self.path = path
        self.routing_weights: Dict[str, float] = {"cost": 0.3, "latency": 0.3, "quality": 0.4}
        self.defaults: Dict[str, int] = {"timeout_seconds": 300, "cache_ttl_seconds": 60}
        self.limits: Dict[str, Dict[str, int]] = {}
        self.backoff: Dict[str, int | str] = {
            "strategy": "exponential", "base_seconds": 1, 
            "max_seconds": 30, "max_retries": 3
        }
        self.cache_cfg: Dict[str, Any] = {
            "enabled": True, "ttl_seconds": 120, 
            "idempotency_key": "request_key"
        }
        self.task_overrides: Dict[str, Dict[str, Any]] = {}
        self.pii_editor: Dict[str, Any] = {"enabled": False, "mode": "redact"}
        # Arbiter configuration (content heuristics)
        self.arbiter_cfg: Dict[str, Any] = {
            "target_len": 300,
            "keywords": {},  # per-task keywords list
            "keyword_weight": 0.2,
            "length_weight": 0.2,
            "safety_penalty": 0.2,
        }
        #ensemble/quorum and policies
        self.ensemble_cfg: Dict[str, Any] = {
            "enabled": False,
            "tasks": {},  # per-task overrides: enabled, candidates, quorum, deadline_ms
            "default_candidates": 3,
            "default_quorum": 2,
            "default_deadline_ms": 8000,
        }
        self.critical: Dict[str, Any] = {
            "paths": [],  # optional list of critical endpoint paths
            "tasks": [],  # task names considered critical by default
        }
        # Canary experiments for non-critical tasks (shadow traffic)
        self.canary: Dict[str, Any] = {
            "enabled": False,
            "tasks": {},  # per-task: enabled, sample_rate (0..1), candidate_index (fallback index)
            "default_sample_rate": 0.1,
            "default_candidate_index": 0,
        }
        self.models: List[ModelEntry] = []
        self._load()

    def _load(self) -> None:
        with open(self.path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        routing = data.get("routing", {})
        self.routing_weights = routing.get("weights", self.routing_weights)
        self.defaults.update(routing.get("defaults", {}))
        self.models = [ModelEntry(**m) for m in data.get("models", [])]
        self.limits = data.get("limits", {})
        self.backoff = data.get("backoff", self.backoff)
        self.cache_cfg = data.get("cache", self.cache_cfg)
        self.task_overrides = data.get("task_overrides", {})
        self.pii_editor = data.get("pii_editor", self.pii_editor)
        self.arbiter_cfg = data.get("arbiter", self.arbiter_cfg)
        self.ensemble_cfg = data.get("ensemble", self.ensemble_cfg)
        self.critical = data.get("critical", self.critical)
        self.canary = data.get("canary", self.canary)

    def get_primary_and_fallback(self, task: str) -> Tuple[Optional[ModelEntry], List[ModelEntry]]:
        primary: Optional[ModelEntry] = None
        fallbacks: List[ModelEntry] = []
        for m in self.models:
            if m.task == task:
                if m.primary and primary is None:
                    primary = m
                elif m.fallback:
                    fallbacks.append(m)
        return primary, fallbacks


class SimpleRateLimiter:
    def __init__(self, redis: aioredis.Redis, rps: int = 5, rpm: int | None = None):
        self.redis = redis
        self.rps = rps
        self.rpm = rpm

    async def allow(self, key: str) -> bool:
        bucket = int(time.time())
        k = f"ratelimit:{key}:{bucket}"
        n = await self.redis.incr(k)
        if n == 1:
            await self.redis.expire(k, 2)
        if n > self.rps:
            return False
        # Optional per-minute limiter
        if self.rpm:
            minute = int(time.time() // 60)
            km = f"ratelimitm:{key}:{minute}"
            nm = await self.redis.incr(km)
            if nm == 1:
                await self.redis.expire(km, 65)
            if nm > self.rpm:
                return False
        return True


class ModelRouter:
    def __init__(
        self,
        registry_path: str,
        sdk_client: Optional[ModelSDKClient] = None,
        redis_url: Optional[str] = None,
    ):
        self.registry = ModelRegistry(registry_path)
        self.client = sdk_client or ModelSDKClient(
            base_url=os.getenv("MODEL_SDK_BASE_URL"), api_key=os.getenv("MODEL_SDK_KEY"), timeout=float(self.registry.defaults.get("timeout_seconds", 300))
        )
        self.redis = aioredis.from_url(redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0"), encoding=None, decode_responses=False)
        self.rate_limiter = SimpleRateLimiter(
            self.redis,
            rpm=int(os.getenv("MODEL_ROUTER_RPM", "600")),
        )
        self.cache_ttl = int(self.registry.cache_cfg.get("ttl_seconds", self.registry.defaults.get("cache_ttl_seconds", 60)))
        self.idempotency_key_name = self.registry.cache_cfg.get("idempotency_key", "request_key")

        # Prometheus metrics (use custom registry in tests)
        registry = getattr(self, '_metrics_registry', None)
        self.req_ctr = Counter(
            "model_router_requests_total",
            "Total model router requests",
            labelnames=["task", "model", "status"],
            registry=registry
        )
        self.retry_ctr = Counter(
            "model_router_retries_total",
            "Retries during model routing",
            labelnames=["task", "model"],
            registry=registry
        )
        self.fallback_ctr = Counter(
            "model_router_fallbacks_total",
            "Fallback occurrences between models",
            labelnames=["task", "from_model", "to_model"],
            registry=registry
        )
        self.ensemble_runs = Counter(
            "model_router_ensemble_runs_total",
            "Ensemble runs executed",
            labelnames=["task"],
            registry=registry
        )
        self.ensemble_winner = Counter(
            "model_router_ensemble_winner_total",
            "Winners selected by arbiter",
            labelnames=["task", "model"],
            registry=registry
        )
        self.ensemble_timeouts = Counter(
            "model_router_ensemble_timeouts_total",
            "Timeouts within ensemble parallel calls",
            labelnames=["task"],
            registry=registry
        )
        # Canary metrics
        self.canary_runs = Counter(
            "model_router_canary_runs_total",
            "Canary shadow runs executed",
            labelnames=["task"],
            registry=registry
        )
        self.canary_wins = Counter(
            "model_router_canary_wins_total",
            "Canary beats primary (would have been better)",
            labelnames=["task", "model"],
            registry=registry
        )
        self.canary_errors = Counter(
            "model_router_canary_errors_total",
            "Canary shadow errors",
            labelnames=["task"],
            registry=registry
        )

    async def _cache_get(self, key: str) -> Optional[dict]:
        data = await self.redis.get(key)
        if data is None:
            return None
        import json

        try:
            return json.loads(data)
        except Exception:
            return None

    async def _cache_set(self, key: str, value: dict, ttl: int) -> None:
        import json

        await self.redis.set(key, json.dumps(value), ex=ttl)

    async def _call_with_fallbacks(self, task: str, payload: dict, request_key: Optional[str] = None) -> dict:
        primary, fallbacks = self.registry.get_primary_and_fallback(task)
        candidates: List[ModelEntry] = [m for m in [primary] if m] + fallbacks
        last_err: Optional[Exception] = None

        # Cache key respects idempotency if provided
        cache_key = None
        if request_key:
            cache_key = f"mdlcache:{task}:{request_key}"
            cached = await self._cache_get(cache_key)
            if cached:
                return {"from_cache": True, **cached}

        # Simple rate-limit per task
        # Per-task limit overrides from registry (rpm)
        task_limits = self.registry.limits.get(task, {})
        if task_limits:
            # Temporarily construct a per-call limiter instance honoring rpm
            limiter = SimpleRateLimiter(self.redis, rps=self.rate_limiter.rps, rpm=int(task_limits.get("rpm", self.rate_limiter.rpm or 0)) or None)
            allowed = await limiter.allow(f"task:{task}")
        else:
            allowed = await self.rate_limiter.allow(f"task:{task}")
        if not allowed:
            raise httpx.HTTPError("Rate limit exceeded for model router")

        for idx, m in enumerate(candidates):
            try:
                if task in {"reason", "code", "vision", "quick"}:
                    # Expect messages in payload
                    model_id = m.id
                    params = payload.get("params", {})
                    # Apply task overrides (e.g., timeout) if present
                    params = {**params, **self.registry.task_overrides.get(task, {})}
                    resp = await self.client.chat_completion(model=model_id, messages=payload["messages"], **params)
                    result = {"model": model_id, "response": resp}
                elif task == "embed":
                    model_id = m.id
                    params = payload.get("params", {})
                    params = {**params, **self.registry.task_overrides.get(task, {})}
                    resp = await self.client.embeddings(model=model_id, input_texts=payload["input"], **params)
                    result = {"model": model_id, "response": resp}
                else:
                    raise ValueError(f"Unsupported task: {task}")

                # Optional PII post-processing (very light stub)
                if self.registry.pii_editor.get("enabled") and self.registry.pii_editor.get("mode") in {"redact", "mask"}:
                    result = self._apply_pii_policy(result)

                # Cache success if request_key present
                if cache_key:
                    await self._cache_set(cache_key, result, self.cache_ttl)
                # Metrics success
                self.req_ctr.labels(task=task, model=model_id, status="success").inc()
                return result
            except Exception as e:  # retry/backoff + proceed to next
                last_err = e
                # Metrics failure attempt
                try:
                    self.req_ctr.labels(task=task, model=m.id, status="failure").inc()
                except Exception:
                    pass
                # Backoff per registry
                strat = str(self.registry.backoff.get("strategy", "exponential"))
                base = int(self.registry.backoff.get("base_seconds", 1))
                maxs = int(self.registry.backoff.get("max_seconds", 30))
                retries = int(self.registry.backoff.get("max_retries", 3))
                if idx >= retries:
                    continue
                if strat == "linear":
                    delay = min(base * (idx + 1), maxs)
                else:  # exponential by default
                    delay = min(base * (2 ** idx), maxs)
                # Retry/fallback metrics
                try:
                    self.retry_ctr.labels(task=task, model=m.id).inc()
                    if idx + 1 < len(candidates):
                        self.fallback_ctr.labels(task=task, from_model=m.id, to_model=candidates[idx + 1].id).inc()
                except Exception:
                    pass
                await asyncio.sleep(delay)
                continue

        # If reached here, all attempts failed
        raise last_err or RuntimeError("Model routing failed with no candidates available")

    async def _call_ensemble(self, task: str, payload: dict, request_key: Optional[str] = None) -> dict:
        """Run multiple models in parallel and arbitrate the winner.
        Falls back to sequential routing if quorum not met or on full failure."""
        primary, fallbacks = self.registry.get_primary_and_fallback(task)
        base_candidates: List[ModelEntry] = [m for m in [primary] if m] + fallbacks
        if not base_candidates:
            return await self._call_with_fallbacks(task, payload, request_key)

        cfg = self.registry.ensemble_cfg or {}
        task_cfg = (cfg.get("tasks") or {}).get(task, {})
        n = int(task_cfg.get("candidates", cfg.get("default_candidates", 3)))
        quorum = int(task_cfg.get("quorum", cfg.get("default_quorum", 2)))
        deadline_ms = int(task_cfg.get("deadline_ms", cfg.get("default_deadline_ms", 8000)))
        selected = base_candidates[: max(1, n)]

        self.ensemble_runs.labels(task=task).inc()

        async def _invoke(m: ModelEntry) -> Tuple[ModelEntry, Optional[dict], Optional[Exception], float]:
            t0 = time.perf_counter()
            try:
                if task in {"reason", "code", "vision", "quick"}:
                    params = {**payload.get("params", {}), **self.registry.task_overrides.get(task, {})}
                    resp = await self.client.chat_completion(model=m.id, messages=payload["messages"], **params)
                elif task == "embed":
                    params = {**payload.get("params", {}), **self.registry.task_overrides.get(task, {})}
                    resp = await self.client.embeddings(model=m.id, input_texts=payload["input"], **params)
                else:
                    raise ValueError(f"Unsupported task: {task}")
                lat = time.perf_counter() - t0
                # Success metric
                self.req_ctr.labels(task=task, model=m.id, status="success").inc()
                return m, {"model": m.id, "response": resp, "metrics": {"latency": lat, "quality": resp.get("quality", 0.5) if isinstance(resp, dict) else 0.5, "cost": resp.get("cost", 1.0) if isinstance(resp, dict) else 1.0}}, None, lat
            except Exception as e:
                # Failure metric
                try:
                    self.req_ctr.labels(task=task, model=m.id, status="failure").inc()
                except Exception:
                    pass
                return m, None, e, time.perf_counter() - t0

        # Launch parallel calls with a deadline
        timeout = deadline_ms / 1000.0
        tasks = [asyncio.create_task(_invoke(m)) for m in selected]
        done, pending = await asyncio.wait(tasks, timeout=timeout, return_when=asyncio.ALL_COMPLETED)
        if pending:
            self.ensemble_timeouts.labels(task=task).inc()
            for p in pending:
                p.cancel()
        results: List[dict] = []
        errors = 0
        for d in done:
            try:
                m, res, err, lat = await d
                if err is None and res is not None:
                    results.append(res)
                else:
                    errors += 1
            except Exception:
                errors += 1

        if len(results) >= max(1, quorum):
            # Arbitrate winner
            arb = await self.arbiter(results)
            winner = arb.get("winner") or {}
            mid = winner.get("model", "unknown")
            try:
                self.ensemble_winner.labels(task=task, model=mid).inc()
            except Exception:
                pass
            # Optionally cache by idempotency key
            if request_key:
                await self._cache_set(f"mdlcache:{task}:{request_key}", winner, self.cache_ttl)
            return winner
        # Not enough successes: fall back to sequential
        return await self._call_with_fallbacks(task, payload, request_key)

    # Public API used by FastAPI routes
    async def reason(self, messages: List[dict], request_key: Optional[str] = None, **params) -> dict:
        if self._ensemble_enabled("reason", params):
            return await self._call_ensemble("reason", {"messages": messages, "params": params}, request_key)
        return await self._call_with_fallbacks("reason", {"messages": messages, "params": params}, request_key)

    async def code(self, messages: List[dict], request_key: Optional[str] = None, **params) -> dict:
        if self._ensemble_enabled("code", params):
            return await self._call_ensemble("code", {"messages": messages, "params": params}, request_key)
        return await self._call_with_fallbacks("code", {"messages": messages, "params": params}, request_key)

    async def quick(self, messages: List[dict], request_key: Optional[str] = None, **params) -> dict:
        # Primary visible result
        if self._ensemble_enabled("quick", params):
            visible = await self._call_ensemble("quick", {"messages": messages, "params": params}, request_key)
        else:
            visible = await self._call_with_fallbacks("quick", {"messages": messages, "params": params}, request_key)

        # Shadow canary (does not affect user-visible result)
        try:
            if self._canary_enabled("quick", params):
                self.canary_runs.labels(task="quick").inc()
                # Select canary candidate: take N-th fallback or next after primary
                primary, fallbacks = self.registry.get_primary_and_fallback("quick")
                all_candidates: List[ModelEntry] = [m for m in [primary] if m] + fallbacks
                if len(all_candidates) >= 2:
                    cidx = self._canary_index("quick", params)
                    cidx = max(1, min(len(all_candidates) - 1, cidx + 1))  # skip primary index 0
                    canary_model = all_candidates[cidx]

                    async def _run_canary() -> None:
                        try:
                            t0 = time.perf_counter()
                            resp = await self.client.chat_completion(
                                model=canary_model.id, messages=messages, **(params or {})
                            )
                            lat = time.perf_counter() - t0
                            # Compare simple heuristic with visible
                            # If canary has explicit quality, compare; else use latency as tiebreaker
                            canary_quality = resp.get("quality", 0.5) if isinstance(resp, dict) else 0.5
                            vis_quality = 0.5
                            vresp = visible.get("response") if isinstance(visible, dict) else None
                            if isinstance(vresp, dict):
                                vis_quality = vresp.get("quality", vis_quality)
                            better = canary_quality > vis_quality
                            if better:
                                self.canary_wins.labels(task="quick", model=canary_model.id).inc()
                        except Exception:
                            self.canary_errors.labels(task="quick").inc()

                    import random

                    sample_rate = float(params.get("canary_sample_rate", self._canary_sample_rate("quick")))
                    if random.random() < sample_rate:
                        asyncio.create_task(_run_canary())
        except Exception:
            # Never impact the visible path
            pass
        return visible

    async def vision(self, messages: List[dict], request_key: Optional[str] = None, **params) -> dict:
        if self._ensemble_enabled("vision", params):
            return await self._call_ensemble("vision", {"messages": messages, "params": params}, request_key)
        return await self._call_with_fallbacks("vision", {"messages": messages, "params": params}, request_key)

    async def embed(self, inputs: List[str], request_key: Optional[str] = None, **params) -> dict:
        if self._ensemble_enabled("embed", params):
            return await self._call_ensemble("embed", {"input": inputs, "params": params}, request_key)
        return await self._call_with_fallbacks("embed", {"input": inputs, "params": params}, request_key)

    def _ensemble_enabled(self, task: Dict[str, Any] | str, params: Dict[str, Any]) -> bool:
        """Decide if ensemble should be used based on registry config and per-request override.
        params may include force_ensemble=True to enable, or disable_ensemble=True to skip."""
        # tolerate calling with (task, params) or (params only) in some routes
        if isinstance(task, dict):
            # misordered usage guard
            return False
        if params.get("disable_ensemble"):
            return False
        if params.get("force_ensemble"):
            return True
        cfg = self.registry.ensemble_cfg or {}
        if not bool(cfg.get("enabled", False)):
            return False
        tasks_cfg = cfg.get("tasks") or {}
        tcfg = tasks_cfg.get(task)
        if tcfg is not None:
            return bool(tcfg.get("enabled", True))
        # Fallback: enable ensemble for tasks marked critical
        critical_tasks = set((self.registry.critical or {}).get("tasks", []) or [])
        return task in critical_tasks

    def _canary_enabled(self, task: str, params: Dict[str, Any]) -> bool:
        if params.get("disable_canary"):
            return False
        if params.get("force_canary"):
            return True
        cfg = self.registry.canary or {}
        if not bool(cfg.get("enabled", False)):
            return False
        tasks = cfg.get("tasks") or {}
        tcfg = tasks.get(task)
        if tcfg is None:
            return False
        return bool(tcfg.get("enabled", True))

    def _canary_sample_rate(self, task: str) -> float:
        cfg = self.registry.canary or {}
        tasks = cfg.get("tasks") or {}
        tcfg = tasks.get(task) or {}
        return float(tcfg.get("sample_rate", cfg.get("default_sample_rate", 0.1)))

    def _canary_index(self, task: str, params: Dict[str, Any]) -> int:
        if "canary_candidate_index" in params:
            try:
                return int(params["canary_candidate_index"])
            except Exception:
                return 0
        cfg = self.registry.canary or {}
        tasks = cfg.get("tasks") or {}
        tcfg = tasks.get(task) or {}
        return int(tcfg.get("candidate_index", cfg.get("default_candidate_index", 0)))

    async def arbiter(self, candidates: List[dict]) -> dict:
        """Arbiter picks best candidate using quality/latency/cost + content heuristics.
        Expected candidate shape: {"model": str, "metrics": {"quality", "latency", "cost"}, "response": {...}}"""
        best = None
        best_score = -1.0
        for c in candidates:
            m = c.get("model", "unknown")
            metrics = c.get("metrics", {})
            q = float(metrics.get("quality", 0.0))
            lat = float(metrics.get("latency", 0.0))
            cost = float(metrics.get("cost", 0.0))

            # Base score from registry routing weights
            base = (
                self.registry.routing_weights.get("quality", 0.4) * q
                + self.registry.routing_weights.get("latency", 0.3) * (1.0 / (1.0 + max(1e-6, lat)))
                + self.registry.routing_weights.get("cost", 0.3) * (1.0 / (1.0 + max(1e-6, cost)))
            )

            # Content heuristics
            resp = c.get("response")
            text = ""
            if isinstance(resp, dict):
                text = str(resp.get("content", ""))
            elif isinstance(resp, str):
                text = resp

            cfg = self.registry.arbiter_cfg or {}
            target_len = int(cfg.get("target_len", 300))
            kw_weight = float(cfg.get("keyword_weight", 0.2))
            len_weight = float(cfg.get("length_weight", 0.2))
            safety_pen = float(cfg.get("safety_penalty", 0.2))
            # length score in [0,1]
            l = len(text)
            length_score = 1.0 / (1.0 + abs(l - target_len) / max(1.0, target_len))
            # keyword score in [0,1]
            import re
            task_keywords = {}
            try:
                # optional per-task keywords
                task_keywords = cfg.get("keywords", {}) or {}
            except Exception:
                task_keywords = {}
            # can't infer task here reliably; approximate using presence of known keys in metrics
            # use union of all keywords if any
            kws = []
            for arr in task_keywords.values():
                if isinstance(arr, list):
                    kws.extend(arr)
            kws = list({k.lower() for k in kws})
            kw_hits = 0
            if kws and text:
                low = text.lower()
                for k in kws:
                    if k and k in low:
                        kw_hits += 1
            keyword_score = min(1.0, kw_hits / 3.0) if kws else 0.0
            # safety penalty (very naive)
            unsafe = 0
            if any(tok in text.lower() for tok in ["undefined", "<?", "<script", "\ntraceback", "error:"]):
                unsafe = 1

            score = base
            score *= (1.0 + kw_weight * keyword_score)
            score *= (1.0 + len_weight * (length_score - 0.5) * 2.0)
            if unsafe:
                score *= max(0.0, 1.0 - safety_pen)

            try:
                self.arbiter_score.labels(task="mixed", model=m).observe(max(0.0, score))
            except Exception:
                pass

            if score > best_score:
                best_score = score
                best = c

        if best is None:
            return {"winner": None, "score": -1.0}
        try:
            self.arbiter_decisions.labels(task="mixed", model=best.get("model", "unknown")).inc()
        except Exception:
            pass
        return {"winner": best, "score": best_score}

    def _apply_pii_policy(self, result: dict) -> dict:
        """Very simple PII redaction stub. Extend with proper PII tooling.
        Masks emails and phone-like numbers in string responses.
        """
        import re
        def _mask(s: str) -> str:
            s = re.sub(r"[\w\.-]+@[\w\.-]+", "[redacted-email]", s)
            s = re.sub(r"\b\+?\d[\d\s\-]{7,}\b", "[redacted-phone]", s)
            return s
        resp = result.get("response")
        if isinstance(resp, str):
            result["response"] = _mask(resp)
        elif isinstance(resp, dict):
            content = resp.get("content")
            if isinstance(content, str):
                resp["content"] = _mask(content)
                result["response"] = resp
        return result
