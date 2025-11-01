#!/usr/bin/env python3
"""
GraphAgent - Агент графового аналізу та пошуку зв'язків
Представляє дані у вигляді графів і виконує алгоритми на графах згідно з ТЗ
"""

import asyncio
import json
import logging
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import aiofiles
import aiohttp
import networkx as nx
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class GraphNode:
    id: str
    type: str
    properties: Dict[str, Any]


@dataclass
class GraphEdge:
    source: str
    target: str
    type: str
    weight: float = 1.0
    properties: Dict[str, Any] = None


@dataclass
class CommunityInfo:
    community_id: int
    nodes: List[str]
    size: int
    density: float
    key_nodes: List[str]


class GraphAgent:
    """
    Агент графового аналізу згідно з технічним завданням
    """

    def __init__(self):
        self.graphs: Dict[str, nx.Graph] = {}
        self.analysis_results: Dict[str, Any] = {}
        self.opensearch_url = "http://opensearch:9200"
        self.postgres_url = "postgresql://postgres:postgres@db:5432/predator11"

        # Кеш для оптимізації
        self.node_cache: Dict[str, GraphNode] = {}
        self.edge_cache: Dict[str, List[GraphEdge]] = {}

        # Алгоритми які підтримуємо
        self.supported_algorithms = {
            "pagerank": self.calculate_pagerank,
            "betweenness_centrality": self.calculate_betweenness_centrality,
            "closeness_centrality": self.calculate_closeness_centrality,
            "community_detection": self.detect_communities,
            "shortest_path": self.find_shortest_path,
            "connected_components": self.find_connected_components,
            "clustering_coefficient": self.calculate_clustering,
            "influence_propagation": self.simulate_influence_propagation,
        }

    async def initialize(self):
        """Ініціалізує графовий агент"""
        logger.info("🚀 Initializing Graph Agent...")

        # Створюємо базові графи
        await self.create_base_graphs()

        # Завантажуємо дані з різних джерел
        await self.load_data_from_sources()

        logger.info("✅ Graph Agent initialized successfully")

    async def create_base_graphs(self):
        """Створює базові графи для різних типів даних"""
        # Граф соціальних зв'язків
        self.graphs["social"] = nx.Graph()

        # Граф мережевих взаємодій
        self.graphs["network"] = nx.DiGraph()  # Направлений граф

        # Граф подій та зв'язків
        self.graphs["events"] = nx.Graph()

        # Граф знань (онтологічний)
        self.graphs["knowledge"] = nx.DiGraph()

        logger.info("📊 Created base graphs: social, network, events, knowledge")

    async def load_data_from_sources(self):
        """Завантажує дані з різних джерел для побудови графів"""
        try:
            # Завантажуємо дані з OpenSearch
            await self.load_from_opensearch()

            # Завантажуємо дані з PostgreSQL
            await self.load_from_postgres()

            logger.info("✅ Data loaded from all sources")

        except Exception as e:
            logger.error(f"Failed to load data from sources: {e}")

    async def load_from_opensearch(self):
        """Завантажує дані з OpenSearch для побудови графів"""
        try:
            async with aiohttp.ClientSession() as session:
                # Отримуємо дані про взаємодії користувачів
                query = {
                    "size": 1000,
                    "query": {"match_all": {}},
                    "_source": ["user_id", "target_id", "interaction_type", "timestamp"],
                }

                async with session.post(f"{self.opensearch_url}/*/_search", json=query) as response:
                    if response.status == 200:
                        data = await response.json()
                        hits = data.get("hits", {}).get("hits", [])

                        for hit in hits:
                            source_data = hit["_source"]
                            await self.add_interaction_to_graph(source_data)

                        logger.info(f"📈 Loaded {len(hits)} interactions from OpenSearch")

        except Exception as e:
            logger.error(f"Failed to load from OpenSearch: {e}")

    async def load_from_postgres(self):
        """Завантажує дані з PostgreSQL для побудови графів"""
        try:
            import asyncpg

            conn = await asyncpg.connect(self.postgres_url)

            # Завантажуємо користувачів та їх атрибути
            users = await conn.fetch(
                """
                SELECT user_id, username, role, created_at, properties
                FROM users
                WHERE active = true
            """
            )

            for user in users:
                await self.add_user_node(user)

            # Завантажуємо організаційні зв'язки
            relationships = await conn.fetch(
                """
                SELECT source_id, target_id, relationship_type, strength, metadata
                FROM user_relationships
            """
            )

            for rel in relationships:
                await self.add_relationship_edge(rel)

            await conn.close()

            logger.info(
                f"👥 Loaded {len(users)} users and {len(relationships)} relationships from PostgreSQL"
            )

        except Exception as e:
            logger.error(f"Failed to load from PostgreSQL: {e}")

    async def add_interaction_to_graph(self, interaction_data: Dict[str, Any]):
        """Додає взаємодію до графу"""
        user_id = interaction_data.get("user_id")
        target_id = interaction_data.get("target_id")
        interaction_type = interaction_data.get("interaction_type", "unknown")
        timestamp = interaction_data.get("timestamp")

        if user_id and target_id:
            # Визначаємо граф за типом взаємодії
            if interaction_type in ["message", "call", "meeting"]:
                graph = self.graphs["social"]
            elif interaction_type in ["network_request", "api_call", "data_transfer"]:
                graph = self.graphs["network"]
            else:
                graph = self.graphs["events"]

            # Додаємо вузли якщо не існують
            if not graph.has_node(user_id):
                graph.add_node(user_id, type="user", first_seen=timestamp)

            if not graph.has_node(target_id):
                graph.add_node(target_id, type="entity", first_seen=timestamp)

            # Додаємо або оновлюємо ребро
            if graph.has_edge(user_id, target_id):
                # Збільшуємо вагу існуючого ребра
                graph[user_id][target_id]["weight"] += 1
                graph[user_id][target_id]["last_interaction"] = timestamp
            else:
                graph.add_edge(
                    user_id,
                    target_id,
                    weight=1,
                    type=interaction_type,
                    first_interaction=timestamp,
                    last_interaction=timestamp,
                )

    async def add_user_node(self, user_data):
        """Додає вузол користувача до соціального графу"""
        user_id = str(user_data["user_id"])

        node_properties = {
            "type": "user",
            "username": user_data.get("username"),
            "role": user_data.get("role"),
            "created_at": user_data.get("created_at"),
            "properties": user_data.get("properties", {}),
        }

        # Додаємо до соціального графу
        self.graphs["social"].add_node(user_id, **node_properties)

        # Кешуємо вузол
        self.node_cache[user_id] = GraphNode(id=user_id, type="user", properties=node_properties)

    async def add_relationship_edge(self, relationship_data):
        """Додає ребро зв'язку між користувачами"""
        source_id = str(relationship_data["source_id"])
        target_id = str(relationship_data["target_id"])
        rel_type = relationship_data.get("relationship_type", "connected")
        strength = relationship_data.get("strength", 1.0)

        edge_properties = {
            "type": rel_type,
            "weight": strength,
            "metadata": relationship_data.get("metadata", {}),
        }

        self.graphs["social"].add_edge(source_id, target_id, **edge_properties)

    async def run_graph_analysis(self, graph_name: str, algorithm: str, **kwargs) -> Dict[str, Any]:
        """Запускає графовий аналіз"""
        if graph_name not in self.graphs:
            raise ValueError(f"Graph '{graph_name}' not found")

        if algorithm not in self.supported_algorithms:
            raise ValueError(f"Algorithm '{algorithm}' not supported")

        graph = self.graphs[graph_name]
        logger.info(
            f"🔍 Running {algorithm} on {graph_name} graph ({graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges)"
        )

        start_time = datetime.now()

        try:
            # Виконуємо алгоритм
            result = await self.supported_algorithms[algorithm](graph, **kwargs)

            execution_time = (datetime.now() - start_time).total_seconds()

            analysis_result = {
                "timestamp": datetime.now().isoformat(),
                "graph_name": graph_name,
                "algorithm": algorithm,
                "execution_time": execution_time,
                "graph_stats": {
                    "nodes": graph.number_of_nodes(),
                    "edges": graph.number_of_edges(),
                    "density": nx.density(graph),
                },
                "result": result,
                "parameters": kwargs,
            }

            # Зберігаємо результат
            self.analysis_results[f"{graph_name}_{algorithm}_{int(start_time.timestamp())}"] = (
                analysis_result
            )

            logger.info(f"✅ Completed {algorithm} analysis in {execution_time:.2f}s")
            return analysis_result

        except Exception as e:
            logger.error(f"Failed to run {algorithm} on {graph_name}: {e}")
            raise

    async def calculate_pagerank(self, graph: nx.Graph, **kwargs) -> Dict[str, float]:
        """Обчислює PageRank для вузлів графу"""
        alpha = kwargs.get("alpha", 0.85)
        max_iter = kwargs.get("max_iter", 100)

        if isinstance(graph, nx.DiGraph):
            pagerank = nx.pagerank(graph, alpha=alpha, max_iter=max_iter)
        else:
            # Для неорієнтованого графу створюємо копію з орієнтованими ребрами
            directed_graph = graph.to_directed()
            pagerank = nx.pagerank(directed_graph, alpha=alpha, max_iter=max_iter)

        # Сортуємо за важливістю
        sorted_pagerank = dict(sorted(pagerank.items(), key=lambda x: x[1], reverse=True))

        return {
            "pagerank_scores": sorted_pagerank,
            "top_nodes": list(sorted_pagerank.keys())[:10],
            "algorithm_params": {"alpha": alpha, "max_iter": max_iter},
        }

    async def calculate_betweenness_centrality(self, graph: nx.Graph, **kwargs) -> Dict[str, float]:
        """Обчислює центральність за посередництвом"""
        normalized = kwargs.get("normalized", True)

        betweenness = nx.betweenness_centrality(graph, normalized=normalized)
        sorted_betweenness = dict(sorted(betweenness.items(), key=lambda x: x[1], reverse=True))

        return {
            "betweenness_centrality": sorted_betweenness,
            "top_bridge_nodes": list(sorted_betweenness.keys())[:10],
            "algorithm_params": {"normalized": normalized},
        }

    async def calculate_closeness_centrality(self, graph: nx.Graph, **kwargs) -> Dict[str, float]:
        """Обчислює центральність за близькістю"""
        closeness = nx.closeness_centrality(graph)
        sorted_closeness = dict(sorted(closeness.items(), key=lambda x: x[1], reverse=True))

        return {
            "closeness_centrality": sorted_closeness,
            "most_central_nodes": list(sorted_closeness.keys())[:10],
        }

    async def detect_communities(self, graph: nx.Graph, **kwargs) -> Dict[str, Any]:
        """Виявляє спільноти у графі"""
        algorithm = kwargs.get("algorithm", "louvain")

        if algorithm == "louvain":
            communities = nx.community.louvain_communities(graph)
        elif algorithm == "greedy_modularity":
            communities = nx.community.greedy_modularity_communities(graph)
        else:
            communities = nx.community.louvain_communities(graph)  # default

        # Аналізуємо кожну спільноту
        community_analysis = []
        for i, community in enumerate(communities):
            subgraph = graph.subgraph(community)

            community_info = CommunityInfo(
                community_id=i,
                nodes=list(community),
                size=len(community),
                density=nx.density(subgraph),
                key_nodes=await self._find_key_nodes_in_community(subgraph),
            )

            community_analysis.append(community_info)

        # Обчислюємо модулярність
        modularity = nx.community.modularity(graph, communities)

        return {
            "communities": [
                {
                    "id": c.community_id,
                    "size": c.size,
                    "density": c.density,
                    "nodes": c.nodes,
                    "key_nodes": c.key_nodes,
                }
                for c in community_analysis
            ],
            "total_communities": len(communities),
            "modularity": modularity,
            "algorithm": algorithm,
        }

    async def _find_key_nodes_in_community(self, subgraph: nx.Graph) -> List[str]:
        """Знаходить ключові вузли в спільноті"""
        if subgraph.number_of_nodes() == 0:
            return []

        # Обчислюємо центральність для вузлів спільноти
        centrality = nx.degree_centrality(subgraph)

        # Повертаємо топ-3 найбільш центральних вузли
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)
        return [node for node, _ in sorted_nodes[:3]]

    async def find_shortest_path(self, graph: nx.Graph, **kwargs) -> Dict[str, Any]:
        """Знаходить найкоротший шлях між вузлами"""
        source = kwargs.get("source")
        target = kwargs.get("target")

        if not source or not target:
            raise ValueError("Source and target nodes must be specified")

        if not graph.has_node(source) or not graph.has_node(target):
            return {"path": None, "length": None, "error": "Node not found"}

        try:
            if nx.is_weighted(graph):
                path = nx.shortest_path(graph, source, target, weight="weight")
                length = nx.shortest_path_length(graph, source, target, weight="weight")
            else:
                path = nx.shortest_path(graph, source, target)
                length = nx.shortest_path_length(graph, source, target)

            return {
                "path": path,
                "length": length,
                "hops": len(path) - 1,
                "source": source,
                "target": target,
            }

        except nx.NetworkXNoPath:
            return {
                "path": None,
                "length": float("inf"),
                "error": "No path exists",
                "source": source,
                "target": target,
            }

    async def find_connected_components(self, graph: nx.Graph, **kwargs) -> Dict[str, Any]:
        """Знаходить зв'язані компоненти"""
        if isinstance(graph, nx.DiGraph):
            # Для орієнтованого графу знаходимо слабко зв'язані компоненти
            components = list(nx.weakly_connected_components(graph))
            component_type = "weakly_connected"
        else:
            # Для неорієнтованого графу
            components = list(nx.connected_components(graph))
            component_type = "connected"

        # Аналізуємо компоненти
        component_analysis = []
        for i, component in enumerate(components):
            subgraph = graph.subgraph(component)

            component_analysis.append(
                {
                    "id": i,
                    "size": len(component),
                    "density": nx.density(subgraph),
                    "nodes": list(component),
                    "diameter": nx.diameter(subgraph) if nx.is_connected(subgraph) else None,
                }
            )

        # Сортуємо за розміром
        component_analysis.sort(key=lambda x: x["size"], reverse=True)

        return {
            "components": component_analysis,
            "total_components": len(components),
            "largest_component_size": max(len(c) for c in components) if components else 0,
            "component_type": component_type,
        }

    async def calculate_clustering(self, graph: nx.Graph, **kwargs) -> Dict[str, Any]:
        """Обчислює коефіцієнт кластеризації"""
        # Загальний коефіцієнт кластеризації
        avg_clustering = nx.average_clustering(graph)

        # Коефіцієнт для кожного вузла
        clustering_coeffs = nx.clustering(graph)

        # Сортуємо вузли за коефіцієнтом кластеризації
        sorted_clustering = dict(
            sorted(clustering_coeffs.items(), key=lambda x: x[1], reverse=True)
        )

        return {
            "average_clustering": avg_clustering,
            "node_clustering": sorted_clustering,
            "highly_clustered_nodes": [
                node for node, coeff in sorted_clustering.items() if coeff > avg_clustering
            ][:10],
        }

    async def simulate_influence_propagation(self, graph: nx.Graph, **kwargs) -> Dict[str, Any]:
        """Симулює поширення впливу по графу"""
        seed_nodes = kwargs.get("seed_nodes", [])
        propagation_prob = kwargs.get("propagation_prob", 0.3)
        max_iterations = kwargs.get("max_iterations", 10)

        if not seed_nodes:
            # Якщо не вказано початкові вузли, беремо найбільш центральні
            centrality = nx.degree_centrality(graph)
            seed_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:3]
            seed_nodes = [node for node, _ in seed_nodes]

        # Початковий стан - тільки seed вузли активні
        active_nodes = set(seed_nodes)
        propagation_history = [set(seed_nodes)]

        for iteration in range(max_iterations):
            new_active = set()

            for active_node in active_nodes:
                # Для кожного сусіда активного вузла
                for neighbor in graph.neighbors(active_node):
                    if neighbor not in active_nodes:
                        # Імовірність активації на основі ваги ребра
                        edge_data = graph.get_edge_data(active_node, neighbor)
                        weight = edge_data.get("weight", 1.0) if edge_data else 1.0

                        # Нормалізована імовірність
                        activation_prob = min(propagation_prob * weight, 1.0)

                        if np.random.random() < activation_prob:
                            new_active.add(neighbor)

            if not new_active:
                break  # Поширення зупинилося

            active_nodes.update(new_active)
            propagation_history.append(active_nodes.copy())

        return {
            "seed_nodes": seed_nodes,
            "final_active_nodes": list(active_nodes),
            "total_infected": len(active_nodes),
            "infection_rate": len(active_nodes) / graph.number_of_nodes(),
            "iterations": len(propagation_history) - 1,
            "propagation_history": [list(nodes) for nodes in propagation_history],
            "parameters": {"propagation_prob": propagation_prob, "max_iterations": max_iterations},
        }

    async def find_anomalous_nodes(self, graph_name: str) -> Dict[str, Any]:
        """Знаходить аномальні вузли у графі"""
        graph = self.graphs[graph_name]

        # Обчислюємо різні метрики центральності
        degree_centrality = nx.degree_centrality(graph)
        betweenness_centrality = nx.betweenness_centrality(graph)
        closeness_centrality = nx.closeness_centrality(graph)

        # Знаходимо вузли з аномальними характеристиками
        anomalous_nodes = []

        for node in graph.nodes():
            # Збираємо метрики для вузла
            metrics = {
                "degree": degree_centrality.get(node, 0),
                "betweenness": betweenness_centrality.get(node, 0),
                "closeness": closeness_centrality.get(node, 0),
                "clustering": nx.clustering(graph, node),
            }

            # Шукаємо аномалії (наприклад, дуже високі або низькі значення)
            anomaly_score = 0

            # Високий ступінь при низькій центральності за близькістю
            if metrics["degree"] > 0.1 and metrics["closeness"] < 0.1:
                anomaly_score += 1

            # Високе посередництво при низькій кластеризації
            if metrics["betweenness"] > 0.1 and metrics["clustering"] < 0.1:
                anomaly_score += 1

            # Ізольовані вузли з високою центральністю
            if graph.degree(node) == 1 and metrics["degree"] > 0.05:
                anomaly_score += 1

            if anomaly_score > 0:
                anomalous_nodes.append(
                    {
                        "node": node,
                        "anomaly_score": anomaly_score,
                        "metrics": metrics,
                        "degree": graph.degree(node),
                    }
                )

        # Сортуємо за аномальністю
        anomalous_nodes.sort(key=lambda x: x["anomaly_score"], reverse=True)

        return {
            "anomalous_nodes": anomalous_nodes[:20],  # Топ-20 аномальних вузлів
            "total_anomalies": len(anomalous_nodes),
            "graph_stats": {
                "nodes": graph.number_of_nodes(),
                "edges": graph.number_of_edges(),
                "density": nx.density(graph),
            },
        }

    async def export_graph_visualization(
        self, graph_name: str, output_format: str = "json"
    ) -> Dict[str, Any]:
        """Експортує граф для візуалізації"""
        graph = self.graphs[graph_name]

        if output_format == "json":
            # Формат для D3.js або інших веб-візуалізацій
            nodes = []
            links = []

            for node in graph.nodes(data=True):
                nodes.append(
                    {"id": node[0], "type": node[1].get("type", "unknown"), "properties": node[1]}
                )

            for edge in graph.edges(data=True):
                links.append(
                    {
                        "source": edge[0],
                        "target": edge[1],
                        "weight": edge[2].get("weight", 1),
                        "type": edge[2].get("type", "unknown"),
                        "properties": edge[2],
                    }
                )

            return {
                "nodes": nodes,
                "links": links,
                "metadata": {
                    "graph_name": graph_name,
                    "node_count": len(nodes),
                    "edge_count": len(links),
                    "created_at": datetime.now().isoformat(),
                },
            }

        else:
            raise ValueError(f"Unsupported output format: {output_format}")

    async def get_graph_statistics(self, graph_name: str) -> Dict[str, Any]:
        """Повертає статистику графу"""
        graph = self.graphs[graph_name]

        stats = {
            "name": graph_name,
            "type": "directed" if isinstance(graph, nx.DiGraph) else "undirected",
            "nodes": graph.number_of_nodes(),
            "edges": graph.number_of_edges(),
            "density": nx.density(graph),
            "is_connected": (
                nx.is_connected(graph)
                if not isinstance(graph, nx.DiGraph)
                else nx.is_weakly_connected(graph)
            ),
        }

        if graph.number_of_nodes() > 0:
            # Додаткові метрики для непустих графів
            if stats["is_connected"]:
                stats["diameter"] = nx.diameter(graph)
                stats["radius"] = nx.radius(graph)
                stats["average_shortest_path_length"] = nx.average_shortest_path_length(graph)

            stats["average_clustering"] = nx.average_clustering(graph)
            stats["number_of_triangles"] = sum(nx.triangles(graph).values()) // 3

        return stats

    async def get_status(self) -> Dict[str, Any]:
        """Повертає статус GraphAgent"""
        return {
            "timestamp": datetime.now().isoformat(),
            "graphs": {name: await self.get_graph_statistics(name) for name in self.graphs.keys()},
            "cached_nodes": len(self.node_cache),
            "cached_edges": len(self.edge_cache),
            "analysis_results_count": len(self.analysis_results),
            "supported_algorithms": list(self.supported_algorithms.keys()),
            "status": "active",
        }


# Глобальний екземпляр агента
graph_agent = GraphAgent()


async def main():
    """Основна функція для запуску агента"""
    logger.info("🚀 Starting Predator Analytics Graph Agent...")

    try:
        await graph_agent.initialize()
        logger.info("✅ Graph Agent is ready for analysis requests")

        # Тримаємо агент запущеним
        while True:
            await asyncio.sleep(60)

    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Error in Graph Agent: {e}")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    asyncio.run(main())
