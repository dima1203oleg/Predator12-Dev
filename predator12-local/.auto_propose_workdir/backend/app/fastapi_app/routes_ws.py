from __future__ import annotations

from typing import Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)


progress_manager = ConnectionManager()
alerts_manager = ConnectionManager()


@router.websocket("/ws/progress")
async def ws_progress(websocket: WebSocket):
    await progress_manager.connect(websocket)
    try:
        while True:
            # For now, echo any incoming message; real system will push job progress updates
            data = await websocket.receive_text()
            await websocket.send_text(f"progress-echo: {data}")
    except WebSocketDisconnect:
        progress_manager.disconnect(websocket)


@router.websocket("/ws/alerts")
async def ws_alerts(websocket: WebSocket):
    await alerts_manager.connect(websocket)
    try:
        while True:
            # For now, echo any incoming message; real system will push alert notifications
            data = await websocket.receive_text()
            await websocket.send_text(f"alert-echo: {data}")
    except WebSocketDisconnect:
        alerts_manager.disconnect(websocket)
