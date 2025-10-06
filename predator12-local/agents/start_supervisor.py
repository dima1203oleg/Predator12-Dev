#!/usr/bin/env python3
"""
Startup script for Agent Supervisor with correct path handling
"""
import os
import sys

# Додаємо шлях до агентів в PYTHONPATH
agents_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, agents_dir)

# Змінюємо робочу директорію на папку агентів
os.chdir(agents_dir)

from supervisor import Supervisor

def main():
    # Абсолютний шлях до agents.yaml
    config_path = os.path.join(agents_dir, 'agents.yaml')

    print(f"Starting Supervisor with config: {config_path}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Config file exists: {os.path.exists(config_path)}")

    sv = Supervisor(config_path=config_path, dry_run=False)
    sv.load_config()
    sv.status()

    # Запуск основного циклу з маршрутизацією/арбітром/конкурсом моделей
    print("Starting main orchestration loop with model competitions and arbiter...")
    sv.run_loop()

if __name__ == "__main__":
    main()
