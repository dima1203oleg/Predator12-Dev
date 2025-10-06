"""
Агент автоматичного покращення системи
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Any

from .base_agent import BaseAgent


class AutoImproveAgent(BaseAgent):
    """Агент для автоматичного аналізу та покращення системи"""
    
    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__("AutoImproveAgent", config)
        self.improvement_history = []
        self.learning_data = {}
        
    def capabilities(self) -> list[str]:
        return [
            "analyze_performance",
            "suggest_optimizations",
            "auto_tune_parameters", 
            "learn_from_patterns",
            "generate_improvements",
            "evaluate_changes"
        ]
        
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання автопокращення"""
        
        self.logger.info("Processing auto-improvement task", task_type=task_type)
        
        if task_type == "analyze_performance":
            return await self._analyze_performance(payload)
        elif task_type == "suggest_optimizations":
            return await self._suggest_optimizations(payload)
        elif task_type == "auto_tune_parameters":
            return await self._auto_tune_parameters(payload)
        elif task_type == "learn_from_patterns":
            return await self._learn_from_patterns(payload)
        elif task_type == "generate_improvements":
            return await self._generate_improvements(payload)
        elif task_type == "evaluate_changes":
            return await self._evaluate_changes(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _analyze_performance(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Аналізує продуктивність системи"""
        
        component = payload.get("component", "system")
        time_period = payload.get("time_period", "last_hour")
        metrics = payload.get("metrics", ["response_time", "throughput", "error_rate"])
        
        try:
            # Симуляція збору метрик продуктивності
            performance_data = self._collect_performance_metrics(component, time_period, metrics)
            
            # Аналіз тенденцій
            trends_analysis = self._analyze_performance_trends(performance_data)
            
            # Виявлення вузьких місць
            bottlenecks = self._identify_bottlenecks(performance_data)
            
            # Оцінка загальної продуктивності
            performance_score = self._calculate_performance_score(performance_data)
            
            return {
                "status": "success",
                "component": component,
                "time_period": time_period,
                "performance_data": performance_data,
                "trends": trends_analysis,
                "bottlenecks": bottlenecks,
                "performance_score": performance_score,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to analyze performance", error=str(e), component=component)
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _collect_performance_metrics(self, component: str, period: str, metrics: list[str]) -> dict[str, Any]:
        """Збирає метрики продуктивності"""
        
        # Симуляція історичних даних
        base_data = {
            "response_time": {
                "current": 125.5,  # мс
                "average": 110.2,
                "min": 45.1,
                "max": 234.7,
                "trend": "increasing"
            },
            "throughput": {
                "current": 1250,  # req/sec
                "average": 1180,
                "min": 890,
                "max": 1450,
                "trend": "stable"
            },
            "error_rate": {
                "current": 2.1,  # %
                "average": 1.8,
                "min": 0.5,
                "max": 5.2,
                "trend": "increasing"
            },
            "cpu_usage": {
                "current": 72.5,  # %
                "average": 68.3,
                "min": 45.2,
                "max": 89.1,
                "trend": "increasing"
            },
            "memory_usage": {
                "current": 81.3,  # %
                "average": 75.6,
                "min": 62.1,
                "max": 94.2,
                "trend": "increasing"
            }
        }
        
        return {metric: base_data.get(metric, {}) for metric in metrics}
    
    def _analyze_performance_trends(self, data: dict[str, Any]) -> dict[str, Any]:
        """Аналізує тенденції продуктивності"""
        
        trends = {}
        
        for metric, values in data.items():
            trend = values.get("trend", "stable")
            current = values.get("current", 0)
            average = values.get("average", 0)
            
            change_percent = ((current - average) / average * 100) if average > 0 else 0
            
            trends[metric] = {
                "trend_direction": trend,
                "change_percent": round(change_percent, 2),
                "severity": self._assess_trend_severity(change_percent, metric),
                "recommendation": self._get_trend_recommendation(trend, metric, change_percent)
            }
        
        return trends
    
    def _assess_trend_severity(self, change_percent: float, metric: str) -> str:
        """Оцінює серйозність зміни тренду"""
        
        abs_change = abs(change_percent)
        
        # Різні пороги для різних метрик
        thresholds = {
            "response_time": {"warning": 10, "critical": 25},
            "error_rate": {"warning": 15, "critical": 50},
            "cpu_usage": {"warning": 10, "critical": 20},
            "memory_usage": {"warning": 15, "critical": 30},
            "default": {"warning": 15, "critical": 30}
        }
        
        metric_thresholds = thresholds.get(metric, thresholds["default"])
        
        if abs_change >= metric_thresholds["critical"]:
            return "critical"
        elif abs_change >= metric_thresholds["warning"]:
            return "warning"
        else:
            return "normal"
    
    def _get_trend_recommendation(self, trend: str, metric: str, change_percent: float) -> str:
        """Генерує рекомендації на основі тренду"""
        
        if metric == "response_time" and trend == "increasing":
            return "Consider optimizing database queries and adding caching"
        elif metric == "error_rate" and trend == "increasing":
            return "Investigate recent code deployments and error logs"
        elif metric == "cpu_usage" and trend == "increasing":
            return "Consider scaling compute resources or optimizing algorithms"
        elif metric == "memory_usage" and trend == "increasing":
            return "Check for memory leaks and optimize memory usage"
        else:
            return "Monitor trend and investigate if it continues"
    
    def _identify_bottlenecks(self, data: dict[str, Any]) -> list[dict[str, Any]]:
        """Виявляє вузькі місця"""
        
        bottlenecks = []
        
        for metric, values in data.items():
            current = values.get("current", 0)
            max_val = values.get("max", 0)
            
            # Розрахунок використання як відсоток від максимуму
            if max_val > 0:
                utilization = (current / max_val) * 100
                
                if utilization > 85:
                    bottlenecks.append({
                        "metric": metric,
                        "utilization_percent": round(utilization, 2),
                        "current_value": current,
                        "severity": "high" if utilization > 95 else "medium",
                        "impact": self._assess_bottleneck_impact(metric, utilization)
                    })
        
        return bottlenecks
    
    def _assess_bottleneck_impact(self, metric: str, utilization: float) -> str:
        """Оцінює вплив вузького місця"""
        
        impact_map = {
            "response_time": "User experience degradation",
            "cpu_usage": "Processing capacity limitation",
            "memory_usage": "Risk of out-of-memory errors",
            "error_rate": "Service reliability issues"
        }
        
        return impact_map.get(metric, "Performance degradation")
    
    def _calculate_performance_score(self, data: dict[str, Any]) -> dict[str, Any]:
        """Розраховує загальний бал продуктивності"""
        
        # Ваги для різних метрик
        weights = {
            "response_time": 0.3,
            "throughput": 0.25,
            "error_rate": 0.25,
            "cpu_usage": 0.1,
            "memory_usage": 0.1
        }
        
        total_score = 0
        weighted_sum = 0
        
        for metric, values in data.items():
            if metric in weights:
                # Простий розрахунок балу (0-100)
                current = values.get("current", 0)
                average = values.get("average", 0)
                
                if metric in ["response_time", "error_rate"]:
                    # Для цих метрик менше = краще
                    score = max(0, 100 - (current / average * 100)) if average > 0 else 50
                else:
                    # Для throughput більше = краще
                    score = min(100, (current / average * 100)) if average > 0 else 50
                
                total_score += score * weights[metric]
                weighted_sum += weights[metric]
        
        final_score = total_score / weighted_sum if weighted_sum > 0 else 0
        
        if final_score >= 90:
            grade = "excellent"
        elif final_score >= 75:
            grade = "good"
        elif final_score >= 60:
            grade = "fair"
        else:
            grade = "poor"
        
        return {
            "score": round(final_score, 2),
            "grade": grade,
            "components": {
                metric: {
                    "weight": weights.get(metric, 0),
                    "contribution": round(weights.get(metric, 0) * final_score / 100, 2)
                } for metric in data.keys() if metric in weights
            }
        }
    
    async def _suggest_optimizations(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Пропонує оптимізації системи"""
        
        performance_data = payload.get("performance_data", {})
        constraints = payload.get("constraints", {})
        priority = payload.get("priority", "performance")
        
        try:
            optimizations = []
            
            # Аналіз на основі метрик продуктивності
            if "response_time" in performance_data:
                rt_data = performance_data["response_time"]
                if rt_data.get("trend") == "increasing":
                    optimizations.extend(self._get_response_time_optimizations(rt_data))
            
            if "memory_usage" in performance_data:
                mem_data = performance_data["memory_usage"]
                if mem_data.get("current", 0) > 80:
                    optimizations.extend(self._get_memory_optimizations(mem_data))
            
            if "cpu_usage" in performance_data:
                cpu_data = performance_data["cpu_usage"]
                if cpu_data.get("current", 0) > 75:
                    optimizations.extend(self._get_cpu_optimizations(cpu_data))
            
            # Пріоритизація оптимізацій
            prioritized_optimizations = self._prioritize_optimizations(optimizations, priority, constraints)
            
            # Оцінка потенційного впливу
            impact_assessment = self._assess_optimization_impact(prioritized_optimizations)
            
            return {
                "status": "success",
                "optimizations": prioritized_optimizations,
                "impact_assessment": impact_assessment,
                "total_suggestions": len(optimizations),
                "priority_filter": priority
            }
            
        except Exception as e:
            self.logger.error("Failed to suggest optimizations", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _get_response_time_optimizations(self, rt_data: dict[str, Any]) -> list[dict[str, Any]]:
        """Отримує оптимізації для часу відгуку"""
        return [
            {
                "type": "caching",
                "title": "Implement Redis Caching",
                "description": "Add Redis caching layer for frequent database queries",
                "estimated_impact": "30-50% response time reduction",
                "implementation_effort": "medium",
                "cost": "low",
                "urgency": "high"
            },
            {
                "type": "database",
                "title": "Optimize Database Queries",
                "description": "Add indexes and optimize slow queries",
                "estimated_impact": "20-40% response time reduction",
                "implementation_effort": "high",
                "cost": "low",
                "urgency": "medium"
            }
        ]
    
    def _get_memory_optimizations(self, mem_data: dict[str, Any]) -> list[dict[str, Any]]:
        """Отримує оптимізації для пам'яті"""
        return [
            {
                "type": "memory",
                "title": "Implement Memory Pooling",
                "description": "Use object pools to reduce garbage collection",
                "estimated_impact": "15-25% memory usage reduction",
                "implementation_effort": "medium",
                "cost": "low",
                "urgency": "medium"
            },
            {
                "type": "scaling",
                "title": "Vertical Scaling",
                "description": "Increase memory allocation for containers",
                "estimated_impact": "Immediate relief from memory pressure",
                "implementation_effort": "low",
                "cost": "medium",
                "urgency": "high"
            }
        ]
    
    def _get_cpu_optimizations(self, cpu_data: dict[str, Any]) -> list[dict[str, Any]]:
        """Отримує оптимізації для CPU"""
        return [
            {
                "type": "algorithms",
                "title": "Algorithm Optimization",
                "description": "Replace O(n²) algorithms with more efficient alternatives",
                "estimated_impact": "40-60% CPU usage reduction",
                "implementation_effort": "high",
                "cost": "low",
                "urgency": "medium"
            },
            {
                "type": "scaling",
                "title": "Horizontal Scaling", 
                "description": "Add more processing instances",
                "estimated_impact": "Distribute CPU load across instances",
                "implementation_effort": "low",
                "cost": "high",
                "urgency": "high"
            }
        ]
    
    def _prioritize_optimizations(self, optimizations: list[dict[str, Any]], 
                                priority: str, constraints: dict[str, Any]) -> list[dict[str, Any]]:
        """Пріоритизує оптимізації"""
        
        # Визначення ваг для різних факторів
        if priority == "performance":
            weights = {"estimated_impact": 0.4, "urgency": 0.3, "implementation_effort": -0.2, "cost": -0.1}
        elif priority == "cost":
            weights = {"cost": -0.4, "estimated_impact": 0.3, "implementation_effort": -0.2, "urgency": 0.1}
        else:  # balanced
            weights = {"estimated_impact": 0.3, "urgency": 0.25, "implementation_effort": -0.25, "cost": -0.2}
        
        # Розрахунок балів
        for opt in optimizations:
            score = 0
            
            # Перетворення текстових значень на числові
            impact_score = self._text_to_score(opt.get("estimated_impact", ""), "impact")
            urgency_score = self._text_to_score(opt.get("urgency", ""), "urgency")
            effort_score = self._text_to_score(opt.get("implementation_effort", ""), "effort")
            cost_score = self._text_to_score(opt.get("cost", ""), "cost")
            
            score += impact_score * weights.get("estimated_impact", 0)
            score += urgency_score * weights.get("urgency", 0)
            score += effort_score * weights.get("implementation_effort", 0)
            score += cost_score * weights.get("cost", 0)
            
            opt["priority_score"] = round(score, 2)
        
        # Сортування за балом пріоритету
        optimizations.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        
        return optimizations
    
    def _text_to_score(self, text: str, category: str) -> float:
        """Перетворює текстові оцінки на числові бали"""
        
        scoring_maps = {
            "urgency": {"high": 3, "medium": 2, "low": 1},
            "effort": {"low": 3, "medium": 2, "high": 1},
            "cost": {"low": 3, "medium": 2, "high": 1},
            "impact": {}  # Складніша логіка для impact
        }
        
        if category == "impact":
            # Парсимо відсотки з тексту
            if "%" in text:
                import re
                percentages = re.findall(r'(\d+)-?(\d+)?%', text)
                if percentages:
                    if percentages[0][1]:  # Діапазон
                        avg_percent = (int(percentages[0][0]) + int(percentages[0][1])) / 2
                    else:  # Одне значення
                        avg_percent = int(percentages[0][0])
                    
                    return min(3, avg_percent / 20)  # Нормалізація до 0-3
            return 2  # За замовчуванням середній бал
        
        return scoring_maps.get(category, {}).get(text.lower(), 2)
    
    def _assess_optimization_impact(self, optimizations: list[dict[str, Any]]) -> dict[str, Any]:
        """Оцінює потенційний вплив оптимізацій"""
        
        total_optimizations = len(optimizations)
        high_impact = len([o for o in optimizations if "30%" in str(o.get("estimated_impact", ""))])
        low_effort = len([o for o in optimizations if o.get("implementation_effort") == "low"])
        
        return {
            "total_optimizations": total_optimizations,
            "high_impact_optimizations": high_impact,
            "low_effort_optimizations": low_effort,
            "estimated_timeline": self._estimate_implementation_timeline(optimizations),
            "risk_assessment": self._assess_implementation_risks(optimizations)
        }
    
    def _estimate_implementation_timeline(self, optimizations: list[dict[str, Any]]) -> dict[str, Any]:
        """Оцінює часові рамки імплементації"""
        
        effort_to_weeks = {"low": 1, "medium": 3, "high": 8}
        
        total_weeks = 0
        for opt in optimizations[:5]:  # Топ-5 оптимізацій
            effort = opt.get("implementation_effort", "medium")
            total_weeks += effort_to_weeks.get(effort, 3)
        
        return {
            "estimated_weeks": total_weeks,
            "parallel_possible": total_weeks * 0.6,  # Припускаємо 40% паралелізації
            "quick_wins": len([o for o in optimizations if o.get("implementation_effort") == "low"])
        }
    
    def _assess_implementation_risks(self, optimizations: list[dict[str, Any]]) -> dict[str, Any]:
        """Оцінює ризики імплементації"""
        
        high_risk_types = ["algorithms", "database"]
        medium_risk_types = ["caching", "scaling"]
        
        high_risk_count = len([o for o in optimizations if o.get("type") in high_risk_types])
        medium_risk_count = len([o for o in optimizations if o.get("type") in medium_risk_types])
        
        overall_risk = "high" if high_risk_count > 2 else "medium" if medium_risk_count > 1 else "low"
        
        return {
            "overall_risk": overall_risk,
            "high_risk_optimizations": high_risk_count,
            "medium_risk_optimizations": medium_risk_count,
            "risk_mitigation": [
                "Implement in staging environment first",
                "Create rollback plan for each optimization",
                "Monitor performance metrics closely during rollout"
            ]
        }
    
    async def _auto_tune_parameters(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Автоматично налаштовує параметри системи"""
        
        component = payload.get("component")
        parameters = payload.get("parameters", {})
        optimization_goal = payload.get("goal", "performance")
        
        try:
            # Симуляція автоматичного налаштування
            tuning_results = []
            
            for param_name, current_value in parameters.items():
                # Визначення оптимального значення на основі машинного навчання
                optimal_value = self._calculate_optimal_parameter(param_name, current_value, optimization_goal)
                
                tuning_result = {
                    "parameter": param_name,
                    "current_value": current_value,
                    "optimal_value": optimal_value,
                    "change_percent": ((optimal_value - current_value) / current_value * 100) if current_value != 0 else 0,
                    "expected_improvement": self._estimate_parameter_improvement(param_name, optimal_value, current_value)
                }
                
                tuning_results.append(tuning_result)
            
            # Збереження результатів для навчання
            self.learning_data[component] = {
                "timestamp": datetime.now().isoformat(),
                "tuning_results": tuning_results,
                "goal": optimization_goal
            }
            
            return {
                "status": "success",
                "component": component,
                "tuning_results": tuning_results,
                "optimization_goal": optimization_goal,
                "tuning_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to auto-tune parameters", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _calculate_optimal_parameter(self, param_name: str, current_value: float, goal: str) -> float:
        """Розраховує оптимальне значення параметра"""
        
        # Спрощена логіка оптимізації (в реальності використовувався б ML)
        optimization_rules = {
            "max_connections": {
                "performance": lambda x: min(x * 1.2, 1000),
                "memory": lambda x: max(x * 0.8, 50)
            },
            "cache_size": {
                "performance": lambda x: min(x * 1.5, 1024),
                "memory": lambda x: max(x * 0.9, 64)
            },
            "thread_pool_size": {
                "performance": lambda x: min(x * 1.3, 200),
                "cpu": lambda x: max(x * 0.7, 10)
            }
        }
        
        rule = optimization_rules.get(param_name, {}).get(goal)
        if rule:
            return rule(current_value)
        else:
            # За замовчуванням невелике покращення
            return current_value * 1.1
    
    def _estimate_parameter_improvement(self, param_name: str, optimal_value: float, current_value: float) -> str:
        """Оцінює очікуване покращення від зміни параметра"""
        
        change_percent = abs((optimal_value - current_value) / current_value * 100) if current_value != 0 else 0
        
        if change_percent > 50:
            return "significant improvement expected"
        elif change_percent > 20:
            return "moderate improvement expected"
        elif change_percent > 5:
            return "minor improvement expected"
        else:
            return "minimal change expected"
    
    async def _learn_from_patterns(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Навчається з патернів використання та продуктивності"""
        
        data_source = payload.get("data_source")
        learning_period = payload.get("period", "last_week")
        
        try:
            # Симуляція збору даних для навчання
            learning_data = self._collect_learning_data(data_source, learning_period)
            
            # Виявлення патернів
            patterns = self._identify_patterns(learning_data)
            
            # Генерація insights
            insights = self._generate_insights(patterns)
            
            # Оновлення моделі навчання
            self._update_learning_model(patterns, insights)
            
            return {
                "status": "success",
                "data_source": data_source,
                "learning_period": learning_period,
                "patterns_discovered": len(patterns),
                "patterns": patterns,
                "insights": insights,
                "model_updated": True
            }
            
        except Exception as e:
            self.logger.error("Failed to learn from patterns", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _collect_learning_data(self, source: str, period: str) -> dict[str, Any]:
        """Збирає дані для навчання"""
        
        return {
            "usage_patterns": [
                {"time": "09:00", "load": 0.3, "response_time": 95},
                {"time": "12:00", "load": 0.8, "response_time": 145},
                {"time": "15:00", "load": 0.6, "response_time": 110},
                {"time": "18:00", "load": 0.9, "response_time": 180},
                {"time": "21:00", "load": 0.4, "response_time": 85}
            ],
            "error_patterns": [
                {"error_type": "timeout", "frequency": 12, "avg_load": 0.85},
                {"error_type": "connection", "frequency": 5, "avg_load": 0.92}
            ],
            "performance_correlations": {
                "load_vs_response_time": 0.89,
                "memory_vs_gc_frequency": 0.76,
                "cpu_vs_queue_length": 0.82
            }
        }
    
    def _identify_patterns(self, data: dict[str, Any]) -> list[dict[str, Any]]:
        """Виявляє патерни в даних"""
        
        patterns = []
        
        # Аналіз патернів навантаження
        usage_data = data.get("usage_patterns", [])
        if usage_data:
            peak_hours = [u for u in usage_data if u["load"] > 0.7]
            if peak_hours:
                patterns.append({
                    "type": "peak_usage",
                    "description": f"High load detected during {len(peak_hours)} time periods",
                    "details": peak_hours,
                    "confidence": 0.85
                })
        
        # Аналіз патернів помилок
        error_data = data.get("error_patterns", [])
        for error in error_data:
            if error["avg_load"] > 0.8:
                patterns.append({
                    "type": "load_related_errors",
                    "description": f"{error['error_type']} errors correlate with high load",
                    "details": error,
                    "confidence": 0.78
                })
        
        # Аналіз кореляцій
        correlations = data.get("performance_correlations", {})
        for correlation, value in correlations.items():
            if value > 0.8:
                patterns.append({
                    "type": "strong_correlation",
                    "description": f"Strong correlation found: {correlation}",
                    "correlation_value": value,
                    "confidence": min(value, 0.95)
                })
        
        return patterns
    
    def _generate_insights(self, patterns: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Генерує insights на основі патернів"""
        
        insights = []
        
        for pattern in patterns:
            if pattern["type"] == "peak_usage":
                insights.append({
                    "category": "capacity_planning",
                    "insight": "Consider implementing auto-scaling during peak hours",
                    "actionable": True,
                    "priority": "high",
                    "based_on": pattern["type"]
                })
            
            elif pattern["type"] == "load_related_errors":
                insights.append({
                    "category": "error_prevention", 
                    "insight": "Implement circuit breakers to prevent cascade failures during high load",
                    "actionable": True,
                    "priority": "medium",
                    "based_on": pattern["type"]
                })
            
            elif pattern["type"] == "strong_correlation":
                insights.append({
                    "category": "monitoring",
                    "insight": f"Monitor {pattern['description']} as leading indicator",
                    "actionable": True,
                    "priority": "low",
                    "based_on": pattern["type"]
                })
        
        return insights
    
    def _update_learning_model(self, patterns: list[dict[str, Any]], insights: list[dict[str, Any]]):
        """Оновлює модель машинного навчання"""
        
        # Симуляція оновлення моделі
        self.learning_data["model_version"] = self.learning_data.get("model_version", 0) + 1
        self.learning_data["last_update"] = datetime.now().isoformat()
        self.learning_data["patterns_learned"] = len(patterns)
        self.learning_data["insights_generated"] = len(insights)
    
    async def _generate_improvements(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Генерує конкретні покращення на основі аналізу"""
        
        focus_area = payload.get("focus_area", "overall")
        timeframe = payload.get("timeframe", "short_term")
        
        try:
            improvements = []
            
            if focus_area in ["overall", "performance"]:
                improvements.extend(self._generate_performance_improvements(timeframe))
            
            if focus_area in ["overall", "reliability"]:
                improvements.extend(self._generate_reliability_improvements(timeframe))
            
            if focus_area in ["overall", "efficiency"]:
                improvements.extend(self._generate_efficiency_improvements(timeframe))
            
            # Пріоритизація покращень
            prioritized = self._prioritize_improvements(improvements, timeframe)
            
            return {
                "status": "success",
                "focus_area": focus_area,
                "timeframe": timeframe,
                "total_improvements": len(improvements),
                "improvements": prioritized,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to generate improvements", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _generate_performance_improvements(self, timeframe: str) -> list[dict[str, Any]]:
        """Генерує покращення продуктивності"""
        
        if timeframe == "short_term":
            return [
                {
                    "category": "performance",
                    "title": "Enable Response Compression",
                    "description": "Enable gzip compression for HTTP responses",
                    "effort": "low",
                    "impact": "medium",
                    "timeline": "1 day"
                }
            ]
        else:
            return [
                {
                    "category": "performance",
                    "title": "Implement Microservices Architecture",
                    "description": "Break monolith into scalable microservices",
                    "effort": "high",
                    "impact": "high",
                    "timeline": "3 months"
                }
            ]
    
    def _generate_reliability_improvements(self, timeframe: str) -> list[dict[str, Any]]:
        """Генерує покращення надійності"""
        
        return [
            {
                "category": "reliability",
                "title": "Implement Health Checks",
                "description": "Add comprehensive health check endpoints",
                "effort": "low" if timeframe == "short_term" else "medium",
                "impact": "high",
                "timeline": "3 days" if timeframe == "short_term" else "2 weeks"
            }
        ]
    
    def _generate_efficiency_improvements(self, timeframe: str) -> list[dict[str, Any]]:
        """Генерує покращення ефективності"""
        
        return [
            {
                "category": "efficiency",
                "title": "Optimize Container Images",
                "description": "Reduce Docker image sizes and build times",
                "effort": "medium",
                "impact": "medium",
                "timeline": "1 week"
            }
        ]
    
    def _prioritize_improvements(self, improvements: list[dict[str, Any]], timeframe: str) -> list[dict[str, Any]]:
        """Пріоритизує покращення"""
        
        # Простий алгоритм пріоритизації
        for improvement in improvements:
            effort_score = {"low": 3, "medium": 2, "high": 1}.get(improvement.get("effort", "medium"), 2)
            impact_score = {"low": 1, "medium": 2, "high": 3}.get(improvement.get("impact", "medium"), 2)
            
            # Для короткострокового планування віддаємо перевагу низьким зусиллям
            if timeframe == "short_term":
                priority_score = effort_score * 0.6 + impact_score * 0.4
            else:
                priority_score = effort_score * 0.3 + impact_score * 0.7
            
            improvement["priority_score"] = round(priority_score, 2)
        
        # Сортування за пріоритетом
        improvements.sort(key=lambda x: x.get("priority_score", 0), reverse=True)
        
        return improvements
    
    async def _evaluate_changes(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Оцінює ефективність внесених змін"""
        
        change_id = payload.get("change_id")
        evaluation_period = payload.get("period", "24h")
        
        try:
            # Симуляція оцінки змін
            evaluation_results = {
                "change_id": change_id,
                "evaluation_period": evaluation_period,
                "metrics_before": {
                    "response_time_avg": 125.5,
                    "error_rate": 2.1,
                    "throughput": 1250
                },
                "metrics_after": {
                    "response_time_avg": 98.2,
                    "error_rate": 1.3,
                    "throughput": 1450
                },
                "improvements": {
                    "response_time": "21.8% improvement",
                    "error_rate": "38.1% reduction",
                    "throughput": "16.0% increase"
                },
                "overall_success": True,
                "confidence_level": 0.87
            }
            
            # Запис у історію покращень
            self.improvement_history.append({
                "timestamp": datetime.now().isoformat(),
                "change_id": change_id,
                "evaluation": evaluation_results,
                "success": evaluation_results["overall_success"]
            })
            
            return {
                "status": "success",
                "evaluation": evaluation_results
            }
            
        except Exception as e:
            self.logger.error("Failed to evaluate changes", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
