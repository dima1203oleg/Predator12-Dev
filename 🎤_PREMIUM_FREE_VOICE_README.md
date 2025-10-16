# 🎤 PREDATOR12 PREMIUM FREE VOICE SYSTEM

## 🌟 Найкращі БЕЗКОШТОВНІ моделі для TTS та STT

Всі моделі та API **100% БЕЗКОШТОВНІ**! Без API keys, без підписок, без обмежень.

---

## 📊 МОДЕЛІ

### 🔊 TTS (Text-to-Speech)

#### 1. **Coqui TTS** ⭐⭐⭐⭐⭐ (Найкраща якість)
- **Українська**: `tts_models/uk/mai/vits`
- **Англійська**: `tts_models/en/ljspeech/vits`
- **Особливості**:
  - Нейронні голоси високої якості
  - Офлайн (не потребує інтернету після завантаження)
  - Багатомовна підтримка (100+ мов)
  - Open-source

#### 2. **gTTS** ⭐⭐⭐⭐ (Google безкоштовний)
- **Мови**: українська, англійська, 100+ мов
- **Особливості**:
  - Google якість (без API key!)
  - Потребує інтернет
  - Швидкий відгук
  - Без обмежень

#### 3. **pyttsx3** ⭐⭐⭐ (Системні голоси)
- **Мови**: залежить від системи
- **Особливості**:
  - Офлайн
  - Швидкий
  - Завжди доступний

---

### 🎧 STT (Speech-to-Text)

#### 1. **faster-whisper** ⭐⭐⭐⭐⭐ (Найшвидший)
- **Модель**: OpenAI Whisper base
- **Мови**: українська, англійська, 90+ мов
- **Особливості**:
  - Висока точність (~95%)
  - Швидкість: 5-10x швидше за звичайний Whisper
  - Офлайн
  - INT8 квантізація для швидкості

#### 2. **Whisper** ⭐⭐⭐⭐ (Якщо faster-whisper недоступний)
- **Модель**: OpenAI Whisper base
- **Мови**: українська, англійська, 90+ мов
- **Особливості**:
  - Висока точність
  - Офлайн
  - Open-source від OpenAI

#### 3. **Vosk** ⭐⭐⭐ (Real-time)
- **Мови**: українська, англійська, 20+ мов
- **Особливості**:
  - Дуже швидкий
  - Real-time розпізнавання
  - Офлайн
  - Малий розмір моделі

---

## 🚀 ШВИДКИЙ СТАРТ

### 1. Встановлення залежностей

```bash
cd /Users/dima/Documents/Predator12/predator12-local

# Створення віртуального середовища
python3 -m venv venv
source venv/bin/activate  # macOS/Linux

# Встановлення всіх залежностей
pip install -r requirements_premium_free.txt
```

**Час встановлення**: 5-10 хвилин (перший раз)  
**Розмір моделей**: ~1GB (автоматично завантажаться)

---

### 2. Запуск API сервера

```bash
# Автоматичний запуск (рекомендовано)
./start-voice-premium-free.sh

# Або вручну:
python3 voice_api_premium_free.py
```

**API буде доступний на**: `http://localhost:5094`

---

### 3. Запуск Frontend

```bash
cd frontend
npm run dev
```

**Frontend**: `http://localhost:5173`

---

## 🎯 ВИКОРИСТАННЯ

### У браузері:

1. Відкрийте: `http://localhost:5173`
2. Перейдіть до **Voice Control Interface**
3. Натисніть кнопку мікрофона 🎤
4. Говоріть українською або англійською
5. AI відповість з озвучуванням!

---

### API Endpoints:

#### TTS (Text-to-Speech)
```bash
curl -X POST http://localhost:5094/api/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Привіт! Це тестове повідомлення.",
    "language": "uk",
    "speed": 1.0,
    "provider": "auto"
  }' \
  --output audio.wav
```

#### STT (Speech-to-Text)
```bash
curl -X POST http://localhost:5094/api/stt \
  -F "audio=@audio.wav" \
  -F "language=uk" \
  -F "provider=auto"
```

#### Capabilities
```bash
curl http://localhost:5094/api/capabilities
```

---

## 📊 ПОРІВНЯННЯ ПРОВАЙДЕРІВ

| Провайдер | Якість | Швидкість | Офлайн | Українська | Безкоштовний |
|-----------|--------|-----------|--------|------------|--------------|
| **TTS: Coqui** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡ | ✅ | ✅ | ✅ |
| **TTS: gTTS** | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ❌ | ✅ | ✅ |
| **TTS: pyttsx3** | ⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ✅ | ⚠️ | ✅ |
| **STT: faster-whisper** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ✅ | ✅ | ✅ |
| **STT: Whisper** | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | ✅ | ✅ | ✅ |
| **STT: Vosk** | ⭐⭐⭐⭐ | ⚡⚡⚡⚡⚡ | ✅ | ✅ | ✅ |

---

## 💡 АВТОМАТИЧНИЙ FALLBACK

Система автоматично вибирає найкращий доступний провайдер:

### TTS (Українська):
1. **Coqui TTS** → Якщо модель завантажена
2. **gTTS** → Якщо є інтернет
3. **pyttsx3** → Завжди доступний
4. **Browser API** → Якщо API недоступний

### TTS (Англійська):
1. **Coqui TTS** → Якщо модель завантажена
2. **gTTS** → Якщо є інтернет
3. **pyttsx3** → Завжди доступний
4. **Browser API** → Якщо API недоступний

### STT (Обидві мови):
1. **faster-whisper** → Найшвидший
2. **Whisper** → Якщо faster-whisper недоступний
3. **Vosk** → Для real-time
4. **Browser API** → Якщо API недоступний

---

## 🔧 НАЛАШТУВАННЯ

### Вибір провайдера вручну:

```typescript
// TTS
await premiumFreeVoiceAPI.textToSpeech({
  text: "Привіт!",
  language: "uk",
  provider: "coqui"  // або "gtts", "pyttsx3", "auto"
});

// STT
await premiumFreeVoiceAPI.speechToText({
  audio: audioBlob,
  language: "uk",
  provider: "faster-whisper"  // або "whisper", "vosk", "auto"
});
```

---

## 📦 СИСТЕМНІ ВИМОГИ

### Мінімальні:
- **RAM**: 4GB
- **CPU**: будь-який сучасний процесор
- **Диск**: 2GB вільного місця
- **ОС**: macOS, Linux, Windows

### Рекомендовані:
- **RAM**: 8GB+
- **CPU**: 4+ ядра
- **Диск**: 5GB вільного місця
- **GPU**: не потрібен (працює на CPU)

---

## 🎉 ПЕРЕВАГИ

✅ **100% безкоштовно** - без API keys, підписок, обмежень  
✅ **Найкраща якість** - Coqui TTS (⭐⭐⭐⭐⭐), faster-whisper (⭐⭐⭐⭐⭐)  
✅ **Офлайн робота** - не потребує інтернету (після завантаження)  
✅ **Українська мова** - повна підтримка, високої якості  
✅ **Швидкість** - faster-whisper 5-10x швидше за Whisper  
✅ **Автоматичний fallback** - завжди працює  
✅ **Open-source** - прозорий код, без чорних скриньок  
✅ **Легке розгортання** - один скрипт для запуску  

---

## 🐛 TROUBLESHOOTING

### "API недоступний"
```bash
# Запустіть API сервер:
cd /Users/dima/Documents/Predator12/predator12-local
./start-voice-premium-free.sh
```

### "Модель не завантажується"
```bash
# Перевірте інтернет-з'єднання (для першого завантаження)
# Моделі завантажаться автоматично при першому запуску
```

### "Помилка встановлення"
```bash
# Оновіть pip:
pip install --upgrade pip

# Спробуйте знову:
pip install -r requirements_premium_free.txt
```

### "Повільно працює"
```bash
# Використовуйте faster-whisper замість whisper:
# Він автоматично вибирається якщо доступний
```

---

## 📚 ДОКУМЕНТАЦІЯ

- **API Docs**: http://localhost:5094/docs (після запуску)
- **Coqui TTS**: https://github.com/coqui-ai/TTS
- **OpenAI Whisper**: https://github.com/openai/whisper
- **faster-whisper**: https://github.com/guillaumekln/faster-whisper
- **gTTS**: https://github.com/pndurette/gTTS

---

## 🎯 ПРИКЛАДИ

### JavaScript/TypeScript:
```typescript
import { premiumFreeVoiceAPI } from './services/premiumFreeVoiceAPI';

// TTS
await premiumFreeVoiceAPI.textToSpeech({
  text: "Привіт! Як справи?",
  language: "uk"
});

// STT
const result = await premiumFreeVoiceAPI.speechToText({
  audio: audioBlob,
  language: "uk"
});
console.log(result.text);
```

### Python:
```python
import requests

# TTS
response = requests.post('http://localhost:5094/api/tts', json={
    'text': 'Привіт! Як справи?',
    'language': 'uk'
})
with open('audio.wav', 'wb') as f:
    f.write(response.content)

# STT
files = {'audio': open('audio.wav', 'rb')}
data = {'language': 'uk'}
response = requests.post('http://localhost:5094/api/stt', files=files, data=data)
print(response.json()['text'])
```

### cURL:
```bash
# TTS
curl -X POST http://localhost:5094/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Привіт!", "language": "uk"}' \
  --output audio.wav

# STT
curl -X POST http://localhost:5094/api/stt \
  -F "audio=@audio.wav" \
  -F "language=uk"
```

---

## ✨ ГОТОВО!

**Все налаштовано та готове до використання!**

1. Запустіть API: `./start-voice-premium-free.sh`
2. Запустіть Frontend: `cd frontend && npm run dev`
3. Відкрийте: `http://localhost:5173`
4. Говоріть з AI! 🎤

---

**🎊 100% БЕЗКОШТОВНО! НАЙКРАЩА ЯКІСТЬ! УКРАЇНСЬКА МОВА!** 🎊

**Дата створення**: 2024-10-10  
**Версія**: 1.0.0  
**Статус**: ✅ PRODUCTION READY
