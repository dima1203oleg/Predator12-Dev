"""
Configuration module for Cyber Face AI
"""

from dataclasses import dataclass
from typing import Dict, Any, Optional
from pathlib import Path
import os

@dataclass
class EmotionConfig:
    """Configuration for emotion detection"""
    confidence_threshold: float = 0.75
    smoothing_window: int = 5
    update_frequency: int = 30  # FPS
    emotions: list = None
    
    def __post_init__(self):
        if self.emotions is None:
            self.emotions = [
                'neutral', 'happy', 'sad', 'angry', 
                'surprised', 'fearful', 'disgusted',
                'focused', 'confused', 'stressed'
            ]

@dataclass
class VoiceConfig:
    """Configuration for voice interface"""
    languages: list = None
    wake_words: list = None
    confidence_threshold: float = 0.8
    response_timeout: float = 3.0
    voice_models: list = None
    
    def __post_init__(self):
        if self.languages is None:
            self.languages = ['en-US', 'uk-UA', 'ru-RU']
        if self.wake_words is None:
            self.wake_words = ['hey cyber', 'predator', 'assistant']
        if self.voice_models is None:
            self.voice_models = ['azure-neural', 'elevenlabs', 'local-tts']

@dataclass
class PersonalityConfig:
    """Configuration for AI personality"""
    tone: str = "professional"  # formal, casual, technical
    response_style: str = "concise"  # concise, conversational, detailed
    proactivity: str = "medium"  # low, medium, high
    emotional_range: str = "neutral"  # neutral, positive, focused
    custom_traits: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.custom_traits is None:
            self.custom_traits = {}

@dataclass
class AvatarConfig:
    """Configuration for 3D avatar"""
    model_path: str = "models/base_avatar.gltf"
    expressions_path: str = "models/expressions/"
    render_quality: str = "medium"  # low, medium, high
    animation_speed: float = 1.0
    enable_physics: bool = False

@dataclass
class WebSocketConfig:
    """Configuration for WebSocket communication"""
    host: str = "localhost"
    port: int = 8002
    max_connections: int = 100
    heartbeat_interval: int = 30
    message_buffer_size: int = 1000

@dataclass 
class CyberFaceConfig:
    """Main configuration class for Cyber Face AI"""
    
    # Environment
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"
    
    # Model paths
    models_dir: Path = Path("models")
    cache_dir: Path = Path(".cache")
    logs_dir: Path = Path("logs")
    
    # Component configurations
    emotion: EmotionConfig = None
    voice: VoiceConfig = None
    personality: PersonalityConfig = None
    avatar: AvatarConfig = None
    websocket: WebSocketConfig = None
    
    # Performance settings
    max_memory_usage: int = 2048  # MB
    max_cpu_usage: float = 0.25  # 25%
    enable_gpu: bool = True
    
    # Security settings
    enable_encryption: bool = True
    session_timeout: int = 3600  # seconds
    max_failed_attempts: int = 5
    
    # Privacy settings
    store_biometric_data: bool = False
    data_retention_days: int = 7
    anonymize_logs: bool = True
    
    def __post_init__(self):
        if self.emotion is None:
            self.emotion = EmotionConfig()
        if self.voice is None:
            self.voice = VoiceConfig()
        if self.personality is None:
            self.personality = PersonalityConfig()
        if self.avatar is None:
            self.avatar = AvatarConfig()
        if self.websocket is None:
            self.websocket = WebSocketConfig()
    
    @classmethod
    def from_env(cls) -> 'CyberFaceConfig':
        """Load configuration from environment variables"""
        config = cls()
        
        # Override with environment variables
        config.environment = os.getenv('CYBER_FACE_ENV', config.environment)
        config.debug = os.getenv('CYBER_FACE_DEBUG', str(config.debug)).lower() == 'true'
        config.log_level = os.getenv('CYBER_FACE_LOG_LEVEL', config.log_level)
        
        # WebSocket configuration
        config.websocket.host = os.getenv('CYBER_FACE_WS_HOST', config.websocket.host)
        config.websocket.port = int(os.getenv('CYBER_FACE_WS_PORT', config.websocket.port))
        
        return config
    
    def validate(self) -> bool:
        """Validate configuration settings"""
        errors = []
        
        # Check required directories
        for dir_path in [self.models_dir, self.cache_dir, self.logs_dir]:
            if not dir_path.exists():
                try:
                    dir_path.mkdir(parents=True, exist_ok=True)
                except Exception as e:
                    errors.append(f"Cannot create directory {dir_path}: {e}")
        
        # Validate ranges
        if not 0 < self.emotion.confidence_threshold <= 1:
            errors.append("Emotion confidence threshold must be between 0 and 1")
        
        if not 0 < self.voice.confidence_threshold <= 1:
            errors.append("Voice confidence threshold must be between 0 and 1")
        
        if self.max_memory_usage < 512:
            errors.append("Max memory usage should be at least 512 MB")
        
        if not 0 < self.max_cpu_usage <= 1:
            errors.append("Max CPU usage must be between 0 and 1")
        
        if errors:
            raise ValueError(f"Configuration validation failed: {'; '.join(errors)}")
        
        return True
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary"""
        return {
            'environment': self.environment,
            'debug': self.debug,
            'log_level': self.log_level,
            'emotion': {
                'confidence_threshold': self.emotion.confidence_threshold,
                'smoothing_window': self.emotion.smoothing_window,
                'update_frequency': self.emotion.update_frequency,
                'emotions': self.emotion.emotions
            },
            'voice': {
                'languages': self.voice.languages,
                'wake_words': self.voice.wake_words,
                'confidence_threshold': self.voice.confidence_threshold,
                'response_timeout': self.voice.response_timeout
            },
            'personality': {
                'tone': self.personality.tone,
                'response_style': self.personality.response_style,
                'proactivity': self.personality.proactivity,
                'emotional_range': self.personality.emotional_range
            },
            'websocket': {
                'host': self.websocket.host,
                'port': self.websocket.port,
                'max_connections': self.websocket.max_connections
            }
        }

# Global configuration instance
config = CyberFaceConfig.from_env()
