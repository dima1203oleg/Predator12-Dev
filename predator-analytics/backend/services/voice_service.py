"""
Voice Service - Ukrainian TTS/STT
Supports: Google Cloud TTS/STT, Azure Speech Services
"""

import base64
import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class VoiceService:
    """
    Voice service for Ukrainian language support
    Integrates with Google Cloud and Azure
    """

    def __init__(self):
        self.google_enabled = False
        self.azure_enabled = False

        # Try to initialize providers
        self._init_google_cloud()
        self._init_azure()

    def _init_google_cloud(self):
        """Initialize Google Cloud TTS/STT"""
        try:
            from core.config import settings
            from google.cloud import speech, texttospeech

            if settings.GOOGLE_CLOUD_TTS_API_KEY:
                self.google_tts_client = texttospeech.TextToSpeechClient()
                self.google_stt_client = speech.SpeechClient()
                self.google_enabled = True
                logger.info("✅ Google Cloud Voice services initialized")
        except Exception as e:
            logger.warning(f"Google Cloud Voice not available: {e}")

    def _init_azure(self):
        """Initialize Azure Speech Services"""
        try:
            import azure.cognitiveservices.speech as speechsdk
            from core.config import settings

            if settings.AZURE_SPEECH_KEY:
                self.azure_speech_config = speechsdk.SpeechConfig(
                    subscription=settings.AZURE_SPEECH_KEY, region=settings.AZURE_SPEECH_REGION
                )
                self.azure_enabled = True
                logger.info("✅ Azure Speech services initialized")
        except Exception as e:
            logger.warning(f"Azure Speech not available: {e}")

    async def text_to_speech(
        self,
        text: str,
        language: str = "uk-UA",
        voice_name: Optional[str] = None,
        speed: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Convert text to speech

        Ukrainian voices:
        - Google: uk-UA-Wavenet-A (female), uk-UA-Standard-A
        - Azure: uk-UA-PolinaNeural (female), uk-UA-OstapNeural (male)
        """
        # Try Google Cloud first
        if self.google_enabled:
            return await self._google_tts(text, language, voice_name, speed)

        # Fallback to Azure
        elif self.azure_enabled:
            return await self._azure_tts(text, language, voice_name, speed)

        else:
            raise Exception("No TTS provider available")

    async def _google_tts(
        self, text: str, language: str, voice_name: Optional[str], speed: float
    ) -> Dict[str, Any]:
        """Google Cloud TTS"""
        from google.cloud import texttospeech

        # Set voice
        if not voice_name:
            voice_name = "uk-UA-Wavenet-A"  # Default Ukrainian female voice

        synthesis_input = texttospeech.SynthesisInput(text=text)

        voice = texttospeech.VoiceSelectionParams(language_code=language, name=voice_name)

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=speed
        )

        response = self.google_tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        audio_data = base64.b64encode(response.audio_content).decode("utf-8")

        return {
            "audio_data": audio_data,
            "format": "mp3",
            "voice_name": voice_name,
            "provider": "google_cloud",
        }

    async def _azure_tts(
        self, text: str, language: str, voice_name: Optional[str], speed: float
    ) -> Dict[str, Any]:
        """Azure Speech TTS"""
        import azure.cognitiveservices.speech as speechsdk

        # Set voice
        if not voice_name:
            voice_name = "uk-UA-PolinaNeural"  # Default Ukrainian female voice

        self.azure_speech_config.speech_synthesis_voice_name = voice_name

        # Create synthesizer
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.azure_speech_config, audio_config=None
        )

        # Synthesize
        result = synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            audio_data = base64.b64encode(result.audio_data).decode("utf-8")
            return {
                "audio_data": audio_data,
                "format": "wav",
                "voice_name": voice_name,
                "provider": "azure",
            }
        else:
            raise Exception(f"Azure TTS failed: {result.reason}")

    async def speech_to_text(self, audio_data: str, language: str = "uk-UA") -> Dict[str, Any]:
        """
        Convert speech to text
        """
        # Try Google Cloud first
        if self.google_enabled:
            return await self._google_stt(audio_data, language)

        # Fallback to Azure
        elif self.azure_enabled:
            return await self._azure_stt(audio_data, language)

        else:
            raise Exception("No STT provider available")

    async def _google_stt(self, audio_data: str, language: str) -> Dict[str, Any]:
        """Google Cloud STT"""
        from google.cloud import speech

        # Decode audio
        audio_bytes = base64.b64decode(audio_data)

        audio = speech.RecognitionAudio(content=audio_bytes)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            language_code=language,
            enable_automatic_punctuation=True,
        )

        response = self.google_stt_client.recognize(config=config, audio=audio)

        if response.results:
            result = response.results[0]
            return {
                "text": result.alternatives[0].transcript,
                "confidence": result.alternatives[0].confidence,
                "language": language,
                "provider": "google_cloud",
            }
        else:
            return {"text": "", "confidence": 0, "provider": "google_cloud"}

    async def _azure_stt(self, audio_data: str, language: str) -> Dict[str, Any]:
        """Azure Speech STT"""
        import azure.cognitiveservices.speech as speechsdk

        # Decode audio
        audio_bytes = base64.b64decode(audio_data)

        # Create audio stream
        stream = speechsdk.audio.PushAudioInputStream()
        stream.write(audio_bytes)
        stream.close()

        audio_config = speechsdk.audio.AudioConfig(stream=stream)

        self.azure_speech_config.speech_recognition_language = language

        recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.azure_speech_config, audio_config=audio_config
        )

        result = recognizer.recognize_once()

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return {
                "text": result.text,
                "confidence": 1.0,
                "language": language,
                "provider": "azure",
            }
        else:
            return {"text": "", "confidence": 0, "provider": "azure"}

    def get_available_voices(self, language: str = "uk-UA") -> List[Dict[str, str]]:
        """Get list of available Ukrainian voices"""
        voices = []

        # Google Cloud voices
        if self.google_enabled:
            voices.extend(
                [
                    {
                        "name": "uk-UA-Wavenet-A",
                        "language": "uk-UA",
                        "gender": "female",
                        "provider": "google_cloud",
                        "quality": "high",
                    },
                    {
                        "name": "uk-UA-Standard-A",
                        "language": "uk-UA",
                        "gender": "female",
                        "provider": "google_cloud",
                        "quality": "standard",
                    },
                ]
            )

        # Azure voices
        if self.azure_enabled:
            voices.extend(
                [
                    {
                        "name": "uk-UA-PolinaNeural",
                        "language": "uk-UA",
                        "gender": "female",
                        "provider": "azure",
                        "quality": "neural",
                    },
                    {
                        "name": "uk-UA-OstapNeural",
                        "language": "uk-UA",
                        "gender": "male",
                        "provider": "azure",
                        "quality": "neural",
                    },
                ]
            )

        return voices

    async def health_check(self) -> Dict[str, bool]:
        """Check health of voice services"""
        return {"google_cloud": self.google_enabled, "azure": self.azure_enabled}
