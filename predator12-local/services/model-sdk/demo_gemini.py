#!/usr/bin/env python3
"""
🎯 ДЕМОНСТРАЦІЯ GEMINI AGENT
Показує як використовувати Gemini Agent в системі Predator12
"""
import asyncio
import os
from gemini_agent import GeminiAgent


async def main():
    print("=" * 70)
    print("🤖 GEMINI AGENT DEMONSTRATION")
    print("=" * 70)
    
    # Ініціалізуємо агента
    print("\n1️⃣ Ініціалізація Gemini Agent...")
    agent = GeminiAgent()
    
    # Показуємо статус
    print("\n2️⃣ Статус агента:")
    status = agent.get_status()
    for key, value in status.items():
        emoji = "✅" if value or key == "models" else "❌"
        if key == "available":
            emoji = "✅" if value else "⚠️"
        print(f"   {emoji} {key}: {value}")
    
    # Список доступних моделей
    print("\n3️⃣ Доступні моделі:")
    for model in agent.get_available_models():
        print(f"   🤖 {model}")
    
    # Тестові запити
    print("\n4️⃣ Тестові запити:")
    
    test_cases = [
        {
            "name": "Загальне запитання",
            "model": "gemini-pro",
            "messages": [
                {"role": "user", "content": "Привіт! Розкажи про можливості Gemini API."}
            ]
        },
        {
            "name": "Технічне запитання",
            "model": "gemini-1.5-flash",
            "messages": [
                {"role": "user", "content": "Як налаштувати Gemini Agent в Predator12?"}
            ]
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n   Test Case {i}: {test_case['name']}")
        print(f"   Model: {test_case['model']}")
        print(f"   Query: {test_case['messages'][0]['content'][:50]}...")
        
        result = await agent.chat(
            model_name=test_case['model'],
            messages=test_case['messages'],
            max_tokens=300,
            temperature=0.7
        )
        
        print(f"\n   📝 Response (перші 200 символів):")
        content = result['content']
        preview = content[:200] + "..." if len(content) > 200 else content
        print(f"   {preview}\n")
    
    # Інформація про підключення
    print("\n5️⃣ Як підключити справжній Gemini API:")
    print("   " + "-" * 60)
    if not agent.is_available():
        print("   ⚠️ Зараз агент працює в DEMO режимі")
        print("   ")
        print("   Для підключення справжнього Gemini API:")
        print("   1. Отримайте API ключ: https://makersuite.google.com/app/apikey")
        print("   2. Додайте до .env файлу:")
        print("      GOOGLE_GEMINI_API_KEY=your_actual_api_key_here")
        print("   3. Перезапустіть сервіс")
        print("   ")
        print("   💡 Безкоштовний рівень Google Gemini включає:")
        print("      - 60 запитів на хвилину")
        print("      - 1500 запитів на день")
        print("      - Підтримка українською мовою")
    else:
        print("   ✅ Gemini API підключено та активний!")
        print("   Кількість завантажених моделей:", len(agent.models))
    
    print("\n" + "=" * 70)
    print("✅ Демонстрація завершена!")
    print("=" * 70)
    
    # Додаткова інформація
    print("\n📚 Корисні команди:")
    print("   # Запустити Model SDK сервер:")
    print("   python free_model_server.py")
    print("   ")
    print("   # Перевірити статус Gemini:")
    print("   curl http://localhost:3010/gemini/status")
    print("   ")
    print("   # Тестовий запит до Gemini:")
    print("   curl -X POST http://localhost:3010/v1/chat/completions \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"model\": \"gemini-pro\", \"messages\": [{\"role\": \"user\", \"content\": \"Привіт!\"}]}'")
    print("")


if __name__ == "__main__":
    asyncio.run(main())
