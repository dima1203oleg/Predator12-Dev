"""
AI module for Cyber Face
Handles conversational AI, intent classification, and personality management
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import openai
import anthropic

from ..vision import EmotionResult

logger = logging.getLogger(__name__)

class ModelProvider(Enum):
    """Available LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    LOCAL = "local"

@dataclass
class ConversationContext:
    """Context for conversation management"""
    user_id: str
    session_id: str
    conversation_history: List[Dict[str, Any]]
    emotion_context: Optional[EmotionResult] = None
    system_context: Dict[str, Any] = None
    user_preferences: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.system_context is None:
            self.system_context = {}
        if self.user_preferences is None:
            self.user_preferences = {}

@dataclass
class Intent:
    """Detected user intent"""
    name: str
    confidence: float
    entities: Dict[str, Any]
    suggested_actions: List[str]

@dataclass
class ConversationResponse:
    """AI-generated response"""
    text: str
    intent: Optional[Intent] = None
    actions: List[Dict[str, Any]] = None
    suggestions: List[str] = None
    confidence: float = 0.0
    model_used: str = ""
    processing_time: float = 0.0
    
    def __post_init__(self):
        if self.actions is None:
            self.actions = []
        if self.suggestions is None:
            self.suggestions = []

class PersonalityManager:
    """Manages AI personality and response style"""
    
    def __init__(self, config):
        self.config = config
        self.personality_profiles = {
            'professional': {
                'tone': 'formal',
                'response_style': 'concise',
                'proactivity': 'low',
                'emotional_range': 'neutral',
                'system_prompt': self._create_professional_prompt()
            },
            'friendly': {
                'tone': 'casual',
                'response_style': 'conversational',
                'proactivity': 'medium',
                'emotional_range': 'positive',
                'system_prompt': self._create_friendly_prompt()
            },
            'analytical': {
                'tone': 'technical',
                'response_style': 'detailed',
                'proactivity': 'high',
                'emotional_range': 'focused',
                'system_prompt': self._create_analytical_prompt()
            }
        }
        
        self.current_personality = self.personality_profiles.get(
            config.tone, self.personality_profiles['professional']
        )
    
    def _create_professional_prompt(self) -> str:
        return """You are Cyber Face, a professional AI assistant for Predator Analytics platform. 
        You provide concise, accurate information and maintain a formal tone. 
        Focus on efficiency and clarity in all interactions."""
    
    def _create_friendly_prompt(self) -> str:
        return """You are Cyber Face, a friendly AI companion for Predator Analytics platform.
        You're approachable, encouraging, and supportive while maintaining professionalism.
        Use a conversational tone and show genuine interest in helping users."""
    
    def _create_analytical_prompt(self) -> str:
        return """You are Cyber Face, an analytical AI expert for Predator Analytics platform.
        You provide detailed technical insights, comprehensive analysis, and proactive suggestions.
        Focus on data-driven recommendations and thorough explanations."""
    
    def get_system_prompt(self, context: ConversationContext) -> str:
        """Generate context-aware system prompt"""
        base_prompt = self.current_personality['system_prompt']
        
        # Add emotion context if available
        if context.emotion_context:
            emotion_prompt = f"\nUser's current emotional state: {context.emotion_context.primary_emotion} "
            emotion_prompt += f"(confidence: {context.emotion_context.confidence:.2f}). "
            emotion_prompt += "Adapt your response style accordingly."
            base_prompt += emotion_prompt
        
        # Add system context
        if context.system_context:
            system_info = f"\nSystem status: {json.dumps(context.system_context, indent=2)}"
            base_prompt += system_info
        
        return base_prompt
    
    def adapt_response(self, response: str, emotion: Optional[EmotionResult]) -> str:
        """Adapt response based on detected emotion"""
        if not emotion:
            return response
        
        # Adjust response based on user emotion
        if emotion.primary_emotion == 'stressed':
            response = f"I can see you might be feeling stressed. {response}"
            response += " Take your time, and let me know if you need a break."
        
        elif emotion.primary_emotion == 'confused':
            response = f"Let me clarify that for you. {response}"
            response += " Would you like me to explain any part in more detail?"
        
        elif emotion.primary_emotion == 'happy':
            response = f"Great to see you in good spirits! {response}"
        
        return response

class IntentClassifier:
    """Classifies user intents from text input"""
    
    def __init__(self):
        self.intent_patterns = {
            'query_system_status': [
                'how is the system', 'system status', 'health check',
                'are agents running', 'system health'
            ],
            'query_agents': [
                'agent status', 'which agents', 'agent performance',
                'list agents', 'show agents'
            ],
            'request_analysis': [
                'analyze', 'show me', 'what happened', 'investigate',
                'tell me about', 'explain'
            ],
            'configure_settings': [
                'change settings', 'configure', 'set up', 'modify',
                'update configuration', 'preferences'
            ],
            'request_help': [
                'help', 'how to', 'tutorial', 'guide me',
                'i need help', 'what can you do'
            ],
            'greeting': [
                'hello', 'hi', 'hey', 'good morning', 'good afternoon'
            ],
            'farewell': [
                'goodbye', 'bye', 'see you', 'talk later', 'exit'
            ]
        }
    
    async def classify_intent(self, text: str) -> Intent:
        """Classify user intent from input text"""
        text_lower = text.lower()
        
        # Simple pattern matching (can be enhanced with ML models)
        best_intent = 'general_query'
        best_confidence = 0.0
        matched_entities = {}
        
        for intent_name, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    confidence = len(pattern) / len(text_lower)
                    if confidence > best_confidence:
                        best_intent = intent_name
                        best_confidence = confidence
        
        # Extract entities (simplified)
        entities = await self._extract_entities(text)
        
        # Generate suggested actions
        suggested_actions = self._get_suggested_actions(best_intent, entities)
        
        return Intent(
            name=best_intent,
            confidence=min(best_confidence * 2, 1.0),  # Boost confidence
            entities=entities,
            suggested_actions=suggested_actions
        )
    
    async def _extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract entities from text"""
        entities = {}
        
        # Simple entity extraction
        if 'agent' in text.lower():
            entities['target'] = 'agents'
        if 'system' in text.lower():
            entities['target'] = 'system'
        if 'performance' in text.lower():
            entities['metric'] = 'performance'
        if 'error' in text.lower() or 'problem' in text.lower():
            entities['type'] = 'issue'
        
        return entities
    
    def _get_suggested_actions(self, intent: str, entities: Dict[str, Any]) -> List[str]:
        """Get suggested actions for intent"""
        action_map = {
            'query_system_status': ['Show system dashboard', 'Run health check'],
            'query_agents': ['List all agents', 'Show agent performance'],
            'request_analysis': ['Open analytics view', 'Generate report'],
            'configure_settings': ['Open settings', 'Show configuration'],
            'request_help': ['Show help menu', 'Open tutorial'],
            'greeting': ['Show dashboard overview'],
            'farewell': ['Save session', 'Export logs']
        }
        
        return action_map.get(intent, ['Show more options'])

class LLMClient:
    """Base class for LLM clients"""
    
    async def generate(self, prompt: str, context: ConversationContext) -> str:
        raise NotImplementedError

class OpenAIClient(LLMClient):
    """OpenAI GPT client"""
    
    def __init__(self, api_key: str, model: str = "gpt-4"):
        self.client = openai.AsyncOpenAI(api_key=api_key)
        self.model = model
    
    async def generate(self, prompt: str, context: ConversationContext) -> str:
        """Generate response using OpenAI GPT"""
        try:
            messages = [
                {"role": "system", "content": prompt}
            ]
            
            # Add conversation history
            for msg in context.conversation_history[-5:]:  # Last 5 messages
                messages.append(msg)
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

class AnthropicClient(LLMClient):
    """Anthropic Claude client"""
    
    def __init__(self, api_key: str, model: str = "claude-3-sonnet-20240229"):
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.model = model
    
    async def generate(self, prompt: str, context: ConversationContext) -> str:
        """Generate response using Claude"""
        try:
            # Combine system prompt with conversation
            conversation = f"{prompt}\n\n"
            for msg in context.conversation_history[-5:]:
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                conversation += f"{role}: {content}\n"
            
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": conversation}]
            )
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise

class LocalLLMClient(LLMClient):
    """Local LLM client (placeholder for local models)"""
    
    async def generate(self, prompt: str, context: ConversationContext) -> str:
        """Generate response using local model"""
        # Placeholder for local LLM implementation
        return "I'm a local AI assistant. How can I help you today?"

class ConversationEngine:
    """Main conversation engine that orchestrates all AI components"""
    
    def __init__(self, config, openai_key: Optional[str] = None, anthropic_key: Optional[str] = None):
        self.config = config
        self.personality_manager = PersonalityManager(config)
        self.intent_classifier = IntentClassifier()
        
        # Initialize LLM clients
        self.clients = {}
        
        if openai_key:
            self.clients[ModelProvider.OPENAI] = OpenAIClient(openai_key)
        if anthropic_key:
            self.clients[ModelProvider.ANTHROPIC] = AnthropicClient(anthropic_key)
        
        # Always have local fallback
        self.clients[ModelProvider.LOCAL] = LocalLLMClient()
        
        # Model selection preferences
        self.model_preferences = [
            ModelProvider.OPENAI,
            ModelProvider.ANTHROPIC,
            ModelProvider.LOCAL
        ]
    
    async def generate_response(
        self,
        user_input: str,
        context: ConversationContext
    ) -> ConversationResponse:
        """Generate comprehensive AI response"""
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Classify intent
            intent = await self.intent_classifier.classify_intent(user_input)
            
            # Select best model for this query
            model_provider = await self._select_model(user_input, intent, context)
            
            # Generate system prompt
            system_prompt = self.personality_manager.get_system_prompt(context)
            
            # Generate response
            client = self.clients[model_provider]
            raw_response = await client.generate(system_prompt, context)
            
            # Adapt response based on emotion
            adapted_response = self.personality_manager.adapt_response(
                raw_response, context.emotion_context
            )
            
            # Generate suggestions and actions
            suggestions = await self._generate_suggestions(intent, context)
            actions = await self._generate_actions(intent, context)
            
            processing_time = asyncio.get_event_loop().time() - start_time
            
            return ConversationResponse(
                text=adapted_response,
                intent=intent,
                actions=actions,
                suggestions=suggestions,
                confidence=intent.confidence,
                model_used=model_provider.value,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"Conversation generation failed: {e}")
            
            # Fallback response
            return ConversationResponse(
                text="I apologize, but I'm having trouble processing your request right now. Please try again.",
                intent=Intent("error", 0.0, {}, []),
                confidence=0.0,
                model_used="fallback",
                processing_time=asyncio.get_event_loop().time() - start_time
            )
    
    async def _select_model(
        self,
        user_input: str,
        intent: Intent,
        context: ConversationContext
    ) -> ModelProvider:
        """Select the best model for this query"""
        
        # Complex queries prefer GPT-4
        if len(user_input) > 100 or intent.name in ['request_analysis', 'configure_settings']:
            if ModelProvider.OPENAI in self.clients:
                return ModelProvider.OPENAI
        
        # Creative or conversational queries prefer Claude
        if intent.name in ['greeting', 'request_help'] or context.emotion_context:
            if ModelProvider.ANTHROPIC in self.clients:
                return ModelProvider.ANTHROPIC
        
        # Fallback to first available
        for provider in self.model_preferences:
            if provider in self.clients:
                return provider
        
        return ModelProvider.LOCAL
    
    async def _generate_suggestions(
        self,
        intent: Intent,
        context: ConversationContext
    ) -> List[str]:
        """Generate contextual suggestions"""
        
        suggestions = intent.suggested_actions.copy()
        
        # Add context-specific suggestions
        if context.emotion_context and context.emotion_context.primary_emotion == 'stressed':
            suggestions.append("Take a break")
            suggestions.append("View calming dashboard")
        
        if context.system_context and context.system_context.get('alerts'):
            suggestions.append("Review system alerts")
            suggestions.append("Run diagnostics")
        
        return suggestions[:4]  # Limit to 4 suggestions
    
    async def _generate_actions(
        self,
        intent: Intent,
        context: ConversationContext
    ) -> List[Dict[str, Any]]:
        """Generate actionable items"""
        
        actions = []
        
        if intent.name == 'query_system_status':
            actions.append({
                'type': 'navigate',
                'target': '/dashboard/system',
                'label': 'Open System Dashboard'
            })
        
        elif intent.name == 'query_agents':
            actions.append({
                'type': 'navigate',
                'target': '/dashboard/agents',
                'label': 'View Agent Status'
            })
        
        elif intent.name == 'request_analysis':
            actions.append({
                'type': 'modal',
                'target': 'analytics',
                'label': 'Open Analytics'
            })
        
        return actions

# Export main classes
__all__ = [
    'ConversationEngine',
    'PersonalityManager',
    'IntentClassifier',
    'ConversationContext',
    'ConversationResponse',
    'Intent',
    'ModelProvider'
]
