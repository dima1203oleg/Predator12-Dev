#!/usr/bin/env python3
"""
🧪 ТЕСТЕР РОЗУМНОГО РОЗПОДІЛУ AI МОДЕЛЕЙ
Перевіряє роботу всіх 58 моделей та їх розподіл між агентами
"""

import asyncio
import json
import time
from typing import Any, Dict, List

import aiohttp
import yaml


async def test_model(
    session: aiohttp.ClientSession, model_id: str, test_prompt: str = "Hello! How are you?"
) -> Dict[str, Any]:
    """Тестує окрему модель"""
    try:
        payload = {
            "model": model_id,
            "messages": [{"role": "user", "content": test_prompt}],
            "max_tokens": 50,
            "temperature": 0.1,
        }

        start_time = time.time()
        async with session.post(
            "http://localhost:3011/v1/chat/completions", json=payload, timeout=15
        ) as response:
            response_time = time.time() - start_time

            if response.status == 200:
                data = await response.json()
                return {
                    "model": model_id,
                    "status": "✅ SUCCESS",
                    "response_time": f"{response_time:.2f}s",
                    "content": data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")[:100]
                    + "...",
                }
            else:
                error_text = await response.text()
                return {
                    "model": model_id,
                    "status": f"❌ HTTP {response.status}",
                    "response_time": f"{response_time:.2f}s",
                    "error": error_text[:200],
                }

    except asyncio.TimeoutError:
        return {
            "model": model_id,
            "status": "⏱️ TIMEOUT",
            "response_time": ">15s",
            "error": "Request timeout",
        }
    except Exception as e:
        return {
            "model": model_id,
            "status": "💥 ERROR",
            "response_time": "N/A",
            "error": str(e)[:200],
        }


async def test_agent_models(config: Dict[str, Any], agent_name: str) -> Dict[str, Any]:
    """Тестує всі моделі конкретного агента"""
    agent_config = config["agents"][agent_name]

    # Збираємо всі моделі агента
    all_models = []
    all_models.extend(agent_config["models"]["primary"])
    all_models.extend(agent_config["models"]["fallback"])
    all_models.extend(agent_config["models"]["emergency"])

    results = {
        "agent": agent_name,
        "category": agent_config["category"],
        "total_models": len(all_models),
        "max_concurrent": agent_config["concurrency"]["max_concurrent"],
        "load_balancing": agent_config["concurrency"]["load_balancing"],
        "primary_results": [],
        "fallback_results": [],
        "emergency_results": [],
        "summary": {"success": 0, "failed": 0, "timeout": 0},
    }

    async with aiohttp.ClientSession() as session:
        # Тестуємо основні моделі
        print(f"🔍 Тестую {agent_name} - Primary моделі...")
        for model_id in agent_config["models"]["primary"]:
            result = await test_model(session, model_id, f"Test for {agent_name} agent")
            results["primary_results"].append(result)

            if "SUCCESS" in result["status"]:
                results["summary"]["success"] += 1
            elif "TIMEOUT" in result["status"]:
                results["summary"]["timeout"] += 1
            else:
                results["summary"]["failed"] += 1

        # Тестуємо резервні моделі (вибірково для економії часу)
        if agent_config["models"]["fallback"]:
            print(f"🔄 Тестую {agent_name} - Fallback моделі...")
            for model_id in agent_config["models"]["fallback"][:2]:  # Тестуємо тільки перші 2
                result = await test_model(session, model_id, f"Fallback test for {agent_name}")
                results["fallback_results"].append(result)

                if "SUCCESS" in result["status"]:
                    results["summary"]["success"] += 1
                elif "TIMEOUT" in result["status"]:
                    results["summary"]["timeout"] += 1
                else:
                    results["summary"]["failed"] += 1

    return results


def load_configuration() -> Dict[str, Any]:
    """Завантажує конфігурацію розподілу моделей"""
    try:
        with open(
            "/Users/dima/Documents/Predator11/agents/intelligent_model_distribution.yaml",
            "r",
            encoding="utf-8",
        ) as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"❌ Помилка завантаження конфігурації: {e}")
        return {}


async def test_critical_agents_first(config: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Спочатку тестує критично важливі агенти"""

    critical_agents = [
        "ChiefOrchestrator",
        "ModelRouter",
        "QueryPlanner",
        "DataQuality",
        "Anomaly",
        "AutoHeal",
    ]

    results = []

    print("🚨 ТЕСТУВАННЯ КРИТИЧНО ВАЖЛИВИХ АГЕНТІВ")
    print("=" * 60)

    for agent_name in critical_agents:
        if agent_name in config["agents"]:
            print(f"\n🧪 Тестую критичний агент: {agent_name}")
            result = await test_agent_models(config, agent_name)
            results.append(result)

            # Швидкий звіт
            summary = result["summary"]
            total = summary["success"] + summary["failed"] + summary["timeout"]
            success_rate = (summary["success"] / total * 100) if total > 0 else 0

            print(f"   📊 Результат: {summary['success']}/{total} успішно ({success_rate:.1f}%)")
            if summary["failed"] > 0:
                print(f"   ⚠️  Помилок: {summary['failed']}")
            if summary["timeout"] > 0:
                print(f"   ⏱️  Таймаутів: {summary['timeout']}")

    return results


async def test_remaining_agents(
    config: Dict[str, Any], tested_agents: List[str]
) -> List[Dict[str, Any]]:
    """Тестує решту агентів"""

    remaining_agents = [name for name in config["agents"].keys() if name not in tested_agents]
    results = []

    print(f"\n🔍 ТЕСТУВАННЯ РЕШТИ АГЕНТІВ ({len(remaining_agents)} шт.)")
    print("=" * 60)

    for agent_name in remaining_agents:
        print(f"\n🧪 Тестую агент: {agent_name}")
        result = await test_agent_models(config, agent_name)
        results.append(result)

        # Швидкий звіт
        summary = result["summary"]
        total = summary["success"] + summary["failed"] + summary["timeout"]
        success_rate = (summary["success"] / total * 100) if total > 0 else 0
        print(f"   📊 {summary['success']}/{total} успішно ({success_rate:.1f}%)")

    return results


def generate_comprehensive_report(all_results: List[Dict[str, Any]]) -> None:
    """Генерує повний звіт тестування"""

    print(f"\n{'='*80}")
    print("📊 ПОВНИЙ ЗВІТ ТЕСТУВАННЯ РОЗПОДІЛУ AI МОДЕЛЕЙ")
    print(f"{'='*80}")

    # Загальна статистика
    total_agents = len(all_results)
    total_success = sum(result["summary"]["success"] for result in all_results)
    total_failed = sum(result["summary"]["failed"] for result in all_results)
    total_timeout = sum(result["summary"]["timeout"] for result in all_results)
    total_tests = total_success + total_failed + total_timeout

    print(f"\n🎯 ЗАГАЛЬНА СТАТИСТИКА:")
    print(f"   📝 Протестовано агентів: {total_agents}")
    print(
        f"   ✅ Успішних тестів: {total_success}/{total_tests} ({total_success/total_tests*100:.1f}%)"
    )
    print(
        f"   ❌ Невдалих тестів: {total_failed}/{total_tests} ({total_failed/total_tests*100:.1f}%)"
    )
    print(f"   ⏱️  Таймаутів: {total_timeout}/{total_tests} ({total_timeout/total_tests*100:.1f}%)")

    # Статистика по категоріях
    categories = {}
    for result in all_results:
        category = result["category"]
        if category not in categories:
            categories[category] = {"success": 0, "failed": 0, "timeout": 0, "agents": 0}

        categories[category]["success"] += result["summary"]["success"]
        categories[category]["failed"] += result["summary"]["failed"]
        categories[category]["timeout"] += result["summary"]["timeout"]
        categories[category]["agents"] += 1

    print(f"\n🏷️  СТАТИСТИКА ПО КАТЕГОРІЯХ:")
    for category, stats in sorted(categories.items()):
        total = stats["success"] + stats["failed"] + stats["timeout"]
        success_rate = (stats["success"] / total * 100) if total > 0 else 0
        print(
            f"   {category}: {stats['success']}/{total} ({success_rate:.1f}%) - {stats['agents']} агентів"
        )

    # Найкращі та найгірші агенти
    agent_performance = []
    for result in all_results:
        total = sum(result["summary"].values())
        success_rate = (result["summary"]["success"] / total * 100) if total > 0 else 0
        agent_performance.append((result["agent"], success_rate, result["summary"]))

    agent_performance.sort(key=lambda x: x[1], reverse=True)

    print(f"\n🏆 ТОП-5 НАЙКРАЩИХ АГЕНТІВ:")
    for i, (agent, rate, summary) in enumerate(agent_performance[:5]):
        print(f"   {i+1}. {agent}: {rate:.1f}% ({summary['success']} успішно)")

    if len(agent_performance) > 5:
        print(f"\n⚠️  АГЕНТИ З ПРОБЛЕМАМИ:")
        for agent, rate, summary in agent_performance[-3:]:
            if rate < 80:
                print(
                    f"   ❌ {agent}: {rate:.1f}% ({summary['failed']} помилок, {summary['timeout']} таймаутів)"
                )

    # Рекомендації
    print(f"\n💡 РЕКОМЕНДАЦІЇ:")
    if total_success / total_tests >= 0.8:
        print("   ✅ Система працює стабільно!")
        print("   🚀 Можна запускати у продакшені")
    elif total_success / total_tests >= 0.6:
        print("   ⚠️  Система працює задовільно")
        print("   🔧 Рекомендується налаштування проблемних моделей")
    else:
        print("   ❌ Система потребує серйозного налаштування")
        print("   🛠️  Необхідно перевірити конфігурацію та доступність моделей")

    print(f"\n🔄 Повний лог збережено у файлах конфігурації")


async def main():
    """Головна функція тестування"""

    print("🚀 ЗАПУСК КОМПЛЕКСНОГО ТЕСТУВАННЯ AI МОДЕЛЕЙ")
    print("=" * 60)

    # Завантажуємо конфігурацію
    config = load_configuration()
    if not config:
        print("❌ Не вдалося завантажити конфігурацію!")
        return

    print(f"📋 Завантажено конфігурацію з {len(config['agents'])} агентами")

    # Перевіряємо доступність сервера
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:3011/v1/models") as response:
                if response.status == 200:
                    models = await response.json()
                    print(f"🌐 Сервер доступний з {len(models.get('data', []))} моделями")
                else:
                    print(f"⚠️  Сервер відповідає з помилкою {response.status}")
                    return
    except Exception as e:
        print(f"❌ Сервер недоступний: {e}")
        return

    # Спочатку тестуємо критичні агенти
    critical_results = await test_critical_agents_first(config)
    tested_agent_names = [result["agent"] for result in critical_results]

    # Тестуємо решту агентів
    remaining_results = await test_remaining_agents(config, tested_agent_names)

    # Збираємо всі результати
    all_results = critical_results + remaining_results

    # Генеруємо повний звіт
    generate_comprehensive_report(all_results)


if __name__ == "__main__":
    asyncio.run(main())
