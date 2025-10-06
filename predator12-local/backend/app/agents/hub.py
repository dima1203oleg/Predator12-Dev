from __future__ import annotations

import asyncio
import uuid

from app.fastapi_app.routes_ws import progress_manager, alerts_manager


class AgentHub:
    """Minimal AgentHub scaffold to orchestrate background tasks and broadcast WS updates.

    This is a simplified placeholder. Real implementation will dispatch to
    DatasetAgent/AnomalyAgent/etc. via queues or RPC. For now, we simulate
    a short-running task and publish progress and a final alert.
    """

    def __init__(self) -> None:
        self.tasks: dict[str, str] = {}

    async def start_simulated_task(self, task_type: str = "index") -> str:
        task_id = str(uuid.uuid4())
        self.tasks[task_id] = task_type
        # run background
        asyncio.create_task(self._simulate_progress(task_id, task_type))
        return task_id

    async def _simulate_progress(self, task_id: str, task_type: str) -> None:
        # 5 progress ticks
        for i in range(1, 6):
            await asyncio.sleep(0.6)
            await progress_manager.broadcast(
                f"task={task_id} type={task_type} progress={i*20}%"
            )
        # final done message and alert
        await progress_manager.broadcast(
            f"task={task_id} type={task_type} status=done"
        )
        await alerts_manager.broadcast(
            f"alert: task {task_id} ({task_type}) completed successfully"
        )


hub = AgentHub()
