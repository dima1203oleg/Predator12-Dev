#!/usr/bin/env python3
"""
🛡️ НІЧНИЙ СТРАЖ СИСТЕМИ PREDATOR11
Автоматичний моніторинг та самовідновлення системи
"""
import asyncio
import aiohttp
import logging
import subprocess
import time
from datetime import datetime
from pathlib import Path
import json
import psutil

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/dima/Documents/Predator11/logs/night_guardian.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class NightGuardian:
    def __init__(self):
        self.base_path = Path("/Users/dima/Documents/Predator11")
        self.components = {
            "Model Server": {"url": "http://localhost:3010/health", "critical": True},
            "Backend API": {"url": "http://localhost:8000/health", "critical": True},
            "Frontend": {"url": "http://localhost:3000", "critical": False},
            "Grafana": {"url": "http://localhost:3001", "critical": False},
            "Prometheus": {"url": "http://localhost:9090", "critical": False}
        }

        self.agents = [
            {"name": "SelfHealing", "script": "agents/self-healing/self_healing_agent.py", "port": 8008},
            {"name": "SelfImprovement", "script": "agents/self-improvement/self_improvement_agent.py", "port": 8009},
            {"name": "SelfDiagnosis", "script": "agents/self-diagnosis/self_diagnosis_agent.py", "port": 9040}
        ]

        self.stats = {
            "total_checks": 0,
            "fixes_applied": 0,
            "last_fix_time": None,
            "uptime_start": datetime.now()
        }

    async def check_component(self, name, config):
        """Перевіряє стан компонента"""
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
                async with session.get(config["url"]) as response:
                    if response.status == 200:
                        return True
        except:
            pass
        return False

    async def check_agent_health(self, agent):
        """Перевіряє стан агента"""
        try:
            # Перевіряємо чи процес агента запущений
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if agent["script"] in cmdline:
                    return True
            return False
        except:
            return False

    async def restart_agent(self, agent):
        """Перезапускає агента"""
        try:
            logger.info(f"🔄 Перезапускаю агента {agent['name']}...")

            # Спочатку завершуємо старий процес
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if agent["script"] in cmdline:
                    proc.terminate()
                    await asyncio.sleep(2)
                    if proc.is_running():
                        proc.kill()

            # Запускаємо новий процес
            agent_path = self.base_path / agent["script"]
            if agent_path.exists():
                subprocess.Popen([
                    'python3', str(agent_path)
                ], cwd=self.base_path)

                await asyncio.sleep(5)
                if await self.check_agent_health(agent):
                    logger.info(f"✅ Агент {agent['name']} успішно перезапущений")
                    return True
                else:
                    logger.error(f"❌ Не вдалося перезапустити агента {agent['name']}")
                    return False
            else:
                logger.error(f"❌ Скрипт агента не знайдено: {agent_path}")
                return False

        except Exception as e:
            logger.error(f"❌ Помилка перезапуску агента {agent['name']}: {e}")
            return False

    async def restart_model_server(self):
        """Перезапускає model server"""
        try:
            logger.info("🔄 Перезапускаю Model Server...")

            # Завершуємо старий процес
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if 'standalone_model_server.py' in cmdline:
                    proc.terminate()
                    await asyncio.sleep(2)
                    if proc.is_running():
                        proc.kill()

            # Запускаємо новий
            subprocess.Popen([
                'python3', 'standalone_model_server.py'
            ], cwd=self.base_path)

            # Перевіряємо запуск
            for i in range(10):
                if await self.check_component("Model Server", self.components["Model Server"]):
                    logger.info("✅ Model Server успішно перезапущений")
                    return True
                await asyncio.sleep(2)

            logger.error("❌ Не вдалося перезапустити Model Server")
            return False

        except Exception as e:
            logger.error(f"❌ Помилка перезапуску Model Server: {e}")
            return False

    async def restart_docker_compose(self):
        """Перезапускає Docker Compose"""
        try:
            logger.info("🐋 Перезапускаю Docker Compose...")

            # Зупиняємо
            subprocess.run(['docker-compose', 'down'], cwd=self.base_path, capture_output=True)
            await asyncio.sleep(5)

            # Запускаємо
            result = subprocess.run(['docker-compose', 'up', '-d'],
                                  cwd=self.base_path, capture_output=True, text=True)

            if result.returncode == 0:
                await asyncio.sleep(30)  # Чекаємо запуску контейнерів
                logger.info("✅ Docker Compose перезапущений")
                return True
            else:
                logger.error(f"❌ Помилка Docker Compose: {result.stderr}")
                return False

        except Exception as e:
            logger.error(f"❌ Помилка перезапуску Docker Compose: {e}")
            return False

    async def perform_health_check(self):
        """Виконує повну перевірку здоров'я системи"""
        self.stats["total_checks"] += 1
        issues_found = []
        fixes_applied = []

        logger.info("🔍 Виконую перевірку стану системи...")

        # Перевіряємо компоненти
        for name, config in self.components.items():
            if not await self.check_component(name, config):
                issues_found.append(f"❌ {name} недоступний")

                if config["critical"]:
                    if name == "Model Server":
                        if await self.restart_model_server():
                            fixes_applied.append(f"✅ {name} перезапущений")
                    elif name == "Backend API":
                        if await self.restart_docker_compose():
                            fixes_applied.append(f"✅ Docker система перезапущена")
            else:
                logger.info(f"✅ {name} працює нормально")

        # Перевіряємо агентів
        for agent in self.agents:
            if not await self.check_agent_health(agent):
                issues_found.append(f"❌ Агент {agent['name']} не працює")
                if await self.restart_agent(agent):
                    fixes_applied.append(f"✅ Агент {agent['name']} перезапущений")
            else:
                logger.info(f"✅ Агент {agent['name']} працює нормально")

        # Оновлюємо статистику
        if fixes_applied:
            self.stats["fixes_applied"] += len(fixes_applied)
            self.stats["last_fix_time"] = datetime.now()

        # Логуємо результати
        if issues_found:
            logger.warning(f"Знайдено проблем: {len(issues_found)}")
            for issue in issues_found:
                logger.warning(issue)

        if fixes_applied:
            logger.info(f"Застосовано виправлень: {len(fixes_applied)}")
            for fix in fixes_applied:
                logger.info(fix)

        if not issues_found:
            logger.info("✅ Всі системи працюють нормально")

        return len(issues_found), len(fixes_applied)

    async def generate_report(self):
        """Генерує звіт про роботу"""
        uptime = datetime.now() - self.stats["uptime_start"]

        report = f"""
🛡️ ЗВІТ НІЧНОГО СТРАЖУ СИСТЕМИ
================================
📅 Час роботи: {uptime}
🔍 Всього перевірок: {self.stats['total_checks']}
🔧 Застосовано виправлень: {self.stats['fixes_applied']}
⏰ Остання корекція: {self.stats['last_fix_time'] or 'Немає'}

📊 ПОТОЧНИЙ СТАН СИСТЕМИ:
"""

        for name, config in self.components.items():
            status = "✅ Працює" if await self.check_component(name, config) else "❌ Недоступний"
            report += f"• {name}: {status}\n"

        report += "\n🤖 СТАН АГЕНТІВ:\n"
        for agent in self.agents:
            status = "✅ Активний" if await self.check_agent_health(agent) else "❌ Неактивний"
            report += f"• {agent['name']}: {status}\n"

        return report

    async def run_guardian(self):
        """Запускає нічного стража"""
        logger.info("🛡️ НІЧНИЙ СТРАЖ СИСТЕМИ ЗАПУЩЕНИЙ")
        logger.info("🌙 Система буде автоматично контролюватися всю ніч")

        while True:
            try:
                issues, fixes = await self.perform_health_check()

                # Генеруємо звіт кожні 10 перевірок
                if self.stats["total_checks"] % 10 == 0:
                    report = await self.generate_report()
                    logger.info(report)

                # Чекаємо 5 хвилин між перевірками
                await asyncio.sleep(300)

            except KeyboardInterrupt:
                logger.info("🛑 Нічний страж зупинений користувачем")
                break
            except Exception as e:
                logger.error(f"❌ Помилка нічного стража: {e}")
                await asyncio.sleep(60)  # Чекаємо хвилину при помилці

async def main():
    guardian = NightGuardian()
    await guardian.run_guardian()

if __name__ == "__main__":
    asyncio.run(main())
