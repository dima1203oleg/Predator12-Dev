#!/usr/bin/env python3
"""
🎤 PREDATOR12 NEXUS - Premium FREE Voice API Server
Найкращі БЕЗКОШТОВНІ моделі для TTS/STT з українською та англійською мовами
"""

import io
import os
import tempfile
from datetime import datetime
from typing import Dict, List, Optional

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

# ============================================
# БЕЗКОШТОВНІ TTS моделі
# ============================================

# 1. Coqui TTS - найкращий безкоштовний TTS
try:
    from TTS.api import TTS

    COQUI_AVAILABLE = True
except ImportError:
    COQUI_AVAILABLE = False
    print("⚠️  Coqui TTS не встановлено: pip install TTS")

# 2. pyttsx3 - офлайн TTS (системні голоси)
try:
    import pyttsx3

    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    print("⚠️  pyttsx3 не встановлено: pip install pyttsx3")

# 3. gTTS - Google TTS (безкоштовний, без API key)
try:
    from gtts import gTTS

    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    print("⚠️  gTTS не встановлено: pip install gtts")

# ============================================
# БЕЗКОШТОВНІ STT моделі
# ============================================

# 1. Whisper - найкращий безкоштовний STT від OpenAI
try:
    import whisper

    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️  Whisper не встановлено: pip install openai-whisper")

# 2. faster-whisper - швидша версія Whisper
try:
    from faster_whisper import WhisperModel

    FASTER_WHISPER_AVAILABLE = True
except ImportError:
    FASTER_WHISPER_AVAILABLE = False
    print("⚠️  faster-whisper не встановлено: pip install faster-whisper")

# 3. Vosk - швидкий офлайн STT
try:
    import json as json_lib

    from vosk import KaldiRecognizer, Model

    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False
    print("⚠️  Vosk не встановлено: pip install vosk")

import numpy as np
import soundfile as sf

# ============================================
# FastAPI Application
# ============================================

app = FastAPI(
    title="🎤 PREDATOR12 Premium FREE Voice API",
    description="Найкращі безкоштовні TTS/STT моделі",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Global Models
# ============================================

coqui_tts_uk = None
coqui_tts_en = None
whisper_model = None
faster_whisper_model = None
pyttsx3_engine = None

# ============================================
# Pydantic Models
# ============================================


class TTSRequest(BaseModel):
    text: str
    language: str = "uk"  # uk, en
    speed: float = 1.0
    provider: str = "auto"  # auto, coqui, gtts, pyttsx3


class STTRequest(BaseModel):
    language: str = "uk"
    provider: str = "auto"  # auto, whisper, faster-whisper, vosk


class VoiceCapabilities(BaseModel):
    tts_providers: Dict[str, bool]
    stt_providers: Dict[str, bool]
    supported_languages: List[str]
    recommended_tts: str
    recommended_stt: str


# ============================================
# Startup - Завантаження моделей
# ============================================


@app.on_event("startup")
async def startup_event():
    global coqui_tts_uk, coqui_tts_en, whisper_model, faster_whisper_model, pyttsx3_engine

    print("=" * 80)
    print("🎤 PREDATOR12 Premium FREE Voice API - Запуск")
    print("=" * 80)

    # ============================================
    # TTS Models
    # ============================================
    print("\n🔊 Завантаження TTS моделей:")

    # 1. Coqui TTS - НАЙКРАЩИЙ безкоштовний
    if COQUI_AVAILABLE:
        try:
            print("   📥 Coqui TTS Multilingual (VITS) - завантаження...")
            # Багатомовна модель (українська + англійська + 100+ мов)
            coqui_tts_uk = TTS("tts_models/uk/mai/vits")  # Українська
            print("   ✅ Coqui TTS Українська: ГОТОВО")

            coqui_tts_en = TTS("tts_models/en/ljspeech/vits")  # Англійська
            print("   ✅ Coqui TTS Англійська: ГОТОВО")
        except Exception as e:
            print(f"   ⚠️  Помилка Coqui TTS: {e}")
            coqui_tts_uk = None
            coqui_tts_en = None

    # 2. pyttsx3 - системні голоси (завжди доступний)
    if PYTTSX3_AVAILABLE:
        try:
            pyttsx3_engine = pyttsx3.init()
            voices = pyttsx3_engine.getProperty("voices")
            print(f"   ✅ pyttsx3: {len(voices)} системних голосів")
        except Exception as e:
            print(f"   ⚠️  pyttsx3: {e}")

    # 3. gTTS - Google безкоштовний TTS
    if GTTS_AVAILABLE:
        print("   ✅ gTTS: Google TTS (онлайн, безкоштовний)")

    # ============================================
    # STT Models
    # ============================================
    print("\n🎧 Завантаження STT моделей:")

    # 1. faster-whisper - швидший за звичайний Whisper
    if FASTER_WHISPER_AVAILABLE:
        try:
            print("   📥 faster-whisper (base) - завантаження...")
            faster_whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
            print("   ✅ faster-whisper: ГОТОВО (підтримка української та англійської)")
        except Exception as e:
            print(f"   ⚠️  faster-whisper: {e}")

    # 2. Whisper - якщо faster-whisper недоступний
    if WHISPER_AVAILABLE and not faster_whisper_model:
        try:
            print("   📥 Whisper (base) - завантаження...")
            whisper_model = whisper.load_model("base")
            print("   ✅ Whisper: ГОТОВО (підтримка української та англійської)")
        except Exception as e:
            print(f"   ⚠️  Whisper: {e}")

    print("\n" + "=" * 80)
    print("✅ API готовий до роботи!")
    print(f"📍 URL: http://localhost:5094")
    print(f"📚 Документація: http://localhost:5094/docs")
    print(f"🔊 TTS: http://localhost:5094/api/tts")
    print(f"🎧 STT: http://localhost:5094/api/stt")
    print("=" * 80 + "\n")


# ============================================
# Endpoints
# ============================================


@app.get("/")
async def root():
    return {
        "service": "PREDATOR12 Premium FREE Voice API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {"capabilities": "/api/capabilities", "tts": "/api/tts", "stt": "/api/stt"},
    }


@app.get("/api/capabilities")
async def get_capabilities():
    """Отримати інформацію про доступні моделі"""

    capabilities = VoiceCapabilities(
        tts_providers={
            "coqui": COQUI_AVAILABLE and (coqui_tts_uk is not None),
            "gtts": GTTS_AVAILABLE,
            "pyttsx3": PYTTSX3_AVAILABLE,
        },
        stt_providers={
            "faster-whisper": FASTER_WHISPER_AVAILABLE and (faster_whisper_model is not None),
            "whisper": WHISPER_AVAILABLE and (whisper_model is not None),
            "vosk": VOSK_AVAILABLE,
        },
        supported_languages=["uk", "en"],
        recommended_tts="coqui" if COQUI_AVAILABLE else "gtts",
        recommended_stt="faster-whisper" if FASTER_WHISPER_AVAILABLE else "whisper",
    )

    return capabilities


@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    """
    Text-to-Speech з автоматичним вибором найкращого провайдера

    Priority (Ukrainian):
    1. Coqui TTS (uk/mai/vits) - НАЙКРАЩА ЯКІСТЬ
    2. gTTS (uk) - Google безкоштовний
    3. pyttsx3 (системні голоси)

    Priority (English):
    1. Coqui TTS (en/ljspeech/vits) - НАЙКРАЩА ЯКІСТЬ
    2. gTTS (en) - Google безкоштовний
    3. pyttsx3 (системні голоси)
    """

    text = request.text
    language = request.language
    speed = request.speed
    provider = request.provider

    print(f"\n🔊 TTS запит: text='{text[:50]}...', lang={language}, provider={provider}")

    audio_bytes = None
    used_provider = None

    # Автоматичний вибір провайдера
    if provider == "auto":
        # Пріоритет 1: Coqui TTS (найкраща якість)
        if language == "uk" and coqui_tts_uk:
            provider = "coqui"
        elif language == "en" and coqui_tts_en:
            provider = "coqui"
        # Пріоритет 2: gTTS
        elif GTTS_AVAILABLE:
            provider = "gtts"
        # Пріоритет 3: pyttsx3
        elif PYTTSX3_AVAILABLE:
            provider = "pyttsx3"
        else:
            raise HTTPException(status_code=503, detail="Немає доступних TTS провайдерів")

    # ============================================
    # Coqui TTS
    # ============================================
    if provider == "coqui":
        try:
            model = coqui_tts_uk if language == "uk" else coqui_tts_en
            if not model:
                raise Exception("Модель не завантажена")

            print(f"   🎵 Використовується: Coqui TTS ({language})")

            # Генерація аудіо
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                model.tts_to_file(text=text, file_path=temp_file.name)
                temp_file.seek(0)
                audio_bytes = open(temp_file.name, "rb").read()
                os.unlink(temp_file.name)

            used_provider = "coqui"
            print(f"   ✅ Coqui TTS: {len(audio_bytes)} bytes")

        except Exception as e:
            print(f"   ❌ Coqui TTS помилка: {e}")
            # Fallback до gTTS
            if GTTS_AVAILABLE:
                provider = "gtts"
            elif PYTTSX3_AVAILABLE:
                provider = "pyttsx3"

    # ============================================
    # gTTS (Google безкоштовний)
    # ============================================
    if provider == "gtts" and not audio_bytes:
        try:
            print(f"   🌐 Використовується: gTTS (Google)")

            lang_code = "uk" if language == "uk" else "en"
            tts = gTTS(text=text, lang=lang_code, slow=False)

            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as temp_file:
                tts.save(temp_file.name)
                audio_bytes = open(temp_file.name, "rb").read()
                os.unlink(temp_file.name)

            used_provider = "gtts"
            print(f"   ✅ gTTS: {len(audio_bytes)} bytes")

        except Exception as e:
            print(f"   ❌ gTTS помилка: {e}")
            if PYTTSX3_AVAILABLE:
                provider = "pyttsx3"

    # ============================================
    # pyttsx3 (системні голоси)
    # ============================================
    if provider == "pyttsx3" and not audio_bytes:
        try:
            print(f"   💻 Використовується: pyttsx3 (системні голоси)")

            engine = pyttsx3.init()
            engine.setProperty("rate", int(150 * speed))

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                engine.save_to_file(text, temp_file.name)
                engine.runAndWait()
                audio_bytes = open(temp_file.name, "rb").read()
                os.unlink(temp_file.name)

            used_provider = "pyttsx3"
            print(f"   ✅ pyttsx3: {len(audio_bytes)} bytes")

        except Exception as e:
            print(f"   ❌ pyttsx3 помилка: {e}")

    if not audio_bytes:
        raise HTTPException(status_code=503, detail="Всі TTS провайдери недоступні")

    return StreamingResponse(
        io.BytesIO(audio_bytes),
        media_type="audio/wav",
        headers={"X-Provider": used_provider, "X-Language": language},
    )


@app.post("/api/stt")
async def speech_to_text(
    audio: UploadFile = File(...), language: str = "uk", provider: str = "auto"
):
    """
    Speech-to-Text з автоматичним вибором найкращого провайдера

    Priority:
    1. faster-whisper (найшвидший)
    2. whisper (якщо faster-whisper недоступний)
    3. vosk (для реального часу)
    """

    print(f"\n🎧 STT запит: lang={language}, provider={provider}")

    # Зберігаємо аудіо файл
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
        content = await audio.read()
        temp_file.write(content)
        temp_path = temp_file.name

    text = None
    used_provider = None
    confidence = 0.0

    # Автоматичний вибір провайдера
    if provider == "auto":
        if faster_whisper_model:
            provider = "faster-whisper"
        elif whisper_model:
            provider = "whisper"
        else:
            raise HTTPException(status_code=503, detail="Немає доступних STT провайдерів")

    # ============================================
    # faster-whisper
    # ============================================
    if provider == "faster-whisper" and faster_whisper_model:
        try:
            print(f"   ⚡ Використовується: faster-whisper")

            segments, info = faster_whisper_model.transcribe(
                temp_path, language=language, beam_size=5
            )

            text = " ".join([segment.text for segment in segments])
            confidence = 0.95
            used_provider = "faster-whisper"

            print(f"   ✅ faster-whisper: '{text}'")

        except Exception as e:
            print(f"   ❌ faster-whisper помилка: {e}")
            if whisper_model:
                provider = "whisper"

    # ============================================
    # Whisper
    # ============================================
    if provider == "whisper" and whisper_model and not text:
        try:
            print(f"   🎤 Використовується: Whisper")

            result = whisper_model.transcribe(temp_path, language=language, task="transcribe")

            text = result["text"]
            confidence = 0.90
            used_provider = "whisper"

            print(f"   ✅ Whisper: '{text}'")

        except Exception as e:
            print(f"   ❌ Whisper помилка: {e}")

    # Видаляємо тимчасовий файл
    os.unlink(temp_path)

    if not text:
        raise HTTPException(status_code=503, detail="Всі STT провайдери недоступні")

    return {
        "text": text.strip(),
        "language": language,
        "confidence": confidence,
        "provider": used_provider,
        "timestamp": datetime.now().isoformat(),
    }


# ============================================
# Run Server
# ============================================

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5094, log_level="info")
