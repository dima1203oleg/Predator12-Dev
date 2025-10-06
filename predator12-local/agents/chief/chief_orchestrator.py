#!/usr/bin/env python3
"""
🤖 Chief Orchestrator Agent - Main Dialogue Interface
Єдина точка діалогу (UI/Telegram) з декомпозицією задач та координацією агентів
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

import redis
import aiohttp
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import structlog

# Структуровані логи
logger = structlog.get_logger(__name__)

class TaskStatus(Enum):
    CREATED = "created"
    PLANNING = "planning"  
    EXECUTING = "executing"
    AGGREGATING = "aggregating"
    COMPLETED = "completed"
    FAILED = "failed"

class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class AgentTask:
    """Задача для окремого агента"""
    agent_name: str
    task_type: str
    parameters: Dict[str, Any]
    timeout: int = 300
    retries: int = 2

@dataclass
class UserRequest:
    """Запит користувача"""
    query: str
    channel: str  # ui, telegram, api
    user_id: str
    context: Optional[Dict[str, Any]] = None
    priority: Priority = Priority.MEDIUM

@dataclass
class ExecutionPlan:
    """План виконання задачі"""
    task_id: str
    user_request: UserRequest
    agent_tasks: List[AgentTask]
    dependencies: Dict[str, List[str]]  # agent_name -> [dependency_agents]
    estimated_duration: int
    created_at: datetime

class ChiefOrchestratorAgent:
    """Головний агент-оркестратор"""
    
    def __init__(self):
        self.app = FastAPI(title="Chief Orchestrator Agent", version="1.0.0")
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
        self.model_router_url = "http://localhost:9002"
        self.active_tasks: Dict[str, ExecutionPlan] = {}
        self.agent_capabilities = self._load_agent_capabilities()
        
        # Налаштування маршрутів
        self._setup_routes()
        
    def _load_agent_capabilities(self) -> Dict[str, List[str]]:
        """Завантаження можливостей агентів"""
        return {
            "IngestAgent": ["file_upload", "data_profiling", "pii_detection"],
            "DataQualityAgent": ["validation", "quality_scoring", "anomaly_detection"],
            "AnomalyAgent": ["statistical_anomalies", "ml_anomalies", "pattern_analysis"],
            "ForecastAgent": ["time_series", "trend_analysis", "what_if_scenarios"],
            "GraphAgent": ["network_analysis", "centrality", "community_detection"],
            "SyntheticDataAgent": ["data_generation", "anonymization"],
            "SecurityAgent": ["pii_masking", "threat_detection", "access_control"],
            "SelfHealingAgent": ["diagnostics", "auto_repair", "system_recovery"],
            "ReportGenAgent": ["report_generation", "visualization", "export"]
        }
    
    def _setup_routes(self):
        """Налаштування HTTP маршрутів"""
        
        @self.app.post("/chief/ask")
        async def ask(request: dict):
            """Основний endpoint для запитів користувача"""
            try:
                user_request = UserRequest(
                    query=request["query"],
                    channel=request.get("channel", "api"),
                    user_id=request.get("user_id", "anonymous"),
                    context=request.get("context"),
                    priority=Priority(request.get("priority", "medium"))
                )
                
                task_id = await self.process_user_request(user_request)
                return {"task_id": task_id, "status": "processing", "message": "Task accepted"}
                
            except Exception as e:
                logger.error("Error processing request", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/chief/status/{task_id}")
        async def get_status(task_id: str):
            """Статус виконання задачі"""
            if task_id not in self.active_tasks:
                raise HTTPException(status_code=404, detail="Task not found")
            
            plan = self.active_tasks[task_id]
            return {
                "task_id": task_id,
                "status": "processing",  # TODO: отримувати реальний статус
                "progress": await self._get_task_progress(task_id),
                "created_at": plan.created_at.isoformat()
            }
        
        @self.app.get("/chief/health")
        async def health():
            """Health check"""
            return {
                "status": "healthy",
                "active_tasks": len(self.active_tasks),
                "timestamp": datetime.now().isoformat()
            }
    
    async def process_user_request(self, user_request: UserRequest) -> str:
        """Обробка запиту користувача з декомпозицією на задачі"""
        
        task_id = str(uuid.uuid4())
        logger.info("Processing user request", task_id=task_id, query=user_request.query)
        
        # 1. Планування задач через LLM
        execution_plan = await self._create_execution_plan(task_id, user_request)
        self.active_tasks[task_id] = execution_plan
        
        # 2. Публікуємо подію про створення задачі
        await self._publish_event("chief.task_created", {
            "task_id": task_id,
            "user_request": asdict(user_request),
            "agent_tasks": [asdict(task) for task in execution_plan.agent_tasks]
        })
        
        # 3. Запускаємо виконання в фоні
        asyncio.create_task(self._execute_plan(execution_plan))
        
        return task_id
    
    async def _create_execution_plan(self, task_id: str, user_request: UserRequest) -> ExecutionPlan:
        """Створення плану виконання через LLM"""
        
        # Промпт для планування
        planning_prompt = f"""
        Analyze this user request and create an execution plan:
        Query: "{user_request.query}"
        Channel: {user_request.channel}
        Priority: {user_request.priority.value}
        
        Available agents and capabilities:
        {json.dumps(self.agent_capabilities, indent=2)}
        
        Create a step-by-step execution plan that:
        1. Identifies which agents are needed
        2. Determines the order of execution (dependencies)
        3. Specifies parameters for each agent
        4. Estimates duration
        
        Return JSON with agent_tasks array and dependencies object.
        """
        
        # Виклик LLM через Model Router
        llm_response = await self._call_model_router({
            "model_type": "reasoning",
            "prompt": planning_prompt,
            "max_tokens": 2000
        })
        
        # Парсинг відповіді LLM
        try:
            plan_data = json.loads(llm_response.get("response", "{}"))
        except:
            # Fallback план для простих запитів
            plan_data = await self._create_fallback_plan(user_request)
        
        # Створення задач агентів
        agent_tasks = []
        for task_data in plan_data.get("agent_tasks", []):
            agent_tasks.append(AgentTask(
                agent_name=task_data["agent_name"],
                task_type=task_data["task_type"],
                parameters=task_data.get("parameters", {}),
                timeout=task_data.get("timeout", 300)
            ))
        
        return ExecutionPlan(
            task_id=task_id,
            user_request=user_request,
            agent_tasks=agent_tasks,
            dependencies=plan_data.get("dependencies", {}),
            estimated_duration=plan_data.get("estimated_duration", 600),
            created_at=datetime.now()
        )
    
    async def _create_fallback_plan(self, user_request: UserRequest) -> Dict[str, Any]:
        """Fallback план для простих запитів"""
        
        query_lower = user_request.query.lower()
        
        if "anomal" in query_lower or "unusual" in query_lower:
            return {
                "agent_tasks": [{
                    "agent_name": "AnomalyAgent",
                    "task_type": "detect_anomalies",
                    "parameters": {"method": "statistical"}
                }],
                "dependencies": {},
                "estimated_duration": 180
            }
        
        elif "forecast" in query_lower or "predict" in query_lower:
            return {
                "agent_tasks": [{
                    "agent_name": "ForecastAgent", 
                    "task_type": "time_series_forecast",
                    "parameters": {"horizon": 30}
                }],
                "dependencies": {},
                "estimated_duration": 300
            }
        
        elif "report" in query_lower or "summary" in query_lower:
            return {
                "agent_tasks": [
                    {
                        "agent_name": "DataQualityAgent",
                        "task_type": "quality_check", 
                        "parameters": {}
                    },
                    {
                        "agent_name": "ReportGenAgent",
                        "task_type": "generate_report",
                        "parameters": {"format": "html"}
                    }
                ],
                "dependencies": {"ReportGenAgent": ["DataQualityAgent"]},
                "estimated_duration": 240
            }
        
        else:
            # Загальний план
            return {
                "agent_tasks": [{
                    "agent_name": "DataQualityAgent",
                    "task_type": "analyze",
                    "parameters": {}
                }],
                "dependencies": {},
                "estimated_duration": 120
            }
    
    async def _execute_plan(self, plan: ExecutionPlan):
        """Виконання плану з урахуванням залежностей"""
        
        logger.info("Starting plan execution", task_id=plan.task_id)
        
        completed_agents = set()
        results = {}
        
        try:
            # Виконуємо задачі з урахуванням залежностей
            while len(completed_agents) < len(plan.agent_tasks):
                
                # Знаходимо готові до виконання задачі
                ready_tasks = []
                for task in plan.agent_tasks:
                    if task.agent_name not in completed_agents:
                        dependencies = plan.dependencies.get(task.agent_name, [])
                        if all(dep in completed_agents for dep in dependencies):
                            ready_tasks.append(task)
                
                if not ready_tasks:
                    logger.error("Deadlock in dependencies", task_id=plan.task_id)
                    break
                
                # Виконуємо готові задачі паралельно
                tasks_futures = []
                for task in ready_tasks:
                    future = asyncio.create_task(self._execute_agent_task(task, results))
                    tasks_futures.append((task.agent_name, future))
                
                # Чекаємо завершення
                for agent_name, future in tasks_futures:
                    try:
                        result = await future
                        results[agent_name] = result
                        completed_agents.add(agent_name)
                        logger.info("Agent task completed", agent=agent_name, task_id=plan.task_id)
                    except Exception as e:
                        logger.error("Agent task failed", agent=agent_name, error=str(e))
                        results[agent_name] = {"error": str(e)}
                        completed_agents.add(agent_name)  # Додаємо щоб не блокувати інші
            
            # Агрегуємо результати
            final_result = await self._aggregate_results(plan, results)
            
            # Публікуємо подію завершення
            await self._publish_event("chief.task_completed", {
                "task_id": plan.task_id,
                "result": final_result,
                "duration": (datetime.now() - plan.created_at).total_seconds()
            })
            
            logger.info("Plan execution completed", task_id=plan.task_id)
            
        except Exception as e:
            logger.error("Plan execution failed", task_id=plan.task_id, error=str(e))
            await self._publish_event("chief.task_failed", {
                "task_id": plan.task_id,
                "error": str(e)
            })
    
    async def _execute_agent_task(self, task: AgentTask, context_results: Dict) -> Dict[str, Any]:
        """Виконання задачі окремого агента"""
        
        # Визначаємо URL агента (за портом з agents.yaml)
        agent_ports = {
            "IngestAgent": 9010,
            "DataQualityAgent": 9012,
            "AnomalyAgent": 9020,
            "ForecastAgent": 9021,
            "GraphAgent": 9022,
            "SyntheticDataAgent": 9015,
            "SecurityAgent": 9050,
            "SelfHealingAgent": 9041,
            "ReportGenAgent": 9025
        }
        
        port = agent_ports.get(task.agent_name, 9000)
        agent_url = f"http://localhost:{port}"
        
        # Готуємо параметри з контекстом
        full_parameters = {
            **task.parameters,
            "context": context_results
        }
        
        # HTTP виклик агента
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    f"{agent_url}/{task.task_type.replace('_', '/')}",
                    json=full_parameters,
                    timeout=aiohttp.ClientTimeout(total=task.timeout)
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        raise Exception(f"Agent returned {response.status}: {error_text}")
                        
            except asyncio.TimeoutError:
                raise Exception(f"Agent {task.agent_name} timed out after {task.timeout}s")
            except aiohttp.ClientError as e:
                raise Exception(f"Network error calling {task.agent_name}: {e}")
    
    async def _aggregate_results(self, plan: ExecutionPlan, results: Dict[str, Any]) -> Dict[str, Any]:
        """Агрегація результатів від всіх агентів"""
        
        # Промпт для агрегації
        aggregation_prompt = f"""
        User asked: "{plan.user_request.query}"
        
        Results from agents:
        {json.dumps(results, indent=2, default=str)}
        
        Provide a comprehensive summary that:
        1. Directly answers the user's question
        2. Highlights key findings from each agent
        3. Identifies any anomalies or important insights
        4. Suggests next steps if applicable
        5. Formats the response appropriately for {plan.user_request.channel}
        
        Be concise but complete. Use bullet points for clarity.
        """
        
        # Використовуємо LLM для агрегації
        llm_response = await self._call_model_router({
            "model_type": "reasoning",
            "prompt": aggregation_prompt,
            "max_tokens": 1000
        })
        
        return {
            "summary": llm_response.get("response", "Analysis completed successfully."),
            "agent_results": results,
            "metadata": {
                "agents_used": list(results.keys()),
                "execution_time": (datetime.now() - plan.created_at).total_seconds(),
                "query": plan.user_request.query
            }
        }
    
    async def _call_model_router(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Виклик Model Router для LLM"""
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.model_router_url}/router/route",
                    json=request,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        # Fallback відповідь
                        return {"response": "I've processed your request. Please check the results."}
        except Exception as e:
            logger.error("Model router call failed", error=str(e))
            return {"response": "Task completed. Please review the detailed results."}
    
    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Публікація події в Redis Streams"""
        
        try:
            stream_name = f"pred:events:{event_type}"
            event_data = {
                "timestamp": datetime.now().isoformat(),
                "data": json.dumps(data, default=str)
            }
            
            self.redis_client.xadd(stream_name, event_data)
            logger.info("Event published", event_type=event_type, stream=stream_name)
            
        except Exception as e:
            logger.error("Failed to publish event", event_type=event_type, error=str(e))
    
    async def _get_task_progress(self, task_id: str) -> Dict[str, Any]:
        """Отримання прогресу виконання задачі"""
        
        # TODO: Реалізувати відстеження прогресу через Redis/події
        return {
            "completed_agents": 0,
            "total_agents": len(self.active_tasks[task_id].agent_tasks) if task_id in self.active_tasks else 0,
            "current_stage": "processing"
        }

# Точка входу
if __name__ == "__main__":
    import uvicorn
    
    # Налаштування логування
    logging.basicConfig(level=logging.INFO)
    
    # Створення та запуск агента
    agent = ChiefOrchestratorAgent()
    
    uvicorn.run(
        agent.app,
        host="0.0.0.0",
        port=9001,
        log_level="info"
    )
