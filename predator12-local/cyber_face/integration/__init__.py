"""
Integration module for Cyber Face
Handles WebSocket communication, dashboard integration, and system connectivity
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Callable, Set
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import websockets
from websockets.server import WebSocketServerProtocol

from ..vision import EmotionResult
from ..ai import ConversationResponse, ConversationContext
from ..voice import VoiceCommand
from ..avatar import AvatarState

logger = logging.getLogger(__name__)

class MessageType(Enum):
    """WebSocket message types"""
    EMOTION_UPDATE = "emotion_update"
    VOICE_COMMAND = "voice_command"
    AI_RESPONSE = "ai_response"
    AVATAR_STATE = "avatar_state"
    SYSTEM_STATUS = "system_status"
    USER_INTERACTION = "user_interaction"
    AGENT_STATUS = "agent_status"
    PERFORMANCE_METRIC = "performance_metric"
    ERROR = "error"
    HEARTBEAT = "heartbeat"

@dataclass
class WebSocketMessage:
    """WebSocket message structure"""
    type: MessageType
    data: Any
    timestamp: float
    session_id: str
    user_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'type': self.type.value,
            'data': self.data,
            'timestamp': self.timestamp,
            'session_id': self.session_id,
            'user_id': self.user_id,
            'metadata': self.metadata or {}
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'WebSocketMessage':
        return cls(
            type=MessageType(data['type']),
            data=data['data'],
            timestamp=data['timestamp'],
            session_id=data['session_id'],
            user_id=data.get('user_id'),
            metadata=data.get('metadata')
        )

@dataclass
class ClientSession:
    """WebSocket client session"""
    session_id: str
    user_id: Optional[str]
    websocket: WebSocketServerProtocol
    connected_at: datetime
    last_heartbeat: datetime
    subscriptions: Set[MessageType]
    metadata: Dict[str, Any]

class WebSocketHandler:
    """Handles WebSocket connections and real-time communication"""
    
    def __init__(self, config):
        self.config = config
        self.host = config.host
        self.port = config.port
        self.max_connections = config.max_connections
        self.heartbeat_interval = config.heartbeat_interval
        
        # Connection management
        self.clients: Dict[str, ClientSession] = {}
        self.server = None
        self.is_running = False
        
        # Message handlers
        self.message_handlers: Dict[MessageType, List[Callable]] = {}
        
        # Metrics
        self.total_connections = 0
        self.total_messages = 0
        self.active_connections = 0
    
    async def start_server(self):
        """Start WebSocket server"""
        if self.is_running:
            return
        
        try:
            self.server = await websockets.serve(
                self._handle_client,
                self.host,
                self.port,
                max_size=1024*1024,  # 1MB max message size
                max_queue=100,
                compression=None,
                ping_interval=20,
                ping_timeout=10
            )
            
            self.is_running = True
            
            # Start heartbeat task
            asyncio.create_task(self._heartbeat_task())
            
            logger.info(f"WebSocket server started on {self.host}:{self.port}")
            
        except Exception as e:
            logger.error(f"Failed to start WebSocket server: {e}")
            raise
    
    async def stop_server(self):
        """Stop WebSocket server"""
        if not self.is_running:
            return
        
        self.is_running = False
        
        # Close all client connections
        for client in list(self.clients.values()):
            await self._disconnect_client(client.session_id)
        
        # Stop server
        if self.server:
            self.server.close()
            await self.server.wait_closed()
        
        logger.info("WebSocket server stopped")
    
    async def _handle_client(self, websocket: WebSocketServerProtocol, path: str):
        """Handle new client connection"""
        session_id = self._generate_session_id()
        
        try:
            # Register client
            client = ClientSession(
                session_id=session_id,
                user_id=None,
                websocket=websocket,
                connected_at=datetime.now(),
                last_heartbeat=datetime.now(),
                subscriptions=set(),
                metadata={}
            )
            
            self.clients[session_id] = client
            self.total_connections += 1
            self.active_connections += 1
            
            logger.info(f"Client connected: {session_id}")
            
            # Send welcome message
            await self._send_to_client(session_id, WebSocketMessage(
                type=MessageType.SYSTEM_STATUS,
                data={'status': 'connected', 'session_id': session_id},
                timestamp=asyncio.get_event_loop().time(),
                session_id=session_id
            ))
            
            # Handle messages
            async for message in websocket:
                await self._handle_message(session_id, message)
                
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"Client disconnected: {session_id}")
        except Exception as e:
            logger.error(f"Error handling client {session_id}: {e}")
        finally:
            await self._disconnect_client(session_id)
    
    async def _handle_message(self, session_id: str, message: str):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            ws_message = WebSocketMessage.from_dict(data)
            
            self.total_messages += 1
            
            # Update heartbeat
            if session_id in self.clients:
                self.clients[session_id].last_heartbeat = datetime.now()
            
            # Route message to handlers
            handlers = self.message_handlers.get(ws_message.type, [])
            for handler in handlers:
                try:
                    await handler(session_id, ws_message)
                except Exception as e:
                    logger.error(f"Handler error for {ws_message.type}: {e}")
            
        except json.JSONDecodeError:
            logger.warning(f"Invalid JSON from client {session_id}")
        except Exception as e:
            logger.error(f"Error processing message from {session_id}: {e}")
    
    async def _disconnect_client(self, session_id: str):
        """Disconnect client"""
        if session_id in self.clients:
            del self.clients[session_id]
            self.active_connections -= 1
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        import uuid
        return str(uuid.uuid4())
    
    async def _heartbeat_task(self):
        """Periodic heartbeat to check client connections"""
        while self.is_running:
            try:
                current_time = datetime.now()
                disconnected_clients = []
                
                for session_id, client in self.clients.items():
                    time_since_heartbeat = (current_time - client.last_heartbeat).total_seconds()
                    
                    if time_since_heartbeat > self.heartbeat_interval * 2:
                        disconnected_clients.append(session_id)
                        continue
                    
                    # Send heartbeat
                    await self._send_to_client(session_id, WebSocketMessage(
                        type=MessageType.HEARTBEAT,
                        data={'timestamp': current_time.isoformat()},
                        timestamp=asyncio.get_event_loop().time(),
                        session_id=session_id
                    ))
                
                # Remove disconnected clients
                for session_id in disconnected_clients:
                    await self._disconnect_client(session_id)
                
                await asyncio.sleep(self.heartbeat_interval)
                
            except Exception as e:
                logger.error(f"Heartbeat task error: {e}")
                await asyncio.sleep(5)
    
    async def _send_to_client(self, session_id: str, message: WebSocketMessage):
        """Send message to specific client"""
        if session_id not in self.clients:
            return False
        
        client = self.clients[session_id]
        
        try:
            await client.websocket.send(json.dumps(message.to_dict()))
            return True
        except Exception as e:
            logger.error(f"Failed to send message to {session_id}: {e}")
            await self._disconnect_client(session_id)
            return False
    
    async def broadcast_message(self, message: WebSocketMessage, filter_type: Optional[MessageType] = None):
        """Broadcast message to all connected clients"""
        if filter_type:
            # Send only to clients subscribed to this message type
            clients = [c for c in self.clients.values() if filter_type in c.subscriptions]
        else:
            clients = list(self.clients.values())
        
        for client in clients:
            await self._send_to_client(client.session_id, message)
    
    def register_handler(self, message_type: MessageType, handler: Callable):
        """Register message handler"""
        if message_type not in self.message_handlers:
            self.message_handlers[message_type] = []
        
        self.message_handlers[message_type].append(handler)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            'active_connections': self.active_connections,
            'total_connections': self.total_connections,
            'total_messages': self.total_messages,
            'is_running': self.is_running
        }

class DashboardConnector:
    """Connects Cyber Face to the main dashboard"""
    
    def __init__(self, websocket_handler: WebSocketHandler):
        self.websocket_handler = websocket_handler
        self.agent_status_cache: Dict[str, Any] = {}
        self.system_health_cache: Dict[str, Any] = {}
        
        # Setup message handlers
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup WebSocket message handlers"""
        self.websocket_handler.register_handler(
            MessageType.USER_INTERACTION,
            self._handle_user_interaction
        )
    
    async def _handle_user_interaction(self, session_id: str, message: WebSocketMessage):
        """Handle user interaction from dashboard"""
        interaction_data = message.data
        
        logger.info(f"User interaction: {interaction_data}")
        
        # Process different interaction types
        interaction_type = interaction_data.get('type')
        
        if interaction_type == 'emotion_feedback':
            await self._handle_emotion_feedback(session_id, interaction_data)
        elif interaction_type == 'voice_command':
            await self._handle_voice_command(session_id, interaction_data)
        elif interaction_type == 'settings_change':
            await self._handle_settings_change(session_id, interaction_data)
    
    async def _handle_emotion_feedback(self, session_id: str, data: Dict[str, Any]):
        """Handle emotion detection feedback"""
        # User correcting emotion detection
        detected_emotion = data.get('detected_emotion')
        actual_emotion = data.get('actual_emotion')
        
        logger.info(f"Emotion feedback: detected={detected_emotion}, actual={actual_emotion}")
        
        # This could be used to improve emotion detection models
    
    async def _handle_voice_command(self, session_id: str, data: Dict[str, Any]):
        """Handle voice command from dashboard"""
        command = data.get('command')
        parameters = data.get('parameters', {})
        
        logger.info(f"Voice command: {command} with params {parameters}")
        
        # Execute command (placeholder)
    
    async def _handle_settings_change(self, session_id: str, data: Dict[str, Any]):
        """Handle settings change from dashboard"""
        setting_name = data.get('setting')
        setting_value = data.get('value')
        
        logger.info(f"Settings change: {setting_name} = {setting_value}")
    
    async def update_emotion_display(self, emotion: EmotionResult):
        """Update emotion display on dashboard"""
        message = WebSocketMessage(
            type=MessageType.EMOTION_UPDATE,
            data={
                'primary_emotion': emotion.primary_emotion,
                'confidence': emotion.confidence,
                'all_emotions': emotion.all_emotions,
                'timestamp': emotion.timestamp
            },
            timestamp=asyncio.get_event_loop().time(),
            session_id='broadcast'
        )
        
        await self.websocket_handler.broadcast_message(message)
    
    async def update_voice_status(self, is_listening: bool, is_speaking: bool):
        """Update voice interface status"""
        message = WebSocketMessage(
            type=MessageType.SYSTEM_STATUS,
            data={
                'voice_listening': is_listening,
                'voice_speaking': is_speaking,
                'timestamp': datetime.now().isoformat()
            },
            timestamp=asyncio.get_event_loop().time(),
            session_id='broadcast'
        )
        
        await self.websocket_handler.broadcast_message(message)
    
    async def update_avatar_state(self, state: AvatarState):
        """Update avatar state on dashboard"""
        message = WebSocketMessage(
            type=MessageType.AVATAR_STATE,
            data=asdict(state),
            timestamp=asyncio.get_event_loop().time(),
            session_id='broadcast'
        )
        
        await self.websocket_handler.broadcast_message(message)
    
    async def send_ai_response(self, response: ConversationResponse):
        """Send AI response to dashboard"""
        message = WebSocketMessage(
            type=MessageType.AI_RESPONSE,
            data={
                'text': response.text,
                'intent': asdict(response.intent) if response.intent else None,
                'actions': response.actions,
                'suggestions': response.suggestions,
                'confidence': response.confidence,
                'model_used': response.model_used,
                'processing_time': response.processing_time
            },
            timestamp=asyncio.get_event_loop().time(),
            session_id='broadcast'
        )
        
        await self.websocket_handler.broadcast_message(message)
    
    async def update_agent_status(self, agent_data: Dict[str, Any]):
        """Update agent status information"""
        self.agent_status_cache.update(agent_data)
        
        message = WebSocketMessage(
            type=MessageType.AGENT_STATUS,
            data=agent_data,
            timestamp=asyncio.get_event_loop().time(),
            session_id='broadcast'
        )
        
        await self.websocket_handler.broadcast_message(message)
    
    async def update_system_health(self, health_data: Dict[str, Any]):
        """Update system health information"""
        self.system_health_cache.update(health_data)
        
        message = WebSocketMessage(
            type=MessageType.SYSTEM_STATUS,
            data=health_data,
            timestamp=asyncio.get_event_loop().time(),
            session_id='broadcast'
        )
        
        await self.websocket_handler.broadcast_message(message)

class AgentConnector:
    """Connects Cyber Face to the agent system"""
    
    def __init__(self, dashboard_connector: DashboardConnector):
        self.dashboard_connector = dashboard_connector
        self.agents_status: Dict[str, Dict] = {}
        self.monitoring_active = False
    
    async def start_monitoring(self):
        """Start monitoring agent system"""
        if self.monitoring_active:
            return
        
        self.monitoring_active = True
        
        # Start monitoring tasks
        asyncio.create_task(self._monitor_agents())
        asyncio.create_task(self._monitor_system_health())
        
        logger.info("Agent monitoring started")
    
    async def stop_monitoring(self):
        """Stop monitoring agent system"""
        self.monitoring_active = False
        logger.info("Agent monitoring stopped")
    
    async def _monitor_agents(self):
        """Monitor individual agents"""
        while self.monitoring_active:
            try:
                # Fetch agent status (placeholder)
                agent_status = await self._fetch_agent_status()
                
                # Update dashboard
                await self.dashboard_connector.update_agent_status(agent_status)
                
                await asyncio.sleep(5)  # Update every 5 seconds
                
            except Exception as e:
                logger.error(f"Agent monitoring error: {e}")
                await asyncio.sleep(10)
    
    async def _monitor_system_health(self):
        """Monitor overall system health"""
        while self.monitoring_active:
            try:
                # Fetch system health (placeholder)
                health_data = await self._fetch_system_health()
                
                # Update dashboard
                await self.dashboard_connector.update_system_health(health_data)
                
                await asyncio.sleep(10)  # Update every 10 seconds
                
            except Exception as e:
                logger.error(f"System health monitoring error: {e}")
                await asyncio.sleep(15)
    
    async def _fetch_agent_status(self) -> Dict[str, Any]:
        """Fetch current agent status"""
        # Placeholder for agent status fetching
        # Real implementation would query agent supervisor
        return {
            'total_agents': 30,
            'active_agents': 28,
            'failed_agents': 0,
            'warning_agents': 2,
            'agents': [
                {
                    'id': f'agent_{i}',
                    'name': f'Agent {i}',
                    'status': 'active' if i < 28 else 'warning',
                    'last_update': datetime.now().isoformat(),
                    'performance': 0.95 if i < 28 else 0.75
                }
                for i in range(1, 31)
            ]
        }
    
    async def _fetch_system_health(self) -> Dict[str, Any]:
        """Fetch system health metrics"""
        # Placeholder for system health fetching
        return {
            'cpu_usage': 45.2,
            'memory_usage': 67.8,
            'disk_usage': 34.1,
            'network_status': 'healthy',
            'database_status': 'healthy',
            'api_response_time': 120,
            'error_rate': 0.01,
            'uptime': '7d 14h 32m'
        }

class NotificationSystem:
    """Handles system notifications and alerts"""
    
    def __init__(self, dashboard_connector: DashboardConnector):
        self.dashboard_connector = dashboard_connector
        self.notification_queue: List[Dict] = []
        self.alert_thresholds = {
            'error_rate': 0.05,
            'response_time': 1000,
            'cpu_usage': 80,
            'memory_usage': 85
        }
    
    async def send_notification(self, 
                              title: str, 
                              message: str, 
                              priority: str = 'normal',
                              category: str = 'system'):
        """Send notification to dashboard"""
        notification = {
            'id': self._generate_notification_id(),
            'title': title,
            'message': message,
            'priority': priority,
            'category': category,
            'timestamp': datetime.now().isoformat(),
            'read': False
        }
        
        self.notification_queue.append(notification)
        
        # Send to dashboard
        message = WebSocketMessage(
            type=MessageType.SYSTEM_STATUS,
            data={'notification': notification},
            timestamp=asyncio.get_event_loop().time(),
            session_id='broadcast'
        )
        
        await self.dashboard_connector.websocket_handler.broadcast_message(message)
        
        logger.info(f"Notification sent: {title}")
    
    async def check_system_alerts(self, health_data: Dict[str, Any]):
        """Check for system alerts based on health data"""
        for metric, threshold in self.alert_thresholds.items():
            if metric in health_data:
                value = health_data[metric]
                
                if value > threshold:
                    await self.send_notification(
                        title=f"High {metric.replace('_', ' ').title()}",
                        message=f"{metric.replace('_', ' ').title()} is {value}%, above threshold of {threshold}%",
                        priority='high',
                        category='performance'
                    )
    
    def _generate_notification_id(self) -> str:
        """Generate unique notification ID"""
        import uuid
        return str(uuid.uuid4())

# Export main classes
__all__ = [
    'WebSocketHandler',
    'DashboardConnector',
    'AgentConnector',
    'NotificationSystem',
    'WebSocketMessage',
    'MessageType',
    'ClientSession'
]
