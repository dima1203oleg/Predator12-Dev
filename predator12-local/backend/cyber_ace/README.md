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
