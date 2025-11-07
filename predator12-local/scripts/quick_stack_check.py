#!/usr/bin/env python3
"""
Спрощена діагностика стану Predator11 stack
"""

import socket
import subprocess
from datetime import datetime
from pathlib import Path


def check_port(port, service_name):
    """Перевірка доступності порту"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(("localhost", port))
        sock.close()
        if result == 0:
            return f"✅ {service_name} ({port}): Доступний"
        else:
            return f"❌ {service_name} ({port}): Недоступний"
    except Exception as e:
        return f"⚠️ {service_name} ({port}): Помилка - {e}"


def check_docker_compose_status():
    """Перевірка статусу docker-compose"""
    try:
        result = subprocess.run(
            ["docker-compose", "ps", "--format", "table"],
            cwd="/Users/dima/Documents/Predator11",
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            return f"❌ Docker Compose недоступний: {result.stderr}"

        lines = result.stdout.strip().split("\n")
        if len(lines) <= 1:
            return "⚠️ Жодного контейнера не запущено"

        # Аналіз статусів контейнерів
        running = 0
        stopped = 0
        unhealthy = 0

        for line in lines[1:]:  # Пропускаємо заголовок
            if "Up" in line:
                if "unhealthy" in line:
                    unhealthy += 1
                else:
                    running += 1
            elif "Exit" in line:
                stopped += 1

        status_parts = []
        if running > 0:
            status_parts.append(f"🟢 {running} працює")
        if unhealthy > 0:
            status_parts.append(f"🟡 {unhealthy} нездорові")  # Orange status!
        if stopped > 0:
            status_parts.append(f"🔴 {stopped} зупинено")

        return f"Docker Compose: {', '.join(status_parts)}"

    except subprocess.TimeoutExpired:
        return "❌ Docker Compose: Таймаут"
    except FileNotFoundError:
        return "❌ Docker Compose не встановлено"
    except Exception as e:
        return f"❌ Docker Compose помилка: {e}"


def check_critical_files():
    """Перевірка критичних файлів"""
    project_root = Path("/Users/dima/Documents/Predator11")
    critical_files = ["docker-compose.yml", ".env", "backend/Dockerfile", "frontend/package.json"]

    results = []
    for file_path in critical_files:
        full_path = project_root / file_path
        if full_path.exists():
            results.append(f"✅ {file_path}: Існує")
        else:
            results.append(f"❌ {file_path}: Відсутній")

    return results


def main():
    print("🚀 PREDATOR11 STACK - ШВИДКА ДІАГНОСТИКА")
    print("=" * 60)
    print(f"Час: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Перевірка критичних файлів
    print("📋 Критичні файли:")
    for result in check_critical_files():
        print(f"   {result}")

    print()

    # Перевірка Docker Compose
    print("🐳 Docker Compose статус:")
    compose_status = check_docker_compose_status()
    print(f"   {compose_status}")

    print()

    # Перевірка портів сервісів
    print("🌐 Перевірка портів:")
    services = [
        (3000, "Frontend React"),
        (8000, "Backend API"),
        (5432, "PostgreSQL"),
        (6379, "Redis"),
        (9200, "OpenSearch"),
        (5601, "OpenSearch Dashboards"),
        (9090, "Prometheus"),
        (3001, "Grafana"),
        (3100, "Loki"),
        (8080, "Keycloak"),
    ]

    available = 0
    total = len(services)

    for port, name in services:
        result = check_port(port, name)
        print(f"   {result}")
        if "Доступний" in result:
            available += 1

    print()
    print(f"📊 Підсумок: {available}/{total} сервісів доступні")

    # Аналіз проблем
    print()
    print("🔍 МОЖЛИВІ ПРИЧИНИ ОРАНЖЕВОГО (WARNING) СТАТУСУ:")
    print("   1. 🕐 Контейнери ще запускаються (starting)")
    print("   2. 🏥 Health check не проходить (unhealthy)")
    print("   3. 🐌 Повільний запуск через ресурси")
    print("   4. 🔧 Неправильна конфігурація health check")
    print()
    print("💡 РЕКОМЕНДАЦІЇ:")
    print("   • Зачекайте 2-3 хвилини для повного запуску")
    print("   • Перевірте логи: docker-compose logs [service_name]")
    print("   • Перезапустіть проблемні сервіси: docker-compose restart [service_name]")
    print("   • Перевірте .env змінні")

    print()
    print("🚀 Для детальної діагностики запустіть:")
    print("   docker-compose logs --tail=50")
    print("   docker-compose ps")


if __name__ == "__main__":
    main()
