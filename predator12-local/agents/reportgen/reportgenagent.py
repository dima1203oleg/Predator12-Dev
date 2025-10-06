#!/usr/bin/env python3
"""
ReportGenAgent for Predator11
Role: AI-powered automated report generation
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
TASKS_COUNTER = Counter('reportgenagent_tasks_total', 'Total tasks processed')
HEALTH_GAUGE = Gauge('reportgenagent_health', 'Agent health status')

class ReportGenAgent:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.running = False
        self.agent_name = "ReportGenAgent"
        self.port = 9025
        self.role = "AI-powered automated report generation"
        
        # З'єднання з Redis для координації
        self.redis = None
        
    async def initialize(self):
        """Ініціалізація агента"""
        try:
            self.redis = aioredis.from_url(
                os.getenv('REDIS_URL', 'redis://localhost:6379'),
                encoding="utf-8", decode_responses=True
            )
            HEALTH_GAUGE.set(1)  # Healthy
            self.logger.info(f"{self.agent_name} initialized on port {self.port}")
        except Exception as e:
            self.logger.error(f"Failed to initialize {self.agent_name}: {e}")
            HEALTH_GAUGE.set(0)  # Unhealthy
            raise
        
    async def start(self):
        """Запуск основного циклу агента"""
        self.running = True
        self.logger.info(f"Starting {self.agent_name} - {self.role}")
        
        # Реєструємо агента в Redis
        if self.redis:
            await self.redis.hset(f"agent:{self.agent_name}:status", mapping={
                "status": "active",
                "port": self.port,
                "role": self.role,
                "last_seen": datetime.utcnow().isoformat(),
                "tasks_completed": 0
            })
        
        task_counter = 0
        while self.running:
            try:
                # Симулюємо роботу агента
                task_counter += 1
                TASKS_COUNTER.inc()
                
                # Оновлюємо статус в Redis
                if self.redis:
                    await self.redis.hset(f"agent:{self.agent_name}:status", mapping={
                        "last_seen": datetime.utcnow().isoformat(),
                        "tasks_completed": task_counter
                    })
                
                self.logger.info(f"{self.agent_name} активний - завдання {task_counter}")
                await asyncio.sleep(60)  # Цикл кожну хвилину
                
            except Exception as e:
                self.logger.error(f"Error in {self.agent_name} loop: {e}")
                HEALTH_GAUGE.set(0)
                await asyncio.sleep(30)
            
    async def stop(self):
        """Зупинка агента"""
        self.running = False
        HEALTH_GAUGE.set(0)
        self.logger.info(f"Stopping {self.agent_name}")
        
        if self.redis:
            await self.redis.hset(f"agent:{self.agent_name}:status", 
                                 "status", "stopped")
            await self.redis.close()

async def main():
    logging.basicConfig(level=logging.INFO)
    agent = ReportGenAgent()
    
    try:
        await agent.initialize()
        await agent.start()
    except KeyboardInterrupt:
        logging.info("Received interrupt signal")
    finally:
        await agent.stop()

if __name__ == "__main__":
    asyncio.run(main())
