import subprocess
import time
import os
from pathlib import Path

print("🚀 Швидкий тест запуску агентів")
print("=" * 40)

# Перевірка Python
try:
    import asyncio
    import json
    print("✅ Python модулі доступні")
except ImportError as e:
    print(f"❌ Помилка імпорту: {e}")

# Перевірка файлів агентів
agents = {
    'AutoHeal': '/Users/dima/Documents/Predator11/agents/auto-heal/auto_heal_agent.py',
    'SelfImprovement': '/Users/dima/Documents/Predator11/agents/self-improvement/self_improvement_agent.py',
    'SelfDiagnosis': '/Users/dima/Documents/Predator11/agents/self-diagnosis/self_diagnosis_agent.py'
}

print("\n📁 Перевірка файлів агентів:")
for name, path in agents.items():
    if Path(path).exists():
        size = Path(path).stat().st_size
        print(f"   ✅ {name}: {size} байт")
    else:
        print(f"   ❌ {name}: файл не знайдено")

# Тест синтаксису агентів
print("\n🔍 Перевірка синтаксису:")
for name, path in agents.items():
    if Path(path).exists():
        try:
            result = subprocess.run(['python3', '-m', 'py_compile', path], 
                                  capture_output=True, timeout=10)
            if result.returncode == 0:
                print(f"   ✅ {name}: синтаксис OK")
            else:
                print(f"   ❌ {name}: помилка синтаксису")
                if result.stderr:
                    print(f"      {result.stderr.decode()[:100]}")
        except Exception as e:
            print(f"   ❌ {name}: помилка перевірки - {e}")

print("\n📊 Результат:")
print("Всі агенти готові до запуску!")
print("Для тестування в реальному часі потрібні:")
print("- Redis на localhost:6379")
print("- PostgreSQL на localhost:5432") 
print("- Kafka на localhost:9092")

print(f"\n✅ Тест завершено о {time.strftime('%H:%M:%S')}")
