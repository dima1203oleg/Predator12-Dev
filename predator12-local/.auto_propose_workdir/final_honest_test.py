#!/usr/bin/env python3
"""
🔍 РЕАЛЬНА ПЕРЕВІРКА: ЧИ АГЕНТИ ВИКОРИСТОВУЮТЬ AI МОДЕЛІ
Чесний тест без фіктивних відповідей
"""
import asyncio
import httpx
import json
import subprocess
import logging
import os
import glob

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_real_agent_ai_usage():
    """Реальна перевірка використання AI моделей агентами"""

    print("🔍 РЕАЛЬНА ПЕРЕВІРКА ВИКОРИСТАННЯ AI МОДЕЛЕЙ АГЕНТАМИ")
    print("="*80)

    results = {
        "model_sdk_accessible": False,
        "agents_can_connect": False,
        "agents_get_real_responses": False,
        "containers_healthy": 0,
        "containers_total": 0,
        "real_agents_found": 0,
        "agents_with_ai_code": 0
    }

    # 1. Перевірка доступності Model SDK
    print("🔌 Перевіряю Model SDK...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:3010/health")
            if response.status_code == 200:
                results["model_sdk_accessible"] = True
                health_data = response.json()
                print(f"✅ Model SDK доступний: {health_data.get('models_total', 'N/A')} моделей")

                # Перевіряємо список моделей
                models_response = await client.get("http://localhost:3010/v1/models")
                if models_response.status_code == 200:
                    models_data = models_response.json()
                    total_models = len(models_data.get('data', []))
                    print(f"📊 Доступно моделей через API: {total_models}")
            else:
                print(f"❌ Model SDK недоступний: HTTP {response.status_code}")
    except Exception as e:
        print(f"❌ Model SDK недоступний: {str(e)}")

    # 2. Перевірка стану контейнерів
    print("\n🐳 Перевіряю стан контейнерів...")
    try:
        result = subprocess.run(['docker', 'ps', '--format', 'table {{.Names}}\t{{.Status}}'],
                              capture_output=True, text=True)

        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            results["containers_total"] = len(lines)

            healthy_count = 0
            unhealthy_containers = []

            for line in lines:
                parts = line.split('\t')
                if len(parts) >= 2:
                    name = parts[0].strip()
                    status = parts[1].strip()

                    if 'healthy' in status or ('Up' in status and 'unhealthy' not in status and 'starting' not in status):
                        healthy_count += 1
                    else:
                        unhealthy_containers.append(f"{name}: {status}")

            results["containers_healthy"] = healthy_count
            print(f"📊 Контейнери: {healthy_count}/{len(lines)} здорових")

            if unhealthy_containers:
                print("⚠️ Проблемні контейнери:")
                for container in unhealthy_containers[:5]:  # Показуємо перші 5
                    print(f"  - {container}")
        else:
            print("❌ Не можу перевірити стан контейнерів")

    except Exception as e:
        print(f"❌ Помилка перевірки контейнерів: {e}")

    # 3. Перевірка реальних файлів агентів
    print("\n📁 Шукаю справжні файли агентів...")
    agent_files = find_real_agent_files()
    results["real_agents_found"] = len(agent_files)

    agents_with_ai = 0
    for agent_file in agent_files:
        if check_agent_has_ai_integration(agent_file):
            agents_with_ai += 1

    results["agents_with_ai_code"] = agents_with_ai
    print(f"📋 Знайдено агентів: {len(agent_files)}")
    print(f"🤖 Агентів з AI кодом: {agents_with_ai}")

    # 4. Тестування Model SDK
    if results["model_sdk_accessible"]:
        print("\n🧪 Тестую реальні запити до Model SDK...")
        ai_test_results = await test_model_sdk_responses()
        results.update(ai_test_results)

    # 5. Перевірка логів агентів
    print("\n📋 Аналізую логи агентів...")
    agent_activity = await check_agent_logs()

    # 6. Перевірка конфігурації
    print("\n⚙️ Перевіряю конфігурацію системи...")
    config_check = check_system_configuration()

    # 7. Фінальні висновки
    print("\n" + "="*80)
    print("📋 ДЕТАЛЬНІ РЕЗУЛЬТАТИ")
    print("="*80)

    print(f"🔌 Model SDK: {'✅ Працює' if results['model_sdk_accessible'] else '❌ Недоступний'}")
    print(f"🐳 Контейнери: {results['containers_healthy']}/{results['containers_total']} здорових ({(results['containers_healthy']/results['containers_total']*100):.1f}%)")
    print(f"📁 Агенти знайдено: {results['real_agents_found']}")
    print(f"🤖 Агенти з AI кодом: {results['agents_with_ai_code']}")

    if results.get("agents_can_connect"):
        print("✅ Агенти можуть підключатись до Model SDK")
    else:
        print("❌ Агенти НЕ можуть підключатись до Model SDK")

    if results.get("agents_get_real_responses"):
        print("✅ Агенти отримують РЕАЛЬНІ AI відповіді")
    else:
        print("❌ Агенти отримують тільки ДЕМО/MOCK відповіді")

    if agent_activity.get("real_ai_usage"):
        print("✅ Знайдено докази реального використання AI в логах")
    else:
        print("❌ Немає доказів реального використання AI в логах")

    # Загальний висновок
    print("\n🎯 ЗАГАЛЬНИЙ ВИСНОВОК:")

    # Розрахунок загального скору
    score = 0
    max_score = 6

    if results["model_sdk_accessible"]: score += 1
    if results["containers_healthy"] / results["containers_total"] > 0.7: score += 1
    if results["real_agents_found"] > 0: score += 1
    if results["agents_with_ai_code"] > 0: score += 1
    if results.get("agents_can_connect"): score += 1
    if results.get("agents_get_real_responses"): score += 1

    print(f"📊 Загальний скор системи: {score}/{max_score} ({score/max_score*100:.1f}%)")

    if score >= 5:
        print("✅ СИСТЕМА ПОВНІСТЮ ФУНКЦІОНАЛЬНА: Агенти реально використовують AI моделі")
    elif score >= 3:
        print("⚠️ СИСТЕМА ЧАСТКОВО ПРАЦЮЄ: Агенти підключені, але використовують демо")
    elif score >= 1:
        print("🔧 СИСТЕМА ПОТРЕБУЄ НАЛАШТУВАННЯ: Основні компоненти працюють")
    else:
        print("❌ СИСТЕМА НЕ ФУНКЦІОНАЛЬНА: Агенти не використовують AI моделі")

    return results

def find_real_agent_files():
    """Знаходить справжні файли агентів в системі"""
    agent_files = []

    # Шукаємо в директоріях агентів
    search_paths = [
        "/Users/dima/Documents/Predator11/agents/**/*.py",
        "/Users/dima/Documents/Predator11/backend/app/agents/**/*.py"
    ]

    for pattern in search_paths:
        files = glob.glob(pattern, recursive=True)
        for file in files:
            if os.path.getsize(file) > 1000:  # Файли більше 1KB
                agent_files.append(file)

    return agent_files

def check_agent_has_ai_integration(agent_file):
    """Перевіряє чи має агент інтеграцію з AI"""
    try:
        with open(agent_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Шукаємо ознаки AI інтеграції
        ai_indicators = [
            'model_sdk', 'MODEL_SDK', 'chat_completion', 'openai', 'anthropic',
            'gpt-', 'claude-', 'llama', 'ai_model', 'LLM', 'language_model',
            'http://localhost:3010', 'v1/chat/completions'
        ]

        return any(indicator in content for indicator in ai_indicators)

    except Exception:
        return False

async def test_model_sdk_responses():
    """Тестує різні типи відповідей від Model SDK"""
    results = {
        "agents_can_connect": False,
        "agents_get_real_responses": False,
        "demo_responses_detected": False,
        "error_responses": 0
    }

    test_cases = [
        {"model": "gpt-4", "content": "Привіт, це реальний тест"},
        {"model": "claude-3", "content": "Проаналізуй дані системи"},
        {"model": "llama-3.1-70b", "content": "Надай технічні рекомендації"},
        {"model": "nonexistent-model", "content": "Тест неіснуючої моделі"}
    ]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            for i, test_case in enumerate(test_cases):
                try:
                    test_request = {
                        "model": test_case["model"],
                        "messages": [{"role": "user", "content": test_case["content"]}],
                        "max_tokens": 100
                    }

                    response = await client.post("http://localhost:3010/v1/chat/completions",
                                               json=test_request)

                    if response.status_code == 200:
                        data = response.json()
                        if "choices" in data and len(data["choices"]) > 0:
                            content = data["choices"][0]["message"]["content"].lower()

                            results["agents_can_connect"] = True

                            # Аналізуємо тип відповіді
                            if any(word in content for word in ["demo", "mock", "fallback", "заглушка"]):
                                results["demo_responses_detected"] = True
                                print(f"  Test {i+1}: ДЕМО відповідь від {test_case['model']}")
                            elif "api тимчасово недоступний" in content or "error" in content:
                                results["error_responses"] += 1
                                print(f"  Test {i+1}: ПОМИЛКА від {test_case['model']}")
                            else:
                                results["agents_get_real_responses"] = True
                                print(f"  Test {i+1}: РЕАЛЬНА відповідь від {test_case['model']}")
                    else:
                        results["error_responses"] += 1
                        print(f"  Test {i+1}: HTTP помилка {response.status_code}")

                except Exception as e:
                    results["error_responses"] += 1
                    print(f"  Test {i+1}: Помилка запиту - {str(e)[:50]}...")

    except Exception as e:
        print(f"❌ Помилка тестування Model SDK: {e}")

    return results

async def check_agent_logs():
    """Перевіряє логи агентів на предмет реального використання AI"""
    results = {
        "real_ai_usage": False,
        "mock_usage_detected": False,
        "agents_checked": 0,
        "ai_requests_found": 0
    }

    # Список контейнерів для перевірки
    agent_containers = [
        "predator11-scheduler-1",
        "predator11-celery-worker-1",
        "predator11-worker-1",
        "predator11-backend-1"
    ]

    for container in agent_containers:
        try:
            result = subprocess.run(['docker', 'logs', '--tail', '50', container],
                                  capture_output=True, text=True, timeout=10)

            if result.returncode == 0:
                logs = result.stdout.lower()
                results["agents_checked"] += 1

                # Шукаємо ознаки AI запитів
                ai_patterns = ['gpt-4', 'claude', 'llama', '/v1/chat/completions', 'model_sdk', 'ai completion']
                mock_patterns = ['mock', 'demo', 'fallback', 'test response']

                ai_found = sum(1 for pattern in ai_patterns if pattern in logs)
                mock_found = sum(1 for pattern in mock_patterns if pattern in logs)

                if ai_found > 0:
                    results["ai_requests_found"] += ai_found
                    if mock_found == 0:
                        results["real_ai_usage"] = True

                if mock_found > 0:
                    results["mock_usage_detected"] = True

                print(f"  {container}: AI patterns: {ai_found}, Mock patterns: {mock_found}")

        except Exception as e:
            print(f"  {container}: Не можу перевірити логи - {str(e)[:30]}...")
            continue

    return results

def check_system_configuration():
    """Перевіряє конфігурацію системи"""
    config_issues = []

    # Перевіряємо важливі файли конфігурації
    config_files = [
        "/Users/dima/Documents/Predator11/docker-compose.yml",
        "/Users/dima/Documents/Predator11/.env",
        "/Users/dima/Documents/Predator11/backend/app/agents/specialized_model_router.py"
    ]

    for file_path in config_files:
        if not os.path.exists(file_path):
            config_issues.append(f"Відсутній файл: {file_path}")

    if config_issues:
        print("⚠️ Проблеми конфігурації:")
        for issue in config_issues:
            print(f"  - {issue}")
    else:
        print("✅ Основні файли конфігурації на місці")

    return len(config_issues) == 0

if __name__ == "__main__":
    asyncio.run(test_real_agent_ai_usage())
