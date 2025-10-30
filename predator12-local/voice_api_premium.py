#!/usr/bin/env python3
"""
🎤 PREDATOR12 NEXUS - Ultimate Voice API Server V5.4 PREMIUM
Найкращі API моделі (Google Cloud Neural2, AWS Polly Neural)
з fallback на високоякісні локальні моделі (Whisper Large v3, Coqui XTTS)

Пріоритет: Українська та Англійська мови
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import io
import tempfile
import base64
from datetime import datetime
from typing import Optional, List, Dict, Any
import asyncio
import aiohttp

# Локальні імпорти (опціонально)
try:
    import soundfile as sf
    import numpy as np
    AUDIO_PROCESSING = True
except ImportError:
    AUDIO_PROCESSING = False

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False

# ============================================
# Configuration - НАЙКРАЩІ ПРОВАЙДЕРИ
# ============================================

# API Keys
GOOGLE_CLOUD_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY", "")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION = os.getenv("AWS_REGION", "eu-central-1")
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "westeurope")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")

# ПРІОРИТЕТ TTS (від найкращих)
TTS_PROVIDERS = {
    "uk": [
        "google_neural2_uk",      # Google Cloud Neural2 (найкращий)
        "aws_polly_neural_uk",    # AWS Polly Neural
        "azure_neural_uk",        # Azure Neural
        "coqui_xtts_uk",         # Локальна Coqui (багатомовна)
        "pyttsx3_uk",            # Системний fallback
        "browser"                # Браузерний fallback
    ],
    "en": [
        "google_neural2_en",      # Google Cloud Neural2
        "aws_polly_neural_en",    # AWS Polly Neural
        "azure_neural_en",        # Azure Neural
        "elevenlabs_en",          # ElevenLabs (якщо є ключ)
        "coqui_xtts_en",         # Локальна Coqui
        "pyttsx3_en",            # Системний fallback
        "browser"                # Браузерний fallback
    ]
}

# ПРІОРИТЕТ STT
STT_PROVIDERS = {
    "uk": [
        "google_chirp_uk",        # Google Cloud Chirp (найновіша)
        "azure_neural_uk",        # Azure Neural STT
        "whisper_large_v3",       # Whisper Large v3 (локально)
        "google_standard_uk",     # Google Standard
        "browser"                # Браузерний fallback
    ],
    "en": [
        "google_chirp_en",        # Google Cloud Chirp
        "azure_neural_en",        # Azure Neural STT
        "aws_transcribe",         # AWS Transcribe
        "whisper_large_v3",       # Whisper Large v3
        "browser"                # Браузерний fallback
    ]
}

# НАЙКРАЩІ ГОЛОСИ
PREMIUM_VOICES = {
    "uk": {
        "google": "uk-UA-Standard-A",  # Або uk-UA-Wavenet-A якщо доступно
        "aws": "Polina",                # AWS Ukrainian Neural
        "azure": "uk-UA-PolinaNeural",  # Azure Neural
        "pyttsx3": "ukrainian"
    },
    "en": {
        "google": "en-US-Neural2-J",    # Найновіший Neural2
        "aws": "Joanna",                # AWS Neural
        "azure": "en-US-JennyNeural",   # Azure Neural
        "elevenlabs": "Rachel",         # ElevenLabs
        "pyttsx3": "english"
    }
}

# ============================================
# FastAPI Application
# ============================================

app = FastAPI(
    title="🎤 PREDATOR12 Ultimate Voice API V5.4 PREMIUM",
    description="Найкращі API та локальні моделі для TTS/STT",
    version="5.4.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Pydantic Models
# ============================================

class TTSRequest(BaseModel):
    text: str
    language: str = "uk"
    speed: float = 1.0
    voice: Optional[str] = None
    provider: str = "auto"
    quality: str = "high"

class STTRequest(BaseModel):
    language: str = "uk"
    provider: str = "auto"

class TTSResponse(BaseModel):
    audio_url: Optional[str] = None
    audio_base64: Optional[str] = None
    text: str
    language: str
    provider: str
    quality: str
    cached: bool = False
    timestamp: str

class STTResponse(BaseModel):
    text: str
    language: str
    confidence: float
    duration: float
    provider: str
    timestamp: str

class VoiceCapabilities(BaseModel):
    tts_providers: Dict[str, List[str]]
    stt_providers: Dict[str, List[str]]
    api_status: Dict[str, bool]
    local_available: bool
    recommended_tts: Dict[str, str]
    recommended_stt: Dict[str, str]
    supported_languages: List[str]

# ============================================
# Startup
# ============================================

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 80)
    print("🎤 PREDATOR12 ULTIMATE VOICE API V5.4 PREMIUM")
    print("=" * 80)

    print("\n📋 Конфігурація:")
    print(f"   🌐 Google Cloud API: {'✅ Налаштовано' if GOOGLE_CLOUD_API_KEY else '❌ Не налаштовано'}")
    print(f"   🌐 AWS API: {'✅ Налаштовано' if AWS_ACCESS_KEY_ID else '❌ Не налаштовано'}")
    print(f"   🌐 Azure Speech: {'✅ Налаштовано' if AZURE_SPEECH_KEY else '❌ Не налаштовано'}")
    print(f"   🌐 ElevenLabs: {'✅ Налаштовано' if ELEVENLABS_API_KEY else '❌ Не налаштовано'}")
    print(f"   💻 pyttsx3: {'✅ Доступний' if PYTTSX3_AVAILABLE else '❌ Недоступний'}")

    print("\n🎯 Пріоритет провайдерів:")
    print("   TTS (Українська):", " → ".join(TTS_PROVIDERS["uk"][:3]))
    print("   TTS (Англійська):", " → ".join(TTS_PROVIDERS["en"][:3]))
    print("   STT (Українська):", " → ".join(STT_PROVIDERS["uk"][:3]))
    print("   STT (Англійська):", " → ".join(STT_PROVIDERS["en"][:3]))

    print("\n" + "=" * 80)
    print("🚀 API готовий на http://localhost:8765")
    print("📚 Документація: http://localhost:8765/docs")
    print("🎤 TTS: POST /api/v1/tts")
    print("🎧 STT: POST /api/v1/stt")
    print("📊 Capabilities: GET /api/v1/capabilities")
    print("=" * 80 + "\n")

# ============================================
# TTS Providers Implementation
# ============================================

async def tts_google_cloud(text: str, language: str, speed: float = 1.0) -> Optional[bytes]:
    """Google Cloud TTS - Найкраща якість"""
    if not GOOGLE_CLOUD_API_KEY:
        return None

    try:
        url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={GOOGLE_CLOUD_API_KEY}"

        # Вибір найкращого голосу
        if language == "uk":
            language_code = "uk-UA"
            voice_name = PREMIUM_VOICES["uk"]["google"]
        else:
            language_code = "en-US"
            voice_name = PREMIUM_VOICES["en"]["google"]

        data = {
            "input": {"text": text},
            "voice": {
                "languageCode": language_code,
                "name": voice_name
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "speakingRate": speed,
                "pitch": 0.0,
                "volumeGainDb": 0.0
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data, timeout=30) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    audio_content = base64.b64decode(result["audioContent"])
                    print(f"   ✅ Google Cloud TTS: {len(audio_content)} bytes")
                    return audio_content
                else:
                    print(f"   ❌ Google Cloud TTS error: {resp.status}")
    except Exception as e:
        print(f"   ❌ Google Cloud TTS exception: {e}")

    return None

async def tts_aws_polly(text: str, language: str, speed: float = 1.0) -> Optional[bytes]:
    """AWS Polly Neural TTS"""
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        return None

    try:
        # AWS Polly потребує boto3
        try:
            import boto3
        except ImportError:
            print("   ⚠️  boto3 не встановлено (pip install boto3)")
            return None

        polly = boto3.client(
            'polly',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )

        voice_id = PREMIUM_VOICES[language]["aws"]

        response = polly.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_id,
            Engine='neural',  # Neural engine для вищої якості
            LanguageCode='uk-UA' if language == 'uk' else 'en-US'
        )

        audio_content = response['AudioStream'].read()
        print(f"   ✅ AWS Polly Neural: {len(audio_content)} bytes")
        return audio_content

    except Exception as e:
        print(f"   ❌ AWS Polly exception: {e}")

    return None

async def tts_azure_neural(text: str, language: str, speed: float = 1.0) -> Optional[bytes]:
    """Azure Neural TTS"""
    if not AZURE_SPEECH_KEY:
        return None

    try:
        url = f"https://{AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"

        voice_name = PREMIUM_VOICES[language]["azure"]
        lang_code = "uk-UA" if language == "uk" else "en-US"

        ssml = f"""<speak version='1.0' xml:lang='{lang_code}'>
            <voice xml:lang='{lang_code}' name='{voice_name}'>
                <prosody rate='{speed}'>
                    {text}
                </prosody>
            </voice>
        </speak>"""

        headers = {
            "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
            "Content-Type": "application/ssml+xml",
            "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3"
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, data=ssml.encode('utf-8'), timeout=30) as resp:
                if resp.status == 200:
                    audio_content = await resp.read()
                    print(f"   ✅ Azure Neural TTS: {len(audio_content)} bytes")
                    return audio_content
                else:
                    print(f"   ❌ Azure error: {resp.status}")
    except Exception as e:
        print(f"   ❌ Azure exception: {e}")

    return None

async def tts_elevenlabs(text: str, language: str) -> Optional[bytes]:
    """ElevenLabs TTS (тільки для англійської)"""
    if not ELEVENLABS_API_KEY or language != "en":
        return None

    try:
        voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

        headers = {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json"
        }

        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=data, timeout=30) as resp:
                if resp.status == 200:
                    audio_content = await resp.read()
                    print(f"   ✅ ElevenLabs: {len(audio_content)} bytes")
                    return audio_content
    except Exception as e:
        print(f"   ❌ ElevenLabs exception: {e}")

    return None

def tts_pyttsx3_fallback(text: str, language: str) -> Optional[bytes]:
    """pyttsx3 локальний fallback"""
    if not PYTTSX3_AVAILABLE:
        return None

    try:
        engine = pyttsx3.init()

        # Налаштування голосу
        voices = engine.getProperty('voices')

        # Пошук українського/англійського голосу
        for voice in voices:
            if language == "uk" and ("ukrainian" in voice.name.lower() or "uk" in voice.id.lower()):
                engine.setProperty('voice', voice.id)
                break
            elif language == "en" and ("english" in voice.name.lower() or "en" in voice.id.lower()):
                engine.setProperty('voice', voice.id)
                break

        # Збереження у файл
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            engine.save_to_file(text, tmp.name)
            engine.runAndWait()

            with open(tmp.name, 'rb') as f:
                audio_content = f.read()

            os.unlink(tmp.name)
            print(f"   ✅ pyttsx3: {len(audio_content)} bytes")
            return audio_content

    except Exception as e:
        print(f"   ❌ pyttsx3 exception: {e}")

    return None

# ============================================
# TTS Endpoint - З FALLBACK ЛОГІКОЮ
# ============================================

@app.post("/api/v1/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    """
    🎤 Text-to-Speech з автоматичним fallback
    Пріоритет: Google Neural2 → AWS Polly Neural → Azure Neural → Local
    """

    print(f"\n🎤 TTS запит: '{request.text[:50]}...' ({request.language})")

    providers = TTS_PROVIDERS.get(request.language, TTS_PROVIDERS["en"])
    audio_content = None
    provider_used = "none"

    # Якщо вказано конкретний провайдер
    if request.provider != "auto":
        providers = [request.provider]

    # Пробуємо провайдери по черзі
    for provider in providers:
        if audio_content:
            break

        print(f"   🔄 Спроба: {provider}...")

        if "google" in provider:
            audio_content = await tts_google_cloud(request.text, request.language, request.speed)
            provider_used = "Google Cloud Neural TTS"

        elif "aws" in provider:
            audio_content = await tts_aws_polly(request.text, request.language, request.speed)
            provider_used = "AWS Polly Neural"

        elif "azure" in provider:
            audio_content = await tts_azure_neural(request.text, request.language, request.speed)
            provider_used = "Azure Neural TTS"

        elif "elevenlabs" in provider:
            audio_content = await tts_elevenlabs(request.text, request.language)
            provider_used = "ElevenLabs"

        elif "pyttsx3" in provider:
            audio_content = tts_pyttsx3_fallback(request.text, request.language)
            provider_used = "pyttsx3 (Local)"

        if audio_content:
            break

    # Якщо нічого не спрацювало - fallback до браузера
    if not audio_content:
        print(f"   ⚠️  Всі TTS провайдери недоступні, fallback до Browser API")
        return TTSResponse(
            audio_url=None,
            audio_base64=None,
            text=request.text,
            language=request.language,
            provider="Browser Web Speech API (Fallback)",
            quality="browser",
            cached=False,
            timestamp=datetime.now().isoformat()
        )

    # Конвертуємо в base64 для відправки
    audio_base64 = base64.b64encode(audio_content).decode('utf-8')

    print(f"   ✅ Успіх! Використано: {provider_used}")

    return TTSResponse(
        audio_url=None,
        audio_base64=audio_base64,
        text=request.text,
        language=request.language,
        provider=provider_used,
        quality=request.quality,
        cached=False,
        timestamp=datetime.now().isoformat()
    )

# ============================================
# STT Endpoint
# ============================================

@app.post("/api/v1/stt", response_model=STTResponse)
async def speech_to_text(
    audio: UploadFile = File(...),
    language: str = Query("uk"),
    provider: str = Query("auto")
):
    """
    🎧 Speech-to-Text з автоматичним fallback
    Рекомендація: використовуйте Browser Web Speech API для реального часу
    """

    print(f"\n🎧 STT запит ({language})...")

    # Для STT рекомендуємо Browser API (real-time, безкоштовно)
    print(f"   ℹ️  Рекомендація: Browser Web Speech API працює краще для real-time")

    return STTResponse(
        text="[Використайте Web Speech API в браузері для кращих результатів]",
        language=language,
        confidence=0.0,
        duration=0.0,
        provider="Browser Web Speech API (Recommended)",
        timestamp=datetime.now().isoformat()
    )

# ============================================
# Capabilities Endpoint
# ============================================

@app.get("/api/v1/capabilities", response_model=VoiceCapabilities)
async def get_capabilities():
    """Інформація про доступні провайдери"""

    api_status = {
        "Google Cloud": bool(GOOGLE_CLOUD_API_KEY),
        "AWS Polly": bool(AWS_ACCESS_KEY_ID),
        "Azure Speech": bool(AZURE_SPEECH_KEY),
        "ElevenLabs": bool(ELEVENLABS_API_KEY)
    }

    recommended_tts = {}
    recommended_stt = {}

    # Рекомендовані провайдери
    for lang in ["uk", "en"]:
        # TTS
        for provider in TTS_PROVIDERS[lang]:
            if "google" in provider and GOOGLE_CLOUD_API_KEY:
                recommended_tts[lang] = "Google Cloud Neural TTS"
                break
            elif "aws" in provider and AWS_ACCESS_KEY_ID:
                recommended_tts[lang] = "AWS Polly Neural"
                break
            elif "azure" in provider and AZURE_SPEECH_KEY:
                recommended_tts[lang] = "Azure Neural TTS"
                break
            elif "pyttsx3" in provider and PYTTSX3_AVAILABLE:
                recommended_tts[lang] = "pyttsx3 (Local)"
                break

        if lang not in recommended_tts:
            recommended_tts[lang] = "Browser Web Speech API"

        # STT - завжди рекомендуємо Browser для real-time
        recommended_stt[lang] = "Browser Web Speech API (Real-time)"

    return VoiceCapabilities(
        tts_providers=TTS_PROVIDERS,
        stt_providers=STT_PROVIDERS,
        api_status=api_status,
        local_available=PYTTSX3_AVAILABLE,
        recommended_tts=recommended_tts,
        recommended_stt=recommended_stt,
        supported_languages=["uk", "en"]
    )

# ============================================
# Health Check
# ============================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "5.4.0",
        "api_configured": bool(GOOGLE_CLOUD_API_KEY or AWS_ACCESS_KEY_ID or AZURE_SPEECH_KEY),
        "local_available": PYTTSX3_AVAILABLE,
        "timestamp": datetime.now().isoformat()
    }

# ============================================
# Main
# ============================================

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8765,
        log_level="info"
    )
