#!/usr/bin/env python3
"""
🧪 ТЕСТУВАННЯ ВСІХ 58 ВИПРАВЛЕНИХ AI МОДЕЛЕЙ
З правильними назвами з сервера
"""

import asyncio
import aiohttp
import json
from datetime import datetime
import logging

# Налаштування логування
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# Імпортуємо список з виправленими назвами
import sys
sys.path.append('/Users/dima/Documents/Predator11/scripts')
from intelligent_model_distribution import ALL_MODELS

# Сервер що працює
SERVER_URL = "http://localhost:3011"

async def test_model(session, model):
    """Тестує одну модель"""
    try:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": "Hi! Just say 'OK'"}],
            "max_tokens": 5,
            "temperature": 0.1
        }
        
        async with session.post(
            f"{SERVER_URL}/v1/chat/completions",
            json=payload,
            timeout=aiohttp.ClientTimeout(total=10)
        ) as response:
            
            if response.status == 200:
                data = await response.json()
                if "choices" in data and data["choices"]:
                    content = data["choices"][0].get("message", {}).get("content", "")
                    print(f"✅ {model} - працює: {content}")
                    return True
            else:
                error = await response.text()
                print(f"❌ {model} - помилка {response.status}: {error[:100]}")
                return False
                
    except Exception as e:
        print(f"❌ {model} - виняток: {str(e)[:100]}")
        return False

async def main():
    print(f"🚀 Тестую всі 58 моделей на {SERVER_URL}")
    print("=" * 60)
    
    working = []
    failed = []
    
    async with aiohttp.ClientSession() as session:
        for i, model in enumerate(ALL_MODELS, 1):
            print(f"\n[{i:2d}/58] Тестую: {model}")
            
            if await test_model(session, model):
                working.append(model)
            else:
                failed.append(model)
            
            # Пауза між запитами
            await asyncio.sleep(0.3)
    
    # Результати
    print(f"\n{'='*60}")
    print(f"🎯 РЕЗУЛЬТАТИ:")
    print(f"✅ Працюючих: {len(working)}/58 ({len(working)/58*100:.1f}%)")
    print(f"❌ Не працюючих: {len(failed)}/58 ({len(failed)/58*100:.1f}%)")
    
    # Зберігаємо результати
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Список працюючих моделей
    with open(f"/Users/dima/Documents/Predator11/WORKING_MODELS_{timestamp}.txt", "w") as f:
        f.write("# ПРАЦЮЮЧІ МОДЕЛІ\n\n")
        for model in working:
            f.write(f'"{model}",\n')
    
    # Список неробочих моделей  
    with open(f"/Users/dima/Documents/Predator11/FAILED_MODELS_{timestamp}.txt", "w") as f:
        f.write("# НЕРОБОЧІ МОДЕЛІ\n\n")
        for model in failed:
            f.write(f'"{model}",\n')
    
    print(f"\n📊 Результати збережені:")
    print(f"   ✅ Працюючі: WORKING_MODELS_{timestamp}.txt")
    print(f"   ❌ Неробочі: FAILED_MODELS_{timestamp}.txt")

if __name__ == "__main__":
    asyncio.run(main())
