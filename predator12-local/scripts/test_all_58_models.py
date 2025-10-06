#!/usr/bin/env python3
"""
🧪 АВТОМАТИЧНЕ ТЕСТУВАННЯ ВСІХ 58 БЕЗКОШТОВНИХ AI МОДЕЛЕЙ
Перевіряє доступність кожної моделі на сервері та виправляє помилки
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any, Tuple
from datetime import datetime
import logging

# Налаштування логування
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/dima/Documents/Predator11/logs/model_testing.log'),
        logging.StreamHandler()
    ]
)

# Всі 58 безкоштовних моделей
ALL_MODELS = [
    "deepseek/deepseek-r1", "meta/meta-llama-3.3-70b-instruct", "openai/gpt-4o-2024-11-20",
    "microsoft/phi-4", "qwen/qwen2.5-72b-instruct", "mistral/mixtral-8x22b-instruct",
    "openai/o1-preview-2024-09-12", "xai/grok-2-1212", "meta/meta-llama-3.2-90b-vision-instruct",
    "deepseek/deepseek-v3", "openai/gpt-4o-mini-2024-07-18", "microsoft/phi-3-medium-128k-instruct",
    "qwen/qwen2.5-32b-instruct", "mistral/mistral-large-2411", "cohere/command-r-plus-08-2024",
    "meta/meta-llama-3.2-11b-vision-instruct", "openai/o1-mini-2024-09-12", 
    "microsoft/phi-3-vision-128k-instruct", "deepseek/deepseek-coder-v2-lite", 
    "ai21/ai21-jamba-1-5-large", "meta/meta-llama-3.2-3b-instruct", "meta/meta-llama-3.2-1b-instruct",
    "microsoft/phi-3-small-128k-instruct", "microsoft/phi-3-small-8k-instruct", 
    "microsoft/phi-3-mini-128k-instruct", "microsoft/phi-3-mini-4k-instruct",
    "qwen/qwen2.5-14b-instruct", "qwen/qwen2.5-7b-instruct", "qwen/qwen2.5-3b-instruct",
    "qwen/qwen2.5-1.5b-instruct", "qwen/qwen2.5-0.5b-instruct", "mistral/ministral-8b-2410",
    "mistral/ministral-3b-2410", "cohere/command-r-08-2024", "cohere/command-r7b-12-2024",
    "deepseek/deepseek-coder-v2", "ai21/ai21-jamba-1-5-mini", "core42/jais-30b-chat",
    "xai/grok-2-vision-1212", "meta/meta-llama-3.1-8b-instruct", "meta/meta-llama-3.1-70b-instruct",
    "meta/meta-llama-3.1-405b-instruct", "openai/gpt-4-turbo-2024-04-09", "openai/gpt-4-0613",
    "openai/gpt-4-0125-preview", "openai/gpt-3.5-turbo-0125", "openai/gpt-3.5-turbo-1106",
    "openai/chatgpt-4o-latest", "openai/gpt-4o-2024-08-06", "openai/gpt-4o-2024-05-13",
    "openai/o2-2024-12-17", "openai/o3-mini-2024-12-17", "openai/o4-2024-12-17",
    "mistral/mistral-nemo-2407", "mistral/codestral-2405", "cohere/command-light",
    "cohere/embed-english-v3.0", "cohere/embed-multilingual-v3.0"
]

# Конфігурація серверів
SERVERS = [
    {"url": "http://localhost:3010", "name": "Local Server 3010"},
    {"url": "http://localhost:3011", "name": "Local Server 3011"},
    {"url": "http://localhost:8000", "name": "Backend API 8000"},
]

class ModelTester:
    def __init__(self):
        self.results = {
            "tested_at": datetime.now().isoformat(),
            "total_models": len(ALL_MODELS),
            "servers": SERVERS,
            "results": {},
            "summary": {
                "working": 0,
                "failed": 0,
                "errors": []
            }
        }
        
    async def test_model_on_server(self, session: aiohttp.ClientSession, 
                                 model: str, server: Dict[str, str]) -> Tuple[bool, str]:
        """Тестує одну модель на одному сервері"""
        try:
            # Різні endpoints для різних серверів
            endpoints = [
                f"{server['url']}/v1/chat/completions",
                f"{server['url']}/api/v1/chat/completions", 
                f"{server['url']}/chat/completions",
                f"{server['url']}/api/models/{model}/chat"
            ]
            
            test_payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": "Hi! Please respond with just 'OK' if you're working."}
                ],
                "max_tokens": 10,
                "temperature": 0.1
            }
            
            for endpoint in endpoints:
                try:
                    async with session.post(
                        endpoint,
                        json=test_payload,
                        timeout=aiohttp.ClientTimeout(total=15),
                        headers={"Content-Type": "application/json"}
                    ) as response:
                        
                        if response.status == 200:
                            data = await response.json()
                            if "choices" in data and data["choices"]:
                                content = data["choices"][0].get("message", {}).get("content", "")
                                logging.info(f"✅ {model} працює на {server['name']} ({endpoint}): {content[:50]}")
                                return True, f"Working on {endpoint}"
                                
                        elif response.status in [404, 400]:
                            continue  # Спробуємо інший endpoint
                        else:
                            error_text = await response.text()
                            logging.warning(f"⚠️ {model} на {server['name']} ({endpoint}): {response.status} - {error_text[:100]}")
                            
                except asyncio.TimeoutError:
                    logging.warning(f"⏱️ Timeout для {model} на {server['name']} ({endpoint})")
                    continue
                except Exception as e:
                    logging.warning(f"🔧 Помилка {model} на {server['name']} ({endpoint}): {str(e)[:100]}")
                    continue
                    
            return False, f"Failed on all endpoints for {server['name']}"
            
        except Exception as e:
            error_msg = f"Critical error: {str(e)}"
            logging.error(f"❌ Критична помилка для {model} на {server['name']}: {error_msg}")
            return False, error_msg
    
    async def test_all_models(self):
        """Тестує всі моделі на всіх серверах"""
        logging.info(f"🚀 Починаю тестування {len(ALL_MODELS)} моделей на {len(SERVERS)} серверах...")
        
        async with aiohttp.ClientSession() as session:
            for i, model in enumerate(ALL_MODELS, 1):
                logging.info(f"\n📊 [{i}/{len(ALL_MODELS)}] Тестую модель: {model}")
                
                model_results = {}
                model_working = False
                
                # Тестуємо модель на кожному сервері
                for server in SERVERS:
                    success, message = await self.test_model_on_server(session, model, server)
                    model_results[server["name"]] = {
                        "success": success,
                        "message": message,
                        "tested_at": datetime.now().isoformat()
                    }
                    
                    if success:
                        model_working = True
                
                # Зберігаємо результат
                self.results["results"][model] = {
                    "working": model_working,
                    "servers": model_results,
                    "status": "✅ Working" if model_working else "❌ Failed"
                }
                
                # Оновлюємо статистику
                if model_working:
                    self.results["summary"]["working"] += 1
                    logging.info(f"✅ {model} - ПРАЦЮЄ")
                else:
                    self.results["summary"]["failed"] += 1 
                    self.results["summary"]["errors"].append({
                        "model": model,
                        "reason": "Not working on any server"
                    })
                    logging.error(f"❌ {model} - НЕ ПРАЦЮЄ")
                
                # Невелика пауза між тестами
                await asyncio.sleep(0.5)
        
        logging.info("\n🏁 Тестування завершено!")
        logging.info(f"✅ Працюючих моделей: {self.results['summary']['working']}")
        logging.info(f"❌ Не працюючих моделей: {self.results['summary']['failed']}")
        
    def save_results(self):
        """Зберігає результати тестування"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Зберігаємо детальний звіт
        report_path = f"/Users/dima/Documents/Predator11/MODEL_TESTING_REPORT_{timestamp}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        # Зберігаємо короткий звіт  
        summary_path = f"/Users/dima/Documents/Predator11/MODEL_TEST_SUMMARY_{timestamp}.md"
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# 🧪 ЗВІТ ТЕСТУВАННЯ 58 AI МОДЕЛЕЙ\n\n")
            f.write(f"**Дата тестування:** {self.results['tested_at']}\n\n")
            f.write("## 📊 СТАТИСТИКА\n\n")
            f.write(f"- 🔢 Всього моделей: {self.results['total_models']}\n")
            f.write(f"- ✅ Працюючих: {self.results['summary']['working']}\n")
            f.write(f"- ❌ Не працюючих: {self.results['summary']['failed']}\n")
            f.write(f"- 🎯 Успішність: {(self.results['summary']['working']/self.results['total_models']*100):.1f}%\n\n")
            
            f.write(f"## ✅ ПРАЦЮЮЧІ МОДЕЛІ\n\n")
            for model, result in self.results["results"].items():
                if result["working"]:
                    working_servers = [name for name, srv in result["servers"].items() if srv["success"]]
                    f.write(f"- `{model}` - {', '.join(working_servers)}\n")
            
            f.write(f"\n## ❌ НЕ ПРАЦЮЮЧІ МОДЕЛІ\n\n")
            for model, result in self.results["results"].items():
                if not result["working"]:
                    f.write(f"- `{model}` - потребує виправлення\n")
                    
            f.write(f"\n## 🔧 РЕКОМЕНДАЦІЇ\n\n")
            if self.results['summary']['failed'] > 0:
                f.write(f"1. Перевірити конфігурацію серверів для неробочих моделей\n")
                f.write(f"2. Оновити model registry з робочими моделями\n") 
                f.write(f"3. Налаштувати fallback для критично важливих агентів\n")
            else:
                f.write(f"🎉 Всі моделі працюють відмінно!\n")
        
        logging.info(f"📄 Детальний звіт: {report_path}")
        logging.info(f"📋 Короткий звіт: {summary_path}")
        
        return report_path, summary_path

async def main():
    """Головна функція"""
    print("🧪 АВТОМАТИЧНЕ ТЕСТУВАННЯ 58 AI МОДЕЛЕЙ")
    print("=" * 50)
    
    tester = ModelTester()
    
    try:
        await tester.test_all_models()
        report_path, summary_path = tester.save_results()
        
        print(f"\n🎯 ФІНАЛЬНА СТАТИСТИКА:")
        print(f"✅ Працюючих моделей: {tester.results['summary']['working']}/58")
        print(f"❌ Не працюючих моделей: {tester.results['summary']['failed']}/58") 
        print(f"🎯 Успішність: {(tester.results['summary']['working']/58*100):.1f}%")
        print(f"\n📊 Звіти збережені:")
        print(f"   📄 Детальний: {report_path}")
        print(f"   📋 Короткий: {summary_path}")
        
        # Якщо є неробочі моделі - створюємо план виправлення
        if tester.results['summary']['failed'] > 0:
            print(f"\n🔧 Створюю план виправлення...")
            await create_fix_plan(tester.results)
        else:
            print(f"\n🎉 Всі моделі працюють відмінно!")
            
    except Exception as e:
        logging.error(f"❌ Критична помилка: {e}")
        print(f"❌ Помилка під час тестування: {e}")

async def create_fix_plan(results: Dict[str, Any]):
    """Створює план виправлення для неробочих моделей"""
    
    failed_models = []
    for model, result in results["results"].items():
        if not result["working"]:
            failed_models.append(model)
    
    fix_plan = {
        "failed_models": failed_models,
        "fix_strategies": [
            {
                "step": 1,
                "action": "Перевірити доступність серверів",
                "commands": [
                    "curl -s http://localhost:3010/health || echo 'Server 3010 недоступний'",
                    "curl -s http://localhost:3011/health || echo 'Server 3011 недоступний'"
                ]
            },
            {
                "step": 2, 
                "action": "Оновити model registry з робочими моделями",
                "file": "/Users/dima/Documents/Predator11/agents/registry.yaml"
            },
            {
                "step": 3,
                "action": "Налаштувати fallback для критичних агентів", 
                "priority_agents": ["ChiefOrchestrator", "ModelRouter", "QueryPlanner"]
            }
        ]
    }
    
    fix_path = f"/Users/dima/Documents/Predator11/MODEL_FIX_PLAN_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(fix_path, 'w', encoding='utf-8') as f:
        json.dump(fix_plan, f, indent=2, ensure_ascii=False)
    
    print(f"🔧 План виправлення збережено: {fix_path}")

if __name__ == "__main__":
    asyncio.run(main())
