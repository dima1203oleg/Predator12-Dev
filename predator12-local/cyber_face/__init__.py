"""
Cyber Face AI Module
====================

Advanced AI-powered facial interface for Predator Analytics platform.
Provides real-time emotion detection, conversational AI, and adaptive user interaction.
"""

__version__ = "1.0.0"
__author__ = "Predator Analytics Team"

from .config import CyberFaceConfig
from .vision import EmotionDetector, FaceDetector
from .ai import ConversationEngine, PersonalityManager
from .voice import VoiceInterface, SpeechRecognition
from .avatar import AvatarRenderer, ExpressionMapper
from .integration import WebSocketHandler, DashboardConnector

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
    "DashboardConnector"
]
