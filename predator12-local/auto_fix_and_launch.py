#!/usr/bin/env python3
"""
🔧 АВТОМАТИЧНЕ ВИПРАВЛЕННЯ ТА ЗАПУСК СИСТЕМИ PREDATOR11
Скрипт для автоматичного запуску всіх компонентів системи
"""
import subprocess
import time
import requests
import asyncio
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SystemLauncher:
    def __init__(self):
        self.base_path = Path("/Users/dima/Documents/Predator11")

    def check_docker(self):
        """Перевіряє статус Docker"""
        try:
            result = subprocess.run(['docker', 'ps'], capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            return False

    def start_docker(self):
        """Запускає Docker Desktop"""
        logger.info("🐳 Запускаю Docker Desktop...")
        try:
            subprocess.run(['open', '-a', 'Docker'], check=False)
            # Чекаємо поки Docker запуститься
            for i in range(30):
                if self.check_docker():
                    logger.info("✅ Docker готовий!")
                    return True
                logger.info(f"⏳ Чекаю Docker... ({i+1}/30)")
                time.sleep(2)
            return False
        except Exception as e:
            logger.error(f"❌ Помилка запуску Docker: {e}")
            return False

    def start_standalone_models(self):
        """Запускає standalone model server"""
        logger.info("🤖 Запускаю Standalone Model Server...")
        try:
            # Перевіряємо чи вже запущений
            response = requests.get("http://localhost:3010/health", timeout=2)
            if response.status_code == 200:
                logger.info("✅ Model Server вже працює!")
                return True
        except:
            pass

        # Запускаємо новий процес
        try:
            subprocess.Popen([
                'python3', 'standalone_model_server.py'
            ], cwd=self.base_path)

            # Чекаємо запуску
            for i in range(10):
                try:
                    response = requests.get("http://localhost:3010/health", timeout=2)
                    if response.status_code == 200:
                        logger.info("✅ Model Server запущений!")
                        return True
                except:
                    pass
                time.sleep(1)
            return False
        except Exception as e:
            logger.error(f"❌ Помилка запуску Model Server: {e}")
            return False

    def start_docker_compose(self):
        """Запускає Docker Compose"""
        logger.info("🐋 Запускаю Docker Compose...")
        try:
            result = subprocess.run([
                'docker-compose', 'up', '-d'
            ], cwd=self.base_path, capture_output=True, text=True)

            if result.returncode == 0:
                logger.info("✅ Docker Compose запущений!")
                return True
            else:
                logger.error(f"❌ Помилка Docker Compose: {result.stderr}")
                return False
        except Exception as e:
            logger.error(f"❌ Помилка запуску Docker Compose: {e}")
            return False

    def start_agents(self):
        """Запускає агентів самовдосконалення"""
        logger.info("🤖 Запускаю агентів самовдосконалення...")

        agents = [
            "agents/self-healing/self_healing_agent.py",
            "agents/self-improvement/self_improvement_agent.py",
            "agents/self-diagnosis/self_diagnosis_agent.py"
        ]

        started_agents = 0
        for agent in agents:
            try:
                agent_path = self.base_path / agent
                if agent_path.exists():
                    subprocess.Popen([
                        'python3', str(agent_path)
                    ], cwd=self.base_path)
                    logger.info(f"✅ Запущено: {agent}")
                    started_agents += 1
                    time.sleep(2)
                else:
                    logger.warning(f"⚠️  Файл не знайдено: {agent}")
            except Exception as e:
                logger.error(f"❌ Помилка запуску {agent}: {e}")

        return started_agents > 0

    def run_system_check(self):
        """Перевіряє стан системи"""
        logger.info("🔍 Перевіряю стан системи...")

        checks = {
            "Model Server (3010)": "http://localhost:3010/health",
            "Backend (8000)": "http://localhost:8000/health",
            "Frontend (3000)": "http://localhost:3000",
        }

        results = {}
        for name, url in checks.items():
            try:
                response = requests.get(url, timeout=3)
                results[name] = "✅ Працює" if response.status_code == 200 else "❌ Помилка"
            except:
                results[name] = "❌ Недоступний"

        return results

    def launch_full_system(self):
        """Запускає всю систему"""
        logger.info("🚀 ЗАПУСК ПОВНОЇ СИСТЕМИ PREDATOR11")
        logger.info("=" * 50)

        # 1. Запуск Model Server (замість проблемного контейнера)
        if not self.start_standalone_models():
            logger.error("❌ Не вдалося запустити Model Server")
            return False

        # 2. Запуск Docker
        if not self.check_docker():
            if not self.start_docker():
                logger.error("❌ Не вдалося запустити Docker")
                return False

        # 3. Запуск Docker Compose
        if not self.start_docker_compose():
            logger.error("❌ Не вдалося запустити Docker Compose")
            return False

        # 4. Чекаємо коли контейнери будуть готові
        logger.info("⏳ Чекаю готовності контейнерів...")
        time.sleep(30)

        # 5. Запуск агентів
        if not self.start_agents():
            logger.warning("⚠️  Деякі агенти не запустилися")

        # 6. Перевірка системи
        logger.info("\n" + "=" * 50)
        logger.info("📊 ФІНАЛЬНА ПЕРЕВІРКА СИСТЕМИ")
        logger.info("=" * 50)

        time.sleep(10)
        results = self.run_system_check()

        for component, status in results.items():
            logger.info(f"{component}: {status}")

        logger.info("\n🎉 СИСТЕМА ГОТОВА ДО РОБОТИ!")
        logger.info("🌐 Frontend: http://localhost:3000")
        logger.info("🔧 Backend API: http://localhost:8000")
        logger.info("🤖 Model Server: http://localhost:3010")

        return True

def main():
    launcher = SystemLauncher()
    launcher.launch_full_system()

if __name__ == "__main__":
    main()
