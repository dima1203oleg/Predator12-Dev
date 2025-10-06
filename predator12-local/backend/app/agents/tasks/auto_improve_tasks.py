"""
Таски для агента автопокращення
"""

from __future__ import annotations

from typing import Any
import asyncio

from ..celery_app import celery_app
from ..handlers.auto_improve_agent import AutoImproveAgent


@celery_app.task(bind=True, name="improve.analyze_performance")
def analyze_performance_task(self, component: str = "system", **kwargs) -> dict[str, Any]:
    """Таск для аналізу продуктивності"""
    
    agent = AutoImproveAgent()
    
    payload = {
        "component": component,
        "time_period": kwargs.get("time_period", "last_hour"),
        "metrics": kwargs.get("metrics", ["response_time", "throughput", "error_rate"]),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("analyze_performance", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="improve.suggest_optimizations")
def suggest_optimizations_task(self, performance_data: dict[str, Any], **kwargs) -> dict[str, Any]:
    """Таск для пропозиції оптимізацій"""
    
    agent = AutoImproveAgent()
    
    payload = {
        "performance_data": performance_data,
        "constraints": kwargs.get("constraints", {}),
        "priority": kwargs.get("priority", "performance"),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("suggest_optimizations", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="improve.auto_tune")
def auto_tune_parameters_task(self, component: str, parameters: dict[str, Any], **kwargs) -> dict[str, Any]:
    """Таск для автоматичного налаштування параметрів"""
    
    agent = AutoImproveAgent()
    
    payload = {
        "component": component,
        "parameters": parameters,
        "goal": kwargs.get("goal", "performance"),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("auto_tune_parameters", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)
