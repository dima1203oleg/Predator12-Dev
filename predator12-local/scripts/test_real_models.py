#!/usr/bin/env python3
"""
🔍 ТЕСТУВАННЯ ВСІХ 58 РЕАЛЬНИХ МОДЕЛЕЙ З СЕРВЕРА
Використовує точні назви моделей з сервера
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
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# ТОЧНІ 58 моделей з сервера localhost:3011
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

class RealModelTester:
    def __init__(self):
        self.results = {
            "tested_at": datetime.now().isoformat(),
            "total_models": len(REAL_MODELS),
            "working": [],
            "failed": [],
            "detailed_results": {}
        }
        
    async def test_model(self, session: aiohttp.ClientSession, model: str) -> Tuple[bool, str]:
        """Тестує одну модель на сервері 3011"""
        try:
            test_payload = {
                "model": model,
                "messages": [
                    {"role": "user", "content": "Hi! Just say 'OK' please."}
                ],
                "max_tokens": 5,
                "temperature": 0.0
            }
            
            async with session.post(
                "http://localhost:3011/v1/chat/completions",
                json=test_payload,
                timeout=aiohttp.ClientTimeout(total=30),
                headers={"Content-Type": "application/json"}
            ) as response:
                
                response_text = await response.text()
                
                if response.status == 200:
                    try:
                        data = json.loads(response_text)
                        if "choices" in data and data["choices"]:
                            content = data["choices"][0].get("message", {}).get("content", "")
                            logging.info(f"✅ {model}: {content}")
                            return True, f"Success: {content}"
                    except json.JSONDecodeError:
                        logging.error(f"❌ {model}: Invalid JSON response")
                        return False, f"Invalid JSON: {response_text[:100]}"
                        
                elif response.status == 400:
                    logging.warning(f"⚠️ {model}: Bad request - {response_text[:200]}")
                    return False, f"400 Bad Request: {response_text[:200]}"
                    
                elif response.status == 403:
                    logging.warning(f"💰 {model}: Budget limit or forbidden - {response_text[:200]}")
                    return False, f"403 Forbidden: {response_text[:200]}"
                    
                elif response.status == 404:
                    logging.warning(f"🔍 {model}: Model not found - {response_text[:200]}")
                    return False, f"404 Not Found: {response_text[:200]}"
                    
                else:
                    logging.error(f"❌ {model}: HTTP {response.status} - {response_text[:200]}")
                    return False, f"HTTP {response.status}: {response_text[:200]}"
                    
        except asyncio.TimeoutError:
            logging.error(f"⏱️ {model}: Timeout")
            return False, "Timeout after 30 seconds"
            
        except Exception as e:
            logging.error(f"💥 {model}: Exception - {str(e)}")
            return False, f"Exception: {str(e)}"
    
    async def test_all_models(self):
        """Тестує всі моделі"""
        print(f"🚀 Тестую {len(REAL_MODELS)} реальних моделей з сервера...")
        
        async with aiohttp.ClientSession() as session:
            for i, model in enumerate(REAL_MODELS, 1):
                print(f"\n[{i:2d}/{len(REAL_MODELS)}] {model}")
                
                success, message = await self.test_model(session, model)
                
                self.results["detailed_results"][model] = {
                    "success": success,
                    "message": message,
                    "tested_at": datetime.now().isoformat()
                }
                
                if success:
                    self.results["working"].append(model)
                else:
                    self.results["failed"].append(model)
                
                await asyncio.sleep(0.3)  # Пауза між запитами
        
        print(f"\n🎯 РЕЗУЛЬТАТ:")
        print(f"✅ Працюючих: {len(self.results['working'])}")
        print(f"❌ Не працюючих: {len(self.results['failed'])}")
        print(f"📊 Відсоток успіху: {len(self.results['working'])/len(REAL_MODELS)*100:.1f}%")
    
    def save_results(self):
        """Зберігає результати"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Детальний звіт
        report_path = f"/Users/dima/Documents/Predator11/REAL_MODELS_TEST_{timestamp}.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        # Список працюючих моделей для коду
        working_path = f"/Users/dima/Documents/Predator11/WORKING_MODELS_{timestamp}.py"
        with open(working_path, 'w', encoding='utf-8') as f:
            f.write("# Список всіх працюючих моделей\n")
            f.write("WORKING_MODELS = [\n")
            for model in self.results["working"]:
                f.write(f'    "{model}",\n')
            f.write("]\n")
            
        # Звіт про помилки
        error_path = f"/Users/dima/Documents/Predator11/MODEL_ERRORS_{timestamp}.md"
        with open(error_path, 'w', encoding='utf-8') as f:
            f.write("# 🔍 АНАЛІЗ ПОМИЛОК МОДЕЛЕЙ\n\n")
            
            # Групуємо помилки за типами
            error_types = {}
            for model in self.results["failed"]:
                error_msg = self.results["detailed_results"][model]["message"]
                error_type = error_msg.split(":")[0] if ":" in error_msg else "Unknown"
                if error_type not in error_types:
                    error_types[error_type] = []
                error_types[error_type].append(model)
            
            for error_type, models in error_types.items():
                f.write(f"## {error_type} ({len(models)} моделей)\n\n")
                for model in models:
                    f.write(f"- `{model}`\n")
                f.write("\n")
        
        print(f"\n📄 Звіти збережені:")
        print(f"   Детальний: {report_path}")
        print(f"   Працюючі: {working_path}")
        print(f"   Помилки: {error_path}")
        
        return report_path, working_path, error_path

async def main():
    tester = RealModelTester()
    await tester.test_all_models()
    tester.save_results()
    
    print(f"\n🎯 ПРАЦЮЮЧІ МОДЕЛІ:")
    for model in tester.results["working"]:
        print(f"   ✅ {model}")
    
    print(f"\n❌ НЕ ПРАЦЮЮЧІ МОДЕЛІ:")
    for model in tester.results["failed"]:
        error = tester.results["detailed_results"][model]["message"]
        print(f"   ❌ {model} - {error[:50]}...")

if __name__ == "__main__":
    asyncio.run(main())
