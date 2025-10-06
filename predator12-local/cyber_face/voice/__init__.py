"""
Voice interface module for Cyber Face
Handles speech recognition, text-to-speech, and voice commands
"""

import asyncio
import logging
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass
from enum import Enum
import json

logger = logging.getLogger(__name__)

class VoiceProvider(Enum):
    """Voice service providers"""
    WEB_SPEECH = "web_speech"
    AZURE = "azure"
    GOOGLE = "google"
    LOCAL = "local"

@dataclass
class VoiceCommand:
    """Parsed voice command"""
    command: str
    confidence: float
    intent: str
    parameters: Dict[str, Any]
    raw_transcript: str

@dataclass
class SpeechResult:
    """Speech recognition result"""
    transcript: str
    confidence: float
    is_final: bool
    alternatives: List[str] = None
    
    def __post_init__(self):
        if self.alternatives is None:
            self.alternatives = []

class SpeechRecognition:
    """Advanced speech recognition with multiple providers"""
    
    def __init__(self, config):
        self.config = config
        self.languages = config.languages
        self.confidence_threshold = config.confidence_threshold
        self.providers = {}
        self.current_provider = VoiceProvider.WEB_SPEECH
        
        # Callbacks
        self.on_speech_start: Optional[Callable] = None
        self.on_speech_end: Optional[Callable] = None
        self.on_result: Optional[Callable[[SpeechResult], None]] = None
        self.on_error: Optional[Callable[[str], None]] = None
        
        self.is_listening = False
        self.current_session = None
    
    async def initialize(self):
        """Initialize speech recognition providers"""
        try:
            # Web Speech API (browser-based)
            self.providers[VoiceProvider.WEB_SPEECH] = WebSpeechProvider(self.config)
            
            # Try to initialize cloud providers
            await self._init_cloud_providers()
            
            # Local provider as fallback
            self.providers[VoiceProvider.LOCAL] = LocalSpeechProvider(self.config)
            
            logger.info(f"Speech recognition initialized with {len(self.providers)} providers")
            
        except Exception as e:
            logger.error(f"Failed to initialize speech recognition: {e}")
            raise
    
    async def _init_cloud_providers(self):
        """Initialize cloud-based speech providers"""
        # Azure Speech Service
        azure_key = self.config.get('azure_speech_key')
        if azure_key:
            try:
                self.providers[VoiceProvider.AZURE] = AzureSpeechProvider(azure_key, self.config)
            except Exception as e:
                logger.warning(f"Azure Speech provider failed to initialize: {e}")
        
        # Google Speech-to-Text
        google_credentials = self.config.get('google_credentials')
        if google_credentials:
            try:
                self.providers[VoiceProvider.GOOGLE] = GoogleSpeechProvider(google_credentials, self.config)
            except Exception as e:
                logger.warning(f"Google Speech provider failed to initialize: {e}")
    
    async def start_listening(self, language: str = "en-US") -> bool:
        """Start continuous speech recognition"""
        if self.is_listening:
            return True
        
        try:
            provider = self.providers.get(self.current_provider)
            if not provider:
                raise ValueError(f"Provider {self.current_provider} not available")
            
            self.current_session = await provider.start_listening(
                language=language,
                continuous=True,
                on_result=self._handle_speech_result,
                on_error=self._handle_speech_error
            )
            
            self.is_listening = True
            
            if self.on_speech_start:
                await self.on_speech_start()
            
            logger.info(f"Started listening with {self.current_provider}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start listening: {e}")
            if self.on_error:
                await self.on_error(str(e))
            return False
    
    async def stop_listening(self):
        """Stop speech recognition"""
        if not self.is_listening:
            return
        
        try:
            if self.current_session:
                await self.current_session.stop()
                self.current_session = None
            
            self.is_listening = False
            
            if self.on_speech_end:
                await self.on_speech_end()
            
            logger.info("Stopped listening")
            
        except Exception as e:
            logger.error(f"Error stopping speech recognition: {e}")
    
    async def recognize_once(self, language: str = "en-US", timeout: float = 5.0) -> Optional[SpeechResult]:
        """Single speech recognition with timeout"""
        try:
            provider = self.providers.get(self.current_provider)
            if not provider:
                raise ValueError(f"Provider {self.current_provider} not available")
            
            result = await asyncio.wait_for(
                provider.recognize_once(language),
                timeout=timeout
            )
            
            return result
            
        except asyncio.TimeoutError:
            logger.warning("Speech recognition timeout")
            return None
        except Exception as e:
            logger.error(f"Speech recognition error: {e}")
            return None
    
    async def _handle_speech_result(self, result: SpeechResult):
        """Handle speech recognition results"""
        if result.confidence >= self.confidence_threshold:
            logger.debug(f"Speech recognized: {result.transcript} (confidence: {result.confidence})")
            
            if self.on_result:
                await self.on_result(result)
        else:
            logger.debug(f"Low confidence speech ignored: {result.transcript} (confidence: {result.confidence})")
    
    async def _handle_speech_error(self, error: str):
        """Handle speech recognition errors"""
        logger.error(f"Speech recognition error: {error}")
        
        if self.on_error:
            await self.on_error(error)

class TextToSpeech:
    """Text-to-speech synthesis"""
    
    def __init__(self, config):
        self.config = config
        self.voice_models = config.voice_models
        self.current_model = self.voice_models[0] if self.voice_models else "local-tts"
        self.providers = {}
    
    async def initialize(self):
        """Initialize TTS providers"""
        try:
            # Initialize available providers
            self.providers["web_speech"] = WebSpeechTTS()
            
            # Cloud providers
            await self._init_cloud_tts()
            
            # Local TTS
            self.providers["local"] = LocalTTS()
            
            logger.info(f"TTS initialized with {len(self.providers)} providers")
            
        except Exception as e:
            logger.error(f"Failed to initialize TTS: {e}")
            raise
    
    async def _init_cloud_tts(self):
        """Initialize cloud TTS providers"""
        # Azure Neural Voices
        azure_key = self.config.get('azure_speech_key')
        if azure_key:
            try:
                self.providers["azure"] = AzureTTS(azure_key)
            except Exception as e:
                logger.warning(f"Azure TTS failed to initialize: {e}")
        
        # ElevenLabs
        elevenlabs_key = self.config.get('elevenlabs_key')
        if elevenlabs_key:
            try:
                self.providers["elevenlabs"] = ElevenLabsTTS(elevenlabs_key)
            except Exception as e:
                logger.warning(f"ElevenLabs TTS failed to initialize: {e}")
    
    async def speak(self, text: str, voice: Optional[str] = None, language: str = "en-US") -> bool:
        """Convert text to speech and play"""
        try:
            # Select provider based on current model
            provider_name = self._get_provider_for_model(self.current_model)
            provider = self.providers.get(provider_name)
            
            if not provider:
                raise ValueError(f"TTS provider {provider_name} not available")
            
            # Generate audio
            audio_data = await provider.synthesize(text, voice, language)
            
            # Play audio
            await self._play_audio(audio_data)
            
            logger.debug(f"Spoke text: {text[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"TTS error: {e}")
            return False
    
    def _get_provider_for_model(self, model: str) -> str:
        """Map voice model to provider"""
        model_mapping = {
            "azure-neural": "azure",
            "elevenlabs": "elevenlabs",
            "web-speech": "web_speech",
            "local-tts": "local"
        }
        return model_mapping.get(model, "local")
    
    async def _play_audio(self, audio_data: bytes):
        """Play audio data (placeholder)"""
        # In a real implementation, this would play the audio
        # through appropriate audio system
        pass

class WakeWordDetector:
    """Detect wake words to activate voice interface"""
    
    def __init__(self, config):
        self.config = config
        self.wake_words = config.wake_words
        self.is_active = False
        self.sensitivity = 0.7
        
        # Callbacks
        self.on_wake_word: Optional[Callable[[str], None]] = None
    
    async def start_detection(self):
        """Start wake word detection"""
        self.is_active = True
        
        # Start continuous audio monitoring
        while self.is_active:
            try:
                # Placeholder for wake word detection
                # Real implementation would use audio stream processing
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Wake word detection error: {e}")
                await asyncio.sleep(1.0)
    
    async def stop_detection(self):
        """Stop wake word detection"""
        self.is_active = False
    
    def _process_audio_chunk(self, audio_chunk: bytes) -> Optional[str]:
        """Process audio chunk for wake word detection"""
        # Placeholder for wake word processing
        # Real implementation would use models like Porcupine or Snowboy
        return None

class VoiceCommandProcessor:
    """Process voice commands and extract intents"""
    
    def __init__(self):
        self.command_patterns = {
            'show_dashboard': [
                'show dashboard', 'open dashboard', 'main screen'
            ],
            'check_agents': [
                'check agents', 'agent status', 'how are agents'
            ],
            'system_health': [
                'system health', 'health check', 'status report'
            ],
            'open_analytics': [
                'open analytics', 'show analytics', 'data analysis'
            ],
            'run_diagnosis': [
                'run diagnosis', 'diagnose', 'check problems'
            ],
            'help': [
                'help', 'what can you do', 'commands'
            ]
        }
    
    async def process_command(self, transcript: str) -> VoiceCommand:
        """Process speech transcript into structured command"""
        transcript_lower = transcript.lower().strip()
        
        # Find best matching command
        best_command = 'unknown'
        best_confidence = 0.0
        parameters = {}
        
        for command, patterns in self.command_patterns.items():
            for pattern in patterns:
                if pattern in transcript_lower:
                    confidence = len(pattern) / len(transcript_lower)
                    if confidence > best_confidence:
                        best_command = command
                        best_confidence = confidence
        
        # Extract parameters (simplified)
        parameters = self._extract_parameters(transcript_lower, best_command)
        
        return VoiceCommand(
            command=best_command,
            confidence=min(best_confidence * 1.5, 1.0),
            intent=self._command_to_intent(best_command),
            parameters=parameters,
            raw_transcript=transcript
        )
    
    def _extract_parameters(self, text: str, command: str) -> Dict[str, Any]:
        """Extract parameters from voice command"""
        parameters = {}
        
        # Extract numbers
        import re
        numbers = re.findall(r'\d+', text)
        if numbers:
            parameters['numbers'] = [int(n) for n in numbers]
        
        # Extract agent names
        if 'agent' in text:
            # Could extract specific agent names
            parameters['target'] = 'agents'
        
        return parameters
    
    def _command_to_intent(self, command: str) -> str:
        """Map command to intent"""
        intent_mapping = {
            'show_dashboard': 'navigate_dashboard',
            'check_agents': 'query_agents',
            'system_health': 'query_system_status',
            'open_analytics': 'open_analytics',
            'run_diagnosis': 'run_diagnostics',
            'help': 'request_help',
            'unknown': 'general_query'
        }
        return intent_mapping.get(command, 'general_query')

class VoiceInterface:
    """Main voice interface orchestrator"""
    
    def __init__(self, config):
        self.config = config
        self.speech_recognition = SpeechRecognition(config)
        self.text_to_speech = TextToSpeech(config)
        self.wake_word_detector = WakeWordDetector(config)
        self.command_processor = VoiceCommandProcessor()
        
        self.is_voice_mode = False
        self.conversation_active = False
        
        # Callbacks
        self.on_command: Optional[Callable[[VoiceCommand], None]] = None
        self.on_conversation: Optional[Callable[[str], None]] = None
    
    async def initialize(self):
        """Initialize all voice components"""
        await self.speech_recognition.initialize()
        await self.text_to_speech.initialize()
        
        # Set up event handlers
        self.speech_recognition.on_result = self._handle_speech_result
        self.wake_word_detector.on_wake_word = self._handle_wake_word
        
        logger.info("Voice interface initialized")
    
    async def start_voice_mode(self):
        """Start voice interaction mode"""
        if self.is_voice_mode:
            return
        
        self.is_voice_mode = True
        
        # Start wake word detection
        asyncio.create_task(self.wake_word_detector.start_detection())
        
        logger.info("Voice mode activated")
    
    async def stop_voice_mode(self):
        """Stop voice interaction mode"""
        if not self.is_voice_mode:
            return
        
        self.is_voice_mode = False
        self.conversation_active = False
        
        await self.wake_word_detector.stop_detection()
        await self.speech_recognition.stop_listening()
        
        logger.info("Voice mode deactivated")
    
    async def start_conversation(self):
        """Start voice conversation"""
        if self.conversation_active:
            return
        
        self.conversation_active = True
        await self.speech_recognition.start_listening()
        
        # Provide audio feedback
        await self.text_to_speech.speak("I'm listening. How can I help you?")
    
    async def stop_conversation(self):
        """Stop voice conversation"""
        if not self.conversation_active:
            return
        
        self.conversation_active = False
        await self.speech_recognition.stop_listening()
        
        await self.text_to_speech.speak("Voice conversation ended.")
    
    async def speak_response(self, text: str, voice: Optional[str] = None):
        """Speak AI response"""
        await self.text_to_speech.speak(text, voice)
    
    async def _handle_speech_result(self, result: SpeechResult):
        """Handle speech recognition results"""
        if not result.is_final:
            return
        
        # Process as command or conversation
        if self.conversation_active:
            # Send to conversation handler
            if self.on_conversation:
                await self.on_conversation(result.transcript)
        else:
            # Process as voice command
            command = await self.command_processor.process_command(result.transcript)
            
            if command.confidence > 0.5 and self.on_command:
                await self.on_command(command)
    
    async def _handle_wake_word(self, wake_word: str):
        """Handle wake word detection"""
        logger.info(f"Wake word detected: {wake_word}")
        
        if not self.conversation_active:
            await self.start_conversation()

# Provider implementations (placeholders)
class WebSpeechProvider:
    """Web Speech API provider"""
    def __init__(self, config): pass
    async def start_listening(self, **kwargs): pass
    async def recognize_once(self, language): pass

class AzureSpeechProvider:
    """Azure Speech Service provider"""
    def __init__(self, api_key, config): pass
    async def start_listening(self, **kwargs): pass
    async def recognize_once(self, language): pass

class GoogleSpeechProvider:
    """Google Speech-to-Text provider"""
    def __init__(self, credentials, config): pass
    async def start_listening(self, **kwargs): pass
    async def recognize_once(self, language): pass

class LocalSpeechProvider:
    """Local speech recognition provider"""
    def __init__(self, config): pass
    async def start_listening(self, **kwargs): pass
    async def recognize_once(self, language): pass

class WebSpeechTTS:
    """Web Speech API TTS"""
    async def synthesize(self, text, voice, language): return b""

class AzureTTS:
    """Azure Neural Voice TTS"""
    def __init__(self, api_key): pass
    async def synthesize(self, text, voice, language): return b""

class ElevenLabsTTS:
    """ElevenLabs TTS"""
    def __init__(self, api_key): pass
    async def synthesize(self, text, voice, language): return b""

class LocalTTS:
    """Local TTS implementation"""
    async def synthesize(self, text, voice, language): return b""

# Export main classes
__all__ = [
    'VoiceInterface',
    'SpeechRecognition',
    'TextToSpeech',
    'WakeWordDetector',
    'VoiceCommandProcessor',
    'VoiceCommand',
    'SpeechResult'
]
