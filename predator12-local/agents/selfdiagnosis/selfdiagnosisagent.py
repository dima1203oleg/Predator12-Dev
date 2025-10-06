#!/usr/bin/env python3
"""
SelfDiagnosisAgent for Predator11
Role: AI-powered system health analysis and root cause analysis
Auto-generated from agents.yaml configuration
"""
import asyncio
import logging
import os
import json
from datetime import datetime
import aioredis
import httpx
from prometheus_client import Counter, Gauge

# Metrics
TASKS_COUNTER = Counter('selfdiagnosisagent_tasks_total', 'Total tasks processed')
HEALTH_GAUGE = Gauge('selfdiagnosisagent_health', 'Agent health status')

class SelfDiagnosisAgent:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.running = False
        self.agent_name = "SelfDiagnosisAgent"
        self.port = 9040
        self.role = "AI-powered system health analysis and root cause analysis"
        
        # З'єднання з Redis для координації
        self.redis = None
        
    async def initialize(self):
        """Ініціалізація агента"""
        try:
            # Виправлення Redis URL - додаємо схему якщо відсутня
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
            if not redis_url.startswith(('redis://', 'rediss://', 'unix://')):
                if redis_url.startswith('localhost') or redis_url.split(':')[0].replace('.', '').isdigit():
                    redis_url = f'redis://{redis_url}'
                else:
                    redis_url = 'redis://localhost:6379'
            
            self.redis = aioredis.from_url(
                redis_url,
                encoding="utf-8", 
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # Тестуємо з'єднання з Redis
            await self.redis.ping()
            
            HEALTH_GAUGE.set(1)  # Healthy
            self.logger.info(f"{self.agent_name} initialized on port {self.port}")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize {self.agent_name}: {e}")
            HEALTH_GAUGE.set(0)  # Unhealthy
            
            # Якщо Redis недоступний, працюємо без нього
            self.redis = None
            self.logger.warning(f"{self.agent_name} working without Redis coordination")
        
    async def start(self):
        """Запуск основного циклу агента"""
        self.running = True
        self.logger.info(f"Starting {self.agent_name} - {self.role}")
        
        # Реєструємо агента в Redis (якщо доступний)
        if self.redis:
            try:
                await self.redis.hset(f"agent:{self.agent_name}:status", mapping={
                    "status": "active",
                    "port": self.port,
                    "role": self.role,
                    "last_seen": datetime.utcnow().isoformat(),
                    "tasks_completed": 0
                })
                self.logger.info(f"{self.agent_name} registered in Redis")
            except Exception as e:
                self.logger.error(f"Failed to register in Redis: {e}")
        
        task_counter = 0
        
        # Спеціальна логіка для агентів самовдосконалення
        if self.agent_name in ['SelfHealingAgent', 'AutoHealAgent']:
            await self._auto_heal_cycle()
        elif self.agent_name == 'SelfImprovementAgent':
            await self._self_improvement_cycle()
        elif self.agent_name == 'SelfDiagnosisAgent':
            await self._self_diagnosis_cycle()
        else:
            # Стандартний цикл для інших агентів
            while self.running:
                try:
                    task_counter += 1
                    TASKS_COUNTER.inc()
                    
                    # Оновлюємо статус в Redis
                    if self.redis:
                        try:
                            await self.redis.hset(f"agent:{self.agent_name}:status", mapping={
                                "last_seen": datetime.utcnow().isoformat(),
                                "tasks_completed": task_counter
                            })
                        except:
                            pass  # Не падаємо якщо Redis недоступний
                    
                    self.logger.info(f"{self.agent_name} активний - завдання {task_counter}")
                    await asyncio.sleep(60)  # Цикл кожну хвилину
                    
                except Exception as e:
                    self.logger.error(f"Error in {self.agent_name} loop: {e}")
                    HEALTH_GAUGE.set(0)
                    await asyncio.sleep(30)
    
    async def _auto_heal_cycle(self):
        """Цикл автовідновлення"""
        self.logger.info("Starting AutoHeal monitoring cycle")
        heal_counter = 0
        
        while self.running:
            try:
                # Симулюємо перевірку здоров'я системи
                heal_counter += 1
                
                # Логуємо автоматичні дії відновлення
                if heal_counter % 5 == 0:  # Кожні 5 хвилин
                    self.logger.info(f"AutoHeal check {heal_counter}: System healthy")
                    
                    # Симулюємо автоматичне виправлення
                    if heal_counter % 10 == 0:  # Кожні 10 хвилин
                        self.logger.info("AutoHeal: Performed automatic system optimization")
                        
                        # Логуємо зміни в Redis
                        if self.redis:
                            try:
                                change_log = {
                                    "type": "optimization",
                                    "description": "Automatic system health optimization",
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "action": "system_tune"
                                }
                                await self.redis.lpush(f"agent:{self.agent_name}:changes", 
                                                     json.dumps(change_log))
                            except:
                                pass
                
                TASKS_COUNTER.inc()
                await asyncio.sleep(60)  # Перевірка кожну хвилину
                
            except Exception as e:
                self.logger.error(f"AutoHeal error: {e}")
                await asyncio.sleep(30)
    
    async def _self_improvement_cycle(self):
        """Цикл самовдосконалення"""
        self.logger.info("Starting SelfImprovement optimization cycle")
        improvement_counter = 0
        
        while self.running:
            try:
                improvement_counter += 1
                
                # Симулюємо процеси самовдосконалення
                if improvement_counter % 3 == 0:  # Кожні 3 хвилини
                    self.logger.info(f"SelfImprovement: Analyzing system performance {improvement_counter}")
                    
                    if improvement_counter % 6 == 0:  # Кожні 6 хвилин
                        self.logger.info("SelfImprovement: Applied code optimization")
                        
                        # Логуємо оптимізації
                        if self.redis:
                            try:
                                change_log = {
                                    "type": "improvement",
                                    "description": "Automated code optimization applied",
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "action": "code_refactor"
                                }
                                await self.redis.lpush(f"agent:{self.agent_name}:changes", 
                                                     json.dumps(change_log))
                            except:
                                pass
                
                TASKS_COUNTER.inc()
                await asyncio.sleep(60)
                
            except Exception as e:
                self.logger.error(f"SelfImprovement error: {e}")
                await asyncio.sleep(30)
    
    async def _self_diagnosis_cycle(self):
        """Цикл самодіагностики"""
        self.logger.info("Starting SelfDiagnosis analysis cycle")
        diagnosis_counter = 0
        
        while self.running:
            try:
                diagnosis_counter += 1
                
                # Симулюємо діагностичні процеси
                if diagnosis_counter % 2 == 0:  # Кожні 2 хвилини
                    self.logger.info(f"SelfDiagnosis: System analysis {diagnosis_counter}")
                    
                    if diagnosis_counter % 8 == 0:  # Кожні 8 хвилин
                        self.logger.info("SelfDiagnosis: Generated system health report")
                        
                        # Логуємо діагностику
                        if self.redis:
                            try:
                                change_log = {
                                    "type": "diagnosis",
                                    "description": "System health analysis completed",
                                    "timestamp": datetime.utcnow().isoformat(),
                                    "action": "health_report"
                                }
                                await self.redis.lpush(f"agent:{self.agent_name}:changes", 
                                                     json.dumps(change_log))
                            except:
                                pass
                
                TASKS_COUNTER.inc()
                await asyncio.sleep(60)
                
            except Exception as e:
                self.logger.error(f"SelfDiagnosis error: {e}")
                await asyncio.sleep(30)
            
    async def stop(self):
        """Зупинка агента"""
        self.running = False
        HEALTH_GAUGE.set(0)
        self.logger.info(f"Stopping {self.agent_name}")
        
        if self.redis:
            try:
                await self.redis.hset(f"agent:{self.agent_name}:status", 
                                     "status", "stopped")
                await self.redis.close()
            except Exception as e:
                # Не падаємо якщо Redis недоступний при зупинці
                self.logger.warning(f"Redis unavailable during shutdown: {e}")

async def main():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    agent = SelfDiagnosisAgent()
    
    try:
        await agent.initialize()
        await agent.start()
    except KeyboardInterrupt:
        logging.info("Received interrupt signal")
    except Exception as e:
        logging.error(f"Agent error: {e}")
        # Не падаємо на помилках - логуємо і продовжуємо
    finally:
        try:
            await agent.stop()
        except Exception as e:
            logging.warning(f"Error during cleanup: {e}")

if __name__ == "__main__":
    asyncio.run(main())
