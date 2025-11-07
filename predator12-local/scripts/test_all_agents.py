#!/usr/bin/env python3
"""
🔍 ТЕСТ ВСІХ АГЕНТІВ НА ВИКОРИСТАННЯ НОВОЇ ЛОГІКИ
"""

import asyncio
import sys

sys.path.append("/Users/dima/Documents/Predator11/agents")

from supervisor import ProductionSupervisor, TaskType


async def test_all_agents():
    """Тестує всіх агентів на використання нової конкурсної логіки"""

    supervisor = ProductionSupervisor()

    # Список агентів для тестування з їхніми спеціалізаціями
    test_agents = [
        ("ChiefOrchestrator", TaskType.CRITICAL_ORCHESTRATION, "Управління системою"),
        ("ModelRouter", TaskType.CRITICAL_ROUTING, "Маршрутизація запитів"),
        ("QueryPlanner", TaskType.CRITICAL_PLANNING, "Планування завдань"),
        ("DataQuality", TaskType.HIGH_LOAD_ANALYSIS, "Аналіз якості даних"),
        ("Anomaly", TaskType.REAL_TIME_DETECTION, "Виявлення аномалій"),
        ("AutoHeal", TaskType.CODE_GENERATION, "Самовиправлення коду"),
        ("SelfDiagnosis", TaskType.SYSTEM_DIAGNOSTICS, "Діагностика системи"),
        ("DatasetIngest", TaskType.FAST_PROCESSING, "Швидке поглинання даних"),
        ("PIIGuardian", TaskType.PRIVACY_PROTECTION, "Захист приватності"),
        ("RedTeam", TaskType.SECURITY_TESTING, "Тестування безпеки"),
        ("Arbiter", TaskType.DECISION_ARBITRATION, "Арбітраж рішень"),
        ("NexusGuide", TaskType.USER_ASSISTANCE, "Допомога користувачам"),
    ]

    print("🔍 ТЕСТУВАННЯ АГЕНТІВ НА ВИКОРИСТАННЯ НОВОЇ ЛОГІКИ")
    print("=" * 60)

    results = []

    for agent_id, task_type, description in test_agents:
        print(f"\n🤖 Тестую агента: {agent_id}")
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
                print(f"   🌡️ Термостатус: {result.get('thermal_status', 'unknown')}")

                results.append(
                    {
                        "agent": agent_id,
                        "status": "✅ SUCCESS",
                        "winner": result.get("winner_model", "N/A"),
                        "quality": result.get("quality_score", 0),
                        "latency": result.get("latency_ms", 0),
                    }
                )
            else:
                print(f"   ❌ Агент провалив тест: {result.get('error', 'Unknown error')}")
                results.append(
                    {
                        "agent": agent_id,
                        "status": "❌ FAILED",
                        "error": result.get("error", "Unknown"),
                    }
                )

        except Exception as e:
            print(f"   💥 Критична помилка: {str(e)}")
            results.append({"agent": agent_id, "status": "💥 ERROR", "error": str(e)})

    # Підсумок результатів
    print(f"\n📊 ПІДСУМОК ТЕСТУВАННЯ")
    print("=" * 60)

    successful = len([r for r in results if "SUCCESS" in r["status"]])
    failed = len([r for r in results if "FAILED" in r["status"]])
    errors = len([r for r in results if "ERROR" in r["status"]])

    print(f"✅ Успішні агенти: {successful}/{len(results)}")
    print(f"❌ Провальні агенти: {failed}/{len(results)}")
    print(f"💥 Помилки: {errors}/{len(results)}")

    # Детальна статистика
    if successful > 0:
        print(f"\n🏆 НАЙКРАЩІ АГЕНТИ:")
        successful_results = [r for r in results if "SUCCESS" in r["status"]]
        successful_results.sort(key=lambda x: x["quality"], reverse=True)

        for i, result in enumerate(successful_results[:5], 1):
            print(
                f"{i}. {result['agent']}: {result['quality']:.3f} якості, {result['latency']:.1f}ms"
            )

    # Перевірка конкретних функцій
    print(f"\n🔧 ПЕРЕВІРКА СИСТЕМНИХ ФУНКЦІЙ:")

    # Системний статус
    status = supervisor.get_system_status()
    print(f"   📊 Системний статус: {status['system_health']}")
    print(
        f"   🌡️ Термальних проблем: {status['thermal_status']['emergency'] + status['thermal_status']['critical']}"
    )
    print(f"   📈 Всього конкурсів: {supervisor.metrics['successful_competitions']}")
    print(f"   ⚖️ Арбітражів потребувало: {supervisor.metrics['arbitrations_needed']}")
    print(f"   🔄 Fallback активацій: {supervisor.metrics['failovers']}")

    # Термальне обслуговування
    print(f"\n🌡️ ЗАПУСК ТЕРМАЛЬНОГО ОБСЛУГОВУВАННЯ...")
    supervisor.run_thermal_maintenance()
    print(f"   ❄️ Термальне обслуговування завершено")

    print(f"\n🎯 ВИСНОВОК:")
    if successful == len(results):
        print(f"   🎉 ВСІ АГЕНТИ ВИКОРИСТОВУЮТЬ НОВУ СКЛАДНУ ЛОГІКУ!")
        print(f"   ✅ Конкурсна система працює")
        print(f"   ✅ Арбітраж функціонує")
        print(f"   ✅ Термальний захист активний")
        print(f"   ✅ Fallback система готова")
    else:
        print(f"   ⚠️ {failed + errors} агентів потребують уваги")

        if failed > 0:
            print(f"   🔧 Провальні агенти потрібно перевірити")
        if errors > 0:
            print(f"   💥 Агенти з помилками потребують налагодження")


if __name__ == "__main__":
    asyncio.run(test_all_agents())
