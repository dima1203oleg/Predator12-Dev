"""
Optimization Agent
==================

Агент для автоматичної оптимізації системи, продуктивності,
ресурсів та архітектури додатка.
"""

import asyncio
import logging
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
import psutil
import subprocess
import yaml

from .base import BaseAgent, AgentTask, AgentStatus, TaskPriority, RiskLevel

logger = logging.getLogger(__name__)

class OptimizationAgent(BaseAgent):
    """
    Агент оптимізації системи
    
    Функції:
    - Оптимізація продуктивності
    - Налаштування ресурсів
    - Аналіз та покращення архітектури
    - Оптимізація запитів та алгоритмів
    - Автоматичне масштабування
    """
    
    def __init__(self, agent_id: str = None, **config):
        super().__init__(
            agent_id=agent_id or "optimization-agent",
            name="Optimization Agent",
            description="Автоматична оптимізація системи та продуктивності",
            capabilities=[
                "performance_optimization",
                "resource_tuning",
                "architecture_analysis",
                "query_optimization",
                "auto_scaling",
                "cache_optimization"
            ],
            **config
        )
        
        # Налаштування оптимізації
        self.optimization_thresholds = config.get('optimization_thresholds', {
            'cpu_target': 70.0,
            'memory_target': 80.0,
            'response_time_target': 200,  # ms
            'throughput_target': 1000,   # req/min
            'cache_hit_ratio_target': 0.95
        })
        
        # Історія оптимізацій
        self.optimization_history = []
        self.performance_baseline = None
        
        # Статистика оптимізацій
        self.optimization_stats = {
            'total_optimizations': 0,
            'successful_optimizations': 0,
            'performance_improvements': 0,
            'resource_savings': 0,
            'average_improvement': 0.0
        }
        
        # Кеш метрик продуктивності
        self.performance_cache = {}
        self.last_performance_check = None
        
    async def plan_task(self, task: AgentTask) -> Dict[str, Any]:
        """Планування завдання оптимізації"""
        
        task_type = task.payload.get('type', 'performance_analysis')
        
        if task_type == 'performance_analysis':
            return await self._plan_performance_analysis(task)
        elif task_type == 'resource_optimization':
            return await self._plan_resource_optimization(task)
        elif task_type == 'architecture_optimization':
            return await self._plan_architecture_optimization(task)
        elif task_type == 'query_optimization':
            return await self._plan_query_optimization(task)
        elif task_type == 'cache_optimization':
            return await self._plan_cache_optimization(task)
        else:
            return {
                'steps': [
                    {
                        'action': 'unknown_optimization_type',
                        'description': f'Невідомий тип оптимізації: {task_type}',
                        'estimated_duration': 1
                    }
                ],
                'estimated_duration': 1,
                'risk_level': RiskLevel.LOW,
                'resources_needed': []
            }
    
    async def _plan_performance_analysis(self, task: AgentTask) -> Dict[str, Any]:
        """Планування аналізу продуктивності"""
        
        target_component = task.payload.get('component', 'all')
        
        steps = [
            {
                'action': 'collect_baseline_metrics',
                'description': 'Збір базових метрик продуктивності',
                'estimated_duration': 60
            },
            {
                'action': 'analyze_system_performance',
                'description': 'Аналіз продуктивності системи',
                'estimated_duration': 120
            },
            {
                'action': 'identify_bottlenecks',
                'description': 'Виявлення вузьких місць',
                'estimated_duration': 90
            },
            {
                'action': 'generate_optimization_recommendations',
                'description': 'Генерація рекомендацій для оптимізації',
                'estimated_duration': 60
            }
        ]
        
        if target_component == 'database':
            steps.append({
                'action': 'analyze_database_performance',
                'description': 'Аналіз продуктивності бази даних',
                'estimated_duration': 180
            })
        
        if target_component == 'api':
            steps.append({
                'action': 'analyze_api_performance',
                'description': 'Аналіз продуктивності API',
                'estimated_duration': 120
            })
        
        return {
            'steps': steps,
            'estimated_duration': sum(step['estimated_duration'] for step in steps),
            'risk_level': RiskLevel.SAFE,
            'resources_needed': ['performance_monitoring', 'system_access']
        }
    
    async def _plan_resource_optimization(self, task: AgentTask) -> Dict[str, Any]:
        """Планування оптимізації ресурсів"""
        
        resource_type = task.payload.get('resource_type', 'all')
        
        steps = [
            {
                'action': 'analyze_resource_usage',
                'description': 'Аналіз використання ресурсів',
                'estimated_duration': 60
            },
            {
                'action': 'identify_resource_waste',
                'description': 'Виявлення марнотратства ресурсів',
                'estimated_duration': 45
            }
        ]
        
        if resource_type in ['all', 'memory']:
            steps.append({
                'action': 'optimize_memory_usage',
                'description': 'Оптимізація використання пам\'яті',
                'estimated_duration': 90
            })
        
        if resource_type in ['all', 'cpu']:
            steps.append({
                'action': 'optimize_cpu_usage',
                'description': 'Оптимізація використання CPU',
                'estimated_duration': 120
            })
        
        if resource_type in ['all', 'network']:
            steps.append({
                'action': 'optimize_network_usage',
                'description': 'Оптимізація мережевого трафіку',
                'estimated_duration': 75
            })
        
        steps.append({
            'action': 'validate_resource_improvements',
            'description': 'Валідація покращень ресурсів',
            'estimated_duration': 60
        })
        
        return {
            'steps': steps,
            'estimated_duration': sum(step['estimated_duration'] for step in steps),
            'risk_level': RiskLevel.MEDIUM,
            'resources_needed': ['system_access', 'configuration_control']
        }
    
    async def execute_task(self, task: AgentTask, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Виконання завдання оптимізації"""
        
        results = {}
        optimization_metrics = {
            'before': {},
            'after': {},
            'improvements': {}
        }
        
        try:
            # Збір початкових метрик
            optimization_metrics['before'] = await self._collect_performance_metrics()
            
            for i, step in enumerate(plan['steps']):
                action = step['action']
                
                logger.info(f"Виконання кроку оптимізації {i+1}/{len(plan['steps'])}: {step['description']}")
                
                step_result = await self._execute_optimization_step(action, task, step)
                results[f"step_{i+1}_{action}"] = step_result
                
                # Перевірка на критичні помилки
                if step_result.get('critical_error'):
                    logger.error(f"Критична помилка на кроці {action}: {step_result.get('error')}")
                    break
                
                await asyncio.sleep(2)  # Короткий інтервал між кроками
            
            # Збір фінальних метрик
            optimization_metrics['after'] = await self._collect_performance_metrics()
            
            # Розрахунок покращень
            optimization_metrics['improvements'] = await self._calculate_improvements(
                optimization_metrics['before'], 
                optimization_metrics['after']
            )
            
            # Оновлення статистики
            self._update_optimization_stats(task, results, optimization_metrics['improvements'])
            
            return {
                'success': True,
                'results': results,
                'metrics': optimization_metrics,
                'statistics': self.optimization_stats.copy(),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Помилка виконання завдання оптимізації: {e}")
            return {
                'success': False,
                'error': str(e),
                'partial_results': results,
                'partial_metrics': optimization_metrics,
                'timestamp': datetime.now().isoformat()
            }
    
    async def _execute_optimization_step(self, action: str, task: AgentTask, step: Dict[str, Any]) -> Dict[str, Any]:
        """Виконання окремого кроку оптимізації"""
        
        try:
            if action == 'collect_baseline_metrics':
                return await self._collect_baseline_metrics()
            elif action == 'analyze_system_performance':
                return await self._analyze_system_performance()
            elif action == 'identify_bottlenecks':
                return await self._identify_bottlenecks()
            elif action == 'generate_optimization_recommendations':
                return await self._generate_optimization_recommendations()
            elif action == 'analyze_resource_usage':
                return await self._analyze_resource_usage()
            elif action == 'identify_resource_waste':
                return await self._identify_resource_waste()
            elif action == 'optimize_memory_usage':
                return await self._optimize_memory_usage()
            elif action == 'optimize_cpu_usage':
                return await self._optimize_cpu_usage()
            elif action == 'optimize_network_usage':
                return await self._optimize_network_usage()
            elif action == 'validate_resource_improvements':
                return await self._validate_resource_improvements()
            else:
                return {
                    'success': False,
                    'error': f'Невідома дія оптимізації: {action}'
                }
                
        except Exception as e:
            logger.error(f"Помилка виконання дії {action}: {e}")
            return {
                'success': False,
                'error': str(e),
                'critical_error': True
            }
    
    async def _collect_performance_metrics(self) -> Dict[str, Any]:
        """Збір метрик продуктивності"""
        
        try:
            metrics = {}
            
            # Системні метрики
            metrics['cpu'] = {
                'percent': psutil.cpu_percent(interval=1),
                'count': psutil.cpu_count(),
                'freq': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
            }
            
            # Метрики пам'яті
            memory = psutil.virtual_memory()
            metrics['memory'] = {
                'total': memory.total,
                'available': memory.available,
                'percent': memory.percent,
                'used': memory.used
            }
            
            # Метрики диску
            disk = psutil.disk_usage('/')
            metrics['disk'] = {
                'total': disk.total,
                'used': disk.used,
                'free': disk.free,
                'percent': disk.percent
            }
            
            # Мережеві метрики
            network = psutil.net_io_counters()
            metrics['network'] = {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv
            }
            
            # Метрики процесів
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            # Топ 10 процесів по CPU
            metrics['top_cpu_processes'] = sorted(
                processes, key=lambda x: x.get('cpu_percent', 0), reverse=True
            )[:10]
            
            # Топ 10 процесів по пам'яті
            metrics['top_memory_processes'] = sorted(
                processes, key=lambda x: x.get('memory_percent', 0), reverse=True
            )[:10]
            
            metrics['timestamp'] = datetime.now().isoformat()
            
            return metrics
            
        except Exception as e:
            return {
                'error': f"Помилка збору метрик: {e}",
                'timestamp': datetime.now().isoformat()
            }
    
    async def _analyze_system_performance(self) -> Dict[str, Any]:
        """Аналіз продуктивності системи"""
        
        try:
            # Збір розширених метрик за період
            metrics_history = []
            
            for i in range(10):  # 10 замірів з інтервалом 3 секунди
                metrics = await self._collect_performance_metrics()
                metrics_history.append(metrics)
                if i < 9:  # Не затримуватися після останнього заміру
                    await asyncio.sleep(3)
            
            # Аналіз тенденцій
            analysis = {
                'cpu_trend': self._analyze_metric_trend(metrics_history, 'cpu.percent'),
                'memory_trend': self._analyze_metric_trend(metrics_history, 'memory.percent'),
                'performance_score': 0,
                'issues': [],
                'recommendations': []
            }
            
            # Розрахунок оцінки продуктивності
            avg_cpu = analysis['cpu_trend']['average']
            avg_memory = analysis['memory_trend']['average']
            
            performance_score = 100
            
            if avg_cpu > 80:
                performance_score -= 30
                analysis['issues'].append('Високе навантаження CPU')
                analysis['recommendations'].append('Оптимізувати CPU-intensive операції')
            elif avg_cpu > 60:
                performance_score -= 15
                analysis['recommendations'].append('Моніторити навантаження CPU')
            
            if avg_memory > 85:
                performance_score -= 25
                analysis['issues'].append('Високе використання пам\'яті')
                analysis['recommendations'].append('Оптимізувати використання пам\'яті')
            elif avg_memory > 70:
                performance_score -= 10
                analysis['recommendations'].append('Моніторити використання пам\'яті')
            
            analysis['performance_score'] = max(0, performance_score)
            
            return {
                'success': True,
                'analysis': analysis,
                'metrics_samples': len(metrics_history),
                'monitoring_duration': '30 seconds'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Помилка аналізу продуктивності: {e}"
            }
    
    def _analyze_metric_trend(self, metrics_history: List[Dict], metric_path: str) -> Dict[str, Any]:
        """Аналіз тенденції для конкретної метрики"""
        
        values = []
        
        for metrics in metrics_history:
            try:
                # Навігація по шляху метрики (наприклад, 'cpu.percent')
                value = metrics
                for part in metric_path.split('.'):
                    value = value[part]
                values.append(float(value))
            except (KeyError, TypeError, ValueError):
                continue
        
        if not values:
            return {'error': 'Немає даних для аналізу'}
        
        return {
            'average': sum(values) / len(values),
            'min': min(values),
            'max': max(values),
            'trend': 'increasing' if values[-1] > values[0] else 'decreasing' if values[-1] < values[0] else 'stable',
            'variance': self._calculate_variance(values),
            'samples': len(values)
        }
    
    def _calculate_variance(self, values: List[float]) -> float:
        """Розрахунок дисперсії"""
        if len(values) < 2:
            return 0.0
        
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        return variance
    
    async def _identify_bottlenecks(self) -> Dict[str, Any]:
        """Виявлення вузьких місць системи"""
        
        try:
            bottlenecks = []
            
            # Аналіз CPU вузьких місць
            cpu_percent = psutil.cpu_percent(interval=1)
            if cpu_percent > 80:
                bottlenecks.append({
                    'type': 'cpu',
                    'severity': 'high',
                    'description': f'Високе навантаження CPU: {cpu_percent:.1f}%',
                    'recommendation': 'Оптимізувати алгоритми або додати CPU ресурси'
                })
            
            # Аналіз пам'яті
            memory = psutil.virtual_memory()
            if memory.percent > 85:
                bottlenecks.append({
                    'type': 'memory',
                    'severity': 'high',
                    'description': f'Високе використання пам\'яті: {memory.percent:.1f}%',
                    'recommendation': 'Оптимізувати використання пам\'яті або додати RAM'
                })
            
            # Аналіз диску
            disk = psutil.disk_usage('/')
            if disk.percent > 90:
                bottlenecks.append({
                    'type': 'disk',
                    'severity': 'critical',
                    'description': f'Високе використання диску: {disk.percent:.1f}%',
                    'recommendation': 'Очистити диск або додати сховище'
                })
            
            # Аналіз процесів-споживачів ресурсів
            high_cpu_processes = []
            high_memory_processes = []
            
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    info = proc.info
                    if info['cpu_percent'] > 10:
                        high_cpu_processes.append(info)
                    if info['memory_percent'] > 5:
                        high_memory_processes.append(info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            if high_cpu_processes:
                bottlenecks.append({
                    'type': 'process_cpu',
                    'severity': 'medium',
                    'description': f'Знайдено {len(high_cpu_processes)} процесів з високим CPU',
                    'details': high_cpu_processes[:5],  # Топ 5
                    'recommendation': 'Оптимізувати або обмежити ресурсоємні процеси'
                })
            
            if high_memory_processes:
                bottlenecks.append({
                    'type': 'process_memory',
                    'severity': 'medium',
                    'description': f'Знайдено {len(high_memory_processes)} процесів з високою пам\'яттю',
                    'details': high_memory_processes[:5],  # Топ 5
                    'recommendation': 'Оптимізувати використання пам\'яті в процесах'
                })
            
            return {
                'success': True,
                'bottlenecks': bottlenecks,
                'bottlenecks_count': len(bottlenecks),
                'severity_distribution': {
                    'critical': len([b for b in bottlenecks if b['severity'] == 'critical']),
                    'high': len([b for b in bottlenecks if b['severity'] == 'high']),
                    'medium': len([b for b in bottlenecks if b['severity'] == 'medium']),
                    'low': len([b for b in bottlenecks if b['severity'] == 'low'])
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Помилка виявлення вузьких місць: {e}"
            }
    
    async def _optimize_memory_usage(self) -> Dict[str, Any]:
        """Оптимізація використання пам'яті"""
        
        try:
            optimizations_applied = []
            memory_before = psutil.virtual_memory().percent
            
            # 1. Очищення кешу Python
            try:
                import gc
                collected = gc.collect()
                optimizations_applied.append(f'Очищено Python garbage collection: {collected} об\'єктів')
            except Exception as e:
                logger.warning(f"Помилка очищення GC: {e}")
            
            # 2. Очищення системного кешу (якщо можливо)
            try:
                if hasattr(psutil, 'virtual_memory'):
                    # Спроба звільнити кеші через drop_caches (потрібні права root)
                    result = subprocess.run(
                        ['sudo', 'sync'], 
                        capture_output=True, 
                        text=True, 
                        timeout=10
                    )
                    if result.returncode == 0:
                        optimizations_applied.append('Синхронізовано дані з диском')
            except Exception as e:
                logger.debug(f"Не вдалося очистити системний кеш: {e}")
            
            # 3. Пошук процесів з витоком пам'яті
            memory_leaks = []
            for proc in psutil.process_iter(['pid', 'name', 'memory_percent', 'create_time']):
                try:
                    info = proc.info
                    # Перевірка на процеси з дуже високим споживанням пам'яті
                    if info['memory_percent'] > 20:
                        uptime = time.time() - info['create_time']
                        memory_leaks.append({
                            'pid': info['pid'],
                            'name': info['name'],
                            'memory_percent': info['memory_percent'],
                            'uptime_hours': uptime / 3600
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
            
            memory_after = psutil.virtual_memory().percent
            memory_saved = memory_before - memory_after
            
            return {
                'success': True,
                'memory_before': memory_before,
                'memory_after': memory_after,
                'memory_saved': memory_saved,
                'optimizations_applied': optimizations_applied,
                'potential_memory_leaks': memory_leaks,
                'recommendations': [
                    'Моніторити процеси з високим споживанням пам\'яті',
                    'Регулярно перезапускати довготривалі процеси',
                    'Додати swap файл якщо потрібно'
                ]
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Помилка оптимізації пам'яті: {e}"
            }
    
    async def _calculate_improvements(self, before: Dict[str, Any], after: Dict[str, Any]) -> Dict[str, Any]:
        """Розрахунок покращень після оптимізації"""
        
        improvements = {}
        
        try:
            # Покращення CPU
            if 'cpu' in before and 'cpu' in after:
                cpu_before = before['cpu'].get('percent', 0)
                cpu_after = after['cpu'].get('percent', 0)
                cpu_improvement = cpu_before - cpu_after
                improvements['cpu'] = {
                    'before': cpu_before,
                    'after': cpu_after,
                    'improvement': cpu_improvement,
                    'improvement_percent': (cpu_improvement / cpu_before * 100) if cpu_before > 0 else 0
                }
            
            # Покращення пам'яті
            if 'memory' in before and 'memory' in after:
                memory_before = before['memory'].get('percent', 0)
                memory_after = after['memory'].get('percent', 0)
                memory_improvement = memory_before - memory_after
                improvements['memory'] = {
                    'before': memory_before,
                    'after': memory_after,
                    'improvement': memory_improvement,
                    'improvement_percent': (memory_improvement / memory_before * 100) if memory_before > 0 else 0
                }
            
            # Загальна оцінка покращення
            total_improvement = 0
            improvement_count = 0
            
            for metric, data in improvements.items():
                if data.get('improvement', 0) > 0:
                    total_improvement += data['improvement_percent']
                    improvement_count += 1
            
            improvements['overall'] = {
                'average_improvement_percent': total_improvement / improvement_count if improvement_count > 0 else 0,
                'improved_metrics': improvement_count,
                'successful': improvement_count > 0
            }
            
            return improvements
            
        except Exception as e:
            return {
                'error': f"Помилка розрахунку покращень: {e}",
                'before': before,
                'after': after
            }
    
    def _update_optimization_stats(self, task: AgentTask, results: Dict[str, Any], improvements: Dict[str, Any]):
        """Оновлення статистики оптимізацій"""
        
        self.optimization_stats['total_optimizations'] += 1
        
        # Аналіз успішності оптимізації
        overall_improvement = improvements.get('overall', {})
        if overall_improvement.get('successful', False):
            self.optimization_stats['successful_optimizations'] += 1
            
            improvement_percent = overall_improvement.get('average_improvement_percent', 0)
            if improvement_percent > 0:
                self.optimization_stats['performance_improvements'] += 1
                
                # Оновлення середнього покращення
                current_avg = self.optimization_stats['average_improvement']
                total_opts = self.optimization_stats['total_optimizations']
                new_avg = ((current_avg * (total_opts - 1)) + improvement_percent) / total_opts
                self.optimization_stats['average_improvement'] = new_avg
    
    async def get_optimization_recommendations(self, target: str = 'system') -> Dict[str, Any]:
        """Отримання рекомендацій для оптимізації"""
        
        try:
            # Збір поточних метрик
            metrics = await self._collect_performance_metrics()
            
            recommendations = {
                'immediate': [],
                'short_term': [],
                'long_term': [],
                'priority_score': 0
            }
            
            # Аналіз CPU
            cpu_percent = metrics.get('cpu', {}).get('percent', 0)
            if cpu_percent > 85:
                recommendations['immediate'].append({
                    'category': 'cpu',
                    'priority': 'critical',
                    'description': 'Критично високе навантаження CPU',
                    'action': 'Зупинити неважливі процеси або додати CPU ресурси',
                    'estimated_impact': 'high'
                })
                recommendations['priority_score'] += 30
            elif cpu_percent > 70:
                recommendations['short_term'].append({
                    'category': 'cpu',
                    'priority': 'medium',
                    'description': 'Помірно високе навантаження CPU',
                    'action': 'Оптимізувати алгоритми та CPU-intensive операції',
                    'estimated_impact': 'medium'
                })
                recommendations['priority_score'] += 15
            
            # Аналіз пам'яті
            memory_percent = metrics.get('memory', {}).get('percent', 0)
            if memory_percent > 90:
                recommendations['immediate'].append({
                    'category': 'memory',
                    'priority': 'critical',
                    'description': 'Критично високе використання пам\'яті',
                    'action': 'Звільнити пам\'ять або додати RAM',
                    'estimated_impact': 'high'
                })
                recommendations['priority_score'] += 25
            elif memory_percent > 75:
                recommendations['short_term'].append({
                    'category': 'memory',
                    'priority': 'medium',
                    'description': 'Високе використання пам\'яті',
                    'action': 'Оптимізувати використання пам\'яті в додатках',
                    'estimated_impact': 'medium'
                })
                recommendations['priority_score'] += 12
            
            # Довгострокові рекомендації
            recommendations['long_term'].extend([
                {
                    'category': 'architecture',
                    'priority': 'low',
                    'description': 'Архітектурна оптимізація',
                    'action': 'Розглянути мікросервісну архітектуру',
                    'estimated_impact': 'high'
                },
                {
                    'category': 'caching',
                    'priority': 'medium',
                    'description': 'Покращення кешування',
                    'action': 'Впровадити розподілене кешування',
                    'estimated_impact': 'medium'
                },
                {
                    'category': 'monitoring',
                    'priority': 'low',
                    'description': 'Покращення моніторингу',
                    'action': 'Додати більше метрик продуктивності',
                    'estimated_impact': 'low'
                }
            ])
            
            # Сортування за пріоритетом
            for category in ['immediate', 'short_term', 'long_term']:
                recommendations[category].sort(
                    key=lambda x: {'critical': 3, 'high': 2, 'medium': 1, 'low': 0}[x['priority']], 
                    reverse=True
                )
            
            recommendations['total_recommendations'] = (
                len(recommendations['immediate']) + 
                len(recommendations['short_term']) + 
                len(recommendations['long_term'])
            )
            
            return {
                'success': True,
                'recommendations': recommendations,
                'current_metrics': metrics,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Помилка генерації рекомендацій: {e}"
            }
