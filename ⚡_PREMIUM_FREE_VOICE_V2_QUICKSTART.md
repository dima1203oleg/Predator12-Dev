# 🎤 QUICKSTART: Повна інтеграція Voice System V2

**Premium FREE Voice System Predator12 Nexus Core V5.2**  
**Дата:** 10 жовтня 2025  
**Версія:** 2.0 (Backend Integration)

## 🎯 Що нового в V2

### ✨ Основні покращення:
- **Backend API** - Централізоване керування провайдерами
- **Зашифровані API ключі** - Безпечне зберігання облікових даних  
- **Статистика використання** - Аналітика провайдерів
- **Автоматичне тестування** - Валідація всіх провайдерів
- **UI адміністрування** - Повнофункціональна панель керування
- **Інтеграція з основним додатком** - Floating voice control

## 🚀 Швидкий запуск (3 кроки)

### 1. Запуск Backend з Voice API

```bash
# З кореневої директорії проекту
cd predator12-local
./start-backend-voice.sh
```

**Очікуваний результат:**
```
🚀 Запуск Backend сервера...
🔗 Backend буде доступний на: http://localhost:8000
🎤 Voice Providers API: http://localhost:8000/api/voice-providers
```

### 2. Запуск Voice API (паралельно)

```bash
# У новому терміналі
cd predator12-local
./start-voice-premium-free.sh
```

**Очікуваний результат:**
```
🎤 Premium FREE Voice API запущений!
🔊 TTS: Coqui TTS ⭐⭐⭐⭐⭐
🎧 STT: Faster Whisper ⭐⭐⭐⭐⭐
```

### 3. Запуск Frontend

```bash
# У третьому терміналі
cd predator12-local/frontend
npm start
```

## 🎮 Як користуватися

### Голосове керування:
1. **Floating Button** - Правий нижній кут екрану
2. **Клік** - Розпочати слухання голосової команди
3. **Правий клік** - Відкрити меню налаштувань

### Адміністрування:
1. **Правий клік** на floating button → "Налаштування провайдерів"
2. **Вкладки:**
   - **Провайдери** - Керування TTS/STT
   - **Налаштування** - Глобальні опції
   - **Статистика** - Аналітика використання

## 📊 Endpoints API

### Backend API (http://localhost:8000)

| Endpoint | Метод | Опис |
|----------|-------|------|
| `/api/voice-providers/providers` | GET | Список провайдерів |
| `/api/voice-providers/providers` | POST | Створити провайдер |
| `/api/voice-providers/providers/{id}` | PUT | Оновити провайдер |
| `/api/voice-providers/providers/{id}/test` | POST | Тестувати провайдер |
| `/api/voice-providers/settings` | GET/PUT | Глобальні налаштування |
| `/api/voice-providers/usage/stats` | GET | Статистика використання |
| `/api/voice-providers/health` | GET | Стан API |

### Voice API (http://localhost:8001)

| Endpoint | Метод | Опис |
|----------|-------|------|
| `/tts` | POST | Text-to-Speech |
| `/stt` | POST | Speech-to-Text |
| `/capabilities` | GET | Можливості системи |
| `/health` | GET | Стан сервісу |

## 🔧 Конфігурація провайдерів

### Безкоштовні провайдери (за замовчуванням):

#### TTS:
- **Coqui TTS** ⭐⭐⭐⭐⭐ - Найкраща якість, офлайн
- **Google TTS** ⭐⭐⭐⭐ - Швидкий, онлайн
- **pyttsx3** ⭐⭐⭐ - Системний, завжди доступний

#### STT:
- **Faster Whisper** ⭐⭐⭐⭐⭐ - Найкраща точність, офлайн
- **Whisper** ⭐⭐⭐⭐⭐ - Максимальна підтримка мов
- **Vosk** ⭐⭐⭐⭐ - Легкий, швидкий

### Додавання API ключів:

1. Відкрийте адмін панель
2. Виберіть провайдер
3. Натисніть "Налаштувати"
4. Введіть API ключ
5. Збережіть та протестуйте

## 🛠️ Архітектура системи

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Voice API     │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (FastAPI)     │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 8001    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │               ┌───────▼────────┐             │
         │               │ Voice Configs  │             │
         │               │ (Encrypted)    │             │
         │               └────────────────┘             │
         │                                              │
         └──────────────────┬───────────────────────────┘
                            │
                   ┌────────▼─────────┐
                   │  Local Models    │
                   │ Coqui, Whisper   │
                   │ Vosk, pyttsx3    │
                   └──────────────────┘
```

## 🎯 Fallback логіка

1. **API провайдери** (Онлайн) → Якщо доступні API ключі
2. **Локальні моделі** (Офлайн) → Coqui TTS, Faster Whisper
3. **Browser API** (Резерв) → Web Speech API

## 📈 Моніторинг та діагностика

### Статус системи:
```bash
# Перевірка Backend API
curl http://localhost:8000/api/voice-providers/health

# Перевірка Voice API
curl http://localhost:8001/health

# Статистика використання
curl http://localhost:8000/api/voice-providers/usage/stats
```

### Типові помилки:

| Помилка | Причина | Рішення |
|---------|---------|---------|
| Backend недоступний | Порт 8000 зайнятий | `./start-backend-voice.sh` |
| Voice API offline | Залежності не встановлено | `./start-voice-premium-free.sh` |
| Тест провайдера fails | Неправильний API ключ | Перевірити ключ в адмін панелі |

## 🔐 Безпека

- **API ключі зашифровано** з використанням Fernet (AES)
- **Ключ шифрування** зберігається в `voice_encryption.key`
- **Локальні моделі** не потребують API ключів
- **CORS налаштований** тільки для фронтенду

## 📱 Мобільна підтримка

- **Touch friendly** інтерфейс адмін панелі
- **Responsive design** для всіх екранів
- **Тест на мобільних** - підтримується

## 🎨 Кастомізація

### Додавання нового провайдера:

1. Відкрийте адмін панель
2. Вкладка "Провайдери" → "Додати провайдер"
3. Заповніть всі поля
4. Протестуйте та збережіть

### Зміна дефолтних провайдерів:

1. Вкладка "Налаштування"
2. Оберіть нові провайдери за замовчуванням
3. Збережіть налаштування

## 🚨 Troubleshooting

### Backend не запускається:
```bash
# Перевірити порт
lsof -i :8000

# Перевірити залежності
cd predator12-local/backend
source venv/bin/activate
pip install -r requirements.txt
```

### Voice API не працює:
```bash
# Перевірити моделі
cd predator12-local
python3 -c "import coqui; import faster_whisper"

# Переустановити залежності
pip install -r requirements_premium_free.txt
```

### Frontend не бачить API:
```bash
# Перевірити CORS
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/voice-providers/health
```

## 🎉 Успішний запуск

Якщо все працює правильно, ви побачите:

1. **✅ Backend** - http://localhost:8000/docs
2. **✅ Voice API** - http://localhost:8001/docs  
3. **✅ Frontend** - http://localhost:3000
4. **✅ Floating button** - Правий нижній кут
5. **✅ Адмін панель** - Правий клік → Налаштування

---

**🎤 Premium FREE Voice System готовий до роботи!**  
**Команда Predator12 Nexus Core V5.2** 🚀
