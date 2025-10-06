"""
Таски для агента самовідновлення
"""

from __future__ import annotations

from typing import Any
import asyncio

from ..celery_app import celery_app
from ..handlers.self_healing_agent import SelfHealingAgent


@celery_app.task(bind=True, name="healing.monitor_health")
def monitor_health_task(self, **kwargs) -> dict[str, Any]:
    """Таск для моніторингу стану системи"""
    
    agent = SelfHealingAgent()
    
    payload = kwargs
    
    try:
        result = asyncio.run(agent.execute("monitor_health", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="healing.execute_recovery")
def execute_recovery_task(self, action: str, target: str, **kwargs) -> dict[str, Any]:
    """Таск для виконання відновлення"""
    
    agent = SelfHealingAgent()
    
    payload = {
        "action": action,
        "target": target,
        "parameters": kwargs.get("parameters", {}),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("execute_recovery", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="healing.restart_services")
def restart_services_task(self, services: list[str], **kwargs) -> dict[str, Any]:
    """Таск для перезапуску сервісів"""
    
    agent = SelfHealingAgent()
    
    payload = {
        "services": services,
        "force": kwargs.get("force", False),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("restart_services", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)
