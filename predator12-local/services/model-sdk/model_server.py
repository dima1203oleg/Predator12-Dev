#!/usr/bin/env python3
"""
Model SDK Server - Центральний сервіс для роботи з 48 LLM моделями
Забезпечує роутинг між різними API провайдерами
"""

import os
import yaml
import asyncio
import httpx
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
import logging

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Predator Model SDK",
    description="Центральний сервіс для роботи з 48 LLM моделями через API",
    version="2.0.0"
)

class ChatRequest(BaseModel):
    model: str
    messages: List[Dict[str, str]]
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    choices: List[Dict[str, Any]]
    model: str
    usage: Dict[str, int]

class ModelSDK:
    def __init__(self):
        self.models_config = self.load_models_config()
        self.clients: Dict[str, httpx.AsyncClient] = {}
        self.api_keys = self.load_api_keys()
        self.initialize_clients()

    def load_models_config(self) -> Dict:
        """Завантажує конфігурацію 48 моделей"""
        try:
            with open('/app/models_config.yaml', 'r', encoding='utf-8') as f:
                config = yaml.safe_load(f)
                logger.info(f"Завантажено {len(config.get('models', {}))} моделей")
                return config
        except FileNotFoundError:
            logger.error("models_config.yaml not found!")
            return {'models': {}, 'providers': {}}

    def load_api_keys(self) -> Dict[str, str]:
        """Завантажує API ключі з environment змінних"""
        keys = {}
        providers = self.models_config.get('providers', {})

        for provider_name, provider_config in providers.items():
            api_key_env = provider_config.get('api_key_env')
            if api_key_env:
                api_key = os.getenv(api_key_env)
                if api_key:
                    keys[provider_name] = api_key
                    logger.info(f"✅ API ключ для {provider_name} завантажено")
                else:
                    logger.warning(f"⚠️ API ключ {api_key_env} для {provider_name} не знайдено")

        return keys

    def initialize_clients(self):
        """Ініціалізує HTTP клієнти для API провайдерів"""
        providers = self.models_config.get('providers', {})

        for provider_name, provider_config in providers.items():
            base_url = provider_config.get('base_url')
            if base_url and provider_name in self.api_keys:
                headers = {
                    'Authorization': f'Bearer {self.api_keys[provider_name]}',
                    'Content-Type': 'application/json'
                }

                self.clients[provider_name] = httpx.AsyncClient(
                    base_url=base_url,
                    headers=headers,
                    timeout=30.0
                )
                logger.info(f"✅ Клієнт для {provider_name} ініціалізовано")

    async def route_request(self, request: ChatRequest) -> ChatResponse:
        """Основний роутер запитів до моделей"""
        model_config = self.models_config.get('models', {}).get(request.model)

        if not model_config:
            available_models = list(self.models_config.get('models', {}).keys())[:5]
            raise HTTPException(
                status_code=404,
                detail=f"Модель '{request.model}' не знайдена. Доступні: {available_models}..."
            )

        provider = model_config.get('provider')
        endpoint = model_config.get('endpoint', request.model)

        try:
            if provider in self.clients:
                return await self._call_api_provider(provider, endpoint, request)
            else:
                logger.warning(f"Провайдер {provider} недоступний, використовую fallback")
                return await self._fallback_response(request)
        except Exception as e:
            logger.error(f"Помилка при виклику моделі {request.model}: {e}")
            return await self._fallback_response(request)

    async def _call_api_provider(self, provider: str, endpoint: str, request: ChatRequest) -> ChatResponse:
        """Виклик реального API провайдера"""
        client = self.clients[provider]

        # Формуємо запит згідно з форматом OpenAI API
        api_request = {
            "model": endpoint,
            "messages": request.messages,
            "max_tokens": request.max_tokens,
            "temperature": request.temperature
        }

        # Викликаємо API
        response = await client.post("/chat/completions", json=api_request)

        if response.status_code == 200:
            api_response = response.json()

            # Адаптуємо відповідь під наш формат
            return ChatResponse(
                choices=api_response.get('choices', []),
                model=request.model,
                usage=api_response.get('usage', {
                    'prompt_tokens': 0,
                    'completion_tokens': 0,
                    'total_tokens': 0
                })
            )
        else:
            logger.error(f"API помилка {provider}: {response.status_code} - {response.text}")
            raise Exception(f"API помилка: {response.status_code}")

    async def _fallback_response(self, request: ChatRequest) -> ChatResponse:
        """Fallback відповідь коли API недоступні"""
        user_msgs = [m for m in request.messages if m.get('role') in ('user', 'system')]
        last = user_msgs[-1]['content'] if user_msgs else ""

        content = f"[FALLBACK:{request.model}] Я AI асистент Predator11. Запит: {last[:200]}... (API тимчасово недоступний)"

        return ChatResponse(
            choices=[{
                'message': {
                    'role': 'assistant',
                    'content': content
                },
                'finish_reason': 'stop'
            }],
            model=request.model,
            usage={
                'prompt_tokens': len(last.split()) if last else 0,
                'completion_tokens': len(content.split()),
                'total_tokens': len(last.split()) + len(content.split()) if last else len(content.split())
            }
        )

    def get_available_models(self) -> List[Dict]:
        """Повертає список доступних моделей"""
        models = []
        for model_id, config in self.models_config.get('models', {}).items():
            provider = config.get('provider', 'unknown')
            is_available = provider in self.clients

            models.append({
                "id": model_id,
                "object": "model",
                "created": 1677610602,
                "owned_by": provider,
                "available": is_available,
                "quality_score": config.get('quality_score', 0.8),
                "latency_ms": config.get('latency_ms', 2000)
            })

        return models

# Глобальний екземпляр SDK
model_sdk = ModelSDK()

@app.post("/v1/chat/completions", response_model=ChatResponse)
async def chat_completions(request: ChatRequest):
    """Основний endpoint для чату з моделями"""
    try:
        return await model_sdk.route_request(request)
    except Exception as e:
        logger.error(f"Error in chat_completions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/v1/models")
async def list_models():
    """Список доступних моделей"""
    models = model_sdk.get_available_models()
    return {
        "data": models,
        "total": len(models)
    }

@app.get("/models")
async def list_models_simple():
    """Простий список моделей (для сумісності)"""
    models = model_sdk.get_available_models()
    return {
        "models": [{"id": m["id"], "owned_by": m["owned_by"]} for m in models]
    }

@app.get("/health")
async def health_check():
    """Перевірка здоров'я сервісу"""
    total_models = len(model_sdk.models_config.get('models', {}))
    available_providers = len(model_sdk.clients)

    return {
        "status": "healthy",
        "models_total": total_models,
        "models_available": sum(1 for m in model_sdk.get_available_models() if m["available"]),
        "providers_connected": available_providers,
        "providers": list(model_sdk.clients.keys())
    }

@app.get("/status")
async def detailed_status():
    """Детальний статус системи"""
    models = model_sdk.get_available_models()
    providers_status = {}

    for provider in model_sdk.models_config.get('providers', {}).keys():
        providers_status[provider] = {
            "connected": provider in model_sdk.clients,
            "has_api_key": provider in model_sdk.api_keys,
            "models_count": sum(1 for m in models if m["owned_by"] == provider)
        }

    return {
        "total_models": len(models),
        "available_models": sum(1 for m in models if m["available"]),
        "providers": providers_status,
        "top_models": [m["id"] for m in sorted(models, key=lambda x: x["quality_score"], reverse=True)[:10]]
    }

@app.get("/")
async def root():
    """Кореневий endpoint"""
    return {
        "service": "Predator Model SDK",
        "version": "2.0.0",
        "description": "48 AI моделей через API провайдери",
        "endpoints": {
            "/v1/chat/completions": "Чат з моделями",
            "/v1/models": "Список моделей",
            "/health": "Стан здоров'я",
            "/status": "Детальний статус"
        }
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3010))
    uvicorn.run(
        "model_server:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False
    )
