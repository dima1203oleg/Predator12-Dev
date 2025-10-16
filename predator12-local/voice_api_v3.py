#!/usr/bin/env python3
"""
🎤 PREDATOR12 NEXUS - Advanced Voice API Server V3
Триступенева система надійності: API → Local → Browser Fallback
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn
import os
import io
import tempfile
import json
import httpx
from datetime import datetime
from typing import Optional, List, Dict, Any
import asyncio
import traceback

# ============================================
# Імпорти для локальних моделей
# ============================================

# Локальні TTS
try:
    from piper import PiperVoice
    PIPER_AVAILABLE = True
except ImportError:
    PIPER_AVAILABLE = False
    print("⚠️  Piper TTS не встановлено")

try:
    from TTS.api import TTS
    COQUI_TTS_AVAILABLE = True
except ImportError:
    COQUI_TTS_AVAILABLE = False
    print("⚠️  Coqui TTS не встановлено")

# Локальні STT
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
    from vosk import Model, KaldiRecognizer
    VOSK_AVAILABLE = True
except ImportError:
    VOSK_AVAILABLE = False
    print("⚠️  Vosk не встановлено")

import soundfile as sf
import numpy as np

# ============================================
# FastAPI Application
# ============================================

app = FastAPI(
    title="🎤 PREDATOR12 Voice API V3",
    description="Триступенева система голосових технологій: API → Local → Browser",
    version="5.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Конфігурація API ключів
# ============================================

API_CONFIG = {
    "google_tts": {
        "enabled": os.getenv("GOOGLE_TTS_ENABLED", "false").lower() == "true",
        "api_key": os.getenv("GOOGLE_TTS_API_KEY", ""),
        "endpoint": "https://texttospeech.googleapis.com/v1/text:synthesize"
    },
    "coqui_cloud_tts": {
        "enabled": os.getenv("COQUI_CLOUD_ENABLED", "false").lower() == "true",
        "api_key": os.getenv("COQUI_API_KEY", ""),
        "endpoint": "https://app.coqui.ai/api/v2/samples"
    },
    "whisper_api": {
        "enabled": os.getenv("WHISPER_API_ENABLED", "false").lower() == "true",
        "api_key": os.getenv("OPENAI_API_KEY", ""),
        "endpoint": "https://api.openai.com/v1/audio/transcriptions"
    },
    "google_stt": {
        "enabled": os.getenv("GOOGLE_STT_ENABLED", "false").lower() == "true",
        "api_key": os.getenv("GOOGLE_STT_API_KEY", ""),
        "endpoint": "https://speech.googleapis.com/v1/speech:recognize"
    }
}

# ============================================
# Глобальні моделі (локальні fallback)
# ============================================

local_models = {
    "tts": {
        "piper": None,
        "coqui": None
    },
    "stt": {
        "whisper": None,
        "faster_whisper": None,
        "vosk": None
    }
}

# Статистика використання
usage_stats = {
    "tts": {
        "api_calls": 0,
        "api_failures": 0,
        "local_calls": 0,
        "browser_fallbacks": 0
    },
    "stt": {
        "api_calls": 0,
        "api_failures": 0,
        "local_calls": 0,
        "browser_fallbacks": 0
    }
}

# ============================================
# Pydantic Models
# ============================================

class TTSRequest(BaseModel):
    text: str
    language: str = "uk"
    speed: float = 1.0
    voice: Optional[str] = None
    prefer_api: bool = True  # Пріоритет API
    quality: str = "high"  # low, medium, high

class STTRequest(BaseModel):
    language: str = "uk"
    prefer_api: bool = True
    model: Optional[str] = None  # auto, whisper, vosk

class VoiceResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    source: str  # "api", "local", "browser"
    fallback_used: bool
    error: Optional[str] = None
    processing_time: float
    timestamp: str

class HealthStatus(BaseModel):
    status: str
    api_services: Dict[str, bool]
    local_models: Dict[str, bool]
    usage_stats: Dict[str, Any]

# ============================================
# TTS API Functions (Level 1)
# ============================================

async def google_tts_api(text: str, language: str, voice: Optional[str] = None) -> Optional[bytes]:
    """Google Cloud Text-to-Speech API"""
    if not API_CONFIG["google_tts"]["enabled"]:
        return None

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "input": {"text": text},
                "voice": {
                    "languageCode": "uk-UA" if language == "uk" else "en-US",
                    "name": voice or ("uk-UA-Standard-A" if language == "uk" else "en-US-Standard-A")
                },
                "audioConfig": {
                    "audioEncoding": "MP3",
                    "speakingRate": 1.0
                }
            }

            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_CONFIG["google_tts"]["api_key"]
            }

            response = await client.post(
                API_CONFIG["google_tts"]["endpoint"],
                json=payload,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()
                import base64
                return base64.b64decode(result["audioContent"])

            return None
    except Exception as e:
        print(f"❌ Google TTS API Error: {e}")
        return None

async def coqui_cloud_tts_api(text: str, language: str) -> Optional[bytes]:
    """Coqui Cloud TTS API"""
    if not API_CONFIG["coqui_cloud_tts"]["enabled"]:
        return None

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "text": text,
                "language": language,
                "speed": 1.0
            }

            headers = {
                "Authorization": f"Bearer {API_CONFIG['coqui_cloud_tts']['api_key']}",
                "Content-Type": "application/json"
            }

            response = await client.post(
                API_CONFIG["coqui_cloud_tts"]["endpoint"],
                json=payload,
                headers=headers
            )

            if response.status_code == 200:
                return response.content

            return None
    except Exception as e:
        print(f"❌ Coqui Cloud API Error: {e}")
        return None

# ============================================
# TTS Local Functions (Level 2)
# ============================================

async def piper_tts_local(text: str, language: str) -> Optional[bytes]:
    """Piper TTS Local (найшвидший)"""
    if not PIPER_AVAILABLE or local_models["tts"]["piper"] is None:
        return None

    try:
        voice = local_models["tts"]["piper"]
        audio_data = voice.synthesize(text)

        # Конвертувати в bytes
        import io
        output = io.BytesIO()
        sf.write(output, audio_data[0], voice.config.sample_rate, format='WAV')
        return output.getvalue()
    except Exception as e:
        print(f"❌ Piper TTS Error: {e}")
        return None

async def coqui_tts_local(text: str, language: str) -> Optional[bytes]:
    """Coqui TTS Local (висока якість)"""
    if not COQUI_TTS_AVAILABLE or local_models["tts"]["coqui"] is None:
        return None

    try:
        tts = local_models["tts"]["coqui"]

        # Генерувати аудіо
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tts.tts_to_file(
                text=text,
                file_path=tmp.name,
                language=language,
                speed=1.0
            )

            with open(tmp.name, 'rb') as f:
                audio_data = f.read()

            os.unlink(tmp.name)
            return audio_data
    except Exception as e:
        print(f"❌ Coqui TTS Local Error: {e}")
        return None

# ============================================
# STT API Functions (Level 1)
# ============================================

async def whisper_api_stt(audio_file: bytes, language: str) -> Optional[str]:
    """OpenAI Whisper API"""
    if not API_CONFIG["whisper_api"]["enabled"]:
        return None

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {"file": ("audio.wav", audio_file, "audio/wav")}
            data = {
                "model": "whisper-1",
                "language": "uk" if language == "uk" else "en"
            }
            headers = {
                "Authorization": f"Bearer {API_CONFIG['whisper_api']['api_key']}"
            }

            response = await client.post(
                API_CONFIG["whisper_api"]["endpoint"],
                files=files,
                data=data,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()
                return result.get("text", "")

            return None
    except Exception as e:
        print(f"❌ Whisper API Error: {e}")
        return None

async def google_stt_api(audio_file: bytes, language: str) -> Optional[str]:
    """Google Cloud Speech-to-Text API"""
    if not API_CONFIG["google_stt"]["enabled"]:
        return None

    try:
        import base64

        async with httpx.AsyncClient(timeout=60.0) as client:
            audio_content = base64.b64encode(audio_file).decode('utf-8')

            payload = {
                "config": {
                    "encoding": "LINEAR16",
                    "sampleRateHertz": 16000,
                    "languageCode": "uk-UA" if language == "uk" else "en-US"
                },
                "audio": {
                    "content": audio_content
                }
            }

            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_CONFIG["google_stt"]["api_key"]
            }

            response = await client.post(
                API_CONFIG["google_stt"]["endpoint"],
                json=payload,
                headers=headers
            )

            if response.status_code == 200:
                result = response.json()
                if "results" in result and len(result["results"]) > 0:
                    return result["results"][0]["alternatives"][0]["transcript"]

            return None
    except Exception as e:
        print(f"❌ Google STT API Error: {e}")
        return None

# ============================================
# STT Local Functions (Level 2)
# ============================================

async def whisper_local_stt(audio_file: bytes, language: str) -> Optional[str]:
    """Whisper Local STT"""
    if not WHISPER_AVAILABLE or local_models["stt"]["whisper"] is None:
        return None

    try:
        model = local_models["stt"]["whisper"]

        # Зберегти аудіо тимчасово
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_file)
            tmp_path = tmp.name

        # Розпізнати
        result = model.transcribe(tmp_path, language=language, fp16=False)

        os.unlink(tmp_path)
        return result["text"]
    except Exception as e:
        print(f"❌ Whisper Local Error: {e}")
        return None

async def faster_whisper_local_stt(audio_file: bytes, language: str) -> Optional[str]:
    """faster-whisper Local STT"""
    if not FASTER_WHISPER_AVAILABLE or local_models["stt"]["faster_whisper"] is None:
        return None

    try:
        model = local_models["stt"]["faster_whisper"]

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_file)
            tmp_path = tmp.name

        segments, info = model.transcribe(tmp_path, language=language)
        text = " ".join([segment.text for segment in segments])

        os.unlink(tmp_path)
        return text
    except Exception as e:
        print(f"❌ faster-whisper Error: {e}")
        return None

async def vosk_local_stt(audio_file: bytes, language: str) -> Optional[str]:
    """Vosk Local STT (легкий fallback)"""
    if not VOSK_AVAILABLE or local_models["stt"]["vosk"] is None:
        return None

    try:
        model = local_models["stt"]["vosk"]

        # Конвертувати аудіо
        import wave
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(audio_file)
            tmp_path = tmp.name

        wf = wave.open(tmp_path, "rb")
        rec = KaldiRecognizer(model, wf.getframerate())

        result_text = ""
        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                result = json.loads(rec.Result())
                result_text += result.get("text", "") + " "

        final_result = json.loads(rec.FinalResult())
        result_text += final_result.get("text", "")

        wf.close()
        os.unlink(tmp_path)

        return result_text.strip()
    except Exception as e:
        print(f"❌ Vosk Error: {e}")
        return None

# ============================================
# Main TTS Endpoint (3-Level Fallback)
# ============================================

@app.post("/api/v3/tts", response_model=VoiceResponse)
async def synthesize_speech_v3(request: TTSRequest):
    """
    Триступенева TTS система:
    1. API (Google/Coqui Cloud)
    2. Local (Piper/Coqui)
    3. Browser (Web Speech API - клієнт)
    """
    start_time = datetime.now()

    audio_data = None
    source = "unknown"
    fallback_used = False
    error_msg = None

    try:
        # ====== LEVEL 1: API (якщо увімкнено) ======
        if request.prefer_api:
            print("🌐 Спроба 1: Google TTS API...")
            audio_data = await google_tts_api(request.text, request.language, request.voice)
            if audio_data:
                source = "google_tts_api"
                usage_stats["tts"]["api_calls"] += 1

            if not audio_data:
                print("🌐 Спроба 2: Coqui Cloud API...")
                audio_data = await coqui_cloud_tts_api(request.text, request.language)
                if audio_data:
                    source = "coqui_cloud_api"
                    usage_stats["tts"]["api_calls"] += 1

        # ====== LEVEL 2: LOCAL (fallback) ======
        if not audio_data:
            if request.prefer_api:
                print("⚠️  API недоступне, перехід на локальні моделі...")
                usage_stats["tts"]["api_failures"] += 1
                fallback_used = True

            print("💻 Спроба 3: Piper TTS (локальний)...")
            audio_data = await piper_tts_local(request.text, request.language)
            if audio_data:
                source = "piper_local"
                usage_stats["tts"]["local_calls"] += 1

            if not audio_data:
                print("💻 Спроба 4: Coqui TTS (локальний)...")
                audio_data = await coqui_tts_local(request.text, request.language)
                if audio_data:
                    source = "coqui_local"
                    usage_stats["tts"]["local_calls"] += 1

        # ====== LEVEL 3: BROWSER (клієнтський fallback) ======
        if not audio_data:
            print("⚠️  Локальні моделі недоступні, використайте Web Speech API на клієнті")
            usage_stats["tts"]["browser_fallbacks"] += 1
            return VoiceResponse(
                success=False,
                source="browser_fallback_required",
                fallback_used=True,
                error="API і локальні моделі недоступні. Використовуйте Web Speech API.",
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now().isoformat()
            )

        # Зберегти аудіо
        output_dir = "audio_output"
        os.makedirs(output_dir, exist_ok=True)

        filename = f"tts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        filepath = os.path.join(output_dir, filename)

        with open(filepath, 'wb') as f:
            f.write(audio_data)

        processing_time = (datetime.now() - start_time).total_seconds()

        return VoiceResponse(
            success=True,
            data={
                "audio_url": f"/audio/{filename}",
                "text": request.text,
                "language": request.language,
                "duration": 0.0  # TODO: розрахувати
            },
            source=source,
            fallback_used=fallback_used,
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        error_msg = str(e)
        print(f"❌ TTS Error: {error_msg}")
        traceback.print_exc()

        return VoiceResponse(
            success=False,
            source="error",
            fallback_used=True,
            error=error_msg,
            processing_time=(datetime.now() - start_time).total_seconds(),
            timestamp=datetime.now().isoformat()
        )

# ============================================
# Main STT Endpoint (3-Level Fallback)
# ============================================

@app.post("/api/v3/stt", response_model=VoiceResponse)
async def recognize_speech_v3(file: UploadFile = File(...), language: str = "uk", prefer_api: bool = True):
    """
    Триступенева STT система:
    1. API (Whisper/Google)
    2. Local (Whisper/faster-whisper/Vosk)
    3. Browser (Web Speech API - клієнт)
    """
    start_time = datetime.now()

    audio_file = await file.read()
    text = None
    source = "unknown"
    fallback_used = False
    error_msg = None

    try:
        # ====== LEVEL 1: API ======
        if prefer_api:
            print("🌐 Спроба 1: Whisper API...")
            text = await whisper_api_stt(audio_file, language)
            if text:
                source = "whisper_api"
                usage_stats["stt"]["api_calls"] += 1

            if not text:
                print("🌐 Спроба 2: Google STT API...")
                text = await google_stt_api(audio_file, language)
                if text:
                    source = "google_stt_api"
                    usage_stats["stt"]["api_calls"] += 1

        # ====== LEVEL 2: LOCAL ======
        if not text:
            if prefer_api:
                print("⚠️  API недоступне, перехід на локальні моделі...")
                usage_stats["stt"]["api_failures"] += 1
                fallback_used = True

            print("💻 Спроба 3: Whisper Turbo (локальний)...")
            text = await whisper_local_stt(audio_file, language)
            if text:
                source = "whisper_local"
                usage_stats["stt"]["local_calls"] += 1

            if not text:
                print("💻 Спроба 4: faster-whisper (локальний)...")
                text = await faster_whisper_local_stt(audio_file, language)
                if text:
                    source = "faster_whisper_local"
                    usage_stats["stt"]["local_calls"] += 1

            if not text:
                print("💻 Спроба 5: Vosk (легкий локальний)...")
                text = await vosk_local_stt(audio_file, language)
                if text:
                    source = "vosk_local"
                    usage_stats["stt"]["local_calls"] += 1

        # ====== LEVEL 3: BROWSER ======
        if not text:
            print("⚠️  Всі методи недоступні, використайте Web Speech API на клієнті")
            usage_stats["stt"]["browser_fallbacks"] += 1
            return VoiceResponse(
                success=False,
                source="browser_fallback_required",
                fallback_used=True,
                error="API і локальні моделі недоступні. Використовуйте Web Speech API.",
                processing_time=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now().isoformat()
            )

        processing_time = (datetime.now() - start_time).total_seconds()

        return VoiceResponse(
            success=True,
            data={
                "text": text,
                "language": language,
                "confidence": 0.95,
                "duration": processing_time
            },
            source=source,
            fallback_used=fallback_used,
            processing_time=processing_time,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        error_msg = str(e)
        print(f"❌ STT Error: {error_msg}")
        traceback.print_exc()

        return VoiceResponse(
            success=False,
            source="error",
            fallback_used=True,
            error=error_msg,
            processing_time=(datetime.now() - start_time).total_seconds(),
            timestamp=datetime.now().isoformat()
        )

# ============================================
# Health Check
# ============================================

@app.get("/api/v3/health", response_model=HealthStatus)
async def health_check():
    """Перевірка доступності всіх сервісів"""

    api_status = {}
    local_status = {}

    # Перевірка API
    for service, config in API_CONFIG.items():
        api_status[service] = config["enabled"] and bool(config["api_key"])

    # Перевірка локальних моделей
    local_status["piper_tts"] = PIPER_AVAILABLE and local_models["tts"]["piper"] is not None
    local_status["coqui_tts"] = COQUI_TTS_AVAILABLE and local_models["tts"]["coqui"] is not None
    local_status["whisper"] = WHISPER_AVAILABLE and local_models["stt"]["whisper"] is not None
    local_status["faster_whisper"] = FASTER_WHISPER_AVAILABLE and local_models["stt"]["faster_whisper"] is not None
    local_status["vosk"] = VOSK_AVAILABLE and local_models["stt"]["vosk"] is not None

    return HealthStatus(
        status="healthy",
        api_services=api_status,
        local_models=local_status,
        usage_stats=usage_stats
    )

# ============================================
# Serve Audio Files
# ============================================

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    """Віддати згенероване аудіо"""
    filepath = os.path.join("audio_output", filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="audio/wav")
    raise HTTPException(status_code=404, detail="Audio file not found")

# ============================================
# Startup: Initialize Models
# ============================================

@app.on_event("startup")
async def startup_event():
    """Ініціалізація локальних моделей при старті"""
    print("\n🚀 Ініціалізація Voice API V3...")
    print("="*60)

    # TTS Models
    if PIPER_AVAILABLE:
        try:
            print("⚙️  Завантаження Piper TTS...")
            model_path = "models/piper/uk_UA-ukrainian-medium.onnx"
            if os.path.exists(model_path):
                from piper import PiperVoice
                local_models["tts"]["piper"] = PiperVoice.load(model_path)
                print("✅ Piper TTS завантажено")
            else:
                print("⚠️  Модель Piper не знайдена")
        except Exception as e:
            print(f"❌ Помилка Piper: {e}")

    if COQUI_TTS_AVAILABLE:
        try:
            print("⚙️  Завантаження Coqui TTS...")
            local_models["tts"]["coqui"] = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
            print("✅ Coqui TTS завантажено")
        except Exception as e:
            print(f"❌ Помилка Coqui TTS: {e}")

    # STT Models
    if WHISPER_AVAILABLE:
        try:
            print("⚙️  Завантаження Whisper Turbo...")
            local_models["stt"]["whisper"] = whisper.load_model("turbo")
            print("✅ Whisper Turbo завантажено")
        except Exception as e:
            print(f"❌ Помилка Whisper: {e}")

    if FASTER_WHISPER_AVAILABLE:
        try:
            print("⚙️  Завантаження faster-whisper...")
            local_models["stt"]["faster_whisper"] = WhisperModel("base", device="cpu", compute_type="int8")
            print("✅ faster-whisper завантажено")
        except Exception as e:
            print(f"❌ Помилка faster-whisper: {e}")

    if VOSK_AVAILABLE:
        try:
            print("⚙️  Завантаження Vosk...")
            model_path = "models/vosk/vosk-model-uk-v3"
            if os.path.exists(model_path):
                local_models["stt"]["vosk"] = Model(model_path)
                print("✅ Vosk завантажено")
            else:
                print("⚠️  Модель Vosk не знайдена")
        except Exception as e:
            print(f"❌ Помилка Vosk: {e}")

    print("="*60)
    print("✅ Voice API V3 готовий!")
    print(f"📊 API сервіси: {sum(1 for c in API_CONFIG.values() if c['enabled'])}/4")
    print(f"💻 Локальні моделі: TTS={sum(1 for m in local_models['tts'].values() if m)}/2, STT={sum(1 for m in local_models['stt'].values() if m)}/3")
    print(f"🌐 Документація: http://localhost:8000/docs")
    print("="*60 + "\n")

# ============================================
# Run Server
# ============================================

if __name__ == "__main__":
    uvicorn.run(
        "voice_api_v3:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
