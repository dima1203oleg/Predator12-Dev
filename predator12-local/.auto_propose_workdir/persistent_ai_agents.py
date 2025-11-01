#!/usr/bin/env python3
"""
🔄 ПОСТІЙНИЙ AI АГЕНТ PREDATOR11
Працює незалежно від стану Docker контейнерів
"""
import asyncio
import httpx
import json
import logging
from datetime import datetime
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PersistentAIAgent:
    def __init__(self, name: str):
        self.name = name
        self.model_sdk_url = "http://localhost:3010"
        self.client = httpx.AsyncClient(timeout=30.0)
        self.tasks_processed = 0
        self.running = True

        # Спеціалізовані моделі для агента
        self.models = {
            "AnomalyAgent": "deepseek/deepseek-r1",
            "ForecastAgent": "meta/meta-llama-3.1-405b-instruct",
            "SecurityAgent": "deepseek/deepseek-v3-0324",
            "DataAgent": "cohere/cohere-command-r-plus-08-2024",
            "SelfHealingAgent": "microsoft/phi-4-reasoning"
        }

    async def call_ai_model(self, prompt: str) -> dict:
        """Викликає AI модель для обробки завдання"""
        try:
            model = self.models.get(self.name, "gpt-4")

            request_data = {
                "model": model,
                "messages": [
                    {"role": "system", "content": f"Ти {self.name} в системі Predator11. Давай точні технічні відповіді."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 800
            }

            response = await self.client.post(f"{self.model_sdk_url}/v1/chat/completions", json=request_data)

            if response.status_code == 200:
                data = response.json()
                ai_response = data["choices"][0]["message"]["content"]

                logger.info(f"[{self.name}] ✅ AI відповідь отримана від {model}: {len(ai_response)} символів")

                return {
                    "success": True,
                    "model": model,
                    "response": ai_response,
                    "tokens_used": data.get("usage", {}).get("total_tokens", 0)
                }
            else:
                logger.error(f"[{self.name}] ❌ HTTP помилка: {response.status_code}")
                return {"success": False, "error": f"HTTP {response.status_code}"}

        except Exception as e:
            logger.error(f"[{self.name}] ❌ Помилка AI виклику: {e}")
            return {"success": False, "error": str(e)}

    async def process_continuous_tasks(self):
        """Безперервно обробляє завдання"""

        # Генеруємо різні завдання для агентів
        task_templates = {
            "AnomalyAgent": [
                "Проаналізуй метрики системи на аномалії: CPU 45%, RAM 78%, Disk 23%",
                "Знайди відхилення в логах: 15000 запитів за хвилину при нормі 500",
                "Перевір дані сенсорів: temperature=[20,21,19,45,22,20,21] на аномальні значення"
            ],
            "ForecastAgent": [
                "Спрогнозуй навантаження на систему на наступну годину на основі поточних трендів",
                "Передбач кількість користувачів завтра на основі історії: [100,120,110,130,140]",
                "Оціни ймовірність збою системи в наступні 24 години"
            ],
            "SecurityAgent": [
                "Проаналізуй підозрілу активність: 500 неуспішних логінів за 10 хвилин",
                "Оціни безпеку системи на основі поточних налаштувань",
                "Перевір логи на ознаки вторгнення або зловмисної активності"
            ],
            "DataAgent": [
                "Очисти датасет з 5000 записів: 10% дублікатів, 15% пропущених значень",
                "Проаналізуй якість вхідних даних та запропонуй покращення",
                "Підготуй дані для машинного навчання: нормалізація та feature engineering"
            ],
            "SelfHealingAgent": [
                "Діагностуй проблеми системи та запропонуй автоматичні виправлення",
                "Перевір стан всіх сервісів та виправ знайдені проблеми",
                "Оптимізуй продуктивність системи автоматично"
            ]
        }

        tasks = task_templates.get(self.name, ["Виконай загальний аналіз системи"])
        task_index = 0

        logger.info(f"🚀 [{self.name}] Розпочинаю безперервну роботу з AI моделями")

        while self.running:
            try:
                # Вибираємо завдання циклічно
                current_task = tasks[task_index % len(tasks)]
                task_index += 1

                logger.info(f"[{self.name}] 📋 Завдання #{self.tasks_processed + 1}: {current_task[:50]}...")

                # Обробляємо завдання з AI
                result = await self.call_ai_model(current_task)

                if result["success"]:
                    self.tasks_processed += 1

                    # Логуємо результат
                    logger.info(f"[{self.name}] ✅ Завдання #{self.tasks_processed} виконано успішно")
                    logger.info(f"[{self.name}] 🤖 Використана модель: {result['model']}")
                    logger.info(f"[{self.name}] 📝 Результат: {result['response'][:100]}...")

                    # Зберігаємо результат
                    await self.save_result(current_task, result)

                else:
                    logger.error(f"[{self.name}] ❌ Не вдалося виконати завдання: {result.get('error')}")

                # Чекаємо перед наступним завданням
                await asyncio.sleep(10)  # 10 секунд між завданнями

            except KeyboardInterrupt:
                logger.info(f"[{self.name}] 🛑 Зупинка агента...")
                self.running = False
                break
            except Exception as e:
                logger.error(f"[{self.name}] ❌ Критична помилка: {e}")
                await asyncio.sleep(30)  # Чекаємо при критичних помилках

    async def save_result(self, task: str, result: dict):
        """Зберігає результат роботи агента"""
        try:
            log_entry = {
                "agent": self.name,
                "task": task,
                "model_used": result["model"],
                "response": result["response"],
                "tokens_used": result.get("tokens_used", 0),
                "timestamp": datetime.now().isoformat(),
                "task_number": self.tasks_processed
            }

            # Зберігаємо в лог файл
            log_file = f"/Users/dima/Documents/Predator11/logs/agents/{self.name.lower()}_ai_activity.log"

            with open(log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")

        except Exception as e:
            logger.error(f"[{self.name}] Помилка збереження результату: {e}")

class AgentManager:
    """Менеджер для запуску кількох агентів"""

    def __init__(self):
        self.agents = []
        self.running = True

    async def start_all_agents(self):
        """Запускає всіх агентів одночасно"""

        agent_types = ["AnomalyAgent", "ForecastAgent", "SecurityAgent", "DataAgent", "SelfHealingAgent"]

        logger.info("🚀 Запускаю всіх постійних AI агентів...")

        # Створюємо завдання для кожного агента
        tasks = []
        for agent_type in agent_types:
            agent = PersistentAIAgent(agent_type)
            self.agents.append(agent)
            task = asyncio.create_task(agent.process_continuous_tasks())
            tasks.append(task)
            logger.info(f"✅ {agent_type} запущений")

        # Статистика кожні 60 секунд
        stats_task = asyncio.create_task(self.print_statistics())
        tasks.append(stats_task)

        logger.info(f"🎉 {len(agent_types)} AI агентів працюють безперервно!")

        # Чекаємо завершення всіх завдань
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            logger.info("🛑 Зупинка всіх агентів...")
            for agent in self.agents:
                agent.running = False

    async def print_statistics(self):
        """Виводить статистику роботи агентів"""
        start_time = time.time()

        while self.running:
            try:
                await asyncio.sleep(60)  # Кожну хвилину

                uptime = int(time.time() - start_time)
                total_tasks = sum(agent.tasks_processed for agent in self.agents)

                logger.info("📊 " + "="*50)
                logger.info(f"📊 СТАТИСТИКА РОБОТИ АГЕНТІВ (Uptime: {uptime}s)")
                logger.info("📊 " + "="*50)

                for agent in self.agents:
                    rate = agent.tasks_processed / (uptime / 60) if uptime > 0 else 0
                    logger.info(f"🤖 {agent.name}: {agent.tasks_processed} завдань ({rate:.1f}/хв)")

                logger.info(f"🎯 Загалом: {total_tasks} завдань оброблено")
                logger.info(f"⚡ Середня швидкість: {total_tasks / (uptime / 60) if uptime > 0 else 0:.1f} завдань/хв")

            except Exception as e:
                logger.error(f"Помилка статистики: {e}")
                await asyncio.sleep(60)

async def main():
    """Головна функція"""

    print("🤖 ЗАПУСК ПОСТІЙНИХ AI АГЕНТІВ PREDATOR11")
    print("="*60)
    print("Агенти будуть працювати безперервно з реальними AI моделями")
    print("Для зупинки натисніть Ctrl+C")
    print("="*60)

    manager = AgentManager()
    await manager.start_all_agents()

if __name__ == "__main__":
    asyncio.run(main())
