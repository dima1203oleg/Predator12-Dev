#!/usr/bin/env python3
from pathlib import Path

print("🔍 ШВИДКА ДІАГНОСТИКА ВЕБ-ІНТЕРФЕЙСУ")
print("=" * 40)

# Перевірка структури проекту
project_root = Path("/Users/dima/Documents/Predator11")
frontend_dir = project_root / "frontend"

print(f"📁 Перевірка структури проекту...")
print(f"   Корінь: {project_root.exists()}")
print(f"   Frontend: {frontend_dir.exists()}")

# Ключові файли frontend'у
key_files = ["package.json", "vite.config.ts", "index.html", "src/main.tsx", "src/App.tsx"]

print("\n📄 Ключові файли frontend'у:")
for file in key_files:
    file_path = frontend_dir / file
    if file_path.exists():
        size = file_path.stat().st_size
        print(f"   ✅ {file} ({size} байт)")
    else:
        print(f"   ❌ {file} - відсутній")

# Перевірка node_modules
node_modules = frontend_dir / "node_modules"
if node_modules.exists():
    try:
        modules_count = len(list(node_modules.iterdir()))
        print(f"   ✅ node_modules ({modules_count} модулів)")
    except:
        print("   ✅ node_modules (існує)")
else:
    print("   ❌ node_modules - відсутні")

# Перевірка Docker файлів
print("\n🐳 Docker конфігурація:")
docker_files = [
    project_root / "docker-compose.yml",
    frontend_dir / "Dockerfile",
    frontend_dir / "nginx.conf",
]

for file in docker_files:
    if file.exists():
        print(f"   ✅ {file.name}")
    else:
        print(f"   ❌ {file.name}")

# Перевірка .env файлів
print("\n⚙️  Змінні оточення:")
env_files = [project_root / ".env", project_root / ".env.example"]

for file in env_files:
    if file.exists():
        print(f"   ✅ {file.name}")
    else:
        print(f"   ❌ {file.name}")

# Основні можливі проблеми
print("\n🔧 МОЖЛИВІ ПРОБЛЕМИ:")

problems = []

if not (frontend_dir / "node_modules").exists():
    problems.append("Відсутні node_modules - потрібно: cd frontend && npm install")

if not (project_root / ".env").exists():
    problems.append("Відсутній .env файл - потрібно: cp .env.example .env")

# Спроба перевірити порти (простий спосіб)
try:
    import socket

    def check_port(port, name):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(("localhost", port))
        sock.close()
        return result == 0

    print("\n📡 Перевірка портів:")

    ports = {3000: "Frontend", 8000: "Backend", 5432: "PostgreSQL", 6379: "Redis"}

    for port, name in ports.items():
        if check_port(port, name):
            print(f"   ✅ Порт {port} ({name}): ЗАЙНЯТИЙ")
        else:
            print(f"   ❌ Порт {port} ({name}): ВІЛЬНИЙ")
            if port == 3000:
                problems.append("Frontend не запущено")
            elif port == 8000:
                problems.append("Backend не запущено")

except ImportError:
    print("   ⚠️  Неможливо перевірити порти")

if problems:
    print(f"\n❌ ЗНАЙДЕНО {len(problems)} ПРОБЛЕМ:")
    for i, problem in enumerate(problems, 1):
        print(f"   {i}. {problem}")
else:
    print("\n✅ ОСНОВНІ КОМПОНЕНТИ НА МІСЦІ")

print("\n💡 КОМАНДИ ДЛЯ ЗАПУСКУ:")
print("=" * 30)

print("# 1. Підготовка (якщо потрібно):")
print("cd /Users/dima/Documents/Predator11")
print("cp .env.example .env")
print("cd frontend")
print("npm install")
print()
print("# 2. Запуск через Docker:")
print("cd /Users/dima/Documents/Predator11")
print("docker compose up -d")
print()
print("# 3. АБО запуск frontend окремо:")
print("cd frontend")
print("npm run dev")
print()
print("🌐 Після запуску: http://localhost:3000")

print(f"\n✅ Діагностика завершена!")
