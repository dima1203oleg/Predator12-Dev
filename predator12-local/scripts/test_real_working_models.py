#!/usr/bin/env python3
"""
🧪 ВИПРАВЛЕНИЙ ТЕСТ ВСІХ РЕАЛЬНИХ AI МОДЕЛЕЙ
Використовує реальні назви моделей з сервера
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
        logging.FileHandler('/Users/dima/Documents/Predator11/logs/real_model_testing.log'),
        logging.StreamHandler()
    ]
)

# РЕАЛЬНІ моделі з сервера (отримані з /v1/models)
REAL_MODELS = [
    "ai21-labs/ai21-jamba-1.5-large",
    "ai21-labs/ai21-jamba-1.5-mini", 
    "cohere/cohere-command-a",
    "cohere/cohere-command-r-08-2024",
    "cohere/cohere-command-r-plus-08-2024",
    "cohere/cohere-embed-v3-english",
    "cohere/cohere-embed-v3-multilingual",
    "core42/jais-30b-chat",
    "deepseek/deepseek-r1",
    "deepseek/deepseek-r1-0528",
    "deepseek/deepseek-v3-0324",
    "meta/llama-3.2-11b-vision-instruct",
    "meta/llama-3.2-90b-vision-instruct",
    "meta/llama-3.3-70b-instruct",
    "meta/llama-4-maverick-17b-128e-instruct-fp8",
    "meta/llama-4-scout-17b-16e-instruct",
    "meta/meta-llama-3.1-405b-instruct",
    "meta/meta-llama-3.1-8b-instruct",
    "microsoft/mai-ds-r1",
    "microsoft/phi-3-medium-128k-instruct",
    "microsoft/phi-3-medium-4k-instruct",
    "microsoft/phi-3-mini-128k-instruct",
    "microsoft/phi-3-mini-4k-instruct",
    "microsoft/phi-3-small-128k-instruct",
    "microsoft/phi-3-small-8k-instruct",
    "microsoft/phi-3.5-mini-instruct",
    "microsoft/phi-3.5-moe-instruct",
    "microsoft/phi-3.5-vision-instruct",
    "microsoft/phi-4",
    "microsoft/phi-4-mini-instruct",
    "microsoft/phi-4-mini-reasoning",
    "microsoft/phi-4-multimodal-instruct",
    "microsoft/phi-4-reasoning",
    "mistral-ai/codestral-2501",
    "mistral-ai/ministral-3b",
    "mistral-ai/mistral-large-2411",
    "mistral-ai/mistral-medium-2505",
    "mistral-ai/mistral-nemo",
    "mistral-ai/mistral-small-2503",
    "openai/gpt-4.1",
    "openai/gpt-4.1-mini",
    "openai/gpt-4.1-nano",
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/gpt-5",
    "openai/gpt-5-chat",
    "openai/gpt-5-mini",
    "openai/gpt-5-nano",
    "openai/o1",
    "openai/o1-mini",
    "openai/o1-preview",
    "openai/o3",
    "openai/o3-mini",
    "openai/o4-mini",
    "openai/text-embedding-3-large",
    "openai/text-embedding-3-small",
    "xai/grok-3",
    "xai/grok-3-mini"
]

# Конфігурація серверів
SERVERS = [
    {"url": "http://localhost:3011", "name": "Main AI Server 3011"},
    {"url": "http://localhost:3010", "name": "Backup Server 3010"},
]

class RealModelTester:
    def __init__(self):
        self.results = {
            "tested_at": datetime.now().isoformat(),
            "total_models": len(REAL_MODELS),
            "servers": SERVERS,
            "results": {},
            "summary": {
                "working": 0,
                "failed": 0,
                "unavailable": 0,
                "errors": []
            }
        }
        
    async def test_model_on_server(self, session: aiohttp.ClientSession, 
                                 model: str, server: Dict[str, str]) -> Tuple[bool, str]:
        """Тестує одну модель на одному сервері"""
        try:
            # Основний OpenAI-compatible endpoint
            endpoint = f"{server['url']}/v1/chat/completions"
            
            test_payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": "Test message: respond with 'OK'"}
                ],
                "max_tokens": 5,
                "temperature": 0.0
            }
            
            async with session.post(
                endpoint,
                json=test_payload,
                timeout=aiohttp.ClientTimeout(total=30),
                headers={"Content-Type": "application/json"}
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    if "choices" in data and data["choices"]:
                        content = data["choices"][0].get("message", {}).get("content", "")
                        logging.info(f"✅ {model} працює на {server['name']}: {content[:50]}")
                        return True, f"Response: {content[:100]}"
                        
                elif response.status == 404:
                    return False, "Model not found (404)"
                elif response.status == 429:
                    return False, "Rate limited (429)"
                elif response.status == 503:
                    return False, "Service unavailable (503)"
                else:
                    error_text = await response.text()
                    logging.warning(f"⚠️ {model} на {server['name']}: {response.status} - {error_text[:100]}")
                    return False, f"HTTP {response.status}: {error_text[:100]}"
                    
        except asyncio.TimeoutError:
            logging.warning(f"⏱️ Timeout для {model} на {server['name']}")
            return False, "Timeout after 30s"
        except Exception as e:
            error_msg = f"Error: {str(e)[:100]}"
            logging.error(f"❌ Помилка для {model} на {server['name']}: {error_msg}")
            return False, error_msg
    
    async def test_all_models(self):
        """Тестує всі моделі на всіх серверах"""
        logging.info(f"🚀 Починаю тестування {len(REAL_MODELS)} реальних моделей на {len(SERVERS)} серверах...")
        
        async with aiohttp.ClientSession() as session:
            for i, model in enumerate(REAL_MODELS, 1):
                logging.info(f"\n📊 [{i}/{len(REAL_MODELS)}] Тестую модель: {model}")
                
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
                    # Перевіряємо чи модель доступна взагалі
                    if "unavailable" in str(model_results).lower() or "404" in str(model_results):
                        self.results["summary"]["unavailable"] += 1
                    else:
                        self.results["summary"]["failed"] += 1
                    
                    self.results["summary"]["errors"].append({
                        "model": model,
                        "reason": message
                    })
                    logging.error(f"❌ {model} - НЕ ПРАЦЮЄ: {message}")
                
                # Пауза між тестами для rate limiting
                await asyncio.sleep(1)
        
        logging.info("🏁 Тестування завершено!")
        logging.info(f"✅ Працюючих моделей: {self.results['summary']['working']}")
        logging.info(f"❌ Не працюючих моделей: {self.results['summary']['failed']}")
        logging.info(f"🚫 Недоступних моделей: {self.results['summary']['unavailable']}")
        
    def save_results(self):
        """Зберігає результати тестування"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Детальний звіт
        report_path = f"/Users/dima/Documents/Predator11/REAL_MODEL_TESTING_REPORT_{timestamp}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        # Короткий звіт з працюючими моделями
        working_models = [model for model, result in self.results["results"].items() if result["working"]]
        
        summary_path = f"/Users/dima/Documents/Predator11/WORKING_MODELS_LIST_{timestamp}.md"
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write("# 🎯 ПРАЦЮЮЧІ AI МОДЕЛІ\n\n")
            f.write(f"**Тестовано:** {self.results['tested_at']}\n\n")
            f.write("## 📊 СТАТИСТИКА\n\n")
            f.write(f"- 🔢 Всього моделей: {self.results['total_models']}\n")
            f.write(f"- ✅ Працюючих: {self.results['summary']['working']}\n")
            f.write(f"- ❌ Не працюючих: {self.results['summary']['failed']}\n")
            f.write(f"- 🚫 Недоступних: {self.results['summary']['unavailable']}\n")
            f.write(f"- 🎯 Успішність: {(self.results['summary']['working']/self.results['total_models']*100):.1f}%\n\n")
            
            f.write("## ✅ СПИСОК ПРАЦЮЮЧИХ МОДЕЛЕЙ\n\n")
            f.write("```python\n")
            f.write("WORKING_MODELS = [\n")
            for model in working_models:
                f.write(f'    "{model}",\n')
            f.write("]\n")
            f.write("```\n\n")
            
            f.write("## ❌ НЕ ПРАЦЮЮЧІ МОДЕЛІ\n\n")
            for model, result in self.results["results"].items():
                if not result["working"]:
                    f.write(f"- `{model}` - {list(result['servers'].values())[0]['message']}\n")
                    
            f.write("\n## 🔧 РЕКОМЕНДАЦІЇ\n\n")
            f.write("1. Використовувати тільки працюючі моделі в production\n")
            f.write("2. Оновити agent registry з реальними назвами моделей\n")
            f.write("3. Налаштувати fallback між працюючими моделями\n")
        
        # Окремий файл тільки з працюючими моделями
        working_models_path = f"/Users/dima/Documents/Predator11/scripts/working_models.py"
        with open(working_models_path, 'w', encoding='utf-8') as f:
            f.write("#!/usr/bin/env python3\n")
            f.write('"""\n')
            f.write("🎯 СПИСОК ПРАЦЮЮЧИХ AI МОДЕЛЕЙ\n")
            f.write(f"Оновлено: {self.results['tested_at']}\n")
            f.write('"""\n\n')
            f.write("# Всі протестовані та працюючі моделі\n")
            f.write("WORKING_MODELS = [\n")
            for model in working_models:
                f.write(f'    "{model}",\n')
            f.write("]\n\n")
            f.write(f"TOTAL_WORKING = {len(working_models)}\n")
            f.write(f"SUCCESS_RATE = {(len(working_models)/len(REAL_MODELS)*100):.1f}  # %\n")
        
        logging.info(f"📄 Детальний звіт: {report_path}")
        logging.info(f"📋 Короткий звіт: {summary_path}")
        logging.info(f"🐍 Python файл: {working_models_path}")
        
        return report_path, summary_path, working_models_path

async def main():
    """Головна функція"""
    print("🧪 ТЕСТУВАННЯ РЕАЛЬНИХ AI МОДЕЛЕЙ З СЕРВЕРА")
    print("=" * 50)
    
    tester = RealModelTester()
    
    try:
        await tester.test_all_models()
        report_path, summary_path, working_path = tester.save_results()
        
        print("\n🎯 ФІНАЛЬНА СТАТИСТИКА:")
        print(f"✅ Працюючих моделей: {tester.results['summary']['working']}/{len(REAL_MODELS)}")
        print(f"❌ Не працюючих моделей: {tester.results['summary']['failed']}/{len(REAL_MODELS)}")
        print(f"🚫 Недоступних моделей: {tester.results['summary']['unavailable']}/{len(REAL_MODELS)}")
        print(f"🎯 Успішність: {(tester.results['summary']['working']/len(REAL_MODELS)*100):.1f}%")
        print(f"\n📊 Файли збережені:")
        print(f"   📄 Детальний звіт: {report_path}")
        print(f"   📋 Короткий звіт: {summary_path}")
        print(f"   🐍 Працюючі моделі: {working_path}")
        
        # Створюємо оновлений розподіл тільки з працюючими моделями
        working_models = [model for model, result in tester.results["results"].items() if result["working"]]
        if len(working_models) > 20:  # Достатньо для розподілу
            print(f"\n🎯 Створюю оновлений розподіл з {len(working_models)} працюючими моделями...")
            await create_optimized_distribution(working_models)
        else:
            print(f"\n⚠️ Недостатньо працюючих моделей ({len(working_models)}) для повного розподілу")
            
    except Exception as e:
        logging.error(f"❌ Критична помилка: {e}")
        print(f"❌ Помилка під час тестування: {e}")

async def create_optimized_distribution(working_models):
    """Створює оптимізований розподіл тільки з працюючими моделями"""
    
    # Імпортуємо оригінальний розподіл
    import sys
    sys.path.append('/Users/dima/Documents/Predator11/scripts')
    
    # Створюємо новий розподіл
    optimized_config = {
        "model_distribution": {
            "total_working_models": len(working_models),
            "total_agents": 26,
            "distribution_strategy": "working_models_only",
            "last_tested": datetime.now().isoformat(),
            "failover_enabled": True,
            "thermal_protection": True
        },
        "working_models": working_models,
        "agents": {}
    }
    
    # Розподіляємо працюючі моделі між агентами
    models_per_agent = len(working_models) // 26
    extra_models = len(working_models) % 26
    
    agent_names = [
        "ChiefOrchestrator", "ModelRouter", "QueryPlanner", "DataQuality", "Anomaly",
        "Forecast", "AutoHeal", "SelfDiagnosis", "DatasetIngest", "ETLOrchestrator",
        "Indexer", "Embedding", "OSINTCrawler", "GraphBuilder", "Simulator",
        "SyntheticData", "ReportExport", "BillingGate", "PIIGuardian", "SelfImprovement",
        "RedTeam", "ComplianceMonitor", "PerformanceOptimizer", "Arbiter", "NexusGuide",
        "SchemaMapper"
    ]
    
    model_index = 0
    for i, agent_name in enumerate(agent_names):
        # Кількість моделей для цього агента
        models_for_agent = models_per_agent + (1 if i < extra_models else 0)
        
        # Вибираємо моделі
        agent_models = working_models[model_index:model_index + models_for_agent]
        model_index += models_for_agent
        
        optimized_config["agents"][agent_name] = {
            "primary_models": agent_models[:len(agent_models)//2] if len(agent_models) > 1 else agent_models,
            "fallback_models": agent_models[len(agent_models)//2:] if len(agent_models) > 1 else [],
            "max_concurrent": 3,
            "load_balancing": "round_robin"
        }
    
    # Зберігаємо оптимізований розподіл
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    optimized_path = f"/Users/dima/Documents/Predator11/OPTIMIZED_WORKING_MODELS_DISTRIBUTION_{timestamp}.json"
    
    with open(optimized_path, 'w', encoding='utf-8') as f:
        json.dump(optimized_config, f, indent=2, ensure_ascii=False)
    
    print(f"🎯 Оптимізований розподіл збережено: {optimized_path}")

if __name__ == "__main__":
    asyncio.run(main())
