"""
FastAPI бекенд для Hero Interface - Predator Analytics
Забезпечує API для чату, подій агентів та даних мережі
"""

import asyncio
import json
from datetime import datetime
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="Predator Analytics Hero API", version="1.0.0")

# CORS для фронтенду
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    """Модель повідомлення чату"""

    message: str
    trace: bool = False


class NetworkData(BaseModel):
    """Модель даних мережі"""

    nodes: list[dict]
    edges: list[dict]


# === ЕНДПОІНТ: ЧАТ === #
@app.post("/api/chat")
async def chat(msg: ChatMessage):
    """
    Обробляє повідомлення користувача та повертає відповідь AI
    """
    user_msg = msg.message.lower()

    # Проста логіка відповідей (можна замінити на реальний AI)
    if "контрагент" in user_msg or "компанія" in user_msg:
        reply = (
            "🔍 Аналізую контрагента... \n\n"
            "Знайдено інформацію:\n"
            "- Компанія зареєстрована 2019 року\n"
            "- 3 судові справи (2 закриті, 1 активна)\n"
            "- Зв'язок із офшорною структурою виявлено\n"
            "- Рівень ризику: СЕРЕДНІЙ ⚠️"
        )
    elif "суд" in user_msg or "справ" in user_msg:
        reply = (
            "⚖️ Перевіряю судові справи...\n\n"
            "Знайдено 247 активних справ у базі.\n"
            "Найактуальніші:\n"
            "- Справа №123/2024: Фінансові зобов'язання\n"
            "- Справа №456/2024: Комерційний спір\n"
            "Потрібна детальна інформація?"
        )
    elif "граф" in user_msg or "зв'язок" in user_msg or "мереж" in user_msg:
        reply = (
            "🕸️ Будую граф зв'язків...\n\n"
            "Виявлено 12 ключових вузлів:\n"
            "- 4 юридичні особи\n"
            "- 5 фізичних осіб\n"
            "- 3 офшорні структури\n"
            "Граф оновлено в міні-панелі справа →"
        )
    elif "агент" in user_msg:
        reply = (
            "🤖 Статус агентів:\n\n"
            "✅ Router Agent: Активний\n"
            "✅ Law Agent: Підключено до бази законів\n"
            "✅ Court Agent: Моніторинг судових справ\n"
            "✅ Analytics Agent: Обробка даних\n"
            "Всі агенти готові до роботи!"
        )
    else:
        reply = (
            f"Отримав запит: '{msg.message}'\n\n"
            "🎯 Я можу допомогти з:\n"
            "- Аналізом контрагентів\n"
            "- Пошуком судових справ\n"
            "- Побудовою графів зв'язків\n"
            "- Перевіркою ризиків\n\n"
            "Задайте конкретне запитання!"
        )

    return {"reply": reply, "timestamp": datetime.now().isoformat()}


# === ЕНДПОІНТ: ПОДІЇ АГЕНТІВ (SSE) === #
async def agent_events_generator() -> AsyncGenerator[str, None]:
    """
    Генерує події агентів для SSE
    """
    events = [
        "🤖 Router Agent: Ініціалізація завершена",
        "📊 Analytics Agent: Підключення до бази даних",
        "⚖️ Law Agent: Завантаження бази законів...",
        "🏛️ Court Agent: Моніторинг активних справ",
        "✅ Всі агенти готові до роботи",
        "🔍 Router Agent: Очікування запитів користувача",
        "📡 Analytics Agent: Аналіз даних у фоновому режимі",
        "⚠️ Court Agent: Виявлено нову судову справу #789/2024",
        "🎯 Router Agent: Запит оброблено успішно",
        "📈 Analytics Agent: Оновлення статистики",
    ]

    for event in events:
        yield f"data: {json.dumps({'message': event, 'timestamp': datetime.now().isoformat()})}\n\n"
        await asyncio.sleep(3)  # Подія кожні 3 секунди

    # Після першого циклу - рандомні події
    while True:
        await asyncio.sleep(10)
        event_msg = f"🤖 Agent Update: {datetime.now().strftime('%H:%M:%S')}"
        yield f"data: {json.dumps({'message': event_msg, 'timestamp': datetime.now().isoformat()})}\n\n"


@app.get("/api/events")
async def events():
    """
    SSE (Server-Sent Events) стрім подій агентів
    """
    return StreamingResponse(
        agent_events_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# === ЕНДПОІНТ: ДАНІ МЕРЕЖІ === #
@app.get("/api/network")
async def get_network():
    """
    Повертає дані для графа зв'язків
    """
    network_data = {
        "nodes": [
            {"id": "Контрагент X", "type": "company", "risk": "medium"},
            {"id": "Судова справа", "type": "court", "risk": "high"},
            {"id": "Офшор", "type": "offshore", "risk": "high"},
            {"id": "Директор", "type": "person", "risk": "low"},
            {"id": "Філія Y", "type": "company", "risk": "medium"},
            {"id": "Банк Z", "type": "bank", "risk": "low"},
        ],
        "edges": [
            {"source": "Контрагент X", "target": "Судова справа", "type": "litigation"},
            {"source": "Контрагент X", "target": "Офшор", "type": "ownership"},
            {"source": "Директор", "target": "Контрагент X", "type": "management"},
            {"source": "Філія Y", "target": "Контрагент X", "type": "subsidiary"},
            {"source": "Контрагент X", "target": "Банк Z", "type": "banking"},
        ],
        "metadata": {
            "total_nodes": 6,
            "total_edges": 5,
            "risk_score": 6.5,
            "last_updated": datetime.now().isoformat(),
        },
    }

    return network_data


# === HEALTH CHECK === #
@app.get("/health")
async def health():
    """Перевірка стану API"""
    return {
        "status": "healthy",
        "service": "Predator Analytics Hero API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }


# === ROOT === #
@app.get("/")
async def root():
    """Кореневий ендпоінт"""
    return {
        "service": "Predator Analytics Hero API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "POST /api/chat",
            "events": "GET /api/events (SSE)",
            "network": "GET /api/network",
            "health": "GET /health",
        },
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    print("🚀 Запуск Predator Analytics Hero API...")
    print("📡 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
