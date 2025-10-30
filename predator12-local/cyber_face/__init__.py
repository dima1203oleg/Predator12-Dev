"""
Cyber Face AI Module
====================

Advanced AI-powered facial interface for Predator Analytics platform.
Provides real-time emotion detection, conversational AI, and adaptive user interaction.
"""

__version__ = "1.0.0"
__author__ = "Predator Analytics Team"

from .ai import ConversationEngine, PersonalityManager
from .avatar import AvatarRenderer, ExpressionMapper
from .config import CyberFaceConfig
from .integration import DashboardConnector, WebSocketHandler
from .vision import EmotionDetector, FaceDetector
from .voice import SpeechRecognition, VoiceInterface

__all__ = [
    "CyberFaceConfig",
    "EmotionDetector",
    "FaceDetector",
    "ConversationEngine",
    "PersonalityManager",
    "VoiceInterface",
    "SpeechRecognition",
    "AvatarRenderer",
    "ExpressionMapper",
    "WebSocketHandler",
    "DashboardConnector",
]
