# 🎤 Voice Control System - STT/TTS Integration Guide

## 📋 Поточний стан

Voice Control Interface тепер підтримує вибір різних движків для розпізнавання мови (STT) та синтезу мови (TTS).

## 🌐 Поточно активні движки

### STT (Speech-to-Text)
- **Browser (Web Speech API)** ✅ — Працює out-of-the-box
  - Використовує `window.SpeechRecognition`
  - Підтримка: Chrome, Edge, Safari
  - Безкоштовно, онлайн
  - Точність: ~85-90%

### TTS (Text-to-Speech)
- **Browser TTS** ✅ — Працює out-of-the-box
  - Використовує `window.speechSynthesis`
  - Підтримка: всі сучасні браузери
  - Безкоштовно
  - Якість: середня-добра

## 🚀 Майбутні інтеграції (готовність UI)

### 1. Whisper.cpp (Local STT)
**Переваги:**
- 🔒 Повністю offline
- 🎯 Висока точність (~95%)
- 🌍 Багатомовність (99 мов)
- 🆓 Безкоштовно

**Інтеграція:**
```bash
# Backend setup (Python)
pip install faster-whisper

# Або C++ версія
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
make
```

**Backend endpoint:**
```python
from fastapi import FastAPI, File, UploadFile
from faster_whisper import WhisperModel

app = FastAPI()
model = WhisperModel("base", device="cpu", compute_type="int8")

@app.post("/api/voice/transcribe")
async def transcribe(audio: UploadFile):
    segments, info = model.transcribe(audio.file)
    return {"text": " ".join([s.text for s in segments])}
```

**Frontend integration:**
```typescript
// In VoiceControlInterface.tsx
const transcribeWithWhisper = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  const response = await fetch('http://localhost:8000/api/voice/transcribe', {
    method: 'POST',
    body: formData
  });
  
  const { text } = await response.json();
  return text;
};
```

### 2. Vosk (Offline STT)
**Переваги:**
- 🔒 Повністю offline
- ⚡ Швидкий (real-time)
- 📦 Малий розмір моделей (50-1400MB)
- 🆓 Безкоштовно

**Інтеграція:**
```bash
# Python
pip install vosk

# Завантажити модель
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip
```

**Backend:**
```python
from vosk import Model, KaldiRecognizer
import json

model = Model("model")

@app.post("/api/voice/vosk-transcribe")
async def vosk_transcribe(audio: UploadFile):
    rec = KaldiRecognizer(model, 16000)
    rec.AcceptWaveform(audio.file.read())
    result = json.loads(rec.Result())
    return {"text": result.get("text", "")}
```

### 3. Coqui TTS (Local TTS)
**Переваги:**
- 🎙️ Висока якість голосу
- 🎭 Багато голосів
- 🔒 Offline
- 🆓 Безкоштовно

**Інтеграція:**
```bash
pip install TTS
```

**Backend:**
```python
from TTS.api import TTS

tts = TTS("tts_models/en/ljspeech/tacotron2-DDC")

@app.post("/api/voice/synthesize")
async def synthesize(text: str):
    tts.tts_to_file(text=text, file_path="output.wav")
    return FileResponse("output.wav")
```

### 4. Piper TTS (Fast Local TTS)
**Переваги:**
- ⚡ Дуже швидкий
- 📦 Малий розмір
- 🔒 Offline
- 🆓 Безкоштовно

**Інтеграція:**
```bash
# Завантажити Piper
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
tar -xzf piper_amd64.tar.gz
```

**Backend:**
```python
import subprocess

@app.post("/api/voice/piper-tts")
async def piper_tts(text: str):
    subprocess.run([
        "./piper",
        "--model", "en_US-lessac-medium",
        "--output_file", "output.wav"
    ], input=text.encode())
    return FileResponse("output.wav")
```

## 🌟 Рекомендовані безкоштовні API

### Hugging Face Inference API
```typescript
// Free tier: 30,000 chars/month
const response = await fetch(
  "https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h",
  {
    headers: { Authorization: `Bearer ${HF_TOKEN}` },
    method: "POST",
    body: audioBlob,
  }
);
```

### Google Cloud Speech-to-Text Free Tier
- 60 хвилин/місяць безкоштовно
- Висока точність
- Багато мов

## 📊 Порівняння движків

| Движок | Тип | Offline | Швидкість | Точність | Розмір |
|--------|-----|---------|-----------|----------|--------|
| Browser API | STT | ❌ | ⚡⚡⚡ | 85% | 0 MB |
| Whisper.cpp | STT | ✅ | ⚡⚡ | 95% | 75-1500 MB |
| Vosk | STT | ✅ | ⚡⚡⚡ | 90% | 50-1400 MB |
| Browser TTS | TTS | ❌ | ⚡⚡⚡ | 70% | 0 MB |
| Coqui TTS | TTS | ✅ | ⚡⚡ | 95% | 200-500 MB |
| Piper | TTS | ✅ | ⚡⚡⚡ | 85% | 10-50 MB |

## 🔧 Швидкий старт (локальна інтеграція)

### Крок 1: Встановити Python залежності
```bash
cd predator12-local/backend
pip install faster-whisper TTS vosk fastapi uvicorn python-multipart
```

### Крок 2: Завантажити моделі
```bash
# Vosk
wget https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
unzip vosk-model-small-en-us-0.15.zip -d models/vosk

# Whisper (автоматично завантажиться при першому використанні)
```

### Крок 3: Запустити backend
```bash
python voice_api.py
```

### Крок 4: Оновити frontend
```typescript
// У VoiceControlInterface.tsx змінити ендпоінти на локальні
const API_BASE = 'http://localhost:8000/api/voice';
```

## 🎯 Поточна функціональність

### Що вже працює:
- ✅ Web Speech API (браузер STT)
- ✅ Browser TTS
- ✅ UI для вибору движків
- ✅ Історія команд
- ✅ Статуси обробки
- ✅ Прив'язка до AI агентів

### Що треба інтегрувати:
- ⏳ Whisper.cpp backend
- ⏳ Vosk backend
- ⏳ Coqui TTS backend
- ⏳ Piper TTS backend
- ⏳ WebSocket для streaming
- ⏳ Аудіо візуалізація

## 💡 Тестування голосових команд

Спробуйте сказати:
- "Activate self healer"
- "Generate new dataset"
- "Check model health"
- "Optimize performance"
- "Run security scan"
- "System status report"
- "Debug and fix issues"
- "Evolve neural architecture"

## 🔐 Безпека

Для production:
- Використовувати HTTPS
- Додати rate limiting
- Валідувати audio формати
- Додати timeout для транскрипції
- Логувати команди (GDPR compliance)

## 📚 Корисні ресурси

- [Whisper.cpp GitHub](https://github.com/ggerganov/whisper.cpp)
- [Vosk Documentation](https://alphacephei.com/vosk/)
- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [Piper TTS](https://github.com/rhasspy/piper)
- [Hugging Face Models](https://huggingface.co/models?pipeline_tag=automatic-speech-recognition)

---

**Для питань та допомоги:** Відкрийте issue в репозиторії або напишіть в Discord.
