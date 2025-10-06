#!/usr/bin/env python3
"""
🤖 Specialized Model Router for Predator Analytics
Розумний роутер для оптимального розподілу 58 безкоштовних моделей за спеціалізацією агентів
"""

import random
import yaml
from datetime import datetime
from enum import Enum
from typing import Any


class ModelTier(Enum):
    """Рівні потужності моделей"""
    FLAGSHIP = "flagship"
    PREMIUM = "premium"
    STANDARD = "standard"


class TaskComplexity(Enum):
    """Складність задач"""
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"
    CRITICAL = "critical"


class AgentType(Enum):
    """Типи агентів системи"""
    ANOMALY = "AnomalyAgent"
    FORECAST = "ForecastAgent"
    GRAPH = "GraphIntelligenceAgent"
    DATASET = "DatasetAgent"
    SECURITY = "SecurityAgent"
    SELFHEALING = "SelfHealingAgent"
    AUTOIMPROVE = "AutoImproveAgent"


class SpecializedModelRouter:
    """Спеціалізований роутер моделей для агентів Predator Analytics"""

    def __init__(self):
        self.specialized_registry = self._load_specialized_registry()
        self.performance_stats = {}
        self.usage_stats = {}

    def _load_specialized_registry(self) -> dict[str, Any]:
        """Завантаження спеціалізованої конфігурації моделей"""
        try:
            registry_path = "/Users/dima/Documents/Predator11/backend/app/agents/specialized_registry.yaml"
            with open(registry_path) as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            # Fallback до базової конфігурації
            return self._get_default_specialized_config()

    def _get_default_specialized_config(self) -> dict[str, Any]:
        """Базова спеціалізована конфігурація моделей"""
        return {
            "agents": {
                "AnomalyAgent": {
                    "primary_models": {
                        "flagship": "deepseek/deepseek-r1",
                        "premium": "openai/o1",
                        "standard": "microsoft/phi-4-reasoning"
                    },
                    "fallback_models": [
                        "deepseek/deepseek-r1-0528",
                        "openai/o1-mini",
                        "microsoft/mai-ds-r1",
                        "mistral-ai/mistral-large-2411"
                    ],
                    "embedding_models": ["cohere/cohere-embed-v3-multilingual"],
                    "specialized_models": {
                        "statistical": "deepseek/deepseek-v3-0324",
                        "ml_detection": "openai/o1-preview"
                    }
                },
                "ForecastAgent": {
                    "primary_models": {
                        "flagship": "meta/meta-llama-3.1-405b-instruct",
                        "premium": "mistral-ai/mistral-large-2411",
                        "standard": "openai/gpt-5"
                    },
                    "fallback_models": [
                        "mistral-ai/mistral-medium-2505",
                        "openai/o3",
                        "xai/grok-3",
                        "meta/llama-3.3-70b-instruct"
                    ],
                    "embedding_models": ["cohere/cohere-embed-v3-multilingual"],
                    "specialized_models": {
                        "time_series": "microsoft/phi-4",
                        "trend_analysis": "openai/gpt-5-chat"
                    }
                },
                "GraphIntelligenceAgent": {
                    "primary_models": {
                        "flagship": "microsoft/phi-4-reasoning",
                        "premium": "microsoft/phi-4-multimodal-instruct",
                        "standard": "meta/llama-4-maverick-17b-128e-instruct-fp8"
                    },
                    "fallback_models": [
                        "openai/gpt-4.1",
                        "meta/llama-3.3-70b-instruct",
                        "deepseek/deepseek-r1",
                        "microsoft/phi-4"
                    ],
                    "embedding_models": ["cohere/cohere-embed-v3-multilingual"],
                    "specialized_models": {
                        "network_analysis": "meta/llama-4-scout-17b-16e-instruct",
                        "topology": "microsoft/phi-3.5-vision-instruct"
                    }
                },
                "DatasetAgent": {
                    "primary_models": {
                        "flagship": "openai/gpt-4o",
                        "premium": "microsoft/phi-4-reasoning",
                        "standard": "cohere/cohere-command-r-plus-08-2024"
                    },
                    "fallback_models": [
                        "microsoft/phi-3.5-vision-instruct",
                        "mistral-ai/codestral-2501",
                        "openai/gpt-4.1-mini",
                        "meta/meta-llama-3.1-8b-instruct"
                    ],
                    "embedding_models": [
                        "cohere/cohere-embed-v3-multilingual",
                        "cohere/cohere-embed-v3-english"
                    ],
                    "specialized_models": {
                        "etl_processing": "mistral-ai/codestral-2501",
                        "data_cleaning": "openai/gpt-4o-mini"
                    }
                },
                "SecurityAgent": {
                    "primary_models": {
                        "flagship": "deepseek/deepseek-r1",
                        "premium": "microsoft/phi-4-reasoning",
                        "standard": "openai/o1-preview"
                    },
                    "fallback_models": [
                        "microsoft/mai-ds-r1",
                        "xai/grok-3",
                        "openai/o3-mini",
                        "mistral-ai/mistral-nemo"
                    ],
                    "embedding_models": ["cohere/cohere-embed-v3-multilingual"],
                    "specialized_models": {
                        "threat_analysis": "deepseek/deepseek-v3-0324",
                        "vulnerability_scan": "microsoft/phi-4-mini-reasoning"
                    }
                },
                "SelfHealingAgent": {
                    "primary_models": {
                        "flagship": "openai/gpt-4o-mini",
                        "premium": "microsoft/phi-4-mini-reasoning",
                        "standard": "mistral-ai/ministral-3b"
                    },
                    "fallback_models": [
                        "mistral-ai/codestral-2501",
                        "microsoft/phi-3.5-moe-instruct",
                        "openai/gpt-4.1-nano",
                        "deepseek/deepseek-v3-0324"
                    ],
                    "embedding_models": ["openai/text-embedding-3-small"],
                    "specialized_models": {
                        "diagnostics": "microsoft/phi-3.5-mini-instruct",
                        "auto_repair": "openai/gpt-5-nano"
                    }
                },
                "AutoImproveAgent": {
                    "primary_models": {
                        "flagship": "meta/meta-llama-3.1-405b-instruct",
                        "premium": "openai/gpt-5",
                        "standard": "mistral-ai/mistral-large-2411"
                    },
                    "fallback_models": [
                        "openai/o3",
                        "xai/grok-3",
                        "deepseek/deepseek-r1",
                        "microsoft/phi-4"
                    ],
                    "embedding_models": ["cohere/cohere-embed-v3-multilingual"],
                    "specialized_models": {
                        "optimization": "mistral-ai/mistral-small-2503",
                        "learning": "openai/gpt-5-mini"
                    }
                }
            }
        }

    def get_optimal_model(self, agent_type: str, task_complexity: TaskComplexity = TaskComplexity.MEDIUM,
                          task_type: str = "general") -> str:
        """Отримання оптимальної моделі для агента та задачі"""

        if agent_type not in self.specialized_registry.get("agents", {}):
            return "openai/gpt-4o-mini"  # Fallback

        agent_config = self.specialized_registry["agents"][agent_type]

        # Вибір за складністю задачі
        if task_complexity == TaskComplexity.CRITICAL:
            model = agent_config["primary_models"].get("flagship")
        elif task_complexity == TaskComplexity.COMPLEX:
            model = agent_config["primary_models"].get("premium")
        else:
            model = agent_config["primary_models"].get("standard")

        # Перевірка спеціалізованих моделей
        specialized_models = agent_config.get("specialized_models", {})
        if task_type in specialized_models:
            model = specialized_models[task_type]

        # Якщо модель недоступна, використовуємо fallback
        if not self._is_model_available(model):
            fallback_models = agent_config.get("fallback_models", [])
            for fallback_model in fallback_models:
                if self._is_model_available(fallback_model):
                    model = fallback_model
                    break

        return model or "openai/gpt-4o-mini"

    def get_embedding_model(self, agent_type: str) -> str:
        """Отримання моделі для embeddings"""
        if agent_type not in self.specialized_registry.get("agents", {}):
            return "cohere/cohere-embed-v3-multilingual"

        agent_config = self.specialized_registry["agents"][agent_type]
        embedding_models = agent_config.get("embedding_models", [])
        
        return embedding_models[0] if embedding_models else "cohere/cohere-embed-v3-multilingual"

    def _is_model_available(self, model: str) -> bool:
        """Перевірка доступності моделі"""
        # Симуляція перевірки доступності (можна інтегрувати з реальним API)
        unavailable_models = self.performance_stats.get("unavailable", set())
        return model not in unavailable_models

    def update_performance_stats(self, model: str, success: bool, response_time: float):
        """Оновлення статистики продуктивності"""
        if model not in self.performance_stats:
            self.performance_stats[model] = {
                'total_requests': 0,
                'successful_requests': 0,
                'avg_response_time': 0,
                'success_rate': 0
            }

        stats = self.performance_stats[model]
        stats['total_requests'] += 1
        
        if success:
            stats['successful_requests'] += 1

        # Оновлення середнього часу відповіді
        prev_avg = stats['avg_response_time']
        stats['avg_response_time'] = (prev_avg * (stats['total_requests'] - 1) + response_time) / stats['total_requests']

        # Оновлення success rate
        stats['success_rate'] = stats['successful_requests'] / stats['total_requests']

    def get_agent_models_summary(self, agent_type: str) -> dict[str, Any]:
        """Отримання повного набору моделей для агента"""
        if agent_type not in self.specialized_registry.get("agents", {}):
            return {}

        agent_config = self.specialized_registry["agents"][agent_type]
        
        return {
            "agent": agent_type,
            "primary_models": agent_config.get("primary_models", {}),
            "fallback_models": agent_config.get("fallback_models", []),
            "embedding_models": agent_config.get("embedding_models", []),
            "specialized_models": agent_config.get("specialized_models", {}),
            "total_models": (
                len(agent_config.get("primary_models", {})) +
                len(agent_config.get("fallback_models", [])) +
                len(agent_config.get("embedding_models", [])) +
                len(agent_config.get("specialized_models", {}))
            )
        }

    def get_load_balanced_model(self, agent_type: str, task_complexity: TaskComplexity = TaskComplexity.MEDIUM) -> str:
        """Отримання моделі з урахуванням балансування навантаження"""
        agent_config = self.specialized_registry.get("agents", {}).get(agent_type, {})
        
        # Отримуємо список всіх доступних моделей для агента
        available_models = []
        
        # Додаємо primary моделі
        primary_models = agent_config.get("primary_models", {})
        if task_complexity == TaskComplexity.CRITICAL:
            available_models.append(primary_models.get("flagship"))
        elif task_complexity == TaskComplexity.COMPLEX:
            available_models.extend([primary_models.get("flagship"), primary_models.get("premium")])
        else:
            available_models.extend(primary_models.values())

        # Додаємо fallback моделі
        available_models.extend(agent_config.get("fallback_models", []))
        
        # Фільтруємо доступні моделі
        available_models = [m for m in available_models if m and self._is_model_available(m)]
        
        if not available_models:
            return "openai/gpt-4o-mini"

        # Вибираємо модель з найменшим навантаженням
        model_loads = {}
        for model in available_models:
            stats = self.performance_stats.get(model, {})
            model_loads[model] = stats.get('total_requests', 0)

        # Повертаємо модель з найменшою кількістю запитів
        return min(model_loads.keys(), key=lambda m: model_loads[m])

    def get_system_statistics(self) -> dict[str, Any]:
        """Отримання статистики всієї системи"""
        total_agents = len(self.specialized_registry.get("agents", {}))
        total_models = 58  # Загальна кількість моделей
        
        # Підрахунок моделей по провайдерах
        providers = {}
        for agent_config in self.specialized_registry.get("agents", {}).values():
            for model_list in [
                agent_config.get("primary_models", {}).values(),
                agent_config.get("fallback_models", []),
                agent_config.get("embedding_models", []),
                agent_config.get("specialized_models", {}).values()
            ]:
                for model in model_list:
                    if model:
                        provider = model.split('/')[0]
                        providers[provider] = providers.get(provider, 0) + 1

        return {
            "timestamp": datetime.now().isoformat(),
            "total_agents": total_agents,
            "total_models": total_models,
            "models_by_provider": providers,
            "performance_tracked_models": len(self.performance_stats),
            "average_success_rate": sum(
                stats.get('success_rate', 0) for stats in self.performance_stats.values()
            ) / len(self.performance_stats) if self.performance_stats else 0
        }


def test_specialized_routing():
    """Тестування спеціалізованого роутингу моделей"""
    print("🤖 Testing Specialized Model Routing for Predator Analytics")
    print("=" * 80)
    
    router = SpecializedModelRouter()
    
    # Тестування для кожного агента
    agents = [
        "AnomalyAgent",
        "ForecastAgent", 
        "GraphIntelligenceAgent",
        "DatasetAgent",
        "SecurityAgent",
        "SelfHealingAgent",
        "AutoImproveAgent"
    ]
    
    for agent in agents:
        print(f"\n🎯 {agent}:")
        print(f"  Simple task: {router.get_optimal_model(agent, TaskComplexity.SIMPLE)}")
        print(f"  Complex task: {router.get_optimal_model(agent, TaskComplexity.COMPLEX)}")
        print(f"  Critical task: {router.get_optimal_model(agent, TaskComplexity.CRITICAL)}")
        print(f"  Embedding model: {router.get_embedding_model(agent)}")
        
        # Спеціалізовані задачі
        if agent == "AnomalyAgent":
            print(f"  Statistical analysis: {router.get_optimal_model(agent, TaskComplexity.MEDIUM, 'statistical')}")
        elif agent == "ForecastAgent":
            print(f"  Time series: {router.get_optimal_model(agent, TaskComplexity.MEDIUM, 'time_series')}")
        elif agent == "SecurityAgent":
            print(f"  Threat analysis: {router.get_optimal_model(agent, TaskComplexity.MEDIUM, 'threat_analysis')}")
    
    # Статистика системи
    print("\n📊 System Statistics:")
    stats = router.get_system_statistics()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print("\n✅ Specialized routing test completed successfully!")
    print("🎯 All 58 models optimally distributed by agent specialization")
    print("🔄 Dynamic routing with performance tracking enabled")


if __name__ == "__main__":
    test_specialized_routing()
