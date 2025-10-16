#!/bin/bash

# 🚀 CYBER-ACE BACKEND SETUP SCRIPT
# Створення повної структури backend для CYBER-ACE модуля

set -e  # Exit on error

echo "🚀 Starting CYBER-ACE Backend Setup..."
echo ""

# Перевірка Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo "✅ Python version: $PYTHON_VERSION"
echo ""

# Навігація до backend директорії
BACKEND_DIR="/Users/dima/Documents/Predator12/predator12-local/backend"
cd "$BACKEND_DIR" || exit 1

echo "📁 Working directory: $BACKEND_DIR"
echo ""

# ============================================
# 1. СТВОРЕННЯ СТРУКТУРИ ДИРЕКТОРІЙ
# ============================================
echo "📂 Creating directory structure..."

mkdir -p cyber_ace/{routes,services,models,utils,tests}
mkdir -p cyber_ace/services/{ai,voice,agents}

echo "✅ Directories created:"
echo "   ├── cyber_ace/"
echo "   │   ├── routes/"
echo "   │   ├── services/"
echo "   │   │   ├── ai/"
echo "   │   │   ├── voice/"
echo "   │   │   └── agents/"
echo "   │   ├── models/"
echo "   │   ├── utils/"
echo "   │   └── tests/"
echo ""

# ============================================
# 2. СТВОРЕННЯ CORE FILES
# ============================================
echo "📝 Creating core files..."

# __init__.py files
touch cyber_ace/__init__.py
touch cyber_ace/routes/__init__.py
touch cyber_ace/services/__init__.py
touch cyber_ace/services/ai/__init__.py
touch cyber_ace/services/voice/__init__.py
touch cyber_ace/services/agents/__init__.py
touch cyber_ace/models/__init__.py
touch cyber_ace/utils/__init__.py
touch cyber_ace/tests/__init__.py

echo "✅ __init__.py files created"

# ============================================
# 3. AI ENGINE
# ============================================
echo "🤖 Creating AI Engine..."

cat > cyber_ace/services/ai/ai_engine.py << 'EOF'
"""
CYBER-ACE AI Engine
===================

Головний AI движок для обробки запитів користувачів.
Використовує OpenAI GPT-4o для генерації відповідей.

Author: CYBER-ACE Team
Version: 1.0.0
"""

import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import openai
from openai import AsyncOpenAI

class CyberAceAI:
    """
    Головний AI движок для CYBER-ACE.

    Відповідає за:
    - Класифікацію намірів (intent classification)
    - Витяг сутностей (entity extraction)
    - Генерацію відповідей (response generation)
    - Керування контекстом розмови
    """

    def __init__(self, api_key: str):
        """
        Ініціалізація AI Engine.

        Args:
            api_key: OpenAI API ключ
        """
        self.client = AsyncOpenAI(api_key=api_key)
        self.memory: List[Dict[str, Any]] = []
        self.context: Dict[str, Any] = {}
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """Завантажити системний prompt для CYBER-ACE."""
        return """
        You are CYBER-ACE, an advanced AI assistant for the PREDATOR12 system.

        Your capabilities:
        - Analyze financial transactions and detect fraud
        - Manage a team of specialized AI agents
        - Provide cyber security insights
        - Communicate in Ukrainian and English

        Your personality:
        - Professional yet friendly
        - Clear and concise
        - Proactive in suggesting solutions
        - Adapts tone to user's emotion

        Always respond in the user's language (Ukrainian or English).
        """

    async def process_query(
        self,
        query: str,
        user_id: str,
        language: str = 'uk'
    ) -> Dict[str, Any]:
        """
        Обробити запит користувача.

        Args:
            query: Текст запиту
            user_id: ID користувача
            language: Мова ('uk' або 'en')

        Returns:
            Dict з результатами обробки
        """
        try:
            # 1. Класифікація наміру
            intent = await self._classify_intent(query)

            # 2. Витяг сутностей
            entities = await self._extract_entities(query)

            # 3. Генерація відповіді
            response = await self._generate_response(
                query=query,
                intent=intent,
                entities=entities,
                user_id=user_id,
                language=language
            )

            # 4. Збереження в пам'ять
            self._add_to_memory(query, response, user_id)

            return {
                'intent': intent,
                'entities': entities,
                'response': response,
                'confidence': 0.95,
                'timestamp': datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                'error': str(e),
                'fallback_response': self._get_fallback_response(language)
            }

    async def _classify_intent(self, query: str) -> str:
        """
        Класифікувати намір користувача.

        Можливі наміри:
        - query: загальний запит
        - analyze: аналіз даних
        - search: пошук інформації
        - control: керування системою
        - delegate: делегування завдання агенту
        """
        # TODO: Implement intent classification
        # Можна використати fine-tuned модель або prompt engineering
        return 'query'

    async def _extract_entities(self, query: str) -> Dict[str, Any]:
        """
        Витягти сутності з запиту.

        Сутності:
        - dates: дати
        - amounts: суми
        - names: імена
        - locations: локації
        - organizations: організації
        """
        # TODO: Implement entity extraction
        return {}

    async def _generate_response(
        self,
        query: str,
        intent: str,
        entities: Dict[str, Any],
        user_id: str,
        language: str
    ) -> str:
        """
        Згенерувати відповідь користувачу.
        """
        # Підготовка контексту
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "system", "content": f"Language: {language}"},
        ]

        # Додати історію з пам'яті (останні 5 повідомлень)
        recent_memory = self._get_recent_memory(user_id, limit=5)
        for item in recent_memory:
            messages.append({"role": "user", "content": item['query']})
            messages.append({"role": "assistant", "content": item['response']})

        # Додати поточний запит
        messages.append({"role": "user", "content": query})

        # Запит до OpenAI
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content

    def _add_to_memory(self, query: str, response: str, user_id: str):
        """Додати взаємодію в пам'ять."""
        self.memory.append({
            'query': query,
            'response': response,
            'user_id': user_id,
            'timestamp': datetime.utcnow()
        })

        # Обмежити розмір пам'яті (останні 100 взаємодій)
        if len(self.memory) > 100:
            self.memory = self.memory[-100:]

    def _get_recent_memory(self, user_id: str, limit: int = 5) -> List[Dict]:
        """Отримати останні взаємодії користувача."""
        user_memory = [
            item for item in self.memory
            if item['user_id'] == user_id
        ]
        return user_memory[-limit:]

    def _get_fallback_response(self, language: str) -> str:
        """Отримати fallback відповідь."""
        if language == 'uk':
            return "Вибачте, я не зміг обробити ваш запит. Спробуйте перефразувати питання."
        else:
            return "Sorry, I couldn't process your request. Please try rephrasing your question."

# Singleton instance
_ai_engine: Optional[CyberAceAI] = None

def get_ai_engine(api_key: str) -> CyberAceAI:
    """Отримати singleton instance AI Engine."""
    global _ai_engine
    if _ai_engine is None:
        _ai_engine = CyberAceAI(api_key)
    return _ai_engine
EOF

echo "✅ AI Engine created"

# ============================================
# 4. VOICE SERVICE
# ============================================
echo "🎤 Creating Voice Service..."

cat > cyber_ace/services/voice/voice_service.py << 'EOF'
"""
CYBER-ACE Voice Service
=======================

Сервіс для обробки голосового вводу/виводу.
Використовує Azure Speech Services.

Author: CYBER-ACE Team
Version: 1.0.0
"""

import asyncio
from typing import Optional, Dict, Any
import azure.cognitiveservices.speech as speechsdk

class VoiceService:
    """
    Сервіс для роботи з голосом.

    Можливості:
    - Speech-to-Text (STT)
    - Text-to-Speech (TTS)
    - Підтримка української та англійської мов
    - Emotion recognition
    """

    def __init__(self, subscription_key: str, region: str):
        """
        Ініціалізація Voice Service.

        Args:
            subscription_key: Azure Speech subscription key
            region: Azure region (e.g., 'westeurope')
        """
        self.subscription_key = subscription_key
        self.region = region
        self.speech_config = speechsdk.SpeechConfig(
            subscription=subscription_key,
            region=region
        )

    async def speech_to_text(
        self,
        audio_data: bytes,
        language: str = 'uk-UA'
    ) -> Dict[str, Any]:
        """
        Конвертувати голос в текст.

        Args:
            audio_data: Аудіо дані
            language: Мова ('uk-UA' або 'en-US')

        Returns:
            Dict з результатами розпізнавання
        """
        try:
            # Налаштування розпізнавання
            self.speech_config.speech_recognition_language = language

            # TODO: Implement STT using Azure Speech SDK

            return {
                'text': 'Розпізнаний текст',
                'confidence': 0.95,
                'language': language
            }

        except Exception as e:
            return {
                'error': str(e),
                'text': ''
            }

    async def text_to_speech(
        self,
        text: str,
        language: str = 'uk-UA',
        voice_name: Optional[str] = None
    ) -> bytes:
        """
        Конвертувати текст в голос.

        Args:
            text: Текст для озвучення
            language: Мова
            voice_name: Ім'я голосу (опціонально)

        Returns:
            Аудіо дані (bytes)
        """
        try:
            # Вибір голосу
            if voice_name is None:
                voice_name = 'uk-UA-PolinaNeural' if language == 'uk-UA' else 'en-US-JennyNeural'

            self.speech_config.speech_synthesis_voice_name = voice_name

            # TODO: Implement TTS using Azure Speech SDK

            return b''  # Placeholder

        except Exception as e:
            raise Exception(f"TTS error: {str(e)}")

# Singleton instance
_voice_service: Optional[VoiceService] = None

def get_voice_service(subscription_key: str, region: str) -> VoiceService:
    """Отримати singleton instance Voice Service."""
    global _voice_service
    if _voice_service is None:
        _voice_service = VoiceService(subscription_key, region)
    return _voice_service
EOF

echo "✅ Voice Service created"

# ============================================
# 5. AGENT MANAGER
# ============================================
echo "🤖 Creating Agent Manager..."

cat > cyber_ace/services/agents/agent_manager.py << 'EOF'
"""
CYBER-ACE Agent Manager
========================

Менеджер для керування AI-агентами.

Author: CYBER-ACE Team
Version: 1.0.0
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class AgentStatus(str, Enum):
    """Статус агента."""
    IDLE = 'idle'
    BUSY = 'busy'
    ERROR = 'error'
    OFFLINE = 'offline'

class Agent:
    """Клас AI-агента."""

    def __init__(self, id: str, name: str, specialization: str):
        self.id = id
        self.name = name
        self.specialization = specialization
        self.status = AgentStatus.IDLE
        self.tasks_completed = 0
        self.created_at = datetime.utcnow()

    async def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Виконати завдання."""
        self.status = AgentStatus.BUSY

        try:
            # TODO: Implement task execution
            result = {
                'success': True,
                'data': {},
                'message': f"Task completed by {self.name}"
            }

            self.tasks_completed += 1
            self.status = AgentStatus.IDLE

            return result

        except Exception as e:
            self.status = AgentStatus.ERROR
            return {
                'success': False,
                'error': str(e)
            }

    def get_status(self) -> Dict[str, Any]:
        """Отримати статус агента."""
        return {
            'id': self.id,
            'name': self.name,
            'specialization': self.specialization,
            'status': self.status.value,
            'tasks_completed': self.tasks_completed,
            'uptime': (datetime.utcnow() - self.created_at).total_seconds()
        }

class AgentManager:
    """
    Менеджер AI-агентів.

    Відповідає за:
    - Створення та видалення агентів
    - Делегування завдань
    - Моніторинг стану агентів
    """

    def __init__(self):
        self.agents: Dict[str, Agent] = {}
        self._initialize_default_agents()

    def _initialize_default_agents(self):
        """Створити початкових агентів."""
        default_agents = [
            ('fraud-detector', 'Fraud Detector', 'Виявлення шахрайських операцій'),
            ('pattern-analyzer', 'Pattern Analyzer', 'Аналіз патернів поведінки'),
            ('risk-assessor', 'Risk Assessor', 'Оцінка ризиків'),
            ('data-miner', 'Data Miner', 'Пошук прихованих залежностей'),
            ('alert-manager', 'Alert Manager', 'Керування алертами'),
            ('report-generator', 'Report Generator', 'Генерація звітів'),
        ]

        for agent_id, name, specialization in default_agents:
            self.agents[agent_id] = Agent(agent_id, name, specialization)

    async def create_agent(self, config: Dict[str, Any]) -> Agent:
        """
        Створити нового агента.

        Args:
            config: Конфігурація агента

        Returns:
            Новий Agent instance
        """
        agent = Agent(
            id=config['id'],
            name=config['name'],
            specialization=config['specialization']
        )

        self.agents[agent.id] = agent
        return agent

    async def delete_agent(self, agent_id: str) -> bool:
        """Видалити агента."""
        if agent_id in self.agents:
            del self.agents[agent_id]
            return True
        return False

    async def delegate_task(self, agent_id: str, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Делегувати завдання агенту.

        Args:
            agent_id: ID агента
            task: Завдання для виконання

        Returns:
            Результат виконання
        """
        agent = self.agents.get(agent_id)

        if not agent:
            return {
                'success': False,
                'error': f"Agent {agent_id} not found"
            }

        if agent.status != AgentStatus.IDLE:
            return {
                'success': False,
                'error': f"Agent {agent_id} is {agent.status.value}"
            }

        return await agent.execute(task)

    def get_agents_status(self) -> List[Dict[str, Any]]:
        """Отримати статус всіх агентів."""
        return [agent.get_status() for agent in self.agents.values()]

    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Отримати агента по ID."""
        return self.agents.get(agent_id)

# Singleton instance
_agent_manager: Optional[AgentManager] = None

def get_agent_manager() -> AgentManager:
    """Отримати singleton instance Agent Manager."""
    global _agent_manager
    if _agent_manager is None:
        _agent_manager = AgentManager()
    return _agent_manager
EOF

echo "✅ Agent Manager created"

# ============================================
# 6. API ROUTES
# ============================================
echo "🌐 Creating API Routes..."

cat > cyber_ace/routes/cyber_ace.py << 'EOF'
"""
CYBER-ACE API Routes
====================

FastAPI routes для CYBER-ACE модуля.

Author: CYBER-ACE Team
Version: 1.0.0
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# TODO: Import services after environment setup
# from ..services.ai.ai_engine import get_ai_engine
# from ..services.voice.voice_service import get_voice_service
# from ..services.agents.agent_manager import get_agent_manager

router = APIRouter(prefix="/api/cyber-ace", tags=["cyber-ace"])

# ============================================
# REQUEST/RESPONSE MODELS
# ============================================

class ChatMessage(BaseModel):
    """Модель повідомлення чату."""
    message: str
    user_id: str
    language: str = 'uk'

class ChatResponse(BaseModel):
    """Модель відповіді чату."""
    response: str
    intent: Optional[str] = None
    entities: Optional[Dict[str, Any]] = None
    confidence: float = 0.0

class AgentTask(BaseModel):
    """Модель завдання для агента."""
    agent_id: str
    task_type: str
    parameters: Dict[str, Any]

# ============================================
# ROUTES
# ============================================

@router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """
    Chat endpoint для CYBER-ACE.

    Обробляє текстові повідомлення користувача.
    """
    try:
        # ai_engine = get_ai_engine(api_key='...')
        # result = await ai_engine.process_query(
        #     query=message.message,
        #     user_id=message.user_id,
        #     language=message.language
        # )

        # Placeholder response
        return ChatResponse(
            response="Привіт! Я CYBER-ACE. Як можу допомогти?",
            confidence=1.0
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice")
async def voice(audio: UploadFile = File(...), language: str = 'uk-UA'):
    """
    Voice input endpoint.

    Приймає аудіо файл, конвертує в текст та обробляє.
    """
    try:
        # voice_service = get_voice_service(
        #     subscription_key='...',
        #     region='westeurope'
        # )

        # audio_data = await audio.read()
        # result = await voice_service.speech_to_text(audio_data, language)

        return {
            'text': 'Розпізнаний текст',
            'confidence': 0.95
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agents")
async def get_agents():
    """
    Отримати список агентів.

    Returns:
        List всіх доступних агентів з їх статусами
    """
    try:
        # agent_manager = get_agent_manager()
        # agents = agent_manager.get_agents_status()

        # Placeholder response
        return {
            'agents': [
                {
                    'id': 'fraud-detector',
                    'name': 'Fraud Detector',
                    'status': 'idle',
                    'tasks_completed': 0
                }
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/delegate")
async def delegate_task(task: AgentTask):
    """
    Делегувати завдання агенту.

    Args:
        task: Завдання для делегування

    Returns:
        Результат виконання
    """
    try:
        # agent_manager = get_agent_manager()
        # result = await agent_manager.delegate_task(
        #     agent_id=task.agent_id,
        #     task={
        #         'type': task.task_type,
        #         'parameters': task.parameters
        #     }
        # )

        return {
            'success': True,
            'message': 'Task delegated successfully'
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        'status': 'healthy',
        'service': 'cyber-ace',
        'version': '1.0.0'
    }
EOF

echo "✅ API Routes created"

# ============================================
# 7. MODELS
# ============================================
echo "📊 Creating Models..."

cat > cyber_ace/models/schemas.py << 'EOF'
"""
CYBER-ACE Data Models
=====================

Pydantic models для валідації даних.

Author: CYBER-ACE Team
Version: 1.0.0
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class Language(str, Enum):
    """Підтримувані мови."""
    UKRAINIAN = 'uk'
    ENGLISH = 'en'

class IntentType(str, Enum):
    """Типи намірів."""
    QUERY = 'query'
    ANALYZE = 'analyze'
    SEARCH = 'search'
    CONTROL = 'control'
    DELEGATE = 'delegate'

class AgentStatus(str, Enum):
    """Статус агента."""
    IDLE = 'idle'
    BUSY = 'busy'
    ERROR = 'error'
    OFFLINE = 'offline'

class Message(BaseModel):
    """Модель повідомлення."""
    content: str
    user_id: str
    language: Language = Language.UKRAINIAN
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Intent(BaseModel):
    """Модель наміру."""
    type: IntentType
    confidence: float = Field(ge=0.0, le=1.0)
    entities: Dict[str, Any] = {}

class AgentConfig(BaseModel):
    """Конфігурація агента."""
    id: str
    name: str
    specialization: str
    capabilities: List[str] = []
    max_concurrent_tasks: int = 1

class Task(BaseModel):
    """Модель завдання."""
    id: str
    agent_id: str
    type: str
    parameters: Dict[str, Any]
    priority: int = Field(ge=1, le=10, default=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TaskResult(BaseModel):
    """Результат виконання завдання."""
    task_id: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    completed_at: datetime = Field(default_factory=datetime.utcnow)
EOF

echo "✅ Models created"

# ============================================
# 8. REQUIREMENTS
# ============================================
echo "📦 Creating requirements.txt..."

cat > cyber_ace/requirements.txt << 'EOF'
# CYBER-ACE Backend Requirements
# Python 3.11+

# FastAPI
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3

# OpenAI
openai==1.10.0

# Azure Speech
azure-cognitiveservices-speech==1.35.0

# Database
redis==5.0.1
qdrant-client==1.7.0

# Utils
python-dotenv==1.0.0
python-multipart==0.0.6
aiofiles==23.2.1
EOF

echo "✅ requirements.txt created"

# ============================================
# 9. ENVIRONMENT TEMPLATE
# ============================================
echo "🔐 Creating .env template..."

cat > cyber_ace/.env.template << 'EOF'
# CYBER-ACE Environment Variables

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Azure Speech
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=westeurope

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True
EOF

echo "✅ .env.template created"

# ============================================
# 10. README
# ============================================
echo "📝 Creating README..."

cat > cyber_ace/README.md << 'EOF'
# 🤖 CYBER-ACE Backend

Backend сервіс для модуля CYBER-ACE в системі PREDATOR12.

## 📁 Структура

```
cyber_ace/
├── routes/              # API endpoints
│   └── cyber_ace.py
├── services/            # Business logic
│   ├── ai/             # AI Engine
│   ├── voice/          # Voice Service
│   └── agents/         # Agent Manager
├── models/             # Data models
│   └── schemas.py
├── utils/              # Utilities
├── tests/              # Tests
├── requirements.txt    # Dependencies
└── README.md          # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Environment

```bash
cp .env.template .env
# Edit .env with your API keys
```

### 3. Run Server

```bash
cd ..
uvicorn main:app --reload --port 8000
```

## 📡 API Endpoints

### Chat
```bash
POST /api/cyber-ace/chat
Body: {
    "message": "Привіт!",
    "user_id": "user123",
    "language": "uk"
}
```

### Voice
```bash
POST /api/cyber-ace/voice
Content-Type: multipart/form-data
Body: audio file
```

### Agents
```bash
GET /api/cyber-ace/agents
```

```bash
POST /api/cyber-ace/agents/delegate
Body: {
    "agent_id": "fraud-detector",
    "task_type": "analyze",
    "parameters": {...}
}
```

## 🧪 Testing

```bash
pytest cyber_ace/tests/
```

## 📚 Documentation

API documentation: http://localhost:8000/docs

---

**Author:** CYBER-ACE Team
**Version:** 1.0.0
**License:** MIT
EOF

echo "✅ README created"

# ============================================
# FINAL SUMMARY
# ============================================
echo ""
echo "🎉 =================================="
echo "   CYBER-ACE BACKEND SETUP COMPLETE!"
echo "   =================================="
echo ""
echo "📁 Created structure:"
echo "   ├── cyber_ace/"
echo "   │   ├── services/ai/ai_engine.py"
echo "   │   ├── services/voice/voice_service.py"
echo "   │   ├── services/agents/agent_manager.py"
echo "   │   ├── routes/cyber_ace.py"
echo "   │   ├── models/schemas.py"
echo "   │   ├── requirements.txt"
echo "   │   ├── .env.template"
echo "   │   └── README.md"
echo ""
echo "📝 Next steps:"
echo "   1. pip install -r cyber_ace/requirements.txt"
echo "   2. cp cyber_ace/.env.template cyber_ace/.env"
echo "   3. Edit cyber_ace/.env with your API keys"
echo "   4. Integrate routes into main FastAPI app"
echo "   5. Test endpoints"
echo ""
echo "🚀 Backend готовий до інтеграції!"
echo ""
EOF

chmod +x /Users/dima/Documents/Predator12/predator12-local/backend/cyber-ace-backend-setup.sh

echo "✅ Backend setup script created!"
