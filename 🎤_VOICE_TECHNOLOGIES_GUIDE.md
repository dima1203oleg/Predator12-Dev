# 🎤 PREDATOR12 NEXUS - Voice Technologies Guide

## 🌟 Комплексне Рішення Голосових Технологій

Найкращі open-source рішення для TTS/STT з підтримкою української мови.

---

## 📋 Огляд Рішень

### 🔊 TTS (Text-to-Speech)

| Рішення | Тип | Якість | Українська | Статус |
|---------|-----|--------|------------|--------|
| **Coqui TTS** | Локальна | ⭐⭐⭐⭐⭐ | ✅ Повна | ✅ Встановлено |
| **XTTS v2** | Мультимовна | ⭐⭐⭐⭐⭐ | ✅ Нейронний | ✅ Рекомендовано |

### 🗣️ STT (Speech-to-Text)

| Рішення | Тип | Точність | Українська | Статус |
|---------|-----|----------|------------|--------|
| **Whisper Large v3** | Локальна | ⭐⭐⭐⭐⭐ | ✅ 95%+ | ✅ Доступно |
| **faster-whisper** | Оптимізована | ⭐⭐⭐⭐⭐ | ✅ Швидка | ✅ Встановлено |

---

## 🚀 Швидкий Старт (10 хвилин)

### 1️⃣ Автоматичне Встановлення

```bash
# Перейдіть до директорії проекту
cd predator12-local

# Запустіть скрипт встановлення
./install-voice-tech.sh
```

**Що встановиться:**
- ✅ Coqui TTS з українською моделлю
- ✅ Whisper (base/small/medium)
- ✅ faster-whisper (оптимізована версія)
- ✅ Всі необхідні залежності

### 2️⃣ Тестування Системи

```bash
# Активуйте віртуальне середовище
source voice-env/bin/activate

# Запустіть тести
python test_voice_system.py
```

### 3️⃣ Запуск API Сервера

```bash
# Запустіть Voice API
python voice_api.py

# API буде доступний на:
# http://localhost:8000
# Документація: http://localhost:8000/docs
```

---

## 🎯 Використання

### 🔊 Text-to-Speech (TTS)

#### Python API

```python
from TTS.api import TTS

# Ініціалізація
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# Українська мова
tts.tts_to_file(
    text="Привіт! Я голосовий асистент Нексус.",
    file_path="output_uk.wav",
    language="uk",
    speed=1.0
)

# Англійська мова
tts.tts_to_file(
    text="Hello! I am Nexus voice assistant.",
    file_path="output_en.wav",
    language="en",
    speed=1.0
)
```

#### REST API

```bash
# Запит TTS через API
curl -X POST "http://localhost:8000/api/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Привіт! Тестую голосовий синтез.",
    "language": "uk",
    "speed": 1.0
  }'
```

#### TypeScript/React

```typescript
import { voiceAPI } from './services/voiceAPI';

// Озвучування тексту
const audioURL = await voiceAPI.textToSpeech(
  "Привіт! Я голосовий асистент.",
  "uk",
  1.0
);

// Програвання
await voiceAPI.playAudio(audioURL);
```

### 🎤 Speech-to-Text (STT)

#### Python API

```python
from faster_whisper import WhisperModel

# Ініціалізація
model = WhisperModel("base", device="cpu", compute_type="int8")

# Розпізнавання
segments, info = model.transcribe(
    "audio.wav",
    language="uk",
    beam_size=5
)

text = " ".join([segment.text for segment in segments])
print(f"Розпізнано: {text}")
```

#### REST API

```bash
# Запит STT через API
curl -X POST "http://localhost:8000/api/stt" \
  -F "audio=@recording.wav"
```

#### TypeScript/React

```typescript
import { voiceAPI } from './services/voiceAPI';

// Запис аудіо
const audioBlob = await voiceAPI.recordAudio(5000); // 5 секунд

// Розпізнавання
const text = await voiceAPI.speechToText(audioBlob);
console.log('Розпізнано:', text);
```

---

## 🔄 Повний Цикл Voice Interaction

```typescript
import { voiceAPI } from './services/voiceAPI';

// Запис -> Розпізнавання -> Обробка -> Озвучування
const audioBlob = await voiceAPI.recordAudio(5000);

await voiceAPI.voiceInteraction(
  audioBlob,
  (text) => console.log('Розпізнано:', text),
  (response) => console.log('Відповідь:', response)
);
```

---

## 📊 API Endpoints

### Основні

- `GET /` - Інформація про API
- `GET /health` - Перевірка стану
- `GET /test/models` - Доступні моделі

### TTS

- `POST /api/tts` - Синтез мовлення
  ```json
  {
    "text": "Текст для озвучування",
    "language": "uk",
    "speed": 1.0
  }
  ```

### STT

- `POST /api/stt` - Розпізнавання мовлення
  - Form-data: `audio` (файл)

### Тестування

- `GET /test/tts` - Швидкий тест TTS
- `GET /audio/{filename}` - Отримання згенерованого аудіо

---

## ⚙️ Конфігурація

### Моделі TTS

Доступні моделі Coqui TTS:

```python
# Багатомовна (рекомендовано)
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# Тільки українська
tts = TTS("tts_models/uk/mai/glow-tts")

# Тільки англійська
tts = TTS("tts_models/en/ljspeech/tacotron2-DDC")
```

### Моделі STT

Доступні моделі Whisper:

```python
# Швидкі моделі
model = WhisperModel("tiny")   # ~1GB RAM
model = WhisperModel("base")   # ~1GB RAM
model = WhisperModel("small")  # ~2GB RAM

# Точні моделі
model = WhisperModel("medium") # ~5GB RAM
model = WhisperModel("large")  # ~10GB RAM
model = WhisperModel("large-v3") # ~10GB RAM (найточніша)
```

---

## 🎨 Інтеграція з Frontend

### 1. Оновлення AIVoiceInterface

```tsx
import { voiceAPI } from '../../services/voiceAPI';

// У компоненті
useEffect(() => {
  // Перевірка доступності API
  voiceAPI.checkHealth().then(isHealthy => {
    if (isHealthy) {
      console.log('✅ Voice API готовий');
    } else {
      console.log('⚠️ Voice API недоступний, використовується Web Speech API');
    }
  });
}, []);

// TTS через API
const speakWithAPI = async (text: string) => {
  const audioURL = await voiceAPI.textToSpeech(text, 'uk');
  if (audioURL) {
    await voiceAPI.playAudio(audioURL);
  }
};

// STT через API
const listenWithAPI = async () => {
  const audioBlob = await voiceAPI.recordAudio(5000);
  if (audioBlob) {
    const text = await voiceAPI.speechToText(audioBlob);
    console.log('Розпізнано:', text);
  }
};
```

### 2. Fallback Strategy

```typescript
// Спочатку спробувати API, потім Web Speech API
const speak = async (text: string) => {
  // Спроба 1: Backend API (якісніше)
  try {
    const audioURL = await voiceAPI.textToSpeech(text, 'uk');
    if (audioURL) {
      await voiceAPI.playAudio(audioURL);
      return;
    }
  } catch (error) {
    console.log('Backend недоступний, використовується Web Speech API');
  }

  // Спроба 2: Web Speech API (браузер)
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'uk-UA';
  window.speechSynthesis.speak(utterance);
};
```

---

## 🔧 Налаштування Продуктивності

### CPU/GPU

```python
# CPU (за замовчуванням)
model = WhisperModel("base", device="cpu", compute_type="int8")

# GPU (якщо є CUDA)
model = WhisperModel("base", device="cuda", compute_type="float16")

# Apple Silicon (M1/M2/M3)
model = WhisperModel("base", device="cpu", compute_type="int8")
# PyTorch автоматично використає MPS
```

### Швидкість vs Якість

| Модель | Розмір | Швидкість | Якість | RAM |
|--------|--------|-----------|--------|-----|
| tiny | 39M | ⚡⚡⚡⚡⚡ | ⭐⭐ | ~1GB |
| base | 74M | ⚡⚡⚡⚡ | ⭐⭐⭐ | ~1GB |
| small | 244M | ⚡⚡⚡ | ⭐⭐⭐⭐ | ~2GB |
| medium | 769M | ⚡⚡ | ⭐⭐⭐⭐⭐ | ~5GB |
| large-v3 | 1550M | ⚡ | ⭐⭐⭐⭐⭐ | ~10GB |

---

## 🐛 Troubleshooting

### Проблема: TTS не працює

```bash
# Переконайтеся що модель завантажена
python -c "from TTS.api import TTS; TTS('tts_models/multilingual/multi-dataset/xtts_v2')"

# Перевірте версію
pip show TTS
```

### Проблема: STT не розпізнає українську

```bash
# Вкажіть мову явно
segments, info = model.transcribe(audio, language="uk")

# Або дозвольте автовизначення
segments, info = model.transcribe(audio, language=None)
```

### Проблема: Повільна робота

```bash
# Використайте smaller модель
model = WhisperModel("tiny")  # Замість large

# Або faster-whisper замість whisper
pip install faster-whisper
```

---

## 📦 Файлова Структура

```
predator12-local/
├── voice-requirements.txt      # Python залежності
├── install-voice-tech.sh       # Скрипт встановлення
├── voice_api.py                # API сервер
├── test_voice_system.py        # Тестовий скрипт
├── voice-env/                  # Віртуальне середовище
├── voice-tests/                # Тестові аудіо файли
├── static/audio/               # Згенеровані аудіо
└── frontend/
    └── src/
        ├── services/
        │   └── voiceAPI.ts     # Frontend клієнт
        └── components/
            └── voice/
                └── AIVoiceInterface.tsx
```

---

## 🎓 Додаткові Ресурси

### Документація

- **Coqui TTS**: https://github.com/coqui-ai/TTS
- **Whisper**: https://github.com/openai/whisper
- **faster-whisper**: https://github.com/guillaumekln/faster-whisper

### Моделі

- **TTS Models**: https://github.com/coqui-ai/TTS#models
- **Whisper Models**: https://github.com/openai/whisper#available-models-and-languages

### Приклади

- **Coqui TTS Demo**: https://huggingface.co/spaces/coqui/xtts
- **Whisper Demo**: https://huggingface.co/spaces/openai/whisper

---

## ✅ Checklist Готовності

- [ ] Python 3.9+ встановлено
- [ ] Віртуальне середовище створено
- [ ] Залежності встановлені
- [ ] Моделі завантажені
- [ ] Тести пройдені успішно
- [ ] API сервер запущений
- [ ] Frontend інтегрований
- [ ] Голосові команди працюють

---

## 🎉 Результат

Після завершення всіх кроків ви матимете:

✅ **Локальний TTS** - Озвучування українською без інтернету  
✅ **Локальний STT** - Розпізнавання українською без інтернету  
✅ **REST API** - Доступ з будь-якого клієнта  
✅ **TypeScript SDK** - Готова інтеграція для фронтенду  
✅ **Fallback** - Web Speech API як резерв  
✅ **95%+ точність** - Найкращі моделі  

---

**🚀 PREDATOR12 NEXUS Voice Technologies - Ready to Use!**

*Створено командою PREDATOR12 ❤️*
