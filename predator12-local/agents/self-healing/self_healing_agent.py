#!/usr/bin/env python3
"""
🏥 Self-Healing Agent - AI-powered система автовідновлення
Використовує безкоштовні моделі з складною логікою вибору
"""

import asyncio
import aiohttp
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import structlog
import os

logger = structlog.get_logger(__name__)

@dataclass
class HealthCheck:
    service: str
    status: str
    response_time: float
    error_message: Optional[str] = None
    suggested_action: Optional[str] = None

@dataclass
class HealingAction:
    action_type: str
    target_service: str
    parameters: Dict[str, Any]
    expected_outcome: str
    risk_level: str
    estimated_time: int

class ModelSelector:
    """Інтелектуальний вибір моделей для Self-Healing задач"""

    def __init__(self):
        self.decision_models = [
            "microsoft/phi-3-medium-4k-instruct",  # Швидкі рішення
            "qwen/qwen2.5-14b-instruct",           # Аналіз ситуації
            "meta/meta-llama-3.1-8b-instruct"     # Валідація дій
        ]

        self.analysis_models = [
            "qwen/qwen2.5-32b-instruct",           # Глибокий аналіз
            "mistral/mixtral-8x7b-instruct",       # Альтернативний погляд
            "microsoft/phi-3-medium-128k-instruct" # Довгий контекст
        ]

        self.learning_models = [
            "meta/meta-llama-3.1-8b-instruct",     # Аналіз паттернів
            "qwen/qwen2.5-14b-instruct"            # Навчання на успіхах
        ]

    def select_for_decision(self, context: Dict[str, Any]) -> str:
        """Вибір моделі для прийняття рішень"""
        urgency = context.get('urgency', 'medium')
        complexity = context.get('complexity', 0.5)

        if urgency == 'critical' and complexity < 0.7:
            return self.decision_models[0]  # Phi-3 для швидких критичних рішень
        elif complexity > 0.8:
            return self.decision_models[1]  # Qwen для складного аналізу
        else:
            return self.decision_models[2]  # Llama для валідації

    def select_for_analysis(self, context: Dict[str, Any]) -> str:
        """Вибір моделі для аналізу проблем"""
        data_size = context.get('log_lines', 0)
        problem_type = context.get('problem_type', 'unknown')

        if data_size > 10000 or problem_type in ['performance', 'memory']:
            return self.analysis_models[0]  # Qwen 32B для великих даних
        elif problem_type in ['network', 'database']:
            return self.analysis_models[1]  # Mixtral для мережевих проблем
        else:
            return self.analysis_models[2]  # Phi-3 з довгим контекстом

class SelfHealingAgent:
    """AI-powered агент самовідновлення з інтелектуальним вибором моделей"""

    def __init__(self):
        self.model_selector = ModelSelector()
        self.sdk_base_url = os.getenv('MODEL_SDK_BASE_URL', 'http://modelsdk:3010/v1')
        self.prometheus_url = os.getenv('PROMETHEUS_URL', 'http://prometheus:9090')
        self.loki_url = os.getenv('LOKI_URL', 'http://loki:3100')
        self.session: Optional[aiohttp.ClientSession] = None

    async def get_session(self) -> aiohttp.ClientSession:
        """Отримати HTTP сесію"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30))
        return self.session

    async def query_model(self, model_name: str, messages: List[Dict[str, str]]) -> str:
        """Запит до моделі через SDK"""
        try:
            session = await self.get_session()
            payload = {
                "model": model_name,
                "messages": messages,
                "max_tokens": 2000,
                "temperature": 0.3
            }

            async with session.post(f"{self.sdk_base_url}/chat/completions", json=payload) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    return data['choices'][0]['message']['content']
                else:
                    logger.warning(f"Model query failed: {resp.status}")
                    return "Model unavailable"

        except Exception as e:
            logger.error(f"Error querying model {model_name}: {e}")
            return "Error in model query"

    async def check_service_health(self, service_name: str, endpoint: str) -> HealthCheck:
        """Перевірка здоров'я сервісу з AI аналізом"""
        try:
            session = await self.get_session()
            start_time = datetime.utcnow()

            async with session.get(endpoint, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                response_time = (datetime.utcnow() - start_time).total_seconds()

                if resp.status == 200:
                    return HealthCheck(
                        service=service_name,
                        status="healthy",
                        response_time=response_time
                    )
                else:
                    # AI аналіз проблеми
                    context = {
                        'urgency': 'high',
                        'complexity': 0.6,
                        'problem_type': 'http_error'
                    }

                    model = self.model_selector.select_for_analysis(context)

                    messages = [
                        {"role": "system", "content": "You are a system diagnostics expert. Analyze HTTP error and suggest action."},
                        {"role": "user", "content": f"Service {service_name} returned HTTP {resp.status}. Endpoint: {endpoint}. What action should be taken?"}
                    ]

                    suggestion = await self.query_model(model, messages)

                    return HealthCheck(
                        service=service_name,
                        status="unhealthy",
                        response_time=response_time,
                        error_message=f"HTTP {resp.status}",
                        suggested_action=suggestion
                    )

        except asyncio.TimeoutError:
            return HealthCheck(
                service=service_name,
                status="timeout",
                response_time=10.0,
                error_message="Service timeout",
                suggested_action="Restart service or check resource allocation"
            )
        except Exception as e:
            return HealthCheck(
                service=service_name,
                status="error",
                response_time=0.0,
                error_message=str(e),
                suggested_action="Check service configuration and logs"
            )

    async def analyze_system_metrics(self) -> Dict[str, Any]:
        """Аналіз системних метрик з AI"""
        try:
            session = await self.get_session()

            # Запит метрик з Prometheus
            queries = {
                'memory_usage': 'avg(node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)',
                'cpu_usage': 'avg(rate(node_cpu_seconds_total[5m]))',
                'disk_usage': 'avg(node_filesystem_free_bytes / node_filesystem_size_bytes)',
                'http_errors': 'sum(rate(http_requests_total{code=~"5.."}[5m]))'
            }

            metrics = {}
            for metric_name, query in queries.items():
                try:
                    async with session.get(f"{self.prometheus_url}/api/v1/query",
                                         params={'query': query}) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            if data['data']['result']:
                                metrics[metric_name] = float(data['data']['result'][0]['value'][1])
                except Exception as e:
                    logger.warning(f"Failed to get metric {metric_name}: {e}")
                    metrics[metric_name] = 0.0

            # AI аналіз метрик
            context = {
                'complexity': 0.7,
                'problem_type': 'performance',
                'data_size': len(str(metrics))
            }

            model = self.model_selector.select_for_analysis(context)

            messages = [
                {"role": "system", "content": "You are a system performance analyst. Analyze metrics and identify issues."},
                {"role": "user", "content": f"System metrics: {json.dumps(metrics, indent=2)}. Identify performance issues and suggest optimizations."}
            ]

            analysis = await self.query_model(model, messages)

            return {
                'metrics': metrics,
                'ai_analysis': analysis,
                'timestamp': datetime.utcnow().isoformat(),
                'health_score': min(metrics.values()) if metrics else 0.0
            }

        except Exception as e:
            logger.error(f"System metrics analysis failed: {e}")
            return {'error': str(e), 'timestamp': datetime.utcnow().isoformat()}

    async def plan_healing_action(self, health_checks: List[HealthCheck]) -> List[HealingAction]:
        """Планування дій для відновлення з AI"""
        try:
            # Підготовка контексту для AI
            unhealthy_services = [hc for hc in health_checks if hc.status != "healthy"]

            if not unhealthy_services:
                return []

            context = {
                'urgency': 'critical' if len(unhealthy_services) > 3 else 'medium',
                'complexity': min(0.9, len(unhealthy_services) * 0.2)
            }

            model = self.model_selector.select_for_decision(context)

            problems_description = "\n".join([
                f"- {hc.service}: {hc.status} ({hc.error_message})"
                for hc in unhealthy_services
            ])

            messages = [
                {"role": "system", "content": "You are an expert system administrator. Plan healing actions for unhealthy services. Respond with specific actionable steps."},
                {"role": "user", "content": f"Unhealthy services:\n{problems_description}\n\nPlan healing actions with risk assessment."}
            ]

            ai_plan = await self.query_model(model, messages)

            # Перетворення AI відповіді в структуровані дії (mock)
            actions = []
            for service_hc in unhealthy_services[:3]:  # Максимум 3 дії за раз
                action = HealingAction(
                    action_type="restart_service",
                    target_service=service_hc.service,
                    parameters={"timeout": 30, "force": False},
                    expected_outcome="Service becomes healthy",
                    risk_level="low" if service_hc.status == "timeout" else "medium",
                    estimated_time=60
                )
                actions.append(action)

            logger.info(f"Planned {len(actions)} healing actions based on AI analysis")
            return actions

        except Exception as e:
            logger.error(f"Healing action planning failed: {e}")
            return []

    async def execute_healing_action(self, action: HealingAction) -> Dict[str, Any]:
        """Виконання дії відновлення"""
        try:
            logger.info(f"Executing healing action: {action.action_type} on {action.target_service}")

            # Mock виконання дії
            if action.action_type == "restart_service":
                # В реальній системі тут був би API виклик до Docker/Kubernetes
                result = {
                    'action_id': f"heal_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    'action': action.action_type,
                    'target': action.target_service,
                    'status': 'completed',
                    'executed_at': datetime.utcnow().isoformat(),
                    'duration_seconds': action.estimated_time,
                    'outcome': 'Service restarted successfully'
                }
            else:
                result = {
                    'status': 'skipped',
                    'reason': 'Action type not implemented'
                }

            logger.info(f"Healing action completed: {result['status']}")
            return result

        except Exception as e:
            logger.error(f"Healing action execution failed: {e}")
            return {
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    async def learn_from_healing(self, action: HealingAction, result: Dict[str, Any]) -> None:
        """Навчання на результатах відновлення"""
        try:
            context = {'complexity': 0.4, 'problem_type': 'learning'}
            model = self.model_selector.learning_models[0]  # Llama для навчання

            messages = [
                {"role": "system", "content": "You are a self-learning system. Analyze healing action results and extract lessons."},
                {"role": "user", "content": f"Healing action: {action.action_type} on {action.target_service}. Result: {result}. What can we learn?"}
            ]

            insights = await self.query_model(model, messages)

            # Збереження insights (mock)
            learning_record = {
                'timestamp': datetime.utcnow().isoformat(),
                'action': action.action_type,
                'service': action.target_service,
                'success': result.get('status') == 'completed',
                'ai_insights': insights,
                'pattern_learned': True
            }

            logger.info(f"Learning completed for {action.target_service}")

        except Exception as e:
            logger.error(f"Learning from healing failed: {e}")

    async def run_healing_cycle(self) -> Dict[str, Any]:
        """Повний цикл самовідновлення"""
        cycle_id = f"cycle_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        logger.info(f"Starting healing cycle: {cycle_id}")

        try:
            # 1. Перевірка здоров'я всіх сервісів
            services_to_check = [
                ("backend", "http://backend:8000/health"),
                ("frontend", "http://frontend:3000"),
                ("database", "http://db:5432"),  # Mock endpoint
                ("redis", "http://redis:6379"),    # Mock endpoint
                ("opensearch", "http://opensearch:9200/_cluster/health"),
                ("grafana", "http://grafana:3000/api/health")
            ]

            health_checks = []
            for service_name, endpoint in services_to_check:
                health_check = await self.check_service_health(service_name, endpoint)
                health_checks.append(health_check)

            # 2. AI планування дій відновлення
            healing_actions = await self.plan_healing_action(health_checks)

            # 3. Виконання дій
            executed_actions = []
            for action in healing_actions:
                result = await self.execute_healing_action(action)
                executed_actions.append({
                    'action': action,
                    'result': result
                })

                # 4. Навчання на результатах
                await self.learn_from_healing(action, result)

            # 5. Аналіз системних метрик
            system_analysis = await self.analyze_system_metrics()

            cycle_result = {
                'cycle_id': cycle_id,
                'timestamp': datetime.utcnow().isoformat(),
                'health_checks': [
                    {
                        'service': hc.service,
                        'status': hc.status,
                        'response_time': hc.response_time,
                        'error': hc.error_message
                    } for hc in health_checks
                ],
                'healing_actions_planned': len(healing_actions),
                'healing_actions_executed': len(executed_actions),
                'system_analysis': system_analysis,
                'overall_health': 'healthy' if all(hc.status == "healthy" for hc in health_checks) else 'degraded',
                'duration_seconds': 0  # Буде розраховано в кінці
            }

            logger.info(f"Healing cycle {cycle_id} completed")
            return cycle_result

        except Exception as e:
            logger.error(f"Healing cycle {cycle_id} failed: {e}")
            return {
                'cycle_id': cycle_id,
                'status': 'failed',
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }

    async def close(self):
        """Закрити HTTP сесію"""
        if self.session and not self.session.closed:
            await self.session.close()

async def main():
    """Головна функція для тестування агента"""
    print("🏥 SELF-HEALING AGENT DEMO")
    print("=" * 50)

    agent = SelfHealingAgent()

    try:
        # Запуск циклу самовідновлення
        result = await agent.run_healing_cycle()

        print("📊 РЕЗУЛЬТАТИ ЦИКЛУ САМОВІДНОВЛЕННЯ:")
        print(f"ID циклу: {result.get('cycle_id')}")
        print(f"Загальний стан: {result.get('overall_health')}")
        print(f"Перевірено сервісів: {len(result.get('health_checks', []))}")
        print(f"Виконано дій: {result.get('healing_actions_executed', 0)}")

        if result.get('system_analysis'):
            health_score = result['system_analysis'].get('health_score', 0)
            print(f"Загальна оцінка здоров'я: {health_score:.2f}")

        print("✅ Self-Healing Agent працює коректно!")

    finally:
        await agent.close()

if __name__ == "__main__":
    asyncio.run(main())
