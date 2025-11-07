#!/usr/bin/env python3
"""
🔍 LIVE MONITORING SYSTEM
Real-time моніторинг всіх процесів Predator Analytics
"""

import asyncio
from datetime import datetime
from typing import Dict

import requests


class LiveMonitoringSystem:
    """Система моніторингу в реальному часі"""

    def __init__(self):
        self.active_alerts = []
        self.system_metrics = {}
        self.business_events = []

    async def monitor_agents_performance(self):
        """Моніторинг продуктивності агентів"""
        print("🔍 Моніторинг агентів...")

        while True:
            try:
                # Симуляція перевірки агентів
                agents_status = await self.check_agents_health()

                for agent, status in agents_status.items():
                    if status["health"] < 80:
                        await self.create_alert(
                            f"⚠️ Агент {agent} має низьку продуктивність: {status['health']}%",
                            "warning",
                        )
                    elif status["improvements"] > 0:
                        await self.log_success(
                            f"🎯 Агент {agent} зробив {status['improvements']} покращень"
                        )

                await asyncio.sleep(30)  # Перевірка кожні 30 секунд

            except Exception as e:
                await self.create_alert(f"❌ Помилка моніторингу агентів: {e}", "error")
                await asyncio.sleep(60)

    async def monitor_business_events(self):
        """Моніторинг бізнес-подій"""
        print("💼 Моніторинг бізнес-подій...")

        business_scenarios = [
            {
                "type": "suspicious_transaction",
                "description": "Підозріла транзакція $2.5M з офшору",
                "risk_level": "high",
                "confidence": 94.2,
            },
            {
                "type": "procurement_anomaly",
                "description": "Держзакупівля з завищеною ціною на 340%",
                "risk_level": "critical",
                "confidence": 87.5,
            },
            {
                "type": "market_manipulation",
                "description": "Детектовано можливу маніпуляцію акціями TECH",
                "risk_level": "medium",
                "confidence": 78.3,
            },
        ]

        while True:
            # Симуляція детекції бізнес-подій
            import random

            if random.random() < 0.3:  # 30% шансу
                event = random.choice(business_scenarios)
                await self.handle_business_event(event)

            await asyncio.sleep(45)  # Перевірка кожні 45 секунд

    async def monitor_system_resources(self):
        """Моніторинг системних ресурсів"""
        print("🖥️ Моніторинг системних ресурсів...")

        while True:
            try:
                # Перевірка Docker контейнерів
                containers_status = await self.check_containers()

                # Перевірка доступності сервісів
                services_status = await self.check_services()

                # Агрегація метрик
                system_health = self.calculate_system_health(containers_status, services_status)

                if system_health < 85:
                    await self.create_alert(
                        f"⚠️ Здоров'я системи знизилось до {system_health}%", "warning"
                    )

                await asyncio.sleep(60)  # Перевірка кожну хвилину

            except Exception as e:
                await self.create_alert(f"❌ Помилка моніторингу системи: {e}", "error")
                await asyncio.sleep(120)

    async def check_agents_health(self) -> Dict:
        """Перевірка здоров'я агентів"""
        # Симуляція статусу агентів
        import random

        agents = [
            "SelfImprovement",
            "AutoHeal",
            "PerformanceOptimizer",
            "SelfDiagnosis",
            "DataQuality",
            "BillingGate",
        ]

        status = {}
        for agent in agents:
            status[agent] = {
                "health": random.randint(75, 100),
                "improvements": random.randint(0, 3),
                "efficiency": random.uniform(0.85, 0.99),
            }

        return status

    async def check_containers(self) -> Dict:
        """Перевірка статусу контейнерів"""
        # В реальності тут буде виклик до Docker API
        return {"running": 23, "total": 25, "healthy": 21, "unhealthy": 2}

    async def check_services(self) -> Dict:
        """Перевірка доступності сервісів"""
        services = {
            "frontend": "http://localhost:3001",
            "backend": "http://localhost:8000/health",
            "prometheus": "http://localhost:9090/-/healthy",
        }

        status = {}
        for service, url in services.items():
            try:
                response = requests.get(url, timeout=5)
                status[service] = {
                    "available": response.status_code == 200,
                    "response_time": response.elapsed.total_seconds(),
                }
            except:
                status[service] = {"available": False, "response_time": None}

        return status

    def calculate_system_health(self, containers: Dict, services: Dict) -> float:
        """Розрахунок загального здоров'я системи"""
        container_health = (containers["healthy"] / containers["total"]) * 100

        available_services = sum(1 for s in services.values() if s["available"])
        service_health = (available_services / len(services)) * 100

        return (container_health + service_health) / 2

    async def handle_business_event(self, event: Dict):
        """Обробка бізнес-події"""
        timestamp = datetime.now().strftime("%H:%M:%S")

        risk_emoji = {"low": "🟢", "medium": "🟡", "high": "🟠", "critical": "🔴"}

        emoji = risk_emoji.get(event["risk_level"], "⚪")

        print(f"\n{emoji} БІЗНЕС-ПОДІЯ [{timestamp}]")
        print(f"   📋 Тип: {event['type']}")
        print(f"   📄 Опис: {event['description']}")
        print(f"   ⚠️ Рівень ризику: {event['risk_level'].upper()}")
        print(f"   🎯 Впевненість: {event['confidence']:.1f}%")

        # Додаємо до історії
        self.business_events.append({**event, "timestamp": timestamp, "processed": True})

        # Створюємо алерт для критичних подій
        if event["risk_level"] in ["high", "critical"]:
            await self.create_alert(
                f"{emoji} {event['description']} (впевненість: {event['confidence']:.1f}%)",
                event["risk_level"],
            )

    async def create_alert(self, message: str, level: str):
        """Створення алерту"""
        timestamp = datetime.now().strftime("%H:%M:%S")

        alert = {
            "message": message,
            "level": level,
            "timestamp": timestamp,
            "id": len(self.active_alerts) + 1,
        }

        self.active_alerts.append(alert)

        level_emoji = {"info": "ℹ️", "warning": "⚠️", "error": "❌", "critical": "🔴"}

        emoji = level_emoji.get(level, "ℹ️")
        print(f"\n{emoji} АЛЕРТ [{timestamp}]: {message}")

    async def log_success(self, message: str):
        """Логування успішних операцій"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"✅ [{timestamp}] {message}")

    def show_dashboard(self):
        """Відображення поточного стану"""
        print("\n" + "=" * 80)
        print("📊 LIVE DASHBOARD - PREDATOR ANALYTICS NEXUS")
        print("=" * 80)

        # Активні алерти
        if self.active_alerts:
            print(f"\n🚨 АКТИВНІ АЛЕРТИ ({len(self.active_alerts)}):")
            for alert in self.active_alerts[-5:]:  # Останні 5
                print(f"   [{alert['timestamp']}] {alert['level'].upper()}: {alert['message']}")

        # Останні бізнес-події
        if self.business_events:
            print(f"\n💼 ОСТАННІ БІЗНЕС-ПОДІЇ ({len(self.business_events)}):")
            for event in self.business_events[-3:]:  # Останні 3
                print(f"   [{event['timestamp']}] {event['type']}: {event['confidence']:.1f}%")

        print("\n" + "=" * 80)

    async def run_monitoring(self, duration_minutes: int = 10):
        """Запуск системи моніторингу"""
        print("🚀 ЗАПУСК СИСТЕМИ LIVE МОНІТОРИНГУ")
        print(f"⏰ Тривалість: {duration_minutes} хвилин")
        print("🎯 Моніторинг: Агенти + Бізнес-події + Система")
        print("=" * 80)

        # Запуск всіх моніторів паралельно
        tasks = [
            self.monitor_agents_performance(),
            self.monitor_business_events(),
            self.monitor_system_resources(),
        ]

        try:
            # Запуск на вказану тривалість
            await asyncio.wait_for(asyncio.gather(*tasks), timeout=duration_minutes * 60)
        except asyncio.TimeoutError:
            print(f"\n⏰ Моніторинг завершено після {duration_minutes} хвилин")
        except KeyboardInterrupt:
            print("\n⏹️ Моніторинг зупинено користувачем")

        # Фінальний dashboard
        self.show_dashboard()


async def main():
    """Головна функція"""
    monitor = LiveMonitoringSystem()

    print("🔍 PREDATOR ANALYTICS - LIVE MONITORING SYSTEM")
    print("Система моніторингу в реальному часі")
    print("=" * 80)

    try:
        await monitor.run_monitoring(5)  # 5 хвилин моніторингу
    except Exception as e:
        print(f"💥 Помилка: {e}")


if __name__ == "__main__":
    asyncio.run(main())
