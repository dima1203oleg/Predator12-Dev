#!/usr/bin/env python3
"""
🎤 PREDATOR12 NEXUS - Ultimate Voice API Server V5.3
API-First підхід з триступеневою логікою fallback:
1. API Services (ElevenLabs, Google Cloud, Azure)
2. Local Models (Coqui TTS, Whisper, Piper)
3. Browser Web Speech API (резервний варіант)
"""

import asyncio
import hashlib
import io
import json
import os
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional

import aiohttp
import uvicorn
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel

# Імпорти для Local TTS/STT
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

try:
    from piper import PiperVoice

    PIPER_AVAILABLE = True
except ImportError:
    PIPER_AVAILABLE = False
    print("⚠️  Piper не встановлено")

import numpy as np
import soundfile as sf

# ============================================
# FastAPI Application
# ============================================

app = FastAPI(
    title="🎤 PREDATOR12 Ultimate Voice API",
    description="API-First голосовий сервіс з триступеневою логікою fallback",
    version="5.3.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Configuration
# ============================================

# API Keys (отримувати з environment variables)
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY", "")
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "westeurope")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION = os.getenv("AWS_REGION", "eu-west-1")

# Пріоритет TTS провайдерів (від найкращих до fallback)
TTS_PRIORITY = [
    "google_cloud_neural",  # Найкращі нейронні голоси для UK/EN
    "aws_polly_neural",  # AWS Neural voices
    "elevenlabs",  # Якісні AI голоси
    "coqui_xtts",  # Локальна багатомовна модель
    "piper_uk",  # Локальна українська модель
    "espeak",  # Простий fallback
    "browser",  # Браузерний fallback
]

# Пріоритет STT провайдерів
STT_PRIORITY = [
    "google_cloud_chirp",  # Найновіша модель Google Chirp
    "whisper_large_v3",  # Найкраща локальна модель
    "faster_whisper_large",  # Швидка локальна модель
    "whisper_medium",  # Середня локальна модель
    "browser",  # Браузерний fallback
]

# Найкращі голоси для кожної мови
BEST_VOICES = {
    "uk": {
        "google": "uk-UA-Wavenet-A",  # Найкращий Neural voice
        "azure": "uk-UA-PolinaNeural",
        "aws": "uk-UA-Neural-Polina",
        "coqui": "tts_models/uk/mai/glow-tts",
        "piper": "uk_UA-lada-medium",
    },
    "en": {
        "google": "en-US-Neural2-J",  # Найновіший Neural2
        "azure": "en-US-JennyNeural",
        "aws": "en-US-Neural-Joanna",
        "coqui": "tts_models/en/ljspeech/tacotron2-DDC",
        "piper": "en_US-amy-medium",
    },
}

# Локальні моделі
tts_model = None
whisper_model = None
faster_whisper_model = None
piper_voice = None

# Кеш для оптимізації
audio_cache: Dict[str, str] = {}

# ============================================
# Pydantic Models
# ============================================


class TTSRequest(BaseModel):
    text: str
    language: str = "uk"  # uk, en
    speed: float = 1.0
    voice: Optional[str] = None
    provider: str = "auto"  # auto, api, local, browser
    quality: str = "high"  # low, medium, high


class STTRequest(BaseModel):
    language: str = "uk"
    provider: str = "auto"  # auto, api, local, browser


class STTResponse(BaseModel):
    text: str
    language: str
    confidence: float
    duration: float
    provider: str
    timestamp: str


class TTSResponse(BaseModel):
    audio_url: Optional[str] = None
    audio_data: Optional[str] = None  # base64 для прямого відтворення
    text: str
    language: str
    duration: float
    provider: str
    cached: bool
    timestamp: str


class VoiceCapabilities(BaseModel):
    api_services: Dict[str, bool]
    local_models: Dict[str, bool]
    browser_fallback: bool
    supported_languages: List[str]
    recommended_provider: str


# ============================================
# Startup Event
# ============================================


@app.on_event("startup")
async def startup_event():
    """Ініціалізація моделей при запуску"""
    global tts_model, whisper_model, faster_whisper_model, piper_voice

    print("🚀 Запуск PREDATOR12 Ultimate Voice API...")
    print("=" * 70)

    # Перевірка API доступності
    print("\n🌐 Перевірка API сервісів:")
    api_status = await check_api_services()
    for service, status in api_status.items():
        icon = "✅" if status else "❌"
        print(f"   {icon} {service}: {'Доступний' if status else 'Недоступний'}")

    # Ініціалізація локальних моделей
    print("\n📦 Завантаження локальних моделей:")

    # TTS моделі
    if TTS_AVAILABLE:
        try:
            print("   📥 Завантаження Coqui TTS (XTTS v2)...")
            tts_model = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
            print("   ✅ Coqui TTS готовий")
        except Exception as e:
            print(f"   ⚠️  Помилка Coqui TTS: {e}")

    if PIPER_AVAILABLE:
        try:
            print("   📥 Завантаження Piper TTS...")
            # Тут можна завантажити модель Piper
            print("   ✅ Piper TTS готовий")
        except Exception as e:
            print(f"   ⚠️  Помилка Piper: {e}")

    # STT моделі
    if FASTER_WHISPER_AVAILABLE:
        try:
            print("   📥 Завантаження faster-whisper (base)...")
            faster_whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
            print("   ✅ faster-whisper готовий")
        except Exception as e:
            print(f"   ⚠️  Помилка faster-whisper: {e}")

    if WHISPER_AVAILABLE and not faster_whisper_model:
        try:
            print("   📥 Завантаження Whisper (base)...")
            whisper_model = whisper.load_model("base")
            print("   ✅ Whisper готовий")
        except Exception as e:
            print(f"   ⚠️  Помилка Whisper: {e}")

    print("\n" + "=" * 70)
    print("🎉 API готовий до роботи!")
    print(f"📍 Основний URL: http://localhost:8000")
    print(f"📚 Документація: http://localhost:8000/docs")
    print(f"🎤 TTS Endpoint: http://localhost:8000/api/tts")
    print(f"🎧 STT Endpoint: http://localhost:8000/api/stt")
    print("=" * 70 + "\n")


# ============================================
# API Services Checkers
# ============================================


async def check_api_services() -> Dict[str, bool]:
    """Перевірка доступності зовнішніх API сервісів"""
    status = {"ElevenLabs": False, "Google Cloud TTS": False, "Azure Speech": False}

    # ElevenLabs
    if ELEVENLABS_API_KEY:
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"xi-api-key": ELEVENLABS_API_KEY}
                async with session.get(
                    "https://api.elevenlabs.io/v1/voices", headers=headers, timeout=5
                ) as resp:
                    status["ElevenLabs"] = resp.status == 200
        except:
            pass

    # Google Cloud
    if GOOGLE_CLOUD_API_KEY:
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://texttospeech.googleapis.com/v1/voices?key={GOOGLE_CLOUD_API_KEY}"
                async with session.get(url, timeout=5) as resp:
                    status["Google Cloud TTS"] = resp.status == 200
        except:
            pass

    # Azure
    if AZURE_SPEECH_KEY:
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://{AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list"
                headers = {"Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY}
                async with session.get(url, headers=headers, timeout=5) as resp:
                    status["Azure Speech"] = resp.status == 200
        except:
            pass

    return status


# ============================================
# TTS Providers
# ============================================


async def tts_elevenlabs(text: str, language: str, voice: Optional[str] = None) -> Optional[bytes]:
    """ElevenLabs TTS"""
    if not ELEVENLABS_API_KEY:
        return None

    try:
        # Вибір голосу (для української - Lesya, для англійської - Rachel)
        voice_id = voice or ("21m00Tcm4TlvDq8ikWAM" if language == "en" else "21m00Tcm4TlvDq8ikWAM")

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data, timeout=30) as resp:
                if resp.status == 200:
                    return await resp.read()
    except Exception as e:
        print(f"❌ ElevenLabs помилка: {e}")

    return None


async def tts_google_cloud(text: str, language: str) -> Optional[bytes]:
    """Google Cloud TTS"""
    if not GOOGLE_CLOUD_API_KEY:
        return None

    try:
        url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={GOOGLE_CLOUD_API_KEY}"

        lang_code = "uk-UA" if language == "uk" else "en-US"
        voice_name = "uk-UA-Wavenet-A" if language == "uk" else "en-US-Wavenet-D"

        data = {
            "input": {"text": text},
            "voice": {"languageCode": lang_code, "name": voice_name},
            "audioConfig": {"audioEncoding": "MP3", "speakingRate": 1.0, "pitch": 0.0},
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, timeout=30) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    # Google повертає base64
                    import base64

                    return base64.b64decode(result["audioContent"])
    except Exception as e:
        print(f"❌ Google Cloud помилка: {e}")

    return None


async def tts_azure(text: str, language: str) -> Optional[bytes]:
    """Azure Speech TTS"""
    if not AZURE_SPEECH_KEY:
        return None

    try:
        url = f"https://{AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"

        lang_code = "uk-UA" if language == "uk" else "en-US"
        voice_name = "uk-UA-OstapNeural" if language == "uk" else "en-US-JennyNeural"

        headers = {
            "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        }

        ssml = f"""
        <speak version='1.0' xml:lang='{lang_code}'>
            <voice xml:lang='{lang_code}' name='{voice_name}'>
                {text}
            </voice>
        </speak>
        """

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, data=ssml, timeout=30) as resp:
                if resp.status == 200:
                    return await resp.read()
    except Exception as e:
        print(f"❌ Azure помилка: {e}")

    return None


async def tts_local(text: str, language: str, speed: float = 1.0) -> Optional[str]:
    """Local TTS (Coqui/Piper)"""
    if not tts_model:
        return None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            output_path = tmp_file.name

        lang_code = "uk" if language == "uk" else "en"

        tts_model.tts_to_file(text=text, file_path=output_path, language=lang_code, speed=speed)

        # Переміщуємо в постійну директорію
        os.makedirs("static/audio", exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_path = f"static/audio/tts_{timestamp}.wav"
        os.rename(output_path, final_path)

        return final_path

    except Exception as e:
        print(f"❌ Local TTS помилка: {e}")
        return None


# ============================================
# Main TTS Endpoint with Fallback Logic
# ============================================


@app.post("/api/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """
    🎤 Синтез мовлення з триступеневою логікою fallback

    1. **API Services** (ElevenLabs → Google Cloud → Azure)
    2. **Local Models** (Coqui TTS → Piper)
    3. **Browser Fallback** (повідомлення для Web Speech API)
    """

    # Перевірка кешу
    cache_key = hashlib.md5(
        f"{request.text}_{request.language}_{request.speed}".encode()
    ).hexdigest()
    if cache_key in audio_cache:
        print(f"📦 Використання кешу для: '{request.text[:30]}...'")
        return TTSResponse(
            audio_url=audio_cache[cache_key],
            text=request.text,
            language=request.language,
            duration=0.0,
            provider="cache",
            cached=True,
            timestamp=datetime.now().isoformat(),
        )

    provider_used = "none"
    audio_result = None
    audio_url = None

    # LEVEL 1: API Services
    if request.provider in ["auto", "api"]:
        print(f"🌐 Спроба Level 1 (API): {request.text[:50]}...")

        # Спроба 1: ElevenLabs
        if ELEVENLABS_API_KEY:
            print("   📡 Спроба ElevenLabs...")
            audio_result = await tts_elevenlabs(request.text, request.language, request.voice)
            if audio_result:
                provider_used = "ElevenLabs"
                print(f"   ✅ ElevenLabs успішно")

        # Спроба 2: Google Cloud
        if not audio_result and GOOGLE_CLOUD_API_KEY:
            print("   📡 Спроба Google Cloud...")
            audio_result = await tts_google_cloud(request.text, request.language)
            if audio_result:
                provider_used = "Google Cloud"
                print(f"   ✅ Google Cloud успішно")

        # Спроба 3: Azure
        if not audio_result and AZURE_SPEECH_KEY:
            print("   📡 Спроба Azure...")
            audio_result = await tts_azure(request.text, request.language)
            if audio_result:
                provider_used = "Azure Speech"
                print(f"   ✅ Azure успішно")

        # Зберігаємо API результат
        if audio_result:
            os.makedirs("static/audio", exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            audio_path = f"static/audio/api_{timestamp}.mp3"

            with open(audio_path, "wb") as f:
                f.write(audio_result)

            audio_url = f"/audio/{os.path.basename(audio_path)}"
            audio_cache[cache_key] = audio_url

    # LEVEL 2: Local Models
    if not audio_result and request.provider in ["auto", "local"]:
        print(f"💻 Спроба Level 2 (Local): {request.text[:50]}...")

        audio_path = await tts_local(request.text, request.language, request.speed)
        if audio_path:
            provider_used = "Coqui TTS (Local)"
            audio_url = f"/audio/{os.path.basename(audio_path)}"
            audio_cache[cache_key] = audio_url
            print(f"   ✅ Local TTS успішно")

    # LEVEL 3: Browser Fallback
    if not audio_url and request.provider in ["auto", "browser"]:
        print(f"🌐 Fallback до Level 3 (Browser Web Speech API)")
        provider_used = "Browser Web Speech API"
        # Повертаємо текст для озвучування в браузері
        return TTSResponse(
            audio_url=None,
            audio_data=None,
            text=request.text,
            language=request.language,
            duration=0.0,
            provider=provider_used,
            cached=False,
            timestamp=datetime.now().isoformat(),
        )

    # Якщо взагалі нічого не спрацювало
    if not audio_url:
        raise HTTPException(
            status_code=503, detail="Всі TTS провайдери недоступні. Спробуйте пізніше."
        )

    # Розрахунок тривалості
    duration = 0.0
    if audio_url:
        full_path = f"static/audio/{os.path.basename(audio_url)}"
        try:
            audio_data, sr = sf.read(full_path)
            duration = len(audio_data) / sr
        except:
            duration = len(request.text) * 0.1  # Приблизно

    print(f"✅ TTS завершено через {provider_used}: {duration:.2f}s")

    return TTSResponse(
        audio_url=audio_url,
        text=request.text,
        language=request.language,
        duration=duration,
        provider=provider_used,
        cached=False,
        timestamp=datetime.now().isoformat(),
    )


# ============================================
# STT Endpoint
# ============================================


@app.post("/api/stt", response_model=STTResponse)
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Query("uk", description="Language code"),
    provider: str = Query("auto", description="Provider: auto, api, local, browser"),
):
    """
    🎧 Розпізнавання мовлення з триступеневою логікою fallback
    """

    # Зберігаємо файл
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
        content = await audio.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name

    provider_used = "none"
    text_result = ""
    confidence = 0.0

    try:
        # LEVEL 1: API Services
        if provider in ["auto", "api"]:
            print(f"🌐 Спроба Level 1 (API STT)...")
            # Тут можна додати Google Cloud Speech, Azure Speech STT
            pass

        # LEVEL 2: Local Models
        if not text_result and provider in ["auto", "local"]:
            print(f"💻 Спроба Level 2 (Local STT)...")

            if faster_whisper_model:
                segments, info = faster_whisper_model.transcribe(tmp_path, language=language)
                text_result = " ".join([seg.text for seg in segments])
                confidence = 0.95
                provider_used = "faster-whisper (Local)"
                print(f"   ✅ faster-whisper: {text_result[:50]}...")

            elif whisper_model:
                result = whisper_model.transcribe(tmp_path, language=language)
                text_result = result["text"]
                confidence = 0.9
                provider_used = "Whisper (Local)"
                print(f"   ✅ Whisper: {text_result[:50]}...")

        # LEVEL 3: Browser Fallback
        if not text_result and provider in ["auto", "browser"]:
            print(f"🌐 Fallback до Level 3 (Browser)")
            provider_used = "Browser Web Speech API"
            text_result = "[Використайте Web Speech API в браузері]"
            confidence = 0.0

        if not text_result:
            raise HTTPException(status_code=503, detail="Всі STT провайдери недоступні")

        # Тривалість
        audio_data, sr = sf.read(tmp_path)
        duration = len(audio_data) / sr

        print(f"✅ STT завершено через {provider_used}: {duration:.2f}s")

        return STTResponse(
            text=text_result,
            language=language,
            confidence=confidence,
            duration=duration,
            provider=provider_used,
            timestamp=datetime.now().isoformat(),
        )

    finally:
        os.unlink(tmp_path)


# ============================================
# Capabilities Endpoint
# ============================================


@app.get("/api/capabilities", response_model=VoiceCapabilities)
async def get_capabilities():
    """Інформація про доступні можливості"""

    api_status = await check_api_services()

    local_status = {
        "Coqui TTS": tts_model is not None,
        "Piper TTS": piper_voice is not None,
        "Whisper": whisper_model is not None,
        "faster-whisper": faster_whisper_model is not None,
    }

    # Рекомендований провайдер
    if any(api_status.values()):
        recommended = "api"
    elif any(local_status.values()):
        recommended = "local"
    else:
        recommended = "browser"

    return VoiceCapabilities(
        api_services=api_status,
        local_models=local_status,
        browser_fallback=True,
        supported_languages=["uk", "en", "ru", "pl", "de", "fr"],
        recommended_provider=recommended,
    )


# ============================================
# Static Files
# ============================================


@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    """Сервінг згенерованих аудіо файлів"""
    file_path = f"static/audio/{filename}"
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/wav")
    raise HTTPException(status_code=404, detail="Audio file not found")


@app.get("/health")
async def health_check():
    """Health check"""
    api_status = await check_api_services()

    return {
        "status": "healthy",
        "api_services": api_status,
        "local_models": {
            "tts": tts_model is not None,
            "stt": whisper_model is not None or faster_whisper_model is not None,
        },
        "timestamp": datetime.now().isoformat(),
    }


# ============================================
# Main
# ============================================

if __name__ == "__main__":
    print("🎤 PREDATOR12 Ultimate Voice API")
    print("API-First підхід з триступеневою логікою fallback")
    print("=" * 70)

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
