#!/usr/bin/env python3
"""
🏭 ПРОДАКШН SUPERVISOR v4.0 
Конкурсна система з арбітражем та термальним захистом для 21 безкоштовної моделі
"""

import argparse
import asyncio
import time
import yaml
import json
import random
import hashlib
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
import logging
import structlog
import aiohttp
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta

# Structured logging setup
logger = structlog.get_logger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class TaskType(Enum):
    """Типи завдань для агентів"""
    CRITICAL_ORCHESTRATION = "critical_orchestration"
    CRITICAL_ROUTING = "critical_routing" 
    CRITICAL_PLANNING = "critical_planning"
    HIGH_LOAD_ANALYSIS = "high_load_analysis"
    REAL_TIME_DETECTION = "real_time_detection"
    PREDICTIVE_ANALYTICS = "predictive_analytics"
    CODE_GENERATION = "code_generation_healing"
    SYSTEM_DIAGNOSTICS = "system_diagnostics"
    FAST_PROCESSING = "fast_processing"
    DATA_TRANSFORMATION = "data_transformation"
    INDEXING_SEARCH = "indexing_search"
    EMBEDDINGS = "embeddings_vectors"
    WEB_INTELLIGENCE = "web_intelligence"
    GRAPH_ANALYSIS = "graph_analysis"
    SIMULATION = "simulation_modeling"
    DATA_GENERATION = "data_generation"
    DOCUMENT_GENERATION = "document_generation"
    FINANCIAL_ANALYSIS = "financial_analysis"
    PRIVACY_PROTECTION = "privacy_protection"
    SECURITY_TESTING = "security_testing"
    COMPLIANCE_MONITORING = "compliance_monitoring"
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    SELF_OPTIMIZATION = "self_optimization"
    DECISION_ARBITRATION = "decision_arbitration"
    USER_ASSISTANCE = "user_assistance"
    SCHEMA_ANALYSIS = "schema_analysis"

class CompetitionResult(Enum):
    """Результати конкурсу моделей"""
    WINNER = "winner"
    RUNNER_UP = "runner_up"
    FAILED = "failed"
    TIMEOUT = "timeout"
    ARBITRATION_NEEDED = "arbitration_needed"

@dataclass
class ThermalStatus:
    """Термальний статус агента/моделі"""
    temperature: float = 0.0  # 0.0 - 1.0
    load_percentage: float = 0.0
    requests_per_minute: int = 0
    cooldown_until: Optional[datetime] = None
    status: str = "normal"  # normal, warning, critical, emergency

@dataclass 
class CompetitionEntry:
    """Запис учасника конкурсу"""
    model_id: str
    agent_id: str
    response: Optional[str] = None
    latency_ms: float = 0.0
    quality_score: float = 0.0
    error: Optional[str] = None
    status: CompetitionResult = CompetitionResult.FAILED
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class ArbitrationDecision:
    """Рішення арбітража"""
    winner_model: str
    confidence: float
    reasoning: str
    timestamp: datetime = field(default_factory=datetime.now)
    arbiter_model: str = ""

class ProductionSupervisor:
    """🏭 Продакшн супервізор з конкурсною системою"""
    
    def __init__(self, config_path: str = "/Users/dima/Documents/Predator11/agents/registry.yaml",
                 policies_path: str = "/Users/dima/Documents/Predator11/agents/policies.yaml"):
        self.config_path = config_path
        self.policies_path = policies_path
        self.agents = {}
        self.models = {}
        self.policies = {}
        
        # Thermal monitoring
        self.thermal_status: Dict[str, ThermalStatus] = {}
        
        # Competition tracking
        self.competition_history: List[CompetitionEntry] = []
        self.arbitration_history: List[ArbitrationDecision] = []
        
        # Performance metrics
        self.metrics = {
            "total_requests": 0,
            "successful_competitions": 0,
            "arbitrations_needed": 0,
            "thermal_events": 0,
            "failovers": 0,
            "cost_saved": 0.0  # Завжди 0 для безкоштовних моделей
        }
        
        self.load_configuration()
        self.initialize_thermal_monitoring()
        
    def load_configuration(self):
        """Завантажує продакшн конфігурацію"""
        try:
            # Завантажуємо registry
            with open(self.config_path, 'r', encoding='utf-8') as f:
                registry = yaml.safe_load(f)
                
            self.agents = registry.get("agents", {})
            self.models = registry.get("llm_profiles", {})
            
            # Завантажуємо політики
            with open(self.policies_path, 'r', encoding='utf-8') as f:
                self.policies = yaml.safe_load(f)
            
            logger.info("🏭 Продакшн конфігурацію завантажено", 
                       agents=len(self.agents), models=len(self.models))
                       
        except Exception as e:
            logger.error("❌ Помилка завантаження конфігурації", error=str(e))
            raise
    
    def initialize_thermal_monitoring(self):
        """Ініціалізує систему термального моніторингу"""
        for agent_id in self.agents.keys():
            self.thermal_status[agent_id] = ThermalStatus()
            
        for model_id in self.get_all_available_models():
            self.thermal_status[f"model_{model_id}"] = ThermalStatus()
    
    def get_all_available_models(self) -> List[str]:
        """Повертає список всіх доступних моделей"""
        models = set()
        for agent_config in self.agents.values():
            if "competition_models" in agent_config:
                models.update(agent_config["competition_models"])
            if "fallback_chain" in agent_config:
                models.update(agent_config["fallback_chain"])
            if "emergency_pool" in agent_config:
                models.update(agent_config["emergency_pool"])
        return list(models)
    
    def update_thermal_status(self, entity_id: str, load_increase: float = 0.1):
        """Оновлює термальний статус"""
        if entity_id not in self.thermal_status:
            self.thermal_status[entity_id] = ThermalStatus()
            
        status = self.thermal_status[entity_id]
        status.load_percentage = min(1.0, status.load_percentage + load_increase)
        status.requests_per_minute += 1
        
        # Визначаємо температуру на основі навантаження
        status.temperature = status.load_percentage * 0.8 + random.uniform(0.0, 0.2)
        
        # Визначаємо статус
        if status.temperature >= 0.95:
            status.status = "emergency"
            status.cooldown_until = datetime.now() + timedelta(minutes=5)
            self.metrics["thermal_events"] += 1
        elif status.temperature >= 0.85:
            status.status = "critical"
        elif status.temperature >= 0.70:
            status.status = "warning"
        else:
            status.status = "normal"
            
        # Природне охолодження
        if status.cooldown_until and datetime.now() > status.cooldown_until:
            status.temperature *= 0.9
            status.load_percentage *= 0.9
            if status.temperature < 0.7:
                status.cooldown_until = None
    
    def is_entity_available(self, entity_id: str) -> bool:
        """Перевіряє чи доступна сутність (агент/модель)"""
        if entity_id not in self.thermal_status:
            return True
            
        status = self.thermal_status[entity_id]
        
        # Заблоковано через перегрів
        if status.cooldown_until and datetime.now() < status.cooldown_until:
            return False
            
        # Критичний перегрів
        if status.temperature >= 0.95:
            return False
            
        return True
    
    def get_available_competition_models(self, agent_id: str) -> List[str]:
        """Повертає доступні моделі для конкурсу"""
        if agent_id not in self.agents:
            return []
            
        agent_config = self.agents[agent_id]
        competition_models = agent_config.get("competition_models", [])
        
        # Фільтруємо доступні моделі
        available = []
        for model in competition_models:
            if self.is_entity_available(f"model_{model}"):
                available.append(model)
                
        # Якщо немає доступних конкурентів, використовуємо fallback
        if not available:
            fallback_chain = agent_config.get("fallback_chain", [])
            for model in fallback_chain:
                if self.is_entity_available(f"model_{model}"):
                    available.append(model)
                    if len(available) >= 2:  # Мінімум для конкурсу
                        break
        
        return available[:3]  # Максимум 3 конкуренти
    
    async def run_model_competition(self, agent_id: str, task: str, 
                                  task_type: TaskType) -> CompetitionEntry:
        """🏆 Запускає конкурс між моделями"""
        
        available_models = self.get_available_competition_models(agent_id)
        
        if not available_models:
            logger.warning("⚠️ Немає доступних моделей для конкурсу", agent=agent_id)
            return CompetitionEntry(model_id="", agent_id=agent_id, 
                                  status=CompetitionResult.FAILED)
        
        logger.info("🏆 Запускаю конкурс моделей", 
                   agent=agent_id, competitors=len(available_models))
        
        # Запускаємо конкурентів паралельно
        competitors = []
        start_time = time.time()
        
        with ThreadPoolExecutor(max_workers=len(available_models)) as executor:
            futures = {}
            
            for model_id in available_models:
                future = executor.submit(self._evaluate_model, model_id, task, task_type)
                futures[future] = model_id
            
            # Збираємо результати з таймаутом
            timeout = self.policies.get("competition_system", {}).get("timeout_seconds", 30)
            
            for future in as_completed(futures, timeout=timeout):
                model_id = futures[future]
                try:
                    result = future.result()
                    entry = CompetitionEntry(
                        model_id=model_id,
                        agent_id=agent_id,
                        response=result.get("response", ""),
                        latency_ms=(time.time() - start_time) * 1000,
                        quality_score=result.get("quality_score", 0.0),
                        status=CompetitionResult.WINNER if result.get("success") else CompetitionResult.FAILED
                    )
                    competitors.append(entry)
                    
                except Exception as e:
                    logger.error("❌ Помилка в конкуренті", model=model_id, error=str(e))
                    competitors.append(CompetitionEntry(
                        model_id=model_id,
                        agent_id=agent_id,
                        error=str(e),
                        status=CompetitionResult.FAILED
                    ))
        
        # Вибираємо переможця
        winner = await self._select_competition_winner(competitors, agent_id)
        
        # Оновлюємо термальний статус
        for competitor in competitors:
            self.update_thermal_status(f"model_{competitor.model_id}")
        
        self.competition_history.append(winner)
        self.metrics["successful_competitions"] += 1
        
        return winner
    
    def _evaluate_model(self, model_id: str, task: str, task_type: TaskType) -> Dict[str, Any]:
        """Оцінює одну модель (симуляція)"""
        
        # Симулюємо виклик моделі
        time.sleep(random.uniform(0.5, 3.0))  # Симуляція латентності
        
        # Оцінюємо якість на основі типу завдання і моделі
        quality_score = self._calculate_quality_score(model_id, task_type)
        
        # Симулюємо відповідь
        response = f"Model {model_id} response to: {task[:50]}..."
        
        return {
            "success": quality_score > 0.5,
            "response": response,
            "quality_score": quality_score
        }
    
    def _calculate_quality_score(self, model_id: str, task_type: TaskType) -> float:
        """Розраховує оцінку якості для моделі та типу завдання"""
        
        # Базова оцінка моделі
        base_scores = {
            "ai21-labs/ai21-jamba-1.5-large": 0.95,
            "mistralai/mixtral-8x7b-instruct-v0.1": 0.90,
            "meta-llama/meta-llama-3-70b-instruct": 0.88,
            "cohere/command-r-plus-08-2024": 0.85,
            "meta-llama/meta-llama-3-8b-instruct": 0.80,
            "microsoft/phi-3-small-128k-instruct": 0.78,
            "qwen/qwen2.5-32b-instruct": 0.82,
            "mistralai/codestral-latest": 0.85,
            "google/gemma-2-27b-it": 0.75
        }
        
        base_score = base_scores.get(model_id, 0.70)
        
        # Модифікатори для типів завдань
        task_modifiers = {
            TaskType.CODE_GENERATION: {
                "mistralai/codestral-latest": 0.15,
                "ai21-labs/ai21-jamba-1.5-large": 0.10
            },
            TaskType.FAST_PROCESSING: {
                "meta-llama/llama-3.2-1b-instruct": 0.20,
                "qwen/qwen2.5-3b-instruct": 0.15
            },
            TaskType.CRITICAL_ORCHESTRATION: {
                "ai21-labs/ai21-jamba-1.5-large": 0.12,
                "mistralai/mixtral-8x7b-instruct-v0.1": 0.10
            }
        }
        
        modifier = task_modifiers.get(task_type, {}).get(model_id, 0.0)
        final_score = min(1.0, base_score + modifier + random.uniform(-0.05, 0.05))
        
        return final_score
    
    async def _select_competition_winner(self, competitors: List[CompetitionEntry], 
                                       agent_id: str) -> CompetitionEntry:
        """Вибирає переможця конкурсу або запускає арбітраж"""
        
        # Фільтруємо успішні результати
        successful = [c for c in competitors if c.status != CompetitionResult.FAILED]
        
        if not successful:
            logger.error("❌ Всі конкуренти провалили завдання", agent=agent_id)
            return competitors[0] if competitors else CompetitionEntry(
                model_id="", agent_id=agent_id, status=CompetitionResult.FAILED)
        
        # Сортуємо за якістю та швидкістю
        successful.sort(key=lambda x: (-x.quality_score, x.latency_ms))
        
        winner = successful[0]
        
        # Перевіряємо чи потрібен арбітраж
        if len(successful) > 1:
            runner_up = successful[1]
            score_diff = winner.quality_score - runner_up.quality_score
            
            # Арбітраж потрібен якщо різниця мала
            if score_diff < 0.1:
                logger.info("⚖️ Запускаю арбітраж", winner=winner.model_id, 
                           runner_up=runner_up.model_id)
                
                arbitration = await self._run_arbitration(winner, runner_up, agent_id)
                if arbitration:
                    self.arbitration_history.append(arbitration)
                    # Змінюємо переможця якщо арбітр так вирішив
                    if arbitration.winner_model == runner_up.model_id:
                        winner = runner_up
        
        winner.status = CompetitionResult.WINNER
        logger.info("🏆 Переможець конкурсу", winner=winner.model_id, 
                   score=winner.quality_score, latency=f"{winner.latency_ms:.1f}ms")
        
        return winner
    
    async def _run_arbitration(self, contestant1: CompetitionEntry, 
                             contestant2: CompetitionEntry, agent_id: str) -> Optional[ArbitrationDecision]:
        """Запускає арбітраж між двома конкурентами"""
        
        if agent_id not in self.agents:
            return None
            
        arbiter_model = self.agents[agent_id].get("arbiter_model")
        if not arbiter_model or not self.is_entity_available(f"model_{arbiter_model}"):
            logger.warning("⚠️ Арбітр недоступний", arbiter=arbiter_model)
            return None
        
        # Симуляція арбітражного рішення
        arbiter_choice = random.choice([contestant1.model_id, contestant2.model_id])
        confidence = random.uniform(0.6, 0.9)
        reasoning = f"Арбітр вибрав {arbiter_choice} з confidence {confidence:.2f}"
        
        self.metrics["arbitrations_needed"] += 1
        
        return ArbitrationDecision(
            winner_model=arbiter_choice,
            confidence=confidence,
            reasoning=reasoning,
            arbiter_model=arbiter_model
        )
    
    async def handle_agent_request(self, agent_id: str, task: str, 
                                 task_type: TaskType = TaskType.CRITICAL_ORCHESTRATION) -> Dict[str, Any]:
        """🤖 Обробляє запит від агента"""
        
        self.metrics["total_requests"] += 1
        
        logger.info("📨 Новий запит від агента", agent=agent_id, task_type=task_type.value)
        
        # Перевіряємо доступність агента
        if not self.is_entity_available(agent_id):
            logger.warning("🌡️ Агент перегрітий, активую emergency", agent=agent_id)
            return await self._handle_emergency_fallback(agent_id, task, task_type)
        
        # Запускаємо конкурс моделей
        competition_result = await self.run_model_competition(agent_id, task, task_type)
        
        if competition_result.status == CompetitionResult.FAILED:
            logger.error("❌ Конкурс провалений, fallback", agent=agent_id)
            return await self._handle_emergency_fallback(agent_id, task, task_type)
        
        # Оновлюємо термальний статус агента
        self.update_thermal_status(agent_id)
        
        return {
            "success": True,
            "response": competition_result.response,
            "winner_model": competition_result.model_id,
            "quality_score": competition_result.quality_score,
            "latency_ms": competition_result.latency_ms,
            "thermal_status": self.thermal_status[agent_id].status
        }
    
    async def _handle_emergency_fallback(self, agent_id: str, task: str, 
                                       task_type: TaskType) -> Dict[str, Any]:
        """🆘 Обробляє аварійний fallback"""
        
        if agent_id not in self.agents:
            return {"success": False, "error": "Agent not found"}
        
        emergency_pool = self.agents[agent_id].get("emergency_pool", [])
        
        for model_id in emergency_pool:
            if self.is_entity_available(f"model_{model_id}"):
                logger.info("🆘 Використовую emergency модель", model=model_id)
                
                # Симуляція emergency відповіді
                result = self._evaluate_model(model_id, task, task_type)
                self.update_thermal_status(f"model_{model_id}")
                self.metrics["failovers"] += 1
                
                return {
                    "success": result["success"],
                    "response": result["response"],
                    "emergency_model": model_id,
                    "quality_score": result["quality_score"],
                    "is_emergency": True
                }
        
        logger.error("🚨 Всі emergency моделі недоступні!", agent=agent_id)
        return {
            "success": False,
            "error": "All emergency models unavailable",
            "agent": agent_id
        }
    
    def get_system_status(self) -> Dict[str, Any]:
        """📊 Повертає статус системи"""
        
        # Рахуємо термальні статуси
        thermal_counts = {"normal": 0, "warning": 0, "critical": 0, "emergency": 0}
        for status in self.thermal_status.values():
            thermal_counts[status.status] += 1
        
        # Останні конкурси
        recent_competitions = len([c for c in self.competition_history 
                                 if c.timestamp > datetime.now() - timedelta(minutes=5)])
        
        return {
            "timestamp": datetime.now().isoformat(),
            "agents_count": len(self.agents),
            "available_models": len([m for m in self.get_all_available_models() 
                                   if self.is_entity_available(f"model_{m}")]),
            "thermal_status": thermal_counts,
            "metrics": self.metrics,
            "recent_competitions": recent_competitions,
            "arbitrations_count": len(self.arbitration_history),
            "system_health": "healthy" if thermal_counts["emergency"] == 0 else "degraded"
        }
    
    def run_thermal_maintenance(self):
        """🌡️ Запускає термальне обслуговування"""
        logger.info("🌡️ Запускаю термальне обслуговування...")
        
        cooled_entities = 0
        for entity_id, status in self.thermal_status.items():
            if status.temperature > 0.1:
                # Природне охолодження
                status.temperature *= 0.95
                status.load_percentage *= 0.90
                status.requests_per_minute = max(0, status.requests_per_minute - 5)
                
                # Оновлюємо статус
                if status.temperature < 0.7 and status.status in ["warning", "critical"]:
                    status.status = "normal"
                    cooled_entities += 1
        
        logger.info("❄️ Термальне обслуговування завершено", cooled=cooled_entities)

# CLI та основні функції
def main():
    parser = argparse.ArgumentParser(description="🏭 Predator Nexus Production Supervisor")
    parser.add_argument("--config", default="/Users/dima/Documents/Predator11/agents/registry.yaml",
                       help="Шлях до конфігурації")
    parser.add_argument("--policies", default="/Users/dima/Documents/Predator11/agents/policies.yaml", 
                       help="Шлях до політик")
    parser.add_argument("--mode", choices=["interactive", "daemon", "test"], default="interactive",
                       help="Режим роботи")
    
    args = parser.parse_args()
    
    supervisor = ProductionSupervisor(args.config, args.policies)
    
    if args.mode == "test":
        # Тестовий режим
        asyncio.run(test_supervisor(supervisor))
    elif args.mode == "daemon":
        # Daemon режим
        run_daemon(supervisor)
    else:
        # Інтерактивний режим
        run_interactive(supervisor)

async def test_supervisor(supervisor: ProductionSupervisor):
    """🧪 Тестує supervisor"""
    print("🧪 Тестування продакшн supervisor...")
    
    # Тест 1: Статус системи
    status = supervisor.get_system_status()
    print(f"📊 Статус системи: {json.dumps(status, indent=2)}")
    
    # Тест 2: Конкурс для критичного агента
    result = await supervisor.handle_agent_request(
        "ChiefOrchestrator", 
        "Проаналізуй поточний стан системи та надай рекомендації",
        TaskType.CRITICAL_ORCHESTRATION
    )
    print(f"🏆 Результат конкурсу: {json.dumps(result, indent=2)}")
    
    # Тест 3: Швидкий агент
    result = await supervisor.handle_agent_request(
        "DatasetIngest",
        "Оброби великий датасет швидко",
        TaskType.FAST_PROCESSING
    )
    print(f"⚡ Швидкий процесинг: {json.dumps(result, indent=2)}")
    
    # Тест 4: Термальне обслуговування  
    supervisor.run_thermal_maintenance()
    
    print("✅ Тестування завершено!")

def run_daemon(supervisor: ProductionSupervisor):
    """🔄 Запускає supervisor як daemon"""
    print("🔄 Запуск supervisor як daemon...")
    
    while True:
        try:
            # Термальне обслуговування кожні 30 секунд
            supervisor.run_thermal_maintenance()
            
            # Виводимо статистику
            status = supervisor.get_system_status()
            logger.info("📊 Системний статус", **status)
            
            time.sleep(30)
            
        except KeyboardInterrupt:
            logger.info("👋 Зупинка supervisor...")
            break
        except Exception as e:
            logger.error("❌ Помилка daemon", error=str(e))
            time.sleep(5)

def run_interactive(supervisor: ProductionSupervisor):
    """💬 Інтерактивний режим"""
    print("💬 Інтерактивний режим Predator Nexus Production Supervisor")
    print("Команди: status, test, thermal, quit")
    
    while True:
        try:
            cmd = input("\n> ").strip().lower()
            
            if cmd == "quit" or cmd == "exit":
                break
            elif cmd == "status":
                status = supervisor.get_system_status()
                print(json.dumps(status, indent=2))
            elif cmd == "test":
                asyncio.run(test_supervisor(supervisor))
            elif cmd == "thermal":
                supervisor.run_thermal_maintenance()
                print("🌡️ Термальне обслуговування виконано")
            else:
                print("❓ Невідома команда. Доступні: status, test, thermal, quit")
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"❌ Помилка: {e}")

if __name__ == "__main__":
    main()
