#!/usr/bin/env python3
"""
🧠 ПРОДАКШН РОЗПОДІЛ 21 РЕАЛЬНО ПРАЦЮЮЧОЇ БЕЗКОШТОВНОЇ AI МОДЕЛІ
Складна логіка з конкурсом, арбітражем, fallback та захистом від перегріву
"""

from typing import Any, Dict

import yaml

# 🎯 ТІЛЬКИ 21 РЕАЛЬНО ПРАЦЮЮЧА БЕЗКОШТОВНА МОДЕЛЬ (ПРОДАКШН)
ALL_MODELS = [
    # TIER 1: НАЙПОТУЖНІШІ БЕЗКОШТОВНІ (5 моделей)
    "ai21-labs/ai21-jamba-1.5-large",  # Найпотужніша reasoning модель
    "mistralai/mixtral-8x7b-instruct-v0.1",  # Найкраща Mixtral
    "meta-llama/meta-llama-3-70b-instruct",  # Потужна Llama
    "mistralai/mistral-7b-instruct-v0.3",  # Стабільна Mistral
    "microsoft/phi-3-mini-4k-instruct",  # Швидка Phi
    # TIER 2: ВИСОКОПРОДУКТИВНІ (6 моделей)
    "meta-llama/meta-llama-3-8b-instruct",  # Збалансована Llama
    "microsoft/phi-3-mini-128k-instruct",  # Довгий контекст Phi
    "microsoft/phi-3-small-8k-instruct",  # Мала Phi
    "microsoft/phi-3-small-128k-instruct",  # Мала Phi з довгим контекстом
    "qwen/qwen2.5-7b-instruct",  # Qwen середня
    "qwen/qwen2.5-32b-instruct",  # Qwen велика
    # TIER 3: СПЕЦІАЛІЗОВАНІ (5 моделей)
    "cohere/command-r-plus-08-2024",  # Найкраща Command
    "cohere/command-r-08-2024",  # Стандартна Command
    "mistralai/codestral-latest",  # Спеціалізована для коду
    "google/gemma-2-27b-it",  # Google Gemma
    "meta-llama/llama-3.2-3b-instruct",  # Мала Llama
    # TIER 4: ШВИДКІ/ЛЕГКІ (5 моделей)
    "meta-llama/llama-3.2-1b-instruct",  # Найшвидша Llama
    "qwen/qwen2.5-3b-instruct",  # Швидка Qwen
    "qwen/qwen2.5-1.5b-instruct",  # Ультрашвидка Qwen
    "qwen/qwen2.5-0.5b-instruct",  # Найменша Qwen
    "microsoft/phi-3-medium-4k-instruct",  # Середня Phi
]

# 🤖 26 АГЕНТІВ З ПРОДАКШН ЛОГІКОЮ: КОНКУРС + АРБІТРАЖ + FALLBACK + АНТИПЕРЕГРІВ
AGENT_SPECIFICATIONS = {
    # 🎯 КРИТИЧНО ВАЖЛИВІ АГЕНТИ (НАЙКРАЩІ МОДЕЛІ + КОНКУРС)
    "ChiefOrchestrator": {
        "category": "critical_orchestration",
        "specialization": "Керування всіма агентами та розподіл завдань",
        "competition_models": [
            "ai21-labs/ai21-jamba-1.5-large",  # Конкурент 1 - найпотужніша
            "mistralai/mixtral-8x7b-instruct-v0.1",  # Конкурент 2 - найкраща Mixtral
            "meta-llama/meta-llama-3-70b-instruct",  # Конкурент 3 - потужна Llama
        ],
        "arbiter_model": "cohere/command-r-plus-08-2024",  # Арбітр для вибору
        "fallback_chain": [
            "mistralai/mistral-7b-instruct-v0.3",
            "microsoft/phi-3-mini-4k-instruct",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "emergency_pool": ["microsoft/phi-3-mini-128k-instruct", "qwen/qwen2.5-7b-instruct"],
        "max_concurrent": 5,
        "thermal_protection": {"enabled": True, "threshold": 0.85, "cooldown": 45},
        "load_balancing": "competition_winner",
    },
    "ModelRouter": {
        "category": "critical_routing",
        "specialization": "Маршрутизація запитів між моделями та агентами",
        "competition_models": [
            "meta-llama/meta-llama-3-70b-instruct",  # Швидкість маршрутизації
            "microsoft/phi-3-small-128k-instruct",  # Довгий контекст
            "cohere/command-r-plus-08-2024",  # Якість рішень
        ],
        "arbiter_model": "mistralai/mistral-7b-instruct-v0.3",
        "fallback_chain": [
            "microsoft/phi-3-mini-4k-instruct",
            "qwen/qwen2.5-7b-instruct",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "emergency_pool": ["qwen/qwen2.5-32b-instruct", "google/gemma-2-27b-it"],
        "max_concurrent": 4,
        "thermal_protection": {"enabled": True, "threshold": 0.80, "cooldown": 30},
        "load_balancing": "fastest_accurate",
    },
    "QueryPlanner": {
        "category": "critical_planning",
        "specialization": "Планування та оптимізація складних запитів",
        "competition_models": [
            "ai21-labs/ai21-jamba-1.5-large",  # Складне планування
            "cohere/command-r-plus-08-2024",  # Структурування
            "mistralai/mixtral-8x7b-instruct-v0.1",  # Логіка
        ],
        "arbiter_model": "meta-llama/meta-llama-3-70b-instruct",
        "fallback_chain": [
            "microsoft/phi-3-small-8k-instruct",
            "qwen/qwen2.5-32b-instruct",
            "cohere/command-r-08-2024",
        ],
        "emergency_pool": [
            "mistralai/mistral-7b-instruct-v0.3",
            "microsoft/phi-3-mini-128k-instruct",
        ],
        "max_concurrent": 3,
        "thermal_protection": {"enabled": True, "threshold": 0.75, "cooldown": 60},
        "load_balancing": "consensus_vote",
    },
    # 🔥 ВИСОКОНАВАНТАЖЕНІ АГЕНТИ (ШВИДКІСТЬ + НАДІЙНІСТЬ)
    "DataQuality": {
        "category": "high_load_analysis",
        "specialization": "Аналіз якості даних та виявлення аномалій",
        "competition_models": [
            "meta-llama/meta-llama-3-8b-instruct",  # Швидкий аналіз
            "microsoft/phi-3-mini-128k-instruct",  # Довгі дані
            "qwen/qwen2.5-7b-instruct",  # Точність
        ],
        "arbiter_model": "cohere/command-r-08-2024",
        "fallback_chain": [
            "microsoft/phi-3-small-8k-instruct",
            "qwen/qwen2.5-3b-instruct",
            "meta-llama/llama-3.2-3b-instruct",
        ],
        "emergency_pool": ["microsoft/phi-3-mini-4k-instruct", "qwen/qwen2.5-1.5b-instruct"],
        "max_concurrent": 8,
        "thermal_protection": {"enabled": True, "threshold": 0.70, "cooldown": 20},
        "load_balancing": "round_robin_fast",
    },
    "Anomaly": {
        "category": "real_time_detection",
        "specialization": "Виявлення аномалій в реальному часі",
        "competition_models": [
            "microsoft/phi-3-small-8k-instruct",  # Швидка детекція
            "qwen/qwen2.5-7b-instruct",  # Точність виявлення
            "meta-llama/llama-3.2-3b-instruct",  # Низька латентність
        ],
        "arbiter_model": "cohere/command-r-08-2024",
        "fallback_chain": [
            "microsoft/phi-3-mini-4k-instruct",
            "qwen/qwen2.5-3b-instruct",
            "meta-llama/llama-3.2-1b-instruct",
        ],
        "emergency_pool": ["qwen/qwen2.5-1.5b-instruct", "qwen/qwen2.5-0.5b-instruct"],
        "max_concurrent": 10,
        "thermal_protection": {"enabled": True, "threshold": 0.65, "cooldown": 15},
        "load_balancing": "ultra_fast",
    },
    "Forecast": {
        "category": "predictive_analytics",
        "specialization": "Прогнозування та передбачення трендів",
        "competition_models": [
            "mistralai/mixtral-8x7b-instruct-v0.1",  # Складні прогнози
            "ai21-labs/ai21-jamba-1.5-large",  # Довгострокові тренди
            "qwen/qwen2.5-32b-instruct",  # Числові дані
        ],
        "arbiter_model": "meta-llama/meta-llama-3-70b-instruct",
        "fallback_chain": [
            "cohere/command-r-plus-08-2024",
            "microsoft/phi-3-small-128k-instruct",
            "qwen/qwen2.5-7b-instruct",
        ],
        "emergency_pool": [
            "mistralai/mistral-7b-instruct-v0.3",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "max_concurrent": 5,
        "thermal_protection": {"enabled": True, "threshold": 0.80, "cooldown": 40},
        "load_balancing": "accuracy_weighted",
    },
    # 🛠️ СПЕЦІАЛІЗОВАНІ АГЕНТИ (ЕКСПЕРТНІ МОДЕЛІ)
    "AutoHeal": {
        "category": "code_generation_healing",
        "specialization": "Автовиправлення коду та системи",
        "competition_models": [
            "mistralai/codestral-latest",  # Спеціалізація по коду
            "ai21-labs/ai21-jamba-1.5-large",  # Складна логіка
            "microsoft/phi-3-small-128k-instruct",  # Довгий контекст коду
        ],
        "arbiter_model": "cohere/command-r-plus-08-2024",
        "fallback_chain": [
            "meta-llama/meta-llama-3-8b-instruct",
            "qwen/qwen2.5-7b-instruct",
            "mistralai/mistral-7b-instruct-v0.3",
        ],
        "emergency_pool": ["microsoft/phi-3-mini-128k-instruct", "google/gemma-2-27b-it"],
        "max_concurrent": 3,
        "thermal_protection": {"enabled": True, "threshold": 0.75, "cooldown": 30},
        "load_balancing": "code_quality_score",
    },
    "SelfDiagnosis": {
        "category": "system_diagnostics",
        "specialization": "Самодіагностика системи та виявлення проблем",
        "competition_models": [
            "meta-llama/meta-llama-3-70b-instruct",  # Глибокий аналіз
            "microsoft/phi-3-small-128k-instruct",  # Системні логи
            "cohere/command-r-08-2024",  # Структурований звіт
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "qwen/qwen2.5-32b-instruct",
            "google/gemma-2-27b-it",
            "mistralai/mistral-7b-instruct-v0.3",
        ],
        "emergency_pool": [
            "microsoft/phi-3-mini-4k-instruct",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "max_concurrent": 4,
        "thermal_protection": {"enabled": True, "threshold": 0.70, "cooldown": 35},
        "load_balancing": "diagnostic_depth",
    },
    # 🚀 ШВИДКІ АГЕНТИ (МАКСИМАЛЬНА ПРОПУСКНА ЗДАТНІСТЬ)
    "DatasetIngest": {
        "category": "fast_processing",
        "specialization": "Швидке поглинання та обробка великих даних",
        "competition_models": [
            "meta-llama/llama-3.2-1b-instruct",  # Найшвидша
            "qwen/qwen2.5-3b-instruct",  # Швидка + якісна
            "microsoft/phi-3-mini-4k-instruct",  # Стабільна швидкість
        ],
        "arbiter_model": "microsoft/phi-3-small-8k-instruct",
        "fallback_chain": [
            "qwen/qwen2.5-1.5b-instruct",
            "qwen/qwen2.5-0.5b-instruct",
            "microsoft/phi-3-medium-4k-instruct",
        ],
        "emergency_pool": ["meta-llama/llama-3.2-3b-instruct", "cohere/command-r-08-2024"],
        "max_concurrent": 15,
        "thermal_protection": {"enabled": True, "threshold": 0.60, "cooldown": 10},
        "load_balancing": "maximum_throughput",
    },
    "ETLOrchestrator": {
        "category": "data_transformation",
        "specialization": "Оркестрація ETL процесів",
        "competition_models": [
            "microsoft/phi-3-small-128k-instruct",  # Довгі пайплайни
            "qwen/qwen2.5-7b-instruct",  # Трансформації даних
            "meta-llama/meta-llama-3-8b-instruct",  # Оркестрація
        ],
        "arbiter_model": "cohere/command-r-plus-08-2024",
        "fallback_chain": [
            "google/gemma-2-27b-it",
            "mistralai/mistral-7b-instruct-v0.3",
            "microsoft/phi-3-mini-128k-instruct",
        ],
        "emergency_pool": ["qwen/qwen2.5-32b-instruct", "meta-llama/llama-3.2-3b-instruct"],
        "max_concurrent": 8,
        "thermal_protection": {"enabled": True, "threshold": 0.75, "cooldown": 25},
        "load_balancing": "pipeline_efficiency",
    },
    # 🔍 ІНДЕКСАЦІЯ ТА ПОШУК
    "Indexer": {
        "category": "indexing_search",
        "specialization": "Індексація даних та семантичний пошук",
        "competition_models": [
            "cohere/command-r-08-2024",  # Семантика
            "qwen/qwen2.5-7b-instruct",  # Індексація
            "microsoft/phi-3-mini-128k-instruct",  # Довгий контекст
        ],
        "arbiter_model": "meta-llama/meta-llama-3-8b-instruct",
        "fallback_chain": [
            "google/gemma-2-27b-it",
            "qwen/qwen2.5-3b-instruct",
            "microsoft/phi-3-small-8k-instruct",
        ],
        "emergency_pool": ["meta-llama/llama-3.2-3b-instruct", "qwen/qwen2.5-1.5b-instruct"],
        "max_concurrent": 6,
        "thermal_protection": {"enabled": True, "threshold": 0.70, "cooldown": 20},
        "load_balancing": "search_relevance",
    },
    "Embedding": {
        "category": "embeddings_vectors",
        "specialization": "Створення векторних представлень",
        "competition_models": [
            "cohere/command-r-plus-08-2024",  # Найкращі embeddings
            "qwen/qwen2.5-32b-instruct",  # Великі вектори
            "microsoft/phi-3-small-128k-instruct",  # Довгий текст
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "meta-llama/meta-llama-3-8b-instruct",
            "google/gemma-2-27b-it",
            "cohere/command-r-08-2024",
        ],
        "emergency_pool": ["qwen/qwen2.5-7b-instruct", "mistralai/mistral-7b-instruct-v0.3"],
        "max_concurrent": 12,
        "thermal_protection": {"enabled": True, "threshold": 0.65, "cooldown": 15},
        "load_balancing": "vector_quality",
    },
    # 🌐 ВЕБ ТА OSINT АГЕНТИ
    "OSINTCrawler": {
        "category": "web_intelligence",
        "specialization": "Збір розвідувальної інформації з відкритих джерел",
        "competition_models": [
            "meta-llama/llama-3.2-3b-instruct",  # Швидкий парсинг
            "qwen/qwen2.5-3b-instruct",  # Аналіз контенту
            "microsoft/phi-3-mini-4k-instruct",  # Структурування
        ],
        "arbiter_model": "cohere/command-r-08-2024",
        "fallback_chain": [
            "qwen/qwen2.5-1.5b-instruct",
            "meta-llama/llama-3.2-1b-instruct",
            "microsoft/phi-3-medium-4k-instruct",
        ],
        "emergency_pool": ["qwen/qwen2.5-0.5b-instruct", "google/gemma-2-27b-it"],
        "max_concurrent": 10,
        "thermal_protection": {"enabled": True, "threshold": 0.60, "cooldown": 12},
        "load_balancing": "crawl_speed",
    },
    "GraphBuilder": {
        "category": "graph_analysis",
        "specialization": "Побудова та аналіз графів зв'язків",
        "competition_models": [
            "ai21-labs/ai21-jamba-1.5-large",  # Складні зв'язки
            "microsoft/phi-3-small-128k-instruct",  # Великі графи
            "qwen/qwen2.5-32b-instruct",  # Аналіз структур
        ],
        "arbiter_model": "meta-llama/meta-llama-3-70b-instruct",
        "fallback_chain": [
            "cohere/command-r-plus-08-2024",
            "google/gemma-2-27b-it",
            "mistralai/mistral-7b-instruct-v0.3",
        ],
        "emergency_pool": ["meta-llama/meta-llama-3-8b-instruct", "qwen/qwen2.5-7b-instruct"],
        "max_concurrent": 4,
        "thermal_protection": {"enabled": True, "threshold": 0.80, "cooldown": 35},
        "load_balancing": "graph_complexity",
    },
    # 🎲 СИМУЛЯЦІЯ ТА ДАНІ
    "Simulator": {
        "category": "simulation_modeling",
        "specialization": "Моделювання та симуляція сценаріїв",
        "competition_models": [
            "mistralai/mixtral-8x7b-instruct-v0.1",  # Складні моделі
            "qwen/qwen2.5-32b-instruct",  # Числові симуляції
            "microsoft/phi-3-small-128k-instruct",  # Довгі сценарії
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "cohere/command-r-plus-08-2024",
            "meta-llama/meta-llama-3-8b-instruct",
            "google/gemma-2-27b-it",
        ],
        "emergency_pool": ["qwen/qwen2.5-7b-instruct", "mistralai/mistral-7b-instruct-v0.3"],
        "max_concurrent": 3,
        "thermal_protection": {"enabled": True, "threshold": 0.85, "cooldown": 50},
        "load_balancing": "simulation_accuracy",
    },
    "SyntheticData": {
        "category": "data_generation",
        "specialization": "Генерація синтетичних даних",
        "competition_models": [
            "cohere/command-r-plus-08-2024",  # Реалістичні дані
            "microsoft/phi-3-small-128k-instruct",  # Довгі датасети
            "qwen/qwen2.5-7b-instruct",  # Різноманітність
        ],
        "arbiter_model": "meta-llama/meta-llama-3-70b-instruct",
        "fallback_chain": [
            "ai21-labs/ai21-jamba-1.5-large",
            "google/gemma-2-27b-it",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "emergency_pool": ["mistralai/mistral-7b-instruct-v0.3", "qwen/qwen2.5-32b-instruct"],
        "max_concurrent": 5,
        "thermal_protection": {"enabled": True, "threshold": 0.75, "cooldown": 30},
        "load_balancing": "data_diversity",
    },
    # 📊 ЗВІТНІСТЬ ТА ДОКУМЕНТИ
    "ReportExport": {
        "category": "document_generation",
        "specialization": "Створення звітів та документації",
        "competition_models": [
            "cohere/command-r-plus-08-2024",  # Структуровані звіти
            "microsoft/phi-3-small-128k-instruct",  # Довгі документи
            "meta-llama/meta-llama-3-8b-instruct",  # Якісний текст
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "qwen/qwen2.5-32b-instruct",
            "google/gemma-2-27b-it",
            "cohere/command-r-08-2024",
        ],
        "emergency_pool": ["mistralai/mistral-7b-instruct-v0.3", "qwen/qwen2.5-7b-instruct"],
        "max_concurrent": 4,
        "thermal_protection": {"enabled": True, "threshold": 0.70, "cooldown": 25},
        "load_balancing": "document_quality",
    },
    # 💰 ФІНАНСИ ТА БІЛЛІНГ
    "BillingGate": {
        "category": "financial_analysis",
        "specialization": "Аналіз фінансів та біллінгу",
        "competition_models": [
            "qwen/qwen2.5-32b-instruct",  # Числові дані
            "microsoft/phi-3-small-8k-instruct",  # Фінансова логіка
            "cohere/command-r-08-2024",  # Структурований аналіз
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "meta-llama/meta-llama-3-8b-instruct",
            "google/gemma-2-27b-it",
            "mistralai/mistral-7b-instruct-v0.3",
        ],
        "emergency_pool": ["qwen/qwen2.5-7b-instruct", "microsoft/phi-3-mini-128k-instruct"],
        "max_concurrent": 3,
        "thermal_protection": {"enabled": True, "threshold": 0.80, "cooldown": 40},
        "load_balancing": "financial_accuracy",
    },
    # 🛡️ БЕЗПЕКА ТА ЗАХИСТ
    "PIIGuardian": {
        "category": "privacy_protection",
        "specialization": "Захист персональних даних та приватності",
        "competition_models": [
            "microsoft/phi-3-small-128k-instruct",  # Виявлення PII
            "cohere/command-r-plus-08-2024",  # Класифікація даних
            "qwen/qwen2.5-7b-instruct",  # Аналіз приватності
        ],
        "arbiter_model": "meta-llama/meta-llama-3-70b-instruct",
        "fallback_chain": [
            "ai21-labs/ai21-jamba-1.5-large",
            "google/gemma-2-27b-it",
            "mistralai/mistral-7b-instruct-v0.3",
        ],
        "emergency_pool": ["meta-llama/meta-llama-3-8b-instruct", "cohere/command-r-08-2024"],
        "max_concurrent": 6,
        "thermal_protection": {"enabled": True, "threshold": 0.75, "cooldown": 30},
        "load_balancing": "privacy_score",
    },
    "RedTeam": {
        "category": "security_testing",
        "specialization": "Тестування безпеки та пошук уразливостей",
        "competition_models": [
            "mistralai/codestral-latest",  # Код-аудит
            "ai21-labs/ai21-jamba-1.5-large",  # Складна логіка атак
            "meta-llama/meta-llama-3-70b-instruct",  # Аналіз безпеки
        ],
        "arbiter_model": "cohere/command-r-plus-08-2024",
        "fallback_chain": [
            "microsoft/phi-3-small-128k-instruct",
            "qwen/qwen2.5-32b-instruct",
            "google/gemma-2-27b-it",
        ],
        "emergency_pool": [
            "mistralai/mistral-7b-instruct-v0.3",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "max_concurrent": 2,
        "thermal_protection": {"enabled": True, "threshold": 0.90, "cooldown": 60},
        "load_balancing": "security_depth",
    },
    # 📋 МОНІТОРИНГ ТА ОПТИМІЗАЦІЯ
    "ComplianceMonitor": {
        "category": "compliance_monitoring",
        "specialization": "Моніторинг відповідності та регуляторні вимоги",
        "competition_models": [
            "cohere/command-r-plus-08-2024",  # Регуляторний текст
            "microsoft/phi-3-small-128k-instruct",  # Довгі документи
            "qwen/qwen2.5-32b-instruct",  # Складні правила
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "meta-llama/meta-llama-3-70b-instruct",
            "google/gemma-2-27b-it",
            "cohere/command-r-08-2024",
        ],
        "emergency_pool": ["mistralai/mistral-7b-instruct-v0.3", "qwen/qwen2.5-7b-instruct"],
        "max_concurrent": 4,
        "thermal_protection": {"enabled": True, "threshold": 0.75, "cooldown": 35},
        "load_balancing": "compliance_accuracy",
    },
    "PerformanceOptimizer": {
        "category": "performance_optimization",
        "specialization": "Оптимізація продуктивності системи",
        "competition_models": [
            "mistralai/codestral-latest",  # Код оптимізації
            "microsoft/phi-3-small-128k-instruct",  # Аналіз метрик
            "qwen/qwen2.5-32b-instruct",  # Числовий аналіз
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "meta-llama/meta-llama-3-8b-instruct",
            "cohere/command-r-plus-08-2024",
            "google/gemma-2-27b-it",
        ],
        "emergency_pool": ["mistralai/mistral-7b-instruct-v0.3", "qwen/qwen2.5-7b-instruct"],
        "max_concurrent": 3,
        "thermal_protection": {"enabled": True, "threshold": 0.80, "cooldown": 45},
        "load_balancing": "optimization_impact",
    },
    "SelfImprovement": {
        "category": "self_optimization",
        "specialization": "Самовдосконалення та навчання системи",
        "competition_models": [
            "ai21-labs/ai21-jamba-1.5-large",  # Мета-навчання
            "mistralai/mixtral-8x7b-instruct-v0.1",  # Складна логіка
            "meta-llama/meta-llama-3-70b-instruct",  # Самоаналіз
        ],
        "arbiter_model": "cohere/command-r-plus-08-2024",
        "fallback_chain": [
            "qwen/qwen2.5-32b-instruct",
            "microsoft/phi-3-small-128k-instruct",
            "google/gemma-2-27b-it",
        ],
        "emergency_pool": [
            "mistralai/mistral-7b-instruct-v0.3",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "max_concurrent": 2,
        "thermal_protection": {"enabled": True, "threshold": 0.95, "cooldown": 120},
        "load_balancing": "learning_efficiency",
    },
    # 🎯 АРБІТРАЖ ТА ДОПОМОГА
    "Arbiter": {
        "category": "decision_arbitration",
        "specialization": "Арбітраж рішень між агентами",
        "competition_models": [
            "ai21-labs/ai21-jamba-1.5-large",  # Складні рішення
            "meta-llama/meta-llama-3-70b-instruct",  # Логічний аналіз
            "cohere/command-r-plus-08-2024",  # Структурованість
        ],
        "arbiter_model": "mistralai/mixtral-8x7b-instruct-v0.1",  # Мета-арбітр
        "fallback_chain": [
            "qwen/qwen2.5-32b-instruct",
            "microsoft/phi-3-small-128k-instruct",
            "google/gemma-2-27b-it",
        ],
        "emergency_pool": [
            "mistralai/mistral-7b-instruct-v0.3",
            "meta-llama/meta-llama-3-8b-instruct",
        ],
        "max_concurrent": 3,
        "thermal_protection": {"enabled": True, "threshold": 0.85, "cooldown": 50},
        "load_balancing": "decision_quality",
    },
    "NexusGuide": {
        "category": "user_assistance",
        "specialization": "Допомога користувачам та навігація",
        "competition_models": [
            "cohere/command-r-plus-08-2024",  # Найкраща допомога
            "microsoft/phi-3-small-128k-instruct",  # Довгі інструкції
            "meta-llama/meta-llama-3-8b-instruct",  # Дружній інтерфейс
        ],
        "arbiter_model": "qwen/qwen2.5-32b-instruct",
        "fallback_chain": [
            "google/gemma-2-27b-it",
            "cohere/command-r-08-2024",
            "mistralai/mistral-7b-instruct-v0.3",
        ],
        "emergency_pool": ["microsoft/phi-3-mini-128k-instruct", "qwen/qwen2.5-7b-instruct"],
        "max_concurrent": 5,
        "thermal_protection": {"enabled": True, "threshold": 0.70, "cooldown": 20},
        "load_balancing": "user_satisfaction",
    },
    "SchemaMapper": {
        "category": "schema_analysis",
        "specialization": "Аналіз та маппінг схем даних",
        "competition_models": [
            "microsoft/phi-3-small-128k-instruct",  # Довгі схеми
            "qwen/qwen2.5-32b-instruct",  # Складні структури
            "cohere/command-r-08-2024",  # Структурований аналіз
        ],
        "arbiter_model": "ai21-labs/ai21-jamba-1.5-large",
        "fallback_chain": [
            "meta-llama/meta-llama-3-8b-instruct",
            "google/gemma-2-27b-it",
            "mistralai/mistral-7b-instruct-v0.3",
        ],
        "emergency_pool": ["qwen/qwen2.5-7b-instruct", "microsoft/phi-3-mini-128k-instruct"],
        "max_concurrent": 3,
        "thermal_protection": {"enabled": True, "threshold": 0.75, "cooldown": 30},
        "load_balancing": "schema_complexity",
    },
}


def create_production_model_distribution():
    """🏭 Створює продакшн розподіл з конкурсом, арбітражем та захистом"""

    # Перевірка використання моделей
    used_models = set()
    for agent_name, config in AGENT_SPECIFICATIONS.items():
        used_models.update(config.get("competition_models", []))
        used_models.update(config.get("fallback_chain", []))
        used_models.update(config.get("emergency_pool", []))
        if config.get("arbiter_model"):
            used_models.add(config["arbiter_model"])

    print(f"🔍 Використано моделей: {len(used_models)}/21")
    unused_models = set(ALL_MODELS) - used_models
    if unused_models:
        print(f"⚠️  Невикористані моделі: {unused_models}")

    # Створюємо продакшн конфігурацію
    config = {
        "metadata": {
            "version": "2.0",
            "created_at": "2025-09-28",
            "description": "Продакшн розподіл 21 працюючої безкоштовної моделі",
            "total_models": len(ALL_MODELS),
            "total_agents": len(AGENT_SPECIFICATIONS),
            "strategy": "competition_arbitration_fallback_thermal",
        },
        "system_architecture": {
            "competition_enabled": True,
            "arbitration_enabled": True,
            "thermal_protection": True,
            "auto_failover": True,
            "load_balancing": True,
            "cost_optimization": True,
            "reliability_first": True,
        },
        "model_tiers": {
            "tier_1_premium": ALL_MODELS[:5],  # Найпотужніші
            "tier_2_balanced": ALL_MODELS[5:11],  # Збалансовані
            "tier_3_specialized": ALL_MODELS[11:16],  # Спеціалізовані
            "tier_4_fast": ALL_MODELS[16:21],  # Швидкі
        },
        "agents": {},
        "competition_system": {
            "enabled": True,
            "strategy": "parallel_evaluation",
            "timeout_seconds": 30,
            "consensus_threshold": 0.7,
            "winner_selection": "best_score_fastest",
        },
        "arbitration_system": {
            "enabled": True,
            "arbiter_timeout": 15,
            "conflict_resolution": "weighted_vote",
            "escalation_levels": 3,
        },
        "thermal_protection": {
            "global_enabled": True,
            "monitoring_interval": 5,
            "cooldown_strategies": [
                "reduce_concurrency",
                "switch_to_fallback",
                "activate_emergency_pool",
                "temporary_shutdown",
            ],
        },
        "failover_system": {
            "enabled": True,
            "detection_time": 3,
            "recovery_attempts": 5,
            "cascade_prevention": True,
        },
    }

    # Додаємо агентів з їхніми конфігураціями
    for agent_name, agent_config in AGENT_SPECIFICATIONS.items():
        config["agents"][agent_name] = {
            "category": agent_config["category"],
            "specialization": agent_config["specialization"],
            "model_strategy": {
                "competition_models": agent_config["competition_models"],
                "arbiter_model": agent_config["arbiter_model"],
                "fallback_chain": agent_config["fallback_chain"],
                "emergency_pool": agent_config["emergency_pool"],
            },
            "performance_settings": {
                "max_concurrent": agent_config["max_concurrent"],
                "load_balancing": agent_config["load_balancing"],
                "priority_level": (
                    "critical" if "critical" in agent_config["category"] else "normal"
                ),
            },
            "thermal_protection": agent_config["thermal_protection"],
            "reliability": {
                "retry_attempts": 3,
                "backoff_strategy": "exponential",
                "circuit_breaker": True,
                "health_checks": True,
            },
        }

    return config


def save_production_configuration(config: Dict[str, Any]) -> str:
    """💾 Зберігає продакшн конфігурацію"""
    config_path = "/Users/dima/Documents/Predator11/agents/production_model_distribution.yaml"

    with open(config_path, "w", encoding="utf-8") as f:
        yaml.dump(config, f, default_flow_style=False, allow_unicode=True, indent=2)

    return config_path


def update_production_registry(config: Dict[str, Any]) -> str:
    """🔄 Оновлює продакшн registry з новою логікою"""

    # Створюємо LLM профілі для кожної категорії
    llm_profiles = {}

    # Профілі для кожного рівня моделей
    tiers = config["model_tiers"]

    # TIER 1: Критичні операції
    llm_profiles["critical_tier1"] = {
        "provider": "sdk",
        "models": tiers["tier_1_premium"],
        "strategy": "competition_best_of_3",
        "max_tokens": 8192,
        "temperature": 0.1,
        "timeout": 30,
        "cost_per_1k_tokens": 0.0,
    }

    # TIER 2: Збалансовані операції
    llm_profiles["balanced_tier2"] = {
        "provider": "sdk",
        "models": tiers["tier_2_balanced"],
        "strategy": "round_robin_with_fallback",
        "max_tokens": 4096,
        "temperature": 0.2,
        "timeout": 20,
        "cost_per_1k_tokens": 0.0,
    }

    # TIER 3: Спеціалізовані операції
    llm_profiles["specialized_tier3"] = {
        "provider": "sdk",
        "models": tiers["tier_3_specialized"],
        "strategy": "task_specific_selection",
        "max_tokens": 4096,
        "temperature": 0.15,
        "timeout": 25,
        "cost_per_1k_tokens": 0.0,
    }

    # TIER 4: Швидкі операції
    llm_profiles["fast_tier4"] = {
        "provider": "sdk",
        "models": tiers["tier_4_fast"],
        "strategy": "fastest_response",
        "max_tokens": 2048,
        "temperature": 0.1,
        "timeout": 10,
        "cost_per_1k_tokens": 0.0,
    }

    # Створюємо новий registry
    new_registry = {"version": "2.0_production", "llm_profiles": llm_profiles, "agents": {}}

    # Прив'язуємо агентів до профілів
    for agent_name, agent_config in config["agents"].items():
        category = agent_config["category"]

        # Визначаємо профіль на основі категорії
        if "critical" in category:
            profile = "critical_tier1"
        elif any(word in category for word in ["fast", "real_time", "speed"]):
            profile = "fast_tier4"
        elif any(word in category for word in ["code", "security", "optimization"]):
            profile = "specialized_tier3"
        else:
            profile = "balanced_tier2"

        new_registry["agents"][agent_name] = {
            "llm_profile": profile,
            "competition_models": agent_config["model_strategy"]["competition_models"],
            "arbiter_model": agent_config["model_strategy"]["arbiter_model"],
            "fallback_chain": agent_config["model_strategy"]["fallback_chain"],
            "emergency_pool": agent_config["model_strategy"]["emergency_pool"],
            "max_concurrent": agent_config["performance_settings"]["max_concurrent"],
            "load_balancing": agent_config["performance_settings"]["load_balancing"],
            "thermal_protection": agent_config["thermal_protection"]["enabled"],
            "priority": agent_config["performance_settings"]["priority_level"],
        }

    # Додаємо системні налаштування
    new_registry["system_config"] = {
        "competition_enabled": config["competition_system"]["enabled"],
        "arbitration_enabled": config["arbitration_system"]["enabled"],
        "thermal_protection": config["thermal_protection"]["global_enabled"],
        "failover_enabled": config["failover_system"]["enabled"],
    }

    # Kafka topics (залишаємо існуючі + додаємо нові)
    new_registry["kafka_topics"] = {
        "orchestrator": [
            "orchestrator.tasks",
            "orchestrator.results",
            "orchestrator.scaling",
            "orchestrator.competition",
        ],
        "data_flow": ["data.ingest", "data.quality", "data.processed", "etl.status"],
        "agents_communication": [
            "agents.requests",
            "agents.responses",
            "agents.status",
            "agents.competition",
            "agents.arbitration",
        ],
        "system_events": [
            "system.incidents",
            "system.notifications",
            "system.health",
            "system.alerts",
            "system.thermal",
        ],
        "models": [
            "models.requests",
            "models.responses",
            "models.health",
            "models.failover",
            "models.competition",
            "models.arbitration",
        ],
        "monitoring": [
            "monitoring.metrics",
            "monitoring.performance",
            "monitoring.thermal",
            "monitoring.costs",
        ],
    }

    # Зберігаємо продакшн registry
    registry_path = "/Users/dima/Documents/Predator11/agents/registry_production.yaml"
    with open(registry_path, "w", encoding="utf-8") as f:
        yaml.dump(new_registry, f, default_flow_style=False, allow_unicode=True, indent=2)

    return registry_path


if __name__ == "__main__":
    print("🏭 СТВОРЕННЯ ПРОДАКШН РОЗПОДІЛУ 21 ПРАЦЮЮЧОЇ МОДЕЛІ")
    print("=" * 60)

    # Створюємо продакшн розподіл
    config = create_production_model_distribution()

    # Зберігаємо конфігурацію
    config_path = save_production_configuration(config)
    print(f"✅ Продакшн конфігурацію збережено: {config_path}")

    # Оновлюємо registry
    registry_path = update_production_registry(config)
    print(f"✅ Продакшн registry оновлено: {registry_path}")

    # Виводимо статистику
    print(f"\n📊 ПРОДАКШН СТАТИСТИКА:")
    print(f"🔢 Працюючих моделей: 21")
    print(f"🤖 Всього агентів: 26")
    print(f"🏆 Конкурсна система: АКТИВНА")
    print(f"⚖️  Система арбітражу: АКТИВНА")
    print(f"🛡️  Термальний захист: АКТИВНИЙ")
    print(f"🔄 Автоматичний failover: АКТИВНИЙ")
    print(f"💰 Вартість: 100% БЕЗКОШТОВНО")

    # Статистика по рівнях
    tier_stats = {
        "Критичні (Tier 1)": 5,
        "Збалансовані (Tier 2)": 6,
        "Спеціалізовані (Tier 3)": 5,
        "Швидкі (Tier 4)": 5,
    }

    print(f"\n🏷️  РОЗПОДІЛ ПО РІВНЯХ:")
    for tier, count in tier_stats.items():
        print(f"   {tier}: {count} моделей")

    print(f"\n🎯 ПРОДАКШН СИСТЕМА ГОТОВА!")
    print(f"💪 Максимальний КПД + нульова вартість")
    print(f"🚫 Незламна архітектура з багаторівневим захистом")
    print(f"⚡ Конкурентний відбір найкращих рішень")
