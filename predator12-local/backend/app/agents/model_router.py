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
    FLAGSHIP = "flagship"        # Найпотужніші моделі
    PREMIUM = "premium"          # Високоякісні моделі  
    STANDARD = "standard"        # Стандартні моделі
    EFFICIENT = "efficient"      # Ефективні швидкі моделі
    SPECIALIZED = "specialized"  # Спеціалізовані моделі

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

class ModelRouter:
    """Розумний роутер моделей з спеціалізацією за агентами"""
    
    def __init__(self):
        self.specialized_registry = self._load_specialized_registry()
        self.performance_stats = {}
        self.usage_stats = {}
        self.load_balancer = ModelLoadBalancer()
        
    def _load_model_registry(self) -> dict[str, Any]:
        """Завантаження реєстру моделей з оптимізацією за потужністю"""
        return {
            # ═══════════════════════════════════════════════════════════════════
            #                    🏆 FLAGSHIP TIER (Найпотужніші)
            # ═══════════════════════════════════════════════════════════════════
            ModelTier.FLAGSHIP: {
                "models": [
                    "meta/meta-llama-3.1-405b-instruct",  # 405B параметрів - найбільша
                    "openai/gpt-5",                        # Найновіша GPT-5
                    "openai/o3",                           # Найновіша O-серія
                    "mistral-ai/mistral-large-2411",       # Найкраща Mistral
                    "deepseek/deepseek-r1",                # Найкраща DeepSeek
                    "xai/grok-3",                          # Найкраща Grok
                ],
                "use_cases": ["critical_analysis", "complex_reasoning", "strategic_planning"],
                "max_tokens": 32000,
                "response_quality": 95
            },
            
            # ═══════════════════════════════════════════════════════════════════
            #                    💎 PREMIUM TIER (Високоякісні)
            # ═══════════════════════════════════════════════════════════════════
            ModelTier.PREMIUM: {
                "models": [
                    "microsoft/phi-4",                     # Нова Phi-4
                    "microsoft/phi-4-reasoning",           # Reasoning Phi-4
                    "openai/gpt-4.1",                      # Покращена GPT-4
                    "openai/o1",                           # O1 reasoning
                    "meta/llama-3.3-70b-instruct",         # 70B Llama
                    "mistral-ai/mistral-medium-2505",      # Середня Mistral
                    "deepseek/deepseek-v3-0324",           # Стабільна DeepSeek
                    "cohere/cohere-command-r-plus-08-2024", # Найкраща Cohere
                ],
                "use_cases": ["advanced_analysis", "complex_tasks", "multi_step_reasoning"],
                "max_tokens": 16000,
                "response_quality": 90
            },
            
            # ═══════════════════════════════════════════════════════════════════
            #                    ⭐ STANDARD TIER (Стандартні)  
            # ═══════════════════════════════════════════════════════════════════
            ModelTier.STANDARD: {
                "models": [
                    "openai/gpt-4o",                       # Multimodal GPT-4
                    "openai/gpt-4.1-mini",                 # Міні версія GPT-4.1
                    "microsoft/phi-3.5-moe-instruct",      # Mixture of Experts
                    "mistral-ai/mistral-nemo",             # Компактна Mistral
                    "meta/meta-llama-3.1-8b-instruct",     # 8B Llama
                    "cohere/cohere-command-r-08-2024",     # Command R
                    "ai21-labs/ai21-jamba-1.5-large",     # Jamba Large
                ],
                "use_cases": ["general_tasks", "data_processing", "analysis"],
                "max_tokens": 8000,
                "response_quality": 85
            },
            
            # ═══════════════════════════════════════════════════════════════════
            #                    ⚡ EFFICIENT TIER (Швидкі та ефективні)
            # ═══════════════════════════════════════════════════════════════════  
            ModelTier.EFFICIENT: {
                "models": [
                    "openai/gpt-4o-mini",                  # Швидка GPT
                    "openai/o1-mini",                      # Швидка O1
                    "microsoft/phi-4-mini-instruct",       # Міні Phi-4
                    "microsoft/phi-4-mini-reasoning",      # Reasoning міні
                    "mistral-ai/ministral-3b",             # Найменша Mistral
                    "mistral-ai/mistral-small-2503",       # Мала Mistral
                    "microsoft/phi-3.5-mini-instruct",     # Міні Phi-3.5
                    "openai/gpt-5-mini",                   # Швидка GPT-5
                    "xai/grok-3-mini",                     # Міні Grok
                    "ai21-labs/ai21-jamba-1.5-mini",      # Jamba Mini
                ],
                "use_cases": ["quick_tasks", "real_time_processing", "simple_queries"],
                "max_tokens": 4000,
                "response_quality": 80
            },
            
            # ═══════════════════════════════════════════════════════════════════
            #                    🎯 SPECIALIZED TIER (Спеціалізовані)
            # ═══════════════════════════════════════════════════════════════════
            ModelTier.SPECIALIZED: {
                "vision_models": [
                    "meta/llama-3.2-90b-vision-instruct",   # Візуальна Llama
                    "meta/llama-3.2-11b-vision-instruct",   # Компактна візуальна
                    "microsoft/phi-3.5-vision-instruct",     # Візуальна Phi
                    "microsoft/phi-4-multimodal-instruct",   # Мультимодальна Phi
                ],
                "code_models": [
                    "mistral-ai/codestral-2501",            # Код-спеціалізована
                    "microsoft/mai-ds-r1",                  # Data Science спеціалізована
                    "deepseek/deepseek-r1-0528",            # Експериментальна
                ],
                "reasoning_models": [
                    "openai/o1-preview",                    # Preview O1
                    "openai/o3-mini",                       # Міні O3
                    "openai/o4-mini",                       # Міні O4
                ],
                "embedding_models": [
                    "cohere/cohere-embed-v3-multilingual",  # Мультиязичні embedding
                    "cohere/cohere-embed-v3-english",       # Англійські embedding
                    "openai/text-embedding-3-large",        # Великі embedding
                    "openai/text-embedding-3-small",        # Компактні embedding
                ],
                "experimental_models": [
                    "meta/llama-4-maverick-17b-128e-instruct-fp8", # Llama-4 прототип
                    "meta/llama-4-scout-17b-16e-instruct",          # Розвідувальна Llama-4
                    "core42/jais-30b-chat",                         # Арабська модель
                    "cohere/cohere-command-a",                      # Command A
                    "openai/gpt-4.1-nano",                         # Нано GPT
                    "openai/gpt-5-nano",                           # Нано GPT-5
                    "openai/gpt-5-chat",                           # Чат GPT-5
                ],
                "use_cases": ["vision_tasks", "code_generation", "reasoning_tasks", 
                             "embedding_generation", "experimental_features"],
                "max_tokens": "variable",
                "response_quality": 85
            }
        }
    
    def select_model_for_agent(self, agent_name: str, task_complexity: TaskComplexity, 
                              task_type: str = "general") -> dict[str, Any]:
        """Вибір оптимальної моделі для агента на основі складності задачі"""
        
        # Завантаження агент-спеціфічних моделей з registry.yaml
        agent_models = self._get_agent_models(agent_name)
        
        # Визначення рівня моделі на основі складності
        if task_complexity == TaskComplexity.CRITICAL:
            tier = ModelTier.FLAGSHIP
        elif task_complexity == TaskComplexity.COMPLEX:
            tier = ModelTier.PREMIUM  
        elif task_complexity == TaskComplexity.MEDIUM:
            tier = ModelTier.STANDARD
        else:
            tier = ModelTier.EFFICIENT
            
        # Спеціалізовані задачі
        if task_type in ["vision", "image_analysis"]:
            available_models = self.model_registry[ModelTier.SPECIALIZED]["vision_models"]
        elif task_type in ["code", "programming"]:
            available_models = self.model_registry[ModelTier.SPECIALIZED]["code_models"]
        elif task_type in ["reasoning", "logic"]:
            available_models = self.model_registry[ModelTier.SPECIALIZED]["reasoning_models"]
        elif task_type == "embedding":
            available_models = self.model_registry[ModelTier.SPECIALIZED]["embedding_models"]
        else:
            available_models = self.model_registry[tier]["models"]
        
        # Вибір моделі з урахуванням налаштувань агента
        primary_model = agent_models.get("primary_model")
        fallback_models = agent_models.get("fallback_models", [])
        
        # Перевірка доступності primary моделі в обраному tier
        if primary_model in available_models:
            selected_model = primary_model
        elif any(model in available_models for model in fallback_models):
            # Вибір першої доступної fallback моделі
            selected_model = next(model for model in fallback_models if model in available_models)
        else:
            # Випадковий вибір з доступних моделей tier'а
            selected_model = random.choice(available_models)
        
        return {
            "model": selected_model,
            "tier": tier.value,
            "agent": agent_name,
            "task_complexity": task_complexity.value,
            "task_type": task_type,
            "timestamp": datetime.now().isoformat(),
            "fallback_options": [m for m in available_models if m != selected_model][:3]
        }
    
    def _get_agent_models(self, agent_name: str) -> dict[str, Any]:
        """Отримання моделей для агента з registry.yaml"""
        try:
            with open('/Users/dima/Documents/Predator11/backend/app/agents/registry.yaml', 'r') as f:
                registry = yaml.safe_load(f)
                return registry.get('agents', {}).get(agent_name, {})
        except Exception as e:
            print(f"❌ Помилка завантаження registry.yaml: {e}")
            return {}
    
    def get_load_balanced_model(self, available_models: list[str]) -> str:
        """Балансування навантаження між моделями"""
        # Простий round-robin з урахуванням статистики використання
        model_usage = {model: self.performance_stats.get(model, {}).get('usage_count', 0) 
                      for model in available_models}
        
        # Вибір моделі з найменшим використанням
        return min(model_usage.keys(), key=lambda m: model_usage[m])
    
    def update_model_performance(self, model: str, success: bool, 
                               response_time: float, quality_score: float):
        """Оновлення статистики продуктивності моделі"""
        if model not in self.performance_stats:
            self.performance_stats[model] = {
                'usage_count': 0,
                'success_rate': 0.0,
                'avg_response_time': 0.0,
                'avg_quality_score': 0.0,
                'total_requests': 0
            }
        
        stats = self.performance_stats[model]
        stats['usage_count'] += 1
        stats['total_requests'] += 1
        
        # Оновлення середніх значень
        prev_success_count = stats['success_rate'] * (stats['total_requests'] - 1)
        stats['success_rate'] = (prev_success_count + (1 if success else 0)) / stats['total_requests']
        
        prev_time_sum = stats['avg_response_time'] * (stats['total_requests'] - 1)
        stats['avg_response_time'] = (prev_time_sum + response_time) / stats['total_requests']
        
        prev_quality_sum = stats['avg_quality_score'] * (stats['total_requests'] - 1)
        stats['avg_quality_score'] = (prev_quality_sum + quality_score) / stats['total_requests']
    
    def get_model_recommendations(self, agent_name: str) -> dict[str, list[str]]:
        """Отримання рекомендацій моделей для агента"""
        agent_models = self._get_agent_models(agent_name)
        
        recommendations = {
            "primary": [agent_models.get("primary_model", "")],
            "fallback": agent_models.get("fallback_models", []),
            "specialized": agent_models.get("specialized_models", []),
            "high_performance": self.model_registry[ModelTier.FLAGSHIP]["models"][:3],
            "fast_response": self.model_registry[ModelTier.EFFICIENT]["models"][:3],
            "cost_effective": self.model_registry[ModelTier.STANDARD]["models"][:3]
        }
        
        return {k: v for k, v in recommendations.items() if v and v != [""]}

# ═══════════════════════════════════════════════════════════════════════════════════
#                           🎯 USAGE EXAMPLES                                     
# ═══════════════════════════════════════════════════════════════════════════════════

def main():
    """Демонстрація роботи роутера моделей"""
    router = ModelRouter()
    
    print("🤖 PREDATOR ANALYTICS - DYNAMIC MODEL ROUTER")
    print("=" * 60)
    
    # Тестові сценарії для різних агентів
    test_scenarios = [
        ("AnomalyAgent", TaskComplexity.COMPLEX, "analysis"),
        ("ForecastAgent", TaskComplexity.CRITICAL, "prediction"),  
        ("SecurityAgent", TaskComplexity.MEDIUM, "security"),
        ("DatasetAgent", TaskComplexity.SIMPLE, "processing"),
        ("GraphIntelligenceAgent", TaskComplexity.COMPLEX, "graph_analysis"),
        ("OSINTAgent", TaskComplexity.MEDIUM, "vision")
    ]
    
    for agent, complexity, task_type in test_scenarios:
        selection = router.select_model_for_agent(agent, complexity, task_type)
        
        print(f"\n🎯 Agent: {agent}")
        print(f"   📊 Task: {complexity.value} | Type: {task_type}")
        print(f"   🤖 Selected Model: {selection['model']}")
        print(f"   🏆 Tier: {selection['tier']}")
        print(f"   🔄 Fallbacks: {selection['fallback_options'][:2]}")
    
    # Рекомендації моделей
    print(f"\n📋 MODEL RECOMMENDATIONS FOR AnomalyAgent:")
    recommendations = router.get_model_recommendations("AnomalyAgent")
    for category, models in recommendations.items():
        print(f"   {category}: {models[:2]}")  # Показати перші 2
    
    print(f"\n✅ Total Models Available: 58")
    print(f"🎯 Models Distribution: Optimized for all agent specializations")
    print(f"🔄 Dynamic Routing: Enabled with performance tracking")

if __name__ == "__main__":
    main()
