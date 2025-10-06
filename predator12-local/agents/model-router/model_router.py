#!/usr/bin/env python3
"""
🚀 Model Router Agent - 58 Models Router with Fallbacks & Rate Limits
Маршрутизує запити на 58 моделей через SDK з фолбеками та лімітами
"""

import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from collections import defaultdict, deque

import redis
import aiohttp
from fastapi import FastAPI, HTTPException
import structlog

logger = structlog.get_logger(__name__)

class ModelType(Enum):
    REASONING = "reasoning"
    CODE = "code"
    EMBED = "embed"
    VISION = "vision"
    FAST = "fast"
    CREATIVE = "creative"
    STRUCTURED = "structured"

@dataclass
class ModelConfig:
    """Конфігурація моделі"""
    name: str
    provider: str
    model_type: ModelType
    max_tokens: int
    cost_per_1k: float
    rate_limit_rpm: int
    timeout: int
    priority: int  # 1=primary, 2=fallback1, 3=fallback2
    
@dataclass 
class ModelUsage:
    """Статистика використання моделі"""
    requests_count: int = 0
    total_tokens: int = 0
    avg_latency: float = 0.0
    error_rate: float = 0.0
    last_used: datetime = datetime.now()

@dataclass
class RoutingRequest:
    """Запит на маршрутизацію"""
    model_type: str
    prompt: str
    max_tokens: int = 1000
    temperature: float = 0.7
    user_id: str = "system"
    task_id: Optional[str] = None
    fallback_enabled: bool = True
    priority: str = "medium"

class RateLimiter:
    """Rate limiter для моделей"""
    
    def __init__(self):
        self.requests = defaultdict(deque)  # model_name -> deque of timestamps
        
    def can_request(self, model_name: str, rate_limit_rpm: int) -> bool:
        """Перевіряє чи можна зробити запит"""
        now = time.time()
        minute_ago = now - 60
        
        # Видаляємо старі запити
        while self.requests[model_name] and self.requests[model_name][0] < minute_ago:
            self.requests[model_name].popleft()
            
        # Перевіряємо ліміт
        if len(self.requests[model_name]) >= rate_limit_rpm:
            return False
            
        # Додаємо поточний запит
        self.requests[model_name].append(now)
        return True

class ModelRouterAgent:
    """Model Router Agent - маршрутизація на 58 моделей"""
    
    def __init__(self):
        self.app = FastAPI(title="Model Router Agent", version="1.0.0")
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
        self.rate_limiter = RateLimiter()
        
        # SDK клієнт
        self.sdk_base_url = "http://localhost:3010/v1"
        self.sdk_api_key = "changeme"
        
        # Конфігурація 58 моделей
        self.models_config = self._init_models_config()
        self.model_usage = defaultdict(ModelUsage)
        
        # Політики маршрутизації  
        self.routing_policies = self._init_routing_policies()
        
        self._setup_routes()
        
    def _init_models_config(self) -> Dict[str, ModelConfig]:
        """Ініціалізація конфігурації 58 моделей"""
        models = {}
        
        # Reasoning Models (5 моделей)
        reasoning_models = [
            ("openai/gpt-5", "openai", 200000, 0.06, 500, 1),
            ("openai/o1", "openai", 200000, 0.15, 50, 2), 
            ("deepseek/deepseek-r1", "deepseek", 65536, 0.014, 100, 3),
            ("microsoft/phi-4-reasoning", "microsoft", 16384, 0.01, 200, 4),
            ("google/gemini-2.0-flash-thinking", "google", 1000000, 0.075, 300, 5)
        ]
        
        for name, provider, max_tokens, cost, rpm, priority in reasoning_models:
            models[name] = ModelConfig(
                name=name, provider=provider, model_type=ModelType.REASONING,
                max_tokens=max_tokens, cost_per_1k=cost, rate_limit_rpm=rpm,
                timeout=60, priority=priority
            )
            
        # Code Models (8 моделей)
        code_models = [
            ("mistral-ai/codestral-2501", "mistral", 32768, 0.025, 400, 1),
            ("openai/gpt-4o", "openai", 128000, 0.025, 500, 2),
            ("microsoft/phi-4", "microsoft", 16384, 0.01, 300, 3),
            ("deepseek/deepseek-coder-v2.5", "deepseek", 65536, 0.014, 200, 4),
            ("codellama/codellama-70b-instruct", "meta", 4096, 0.008, 100, 5),
            ("anthropic/claude-3.5-sonnet", "anthropic", 200000, 0.03, 300, 6),
            ("qwen/qwq-32b-preview", "alibaba", 32768, 0.009, 150, 7),
            ("nvidia/llama-3.1-nemotron-70b-instruct", "nvidia", 131072, 0.012, 200, 8)
        ]
        
        for name, provider, max_tokens, cost, rpm, priority in code_models:
            models[name] = ModelConfig(
                name=name, provider=provider, model_type=ModelType.CODE,
                max_tokens=max_tokens, cost_per_1k=cost, rate_limit_rpm=rpm,
                timeout=30, priority=priority
            )
            
        # Embedding Models (6 моделей)
        embed_models = [
            ("cohere/cohere-embed-v3-multilingual", "cohere", 512, 0.0001, 1000, 1),
            ("openai/text-embedding-3-large", "openai", 8191, 0.00013, 3000, 2),
            ("openai/text-embedding-3-small", "openai", 8191, 0.00002, 3000, 3),
            ("jinaai/jina-embeddings-v3", "jina", 8192, 0.00002, 2000, 4),
            ("voyage-ai/voyage-3", "voyage", 32000, 0.00012, 300, 5),
            ("sentence-transformers/all-mpnet-base-v2", "huggingface", 512, 0.0001, 500, 6)
        ]
        
        for name, provider, max_tokens, cost, rpm, priority in embed_models:
            models[name] = ModelConfig(
                name=name, provider=provider, model_type=ModelType.EMBED,
                max_tokens=max_tokens, cost_per_1k=cost, rate_limit_rpm=rpm,
                timeout=10, priority=priority
            )
            
        # Vision Models (7 моделей)
        vision_models = [
            ("openai/gpt-4o", "openai", 128000, 0.025, 500, 1),
            ("microsoft/phi-4-multimodal-instruct", "microsoft", 16384, 0.01, 200, 2),
            ("anthropic/claude-3.5-sonnet", "anthropic", 200000, 0.03, 300, 3),
            ("google/gemini-2.0-flash", "google", 1000000, 0.075, 300, 4),
            ("qwen/qwen2-vl-72b-instruct", "alibaba", 32768, 0.02, 100, 5),
            ("llava/llava-v1.6-34b", "lmstudio", 4096, 0.008, 50, 6),
            ("microsoft/kosmos-2", "microsoft", 2048, 0.005, 100, 7)
        ]
        
        for name, provider, max_tokens, cost, rpm, priority in vision_models:
            models[name] = ModelConfig(
                name=name, provider=provider, model_type=ModelType.VISION,
                max_tokens=max_tokens, cost_per_1k=cost, rate_limit_rpm=rpm,
                timeout=30, priority=priority
            )
            
        # Fast Models (8 моделей)
        fast_models = [
            ("openai/gpt-4o-mini", "openai", 128000, 0.00015, 10000, 1),
            ("mistral-ai/ministral-3b", "mistral", 128000, 0.00004, 5000, 2),
            ("microsoft/phi-4-mini", "microsoft", 4096, 0.000165, 3000, 3),
            ("groq/llama-3.3-70b-versatile", "groq", 131072, 0.00059, 30, 4),
            ("deepseek/deepseek-chat", "deepseek", 65536, 0.00014, 1000, 5),
            ("google/gemini-2.0-flash", "google", 1000000, 0.075, 300, 6),
            ("anthropic/claude-3-haiku", "anthropic", 200000, 0.00025, 4000, 7),
            ("together/meta-llama-3.1-8b-instruct-turbo", "together", 131072, 0.00018, 2000, 8)
        ]
        
        for name, provider, max_tokens, cost, rpm, priority in fast_models:
            models[name] = ModelConfig(
                name=name, provider=provider, model_type=ModelType.FAST,
                max_tokens=max_tokens, cost_per_1k=cost, rate_limit_rpm=rpm,
                timeout=5, priority=priority
            )
            
        # Creative Models (12 моделей)
        creative_models = [
            ("openai/gpt-5", "openai", 200000, 0.06, 500, 1),
            ("anthropic/claude-3.5-sonnet", "anthropic", 200000, 0.03, 300, 2),
            ("meta/meta-llama-3.1-405b-instruct", "meta", 131072, 0.0054, 50, 3),
            ("google/gemini-1.5-pro", "google", 2097152, 0.00125, 300, 4),
            ("mistral-ai/mistral-large-2411", "mistral", 128000, 0.003, 400, 5),
            ("cohere/command-r-plus", "cohere", 128000, 0.003, 300, 6),
            ("x-ai/grok-2-1212", "x-ai", 131072, 0.002, 100, 7),
            ("perplexity/llama-3.1-sonar-large-128k-online", "perplexity", 131072, 0.001, 200, 8),
            ("databricks/dbrx-instruct", "databricks", 32768, 0.00075, 150, 9),
            ("01-ai/yi-large", "01-ai", 32768, 0.003, 100, 10),
            ("alibaba/qwen2.5-72b-instruct", "alibaba", 131072, 0.0009, 200, 11),
            ("nvidia/llama-3.1-nemotron-70b-instruct", "nvidia", 131072, 0.00042, 200, 12)
        ]
        
        for name, provider, max_tokens, cost, rpm, priority in creative_models:
            models[name] = ModelConfig(
                name=name, provider=provider, model_type=ModelType.CREATIVE,
                max_tokens=max_tokens, cost_per_1k=cost, rate_limit_rpm=rpm,
                timeout=45, priority=priority
            )
            
        # Structured Models (12 моделей)
        structured_models = [
            ("microsoft/phi-4-reasoning", "microsoft", 16384, 0.01, 200, 1),
            ("openai/gpt-4o", "openai", 128000, 0.025, 500, 2),
            ("deepseek/deepseek-r1", "deepseek", 65536, 0.014, 100, 3),
            ("anthropic/claude-3.5-sonnet", "anthropic", 200000, 0.03, 300, 4),
            ("google/gemini-2.0-flash-thinking", "google", 1000000, 0.075, 300, 5),
            ("mistral-ai/mistral-large-2411", "mistral", 128000, 0.003, 400, 6),
            ("cohere/command-r-plus", "cohere", 128000, 0.003, 300, 7),
            ("alibaba/qwen2.5-72b-instruct", "alibaba", 131072, 0.0009, 200, 8),
            ("meta/meta-llama-3.1-405b-instruct", "meta", 131072, 0.0054, 50, 9),
            ("nvidia/llama-3.1-nemotron-70b-instruct", "nvidia", 131072, 0.00042, 200, 10),
            ("databricks/dbrx-instruct", "databricks", 32768, 0.00075, 150, 11),
            ("01-ai/yi-large", "01-ai", 32768, 0.003, 100, 12)
        ]
        
        for name, provider, max_tokens, cost, rpm, priority in structured_models:
            models[name] = ModelConfig(
                name=name, provider=provider, model_type=ModelType.STRUCTURED,
                max_tokens=max_tokens, cost_per_1k=cost, rate_limit_rpm=rpm,
                timeout=30, priority=priority
            )
            
        logger.info("Initialized models configuration", models_count=len(models))
        return models
        
    def _init_routing_policies(self) -> Dict[str, List[str]]:
        """Ініціалізація політик маршрутизації"""
        return {
            ModelType.REASONING.value: [
                "openai/gpt-5",
                "deepseek/deepseek-r1", 
                "microsoft/phi-4-reasoning"
            ],
            ModelType.CODE.value: [
                "mistral-ai/codestral-2501",
                "openai/gpt-4o",
                "microsoft/phi-4"
            ],
            ModelType.EMBED.value: [
                "cohere/cohere-embed-v3-multilingual",
                "openai/text-embedding-3-large"
            ],
            ModelType.VISION.value: [
                "openai/gpt-4o",
                "microsoft/phi-4-multimodal-instruct"
            ],
            ModelType.FAST.value: [
                "openai/gpt-4o-mini",
                "mistral-ai/ministral-3b"
            ],
            ModelType.CREATIVE.value: [
                "openai/gpt-5",
                "anthropic/claude-3.5-sonnet",
                "meta/meta-llama-3.1-405b-instruct"
            ],
            ModelType.STRUCTURED.value: [
                "microsoft/phi-4-reasoning",
                "openai/gpt-4o",
                "deepseek/deepseek-r1"
            ]
        }
    
    def _setup_routes(self):
        """Налаштування HTTP маршрутів"""
        
        @self.app.post("/router/route")
        async def route_request(request: dict):
            """Основний endpoint для маршрутизації"""
            try:
                routing_request = RoutingRequest(
                    model_type=request["model_type"],
                    prompt=request["prompt"],
                    max_tokens=request.get("max_tokens", 1000),
                    temperature=request.get("temperature", 0.7),
                    user_id=request.get("user_id", "system"),
                    task_id=request.get("task_id"),
                    fallback_enabled=request.get("fallback_enabled", True),
                    priority=request.get("priority", "medium")
                )
                
                result = await self.route_and_execute(routing_request)
                return result
                
            except Exception as e:
                logger.error("Error routing request", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/router/models")
        async def list_models():
            """Список доступних моделей"""
            models_by_type = defaultdict(list)
            for model_name, config in self.models_config.items():
                models_by_type[config.model_type.value].append({
                    "name": model_name,
                    "provider": config.provider,
                    "max_tokens": config.max_tokens,
                    "cost_per_1k": config.cost_per_1k,
                    "rate_limit_rpm": config.rate_limit_rpm
                })
            return dict(models_by_type)
        
        @self.app.get("/router/health")
        async def health():
            """Health check з метриками"""
            total_requests = sum(usage.requests_count for usage in self.model_usage.values())
            avg_error_rate = sum(usage.error_rate for usage in self.model_usage.values()) / max(1, len(self.model_usage))
            
            return {
                "status": "healthy",
                "models_count": len(self.models_config),
                "total_requests": total_requests,
                "avg_error_rate": round(avg_error_rate, 3),
                "timestamp": datetime.now().isoformat()
            }
        
        @self.app.get("/router/usage")
        async def get_usage():
            """Статистика використання моделей"""
            usage_stats = {}
            for model_name, usage in self.model_usage.items():
                usage_stats[model_name] = {
                    "requests_count": usage.requests_count,
                    "total_tokens": usage.total_tokens,
                    "avg_latency": round(usage.avg_latency, 3),
                    "error_rate": round(usage.error_rate, 3),
                    "last_used": usage.last_used.isoformat()
                }
            return usage_stats
    
    async def route_and_execute(self, request: RoutingRequest) -> Dict[str, Any]:
        """Маршрутизація та виконання запиту з фолбеками"""
        
        start_time = time.time()
        
        # Отримуємо список моделей для типу запиту
        candidate_models = self.routing_policies.get(request.model_type, [])
        if not candidate_models:
            raise ValueError(f"No models available for type: {request.model_type}")
        
        # Сортуємо за пріоритетом
        sorted_models = sorted(candidate_models, 
                             key=lambda m: self.models_config[m].priority)
        
        last_error = None
        
        for model_name in sorted_models:
            try:
                config = self.models_config[model_name]
                
                # Перевіряємо rate limit
                if not self.rate_limiter.can_request(model_name, config.rate_limit_rpm):
                    logger.warning("Rate limit exceeded", model=model_name)
                    continue
                
                # Виконуємо запит
                result = await self._execute_model_request(model_name, request, config)
                
                # Оновлюємо статистику успішного виконання
                await self._update_usage_stats(model_name, request, 
                                             time.time() - start_time, success=True)
                
                # Публікуємо подію успішного маршрутизування
                await self._publish_event("router.model_selected", {
                    "model": model_name,
                    "model_type": request.model_type,
                    "task_id": request.task_id,
                    "latency": time.time() - start_time
                })
                
                return {
                    "success": True,
                    "model_used": model_name,
                    "response": result["response"],
                    "tokens_used": result.get("tokens_used", 0),
                    "latency": round(time.time() - start_time, 3),
                    "cost_estimate": result.get("cost_estimate", 0.0)
                }
                
            except Exception as e:
                logger.error("Model execution failed", model=model_name, error=str(e))
                last_error = e
                
                # Оновлюємо статистику помилки
                await self._update_usage_stats(model_name, request, 
                                             time.time() - start_time, success=False)
                
                # Якщо fallback вимкнений, повертаємо помилку
                if not request.fallback_enabled:
                    break
        
        # Всі моделі не спрацювали
        await self._publish_event("router.all_models_failed", {
            "model_type": request.model_type, 
            "task_id": request.task_id,
            "error": str(last_error)
        })
        
        raise Exception(f"All models failed for type {request.model_type}: {last_error}")
    
    async def _execute_model_request(self, model_name: str, request: RoutingRequest, 
                                   config: ModelConfig) -> Dict[str, Any]:
        """Виконання запиту до конкретної моделі через SDK"""
        
        # Підготовка запиту до SDK
        sdk_request = {
            "model": model_name,
            "messages": [{"role": "user", "content": request.prompt}],
            "max_tokens": min(request.max_tokens, config.max_tokens),
            "temperature": request.temperature
        }
        
        # Для embedding моделей інший формат
        if config.model_type == ModelType.EMBED:
            sdk_request = {
                "model": model_name,
                "input": request.prompt
            }
        
        # HTTP запит до SDK
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(config.timeout)) as session:
            endpoint = "/chat/completions" if config.model_type != ModelType.EMBED else "/embeddings"
            
            async with session.post(
                f"{self.sdk_base_url}{endpoint}",
                json=sdk_request,
                headers={"Authorization": f"Bearer {self.sdk_api_key}"}
            ) as response:
                
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"SDK error {response.status}: {error_text}")
                
                result = await response.json()
                
                # Парсинг відповіді
                if config.model_type == ModelType.EMBED:
                    return {
                        "response": result["data"][0]["embedding"],
                        "tokens_used": result.get("usage", {}).get("total_tokens", 0)
                    }
                else:
                    content = result["choices"][0]["message"]["content"]
                    tokens_used = result.get("usage", {}).get("total_tokens", 0)
                    cost_estimate = (tokens_used / 1000) * config.cost_per_1k
                    
                    return {
                        "response": content,
                        "tokens_used": tokens_used,
                        "cost_estimate": cost_estimate
                    }
    
    async def _update_usage_stats(self, model_name: str, request: RoutingRequest, 
                                latency: float, success: bool):
        """Оновлення статистики використання моделі"""
        
        usage = self.model_usage[model_name]
        usage.requests_count += 1
        usage.last_used = datetime.now()
        
        # Оновлення середньої латентності
        if usage.avg_latency == 0:
            usage.avg_latency = latency
        else:
            usage.avg_latency = (usage.avg_latency + latency) / 2
        
        # Оновлення рівня помилок
        if not success:
            usage.error_rate = (usage.error_rate + 1.0) / usage.requests_count
        else:
            usage.error_rate = usage.error_rate * (usage.requests_count - 1) / usage.requests_count
    
    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Публікація події в Redis Streams"""
        try:
            event_data = {
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "source": "ModelRouterAgent",
                **data
            }
            
            self.redis_client.xadd("pred:events:router", event_data)
            logger.debug("Event published", event_type=event_type)
            
        except Exception as e:
            logger.error("Failed to publish event", error=str(e))

# Запуск агента
if __name__ == "__main__":
    import uvicorn
    
    agent = ModelRouterAgent()
    uvicorn.run(agent.app, host="0.0.0.0", port=9002)
