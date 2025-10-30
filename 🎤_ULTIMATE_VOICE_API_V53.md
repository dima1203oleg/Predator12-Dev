# 🎤 PREDATOR12 Ultimate Voice System V5.3

## 🚀 API-First підхід з триступеневою логікою fallback

### ⚡ Швидкий старт

```bash
# 1. Запуск API сервера
cd predator12-local
./start-voice-ultimate.sh

# 2. Запуск тестів
python3 test_voice_ultimate.py

# 3. Запуск фронтенду
cd frontend
npm start
```

---

## 📊 Архітектура системи

### Триступенева логіка fallback

```
┌─────────────────────────────────────────────────────────────┐
│                   РІВЕНЬ 1: API SERVICES                    │
├─────────────────────────────────────────────────────────────┤
│  🌐 ElevenLabs      → Найкраща якість нейронних голосів    │
│  🌐 Google Cloud TTS → Wavenet Ukrainian, багатомовність   │
│  🌐 Azure Speech     → Neural voices, 110+ мов             │
├─────────────────────────────────────────────────────────────┤
│  ✅ Якість: 10/10    💰 Безкоштовні ліміти                 │
│  ⚡ Швидкість: High   🌍 Мультимова: Так                   │
└─────────────────────────────────────────────────────────────┘
                           ⬇️ Fallback
┌─────────────────────────────────────────────────────────────┐
│                  РІВЕНЬ 2: LOCAL MODELS                     │
├─────────────────────────────────────────────────────────────┤
│  💻 Coqui TTS (XTTS v2)      → Українська, англійська     │
│  💻 Piper TTS                → Швидкий, якісний            │
│  🎧 Whisper / faster-whisper → STT, багатомовний           │
├─────────────────────────────────────────────────────────────┤
│  ✅ Якість: 8/10     💰 100% безкоштовно                   │
│  ⚡ Швидкість: Medium 🔒 Privacy: Максимум                 │
│  📡 Offline: Так     💾 Вимоги: 2-4 GB RAM                 │
└─────────────────────────────────────────────────────────────┘
                           ⬇️ Fallback
┌─────────────────────────────────────────────────────────────┐
│              РІВЕНЬ 3: BROWSER WEB SPEECH API               │
├─────────────────────────────────────────────────────────────┤
│  🌐 SpeechSynthesis     → TTS в браузері                   │
│  🎤 SpeechRecognition   → STT в браузері                   │
├─────────────────────────────────────────────────────────────┤
│  ✅ Якість: 6/10     💰 Завжди безкоштовно                 │
│  ⚡ Швидкість: High   📡 Завжди доступний                  │
│  🔧 Setup: None      ✨ Zero dependencies                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Основні можливості

### 1. **Автоматичний вибір провайдера**
Система автоматично вибирає найкращий доступний провайдер:
- ✅ API доступний → використовується API
- ❌ API недоступний → використовується Local
- ❌ Local недоступний → використовується Browser

### 2. **Українська мова з високою якістю**
- ElevenLabs: Нейронні українські голоси
- Google Cloud: Wavenet-Ukrainian
- Azure: OstapNeural, PolinaNeural
- Coqui XTTS v2: Підтримка української
- Browser: Системні українські голоси

### 3. **Кешування для швидкості**
- Автоматичне кешування згенерованих аудіо
- Миттєве відтворення повторних запитів
- Економія API лімітів

### 4. **Production-ready**
- Обробка помилок на кожному рівні
- Логування всіх операцій
- Health check endpoints
- Capabilities API

---

## 📁 Структура проекту

```
predator12-local/
├── voice_api_ultimate.py          # 🎤 API сервер V5.3
├── frontend/src/
│   ├── services/
│   │   └── voiceAPIUltimate.ts    # 📦 TypeScript SDK
│   └── components/voice/
│       └── AIVoiceInterface.tsx   # 🎨 React компонент
├── test_voice_ultimate.py         # 🧪 Тест suite
├── start-voice-ultimate.sh        # ⚡ Швидкий запуск
└── voice-requirements.txt         # 📋 Залежності
```

---

## 🔧 Встановлення

### Крок 1: Базові залежності

```bash
# Встановлення Python залежностей
pip3 install -r voice-requirements.txt

# Основні пакети:
# - fastapi, uvicorn         → API сервер
# - aiohttp                  → Async HTTP клієнт
# - TTS (Coqui)              → Local TTS
# - whisper, faster-whisper  → Local STT
# - soundfile, numpy         → Аудіо обробка
```

### Крок 2: API Keys (опціонально)

```bash
# ElevenLabs (найкраща якість)
export ELEVENLABS_API_KEY="your_key_here"

# Google Cloud TTS
export GOOGLE_CLOUD_API_KEY="your_key_here"

# Azure Speech
export AZURE_SPEECH_KEY="your_key_here"
export AZURE_SPEECH_REGION="westeurope"
```

💡 **Без API keys** система працює з локальними моделями та браузером

### Крок 3: Завантаження моделей (для Local)

```bash
# Автоматичне завантаження при першому запуску
python3 -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"
python3 -c "import whisper; whisper.load_model('base')"
```

---

## 🚀 Використання

### Backend (API Server)

```bash
# Запуск сервера
./start-voice-ultimate.sh

# Або вручну
python3 voice_api_ultimate.py

# API доступний на http://localhost:8000
```

### Frontend (TypeScript/React)

```typescript
import { voiceAPIUltimate } from '@/services/voiceAPIUltimate';

// TTS з автоматичним fallback
const response = await voiceAPIUltimate.textToSpeech({
  text: 'Привіт! Я ваш AI асистент.',
  language: 'uk',
  speed: 1.0,
  provider: 'auto',  // auto, api, local, browser
  quality: 'high'
});

console.log(`Озвучено через: ${response.provider}`);

// STT з автоматичним fallback
const audioBlob = await recordAudio();
const sttResponse = await voiceAPIUltimate.speechToText(
  audioBlob,
  'uk',
  'auto'
);

console.log(`Розпізнано: ${sttResponse.text}`);
```

### Перевірка capabilities

```typescript
const capabilities = await voiceAPIUltimate.loadCapabilities();

console.log('API Services:', capabilities.api_services);
console.log('Local Models:', capabilities.local_models);
console.log('Recommended:', capabilities.recommended_provider);
```

---

## 📚 API Endpoints

### `POST /api/tts`
Синтез мовлення з триступеневою логікою fallback

**Request:**
```json
{
  "text": "Привіт! Як справи?",
  "language": "uk",
  "speed": 1.0,
  "voice": null,
  "provider": "auto",
  "quality": "high"
}
```

**Response:**
```json
{
  "audio_url": "/audio/tts_20240101_120000.wav",
  "text": "Привіт! Як справи?",
  "language": "uk",
  "duration": 2.5,
  "provider": "ElevenLabs",
  "cached": false,
  "timestamp": "2024-01-01T12:00:00"
}
```

### `POST /api/stt`
Розпізнавання мовлення

**Request:**
```bash
curl -X POST http://localhost:8000/api/stt \
  -F "audio=@recording.wav" \
  -F "language=uk" \
  -F "provider=auto"
```

**Response:**
```json
{
  "text": "Привіт як справи",
  "language": "uk",
  "confidence": 0.95,
  "duration": 2.3,
  "provider": "faster-whisper",
  "timestamp": "2024-01-01T12:00:00"
}
```

### `GET /api/capabilities`
Інформація про можливості системи

**Response:**
```json
{
  "api_services": {
    "ElevenLabs": true,
    "Google Cloud TTS": false,
    "Azure Speech": true
  },
  "local_models": {
    "Coqui TTS": true,
    "Piper TTS": false,
    "Whisper": true,
    "faster-whisper": true
  },
  "browser_fallback": true,
  "supported_languages": ["uk", "en", "ru", "pl", "de", "fr"],
  "recommended_provider": "api"
}
```

### `GET /health`
Health check

**Response:**
```json
{
  "status": "healthy",
  "api_services": {...},
  "local_models": {"tts": true, "stt": true},
  "timestamp": "2024-01-01T12:00:00"
}
```

---

## 🧪 Тестування

### Запуск тестів

```bash
# Комплексне тестування всієї системи
python3 test_voice_ultimate.py

# Тести включають:
# ✅ Health check
# ✅ Capabilities перевірка
# ✅ Fallback chain (API → Local → Browser)
# ✅ Багатомовність (українська, англійська)
# ✅ Продуктивність (швидкість генерації)
# ✅ Кешування (повторні запити)
# ✅ Edge cases (спецсимволи, емодзі, цифри)
```

### Ручне тестування

```bash
# TTS через API
curl -X POST http://localhost:8000/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Привіт! Це тест.",
    "language": "uk",
    "provider": "auto"
  }'

# STT через API
curl -X POST http://localhost:8000/api/stt \
  -F "audio=@test_audio.wav" \
  -F "language=uk"
```

---

## 🎨 Інтеграція у фронтенд

### AIVoiceInterface Component

Компонент автоматично використовує Ultimate Voice API:

```tsx
import { voiceAPIUltimate } from '@/services/voiceAPIUltimate';

// Автоматична ініціалізація capabilities
useEffect(() => {
  voiceAPIUltimate.loadCapabilities();
}, []);

// Озвучування з fallback
const speakText = async (text: string) => {
  try {
    const response = await voiceAPIUltimate.textToSpeech({
      text,
      language: 'uk',
      provider: 'auto'
    });

    console.log(`Озвучено через: ${response.provider}`);
  } catch (error) {
    console.error('TTS error:', error);
  }
};

// STT з fallback
const recognizeSpeech = async (audioBlob: Blob) => {
  try {
    const response = await voiceAPIUltimate.speechToText(
      audioBlob,
      'uk',
      'auto'
    );

    console.log(`Розпізнано: ${response.text}`);
    return response.text;
  } catch (error) {
    console.error('STT error:', error);
  }
};
```

---

## 📊 Порівняння провайдерів

| Provider | Якість | Швидкість | Українська | Ціна | Offline |
|----------|--------|-----------|------------|------|---------|
| **ElevenLabs** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ | ✅ | 💰 Free tier | ❌ |
| **Google Cloud** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ✅ Wavenet | 💰 Free tier | ❌ |
| **Azure Speech** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ | ✅ Neural | 💰 Free tier | ❌ |
| **Coqui TTS** | ⭐⭐⭐⭐ | ⚡⚡⚡ | ✅ | 💰 Free | ✅ |
| **Piper** | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ✅ | 💰 Free | ✅ |
| **Whisper** | ⭐⭐⭐⭐⭐ | ⚡⚡ | ✅ | 💰 Free | ✅ |
| **faster-whisper** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ | ✅ | 💰 Free | ✅ |
| **Browser API** | ⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ✅ | 💰 Free | ✅ |

---

## 💡 Best Practices

### 1. **Використовуйте 'auto' provider**
```typescript
// ✅ Добре - система вибере найкращий
voiceAPIUltimate.textToSpeech({ text, provider: 'auto' });

// ❌ Погано - прив'язка до конкретного провайдера
voiceAPIUltimate.textToSpeech({ text, provider: 'api' });
```

### 2. **Перевіряйте capabilities**
```typescript
const capabilities = await voiceAPIUltimate.loadCapabilities();
const provider = capabilities.recommended_provider;
console.log(`Використовую: ${provider}`);
```

### 3. **Обробляйте помилки**
```typescript
try {
  await voiceAPIUltimate.textToSpeech({ text });
} catch (error) {
  console.error('TTS failed:', error);
  // Fallback вже відбувся автоматично
}
```

### 4. **Очищайте кеш**
```typescript
// Очистити кеш після завершення роботи
voiceAPIUltimate.clearCache();
```

---

## 🔒 Безпека та Privacy

### API Keys
- 🔐 Зберігайте API keys в environment variables
- ❌ Ніколи не комітьте keys в Git
- ✅ Використовуйте `.env` файли

### Local Models
- ✅ Повна privacy - дані не виходять з системи
- ✅ GDPR compliant
- ✅ Працює offline

### Browser API
- ✅ Дані обробляються локально в браузері
- ⚠️ Залежить від браузера (Chrome, Firefox, Safari)

---

## 📈 Продуктивність

### Швидкість генерації (1 секунда аудіо)

| Provider | Час генерації | Якість |
|----------|---------------|--------|
| ElevenLabs | ~0.5-1s | Відмінна |
| Google Cloud | ~0.3-0.7s | Відмінна |
| Azure | ~0.5-1s | Відмінна |
| Coqui TTS | ~2-5s | Добра |
| Piper | ~0.5-1s | Добра |
| Browser API | Миттєво | Середня |

### Системні вимоги

**Мінімальні (Browser only):**
- 🖥️ CPU: Будь-який сучасний
- 💾 RAM: 1 GB
- 💿 Диск: 0 MB

**Оптимальні (Local Models):**
- 🖥️ CPU: 4+ cores
- 💾 RAM: 4-8 GB
- 💿 Диск: 5 GB для моделей

**Рекомендовані (API + Local):**
- 🖥️ CPU: 8+ cores
- 💾 RAM: 8-16 GB
- 💿 Диск: 10 GB
- 🌐 Інтернет: Stable connection

---

## 🐛 Troubleshooting

### Проблема: API сервер не запускається

```bash
# Перевірте залежності
pip3 install -r voice-requirements.txt

# Перевірте порт 8000
lsof -i :8000
kill -9 <PID>

# Перезапустіть сервер
python3 voice_api_ultimate.py
```

### Проблема: Локальні моделі не завантажуються

```bash
# Завантажте моделі вручну
python3 -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"
python3 -c "import whisper; whisper.load_model('base')"

# Перевірте доступний простір на диску
df -h
```

### Проблема: API keys не працюють

```bash
# Перевірте environment variables
echo $ELEVENLABS_API_KEY
echo $GOOGLE_CLOUD_API_KEY
echo $AZURE_SPEECH_KEY

# Експортуйте знову
export ELEVENLABS_API_KEY="your_key"

# Перезапустіть сервер
```

### Проблема: Browser API не працює

- ✅ Використовуйте HTTPS (для виробництва)
- ✅ Перевірте підтримку браузера
- ✅ Дозвольте доступ до мікрофона

---

## 🎯 Roadmap

### v5.4 (Заплановано)
- [ ] WebSocket підтримка для streaming
- [ ] Кастомні голоси (voice cloning)
- [ ] Аналітика використання
- [ ] Мобільна оптимізація

### v6.0 (Майбутнє)
- [ ] Підтримка більше мов (100+)
- [ ] Емоційні голоси
- [ ] Realtime voice conversion
- [ ] On-device моделі для mobile

---

## 📞 Підтримка

**Документація:**
- 📖 Основна: [VOICE_README.md](./VOICE_README.md)
- ⚡ Quickstart: [VOICE_QUICKSTART.txt](./VOICE_QUICKSTART.txt)
- 🎤 Гайд: [VOICE_GUIDE.md](./VOICE_GUIDE.md)

**Логи:**
```bash
# API сервер логи
tail -f /var/log/voice-api.log

# Браузер console
F12 → Console
```

---

## ✅ Checklist для Production

- [ ] ✅ API keys налаштовані
- [ ] ✅ Локальні моделі завантажені
- [ ] ✅ Тести пройдені успішно
- [ ] ✅ Health check працює
- [ ] ✅ CORS налаштований правильно
- [ ] ✅ HTTPS ввімкнено (для виробництва)
- [ ] ✅ Логування налаштоване
- [ ] ✅ Моніторинг активний
- [ ] ✅ Backup strategy є
- [ ] ✅ Документація оновлена

---

## 🎉 Готово!

**Ultimate Voice System** повністю інтегрований та готовий до production!

```bash
# Запустити все в 3 кроки:
./start-voice-ultimate.sh         # Backend
python3 test_voice_ultimate.py    # Tests
cd frontend && npm start           # Frontend
```

**Функції:**
- ✅ Триступенева логіка fallback
- ✅ API-First підхід (ElevenLabs, Google, Azure)
- ✅ Local fallback (Coqui, Piper, Whisper)
- ✅ Browser fallback (Web Speech API)
- ✅ Українська мова з високою якістю
- ✅ Автоматичне кешування
- ✅ Production-ready з повним тестуванням

**Наступні кроки:**
1. Налаштувати API keys для кращої якості
2. Запустити систему: `./start-voice-ultimate.sh`
3. Протестувати: `python3 test_voice_ultimate.py`
4. Використовувати у фронтенді через `voiceAPIUltimate`

---

Made with ❤️ by PREDATOR12 Team
