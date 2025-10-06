"""
Таски для графового агента
"""

from __future__ import annotations

from typing import Any
import asyncio

from ..celery_app import celery_app
from ..handlers.graph_agent import GraphAnalyticsAgent


@celery_app.task(bind=True, name="graph.create_graph")
def create_graph_task(self, dataset_id: str, nodes: list[dict[str, Any]], 
                     edges: list[dict[str, Any]], **kwargs) -> dict[str, Any]:
    """Таск для створення графа"""
    
    agent = GraphAnalyticsAgent()
    
    payload = {
        "dataset_id": dataset_id,
        "nodes": nodes,
        "edges": edges,
        "graph_type": kwargs.get("graph_type", "directed"),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("create_graph", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="graph.analyze_centrality")
def analyze_centrality_task(self, graph_id: str, **kwargs) -> dict[str, Any]:
    """Таск для аналізу централізованості"""
    
    agent = GraphAnalyticsAgent()
    
    payload = {
        "graph_id": graph_id,
        "centrality_types": kwargs.get("centrality_types", ["degree", "betweenness", "closeness"]),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("analyze_centrality", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)


@celery_app.task(bind=True, name="graph.find_communities")
def find_communities_task(self, graph_id: str, **kwargs) -> dict[str, Any]:
    """Таск для знаходження спільнот"""
    
    agent = GraphAnalyticsAgent()
    
    payload = {
        "graph_id": graph_id,
        "algorithm": kwargs.get("algorithm", "label_propagation"),
        "min_community_size": kwargs.get("min_community_size", 2),
        **kwargs
    }
    
    try:
        result = asyncio.run(agent.execute("find_communities", payload))
        return result
    except Exception as e:
        self.retry(exc=e, countdown=60, max_retries=3)
