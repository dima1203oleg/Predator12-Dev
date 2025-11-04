# 🚀 Швидкий старт: Gemini Agent

## ✅ Що зроблено

Gemini Agent успішно підключено до системи Predator12! Тепер ви можете використовувати моделі Google Gemini через ваш Model SDK.

## 🎯 Можливості

- ✨ 4 моделі Gemini (Pro, 1.5 Pro, 1.5 Flash, 2.0 Flash)
- 🔄 Автоматичний demo режим без API ключа
- 🌐 Підтримка української мови
- 💰 Безкоштовний рівень використання
- 📊 Моніторинг статусу через API

## ⚡ Швидкий запуск

### 1. Запустіть сервер (без API ключа - demo режим)

```bash
cd predator12-local/services/model-sdk
python3 free_model_server.py
```

Сервер запуститься на http://localhost:3010

### 2. Перевірте статус Gemini

```bash
curl http://localhost:3010/gemini/status
```

### 3. Відправте тестовий запит

```bash
curl -X POST http://localhost:3010/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-pro",
    "messages": [
      {"role": "user", "content": "Привіт! Розкажи про свої можливості."}
    ]
  }'
```

## 🔑 Підключення справжнього API (опціонально)

### Крок 1: Отримайте API ключ

Відвідайте: https://makersuite.google.com/app/apikey

### Крок 2: Додайте ключ до .env

```bash
# У файлі predator12-local/.env.models або .env
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
```

### Крок 3: Перезапустіть сервер

```bash
cd predator12-local/services/model-sdk
python3 free_model_server.py
```

Тепер агент використовуватиме справжній Google Gemini API! ✅

## 📊 Корисні ендпоінти

| Ендпоінт | Опис |
|----------|------|
| `GET /` | Інформація про сервіс |
| `GET /health` | Стан здоров'я системи |
| `GET /gemini/status` | Статус Gemini Agent |
| `POST /v1/chat/completions` | Чат з AI моделями |
| `GET /v1/models` | Список доступних моделей |

## 🤖 Доступні моделі

- **gemini-pro** - Базова модель для текстових завдань
- **gemini-1.5-pro** - Покращена версія з великим контекстом (до 2M токенів)
- **gemini-1.5-flash** - Швидка модель для простих завдань
- **gemini-2.0-flash** - Експериментальна нова версія

## 🎓 Приклади використання

### Python

```python
from gemini_agent import GeminiAgent
import asyncio

async def main():
    agent = GeminiAgent()
    
    result = await agent.chat(
        model_name="gemini-pro",
        messages=[{"role": "user", "content": "Привіт!"}],
        max_tokens=500
    )
    
    print(result["content"])

asyncio.run(main())
```

### Curl

```bash
# Gemini Pro
curl -X POST http://localhost:3010/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-pro",
    "messages": [{"role": "user", "content": "Що таке AI?"}]
  }'

# Gemini 1.5 Flash (швидша версія)
curl -X POST http://localhost:3010/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-1.5-flash",
    "messages": [{"role": "user", "content": "Швидка відповідь?"}]
  }'
```

## 🧪 Запуск демо

```bash
cd predator12-local/services/model-sdk
python3 demo_gemini.py
```

Ця команда покаже:
- Статус агента
- Доступні моделі
- Приклади запитів
- Інструкції з підключення

## 💡 Безкоштовні ліміти Google Gemini

- **60 запитів на хвилину**
- **1500 запитів на день**
- Великий контекстний вікно
- Підтримка багатьох мов, включно з українською

## 📚 Детальна документація

Повна інструкція з налаштування та діагностики:
- [GEMINI_AGENT_README.md](./GEMINI_AGENT_README.md)

## ❓ Проблеми?

### Агент в demo режимі?
- Перевірте: `curl http://localhost:3010/gemini/status`
- Додайте API ключ до `.env` файлу
- Перезапустіть сервер

### Помилка імпорту?
```bash
pip install google-generativeai==0.3.2
```

### Сервер не запускається?
```bash
cd predator12-local/services/model-sdk
pip install -r requirements.txt
```

## 🎉 Готово!

Gemini Agent готовий до використання! Протестуйте всі можливості та насолоджуйтесь роботою з Google Gemini в Predator12! 🚀
