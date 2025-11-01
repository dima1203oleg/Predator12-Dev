#!/usr/bin/env python3
"""
🏥 Тестування агентів самовиправлення
Перевіряє функціональність агентів без Docker контейнерів
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List

import aiohttp
import docker

# Налаштування логування
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SimpleHealthChecker:
    """Простий перевірник здоров'я контейнерів"""

    def __init__(self):
        self.client = docker.from_env()

    async def check_containers(self) -> List[Dict[str, Any]]:
        """Перевіряє стан всіх контейнерів"""
        containers_info = []

        try:
            containers = self.client.containers.list(all=True)

            for container in containers:
                try:
                    # Отримання інформації про контейнер
                    info = {
                        "name": container.name,
                        "status": container.status,
                        "health": getattr(container.attrs.get("State", {}), "Health", {}).get(
                            "Status", "no-health-check"
                        ),
                        "image": container.image.tags[0] if container.image.tags else "unknown",
                        "created": container.attrs["Created"],
                        "ports": container.attrs.get("NetworkSettings", {}).get("Ports", {}),
                        "needs_healing": False,
                    }

                    # Визначення, чи потребує лікування
                    if container.status in ["exited", "dead", "paused"]:
                        info["needs_healing"] = True
                        info["healing_action"] = "restart"
                    elif info["health"] == "unhealthy":
                        info["needs_healing"] = True
                        info["healing_action"] = "health_check_restart"

                    containers_info.append(info)

                except Exception as e:
                    logger.error(f"Помилка при аналізі контейнера {container.name}: {e}")

        except Exception as e:
            logger.error(f"Помилка підключення до Docker: {e}")

        return containers_info

    async def heal_container(self, container_name: str, action: str) -> bool:
        """Виконує дії самовиправлення для контейнера"""
        try:
            container = self.client.containers.get(container_name)

            if action == "restart":
                logger.info(f"🔄 Перезапускаю контейнер {container_name}")
                container.restart()
                return True

            elif action == "health_check_restart":
                logger.info(f"🏥 Виконую health check restart для {container_name}")
                container.restart()
                return True

        except docker.errors.NotFound:
            logger.error(f"❌ Контейнер {container_name} не знайдено")
            return False
        except Exception as e:
            logger.error(f"❌ Помилка при лікуванні {container_name}: {e}")
            return False

        return False


class SimpleMonitor:
    """Простий монітор системи"""

    async def check_services(self) -> List[Dict[str, Any]]:
        """Перевіряє доступність сервісів через HTTP"""
        services = [
            {"name": "backend", "url": "http://localhost:8000/health", "port": 8000},
            {"name": "frontend", "url": "http://localhost:3001/health", "port": 3001},
            {"name": "grafana", "url": "http://localhost:3001/api/health", "port": 3001},
            {"name": "prometheus", "url": "http://localhost:9090/-/healthy", "port": 9090},
            {"name": "opensearch", "url": "http://localhost:9200/_cluster/health", "port": 9200},
        ]

        results = []

        async with aiohttp.ClientSession() as session:
            for service in services:
                try:
                    async with session.get(service["url"], timeout=5) as response:
                        status = {
                            "name": service["name"],
                            "url": service["url"],
                            "status": "healthy" if response.status < 400 else "unhealthy",
                            "status_code": response.status,
                            "response_time": 0,  # Спрощено
                            "needs_healing": response.status >= 400,
                        }
                        results.append(status)

                except asyncio.TimeoutError:
                    results.append(
                        {
                            "name": service["name"],
                            "url": service["url"],
                            "status": "timeout",
                            "status_code": 0,
                            "response_time": 5000,
                            "needs_healing": True,
                        }
                    )

                except Exception as e:
                    results.append(
                        {
                            "name": service["name"],
                            "url": service["url"],
                            "status": "error",
                            "error": str(e),
                            "needs_healing": True,
                        }
                    )

        return results


async def main():
    """Головна функція тестування"""
    logger.info("🚀 Запускаю тестування агентів самовиправлення")

    # Ініціалізація
    health_checker = SimpleHealthChecker()
    monitor = SimpleMonitor()

    logger.info("📋 Перевіряю стан контейнерів...")
    containers = await health_checker.check_containers()

    print(f"\n{'='*60}")
    print("🐳 СТАН КОНТЕЙНЕРІВ")
    print(f"{'='*60}")

    unhealthy_containers = []

    for container in containers:
        status_icon = (
            "✅" if container["status"] == "running" and not container["needs_healing"] else "❌"
        )
        health_icon = "🟢" if container["health"] in ["healthy", "no-health-check"] else "🔴"

        print(
            f"{status_icon} {health_icon} {container['name']:<30} | {container['status']:<10} | {container['health']}"
        )

        if container["needs_healing"]:
            unhealthy_containers.append(container)

    if unhealthy_containers:
        print(f"\n🚨 ЗНАЙДЕНО {len(unhealthy_containers)} КОНТЕЙНЕРІВ, ЩО ПОТРЕБУЮТЬ ЛІКУВАННЯ:")
        for container in unhealthy_containers:
            print(f"  - {container['name']}: {container.get('healing_action', 'unknown')}")

    logger.info("🌐 Перевіряю доступність сервісів...")
    services = await monitor.check_services()

    print(f"\n{'='*60}")
    print("🌐 СТАН СЕРВІСІВ")
    print(f"{'='*60}")

    unhealthy_services = []

    for service in services:
        status_icon = "✅" if service["status"] == "healthy" else "❌"
        status_code = service.get("status_code", "N/A")

        print(f"{status_icon} {service['name']:<20} | {service['status']:<10} | HTTP {status_code}")

        if service["needs_healing"]:
            unhealthy_services.append(service)

    # Демонстрація самовиправлення
    if unhealthy_containers:
        print(f"\n🏥 ДЕМОНСТРАЦІЯ САМОВИПРАВЛЕННЯ")
        print(f"{'='*60}")

        for container in unhealthy_containers[:2]:  # Обмежуємо до 2 контейнерів
            if container.get("healing_action"):
                logger.info(f"🔧 Спроба лікування: {container['name']}")
                success = await health_checker.heal_container(
                    container["name"], container["healing_action"]
                )

                if success:
                    print(f"✅ Успішно виліковано: {container['name']}")
                else:
                    print(f"❌ Не вдалося виліковати: {container['name']}")

    print(f"\n{'='*60}")
    print("📊 ПІДСУМОК")
    print(f"{'='*60}")
    print(f"Загальна кількість контейнерів: {len(containers)}")
    print(f"Потребують лікування: {len(unhealthy_containers)}")
    print(f"Загальна кількість сервісів: {len(services)}")
    print(f"Недоступні сервіси: {len(unhealthy_services)}")

    if not unhealthy_containers and not unhealthy_services:
        print("🎉 ВСІ СИСТЕМИ ПРАЦЮЮТЬ НОРМАЛЬНО!")
    else:
        print("⚠️  ВИЯВЛЕНІ ПРОБЛЕМИ, ЯКІ ПОТРЕБУЮТЬ УВАГИ")


if __name__ == "__main__":
    asyncio.run(main())
