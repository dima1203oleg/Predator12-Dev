import asyncio
import random
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Response
from ..models.social_media_models import (
    RegionSentiment, SentimentUpdateMessage
)

router = APIRouter(
    prefix="/ws",
    tags=["WebSockets"],
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_json(self, data: dict):
        for connection in self.active_connections:
            await connection.send_json(data)


manager = ConnectionManager()

# Create a separate manager for notifications
notification_manager = ConnectionManager()

# Mock data for regions
MOCK_REGIONS = [
    {"id": "USA_CA", "name": "California, USA"},
    {"id": "EU_DE", "name": "Germany, EU"},
    {"id": "AS_JP", "name": "Japan, Asia"},
    {"id": "USA_NY", "name": "New York, USA"},
    {"id": "EU_FR", "name": "France, EU"},
    {"id": "AS_CN", "name": "China, Asia"},
]

MOCK_TOPICS = [
    "economy", "politics", "technology", "healthcare", "environment"
]

# Mock notification types and messages
NOTIFICATION_TYPES = [
    {"severity": "info", "prefix": "Інформація", "messages": [
        "Оновлення даних було успішно завершено",
        "Завантаження нових даних завершено",
        "Користувач {user} приєднався до системи",
        "Модуль аналітики запущено"
    ]},
    {"severity": "success", "prefix": "Успіх", "messages": [
        "Аналіз успішно завершено",
        "Схема виявлена успішно",
        "Резервне копіювання завершено",
        "Оновлення безпеки встановлено"
    ]},
    {"severity": "warning", "prefix": "Увага", "messages": [
        "Виявлено аномалію в даних",
        "Високе навантаження на систему",
        "Затримка в оновленні даних",
        "Низький рівень диску для сховища"
    ]},
    {"severity": "error", "prefix": "Помилка", "messages": [
        "Помилка з'єднання з базою даних",
        "Збій в аналізі даних",
        "Помилка синхронізації",
        "Відсутній доступ до API"
    ]},
    {"severity": "critical", "prefix": "Критично", "messages": [
        "Критичне навантаження на сервер",
        "Виявлено порушення безпеки",
        "Відмова бази даних",
        "Потенційна втрата даних"
    ]}
]

MOCK_USERS = ["admin", "analyst1", "dataOps", "securityTeam"]
MOCK_MODULES = ["DataParser", "ModelTrainer", "SecurityScanner", "NetworkAnalyzer"]

async def generate_mock_sentiment_update() -> SentimentUpdateMessage:
    region_sentiments = []
    for region_info in MOCK_REGIONS:
        score = round(random.uniform(-1.0, 1.0), 2)
        trend_options = ["improving", "declining", "stable"]
        trend = random.choice(trend_options)
        num_topics = random.randint(1, 3)
        topics = random.sample(MOCK_TOPICS, num_topics)
        
        region_sentiments.append(
            RegionSentiment(
                region_id=region_info["id"],
                sentiment_score=score,
                trend=trend,
                key_topics_contributing=topics
            )
        )
    return SentimentUpdateMessage(
        timestamp=datetime.now(timezone.utc).isoformat(),
        region_sentiments=region_sentiments
    )

async def generate_mock_notification():
    """Generate a mock notification for testing purposes"""
    
    # Randomly select notification type
    notification_type = random.choice(NOTIFICATION_TYPES)
    severity = notification_type["severity"]
    prefix = notification_type["prefix"]
    
    # Select a random message for this type
    message_template = random.choice(notification_type["messages"])
    
    # Replace placeholders
    message = message_template.format(
        user=random.choice(MOCK_USERS),
        module=random.choice(MOCK_MODULES),
        time=datetime.now().strftime("%H:%M"),
        date=datetime.now().strftime("%d.%m.%Y")
    )
    
    # Create notification object
    notification = {
        "type": "notification",
        "id": str(uuid.uuid4()),
        "title": f"{prefix}: {message[:20]}{'...' if len(message) > 20 else ''}",
        "message": message,
        "severity": severity,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Add action for some notifications
    if random.random() < 0.3:  # 30% chance to have an action
        action_types = [
            {"label": "Переглянути деталі", "url": "/details"},
            {"label": "Запустити сканування", "url": "/scan"},
            {"label": "Виправити помилку", "url": "/fix"}
        ]
        notification["action"] = random.choice(action_types)
    
    return notification

@router.websocket("/sentiment-updates")
async def websocket_sentiment_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Send updates periodically (e.g., every 5 seconds)
            await asyncio.sleep(5)
            sentiment_update = await generate_mock_sentiment_update()
            # Use model_dump() for Pydantic v2
            await manager.broadcast_json(sentiment_update.model_dump())
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client {websocket.client} disconnected from sentiment updates")
    except Exception as e:
        # In a real app, use a proper logger here
        print(f"Error in sentiment websocket: {e}")
        manager.disconnect(websocket)

@router.websocket("/notifications")
async def websocket_notifications_endpoint(websocket: WebSocket):
    """WebSocket endpoint for system notifications"""
    await notification_manager.connect(websocket)
    try:
        # Send an initial welcome notification
        welcome_notification = {
            "type": "notification",
            "id": str(uuid.uuid4()),
            "title": "З'єднання встановлено",
            "message": "Ви успішно підключилися до системи сповіщень.",
            "severity": "success",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await websocket.send_json(welcome_notification)
        
        # Simulate random notifications periodically
        while True:
            # Wait random time between 10-30 seconds before next notification
            await asyncio.sleep(random.randint(10, 30))
            
            # Generate a notification
            notification = await generate_mock_notification()
            
            # Send it to this client only
            await websocket.send_json(notification)
            
    except WebSocketDisconnect:
        notification_manager.disconnect(websocket)
        print(f"Client {websocket.client} disconnected from notifications")
    except Exception as e:
        print(f"Error in notifications websocket: {e}")
        notification_manager.disconnect(websocket)

@router.get("/health")
async def websocket_health_check():
    """
    Health check endpoint for WebSocket service.
    Returns a simple status to confirm the service is up.
    """
    return {
        "status": "healthy", 
        "message": "WebSocket service is operational."
    }


@router.get("/metrics")
async def websocket_metrics():
    """
    Prometheus metrics endpoint for WebSocket service.
    Returns metrics about the WebSocket service, such as the number
    of active connections.
    """
    active_connections = len(manager.active_connections)
    metrics = "# HELP websocket_active_connections Number of active "
    metrics += "WebSocket connections\n"
    metrics += "# TYPE websocket_active_connections gauge\n"
    metrics += f"websocket_active_connections {active_connections}\n"
    return Response(content=metrics, media_type="text/plain") 