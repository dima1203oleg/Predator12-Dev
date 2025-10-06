"""
Агенти-обробники для Predator Analytics Nexus Core
"""

from .anomaly_agent import AnomalyDetectionAgent
from .auto_improve_agent import AutoImproveAgent
from .dataset_agent import DatasetAgent
from .forecast_agent import ForecastAgent
from .graph_agent import GraphAnalyticsAgent
from .security_agent import SecurityAgent
from .self_healing_agent import SelfHealingAgent

__all__ = [
    "AnomalyDetectionAgent",
    "AutoImproveAgent", 
    "DatasetAgent",
    "ForecastAgent",
    "GraphAnalyticsAgent",
    "SecurityAgent",
    "SelfHealingAgent"
]
