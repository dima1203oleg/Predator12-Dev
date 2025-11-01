#!/usr/bin/env python3
"""
🎤 PREDATOR12 NEXUS - Voice API Server
Повноцінний API сервер для TTS/STT з українською мовою
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import io
import tempfile
import json
from datetime import datetime
from typing import Optional, List
import asyncio

# Імпорти для TTS/STT
try:
    from TTS.api import TTS
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("⚠️  Coqui TTS не встановлено")

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️  Whisper не встановлено")

try:
    from faster_whisper import WhisperModel
    FASTER_WHISPER_AVAILABLE = True
except ImportError:
    FASTER_WHISPER_AVAILABLE = False
    print("⚠️  faster-whisper не встановлено")

import soundfile as sf
import numpy as np

# ============================================
# FastAPI Application
# ============================================

app = FastAPI(
    title="🎤 PREDATOR12 Voice API",
    description="Голосовий API з TTS/STT підтримкою української мови",
    version="5.2.0"
)

# CORS для фронтенду
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Глобальні моделі
# ============================================

tts_model = None
whisper_model = None
faster_whisper_model = None

# ============================================
# Pydantic Models
# ============================================

class TTSRequest(BaseModel):
    text: str
    language: str = "uk"  # uk, en
    speed: float = 1.0
    voice: Optional[str] = None

class STTResponse(BaseModel):
    text: str
    language: str
    confidence: float
    duration: float
    timestamp: str

class TTSResponse(BaseModel):
    audio_url: str
    text: str
    language: str
    duration: float
    timestamp: str

# ============================================
# Startup Event
# ============================================

@app.on_event("startup")
async def startup_event():
    """Ініціалізація моделей при запуску"""
    global tts_model, whisper_model, faster_whisper_model

    print("🚀 Запуск PREDATOR12 Voice API...")
    print("=" * 50)

    # Ініціалізація TTS
    if TTS_AVAILABLE:
        try:
            print("📥 Завантаження Coqui TTS...")
            # Використовуємо багатомовну модель
            tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
            print("✅ Coqui TTS завантажено (Ukrainian + English)")
        except Exception as e:
            print(f"⚠️  Помилка TTS: {e}")
            tts_model = None

    # Ініціалізація Whisper
    if FASTER_WHISPER_AVAILABLE:
        try:
            print("📥 Завантаження faster-whisper...")
            # Використовуємо base модель для швидкості
            faster_whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
            print("✅ faster-whisper завантажено")
        except Exception as e:
            print(f"⚠️  Помилка faster-whisper: {e}")

    if WHISPER_AVAILABLE and not faster_whisper_model:
        try:
            print("📥 Завантаження Whisper...")
            whisper_model = whisper.load_model("base")
            print("✅ Whisper завантажено")
        except Exception as e:
            print(f"⚠️  Помилка Whisper: {e}")

    print("=" * 50)
    print("🎉 API готовий до роботи!")
    print(f"📍 http://localhost:8000")
    print(f"📚 Документація: http://localhost:8000/docs")
    print("=" * 50)

# ============================================
# Health Check
# ============================================

@app.get("/")
async def root():
    """Головна сторінка API"""
    return {
        "service": "PREDATOR12 Voice API",
        "version": "5.2.0",
        "status": "online",
        "capabilities": {
            "tts": TTS_AVAILABLE and tts_model is not None,
            "stt": (WHISPER_AVAILABLE or FASTER_WHISPER_AVAILABLE),
            "languages": ["uk", "en"]
        },
        "endpoints": {
            "tts": "/api/tts",
            "stt": "/api/stt",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Перевірка стану системи"""
    return {
        "status": "healthy",
        "tts_ready": tts_model is not None,
        "stt_ready": whisper_model is not None or faster_whisper_model is not None,
        "timestamp": datetime.now().isoformat()
    }

# ============================================
# TTS Endpoint
# ============================================

@app.post("/api/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """
    Синтез мовлення з тексту

    - **text**: Текст для озвучування
    - **language**: Мова (uk/en)
    - **speed**: Швидкість мовлення (0.5-2.0)
    - **voice**: Опціональний голос
    """
    if not tts_model:
        raise HTTPException(status_code=503, detail="TTS модель недоступна")

    try:
        # Створюємо тимчасовий файл
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            output_path = tmp_file.name

        # Генеруємо аудіо
        print(f"🔊 Генерація TTS: '{request.text[:50]}...'")

        # Встановлюємо мову
        lang_code = "uk" if request.language == "uk" else "en"

        # Генеруємо
        tts_model.tts_to_file(
            text=request.text,
            file_path=output_path,
            language=lang_code,
            speed=request.speed
        )

        # Отримуємо тривалість
        audio, sr = sf.read(output_path)
        duration = len(audio) / sr

        # Зберігаємо в постійну директорію
        os.makedirs("static/audio", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_path = f"static/audio/tts_{timestamp}.wav"
        os.rename(output_path, final_path)

        print(f"✅ TTS завершено: {duration:.2f}s")

        return TTSResponse(
            audio_url=f"/audio/{os.path.basename(final_path)}",
            text=request.text,
            language=request.language,
            duration=duration,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        print(f"❌ Помилка TTS: {e}")
        raise HTTPException(status_code=500, detail=f"Помилка TTS: {str(e)}")

# ============================================
# STT Endpoint
# ============================================

@app.post("/api/stt", response_model=STTResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Розпізнавання мовлення з аудіо

    - **audio**: Аудіо файл (WAV, MP3, FLAC)
    """
    if not whisper_model and not faster_whisper_model:
        raise HTTPException(status_code=503, detail="STT модель недоступна")

    try:
        # Зберігаємо завантажений файл
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio.filename)[1]) as tmp_file:
            content = await audio.read()
            tmp_file.write(content)
            audio_path = tmp_file.name

        print(f"🎤 Розпізнавання STT: {audio.filename}")

        # Використовуємо faster-whisper якщо доступно
        if faster_whisper_model:
            segments, info = faster_whisper_model.transcribe(
                audio_path,
                language="uk",
                beam_size=5
            )

            text = " ".join([segment.text for segment in segments])
            language = info.language
            confidence = info.language_probability
            duration = info.duration

        else:
            # Використовуємо звичайний Whisper
            result = whisper_model.transcribe(
                audio_path,
                language="uk",
                task="transcribe"
            )

            text = result["text"]
            language = result.get("language", "uk")
            confidence = 0.95  # Whisper не дає confidence

            # Отримуємо тривалість
            audio_data, sr = sf.read(audio_path)
            duration = len(audio_data) / sr

        # Видаляємо тимчасовий файл
        os.unlink(audio_path)

        print(f"✅ STT завершено: '{text[:50]}...'")

        return STTResponse(
            text=text.strip(),
            language=language,
            confidence=confidence,
            duration=duration,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        print(f"❌ Помилка STT: {e}")
        if os.path.exists(audio_path):
            os.unlink(audio_path)
        raise HTTPException(status_code=500, detail=f"Помилка STT: {str(e)}")

# ============================================
# Audio File Serving
# ============================================

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Отримати згенероване аудіо"""
    file_path = f"static/audio/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Аудіо не знайдено")
    return FileResponse(file_path, media_type="audio/wav")

# ============================================
# Quick Test Endpoints
# ============================================

@app.get("/test/tts")
async def test_tts():
    """Швидкий тест TTS"""
    test_text = "Привіт! Я голосовий асистент Нексус. Тестування системи озвучування."

    request = TTSRequest(text=test_text, language="uk")
    return await text_to_speech(request)

@app.get("/test/models")
async def test_models():
    """Перевірка доступних моделей"""
    models_info = {
        "tts": {
            "available": TTS_AVAILABLE,
            "loaded": tts_model is not None,
            "model": "xtts_v2" if tts_model else None,
            "languages": ["uk", "en"] if tts_model else []
        },
        "stt": {
            "available": WHISPER_AVAILABLE or FASTER_WHISPER_AVAILABLE,
            "loaded": whisper_model is not None or faster_whisper_model is not None,
            "model": "faster-whisper" if faster_whisper_model else "whisper" if whisper_model else None,
            "languages": ["uk", "en", "auto"]
        }
    }
    return models_info

# ============================================
# Main
# ============================================

if __name__ == "__main__":
    print("🚀 Запуск PREDATOR12 Voice API Server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
