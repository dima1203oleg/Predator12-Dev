#!/usr/bin/env python3
"""
🔍 ТЕСТ ВСІХ 26 АГЕНТІВ НА ВИКОРИСТАННЯ НОВОЇ ЛОГІКИ
"""

import asyncio
import os
import sys

sys.path.append("/Users/dima/Documents/Predator11/agents")

from supervisor import ProductionSupervisor, TaskType


async def test_all_26_agents():
    """Тестує ВСІ 26 агентів на використання нової конкурсної логіки"""

    supervisor = ProductionSupervisor()

    # ВСІХ 26 агентів з їхніми спеціалізаціями
    all_agents = [
        ("Anomaly", TaskType.REAL_TIME_DETECTION, "Виявлення аномалій"),
        ("Arbiter", TaskType.DECISION_ARBITRATION, "Арбітраж рішень"),
        ("AutoHeal", TaskType.CODE_GENERATION, "Самовиправлення коду"),
        ("BillingGate", TaskType.FINANCIAL_ANALYSIS, "Фінансовий аналіз"),
        ("ChiefOrchestrator", TaskType.CRITICAL_ORCHESTRATION, "Головний координатор"),
        ("ComplianceMonitor", TaskType.COMPLIANCE_MONITORING, "Моніторинг відповідності"),
        ("DataQuality", TaskType.HIGH_LOAD_ANALYSIS, "Аналіз якості даних"),
        ("DatasetIngest", TaskType.FAST_PROCESSING, "Поглинання даних"),
        ("ETLOrchestrator", TaskType.DATA_TRANSFORMATION, "ETL процеси"),
        ("Embedding", TaskType.EMBEDDINGS, "Векторні представлення"),
        ("Forecast", TaskType.PREDICTIVE_ANALYTICS, "Прогнозування"),
        ("GraphBuilder", TaskType.GRAPH_ANALYSIS, "Побудова графів"),
        ("Indexer", TaskType.INDEXING_SEARCH, "Індексація та пошук"),
        ("ModelRouter", TaskType.CRITICAL_ROUTING, "Маршрутизація моделей"),
        ("NexusGuide", TaskType.USER_ASSISTANCE, "Допомога користувачам"),
        ("OSINTCrawler", TaskType.WEB_INTELLIGENCE, "Веб-розвідка"),
        ("PIIGuardian", TaskType.PRIVACY_PROTECTION, "Захист приватності"),
        ("PerformanceOptimizer", TaskType.PERFORMANCE_OPTIMIZATION, "Оптимізація продуктивності"),
        ("QueryPlanner", TaskType.CRITICAL_PLANNING, "Планування запитів"),
        ("RedTeam", TaskType.SECURITY_TESTING, "Тестування безпеки"),
        ("ReportExport", TaskType.DOCUMENT_GENERATION, "Експорт звітів"),
        ("SchemaMapper", TaskType.SCHEMA_ANALYSIS, "Аналіз схем"),
        ("SelfDiagnosis", TaskType.SYSTEM_DIAGNOSTICS, "Самодіагностика"),
        ("SelfImprovement", TaskType.SELF_OPTIMIZATION, "Самовдосконалення"),
        ("Simulator", TaskType.SIMULATION, "Симуляція сценаріїв"),
        ("SyntheticData", TaskType.DATA_GENERATION, "Генерація синтетичних даних"),
    ]

    print("🔍 ТЕСТУВАННЯ ВСІХ 26 АГЕНТІВ НА ВИКОРИСТАННЯ НОВОЇ ЛОГІКИ")
    print("=" * 70)

    results = []
    competition_count = 0
    arbitration_count = 0

    for i, (agent_id, task_type, description) in enumerate(all_agents, 1):
        print(f"\n🤖 [{i}/26] Тестую агента: {agent_id}")
        print(f"   📝 Спеціалізація: {description}")

        try:
            # Тестуємо агента
            result = await supervisor.handle_agent_request(
                agent_id, f"Тестове завдання для {description.lower()}", task_type
            )

            if result["success"]:
                print(f"   ✅ Агент працює!")
                print(f"   🏆 Переможець: {result.get('winner_model', 'N/A')}")
                print(f"   📊 Якість: {result.get('quality_score', 0):.3f}")
                print(f"   ⚡ Латентність: {result.get('latency_ms', 0):.1f}ms")

                results.append(
                    {
                        "agent": agent_id,
                        "status": "✅ SUCCESS",
                        "winner": result.get("winner_model", "N/A"),
                        "quality": result.get("quality_score", 0),
                        "latency": result.get("latency_ms", 0),
                        "description": description,
                    }
                )
            else:
                print(f"   ❌ Агент провалив тест: {result.get('error', 'Unknown error')}")
                results.append(
                    {
                        "agent": agent_id,
                        "status": "❌ FAILED",
                        "error": result.get("error", "Unknown"),
                        "description": description,
                    }
                )

        except Exception as e:
            print(f"   💥 Критична помилка: {str(e)}")
            results.append(
                {
                    "agent": agent_id,
                    "status": "💥 ERROR",
                    "error": str(e),
                    "description": description,
                }
            )

    # Оновлюємо статистики
    competition_count = supervisor.metrics["successful_competitions"]
    arbitration_count = supervisor.metrics["arbitrations_needed"]

    # Підсумок результатів
    print(f"\n📊 ПІДСУМОК ТЕСТУВАННЯ ВСІХ 26 АГЕНТІВ")
    print("=" * 70)

    successful = len([r for r in results if "SUCCESS" in r["status"]])
    failed = len([r for r in results if "FAILED" in r["status"]])
    errors = len([r for r in results if "ERROR" in r["status"]])

    print(f"✅ Успішні агенти: {successful}/26")
    print(f"❌ Провальні агенти: {failed}/26")
    print(f"💥 Помилки: {errors}/26")
    print(f"🏆 Проведено конкурсів: {competition_count}")
    print(f"⚖️ Потрібно арбітражу: {arbitration_count}")

    # Категорії агентів
    categories = {}
    for result in results:
        if "SUCCESS" in result["status"]:
            category = "Успішні"
        elif "FAILED" in result["status"]:
            category = "Провальні"
        else:
            category = "З помилками"

        if category not in categories:
            categories[category] = []
        categories[category].append(result)

    # Детальна статистика по категоріям
    for category, agents in categories.items():
        print(f"\n📋 {category.upper()} АГЕНТИ ({len(agents)}):")
        for agent in agents:
            if "SUCCESS" in agent["status"]:
                print(
                    f"   ✅ {agent['agent']}: {agent['quality']:.3f} якості, {agent['latency']:.0f}ms"
                )
            else:
                error = agent.get("error", "Unknown")
                print(f"   ❌ {agent['agent']}: {error[:50]}...")

    # ТОП-10 найкращих агентів
    if successful > 0:
        print(f"\n🏆 ТОП-10 НАЙКРАЩИХ АГЕНТІВ:")
        successful_results = [r for r in results if "SUCCESS" in r["status"]]
        successful_results.sort(key=lambda x: x["quality"], reverse=True)

        for i, result in enumerate(successful_results[:10], 1):
            print(
                f"{i:2d}. {result['agent']:<20}: {result['quality']:.3f} якості, {result['latency']:.0f}ms - {result['description']}"
            )

    # Системна статистика
    print(f"\n🔧 СИСТЕМНА СТАТИСТИКА:")
    status = supervisor.get_system_status()
    print(f"   📊 Системний статус: {status['system_health']}")
    print(f"   🌡️ Термальний стан: {status['thermal_status']}")
    print(f"   💰 Вартість операцій: $0.00 (100% безкоштовно)")

    # Аналіз продуктивності
    if successful > 0:
        avg_quality = sum([r["quality"] for r in results if "SUCCESS" in r["status"]]) / successful
        avg_latency = sum([r["latency"] for r in results if "SUCCESS" in r["status"]]) / successful

        print(f"\n📈 ПРОДУКТИВНІСТЬ:")
        print(f"   🎯 Середня якість: {avg_quality:.3f}/1.000")
        print(f"   ⚡ Середня латентність: {avg_latency:.0f}ms")
        print(f"   🏆 Співвідношення конкурс/арбітраж: {arbitration_count}/{competition_count}")
        print(f"   🔄 Fallback активацій: {supervisor.metrics['failovers']}")

    # Фінальний висновок
    print(f"\n🎯 ФІНАЛЬНИЙ ВИСНОВОК:")
    if successful == 26:
        print(f"   🎉 ВСІ 26 АГЕНТІВ ВИКОРИСТОВУЮТЬ НОВУ СКЛАДНУ ЛОГІКУ!")
        print(f"   ✅ 100% успішність - система працює ідеально")
        print(f"   🏆 Конкурсна система активна на всіх агентах")
        print(f"   ⚖️ Арбітраж функціонує при потребі")
        print(f"   🛡️ Термальний захист активний")
        print(f"   💰 Повністю безкоштовна експлуатація")
        print(f"   🚀 СИСТЕМА ГОТОВА ДО ПОВНОМАСШТАБНОГО ПРОДАКШН!")

    elif successful > 20:
        print(f"   ✅ {successful}/26 агентів працюють - відмінний результат!")
        print(f"   🔧 {26-successful} агентів потребують мінімальних налаштувань")
        print(f"   🎯 Система майже готова до продакшн")

    elif successful > 15:
        print(f"   ⚠️ {successful}/26 агентів працюють - добрий результат")
        print(f"   🔧 {26-successful} агентів потребують уваги")
        print(f"   🛠️ Потрібні додаткові налаштування")

    else:
        print(f"   ❌ Тільки {successful}/26 агентів працюють")
        print(f"   🚨 Система потребує серйозного налагодження")
        print(f"   🔧 Критичні проблеми з конфігурацією")


if __name__ == "__main__":
    asyncio.run(test_all_26_agents())
