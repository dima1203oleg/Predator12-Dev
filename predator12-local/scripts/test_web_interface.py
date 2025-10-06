#!/usr/bin/env python3
"""
Швидкий тест веб-інтерфейсу Predator11
"""

import subprocess
import time
import os
import sys
from pathlib import Path
import signal

class WebInterfaceTest:
    def __init__(self):
        self.project_root = Path("/Users/dima/Documents/Predator11")
        self.frontend_dir = self.project_root / "frontend"
        self.processes = {}
        
    def check_nodejs(self):
        """Перевірка Node.js"""
        print("🔍 Перевірка Node.js...")
        
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"   ✅ Node.js: {result.stdout.strip()}")
                return True
            else:
                print("   ❌ Node.js не знайдено")
                return False
        except FileNotFoundError:
            print("   ❌ Node.js не встановлено")
            return False
    
    def check_npm(self):
        """Перевірка npm"""
        print("🔍 Перевірка npm...")
        
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"   ✅ npm: {result.stdout.strip()}")
                return True
            else:
                print("   ❌ npm не знайдено")
                return False
        except FileNotFoundError:
            print("   ❌ npm не встановлено")
            return False
    
    def check_dependencies(self):
        """Перевірка залежностей"""
        print("📦 Перевірка залежностей...")
        
        node_modules = self.frontend_dir / "node_modules"
        package_lock = self.frontend_dir / "package-lock.json"
        
        if node_modules.exists():
            print("   ✅ node_modules існує")
        else:
            print("   ❌ node_modules відсутні")
            return False
        
        if package_lock.exists():
            print("   ✅ package-lock.json існує")
        else:
            print("   ⚠️  package-lock.json відсутній")
        
        return True
    
    def install_dependencies(self):
        """Встановлення залежностей"""
        print("📦 Встановлення залежностей...")
        
        try:
            os.chdir(self.frontend_dir)
            result = subprocess.run(['npm', 'install'], 
                                  capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                print("   ✅ Залежності встановлено")
                return True
            else:
                print("   ❌ Помилка встановлення:")
                print(f"      {result.stderr[:200]}")
                return False
                
        except subprocess.TimeoutExpired:
            print("   ❌ Таймаут встановлення (5 хвилин)")
            return False
        except Exception as e:
            print(f"   ❌ Помилка: {e}")
            return False
    
    def check_typescript(self):
        """Перевірка TypeScript"""
        print("🔧 Перевірка TypeScript...")
        
        try:
            os.chdir(self.frontend_dir)
            result = subprocess.run(['npm', 'run', 'typecheck'], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                print("   ✅ TypeScript: OK")
                return True
            else:
                print("   ❌ TypeScript помилки:")
                # Показати перші кілька помилок
                errors = result.stderr.split('\n')[:5]
                for error in errors:
                    if error.strip():
                        print(f"      {error}")
                return False
                
        except subprocess.TimeoutExpired:
            print("   ⚠️  TypeScript перевірка зайняла забагато часу")
            return False
        except Exception as e:
            print(f"   ❌ Помилка TypeScript: {e}")
            return False
    
    def start_frontend_dev(self):
        """Запуск frontend в режимі розробки"""
        print("🚀 Запуск frontend в режимі розробки...")
        
        try:
            os.chdir(self.frontend_dir)
            
            # Запуск у фоновому режимі
            process = subprocess.Popen(['npm', 'run', 'dev'], 
                                     stdout=subprocess.PIPE, 
                                     stderr=subprocess.PIPE)
            
            self.processes['frontend'] = process
            print(f"   ✅ Frontend запущено (PID: {process.pid})")
            
            # Дати час на запуск
            time.sleep(5)
            
            # Перевірити чи процес ще працює
            if process.poll() is None:
                print("   ✅ Frontend працює")
                return True
            else:
                print("   ❌ Frontend зупинився")
                stdout, stderr = process.communicate()
                if stderr:
                    print(f"      Помилка: {stderr.decode()[:200]}")
                return False
                
        except Exception as e:
            print(f"   ❌ Помилка запуску: {e}")
            return False
    
    def check_frontend_running(self):
        """Перевірка чи працює frontend"""
        print("🌐 Перевірка веб-сервера...")
        
        import urllib.request
        import urllib.error
        
        try:
            # Спробувати підключитися до localhost:3000
            response = urllib.request.urlopen('http://localhost:3000', timeout=5)
            print(f"   ✅ Frontend доступний (статус: {response.getcode()})")
            return True
            
        except urllib.error.URLError as e:
            print(f"   ❌ Frontend недоступний: {e}")
            return False
        except Exception as e:
            print(f"   ❌ Помилка перевірки: {e}")
            return False
    
    def check_ports(self):
        """Перевірка зайнятих портів"""
        print("📡 Перевірка портів...")
        
        ports = [3000, 8000, 5432, 6379]
        
        for port in ports:
            try:
                import socket
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result == 0:
                    print(f"   ✅ Порт {port}: ЗАЙНЯТИЙ")
                else:
                    print(f"   ❌ Порт {port}: ВІЛЬНИЙ")
                    
            except Exception as e:
                print(f"   ❌ Порт {port}: Помилка перевірки")
    
    def cleanup(self):
        """Зупинка процесів"""
        print("\n🛑 Зупинка процесів...")
        
        for name, process in self.processes.items():
            if process.poll() is None:
                print(f"   Зупиняю {name}...")
                process.terminate()
                
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    print(f"   Примусове завершення {name}...")
                    process.kill()
    
    def run_full_test(self):
        """Повний тест веб-інтерфейсу"""
        print("🔍 ТЕСТ ВЕБ-ІНТЕРФЕЙСУ PREDATOR11")
        print("=" * 50)
        
        try:
            # 1. Перевірка системних залежностей
            if not self.check_nodejs() or not self.check_npm():
                print("\n❌ Системні залежності не готові")
                return False
            
            # 2. Перевірка портів
            self.check_ports()
            
            # 3. Перевірка залежностей проекту
            if not self.check_dependencies():
                print("\n📦 Встановлення залежностей...")
                if not self.install_dependencies():
                    print("\n❌ Не вдалося встановити залежності")
                    return False
            
            # 4. Перевірка TypeScript
            self.check_typescript()
            
            # 5. Запуск frontend
            if self.start_frontend_dev():
                # 6. Перевірка доступності
                time.sleep(3)  # Додатковий час на запуск
                if self.check_frontend_running():
                    print("\n🎯 РЕЗУЛЬТАТ: ✅ ВЕБ-ІНТЕРФЕЙС ПРАЦЮЄ!")
                    print("🌐 Відкрийте: http://localhost:3000")
                    
                    # Залишити працюючим на 30 секунд
                    print("\n⏱️  Тестування 30 секунд...")
                    time.sleep(30)
                    
                    return True
                else:
                    print("\n🎯 РЕЗУЛЬТАТ: ❌ ВЕБ-ІНТЕРФЕЙС НЕ ДОСТУПНИЙ")
                    return False
            else:
                print("\n🎯 РЕЗУЛЬТАТ: ❌ НЕ ВДАЛОСЯ ЗАПУСТИТИ")
                return False
                
        except KeyboardInterrupt:
            print("\n⚠️ Тест перервано користувачем")
            return False
        except Exception as e:
            print(f"\n❌ Помилка тесту: {e}")
            return False
        finally:
            self.cleanup()

def main():
    tester = WebInterfaceTest()
    success = tester.run_full_test()
    
    if success:
        print("\n✅ Тест успішний! Веб-інтерфейс працює.")
    else:
        print("\n❌ Тест не пройдено. Перевірте помилки вище.")
        
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
