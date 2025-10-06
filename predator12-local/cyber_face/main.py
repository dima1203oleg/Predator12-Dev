"""
Cyber Face AI Main Application
=============================

Main entry point for the Cyber Face AI system.
Orchestrates all components and provides the main application interface.
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path
from typing import Optional
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager

# Import Cyber Face components
from .config import CyberFaceConfig, config
from .vision import FaceDetector, EmotionDetector, AttentionTracker
from .ai import ConversationEngine, ConversationContext, PersonalityManager
from .voice import VoiceInterface
from .avatar import AvatarRenderer, AvatarAnimator, ExpressionMapper
from .integration import (
    WebSocketHandler, DashboardConnector, AgentConnector, 
    NotificationSystem, WebSocketMessage, MessageType
)

# Setup logging
logging.basicConfig(
    level=getattr(logging, config.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CyberFaceApplication:
    """Main Cyber Face application"""
    
    def __init__(self, config: CyberFaceConfig):
        self.config = config
        self.initialized = False
        
        # Core components
        self.face_detector: Optional[FaceDetector] = None
        self.emotion_detector: Optional[EmotionDetector] = None
        self.attention_tracker: Optional[AttentionTracker] = None
        self.conversation_engine: Optional[ConversationEngine] = None
        self.voice_interface: Optional[VoiceInterface] = None
        self.avatar_renderer: Optional[AvatarRenderer] = None
        self.avatar_animator: Optional[AvatarAnimator] = None
        
        # Integration components
        self.websocket_handler: Optional[WebSocketHandler] = None
        self.dashboard_connector: Optional[DashboardConnector] = None
        self.agent_connector: Optional[AgentConnector] = None
        self.notification_system: Optional[NotificationSystem] = None
        
        # Application state
        self.current_session: Optional[ConversationContext] = None
        self.is_running = False
        self.processing_frame = False
    
    async def initialize(self):
        """Initialize all Cyber Face components"""
        if self.initialized:
            return
        
        logger.info("Initializing Cyber Face AI...")
        
        try:
            # Validate configuration
            self.config.validate()
            
            # Initialize computer vision components
            logger.info("Initializing computer vision...")
            self.face_detector = FaceDetector()
            await self.face_detector.initialize()
            
            self.emotion_detector = EmotionDetector(self.config.emotion)
            await self.emotion_detector.initialize()
            
            self.attention_tracker = AttentionTracker()
            
            # Initialize AI components
            logger.info("Initializing AI components...")
            self.conversation_engine = ConversationEngine(
                self.config.personality,
                openai_key=None,  # Load from environment
                anthropic_key=None  # Load from environment
            )
            
            # Initialize voice interface
            logger.info("Initializing voice interface...")
            self.voice_interface = VoiceInterface(self.config.voice)
            await self.voice_interface.initialize()
            
            # Initialize avatar system
            logger.info("Initializing avatar system...")
            self.avatar_renderer = AvatarRenderer(self.config.avatar)
            await self.avatar_renderer.initialize()
            
            self.avatar_animator = AvatarAnimator()
            
            # Initialize integration components
            logger.info("Initializing integration...")
            self.websocket_handler = WebSocketHandler(self.config.websocket)
            
            self.dashboard_connector = DashboardConnector(self.websocket_handler)
            self.agent_connector = AgentConnector(self.dashboard_connector)
            self.notification_system = NotificationSystem(self.dashboard_connector)
            
            # Setup event handlers
            await self._setup_event_handlers()
            
            self.initialized = True
            logger.info("Cyber Face AI initialized successfully!")
            
        except Exception as e:
            logger.error(f"Failed to initialize Cyber Face AI: {e}")
            raise
    
    async def _setup_event_handlers(self):
        """Setup event handlers between components"""
        # Voice interface events
        if self.voice_interface:
            self.voice_interface.on_command = self._handle_voice_command
            self.voice_interface.on_conversation = self._handle_voice_conversation
        
        # Avatar animation events
        if self.avatar_animator:
            # Setup animation completion callbacks if needed
            pass
    
    async def start(self):
        """Start the Cyber Face application"""
        if not self.initialized:
            await self.initialize()
        
        if self.is_running:
            return
        
        logger.info("Starting Cyber Face AI...")
        
        try:
            # Start WebSocket server
            await self.websocket_handler.start_server()
            
            # Start agent monitoring
            await self.agent_connector.start_monitoring()
            
            # Start voice interface
            await self.voice_interface.start_voice_mode()
            
            # Start main processing loop
            self.is_running = True
            
            # Send startup notification
            await self.notification_system.send_notification(
                title="Cyber Face AI Started",
                message="All systems initialized and ready",
                category="system"
            )
            
            logger.info("Cyber Face AI started successfully!")
            
        except Exception as e:
            logger.error(f"Failed to start Cyber Face AI: {e}")
            raise
    
    async def stop(self):
        """Stop the Cyber Face application"""
        if not self.is_running:
            return
        
        logger.info("Stopping Cyber Face AI...")
        
        try:
            self.is_running = False
            
            # Stop voice interface
            if self.voice_interface:
                await self.voice_interface.stop_voice_mode()
            
            # Stop agent monitoring
            if self.agent_connector:
                await self.agent_connector.stop_monitoring()
            
            # Stop WebSocket server
            if self.websocket_handler:
                await self.websocket_handler.stop_server()
            
            logger.info("Cyber Face AI stopped")
            
        except Exception as e:
            logger.error(f"Error stopping Cyber Face AI: {e}")
    
    async def process_video_frame(self, frame_data: bytes) -> dict:
        """Process a video frame for emotion detection"""
        if self.processing_frame:
            return {"status": "busy"}
        
        self.processing_frame = True
        
        try:
            # Convert frame data to numpy array (placeholder)
            # In real implementation, this would decode the image
            import numpy as np
            
            # Detect faces
            faces = await self.face_detector.detect_faces(np.array([]))
            
            if not faces:
                return {"status": "no_face"}
            
            # Use first detected face
            face = faces[0]
            
            # Detect emotions
            emotion_result = await self.emotion_detector.detect_emotions(np.array([]), face)
            
            # Track attention
            attention_metrics = await self.attention_tracker.track_attention(face)
            
            # Update avatar expression
            expression = self.avatar_animator.expression_mapper.map_emotion_to_expression(emotion_result)
            await self.avatar_animator.update_expression(expression, emotion_result.confidence)
            
            # Send updates to dashboard
            await self.dashboard_connector.update_emotion_display(emotion_result)
            await self.dashboard_connector.update_avatar_state(self.avatar_animator.current_state)
            
            return {
                "status": "success",
                "emotion": {
                    "primary": emotion_result.primary_emotion,
                    "confidence": emotion_result.confidence,
                    "all_emotions": emotion_result.all_emotions
                },
                "attention": {
                    "focus_level": attention_metrics.focus_level,
                    "gaze_direction": attention_metrics.gaze_direction
                },
                "avatar_state": {
                    "expression": self.avatar_animator.current_state.expression.value,
                    "intensity": self.avatar_animator.current_state.expression_intensity
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing video frame: {e}")
            return {"status": "error", "message": str(e)}
        
        finally:
            self.processing_frame = False
    
    async def _handle_voice_command(self, command):
        """Handle voice commands"""
        logger.info(f"Voice command received: {command.command}")
        
        # Update avatar to listening state
        await self.avatar_animator.set_listening_state(True)
        
        # Execute command based on intent
        if command.intent == 'navigate_dashboard':
            # Send navigation action to dashboard
            await self.dashboard_connector.websocket_handler.broadcast_message(
                WebSocketMessage(
                    type=MessageType.USER_INTERACTION,
                    data={'action': 'navigate', 'target': '/dashboard'},
                    timestamp=asyncio.get_event_loop().time(),
                    session_id='voice_command'
                )
            )
        
        # Return to normal state
        await self.avatar_animator.set_listening_state(False)
    
    async def _handle_voice_conversation(self, transcript: str):
        """Handle voice conversation"""
        logger.info(f"Voice conversation: {transcript}")
        
        try:
            # Create conversation context
            if not self.current_session:
                self.current_session = ConversationContext(
                    user_id="voice_user",
                    session_id="voice_session",
                    conversation_history=[]
                )
            
            # Add user message to history
            self.current_session.conversation_history.append({
                "role": "user",
                "content": transcript
            })
            
            # Generate AI response
            response = await self.conversation_engine.generate_response(
                transcript,
                self.current_session
            )
            
            # Add AI response to history
            self.current_session.conversation_history.append({
                "role": "assistant", 
                "content": response.text
            })
            
            # Update avatar to speaking state
            await self.avatar_animator.set_speaking_state(True)
            
            # Speak the response
            await self.voice_interface.speak_response(response.text)
            
            # Send response to dashboard
            await self.dashboard_connector.send_ai_response(response)
            
            # Return to normal state
            await self.avatar_animator.set_speaking_state(False)
            
        except Exception as e:
            logger.error(f"Error handling voice conversation: {e}")
    
    def get_status(self) -> dict:
        """Get current system status"""
        return {
            "initialized": self.initialized,
            "running": self.is_running,
            "processing_frame": self.processing_frame,
            "components": {
                "face_detector": self.face_detector is not None,
                "emotion_detector": self.emotion_detector is not None,
                "conversation_engine": self.conversation_engine is not None,
                "voice_interface": self.voice_interface is not None,
                "avatar_renderer": self.avatar_renderer is not None,
                "websocket_handler": self.websocket_handler is not None
            },
            "websocket_stats": self.websocket_handler.get_stats() if self.websocket_handler else {},
            "avatar_performance": self.avatar_renderer.get_performance_stats() if self.avatar_renderer else {}
        }

# Global application instance
app_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan handler"""
    global app_instance
    
    # Startup
    app_instance = CyberFaceApplication(config)
    await app_instance.start()
    
    yield
    
    # Shutdown
    if app_instance:
        await app_instance.stop()

# Create FastAPI application
app = FastAPI(
    title="Cyber Face AI",
    description="Advanced AI-powered facial interface for Predator Analytics",
    version="1.0.0",
    lifespan=lifespan
)

# Serve static files
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    """Root endpoint"""
    return HTMLResponse("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cyber Face AI</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .status { background: #f0f8ff; padding: 20px; border-radius: 8px; }
            .error { background: #ffe4e1; }
            .success { background: #f0fff0; }
        </style>
    </head>
    <body>
        <h1>🤖 Cyber Face AI</h1>
        <div class="status success">
            <h2>System Status: Online</h2>
            <p>Advanced AI-powered facial interface for Predator Analytics platform.</p>
            <ul>
                <li>Real-time emotion detection ✅</li>
                <li>Conversational AI interface ✅</li>
                <li>Voice command processing ✅</li>
                <li>3D avatar rendering ✅</li>
                <li>Dashboard integration ✅</li>
            </ul>
        </div>
        
        <h3>API Endpoints:</h3>
        <ul>
            <li><strong>GET /status</strong> - System status</li>
            <li><strong>POST /process-frame</strong> - Process video frame</li>
            <li><strong>WebSocket /ws</strong> - Real-time communication</li>
        </ul>
        
        <h3>WebSocket Connection:</h3>
        <p>Connect to <code>ws://localhost:8001/ws</code> for real-time updates</p>
    </body>
    </html>
    """)

@app.get("/status")
async def get_status():
    """Get system status"""
    global app_instance
    
    if not app_instance:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return app_instance.get_status()

@app.post("/process-frame")
async def process_frame(frame_data: bytes):
    """Process video frame for emotion detection"""
    global app_instance
    
    if not app_instance:
        raise HTTPException(status_code=503, detail="System not initialized")
    
    return await app_instance.process_video_frame(frame_data)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    global app_instance
    
    if not app_instance or not app_instance.websocket_handler:
        await websocket.close(code=1011, reason="System not initialized")
        return
    
    # This would integrate with the WebSocket handler
    # For now, just accept and close
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for testing
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        pass

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": asyncio.get_event_loop().time()}

@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    global app_instance
    
    if not app_instance or not app_instance.initialized:
        raise HTTPException(status_code=503, detail="Not ready")
    
    return {"status": "ready"}

def setup_signal_handlers():
    """Setup signal handlers for graceful shutdown"""
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, shutting down gracefully...")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

async def main():
    """Main entry point for standalone execution"""
    setup_signal_handlers()
    
    logger.info("Starting Cyber Face AI server...")
    
    # Configure uvicorn
    uvicorn_config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=8001,
        log_level=config.log_level.lower(),
        reload=config.debug,
        access_log=True
    )
    
    server = uvicorn.Server(uvicorn_config)
    
    try:
        await server.serve()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
