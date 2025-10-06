"""
Таски для агента аномалій
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
import asyncio

from ..celery_app import celery_app
from ..handlers.anomaly_agent import AnomalyDetectionAgent


@celery_app.task(bind=True, name="anomaly.detect_anomalies")
def detect_anomalies_task(self, dataset_id: str, model_type: str = "isolation_forest", **kwargs) -> dict[str, Any]:
    """Таск для виявлення аномалій"""
    
    agent = AnomalyDetectionAgent()
    
    payload = {
        "dataset_id": dataset_id,
        "model_type": model_type,
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("detect_anomalies", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="anomaly.train_model")
def train_anomaly_model_task(self, dataset_id: str, model_type: str = "isolation_forest", **kwargs) -> dict[str, Any]:
    """Таск для навчання моделі виявлення аномалій"""
    
    agent = AnomalyDetectionAgent()
    
    payload = {
        "dataset_id": dataset_id,
        "model_type": model_type,
        "model_params": kwargs.get("model_params", {}),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("train_anomaly_model", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="anomaly.evaluate_model")
def evaluate_anomaly_model_task(self, model_id: str, test_dataset_id: str, **kwargs) -> dict[str, Any]:
    """Таск для оцінки моделі виявлення аномалій"""
    
    agent = AnomalyDetectionAgent()
    
    payload = {
        "model_id": model_id,
        "test_dataset_id": test_dataset_id,
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("evaluate_model", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="anomaly.get_scores")
def get_anomaly_scores_task(self, model_id: str, data_points: list[list[float]], **kwargs) -> dict[str, Any]:
    """Таск для отримання оцінок аномальності"""
    
    agent = AnomalyDetectionAgent()
    
    payload = {
        "model_id": model_id,
        "data_points": data_points,
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("get_anomaly_score", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)
