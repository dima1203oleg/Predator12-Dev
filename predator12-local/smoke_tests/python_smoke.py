#!/usr/bin/env python3
"""
Smoke тести для Predator12 локального середовища
"""
import os
import sys
import requests
import psycopg2
from pathlib import Path
from typing import List, Tuple
import time

# Кольори для виводу
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

class SmokeTests:
    def __init__(self):
        self.tests_passed = 0
        self.tests_failed = 0
        self.tests_total = 0
        
        # Завантаження .env
        self.load_env()
        
    def load_env(self):
        """Завантаження змінних з .env"""
        env_path = Path(__file__).parent.parent / '.env'
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    if line.strip() and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
    
    def print_header(self, text: str):
        """Друк заголовку секції"""
        print(f"\n{Colors.BLUE}{'='*50}")
        print(f"{text}")
        print(f"{'='*50}{Colors.END}\n")
    
    def run_test(self, name: str, test_func) -> bool:
        """Запуск одного тесту"""
        self.tests_total += 1
        print(f"  🔍 {name}... ", end='', flush=True)
        
        try:
            test_func()
            print(f"{Colors.GREEN}✅ PASS{Colors.END}")
            self.tests_passed += 1
            return True
        except Exception as e:
            print(f"{Colors.RED}❌ FAIL{Colors.END}")
            print(f"     Помилка: {str(e)}")
            self.tests_failed += 1
            return False
    
    def test_database_connection(self):
        """Тест підключення до PostgreSQL"""
        db_url = os.getenv('DATABASE_URL', 'postgresql://predator_user:changeme@127.0.0.1:5432/predator')
        conn = psycopg2.connect(db_url)
        conn.close()
    
    def test_database_tables(self):
        """Тест структури БД"""
        db_url = os.getenv('DATABASE_URL', 'postgresql://predator_user:changeme@127.0.0.1:5432/predator')
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
        count = cur.fetchone()[0]
        conn.close()
        if count < 1:
            raise Exception(f"Недостатньо таблиць в БД: {count}")
    
    def test_backend_health(self):
        """Тест health endpoint backend"""
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code != 200:
            raise Exception(f"Status code: {response.status_code}")
    
    def test_backend_docs(self):
        """Тест API документації"""
        response = requests.get('http://localhost:8000/docs', timeout=5)
        if response.status_code != 200:
            raise Exception(f"Status code: {response.status_code}")
    
    def test_frontend_available(self):
        """Тест доступності frontend"""
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code != 200:
            raise Exception(f"Status code: {response.status_code}")
    
    def test_local_storage(self):
        """Тест локального сховища"""
        storage_path = Path(__file__).parent.parent / 'local_storage'
        if not storage_path.exists():
            raise Exception("Папка local_storage не існує")
        
        # Спроба створити тестовий файл
        test_file = storage_path / 'test_file.txt'
        test_file.write_text('test')
        if not test_file.exists():
            raise Exception("Не вдалося створити тестовий файл")
        test_file.unlink()
    
    def test_venv_exists(self):
        """Тест віртуального середовища"""
        venv_path = Path(__file__).parent.parent / '.venv'
        if not venv_path.exists():
            raise Exception("Віртуальне середовище не знайдено")
        
        activate_script = venv_path / 'bin' / 'activate'
        if not activate_script.exists():
            raise Exception("Скрипт активації не знайдено")
    
    def test_env_file(self):
        """Тест наявності .env файлу"""
        env_path = Path(__file__).parent.parent / '.env'
        if not env_path.exists():
            raise Exception(".env файл не знайдено")
    
    def test_logs_directory(self):
        """Тест папки логів"""
        logs_path = Path(__file__).parent.parent / 'logs'
        if not logs_path.exists():
            logs_path.mkdir(parents=True)
        
        # Перевірка прав запису
        test_log = logs_path / 'test.log'
        test_log.write_text('test')
        test_log.unlink()
    
    def print_summary(self):
        """Друк підсумків"""
        self.print_header("📊 Результати smoke тестів")
        
        print(f"  📈 Всього тестів: {self.tests_total}")
        print(f"  {Colors.GREEN}✅ Пройдено: {self.tests_passed}{Colors.END}")
        print(f"  {Colors.RED}❌ Провалено: {self.tests_failed}{Colors.END}")
        
        if self.tests_total > 0:
            success_rate = (self.tests_passed / self.tests_total) * 100
            print(f"  📊 Успішність: {success_rate:.1f}%")
            
            if success_rate >= 90:
                print(f"\n{Colors.GREEN}🎉 Система готова до роботи!{Colors.END}")
                return 0
            elif success_rate >= 70:
                print(f"\n{Colors.YELLOW}⚠️ Система частково готова, є помилки{Colors.END}")
                return 1
            else:
                print(f"\n{Colors.RED}❌ Система не готова, багато помилок{Colors.END}")
                return 2
        else:
            print(f"\n{Colors.RED}❌ Не вдалося запустити тести{Colors.END}")
            return 3
    
    def run_all(self) -> int:
        """Запуск всіх тестів"""
        print(f"{Colors.BLUE}🧪 Запуск smoke тестів для Predator12...{Colors.END}")
        
        # База даних
        self.print_header("📊 Тестування бази даних")
        self.run_test("PostgreSQL підключення", self.test_database_connection)
        self.run_test("Структура БД", self.test_database_tables)
        
        # Backend
        self.print_header("🚀 Тестування backend")
        self.run_test("Backend health endpoint", self.test_backend_health)
        self.run_test("Backend API docs", self.test_backend_docs)
        
        # Frontend
        self.print_header("🌐 Тестування frontend")
        self.run_test("Frontend доступність", self.test_frontend_available)
        
        # Файлове сховище
        self.print_header("📁 Тестування файлового сховища")
        self.run_test("Локальна папка storage", self.test_local_storage)
        
        # Python середовище
        self.print_header("🐍 Тестування Python середовища")
        self.run_test("Virtual environment", self.test_venv_exists)
        
        # Конфігурація
        self.print_header("⚙️ Тестування конфігурації")
        self.run_test("Файл .env існує", self.test_env_file)
        self.run_test("Папка логів", self.test_logs_directory)
        
        return self.print_summary()

def main():
    """Головна функція"""
    tests = SmokeTests()
    exit_code = tests.run_all()
    
    if exit_code != 0:
        print(f"\n{Colors.YELLOW}🔍 Для діагностики помилок:{Colors.END}")
        print("  - Backend логи: tail -f logs/predator.log")
        print("  - Frontend логи: cd frontend && npm run dev")
        print("  - Перевірка процесів: ps aux | grep -E '(uvicorn|node)'")
    
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
