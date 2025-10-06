#!/usr/bin/env python3

"""
PREDATOR12 - Комплексний Health Check
Перевірка всіх залежностей та готовності до роботи
"""

import sys
import subprocess
from pathlib import Path

# Кольори для виводу
class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

def info(msg): print(f"{Colors.BLUE}ℹ️  {msg}{Colors.NC}")
def success(msg): print(f"{Colors.GREEN}✅ {msg}{Colors.NC}")
def warning(msg): print(f"{Colors.YELLOW}⚠️  {msg}{Colors.NC}")
def error(msg): print(f"{Colors.RED}❌ {msg}{Colors.NC}")

def check_python_version():
    """Перевірка версії Python"""
    info("Перевіряю версію Python...")
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    
    if version.major == 3 and version.minor >= 11:
        success(f"Python {version_str} ✓")
        return True
    else:
        warning(f"Python {version_str} (рекомендовано 3.11+)")
        return False

def check_package(package_name, import_name=None):
    """Перевірка встановлення пакету"""
    if import_name is None:
        import_name = package_name
    
    try:
        __import__(import_name)
        success(f"{package_name}")
        return True
    except ImportError as e:
        error(f"{package_name}: {e}")
        return False

def check_critical_packages():
    """Перевірка критичних пакетів"""
    info("\n=== Критичні пакети ===")
    
    packages = [
        ("fastapi", "fastapi"),
        ("uvicorn", "uvicorn"),
        ("sqlalchemy", "sqlalchemy"),
        ("alembic", "alembic"),
        ("pydantic", "pydantic"),
        ("pydantic-settings", "pydantic_settings"),
        ("psycopg", "psycopg"),
        ("redis", "redis"),
        ("celery", "celery"),
    ]
    
    results = []
    for display_name, import_name in packages:
        results.append(check_package(display_name, import_name))
    
    return all(results)

def check_ai_packages():
    """Перевірка AI/ML пакетів"""
    info("\n=== AI/ML пакети ===")
    
    packages = [
        ("openai", "openai"),
        ("anthropic", "anthropic"),
        ("langchain", "langchain"),
        ("numpy", "numpy"),
        ("pandas", "pandas"),
        ("faiss-cpu", "faiss"),
    ]
    
    results = []
    for display_name, import_name in packages:
        results.append(check_package(display_name, import_name))
    
    return all(results)

def check_data_packages():
    """Перевірка пакетів для обробки даних"""
    info("\n=== Пакети для обробки даних ===")
    
    packages = [
        ("httpx", "httpx"),
        ("opensearch-py", "opensearchpy"),
        ("qdrant-client", "qdrant_client"),
        ("minio", "minio"),
        ("openpyxl", "openpyxl"),
        ("pdfplumber", "pdfplumber"),
        ("telethon", "telethon"),
    ]
    
    results = []
    for display_name, import_name in packages:
        results.append(check_package(display_name, import_name))
    
    return all(results)

def check_observability():
    """Перевірка пакетів моніторингу"""
    info("\n=== Observability ===")
    
    packages = [
        ("structlog", "structlog"),
        ("opentelemetry-sdk", "opentelemetry.sdk"),
        ("prometheus-client", "prometheus_client"),
        ("sentry-sdk", "sentry_sdk"),
    ]
    
    results = []
    for display_name, import_name in packages:
        results.append(check_package(display_name, import_name))
    
    return all(results)

def check_version_compatibility():
    """Перевірка сумісності версій"""
    info("\n=== Сумісність версій ===")
    
    try:
        import sqlalchemy
        version = sqlalchemy.__version__
        if version.startswith("2."):
            success(f"SQLAlchemy {version} (2.0+ ✓)")
        else:
            warning(f"SQLAlchemy {version} (рекомендовано 2.0+)")
        
        import pydantic
        version = pydantic.__version__
        if version.startswith("2."):
            success(f"Pydantic {version} (v2 ✓)")
        else:
            warning(f"Pydantic {version} (рекомендовано v2)")
        
        import psycopg
        version = psycopg.__version__
        if version.startswith("3."):
            success(f"psycopg {version} (psycopg3 ✓)")
        else:
            warning(f"psycopg {version}")
            
        return True
    except Exception as e:
        error(f"Помилка перевірки версій: {e}")
        return False

def check_services():
    """Перевірка доступності сервісів"""
    info("\n=== Зовнішні сервіси ===")
    
    services = [
        ("PostgreSQL", "localhost", 5432),
        ("Redis", "localhost", 6379),
        ("OpenSearch", "localhost", 9200),
    ]
    
    for name, host, port in services:
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                success(f"{name} ({host}:{port}) доступний")
            else:
                warning(f"{name} ({host}:{port}) недоступний")
        except Exception as e:
            warning(f"{name}: {e}")

def check_project_structure():
    """Перевірка структури проекту"""
    info("\n=== Структура проекту ===")
    
    critical_paths = [
        "backend/app",
        "backend/requirements-311-modern.txt",
        "backend/alembic",
        "scripts",
        "Makefile",
    ]
    
    all_exist = True
    for path in critical_paths:
        full_path = Path(path)
        if full_path.exists():
            success(f"{path}")
        else:
            error(f"{path} не знайдено")
            all_exist = False
    
    return all_exist

def main():
    """Головна функція"""
    print(f"""
{Colors.BLUE}╔══════════════════════════════════════════════════════════════╗
║          PREDATOR12 - Health Check                           ║
╚══════════════════════════════════════════════════════════════╝{Colors.NC}
""")
    
    results = []
    
    # Перевірки
    results.append(("Python Version", check_python_version()))
    results.append(("Critical Packages", check_critical_packages()))
    results.append(("AI/ML Packages", check_ai_packages()))
    results.append(("Data Packages", check_data_packages()))
    results.append(("Observability", check_observability()))
    results.append(("Version Compatibility", check_version_compatibility()))
    results.append(("Project Structure", check_project_structure()))
    
    # Сервіси (не критично)
    check_services()
    
    # Підсумок
    print(f"\n{Colors.BLUE}{'='*64}{Colors.NC}")
    print(f"{Colors.BLUE}ПІДСУМОК{Colors.NC}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{Colors.GREEN}✅ PASS{Colors.NC}" if result else f"{Colors.RED}❌ FAIL{Colors.NC}"
        print(f"  {name:<30} {status}")
    
    print(f"\n{Colors.BLUE}{'='*64}{Colors.NC}")
    
    if passed == total:
        print(f"{Colors.GREEN}✅ Всі перевірки пройдено! Система готова до роботи.{Colors.NC}\n")
        return 0
    else:
        print(f"{Colors.YELLOW}⚠️  Пройдено {passed}/{total} перевірок.{Colors.NC}")
        print(f"{Colors.YELLOW}   Встановіть відсутні пакети: pip install -r backend/requirements-311-modern.txt{Colors.NC}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
