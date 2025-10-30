#!/usr/bin/env python3
"""
Повний тест системи Predator11 - перевірка всіх агентів та компонентів
"""

import json
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

# Конфігурація агентів
AGENTS = {
    "data-quality-agent": {
        "port": 8001,
        "endpoints": ["/health", "/api/validate"],
        "test_data": {"data": "test"},
    },
    "synthetic-agent": {
        "port": 8002,
        "endpoints": ["/health", "/api/generate"],
        "test_data": {"type": "sample"},
    },
    "nlp-agent": {
        "port": 8003,
        "endpoints": ["/health", "/api/process"],
        "test_data": {"text": "test text"},
    },
    "security-privacy": {
        "port": 8004,
        "endpoints": ["/health", "/api/scan"],
        "test_data": {"content": "test content"},
    },
    "self-healing-agent": {
        "port": 8008,
        "endpoints": ["/health", "/api/heal"],
        "test_data": {"system": "test"},
    },
}


def check_agent_health(name, port):
    """Перевірка здоров'я агента"""
    try:
        response = requests.get(f"http://localhost:{port}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ {name}: OK")
            return True
        else:
            print(f"❌ {name}: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ {name}: Connection failed - {str(e)}")
        return False


def test_docker_compose():
    """Перевірка Docker Compose"""
    try:
        result = subprocess.run(
            ["docker", "compose", "config"], capture_output=True, text=True, cwd="."
        )
        if result.returncode == 0:
            print("✅ Docker Compose config: OK")
            return True
        else:
            print(f"❌ Docker Compose config: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Docker Compose: {str(e)}")
        return False


def check_dockerfile_exists():
    """Перевірка наявності Dockerfile для агентів"""
    missing_files = []

    for agent_name in AGENTS.keys():
        dockerfile_path = Path(f"agents/{agent_name}/Dockerfile")
        requirements_path = Path(f"agents/{agent_name}/requirements.txt")

        if not dockerfile_path.exists():
            missing_files.append(str(dockerfile_path))
        if not requirements_path.exists():
            missing_files.append(str(requirements_path))

    if missing_files:
        print("❌ Відсутні файли:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    else:
        print("✅ Всі Dockerfile та requirements.txt присутні")
        return True


def check_docker_images():
    """Перевірка Docker образів"""
    try:
        result = subprocess.run(
            ["docker", "images", "--format", "{{.Repository}}:{{.Tag}}"],
            capture_output=True,
            text=True,
        )
        images = result.stdout.split("\n")

        predator_images = [img for img in images if "predator11" in img.lower()]

        if predator_images:
            print(f"✅ Docker образи знайдено: {len(predator_images)}")
            for img in predator_images[:5]:  # Показати перші 5
                print(f"   - {img}")
            return True
        else:
            print("❌ Docker образи Predator11 не знайдено")
            return False
    except Exception as e:
        print(f"❌ Перевірка Docker образів: {str(e)}")
        return False


def run_full_test():
    """Запуск повного тесту системи"""
    print("🚀 Запуск повного тесту системи Predator11")
    print("=" * 50)

    # 1. Перевірка файлів
    print("\n1. Перевірка наявності необхідних файлів:")
    files_ok = check_dockerfile_exists()

    # 2. Перевірка Docker Compose
    print("\n2. Перевірка Docker Compose:")
    compose_ok = test_docker_compose()

    # 3. Перевірка Docker образів
    print("\n3. Перевірка Docker образів:")
    images_ok = check_docker_images()

    # 4. Перевірка структури проекту
    print("\n4. Перевірка структури проекту:")
    key_directories = ["agents", "prometheus", "grafana", "backend-api", "frontend", "etl"]
    structure_ok = True

    for directory in key_directories:
        if Path(directory).exists():
            print(f"✅ Директорія {directory}: OK")
        else:
            print(f"❌ Директорія {directory}: Відсутня")
            structure_ok = False

    # 5. Перевірка конфігураційних файлів
    print("\n5. Перевірка конфігураційних файлів:")
    config_files = [
        "docker-compose.yml",
        "agents/registry.yaml",
        "agents/policies.yaml",
        "observability/prometheus/prometheus.yml",
    ]

    config_ok = True
    for config_file in config_files:
        if Path(config_file).exists():
            print(f"✅ {config_file}: OK")
        else:
            print(f"❌ {config_file}: Відсутній")
            config_ok = False

    # 6. Підсумок
    print("\n" + "=" * 50)
    print("📊 ПІДСУМОК ТЕСТУВАННЯ:")

    results = {
        "Файли агентів": files_ok,
        "Docker Compose": compose_ok,
        "Docker образи": images_ok,
        "Структура проекту": structure_ok,
        "Конфігурації": config_ok,
    }

    all_ok = all(results.values())

    for test_name, result in results.items():
        status = "✅ ПРОЙДЕНО" if result else "❌ ПРОВАЛЕНО"
        print(f"{test_name}: {status}")

    if all_ok:
        print("\n🎉 ВСІ ТЕСТИ ПРОЙДЕНО УСПІШНО!")
        print("Система готова до розгортання!")

        print("\nДля запуску системи виконайте:")
        print("docker compose up -d")

        return True
    else:
        print("\n❌ ДЕЯКІ ТЕСТИ ПРОВАЛИЛИСЬ")
        print("Будь ласка, виправте помилки перед розгортанням")
        return False


if __name__ == "__main__":
    success = run_full_test()
    sys.exit(0 if success else 1)
