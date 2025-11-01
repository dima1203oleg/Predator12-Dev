#!/usr/bin/env python3
"""
🤖 РЕАЛЬНИЙ AI АГЕНТ ДЛЯ PREDATOR11
Агент який справді використовує AI моделі через Model SDK
"""
import asyncio
import httpx
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealAIAgent:
    def __init__(self, agent_name: str, model_sdk_url: str = "http://localhost:3010"):
        self.agent_name = agent_name
        self.model_sdk_url = model_sdk_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.preferred_models = self._get_preferred_models()

    def _get_preferred_models(self) -> Dict[str, str]:
        """Визначає кращі моделі для різних типів завдань"""
        models_by_agent = {
            "AnomalyAgent": {
                "analysis": "deepseek/deepseek-r1",
                "detection": "openai/o1",
                "reporting": "microsoft/phi-4-reasoning"
            },
            "ForecastAgent": {
                "prediction": "meta/meta-llama-3.1-405b-instruct",
                "analysis": "mistral-ai/mistral-large-2411",
                "reporting": "openai/gpt-5"
            },
            "SecurityAgent": {
                "threat_analysis": "deepseek/deepseek-v3-0324",
                "vulnerability_scan": "microsoft/phi-4-mini-reasoning",
                "reporting": "deepseek/deepseek-r1"
            },
            "DataAgent": {
                "processing": "cohere/cohere-command-r-plus-08-2024",
                "analysis": "microsoft/phi-4-reasoning",
                "cleaning": "openai/gpt-4o-mini"
            }
        }

        return models_by_agent.get(self.agent_name, {
            "default": "gpt-4",
            "analysis": "claude-3",
            "processing": "llama-3.1-70b"
        })

    async def call_ai_model(self, task_type: str, prompt: str, context: Dict = None) -> Dict[str, Any]:
        """Реальний виклик AI моделі через Model SDK"""

        # Вибираємо найкращу модель для типу завдання
        model = self.preferred_models.get(task_type, self.preferred_models.get("default", "gpt-4"))

        # Формуємо контекст
        messages = []
        if context:
            system_prompt = f"Ти {self.agent_name} в системі Predator11. Контекст: {json.dumps(context, ensure_ascii=False)}"
            messages.append({"role": "system", "content": system_prompt})

        messages.append({"role": "user", "content": prompt})

        try:
            logger.info(f"[{self.agent_name}] Викликаю модель {model} для завдання {task_type}")

            request_data = {
                "model": model,
                "messages": messages,
                "max_tokens": 1000,
                "temperature": 0.7
            }

            response = await self.client.post(
                f"{self.model_sdk_url}/v1/chat/completions",
                json=request_data
            )

            if response.status_code == 200:
                data = response.json()
                ai_response = data["choices"][0]["message"]["content"]

                logger.info(f"[{self.agent_name}] ✅ Отримано відповідь від {model}: {len(ai_response)} символів")

                return {
                    "success": True,
                    "model_used": model,
                    "response": ai_response,
                    "usage": data.get("usage", {}),
                    "task_type": task_type,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                logger.error(f"[{self.agent_name}] ❌ HTTP помилка {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}

        except Exception as e:
            logger.error(f"[{self.agent_name}] ❌ Помилка виклику AI: {e}")
            return {"success": False, "error": str(e)}

    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Обробляє завдання використовуючи AI"""

        task_type = task.get("type", "analysis")
        task_data = task.get("data", "")
        context = task.get("context", {})

        # Формуємо промпт в залежності від типу агента
        if self.agent_name == "AnomalyAgent":
            prompt = f"Проаналізуй дані на предмет аномалій: {task_data}. Знайди відхилення від норми."
        elif self.agent_name == "ForecastAgent":
            prompt = f"Зроби прогноз на основі даних: {task_data}. Врахуй тренди та сезонність."
        elif self.agent_name == "SecurityAgent":
            prompt = f"Проаналізуй безпеку: {task_data}. Знайди потенційні загрози та вразливості."
        else:
            prompt = f"Обробь дані як {self.agent_name}: {task_data}"

        # Викликаємо AI
        ai_result = await self.call_ai_model(task_type, prompt, context)

        if ai_result["success"]:
            # Обробляємо відповідь AI
            processed_result = {
                "agent": self.agent_name,
                "task_id": task.get("id", "unknown"),
                "ai_analysis": ai_result["response"],
                "model_used": ai_result["model_used"],
                "confidence": 0.85,  # Можна обчислювати на основі AI відповіді
                "recommendations": self._extract_recommendations(ai_result["response"]),
                "timestamp": ai_result["timestamp"],
                "processing_successful": True
            }

            logger.info(f"[{self.agent_name}] ✅ Завдання {task.get('id')} успішно оброблено")
            return processed_result
        else:
            logger.error(f"[{self.agent_name}] ❌ Не вдалося обробити завдання: {ai_result.get('error')}")
            return {
                "agent": self.agent_name,
                "task_id": task.get("id", "unknown"),
                "error": ai_result.get("error"),
                "processing_successful": False,
                "timestamp": datetime.now().isoformat()
            }

    def _extract_recommendations(self, ai_response: str) -> List[str]:
        """Витягує рекомендації з AI відповіді"""
        recommendations = []

        # Простий парсинг рекомендацій
        lines = ai_response.split('\n')
        for line in lines:
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['рекомендую', 'потрібно', 'варто', 'слід']):
                recommendations.append(line)

        return recommendations[:5]  # Максимум 5 рекомендацій

class AgentRunner:
    """Запускач реальних AI агентів"""

    def __init__(self):
        self.agents = {}
        self.running = False

    async def start_agents(self):
        """Запускає всіх AI агентів"""
        agent_types = ["AnomalyAgent", "ForecastAgent", "SecurityAgent", "DataAgent"]

        logger.info("🚀 Запускаю реальних AI агентів...")

        for agent_type in agent_types:
            agent = RealAIAgent(agent_type)
            self.agents[agent_type] = agent
            logger.info(f"✅ {agent_type} готовий до роботи")

        self.running = True
        logger.info("🎉 Всі агенти запущені і готові обробляти завдання з AI!")

    async def process_demo_tasks(self):
        """Запускає демо завдання для тестування агентів"""

        demo_tasks = [
            {
                "id": "anomaly_001",
                "type": "detection",
                "data": "[1, 2, 3, 100, 4, 5, 6]",
                "context": {"source": "sensor_data", "threshold": 10}
            },
            {
                "id": "forecast_001",
                "type": "prediction",
                "data": "Продажі за останні 12 місяців: 100, 120, 110, 130, 140, 135, 150, 160, 155, 170, 180, 175",
                "context": {"period": "monthly", "target": "sales"}
            },
            {
                "id": "security_001",
                "type": "threat_analysis",
                "data": "Незвичайна активність: 1000 запитів з IP 192.168.1.100 за 1 хвилину",
                "context": {"system": "web_server", "time_window": "1min"}
            },
            {
                "id": "data_001",
                "type": "processing",
                "data": "CSV файл з 10000 записів, 15% відсутніх значень у колонці 'email'",
                "context": {"format": "csv", "size": "10k_rows"}
            }
        ]

        logger.info("🧪 Запускаю демо завдання для агентів...")

        results = []
        for task in demo_tasks:
            # Визначаємо який агент має обробляти завдання
            if "anomaly" in task["id"]:
                agent = self.agents["AnomalyAgent"]
            elif "forecast" in task["id"]:
                agent = self.agents["ForecastAgent"]
            elif "security" in task["id"]:
                agent = self.agents["SecurityAgent"]
            elif "data" in task["id"]:
                agent = self.agents["DataAgent"]
            else:
                continue

            # Обробляємо завдання
            result = await agent.process_task(task)
            results.append(result)

            # Невелика пауза між завданнями
            await asyncio.sleep(2)

        return results

    async def run_continuous_mode(self):
        """Запускає агентів в безперервному режимі"""
        logger.info("🔄 Запускаю агентів в безперервному режимі...")

        while self.running:
            try:
                # Генеруємо випадкові завдання
                await self.process_demo_tasks()

                # Чекаємо 30 секунд до наступного циклу
                await asyncio.sleep(30)

            except KeyboardInterrupt:
                logger.info("🛑 Зупинка агентів...")
                self.running = False
                break
            except Exception as e:
                logger.error(f"❌ Помилка в роботі агентів: {e}")
                await asyncio.sleep(10)

async def main():
    """Головна функція запуску"""

    print("🤖 ЗАПУСК РЕАЛЬНИХ AI АГЕНТІВ PREDATOR11")
    print("="*60)

    runner = AgentRunner()

    # Запускаємо агентів
    await runner.start_agents()

    # Тестуємо з демо завданнями
    print("\n🧪 Тестування агентів з реальними AI моделями:")
    results = await runner.process_demo_tasks()

    print(f"\n📊 РЕЗУЛЬТАТИ ТЕСТУВАННЯ:")
    print("="*40)

    successful_tasks = 0
    for result in results:
        if result.get("processing_successful"):
            successful_tasks += 1
            print(f"✅ {result['agent']}: Завдання {result['task_id']} - модель {result.get('model_used', 'N/A')}")
        else:
            print(f"❌ {result['agent']}: Завдання {result['task_id']} - помилка")

    print(f"\n🎯 Успішність: {successful_tasks}/{len(results)} ({successful_tasks/len(results)*100:.1f}%)")

    if successful_tasks > len(results) * 0.7:
        print("✅ АГЕНТИ УСПІШНО ВИКОРИСТОВУЮТЬ AI МОДЕЛІ!")
    else:
        print("⚠️ Деякі агенти мають проблеми з AI моделями")

if __name__ == "__main__":
    asyncio.run(main())
