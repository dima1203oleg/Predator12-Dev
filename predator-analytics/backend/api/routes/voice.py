"""
Voice API Routes - Ukrainian TTS/STT
"""

import base64
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from services.voice_service import VoiceService

router = APIRouter()
voice_service = VoiceService()


class TextToSpeechRequest(BaseModel):
    """TTS request model"""

    text: str
    language: str = "uk-UA"
    voice_name: Optional[str] = None
    speed: float = 1.0


class SpeechToTextRequest(BaseModel):
    """STT request model"""

    audio_data: str  # Base64 encoded audio
    language: str = "uk-UA"


@router.post("/voice/tts")
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech (Ukrainian)

    Supports:
    - Google Cloud Text-to-Speech (uk-UA voices)
    - Azure Speech Services (uk-UA)
    """
    try:
        result = await voice_service.text_to_speech(
            text=request.text,
            language=request.language,
            voice_name=request.voice_name,
            speed=request.speed,
        )

        return {
            "success": True,
            "audio_data": result["audio_data"],  # Base64 encoded
            "format": result["format"],
            "duration_seconds": result.get("duration"),
            "voice_used": result.get("voice_name"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice/stt")
async def speech_to_text(request: SpeechToTextRequest):
    """
    Convert speech to text (Ukrainian)

    Supports:
    - Google Cloud Speech-to-Text (uk-UA)
    - Azure Speech Services (uk-UA)
    """
    try:
        result = await voice_service.speech_to_text(
            audio_data=request.audio_data, language=request.language
        )

        return {
            "success": True,
            "text": result["text"],
            "confidence": result.get("confidence"),
            "language_detected": result.get("language"),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice/stt/file")
async def speech_to_text_file(file: UploadFile = File(...), language: str = "uk-UA"):
    """
    Convert audio file to text (Ukrainian)
    """
    try:
        # Read audio file
        audio_bytes = await file.read()
        audio_data = base64.b64encode(audio_bytes).decode("utf-8")

        result = await voice_service.speech_to_text(audio_data=audio_data, language=language)

        return {
            "success": True,
            "text": result["text"],
            "confidence": result.get("confidence"),
            "filename": file.filename,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voice/voices")
async def list_available_voices():
    """
    List available Ukrainian voices
    """
    voices = voice_service.get_available_voices("uk-UA")

    return {"language": "uk-UA", "voices": voices, "total": len(voices)}


@router.get("/voice/health")
async def voice_service_health():
    """
    Check voice service health
    """
    health = await voice_service.health_check()

    return {
        "status": "healthy" if health["google_cloud"] or health["azure"] else "degraded",
        "providers": health,
    }
