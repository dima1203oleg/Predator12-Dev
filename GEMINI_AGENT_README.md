# 🤖 Gemini Agent - Google Generative AI Integration

## 📋 Опис

Gemini Agent забезпечує інтеграцію з Google Generative AI API для використання моделей Gemini у системі Predator12.

## ✨ Можливості

- 🚀 Підтримка моделей Gemini Pro, 1.5 Pro, 1.5 Flash, 2.0 Flash
- 🔄 Автоматичне перемикання між реальним API та демо-режимом
- 🔑 Безпечне зберігання API ключів через змінні середовища
- 📊 Моніторинг статусу через API ендпоінти
- 💬 Повна інтеграція з Model SDK

## 🔧 Встановлення

### 1. Встановіть залежності

```bash
cd predator12-local/services/model-sdk
pip install -r requirements.txt
```

### 2. Отримайте API ключ Google Gemini

1. Відвідайте https://makersuite.google.com/app/apikey
2. Увійдіть з вашим Google акаунтом
3. Створіть новий API ключ
4. Збережіть ключ у безпечному місці

### 3. Налаштуйте змінні середовища

Створіть або оновіть файл `.env`:

```bash
# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
```

Або додайте до існуючого `.env.models`:

```bash
# Google Gemini (безкоштовний рівень)
GOOGLE_GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Запустіть Model SDK сервер

```bash
cd predator12-local/services/model-sdk
python free_model_server.py
```

## 🎯 Використання

### Через API

**Чат з Gemini:**

```bash
curl -X POST http://localhost:3010/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-pro",
    "messages": [
      {"role": "user", "content": "Привіт! Розкажи про себе."}
    ],
    "max_tokens": 1000,
    "temperature": 0.7
  }'
```

**Перевірка статусу Gemini:**

```bash
curl http://localhost:3010/gemini/status
```

**Відповідь:**
```json
{
  "agent": "Gemini Agent",
  "available": true,
  "sdk_installed": true,
  "api_key_configured": true,
  "models_count": 4,
  "models": [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.0-flash"
  ]
}
```

### Через Python код

```python
from gemini_agent import GeminiAgent

# Ініціалізація агента
agent = GeminiAgent()

# Перевірка доступності
if agent.is_available():
    print("✅ Gemini Agent підключено")
else:
    print("⚠️ Gemini Agent працює в демо-режимі")

# Відправка запиту
result = await agent.chat(
    model_name="gemini-pro",
    messages=[
        {"role": "user", "content": "Привіт!"}
    ],
    max_tokens=1000,
    temperature=0.7
)

print(result["content"])
```

## 📊 Доступні моделі

| Модель | Опис | Контекст |
|--------|------|----------|
| `gemini-pro` | Базова модель для текстових завдань | 32K токенів |
| `gemini-1.5-pro` | Покращена версія з більшим контекстом | До 2M токенів |
| `gemini-1.5-flash` | Швидка модель для простих завдань | 1M токенів |
| `gemini-2.0-flash` | Експериментальна нова версія | 1M токенів |

## 🔍 Діагностика проблем

### Gemini Agent не активний

**Перевірте статус:**
```bash
curl http://localhost:3010/gemini/status
```

**Можливі причини:**

1. ❌ **API ключ не налаштовано**
   - Перевірте: `echo $GOOGLE_GEMINI_API_KEY`
   - Рішення: Додайте ключ до `.env` файлу

2. ❌ **SDK не встановлено**
   - Перевірте: `pip list | grep google-generativeai`
   - Рішення: `pip install google-generativeai==0.3.2`

3. ❌ **Неправильний API ключ**
   - Перевірте формат ключа
   - Створіть новий ключ: https://makersuite.google.com/app/apikey

### Помилка "Rate Limit Exceeded"

Google Gemini має безкоштовні ліміти:
- 60 запитів на хвилину
- 1500 запитів на день

**Рішення:**
- Додайте затримку між запитами
- Оновіть до платного плану для більших лімітів

## 💡 Поради

1. **Безкоштовне використання:**
   - Gemini Pro має щедрий безкоштовний рівень
   - Ідеально для розробки та тестування

2. **Вибір моделі:**
   - `gemini-pro` - для загальних завдань
   - `gemini-1.5-flash` - коли потрібна швидкість
   - `gemini-1.5-pro` - для складних завдань з великим контекстом

3. **Оптимізація:**
   - Використовуйте нижчу температуру (0.3-0.5) для більш детермінованих відповідей
   - Обмежуйте `max_tokens` для контролю довжини відповіді

## 🔗 Корисні посилання

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Python SDK Reference](https://ai.google.dev/tutorials/python_quickstart)
- [Pricing & Limits](https://ai.google.dev/pricing)

## 📝 Примітки

- Агент автоматично переключається в демо-режим, якщо API недоступний
- Демо-режим генерує інформативні відповіді про налаштування
- Всі API ключі повинні зберігатися безпечно і не комітитися в Git

## 🎉 Готово!

Тепер ви можете використовувати Google Gemini у вашій системі Predator12!

Для перевірки роботи:
```bash
# Запустіть сервер
python predator12-local/services/model-sdk/free_model_server.py

# В іншому терміналі протестуйте
curl http://localhost:3010/gemini/status
```
