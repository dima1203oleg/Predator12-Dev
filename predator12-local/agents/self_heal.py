"""
Self-Healing Agent
==================

Агент для автоматичного виявлення та усунення системних проблем,
моніторингу здоров'я системи та автовідновлення сервісів.
"""

import asyncio
import logging
import psutil
import subprocess
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set
from pathlib import Path
import docker
import requests
import yaml

from .base import BaseAgent, AgentTask, AgentStatus, TaskPriority, RiskLevel

logger = logging.getLogger(__name__)

class SelfHealingAgent(BaseAgent):
    """
    Агент самовідновлення системи
    
    Функції:
    - Моніторинг здоров'я сервісів
    - Автоматичне перезапуск збійних контейнерів
    - Виявлення аномалій у ресурсах
    - Автоматичне масштабування
    - Відновлення після збоїв
    """
    
    def __init__(self, agent_id: str = None, **config):
        super().__init__(
            agent_id=agent_id or "self-healing-agent",
            name="Self-Healing Agent",
            description="Автоматичне виявлення та усунення системних проблем",
            capabilities=[
                "health_monitoring",
                "auto_restart",
                "resource_optimization", 
                "anomaly_detection",
                "disaster_recovery"
            ],
            **config
        )
        
        # Налаштування моніторингу
        self.health_check_interval = config.get('health_check_interval', 30)
        self.max_restart_attempts = config.get('max_restart_attempts', 3)
        self.resource_thresholds = config.get('resource_thresholds', {
            'cpu_percent': 85.0,
            'memory_percent': 90.0,
            'disk_percent': 95.0
        })
        
        # Docker клієнт
        try:
            self.docker_client = docker.from_env()
        except Exception as e:
            logger.warning(f"Docker не доступний: {e}")
            self.docker_client = None
            
        # Статистика відновлень
        self.recovery_stats = {
            'total_healings': 0,
            'successful_restarts': 0,
            'failed_restarts': 0,
            'resource_optimizations': 0,
            'anomalies_detected': 0
        }
        
        # Кеш здоров'я сервісів
        self.service_health_cache = {}
        self.last_health_check = None
        
    async def plan_task(self, task: AgentTask) -> Dict[str, Any]:
        """Планування завдання самовідновлення"""
        
        task_type = task.payload.get('type', 'health_check')
        
        if task_type == 'health_check':
            return await self._plan_health_check(task)
        elif task_type == 'auto_heal':
            return await self._plan_auto_heal(task)
        elif task_type == 'resource_optimization':
            return await self._plan_resource_optimization(task)
        elif task_type == 'anomaly_detection':
            return await self._plan_anomaly_detection(task)
        else:
            return {
                'steps': [
                    {
                        'action': 'unknown_task_type',
                        'description': f'Невідомий тип завдання: {task_type}',
                        'estimated_duration': 1
                    }
                ],
                'estimated_duration': 1,
                'risk_level': RiskLevel.LOW,
                'resources_needed': []
            }
    
    async def _plan_health_check(self, task: AgentTask) -> Dict[str, Any]:
        """Планування перевірки здоров'я системи"""
        
        target = task.payload.get('target', 'all')
        
        steps = []
        
        # Перевірка системних ресурсів
        if target in ['all', 'system']:
            steps.append({
                'action': 'check_system_resources',
                'description': 'Перевірка CPU, пам\'яті та диску',
                'estimated_duration': 5
            })
        
        # Перевірка Docker контейнерів
        if target in ['all', 'containers'] and self.docker_client:
            steps.append({
                'action': 'check_containers',
                'description': 'Перевірка стану Docker контейнерів',
                'estimated_duration': 10
            })
        
        # Перевірка мережевих сервісів
        if target in ['all', 'services']:
            steps.append({
                'action': 'check_services',
                'description': 'Перевірка доступності веб-сервісів',
                'estimated_duration': 15
            })
        
        # Перевірка логів на помилки
        if target in ['all', 'logs']:
            steps.append({
                'action': 'check_error_logs',
                'description': 'Аналіз логів на наявність помилок',
                'estimated_duration': 10
            })
        
        return {
            'steps': steps,
            'estimated_duration': sum(step['estimated_duration'] for step in steps),
            'risk_level': RiskLevel.SAFE,
            'resources_needed': ['system_access', 'docker_access']
        }
    
    async def _plan_auto_heal(self, task: AgentTask) -> Dict[str, Any]:
        """Планування автоматичного відновлення"""
        
        issue_type = task.payload.get('issue_type')
        affected_service = task.payload.get('service')
        
        steps = []
        risk_level = RiskLevel.MEDIUM
        
        if issue_type == 'container_down':
            steps = [
                {
                    'action': 'diagnose_container_failure',
                    'description': f'Діагностика збою контейнера {affected_service}',
                    'estimated_duration': 30
                },
                {
                    'action': 'attempt_container_restart',
                    'description': f'Спроба перезапуску контейнера {affected_service}',
                    'estimated_duration': 60
                },
                {
                    'action': 'verify_container_health',
                    'description': f'Перевірка здоров\'я після перезапуску',
                    'estimated_duration': 30
                }
            ]
            risk_level = RiskLevel.HIGH
            
        elif issue_type == 'high_resource_usage':
            steps = [
                {
                    'action': 'identify_resource_hogs',
                    'description': 'Виявлення процесів з високим споживанням ресурсів',
                    'estimated_duration': 15
                },
                {
                    'action': 'optimize_resource_usage',
                    'description': 'Оптимізація використання ресурсів',
                    'estimated_duration': 45
                },
                {
                    'action': 'monitor_improvement',
                    'description': 'Моніторинг покращення стану ресурсів',
                    'estimated_duration': 60
                }
            ]
            risk_level = RiskLevel.MEDIUM
            
        elif issue_type == 'service_unavailable':
            steps = [
                {
                    'action': 'diagnose_service_issue',
                    'description': f'Діагностика недоступності сервісу {affected_service}',
                    'estimated_duration': 30
                },
                {
                    'action': 'attempt_service_recovery',
                    'description': f'Спроба відновлення сервісу {affected_service}',
                    'estimated_duration': 90
                },
                {
                    'action': 'verify_service_availability',
                    'description': 'Перевірка доступності після відновлення',
                    'estimated_duration': 30
                }
            ]
            risk_level = RiskLevel.HIGH
        
        return {
            'steps': steps,
            'estimated_duration': sum(step['estimated_duration'] for step in steps),
            'risk_level': risk_level,
            'resources_needed': ['system_access', 'docker_access', 'service_control']
        }
    
    async def execute_task(self, task: AgentTask, plan: Dict[str, Any]) -> Dict[str, Any]:
        """Виконання завдання самовідновлення"""
        
        results = {}
        
        try:
            for i, step in enumerate(plan['steps']):
                action = step['action']
                
                logger.info(f"Виконання кроку {i+1}/{len(plan['steps'])}: {step['description']}")
                
                step_result = await self._execute_step(action, task, step)
                results[f"step_{i+1}_{action}"] = step_result
                
                # Перевірка на критичні помилки
                if step_result.get('critical_error'):
                    logger.error(f"Критична помилка на кроці {action}: {step_result.get('error')}")
                    break
                    
                await asyncio.sleep(1)  # Короткий інтервал між кроками
                
            # Оновлення статистики
            self._update_recovery_stats(task, results)
            
            return {
                'success': True,
                'results': results,
                'statistics': self.recovery_stats.copy(),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Помилка виконання завдання самовідновлення: {e}")
            return {
                'success': False,
                'error': str(e),
                'partial_results': results,
                'timestamp': datetime.now().isoformat()
            }
    
    async def _execute_step(self, action: str, task: AgentTask, step: Dict[str, Any]) -> Dict[str, Any]:
        """Виконання окремого кроку"""
        
        try:
            if action == 'check_system_resources':
                return await self._check_system_resources()
            elif action == 'check_containers':
                return await self._check_containers()
            elif action == 'check_services':
                return await self._check_services(task.payload.get('services', []))
            elif action == 'check_error_logs':
                return await self._check_error_logs()
            elif action == 'diagnose_container_failure':
                return await self._diagnose_container_failure(task.payload.get('service'))
            elif action == 'attempt_container_restart':
                return await self._attempt_container_restart(task.payload.get('service'))
            elif action == 'verify_container_health':
                return await self._verify_container_health(task.payload.get('service'))
            elif action == 'identify_resource_hogs':
                return await self._identify_resource_hogs()
            elif action == 'optimize_resource_usage':
                return await self._optimize_resource_usage()
            elif action == 'monitor_improvement':
                return await self._monitor_improvement()
            else:
                return {
                    'success': False,
                    'error': f'Невідома дія: {action}'
                }
                
        except Exception as e:
            logger.error(f"Помилка виконання дії {action}: {e}")
            return {
                'success': False,
                'error': str(e),
                'critical_error': True
            }
    
    async def _check_system_resources(self) -> Dict[str, Any]:
        """Перевірка системних ресурсів"""
        
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Пам'ять
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Диск
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            
            # Аналіз критичних порогів
            issues = []
            if cpu_percent > self.resource_thresholds['cpu_percent']:
                issues.append(f"Високе навантаження CPU: {cpu_percent:.1f}%")
            
            if memory_percent > self.resource_thresholds['memory_percent']:
                issues.append(f"Високе використання пам'яті: {memory_percent:.1f}%")
            
            if disk_percent > self.resource_thresholds['disk_percent']:
                issues.append(f"Високе використання диску: {disk_percent:.1f}%")
            
            result = {
                'success': True,
                'cpu_percent': cpu_percent,
                'memory_percent': memory_percent,
                'disk_percent': disk_percent,
                'issues': issues,
                'healthy': len(issues) == 0
            }
            
            logger.info(f"Системні ресурси: CPU {cpu_percent:.1f}%, RAM {memory_percent:.1f}%, Disk {disk_percent:.1f}%")
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Помилка перевірки ресурсів: {e}"
            }
    
    async def _check_containers(self) -> Dict[str, Any]:
        """Перевірка стану Docker контейнерів"""
        
        if not self.docker_client:
            return {
                'success': False,
                'error': 'Docker клієнт недоступний'
            }
        
        try:
            containers = self.docker_client.containers.list(all=True)
            
            container_status = {}
            issues = []
            
            for container in containers:
                status = container.status
                name = container.name
                
                container_status[name] = {
                    'status': status,
                    'id': container.short_id,
                    'image': container.image.tags[0] if container.image.tags else 'unknown'
                }
                
                if status != 'running':
                    issues.append(f"Контейнер {name} не працює: {status}")
            
            return {
                'success': True,
                'containers': container_status,
                'total_containers': len(containers),
                'running_containers': len([c for c in containers if c.status == 'running']),
                'issues': issues,
                'healthy': len(issues) == 0
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f"Помилка перевірки контейнерів: {e}"
            }
    
    async def _check_services(self, services: List[str] = None) -> Dict[str, Any]:
        """Перевірка доступності веб-сервісів"""
        
        # Дефолтні сервіси для перевірки
        if not services:
            services = [
                'http://localhost:3000',  # Frontend
                'http://localhost:8000',  # Backend API
                'http://localhost:5090',  # Dashboard
                'http://localhost:9090',  # Prometheus
                'http://localhost:3001'   # Grafana
            ]
        
        service_status = {}
        issues = []
        
        for service_url in services:
            try:
                response = requests.get(service_url, timeout=5)
                
                status = 'healthy' if response.status_code == 200 else 'unhealthy'
                
                service_status[service_url] = {
                    'status': status,
                    'status_code': response.status_code,
                    'response_time': response.elapsed.total_seconds()
                }
                
                if response.status_code != 200:
                    issues.append(f"Сервіс {service_url} повертає код {response.status_code}")
                    
            except requests.RequestException as e:
                service_status[service_url] = {
                    'status': 'unavailable',
                    'error': str(e)
                }
                issues.append(f"Сервіс {service_url} недоступний: {e}")
        
        return {
            'success': True,
            'services': service_status,
            'issues': issues,
            'healthy': len(issues) == 0
        }
    
    async def _attempt_container_restart(self, container_name: str) -> Dict[str, Any]:
        """Спроба перезапуску контейнера"""
        
        if not self.docker_client:
            return {
                'success': False,
                'error': 'Docker клієнт недоступний'
            }
        
        try:
            container = self.docker_client.containers.get(container_name)
            
            logger.info(f"Перезапуск контейнера {container_name}")
            
            # Спроба грацеофульного зупинення
            container.stop(timeout=30)
            await asyncio.sleep(5)
            
            # Запуск контейнера
            container.start()
            await asyncio.sleep(10)  # Час на запуск
            
            # Перевірка стану
            container.reload()
            
            if container.status == 'running':
                self.recovery_stats['successful_restarts'] += 1
                return {
                    'success': True,
                    'container': container_name,
                    'status': container.status,
                    'message': 'Контейнер успішно перезапущений'
                }
            else:
                self.recovery_stats['failed_restarts'] += 1
                return {
                    'success': False,
                    'container': container_name,
                    'status': container.status,
                    'error': 'Контейнер не запустився після перезапуску'
                }
                
        except Exception as e:
            self.recovery_stats['failed_restarts'] += 1
            return {
                'success': False,
                'container': container_name,
                'error': f"Помилка перезапуску контейнера: {e}"
            }
    
    def _update_recovery_stats(self, task: AgentTask, results: Dict[str, Any]):
        """Оновлення статистики відновлень"""
        
        self.recovery_stats['total_healings'] += 1
        
        # Аналіз результатів для оновлення статистики
        for step_key, step_result in results.items():
            if 'resource' in step_key and step_result.get('success'):
                self.recovery_stats['resource_optimizations'] += 1
            elif 'anomaly' in step_key and step_result.get('anomalies_found', 0) > 0:
                self.recovery_stats['anomalies_detected'] += step_result['anomalies_found']
    
    async def get_health_summary(self) -> Dict[str, Any]:
        """Отримання зведення стану здоров'я системи"""
        
        # Виконання швидкої перевірки здоров'я
        health_task = AgentTask(
            task_id=f"health-summary-{int(time.time())}",
            agent_id=self.agent_id,
            task_type="health_check",
            payload={'type': 'health_check', 'target': 'all'},
            priority=TaskPriority.NORMAL
        )
        
        plan = await self.plan_task(health_task)
        results = await self.execute_task(health_task, plan)
        
        # Формування зведення
        summary = {
            'overall_health': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'system_status': {},
            'recovery_stats': self.recovery_stats.copy(),
            'recommendations': []
        }
        
        # Аналіз результатів
        if results.get('success'):
            issues_count = 0
            
            for step_key, step_result in results.get('results', {}).items():
                if step_result.get('issues'):
                    issues_count += len(step_result['issues'])
                    summary['recommendations'].extend([
                        f"Усунути проблему: {issue}" for issue in step_result['issues']
                    ])
            
            if issues_count == 0:
                summary['overall_health'] = 'healthy'
            elif issues_count <= 2:
                summary['overall_health'] = 'warning'
            else:
                summary['overall_health'] = 'critical'
                
            summary['issues_found'] = issues_count
            
        else:
            summary['overall_health'] = 'unknown'
            summary['error'] = results.get('error')
        
        return summary

    async def start_continuous_monitoring(self):
        """Запуск безперервного моніторингу здоров'я"""
        
        logger.info("Запуск безперервного моніторингу здоров'я системи")
        
        while True:
            try:
                summary = await self.get_health_summary()
                
                # Логування стану
                health_status = summary['overall_health']
                logger.info(f"Стан здоров'я системи: {health_status}")
                
                # Автоматичне відновлення при виявленні проблем
                if health_status in ['warning', 'critical']:
                    logger.warning(f"Виявлено проблеми здоров'я: {summary.get('issues_found', 0)} issues")
                    
                    # Запуск автовідновлення для критичних проблем
                    if health_status == 'critical':
                        await self._trigger_auto_healing(summary)
                
                # Кешування результатів
                self.service_health_cache = summary
                self.last_health_check = datetime.now()
                
                await asyncio.sleep(self.health_check_interval)
                
            except Exception as e:
                logger.error(f"Помилка моніторингу здоров'я: {e}")
                await asyncio.sleep(self.health_check_interval * 2)  # Подвійна затримка при помилці
    
    async def _trigger_auto_healing(self, health_summary: Dict[str, Any]):
        """Запуск автоматичного відновлення при критичних проблемах"""
        
        logger.warning("Запуск автоматичного відновлення через критичні проблеми")
        
        # Аналіз типу проблем та запуск відповідного відновлення
        recommendations = health_summary.get('recommendations', [])
        
        for recommendation in recommendations:
            if 'контейнер' in recommendation.lower() and 'не працює' in recommendation.lower():
                # Виділення назви контейнера з рекомендації
                # Приклад: "Контейнер nexus-frontend не працює: exited"
                try:
                    container_name = recommendation.split()[1]
                    
                    heal_task = AgentTask(
                        task_id=f"auto-heal-container-{int(time.time())}",
                        agent_id=self.agent_id,
                        task_type="auto_heal",
                        payload={
                            'type': 'auto_heal',
                            'issue_type': 'container_down',
                            'service': container_name
                        },
                        priority=TaskPriority.HIGH
                    )
                    
                    plan = await self.plan_task(heal_task)
                    await self.execute_task(heal_task, plan)
                    
                except Exception as e:
                    logger.error(f"Помилка автовідновлення контейнера: {e}")
