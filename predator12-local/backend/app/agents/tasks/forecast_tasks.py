"""
Таски для агента прогнозування
"""

from __future__ import annotations

from typing import Any
import asyncio

from ..celery_app import celery_app
from ..handlers.forecast_agent import ForecastAgent


@celery_app.task(bind=True, name="forecast.train_model")
def train_forecast_model_task(self, dataset_id: str, model_type: str = "arima", **kwargs) -> dict[str, Any]:
    """Таск для навчання моделі прогнозування"""
    
    agent = ForecastAgent()
    
    payload = {
        "dataset_id": dataset_id,
        "model_type": model_type,
        "target_column": kwargs.get("target_column"),
        "time_column": kwargs.get("time_column"),
        "model_params": kwargs.get("model_params", {}),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("train_forecast_model", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="forecast.make_forecast")
def make_forecast_task(self, model_id: str, forecast_horizon: int = 30, **kwargs) -> dict[str, Any]:
    """Таск для створення прогнозу"""
    
    agent = ForecastAgent()
    
    payload = {
        "model_id": model_id,
        "forecast_horizon": forecast_horizon,
        "confidence_intervals": kwargs.get("confidence_intervals", [0.8, 0.95]),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("make_forecast", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="forecast.detect_trends")
def detect_trends_task(self, dataset_id: str, time_series: list[float], **kwargs) -> dict[str, Any]:
    """Таск для виявлення трендів"""
    
    agent = ForecastAgent()
    
    payload = {
        "dataset_id": dataset_id,
        "time_series": time_series,
        "window_size": kwargs.get("window_size", 10),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("detect_trends", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)
