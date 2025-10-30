# 🎤 AI Voice Interface - Швидкий Старт

## 📋 Огляд

**AIVoiceInterface** - це повнофункціональний голосовий інтерфейс для PREDATOR12 з підтримкою:
- 🎙️ **Голосове розпізнавання** (Speech-to-Text)
- 🔊 **Синтез мовлення** (Text-to-Speech)
- 🤖 **AI обробка команд** з інтелектуальним аналізом
- 🌐 **Мультимовна підтримка** (українська, англійська)
- 🎯 **Premium FREE моделі** (Coqui TTS + faster-whisper)
- 💎 **Browser Fallback** (працює завжди!)

---

## 🚀 Швидкий Запуск

### 1️⃣ Запуск Frontend

```bash
cd predator12-local/frontend
npm start
```

Frontend запуститься на: **http://localhost:3000**

### 2️⃣ Запуск Voice API Backend (опціонально для Premium FREE)

```bash
cd predator12-local
./start-voice-premium-free.sh
```

Voice API запуститься на: **http://localhost:5094**

### 3️⃣ Відкрийте Voice Interface

У браузері перейдіть до:
```
http://localhost:3000/voice
```

або використайте навігацію в дашборді: **Menu → Voice Control**

---

## 🎯 Як Використовувати

### Базові Операції

1. **Натисніть кнопку мікрофона** 🎙️ для початку прослуховування
2. **Говоріть українською або англійською**
3. **AI автоматично розпізнає** та виконає вашу команду
4. **Отримаєте голосову відповідь** (якщо автоозвучування ввімкнено)

### Приклади Команд

#### Українська 🇺🇦
```
"Привіт"
"Відкрий дашборд"
"Покажи агентів"
"Статус системи"
"Тест голосу"
"Безпека"
"Аналітика"
```

#### English 🇬🇧
```
"Hello"
"Open dashboard"
"Show agents"
"System status"
"Test voice"
"Security"
"Analytics"
```

---

## ⚙️ Налаштування

### Відкрити Налаштування
Натисніть кнопку **⚙️ Settings** у правому верхньому куті

### Доступні Опції

| Налаштування | Опис | Рекомендовано |
|--------------|------|---------------|
| **Мова** | uk-UA / en-US | uk-UA |
| **Швидкість** | 0.5 - 2.0 | 1.0 |
| **Висота** | 0.5 - 2.0 | 1.0 |
| **Гучність** | 0 - 1.0 | 0.8 |
| **Автоозвучування** | ON/OFF | ON ✅ |
| **Безперервне прослуховування** | ON/OFF | OFF |

---

## 🎤 Моделі та Провайдери

### TTS (Text-to-Speech)

#### 1. Coqui TTS ⭐⭐⭐⭐⭐
```json
{
  "provider": "coqui",
  "quality": "Найвища якість",
  "languages": ["uk", "en"],
  "speed": "Повільно (офлайн обробка)",
  "note": "Найкраща якість для української мови!"
}
```

#### 2. gTTS ⭐⭐⭐⭐
```json
{
  "provider": "gtts",
  "quality": "Відмінна якість",
  "languages": ["uk", "en", "100+ мов"],
  "speed": "Швидко",
  "note": "Google Text-to-Speech, потрібен інтернет"
}
```

#### 3. Browser API ⭐⭐⭐
```json
{
  "provider": "browser",
  "quality": "Добра якість",
  "languages": ["залежить від OS"],
  "speed": "Миттєво",
  "note": "Завжди доступний, fallback"
}
```

### STT (Speech-to-Text)

#### 1. faster-whisper ⭐⭐⭐⭐⭐
```json
{
  "provider": "faster-whisper",
  "quality": "Найвища точність",
  "languages": ["uk", "en", "50+ мов"],
  "speed": "Дуже швидко (GPU прискорення)",
  "note": "Оптимізована версія Whisper"
}
```

#### 2. Whisper ⭐⭐⭐⭐
```json
{
  "provider": "whisper",
  "quality": "Відмінна точність",
  "languages": ["uk", "en", "50+ мов"],
  "speed": "Середня швидкість",
  "note": "OpenAI Whisper"
}
```

#### 3. Browser API ⭐⭐⭐
```json
{
  "provider": "browser",
  "quality": "Добра точність",
  "languages": ["uk-UA", "en-US"],
  "speed": "Реального часу",
  "note": "Завжди доступний, fallback"
}
```

---

## 🔧 Архітектура

```
┌─────────────────────────────────────────────────────┐
│              AIVoiceInterface.tsx                   │
│  ┌───────────────────────────────────────────────┐ │
│  │  🎤 Speech Recognition (Browser API)          │ │
│  │  - Web Speech API                             │ │
│  │  - Continuous listening                       │ │
│  │  - Real-time transcription                    │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │  🤖 AI Command Processing                     │ │
│  │  - Natural language understanding             │ │
│  │  - Intent recognition                         │ │
│  │  - Context-aware responses                    │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │  🔊 Text-to-Speech                           │ │
│  │  - Premium FREE API (Coqui/gTTS)             │ │
│  │  - Browser API fallback                       │ │
│  │  - Auto language detection                    │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
           ↓                              ↓
┌──────────────────────┐    ┌──────────────────────────┐
│  Browser Web APIs    │    │  Premium FREE Voice API  │
│  - Speech Recognition│    │  - Coqui TTS             │
│  - Speech Synthesis  │    │  - faster-whisper STT    │
│  - MediaDevices      │    │  - gTTS                  │
└──────────────────────┘    └──────────────────────────┘
```

---

## 📁 Структура Файлів

```
predator12-local/frontend/src/
├── components/voice/
│   ├── AIVoiceInterface.tsx          # 🎤 Головний голосовий інтерфейс
│   └── VoiceProvidersAdmin.tsx       # ⚙️ Адмін панель провайдерів
├── services/
│   ├── premiumFreeVoiceAPI.ts        # 🎯 Premium FREE API клієнт
│   ├── voiceAPI.ts                   # 🎙️ Базовий Voice API
│   └── voiceProvidersAPI.ts          # 🔌 Провайдери API
└── theme/
    └── nexusTheme.ts                 # 🎨 Тема оформлення
```

---

## 🎨 UI Компоненти

### Головна Панель
```tsx
┌────────────────────────────────────────┐
│  🎤 AI Voice Interface                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│                                        │
│        [🎙️]  НАТИСНІТЬ ДЛЯ ГОЛОСУ     │
│                                        │
│  🟢 Connected | ⏱️ 00:00:00           │
│  📊 Confidence: 95%                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  💬 "Привіт, Нексус!"                 │
│  🤖 "Вітаю! Чим можу допомогти?"      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  📋 Recent Commands                    │
│  ✅ Відкрий дашборд (98%)             │
│  ✅ Покажи агентів (95%)              │
│  ✅ Статус системи (97%)              │
└────────────────────────────────────────┘
```

### Панель Налаштувань
```tsx
┌────────────────────────────────────────┐
│  ⚙️ Voice Settings                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  🌐 Language: [uk-UA ▼]               │
│  🎤 Voice: [Lesya ▼]                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  ⚡ Speed:  [━━━●━━━] 1.0             │
│  🎵 Pitch:  [━━━●━━━] 1.0             │
│  🔊 Volume: [━━━━━●━] 0.8             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  ☑️ Auto-speak responses               │
│  ☐ Continuous listening                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━│
│  [Test Voice]  [Close]  [Save]        │
└────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Проблема: Мікрофон не працює
✅ **Рішення:**
1. Перевірте дозволи браузера (🔒 іконка в адресному рядку)
2. Натисніть "Дозволити" при запиті доступу до мікрофона
3. Перезавантажте сторінку

### Проблема: Немає звуку при відповіді
✅ **Рішення:**
1. Перевірте гучність системи
2. Увімкніть "Автоозвучування" в налаштуваннях
3. Натисніть кнопку "Тест голосу" для перевірки

### Проблема: Погане розпізнавання
✅ **Рішення:**
1. Говоріть чітко та голосно
2. Наблизтеся до мікрофона
3. Зменшіть фоновий шум
4. Перевірте правильність вибору мови

### Проблема: API не підключається
✅ **Рішення:**
1. Запустіть Voice API: `./start-voice-premium-free.sh`
2. Перевірте що порт 5094 вільний
3. Interface працюватиме з Browser API як fallback

---

## 📊 Статуси та Індикатори

| Індикатор | Значення | Дія |
|-----------|----------|-----|
| 🟢 Connected | API підключено | Все ОК |
| 🟡 Browser Mode | Тільки браузер | Запустіть API |
| 🔴 Disconnected | Помилка | Перезавантажте |
| 🎙️ Listening | Слухаємо | Говоріть |
| ⏸️ Paused | Призупинено | - |
| ⏹️ Stopped | Зупинено | Натисніть мікрофон |
| 🔊 Speaking | Озвучування | Почекайте |
| ⚙️ Processing | Обробка | Почекайте |

---

## 🎯 Roadmap

### ✅ Completed
- [x] Web Speech API інтеграція
- [x] Premium FREE Voice API
- [x] Мультимовна підтримка
- [x] AI обробка команд
- [x] Красивий UI
- [x] Налаштування

### 🚧 In Progress
- [ ] Покращення розпізнавання шуму
- [ ] Додаткові мови (ru, pl, de)
- [ ] Голосові профілі користувачів
- [ ] Voice commands history

### 🔮 Future
- [ ] Custom wake words
- [ ] Speaker identification
- [ ] Emotion detection
- [ ] Voice cloning

---

## 📝 API Documentation

### Premium FREE Voice API

#### Health Check
```typescript
GET http://localhost:5094/health

Response:
{
  "status": "healthy",
  "voice_system": "Premium FREE",
  "tts": ["coqui", "gtts", "pyttsx3"],
  "stt": ["faster-whisper", "whisper", "vosk"]
}
```

#### Get Capabilities
```typescript
GET http://localhost:5094/api/capabilities

Response:
{
  "tts_providers": {
    "coqui": true,
    "gtts": true,
    "pyttsx3": true
  },
  "stt_providers": {
    "faster-whisper": true,
    "whisper": true,
    "vosk": false
  },
  "supported_languages": ["uk", "en"],
  "recommended_tts": "coqui",
  "recommended_stt": "faster-whisper"
}
```

#### Text-to-Speech
```typescript
POST http://localhost:5094/api/tts

Request:
{
  "text": "Привіт, світ!",
  "language": "uk",
  "speed": 1.0,
  "provider": "auto"
}

Response:
Audio stream (WAV format)
```

#### Speech-to-Text
```typescript
POST http://localhost:5094/api/stt

Request:
FormData {
  audio: File,
  language: "uk",
  provider: "auto"
}

Response:
{
  "text": "розпізнаний текст",
  "language": "uk",
  "confidence": 0.95,
  "provider": "faster-whisper",
  "timestamp": "2025-10-12T..."
}
```

---

## 🔐 Безпека

### Приватність
- ✅ Голосові дані **НЕ зберігаються** на сервері
- ✅ Обробка в **реальному часі**
- ✅ Локальне виконання (офлайн режим доступний)
- ✅ Без передачі даних третім сторонам

### Дозволи
- 🎤 Доступ до мікрофона (обов'язковий)
- 🔊 Відтворення аудіо (автоматично)

---

## 🎓 Додаткові Ресурси

### Документація
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [faster-whisper](https://github.com/guillaumekln/faster-whisper)

### Відео Туторіали
- 🎥 [Як користуватися Voice Interface](https://example.com)
- 🎥 [Налаштування голосових команд](https://example.com)
- 🎥 [Tips & Tricks](https://example.com)

---

## 🤝 Підтримка

### Контакти
- 📧 Email: support@predator12.ai
- 💬 Discord: [PREDATOR12 Community](https://discord.gg/predator12)
- 🐦 Twitter: [@Predator12AI](https://twitter.com/predator12ai)

### Contributing
Хочете допомогти? Відкривайте Issues та Pull Requests на GitHub!

---

## 📜 License

MIT License - використовуйте вільно! 🎉

---

**Готово до старту? Натисніть мікрофон та скажіть "Привіт"! 🎤**
