#!/usr/bin/env python3
"""
🔍 ШВИДКА ДІАГНОСТИКА ВСІХ 58 МОДЕЛЕЙ
Визначає причини неробочих моделей
"""

import asyncio
import aiohttp
import json

# Всі 58 моделей з сервера
MODELS = [
    "ai21-labs/ai21-jamba-1.5-large", "ai21-labs/ai21-jamba-1.5-mini",
    "cohere/cohere-command-a", "cohere/cohere-command-r-08-2024",
    "cohere/cohere-command-r-plus-08-2024", "cohere/cohere-embed-v3-english",
    "cohere/cohere-embed-v3-multilingual", "core42/jais-30b-chat",
    "deepseek/deepseek-r1", "deepseek/deepseek-r1-0528", "deepseek/deepseek-v3-0324",
    "meta/llama-3.2-11b-vision-instruct", "meta/llama-3.2-90b-vision-instruct",
    "meta/llama-3.3-70b-instruct", "meta/llama-4-maverick-17b-128e-instruct-fp8",
    "meta/llama-4-scout-17b-16e-instruct", "meta/meta-llama-3.1-405b-instruct",
    "meta/meta-llama-3.1-8b-instruct", "microsoft/mai-ds-r1",
    "microsoft/phi-3-medium-128k-instruct", "microsoft/phi-3-medium-4k-instruct",
    "microsoft/phi-3-mini-128k-instruct", "microsoft/phi-3-mini-4k-instruct",
    "microsoft/phi-3-small-128k-instruct", "microsoft/phi-3-small-8k-instruct",
    "microsoft/phi-3.5-mini-instruct", "microsoft/phi-3.5-moe-instruct",
    "microsoft/phi-3.5-vision-instruct", "microsoft/phi-4",
    "microsoft/phi-4-mini-instruct", "microsoft/phi-4-mini-reasoning",
    "microsoft/phi-4-multimodal-instruct", "microsoft/phi-4-reasoning",
    "mistral-ai/codestral-2501", "mistral-ai/ministral-3b",
    "mistral-ai/mistral-large-2411", "mistral-ai/mistral-medium-2505",
    "mistral-ai/mistral-nemo", "mistral-ai/mistral-small-2503",
    "openai/gpt-4.1", "openai/gpt-4.1-mini", "openai/gpt-4.1-nano",
    "openai/gpt-4o", "openai/gpt-4o-mini", "openai/gpt-5",
    "openai/gpt-5-chat", "openai/gpt-5-mini", "openai/gpt-5-nano",
    "openai/o1", "openai/o1-mini", "openai/o1-preview",
    "openai/o3", "openai/o3-mini", "openai/o4-mini",
    "openai/text-embedding-3-large", "openai/text-embedding-3-small",
    "xai/grok-3", "xai/grok-3-mini"
]

async def quick_test_model(session, model):
    """Швидко тестує одну модель"""
    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": "OK"}],
            "max_tokens": 2,
            "temperature": 0
        }
        
        async with session.post(
            "http://localhost:3011/v1/chat/completions",
            json=payload,
            timeout=aiohttp.ClientTimeout(total=10)
        ) as response:
            
            if response.status == 200:
                return "✅ ПРАЦЮЄ"
            elif response.status == 403:
                return "💰 ЛІМІТ БЮДЖЕТУ"
            elif response.status == 404:
                return "❌ НЕ ЗНАЙДЕНО"
            elif response.status == 400:
                return "⚠️ ПОМИЛКА ЗАПИТУ"
            else:
                return f"❓ HTTP {response.status}"
                
    except asyncio.TimeoutError:
        return "⏱️ ТАЙМАУТ"
    except Exception as e:
        return f"💥 ПОМИЛКА: {str(e)[:20]}"

async def diagnose_all():
    """Діагностує всі моделі"""
    results = {
        "working": [],
        "budget_limit": [],
        "not_found": [],
        "bad_request": [],
        "timeout": [],
        "other_errors": []
    }
    
    print("🔍 ШВИДКА ДІАГНОСТИКА 58 МОДЕЛЕЙ...")
    
    async with aiohttp.ClientSession() as session:
        for i, model in enumerate(MODELS, 1):
            status = await quick_test_model(session, model)
            print(f"[{i:2d}/58] {model:<45} {status}")
            
            # Категоризуємо результати
            if status == "✅ ПРАЦЮЄ":
                results["working"].append(model)
            elif status == "💰 ЛІМІТ БЮДЖЕТУ":
                results["budget_limit"].append(model)
            elif status == "❌ НЕ ЗНАЙДЕНО":
                results["not_found"].append(model)
            elif status == "⚠️ ПОМИЛКА ЗАПИТУ":
                results["bad_request"].append(model)
            elif status == "⏱️ ТАЙМАУТ":
                results["timeout"].append(model)
            else:
                results["other_errors"].append((model, status))
            
            await asyncio.sleep(0.1)  # Невелика затримка
    
    print(f"\n🎯 РЕЗУЛЬТАТИ ДІАГНОСТИКИ:")
    print(f"✅ Працюючих моделей: {len(results['working'])}")
    print(f"💰 Заблоковано лімітом бюджету: {len(results['budget_limit'])}")
    print(f"❌ Не знайдено: {len(results['not_found'])}")
    print(f"⚠️ Помилки запиту: {len(results['bad_request'])}")
    print(f"⏱️ Таймаути: {len(results['timeout'])}")
    print(f"❓ Інші помилки: {len(results['other_errors'])}")
    
    # Зберігаємо результати
    with open("/Users/dima/Documents/Predator11/DIAGNOSIS_RESULTS.json", "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ ПРАЦЮЮЧІ МОДЕЛІ ({len(results['working'])}):")
    for model in results["working"]:
        print(f"   {model}")
    
    if results["budget_limit"]:
        print(f"\n💰 ЗАБЛОКОВАНІ ЛІМІТОМ БЮДЖЕТУ ({len(results['budget_limit'])}):")
        for model in results["budget_limit"][:10]:  # Показуємо перші 10
            print(f"   {model}")
        if len(results["budget_limit"]) > 10:
            print(f"   ... та ще {len(results['budget_limit']) - 10}")
    
    return results

if __name__ == "__main__":
    asyncio.run(diagnose_all())
