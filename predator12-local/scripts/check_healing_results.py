#!/usr/bin/env python3
"""
Швидка перевірка результатів роботи агентів самовиправлення
"""

import asyncio
import sys
import time
from datetime import datetime
from pathlib import Path

# Додаємо шлях до скриптів
sys.path.append(str(Path(__file__).parent))


async def check_healing_agents():
    """Перевіряє результати роботи агентів самовиправлення"""

    print("🤖 РЕЗУЛЬТАТИ РОБОТИ АГЕНТІВ САМОВИПРАВЛЕННЯ")
    print("=" * 60)

    # Перевіряємо логи агентів
    log_dir = Path("/Users/dima/Documents/Predator11/logs")

    if log_dir.exists():
        print(f"\n📁 Перевіряю логи в {log_dir}...")

        # Шукаємо логи агентів самовиправлення
        healing_logs = [
            "self_diagnosis.log",
            "selfdiagnosisagent.log",
            "autoheal.log",
            "self_improvement.log",
            "performance_optimizer.log",
        ]

        found_activities = []

        for log_file in healing_logs:
            log_path = log_dir / "agents" / log_file
            if log_path.exists():
                print(f"   ✅ Знайдено: {log_file}")
                try:
                    with open(log_path, "r") as f:
                        lines = f.readlines()
                        if lines:
                            last_line = lines[-1].strip()
                            found_activities.append(
                                {
                                    "agent": log_file.replace(".log", ""),
                                    "last_activity": last_line,
                                    "lines_count": len(lines),
                                }
                            )
                except Exception as e:
                    print(f"   ❌ Помилка читання {log_file}: {e}")
            else:
                print(f"   ❓ Не знайдено: {log_file}")

    # Перевіряємо результати останнього тестування
    print(f"\n🧪 РЕЗУЛЬТАТИ ОСТАННЬОГО ТЕСТУВАННЯ АГЕНТІВ:")
    print("-" * 50)

    try:
        # Імпортуємо та запускаємо швидкий тест
        from production_model_distribution import ProductionSupervisor

        supervisor = ProductionSupervisor()

        # Тестуємо ключові агенти самовиправлення
        agents_to_test = ["SelfDiagnosis", "AutoHeal", "SelfImprovement", "PerformanceOptimizer"]

        results = {}

        for agent_name in agents_to_test:
            try:
                # Швидкий тест агента
                start_time = time.time()

                result = supervisor.process_request(
                    agent_name, "quick_health_check", {"test_type": "diagnostic"}
                )

                end_time = time.time()
                latency = (end_time - start_time) * 1000

                if result.get("success"):
                    results[agent_name] = {
                        "status": "✅ Працює",
                        "model": result.get("winner_model", "Unknown"),
                        "quality": result.get("quality_score", 0.0),
                        "latency": latency,
                        "recommendations": len(result.get("recommendations", [])),
                    }

                    print(
                        f"   {agent_name:20} | ✅ | {result.get('winner_model', 'N/A')[:30]:30} | {result.get('quality_score', 0.0):.3f}"
                    )
                else:
                    results[agent_name] = {
                        "status": "❌ Помилка",
                        "error": result.get("error", "Unknown error"),
                    }
                    print(
                        f"   {agent_name:20} | ❌ | {'ERROR: ' + str(result.get('error', 'Unknown'))[:30]:30} | 0.000"
                    )

            except Exception as e:
                results[agent_name] = {"status": "💥 Критична помилка", "error": str(e)}
                print(f"   {agent_name:20} | 💥 | {'CRASH: ' + str(e)[:30]:30} | 0.000")

        # Підсумок
        successful = sum(1 for r in results.values() if "✅" in r["status"])
        total = len(results)

        print(f"\n📊 ПІДСУМОК:")
        print(f"   Успішних агентів: {successful}/{total}")
        print(f"   Відсоток успіху: {(successful/total*100):.1f}%")

        if successful > 0:
            avg_quality = (
                sum(r.get("quality", 0.0) for r in results.values() if "✅" in r["status"])
                / successful
            )
            print(f"   Середня якість: {avg_quality:.3f}")

        print(f"\n🎯 ВИСНОВКИ:")
        if successful == total:
            print("   🚀 ВСІ АГЕНТИ САМОВИПРАВЛЕННЯ ПОВНІСТЮ ФУНКЦІОНАЛЬНІ!")
            print("   💡 Система готова автоматично виявляти та усувати проблеми")
        elif successful > total // 2:
            print(f"   ⚠️ СИСТЕМА ЧАСТКОВО ФУНКЦІОНАЛЬНА ({successful}/{total})")
            print("   🔧 Деякі агенти потребують налаштування")
        else:
            print("   ❌ КРИТИЧНІ ПРОБЛЕМИ З АГЕНТАМИ САМОВИПРАВЛЕННЯ")
            print("   🆘 Потрібна ручна діагностика та виправлення")

    except Exception as e:
        print(f"❌ Помилка під час тестування: {e}")
        print("🔧 Агенти самовиправлення недоступні для тестування")

    # Перевіряємо активність контейнерів
    print(f"\n🐳 СТАН КОНТЕЙНЕРНОЇ ІНФРАСТРУКТУРИ:")
    try:
        import subprocess

        result = subprocess.run(
            ["docker", "ps", "--format", "table {{.Names}}\\t{{.Status}}"],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            lines = result.stdout.strip().split("\n")[1:]  # Skip header
            containers = len(lines)
            running = sum(1 for line in lines if "Up" in line)

            print(f"   Всього контейнерів: {containers}")
            print(f"   Запущених: {running}")
            print(f"   Відсоток доступності: {(running/containers*100):.1f}%")

            if running == containers:
                print("   ✅ Вся інфраструктура працює стабільно")
            else:
                print(f"   ⚠️ {containers - running} контейнерів потребують уваги")

    except Exception as e:
        print(f"   ❌ Помилка перевірки контейнерів: {e}")

    print(f"\n🕒 Дата перевірки: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(check_healing_agents())
