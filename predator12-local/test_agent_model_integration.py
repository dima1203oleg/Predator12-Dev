#!/usr/bin/env python3
"""
🧪 ТЕСТУВАННЯ РЕАЛЬНИХ ЗАПИТІВ АГЕНТІВ ДО AI МОДЕЛЕЙ
Перевіряє чи кожен агент отримує відповіді від своїх спеціалізованих моделей
"""
import asyncio
import json
import os
import sys
from typing import Any, Dict, List

import httpx

sys.path.append("/Users/dima/Documents/Predator11/backend/app/agents")

from specialized_model_router import SpecializedModelRouter, TaskComplexity


class AgentModelTester:
    def __init__(self):
        self.model_router = SpecializedModelRouter()
        self.model_sdk_url = "http://localhost:3010"
        self.client = httpx.AsyncClient(timeout=30.0)

    async def test_agent_model_responses(self, agent_type: str, test_queries: List[str]) -> Dict:
        """Тестує отримання відповідей агентом від різних моделей"""

        print(f"\n🤖 ТЕСТУВАННЯ {agent_type}")
        print("=" * 50)

        results = {
            "agent": agent_type,
            "models_tested": {},
            "successful_responses": 0,
            "total_tests": 0,
        }

        # Отримуємо моделі для різних типів завдань
        test_scenarios = [
            ("simple", TaskComplexity.SIMPLE),
            ("complex", TaskComplexity.COMPLEX),
            ("critical", TaskComplexity.CRITICAL),
        ]

        for scenario_name, complexity in test_scenarios:
            model = self.model_router.get_optimal_model(agent_type, complexity)
            print(f"\n📋 Сценарій: {scenario_name.upper()} ({model})")

            for i, query in enumerate(test_queries[:2]):  # Тестуємо перші 2 запити
                try:
                    response = await self._make_model_request(model, query)
                    success = response is not None and "choices" in response

                    results["total_tests"] += 1
                    if success:
                        results["successful_responses"] += 1
                        print(
                            f"  ✅ Запит {i+1}: Відповідь отримана ({len(response['choices'][0]['message']['content'])} символів)"
                        )
                    else:
                        print(f"  ❌ Запит {i+1}: Помилка отримання відповіді")

                    results["models_tested"][f"{model}_{scenario_name}_{i+1}"] = {
                        "success": success,
                        "query": query[:50] + "...",
                        "response_length": (
                            len(response["choices"][0]["message"]["content"]) if success else 0
                        ),
                    }

                except Exception as e:
                    print(f"  ❌ Запит {i+1}: Помилка - {str(e)[:100]}")
                    results["total_tests"] += 1

        # Тест спеціалізованих моделей
        await self._test_specialized_models(agent_type, results)

        success_rate = (
            (results["successful_responses"] / results["total_tests"]) * 100
            if results["total_tests"] > 0
            else 0
        )
        print(
            f"\n📊 Результат: {results['successful_responses']}/{results['total_tests']} ({success_rate:.1f}% успішність)"
        )

        return results

    async def _test_specialized_models(self, agent_type: str, results: Dict):
        """Тестує спеціалізовані моделі агента"""
        specialized_queries = {
            "AnomalyAgent": [
                ("statistical", "Виконай статистичний аналіз аномалій в даних"),
                ("ml_detection", "Знайди аномалії використовуючи машинне навчання"),
            ],
            "ForecastAgent": [
                ("time_series", "Побудуй прогноз часового ряду на основі історичних даних"),
                ("trend_analysis", "Проаналізуй тренди в даних за останній місяць"),
            ],
            "SecurityAgent": [
                ("threat_analysis", "Проаналізуй потенційні загрози безпеки"),
                ("vulnerability_scan", "Знайди вразливості в системі"),
            ],
            "SelfHealingAgent": [
                ("diagnostics", "Виконай діагностику проблем системи"),
                ("auto_repair", "Запропонуй автоматичні способи виправлення помилок"),
            ],
        }

        if agent_type in specialized_queries:
            print(f"\n🔧 Тестування спеціалізованих моделей:")

            for task_type, query in specialized_queries[agent_type]:
                model = self.model_router.get_optimal_model(
                    agent_type, TaskComplexity.MEDIUM, task_type
                )
                try:
                    response = await self._make_model_request(model, query)
                    success = response is not None and "choices" in response

                    results["total_tests"] += 1
                    if success:
                        results["successful_responses"] += 1
                        print(f"  ✅ {task_type}: {model} - Відповідь отримана")
                    else:
                        print(f"  ❌ {task_type}: {model} - Помилка")

                except Exception as e:
                    print(f"  ❌ {task_type}: {model} - {str(e)[:50]}...")
                    results["total_tests"] += 1

    async def _make_model_request(self, model: str, query: str) -> Dict:
        """Виконує запит до моделі через Model SDK"""
        request_data = {
            "model": model,
            "messages": [{"role": "user", "content": query}],
            "max_tokens": 200,
            "temperature": 0.7,
        }

        response = await self.client.post(
            f"{self.model_sdk_url}/v1/chat/completions", json=request_data
        )

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"HTTP {response.status_code}: {response.text}")

    async def run_comprehensive_test(self):
        """Запускає комплексне тестування всіх агентів"""

        print("🧪 КОМПЛЕКСНЕ ТЕСТУВАННЯ АГЕНТІВ З AI МОДЕЛЯМИ")
        print("=" * 80)
        print("Перевіряю чи кожен агент отримує відповіді від своїх спеціалізованих моделей")

        # Тестові запити для кожного типу агента
        test_data = {
            "AnomalyAgent": [
                "Знайди аномалії в цих даних: [1,2,3,100,4,5,6]",
                "Які методи детекції аномалій найефективніші?",
                "Проаналізуй паттерни відхилень в метриках системи",
            ],
            "ForecastAgent": [
                "Побудуй прогноз продажів на наступний квартал",
                "Яка тенденція зростання користувачів?",
                "Спрогнозуй навантаження на систему на наступний тиждень",
            ],
            "SecurityAgent": [
                "Проаналізуй журнали на предмет загроз безпеки",
                "Які найчастіші типи кібератак?",
                "Оціни рівень захисту поточної системи",
            ],
            "GraphIntelligenceAgent": [
                "Проаналізуй структуру мережі зв'язків",
                "Знайди найважливіші вузли в графі",
                "Побудуй граф залежностей між компонентами",
            ],
            "DatasetAgent": [
                "Очисти та підготуй датасет для аналізу",
                "Яка якість цих даних?",
                "Виконай ETL обробку вхідних даних",
            ],
            "SelfHealingAgent": [
                "Діагностуй проблеми в системі автоматично",
                "Запропонуй план самовідновлення",
                "Яки помилки можна виправити автоматично?",
            ],
            "AutoImproveAgent": [
                "Оптимізуй продуктивність системи",
                "Запропонуй покращення архітектури",
                "Які метрики потрібно покращити?",
            ],
        }

        all_results = {}
        total_success = 0
        total_tests = 0

        for agent_type, queries in test_data.items():
            try:
                results = await self.test_agent_model_responses(agent_type, queries)
                all_results[agent_type] = results
                total_success += results["successful_responses"]
                total_tests += results["total_tests"]

            except Exception as e:
                print(f"❌ Помилка тестування {agent_type}: {e}")
                all_results[agent_type] = {"error": str(e)}

        # Підсумкові результати
        print(f"\n" + "=" * 80)
        print("📊 ПІДСУМКОВІ РЕЗУЛЬТАТИ ТЕСТУВАННЯ")
        print("=" * 80)

        overall_success_rate = (total_success / total_tests) * 100 if total_tests > 0 else 0
        print(
            f"🎯 Загальна успішність: {total_success}/{total_tests} ({overall_success_rate:.1f}%)"
        )

        print(f"\n📋 Детальні результати по агентах:")
        for agent, results in all_results.items():
            if "error" not in results:
                agent_rate = (results["successful_responses"] / results["total_tests"]) * 100
                print(
                    f"  {agent}: {results['successful_responses']}/{results['total_tests']} ({agent_rate:.1f}%)"
                )
            else:
                print(f"  {agent}: ❌ Помилка")

        # Аналіз спеціалізованої логіки
        print(f"\n🔍 АНАЛІЗ СПЕЦІАЛІЗОВАНОЇ ЛОГІКИ:")
        router_stats = self.model_router.get_system_statistics()
        print(f"  📊 Всього моделей в системі: {router_stats['total_models']}")
        print(f"  🤖 Підтримуваних агентів: {router_stats['total_agents']}")
        print(f"  🔌 Провайдери моделей: {list(router_stats['models_by_provider'].keys())}")

        if overall_success_rate > 70:
            print(f"\n✅ СИСТЕМА ПРАЦЮЄ: Агенти успішно отримують відповіді від AI моделей!")
        elif overall_success_rate > 30:
            print(f"\n⚠️ ЧАСТКОВА РОБОТА: Деякі агенти отримують відповіді, потрібна налаштування")
        else:
            print(f"\n❌ ПРОБЛЕМИ: Більшість агентів не отримують відповіді від моделей")

        return all_results


async def main():
    tester = AgentModelTester()
    await tester.run_comprehensive_test()


if __name__ == "__main__":
    asyncio.run(main())
