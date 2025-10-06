"""
Агент для графової аналітики та мережевого аналізу
"""

from __future__ import annotations

from typing import Any
import json
import math

from .base_agent import BaseAgent


class GraphAnalyticsAgent(BaseAgent):
    """Агент для аналізу графів, мереж та зв'язків між сутностями"""
    
    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__("GraphAnalyticsAgent", config)
        self.graphs = {}  # Кеш завантажених графів
        
    def capabilities(self) -> list[str]:
        return [
            "create_graph",
            "analyze_centrality",
            "find_communities", 
            "detect_patterns",
            "calculate_shortest_path",
            "analyze_connectivity",
            "detect_anomalous_nodes"
        ]
        
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання графової аналітики"""
        
        self.logger.info("Processing graph analytics task", task_type=task_type)
        
        if task_type == "create_graph":
            return await self._create_graph(payload)
        elif task_type == "analyze_centrality":
            return await self._analyze_centrality(payload)
        elif task_type == "find_communities":
            return await self._find_communities(payload)
        elif task_type == "detect_patterns":
            return await self._detect_patterns(payload)
        elif task_type == "calculate_shortest_path":
            return await self._calculate_shortest_path(payload)
        elif task_type == "analyze_connectivity":
            return await self._analyze_connectivity(payload)
        elif task_type == "detect_anomalous_nodes":
            return await self._detect_anomalous_nodes(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _create_graph(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Створює граф з наданих даних"""
        
        dataset_id = payload.get("dataset_id")
        nodes = payload.get("nodes", [])
        edges = payload.get("edges", [])
        graph_type = payload.get("graph_type", "directed")
        
        try:
            graph_id = f"graph_{dataset_id}_{len(nodes)}_{len(edges)}"
            
            # Створення структури графа
            graph = {
                "id": graph_id,
                "type": graph_type,
                "nodes": {},
                "edges": [],
                "adjacency_list": {}
            }
            
            # Додавання вузлів
            for node in nodes:
                node_id = node.get("id")
                node_data = {
                    "id": node_id,
                    "label": node.get("label", node_id),
                    "attributes": node.get("attributes", {}),
                    "degree": 0
                }
                graph["nodes"][node_id] = node_data
                graph["adjacency_list"][node_id] = []
            
            # Додавання ребер
            for edge in edges:
                source = edge.get("source")
                target = edge.get("target")
                weight = edge.get("weight", 1.0)
                
                if source in graph["nodes"] and target in graph["nodes"]:
                    edge_data = {
                        "source": source,
                        "target": target,
                        "weight": weight,
                        "attributes": edge.get("attributes", {})
                    }
                    
                    graph["edges"].append(edge_data)
                    graph["adjacency_list"][source].append(target)
                    
                    # Оновлення ступеня вузлів
                    graph["nodes"][source]["degree"] += 1
                    
                    # Для неорієнтованих графів додаємо зворотне ребро
                    if graph_type == "undirected":
                        graph["adjacency_list"][target].append(source)
                        graph["nodes"][target]["degree"] += 1
            
            # Збереження графа
            self.graphs[graph_id] = graph
            
            # Базова статистика
            num_nodes = len(graph["nodes"])
            num_edges = len(graph["edges"])
            density = (2 * num_edges) / (num_nodes * (num_nodes - 1)) if num_nodes > 1 else 0
            
            return {
                "status": "success",
                "graph_id": graph_id,
                "graph_type": graph_type,
                "statistics": {
                    "num_nodes": num_nodes,
                    "num_edges": num_edges,
                    "density": density,
                    "avg_degree": (2 * num_edges) / num_nodes if num_nodes > 0 else 0
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to create graph", error=str(e), dataset_id=dataset_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _analyze_centrality(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Аналізує централізованість вузлів у графі"""
        
        graph_id = payload.get("graph_id")
        centrality_types = payload.get("centrality_types", ["degree", "betweenness", "closeness"])
        
        if graph_id not in self.graphs:
            return {
                "status": "error",
                "error": f"Graph {graph_id} not found"
            }
        
        try:
            graph = self.graphs[graph_id]
            nodes = graph["nodes"]
            adjacency_list = graph["adjacency_list"]
            
            centrality_results = {}
            
            # Degree centrality (найпростіша метрика)
            if "degree" in centrality_types:
                degree_centrality = {}
                max_degree = max([node["degree"] for node in nodes.values()]) if nodes else 1
                
                for node_id, node_data in nodes.items():
                    degree_centrality[node_id] = node_data["degree"] / max_degree
                
                centrality_results["degree"] = degree_centrality
            
            # Betweenness centrality (спрощена реалізація)
            if "betweenness" in centrality_types:
                betweenness_centrality = {}
                
                # Спрощений розрахунок - в реальності потрібен алгоритм найкоротших шляхів
                for node_id in nodes:
                    # Евристична оцінка на основі кількості сусідів та їх ступенів
                    neighbors = adjacency_list[node_id]
                    if neighbors:
                        avg_neighbor_degree = sum(nodes[n]["degree"] for n in neighbors) / len(neighbors)
                        betweenness_centrality[node_id] = len(neighbors) * avg_neighbor_degree / 100
                    else:
                        betweenness_centrality[node_id] = 0.0
                
                centrality_results["betweenness"] = betweenness_centrality
            
            # Closeness centrality (спрощена реалізація)
            if "closeness" in centrality_types:
                closeness_centrality = {}
                
                for node_id in nodes:
                    # Спрощена оцінка - обернена до середньої відстані до сусідів
                    neighbors = adjacency_list[node_id]
                    if neighbors:
                        closeness_centrality[node_id] = len(neighbors) / len(nodes)
                    else:
                        closeness_centrality[node_id] = 0.0
                
                centrality_results["closeness"] = closeness_centrality
            
            # Топ вузлів за кожною метрикою
            top_nodes = {}
            for metric_name, metric_values in centrality_results.items():
                sorted_nodes = sorted(metric_values.items(), 
                                    key=lambda x: x[1], reverse=True)
                top_nodes[metric_name] = sorted_nodes[:10]
            
            return {
                "status": "success",
                "graph_id": graph_id,
                "centrality_metrics": centrality_results,
                "top_nodes": top_nodes
            }
            
        except Exception as e:
            self.logger.error("Failed to analyze centrality", error=str(e), graph_id=graph_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _find_communities(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Знаходить спільноти у графі"""
        
        graph_id = payload.get("graph_id")
        algorithm = payload.get("algorithm", "label_propagation")
        min_community_size = payload.get("min_community_size", 2)
        
        if graph_id not in self.graphs:
            return {
                "status": "error", 
                "error": f"Graph {graph_id} not found"
            }
        
        try:
            graph = self.graphs[graph_id]
            nodes = graph["nodes"]
            adjacency_list = graph["adjacency_list"]
            
            communities = {}
            
            if algorithm == "label_propagation":
                # Спрощений алгоритм поширення міток
                node_labels = {node_id: i for i, node_id in enumerate(nodes.keys())}
                
                # Симуляція ітерацій поширення міток
                for iteration in range(5):  # Обмежена кількість ітерацій
                    new_labels = {}
                    
                    for node_id in nodes:
                        neighbors = adjacency_list[node_id]
                        if neighbors:
                            # Найпоширеніша мітка серед сусідів
                            neighbor_labels = [node_labels[n] for n in neighbors]
                            most_common_label = max(set(neighbor_labels), 
                                                  key=neighbor_labels.count)
                            new_labels[node_id] = most_common_label
                        else:
                            new_labels[node_id] = node_labels[node_id]
                    
                    node_labels = new_labels
                
                # Групування вузлів за мітками
                label_groups = {}
                for node_id, label in node_labels.items():
                    if label not in label_groups:
                        label_groups[label] = []
                    label_groups[label].append(node_id)
                
                # Фільтрація малих спільнот
                community_id = 0
                for label, members in label_groups.items():
                    if len(members) >= min_community_size:
                        communities[f"community_{community_id}"] = {
                            "id": f"community_{community_id}",
                            "members": members,
                            "size": len(members),
                            "density": self._calculate_community_density(members, adjacency_list)
                        }
                        community_id += 1
            
            elif algorithm == "connected_components":
                # Знаходження зв'язаних компонентів
                visited = set()
                component_id = 0
                
                for node_id in nodes:
                    if node_id not in visited:
                        component = self._dfs_component(node_id, adjacency_list, visited)
                        if len(component) >= min_community_size:
                            communities[f"component_{component_id}"] = {
                                "id": f"component_{component_id}",
                                "members": component,
                                "size": len(component),
                                "density": self._calculate_community_density(component, adjacency_list)
                            }
                            component_id += 1
            
            # Статистика спільнот
            total_nodes_in_communities = sum(c["size"] for c in communities.values())
            modularity = self._calculate_modularity(communities, graph)
            
            return {
                "status": "success",
                "graph_id": graph_id,
                "algorithm": algorithm,
                "communities": list(communities.values()),
                "statistics": {
                    "num_communities": len(communities),
                    "coverage": total_nodes_in_communities / len(nodes) if nodes else 0,
                    "modularity": modularity,
                    "avg_community_size": total_nodes_in_communities / len(communities) if communities else 0
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to find communities", error=str(e), graph_id=graph_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _dfs_component(self, start_node: str, adjacency_list: dict, visited: set) -> list[str]:
        """Пошук у глибину для знаходження зв'язаної компоненти"""
        component = []
        stack = [start_node]
        
        while stack:
            node = stack.pop()
            if node not in visited:
                visited.add(node)
                component.append(node)
                
                for neighbor in adjacency_list.get(node, []):
                    if neighbor not in visited:
                        stack.append(neighbor)
        
        return component
    
    def _calculate_community_density(self, members: list[str], adjacency_list: dict) -> float:
        """Розраховує щільність спільноти"""
        if len(members) < 2:
            return 0.0
        
        internal_edges = 0
        for node in members:
            neighbors = adjacency_list.get(node, [])
            internal_edges += sum(1 for neighbor in neighbors if neighbor in members)
        
        max_possible_edges = len(members) * (len(members) - 1)
        return internal_edges / max_possible_edges if max_possible_edges > 0 else 0.0
    
    def _calculate_modularity(self, communities: dict, graph: dict) -> float:
        """Розраховує модулярність розбиття на спільноти (спрощена версія)"""
        # Спрощений розрахунок модулярності
        total_edges = len(graph["edges"])
        if total_edges == 0:
            return 0.0
        
        modularity = 0.0
        for community in communities.values():
            members = community["members"]
            internal_density = community["density"]
            community_size = len(members)
            
            # Спрощена формула модулярності
            expected_density = (community_size / len(graph["nodes"])) ** 2
            modularity += internal_density - expected_density
        
        return modularity / len(communities) if communities else 0.0
    
    async def _detect_patterns(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Виявляє структурні патерни у графі"""
        
        graph_id = payload.get("graph_id")
        pattern_types = payload.get("pattern_types", ["triangles", "stars", "chains"])
        
        if graph_id not in self.graphs:
            return {
                "status": "error",
                "error": f"Graph {graph_id} not found"
            }
        
        try:
            graph = self.graphs[graph_id]
            adjacency_list = graph["adjacency_list"]
            
            patterns = {}
            
            # Виявлення трикутників
            if "triangles" in pattern_types:
                triangles = []
                nodes = list(graph["nodes"].keys())
                
                for i, node1 in enumerate(nodes):
                    for j, node2 in enumerate(nodes[i+1:], i+1):
                        for k, node3 in enumerate(nodes[j+1:], j+1):
                            if (node2 in adjacency_list[node1] and
                                node3 in adjacency_list[node1] and
                                node3 in adjacency_list[node2]):
                                triangles.append([node1, node2, node3])
                
                patterns["triangles"] = {
                    "count": len(triangles),
                    "instances": triangles[:20]  # Обмежуємо вивід
                }
            
            # Виявлення зіркових структур
            if "stars" in pattern_types:
                stars = []
                for node_id, neighbors in adjacency_list.items():
                    if len(neighbors) >= 3:  # Мінімум 3 променя
                        # Перевіряємо, чи сусіди не з'єднані між собою
                        is_star = True
                        for i, neighbor1 in enumerate(neighbors):
                            for neighbor2 in neighbors[i+1:]:
                                if neighbor2 in adjacency_list.get(neighbor1, []):
                                    is_star = False
                                    break
                            if not is_star:
                                break
                        
                        if is_star:
                            stars.append({
                                "center": node_id,
                                "rays": neighbors,
                                "size": len(neighbors)
                            })
                
                patterns["stars"] = {
                    "count": len(stars),
                    "instances": stars[:10]
                }
            
            # Виявлення ланцюгів
            if "chains" in pattern_types:
                chains = []
                visited_edges = set()
                
                for node_id in graph["nodes"]:
                    if graph["nodes"][node_id]["degree"] <= 2:  # Потенційний кінець ланцюга
                        chain = self._find_chain_from_node(node_id, adjacency_list, visited_edges)
                        if len(chain) >= 3:  # Мінімальна довжина ланцюга
                            chains.append(chain)
                
                patterns["chains"] = {
                    "count": len(chains),
                    "instances": chains[:10]
                }
            
            return {
                "status": "success",
                "graph_id": graph_id,
                "patterns": patterns,
                "summary": {
                    pattern_type: pattern_data["count"] 
                    for pattern_type, pattern_data in patterns.items()
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to detect patterns", error=str(e), graph_id=graph_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _find_chain_from_node(self, start_node: str, adjacency_list: dict, 
                             visited_edges: set) -> list[str]:
        """Знаходить ланцюг, що починається з заданого вузла"""
        chain = [start_node]
        current = start_node
        
        while True:
            neighbors = adjacency_list.get(current, [])
            next_node = None
            
            for neighbor in neighbors:
                edge_key = tuple(sorted([current, neighbor]))
                if edge_key not in visited_edges and neighbor not in chain:
                    next_node = neighbor
                    visited_edges.add(edge_key)
                    break
            
            if next_node is None:
                break
                
            chain.append(next_node)
            current = next_node
            
            # Запобігання нескінченним циклам
            if len(chain) > 100:
                break
        
        return chain
    
    async def _calculate_shortest_path(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Обчислює найкоротший шлях між вузлами"""
        
        graph_id = payload.get("graph_id")
        source = payload.get("source")
        target = payload.get("target")
        
        if graph_id not in self.graphs:
            return {
                "status": "error",
                "error": f"Graph {graph_id} not found"
            }
        
        try:
            graph = self.graphs[graph_id]
            adjacency_list = graph["adjacency_list"]
            
            # Алгоритм BFS для знаходження найкоротшого шляху
            if source not in graph["nodes"] or target not in graph["nodes"]:
                return {
                    "status": "error",
                    "error": "Source or target node not found in graph"
                }
            
            if source == target:
                return {
                    "status": "success",
                    "path": [source],
                    "length": 0,
                    "distance": 0
                }
            
            # BFS
            queue = [(source, [source])]
            visited = {source}
            
            while queue:
                current, path = queue.pop(0)
                
                for neighbor in adjacency_list.get(current, []):
                    if neighbor == target:
                        final_path = path + [neighbor]
                        return {
                            "status": "success",
                            "source": source,
                            "target": target,
                            "path": final_path,
                            "length": len(final_path) - 1,
                            "distance": len(final_path) - 1  # Для невагового графа
                        }
                    
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, path + [neighbor]))
            
            return {
                "status": "success",
                "source": source,
                "target": target,
                "path": None,
                "length": -1,
                "distance": float('inf'),
                "message": "No path found"
            }
            
        except Exception as e:
            self.logger.error("Failed to calculate shortest path", error=str(e), graph_id=graph_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _analyze_connectivity(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Аналізує зв'язність графа"""
        
        graph_id = payload.get("graph_id")
        
        if graph_id not in self.graphs:
            return {
                "status": "error",
                "error": f"Graph {graph_id} not found"
            }
        
        try:
            graph = self.graphs[graph_id]
            nodes = graph["nodes"]
            adjacency_list = graph["adjacency_list"]
            
            # Знаходження зв'язаних компонентів
            visited = set()
            components = []
            
            for node_id in nodes:
                if node_id not in visited:
                    component = self._dfs_component(node_id, adjacency_list, visited)
                    components.append(component)
            
            # Аналіз зв'язності
            is_connected = len(components) == 1
            largest_component = max(components, key=len) if components else []
            
            # Розрахунок різних метрик зв'язності
            connectivity_metrics = {
                "is_connected": is_connected,
                "num_components": len(components),
                "largest_component_size": len(largest_component),
                "connectivity_ratio": len(largest_component) / len(nodes) if nodes else 0
            }
            
            # Аналіз мостів та точок артикуляції (спрощена версія)
            bridges = []
            articulation_points = []
            
            # Спрощений пошук точок артикуляції
            for node_id in nodes:
                if len(adjacency_list[node_id]) > 1:
                    # Видаляємо вузол та перевіряємо, чи граф залишається зв'язаним
                    temp_adj = {k: [n for n in v if n != node_id] 
                              for k, v in adjacency_list.items() if k != node_id}
                    
                    temp_visited = set()
                    temp_components = []
                    
                    for temp_node in temp_adj:
                        if temp_node not in temp_visited:
                            temp_comp = self._dfs_component(temp_node, temp_adj, temp_visited)
                            temp_components.append(temp_comp)
                    
                    if len(temp_components) > len(components):
                        articulation_points.append(node_id)
            
            return {
                "status": "success",
                "graph_id": graph_id,
                "connectivity": connectivity_metrics,
                "components": [
                    {
                        "id": i,
                        "size": len(comp),
                        "nodes": comp[:10]  # Обмежуємо вивід
                    }
                    for i, comp in enumerate(components)
                ],
                "critical_nodes": {
                    "articulation_points": articulation_points,
                    "bridges": bridges  # Поки що порожній
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to analyze connectivity", error=str(e), graph_id=graph_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _detect_anomalous_nodes(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Виявляє аномальні вузли у графі"""
        
        graph_id = payload.get("graph_id")
        anomaly_threshold = payload.get("anomaly_threshold", 2.0)
        
        if graph_id not in self.graphs:
            return {
                "status": "error",
                "error": f"Graph {graph_id} not found"
            }
        
        try:
            graph = self.graphs[graph_id]
            nodes = graph["nodes"]
            
            # Збір метрик для кожного вузла
            node_metrics = {}
            degrees = [node["degree"] for node in nodes.values()]
            
            if not degrees:
                return {
                    "status": "success",
                    "graph_id": graph_id,
                    "anomalous_nodes": [],
                    "summary": {"total_nodes": 0, "anomalous_count": 0}
                }
            
            mean_degree = sum(degrees) / len(degrees)
            std_degree = math.sqrt(sum((d - mean_degree) ** 2 for d in degrees) / len(degrees))
            
            anomalous_nodes = []
            
            for node_id, node_data in nodes.items():
                degree = node_data["degree"]
                
                # Z-score для ступеня вузла
                z_score = (degree - mean_degree) / std_degree if std_degree > 0 else 0
                
                is_anomalous = abs(z_score) > anomaly_threshold
                
                node_metrics[node_id] = {
                    "node_id": node_id,
                    "degree": degree,
                    "z_score": z_score,
                    "is_anomalous": is_anomalous,
                    "anomaly_type": "high_degree" if z_score > anomaly_threshold else 
                                  "low_degree" if z_score < -anomaly_threshold else "normal"
                }
                
                if is_anomalous:
                    anomalous_nodes.append(node_metrics[node_id])
            
            # Сортування за ступенем аномальності
            anomalous_nodes.sort(key=lambda x: abs(x["z_score"]), reverse=True)
            
            return {
                "status": "success",
                "graph_id": graph_id,
                "anomalous_nodes": anomalous_nodes,
                "statistics": {
                    "mean_degree": mean_degree,
                    "std_degree": std_degree,
                    "threshold": anomaly_threshold
                },
                "summary": {
                    "total_nodes": len(nodes),
                    "anomalous_count": len(anomalous_nodes),
                    "anomaly_rate": len(anomalous_nodes) / len(nodes) if nodes else 0
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to detect anomalous nodes", error=str(e), graph_id=graph_id)
            return {
                "status": "error",
                "error": str(e)
            }
