"""
Таски для агента безпеки
"""

from __future__ import annotations

from typing import Any
import asyncio

from ..celery_app import celery_app
from ..handlers.security_agent import SecurityAgent


@celery_app.task(bind=True, name="security.scan_vulnerabilities")
def scan_vulnerabilities_task(self, target: str, **kwargs) -> dict[str, Any]:
    """Таск для сканування вразливостей"""
    
    agent = SecurityAgent()
    
    payload = {
        "target": target,
        "scan_type": kwargs.get("scan_type", "basic"),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("scan_vulnerabilities", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="security.analyze_logs")
def analyze_logs_task(self, log_source: str, log_entries: list[dict[str, Any]], 
                     **kwargs) -> dict[str, Any]:
    """Таск для аналізу логів безпеки"""
    
    agent = SecurityAgent()
    
    payload = {
        "log_source": log_source,
        "log_entries": log_entries,
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("analyze_logs", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="security.check_compliance")
def check_compliance_task(self, framework: str, **kwargs) -> dict[str, Any]:
    """Таск для перевірки відповідності стандартам"""
    
    agent = SecurityAgent()
    
    payload = {
        "framework": framework,
        "resources": kwargs.get("resources", []),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("check_compliance", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)
