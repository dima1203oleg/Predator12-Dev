# 🤖 Cyber Face AI

Advanced AI-powered facial interface for Predator Analytics platform.

## Overview

Cyber Face AI is a sophisticated real-time emotion detection and conversational AI system that provides an interactive 3D avatar interface for the Predator Analytics Command Center. It combines computer vision, natural language processing, and voice interaction to create an intuitive and engaging user experience.

## Features

### 🎯 Core Capabilities
- **Real-time Emotion Detection** - Advanced facial emotion recognition using multiple ML models
- **Conversational AI** - Multi-LLM powered chat with GPT-4, Claude, and local models
- **Voice Interface** - Speech recognition and text-to-speech with wake word detection
- **3D Avatar** - Animated avatar that reflects user emotions and system states
- **Dashboard Integration** - Seamless integration with Predator Analytics Command Center

### 🧠 AI Components
- **Emotion Analysis** - 10 emotion types with confidence scoring and temporal smoothing
- **Attention Tracking** - Focus level, gaze direction, and fatigue monitoring
- **Intent Classification** - Natural language understanding for voice commands
- **Personality Management** - Adaptive AI personality (professional, friendly, analytical)
- **Model Selection** - Intelligent routing between different LLM providers

### 🎨 Avatar System
- **3D Rendering** - WebGL-based avatar with facial expressions
- **Expression Mapping** - Emotion-to-blend-shape mapping system
- **Animation Engine** - Smooth transitions and realistic movements
- **Voice Sync** - Lip-sync and speaking animations
- **Customization** - Multiple avatar themes and appearance options

## Architecture

```
Cyber Face AI
├── Computer Vision Pipeline
│   ├── Face Detection (MediaPipe/OpenCV)
│   ├── Emotion Recognition (TensorFlow/PyTorch)
│   └── Attention Tracking (Gaze/Blink detection)
├── AI Processing Layer
│   ├── Conversation Engine (GPT-4/Claude/Local)
│   ├── Intent Classifier
│   └── Personality Manager
├── Voice Interface
│   ├── Speech Recognition (Web Speech/Azure/Google)
│   ├── Text-to-Speech (Neural voices)
│   └── Wake Word Detection
├── Avatar System
│   ├── 3D Renderer (Three.js compatible)
│   ├── Expression Mapper
│   └── Animation Engine
└── Integration Layer
    ├── WebSocket Server
    ├── Dashboard Connector
    └── Agent System Interface
```

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend components)
- WebGL-compatible browser
- Camera access for emotion detection

### Dependencies Installation

```bash
# Install Python dependencies
pip install -r requirements.txt

# For development with GPU acceleration
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### Key Dependencies
- **Computer Vision**: opencv-python, mediapipe, tensorflow
- **AI/ML**: openai, anthropic, transformers, torch
- **Web Framework**: fastapi, uvicorn, websockets
- **Audio**: speechrecognition, pyttsx3
- **3D Graphics**: Three.js (frontend)

## Quick Start

### 1. Basic Setup

```bash
# Clone and navigate to project
cd predator12-local

# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional)
export CYBER_FACE_ENV=development
export CYBER_FACE_DEBUG=true
export OPENAI_API_KEY=your_key_here
export ANTHROPIC_API_KEY=your_key_here
```

### 2. Start Cyber Face AI

```bash
# Using the startup script
python start_cyber_face.py

# Or directly
python -m cyber_face.main

# Or with uvicorn
uvicorn cyber_face.main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Access the Interface

- **Web Interface**: http://localhost:8001
- **WebSocket**: ws://localhost:8001/ws
- **Health Check**: http://localhost:8001/health
- **API Status**: http://localhost:8001/status

## Configuration

### Environment Variables

```bash
# Core Settings
CYBER_FACE_ENV=development          # development/production
CYBER_FACE_DEBUG=true              # Enable debug mode
CYBER_FACE_LOG_LEVEL=INFO          # Logging level

# WebSocket Configuration
CYBER_FACE_WS_HOST=0.0.0.0         # WebSocket host
CYBER_FACE_WS_PORT=8002            # WebSocket port

# AI Provider Keys
OPENAI_API_KEY=your_openai_key     # OpenAI GPT models
ANTHROPIC_API_KEY=your_claude_key  # Anthropic Claude models
AZURE_SPEECH_KEY=your_azure_key    # Azure Speech Services
ELEVENLABS_KEY=your_elevenlabs_key # ElevenLabs Voice

# Performance Settings
CYBER_FACE_MAX_MEMORY=2048         # Max memory usage (MB)
CYBER_FACE_MAX_CPU=0.25           # Max CPU usage (0.0-1.0)
CYBER_FACE_ENABLE_GPU=true        # Enable GPU acceleration
```

### Configuration File

Create `cyber_face_config.yaml`:

```yaml
# Emotion Detection Settings
emotion:
  confidence_threshold: 0.75
  smoothing_window: 5
  update_frequency: 30
  emotions:
    - neutral
    - happy
    - sad
    - angry
    - surprised
    - fearful
    - disgusted
    - focused
    - confused
    - stressed

# Voice Interface Settings
voice:
  languages: ["en-US", "uk-UA", "ru-RU"]
  wake_words: ["hey cyber", "predator", "assistant"]
  confidence_threshold: 0.8
  response_timeout: 3.0

# AI Personality Settings
personality:
  tone: "professional"        # professional/friendly/analytical
  response_style: "concise"   # concise/conversational/detailed
  proactivity: "medium"       # low/medium/high
  emotional_range: "neutral"  # neutral/positive/focused

# Avatar Settings
avatar:
  model_path: "models/base_avatar.gltf"
  render_quality: "medium"    # low/medium/high
  animation_speed: 1.0
  enable_physics: false
```

## API Reference

### REST Endpoints

#### GET /status
Get system status and component health.

**Response:**
```json
{
  "initialized": true,
  "running": true,
  "processing_frame": false,
  "components": {
    "face_detector": true,
    "emotion_detector": true,
    "conversation_engine": true,
    "voice_interface": true,
    "avatar_renderer": true
  },
  "websocket_stats": {
    "active_connections": 5,
    "total_connections": 12,
    "total_messages": 1547
  }
}
```

#### POST /process-frame
Process video frame for emotion detection.

**Request:**
```bash
curl -X POST "http://localhost:8001/process-frame" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @frame.jpg
```

**Response:**
```json
{
  "status": "success",
  "emotion": {
    "primary": "happy",
    "confidence": 0.85,
    "all_emotions": {
      "happy": 0.85,
      "neutral": 0.12,
      "surprised": 0.03
    }
  },
  "attention": {
    "focus_level": 0.92,
    "gaze_direction": [0.1, -0.05]
  },
  "avatar_state": {
    "expression": "happy",
    "intensity": 0.85
  }
}
```

### WebSocket Protocol

#### Connection
```javascript
const ws = new WebSocket('ws://localhost:8001/ws');
```

#### Message Types

**Emotion Updates:**
```json
{
  "type": "emotion_update",
  "data": {
    "primary_emotion": "focused",
    "confidence": 0.78,
    "all_emotions": {"focused": 0.78, "neutral": 0.22},
    "timestamp": 1703123456.789
  },
  "timestamp": 1703123456.789,
  "session_id": "session_123"
}
```

**Voice Commands:**
```json
{
  "type": "voice_command",
  "data": {
    "command": "show_dashboard",
    "confidence": 0.92,
    "intent": "navigate_dashboard",
    "raw_transcript": "show me the dashboard"
  },
  "timestamp": 1703123456.789,
  "session_id": "session_123"
}
```

**AI Responses:**
```json
{
  "type": "ai_response",
  "data": {
    "text": "I'll show you the dashboard right away.",
    "intent": {"name": "navigate_dashboard", "confidence": 0.95},
    "actions": [{"type": "navigate", "target": "/dashboard"}],
    "suggestions": ["View metrics", "Check agents"],
    "model_used": "gpt-4"
  },
  "timestamp": 1703123456.789,
  "session_id": "session_123"
}
```

## Development

### Project Structure

```
cyber_face/
├── __init__.py              # Module initialization
├── main.py                  # FastAPI application
├── config/
│   └── __init__.py         # Configuration management
├── vision/
│   └── __init__.py         # Computer vision components
├── ai/
│   └── __init__.py         # AI and conversation engine
├── voice/
│   └── __init__.py         # Voice interface
├── avatar/
│   └── __init__.py         # 3D avatar system
└── integration/
    └── __init__.py         # WebSocket and dashboard integration
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov

# Run tests
pytest cyber_face/tests/

# Run with coverage
pytest --cov=cyber_face cyber_face/tests/
```

### Development Mode

```bash
# Start with auto-reload
uvicorn cyber_face.main:app --reload --host 0.0.0.0 --port 8001

# Start with debug logging
CYBER_FACE_LOG_LEVEL=DEBUG python start_cyber_face.py
```

## Integration with Command Center

### Frontend Integration

Add Cyber Face widget to your React/Vue application:

```typescript
import { CyberFaceWidget } from '@predator/cyber-face-ui';

function CommandCenter() {
  return (
    <div className="command-center">
      <CyberFaceWidget
        websocketUrl="ws://localhost:8001/ws"
        emotionTracking={true}
        voiceEnabled={true}
        personality="professional"
        onInteraction={handleCyberFaceInteraction}
      />
      {/* Rest of dashboard */}
    </div>
  );
}
```

### Backend Integration

Connect to agent monitoring system:

```python
from cyber_face.integration import AgentConnector

# In your agent supervisor
agent_connector = AgentConnector(dashboard_connector)
await agent_connector.start_monitoring()

# Send agent status updates
await agent_connector.update_agent_status({
    'agent_id': 'agent_001',
    'status': 'healthy',
    'performance': 0.95,
    'last_update': datetime.now().isoformat()
})
```

## Performance Optimization

### System Requirements

**Minimum:**
- CPU: 4 cores, 2.5 GHz
- RAM: 8 GB
- GPU: Integrated graphics
- Network: 100 Mbps

**Recommended:**
- CPU: 8 cores, 3.0 GHz+
- RAM: 16 GB+
- GPU: Dedicated GPU with 4+ GB VRAM
- Network: 1 Gbps+

### Performance Tuning

```python
# Optimize for production
config = CyberFaceConfig(
    emotion=EmotionConfig(
        update_frequency=15,  # Reduce FPS for less CPU usage
        smoothing_window=3    # Smaller window for faster response
    ),
    avatar=AvatarConfig(
        render_quality="medium",  # Balance quality vs performance
        enable_physics=False      # Disable for better performance
    ),
    max_memory_usage=1024,       # Limit memory usage
    max_cpu_usage=0.20          # Limit CPU usage to 20%
)
```

## Troubleshooting

### Common Issues

#### Camera Access Denied
```bash
# Check camera permissions in browser
# Ensure HTTPS or localhost for camera access
# For development, use --allow-insecure-localhost flag
```

#### WebSocket Connection Failed
```bash
# Check if port 8001 is available
lsof -i :8001

# Verify firewall settings
# Check WebSocket server status in logs
```

#### Emotion Detection Not Working
```bash
# Verify camera feed
# Check face detection model loading
# Ensure adequate lighting conditions
# Review emotion detection logs
```

#### Voice Recognition Issues
```bash
# Check microphone permissions
# Verify audio input device
# Test speech recognition provider
# Check wake word sensitivity settings
```

### Debug Mode

Enable comprehensive debugging:

```bash
export CYBER_FACE_DEBUG=true
export CYBER_FACE_LOG_LEVEL=DEBUG
python start_cyber_face.py
```

### Performance Monitoring

Monitor system performance:

```bash
# Check resource usage
curl http://localhost:8001/status

# WebSocket connection stats
# Check emotion detection FPS
# Monitor AI response times
```

## Production Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx libglib2.0-0 libsm6 \
    libxext6 libxrender-dev libgomp1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY cyber_face/ /app/cyber_face/
WORKDIR /app

# Expose ports
EXPOSE 8001 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s \
  CMD curl -f http://localhost:8001/health || exit 1

# Start application
CMD ["uvicorn", "cyber_face.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cyber-face-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cyber-face-ai
  template:
    spec:
      containers:
      - name: cyber-face
        image: predator/cyber-face:v1.0.0
        ports:
        - containerPort: 8001
        - containerPort: 8002
        env:
        - name: CYBER_FACE_ENV
          value: "production"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
```

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/predator-analytics/predator12.git
cd predator12/predator12-local

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install development dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install
```

### Code Style

```bash
# Format code
black cyber_face/
isort cyber_face/

# Type checking
mypy cyber_face/

# Linting
flake8 cyber_face/
```

### Testing

```bash
# Run all tests
pytest

# Run specific test module
pytest cyber_face/tests/test_emotion_detection.py

# Run with coverage
pytest --cov=cyber_face --cov-report=html
```

## License

Copyright (c) 2024 Predator Analytics. All rights reserved.

## Support

For technical support and questions:
- **Documentation**: https://docs.predator-analytics.com/cyber-face
- **Issues**: https://github.com/predator-analytics/predator12/issues
- **Discord**: https://discord.gg/predator-analytics
- **Email**: support@predator-analytics.com

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Compatibility:** Python 3.11+, Node.js 18+
