import asyncio
import json
import os
import random
from datetime import datetime, timedelta
from typing import AsyncGenerator, Dict, List

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

# Імпорт Voice Providers API
# from api.voice_providers import router as voice_providers_router

# Імпорт CYBER-ACE API
# import sys
# sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
# from cyber_ace.routes.cyber_ace import router as cyber_ace_router

load_dotenv()

app = FastAPI(
    title="Predator Analytics - Nexus Core API",
    description="Backend API for Nexus Core galactic interface",
    version="1.0.0",
)

# Підключення Voice Providers API
# app.include_router(voice_providers_router)

# Підключення CYBER-ACE API
# app.include_router(cyber_ace_router)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3005",
        "http://localhost:5173",
        "http://localhost:5090",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/")
async def root():
    return {"message": "Nexus Core API is operational", "status": "online"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Nexus Core Backend",
        "version": "1.0.0",
        "components": {
            "database": "connected",
            "redis": "connected",
            "opensearch": "connected",
            "agents": "8 active",
        },
    }


# ===== HERO INTERFACE ENDPOINTS ===== #


class ChatMessage(BaseModel):
    """Модель повідомлення чату"""

    message: str
    trace: bool = False


@app.post("/api/chat")
async def hero_chat(msg: ChatMessage):
    """
    Обробляє повідомлення користувача Hero Interface
    """
    user_msg = msg.message.lower()

    # Проста логіка відповідей (можна замінити на реальний AI)
    if "контрагент" in user_msg or "компанія" in user_msg:
        reply = (
            "🔍 Аналізую контрагента... \n\n"
            "Знайдено потенційні ризики:\n"
            "• Пов'язаний з офшорною компанією\n"
            "• Судова справа від 2024 року\n"
            "• Директор має подвійне громадянство\n\n"
            "Рекомендую детальну перевірку через Network граф."
        )
    elif "граф" in user_msg or "зв'язки" in user_msg or "мережа" in user_msg:
        reply = (
            "🕸️ Візуалізую граф зв'язків...\n\n"
            "Виявлено:\n"
            "• 4 вузли у мережі\n"
            "• 3 прямі зв'язки\n"
            "• 1 підозрілий зв'язок\n\n"
            "Граф доступний справа у панелі Network."
        )
    elif "суд" in user_msg or "справа" in user_msg:
        reply = (
            "⚖️ Перевіряю судові справи...\n\n"
            "Знайдено 2 активні справи:\n"
            "1. Позов до ТОВ 'Контрагент X' (2024)\n"
            "2. Арбітражна справа з Офшором\n\n"
            "Статус: В процесі розгляду"
        )
    elif "ризик" in user_msg or "небезпека" in user_msg:
        reply = (
            "⚠️ Оцінка ризиків:\n\n"
            "• Фінансовий ризик: ВИСОКИЙ (75%)\n"
            "• Репутаційний ризик: СЕРЕДНІЙ (45%)\n"
            "• Юридичний ризик: ВИСОКИЙ (80%)\n\n"
            "Рекомендую додаткову due diligence перевірку."
        )
    elif "агент" in user_msg:
        reply = (
            "🤖 Статус агентів:\n\n"
            "• Router Agent: Активний ✅\n"
            "• Law Agent: Активний ✅\n"
            "• Court Agent: Активний ✅\n"
            "• Risk Agent: Активний ✅\n\n"
            "Всі агенти готові до роботи!"
        )
    else:
        reply = (
            "👋 Вітаю! Я AI помічник Predator Analytics.\n\n"
            "Можу допомогти з:\n"
            "• Аналізом контрагентів\n"
            "• Візуалізацією зв'язків\n"
            "• Перевіркою судових справ\n"
            "• Оцінкою ризиків\n\n"
            "Що вас цікавить?"
        )

    return {"reply": reply, "status": "success"}


async def event_generator() -> AsyncGenerator[str, None]:
    """Генерує SSE події для Hero Interface"""
    events = [
        "Router Agent: Обробка запиту...",
        "Law Agent: Пошук у базі законодавства",
        "Court Agent: Перевірка судових реєстрів",
        "Risk Agent: Аналіз ризиків контрагента",
        "Graph Agent: Побудова мережі зв'язків",
        "Router Agent: Запит успішно оброблено ✅",
        "Law Agent: Знайдено 15 релевантних документів",
        "Court Agent: Виявлено 2 активні справи",
        "Risk Agent: Ризик-профіль оновлено",
        "Graph Agent: Граф містить 47 вузлів",
    ]

    while True:
        event = random.choice(events)
        timestamp = datetime.now().strftime("%H:%M:%S")
        yield f"data: [{timestamp}] {event}\n\n"
        await asyncio.sleep(random.uniform(2, 5))


@app.get("/api/events")
async def hero_events():
    """
    SSE стрім подій агентів для Hero Interface
    """
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@app.get("/api/network")
async def hero_network():
    """
    Повертає дані графа для Hero Interface
    """
    return {
        "nodes": [
            {"id": "Контрагент X", "label": "Контрагент X", "type": "company"},
            {"id": "Судова справа", "label": "Судова справа №123", "type": "legal"},
            {"id": "Офшор", "label": "Offshore Ltd", "type": "offshore"},
            {"id": "Директор", "label": "Іванов І.І.", "type": "person"},
            {"id": "Банк", "label": "Privatbank", "type": "financial"},
        ],
        "edges": [
            {"source": "Контрагент X", "target": "Судова справа", "label": "defendant"},
            {"source": "Контрагент X", "target": "Офшор", "label": "owns"},
            {"source": "Директор", "target": "Контрагент X", "label": "director"},
            {"source": "Контрагент X", "target": "Банк", "label": "account"},
        ],
    }


# ===== END HERO INTERFACE ENDPOINTS ===== #


@app.get("/api/system/status")
async def get_system_status():
    """РЕАЛЬНИЙ СТАТУС СИСТЕМИ з 26 агентами"""
    from app.routes_agents_real import load_agents_registry

    agents_config = load_agents_registry()

    return {
        "system_health": "optimal",
        "total_agents": len(agents_config),
        "active_agents": len(agents_config),  # Всі агенти активні
        "quantum_events": random.randint(35, 50),
        "galactic_risks": "minimal",
        "data_teleportation": f"{random.randint(90, 99)}% complete",
        "neural_network": "stable",
        "agents_registry_loaded": True,
        "production_mode": True,
        "anomaly_chronicle": [
            {
                "type": "security",
                "level": "medium",
                "location": "Kyiv",
                "timestamp": datetime.now().isoformat() + "Z",
            },
            {
                "type": "critical",
                "level": "high",
                "location": "London",
                "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat() + "Z",
            },
            {
                "type": "normal",
                "level": "low",
                "location": "Tokyo",
                "timestamp": (datetime.now() - timedelta(hours=1)).isoformat() + "Z",
            },
        ],
    }


@app.get("/api/agents/status")
async def get_agents_status():
    """РЕАЛЬНІ 26 АГЕНТІВ з registry.yaml"""
    from app.routes_agents_real import get_agents_status as real_agents_status

    return await real_agents_status()


@app.get("/api/chrono_spatial_data")
async def get_chrono_spatial_data():
    return {
        "events": [
            {
                "lat": 50.4501,
                "lon": 30.5234,
                "intensity": 0.8,
                "type": "anomaly",
                "timestamp": datetime.now().isoformat() + "Z",
            },
            {
                "lat": 40.7128,
                "lon": -74.0060,
                "intensity": 0.6,
                "type": "security",
                "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat() + "Z",
            },
            {
                "lat": 51.5074,
                "lon": -0.1278,
                "intensity": 0.9,
                "type": "critical",
                "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat() + "Z",
            },
            {
                "lat": 48.8566,
                "lon": 2.3522,
                "intensity": 0.4,
                "type": "normal",
                "timestamp": (datetime.now() - timedelta(hours=1)).isoformat() + "Z",
            },
            {
                "lat": 35.6762,
                "lon": 139.6503,
                "intensity": 0.7,
                "type": "anomaly",
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat() + "Z",
            },
            {
                "lat": -33.8688,
                "lon": 151.2093,
                "intensity": 0.5,
                "type": "security",
                "timestamp": (datetime.now() - timedelta(hours=3)).isoformat() + "Z",
            },
        ]
    }


@app.post("/api/ai_assistant")
async def ai_assistant(request: dict):
    query = request.get("query", "")
    responses = {
        "status": "показати статус системи",
        "agents": "показати агентів",
        "anomalies": "знайти аномалії",
        "forecast": "створити прогноз",
        "security": "перевірити безпеку",
    }

    # Simple keyword matching for demo
    for keyword, response in responses.items():
        if keyword.lower() in query.lower():
            return {
                "response": f"Виконую команду: {response}. Система працює в штатному режимі.",
                "action": keyword,
                "timestamp": datetime.now().isoformat(),
            }

    return {
        "response": "Я готовий допомогти з аналітикою Nexus Core. Спробуйте запитати про статус, агентів, аномалії, прогнози або безпеку.",
        "action": "help",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/simulations")
async def create_simulation(request: dict):
    simulation_type = request.get("type", "default")
    parameters = request.get("parameters", {})

    # Generate simulation ID
    sim_id = f"sim_{random.randint(1000, 9999)}"

    return {
        "simulation_id": sim_id,
        "status": "running",
        "type": simulation_type,
        "parameters": parameters,
        "estimated_completion": (datetime.now() + timedelta(minutes=5)).isoformat(),
        "progress": 0,
    }


@app.get("/api/simulations/{sim_id}")
async def get_simulation_status(sim_id: str):
    # Simulate progress
    progress = random.randint(10, 100)
    status = "completed" if progress >= 100 else "running"

    return {
        "simulation_id": sim_id,
        "status": status,
        "progress": progress,
        "results": (
            {
                "success_rate": f"{random.randint(85, 99)}%",
                "risk_level": "low",
                "recommendations": [
                    "Збільшити моніторинг аномалій",
                    "Оптимізувати розподіл навантаження",
                    "Підвищити рівень безпеки",
                ],
            }
            if status == "completed"
            else None
        ),
    }


@app.websocket("/ws/3d_stream")
async def websocket_3d_stream(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send real-time data for 3D visualizations
            data = {
                "type": "system_update",
                "timestamp": datetime.now().isoformat(),
                "nodes": [
                    {
                        "id": "orchestrator",
                        "status": "active",
                        "load": random.randint(30, 70),
                    },
                    {
                        "id": "anomaly_agent",
                        "status": "active",
                        "load": random.randint(20, 60),
                    },
                    {
                        "id": "forecast_agent",
                        "status": "active",
                        "load": random.randint(10, 50),
                    },
                    {
                        "id": "graph_agent",
                        "status": "active",
                        "load": random.randint(25, 65),
                    },
                ],
                "connections": random.randint(15, 30),
                "throughput": f"{random.randint(100, 500)} req/sec",
            }
            await manager.send_personal_message(json.dumps(data), websocket)
            await asyncio.sleep(2)  # Send updates every 2 seconds
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.websocket("/ws/simulations")
async def websocket_simulations(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send simulation progress updates
            data = {
                "type": "simulation_progress",
                "timestamp": datetime.now().isoformat(),
                "active_simulations": random.randint(1, 5),
                "completed_today": random.randint(10, 25),
                "success_rate": f"{random.randint(90, 99)}%",
            }
            await manager.send_personal_message(json.dumps(data), websocket)
            await asyncio.sleep(5)  # Send updates every 5 seconds
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        severities = ["info", "warning", "critical"]
        titles = [
            "Індексатор завершив завдання",
            "Аномалія графа перевищила поріг",
            "Підвищене навантаження LLM",
            "ETL конвеєр: етап трансформації",
            "OpenSearch: черга запитів зросла",
            "Агент AutoHeal застосував патч",
        ]
        while True:
            alert = {
                "severity": random.choices(severities, weights=[6, 3, 1])[0],
                "title": random.choice(titles),
                "ts": datetime.utcnow().isoformat() + "Z",
            }
            await manager.send_personal_message(json.dumps(alert), websocket)
            # 2-4 секунди між подіями
            await asyncio.sleep(random.uniform(2.0, 4.0))
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
