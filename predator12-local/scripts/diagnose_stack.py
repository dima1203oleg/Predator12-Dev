#!/usr/bin/env python3
"""
Детальна діагностика стану всіх компонентів Predator11 stack
"""

import subprocess
import sys
from pathlib import Path
import requests
import docker
import psutil
from datetime import datetime

class Predator11Diagnostics:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.ok_services = []
        self.project_root = Path("/Users/dima/Documents/Predator11")
        
    def log_issue(self, service, message, level="ERROR"):
        if level == "ERROR":
            self.issues.append(f"❌ {service}: {message}")
        elif level == "WARNING":  
            self.warnings.append(f"⚠️ {service}: {message}")
        else:
            self.ok_services.append(f"✅ {service}: {message}")
    
    def check_docker_daemon(self):
        """Перевірка Docker daemon"""
        try:
            client = docker.from_env()
            client.ping()
            self.log_issue("Docker Daemon", "Працює", "OK")
            return True
        except Exception as e:
            self.log_issue("Docker Daemon", f"Недоступний: {e}")
            return False
    
    def check_system_resources(self):
        """Перевірка системних ресурсів"""
        # CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        if cpu_percent > 80:
            self.log_issue("CPU", f"Високе навантаження: {cpu_percent}%", "WARNING")
        else:
            self.log_issue("CPU", f"Нормальне навантаження: {cpu_percent}%", "OK")
        
        # Memory
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        if memory_percent > 85:
            self.log_issue("Memory", f"Високе використання: {memory_percent}%", "WARNING")
        else:
            self.log_issue("Memory", f"Нормальне використання: {memory_percent}%", "OK")
            
        # Disk
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        if disk_percent > 90:
            self.log_issue("Disk", f"Мало місця: {disk_percent}%", "WARNING")
        else:
            self.log_issue("Disk", f"Достатньо місця: {disk_percent}%", "OK")
    
    def check_docker_compose_config(self):
        """Перевірка конфігурації docker-compose"""
        compose_file = self.project_root / "docker-compose.yml"
        override_file = self.project_root / "docker-compose.override.yml"
        
        if not compose_file.exists():
            self.log_issue("Docker Compose", "docker-compose.yml не знайдено")
            return False
            
        # Перевірка валідності YAML
        try:
            result = subprocess.run(
                ["docker-compose", "config"], 
                cwd=self.project_root,
                capture_output=True, 
                text=True
            )
            if result.returncode == 0:
                self.log_issue("Docker Compose Config", "Валідна конфігурація", "OK")
            else:
                self.log_issue("Docker Compose Config", f"Помилки: {result.stderr}")
        except Exception as e:
            self.log_issue("Docker Compose", f"Не вдається перевірити: {e}")
    
    def check_container_status(self):
        """Детальна перевірка статусу контейнерів"""
        if not self.check_docker_daemon():
            return
            
        try:
            client = docker.from_env()
            
            # Отримуємо всі контейнери проекту
            containers = client.containers.list(all=True, filters={
                "label": "com.docker.compose.project=predator11"
            })
            
            if not containers:
                self.log_issue("Containers", "Жодного контейнера не знайдено")
                return
            
            for container in containers:
                name = container.name
                status = container.status
                
                if status == "running":
                    # Перевірка health check
                    health = container.attrs.get('State', {}).get('Health', {})
                    if health:
                        health_status = health.get('Status', 'none')
                        if health_status == 'healthy':
                            self.log_issue(name, "Здоровий", "OK")
                        elif health_status == 'unhealthy':
                            self.log_issue(name, "Нездоровий", "ERROR")
                        elif health_status == 'starting':
                            self.log_issue(name, "Запускається", "WARNING")
                        else:
                            self.log_issue(name, f"Health: {health_status}", "WARNING")
                    else:
                        self.log_issue(name, "Працює (немає health check)", "OK")
                elif status == "exited":
                    exit_code = container.attrs.get('State', {}).get('ExitCode', -1)
                    self.log_issue(name, f"Зупинений (код: {exit_code})")
                else:
                    self.log_issue(name, f"Статус: {status}", "WARNING")
                    
        except Exception as e:
            self.log_issue("Container Check", f"Помилка: {e}")
    
    def check_ports_availability(self):
        """Перевірка доступності портів"""
        required_ports = {
            3000: "Frontend",
            8000: "Backend API", 
            5432: "PostgreSQL",
            6379: "Redis",
            9200: "OpenSearch",
            5601: "OpenSearch Dashboards",
            9090: "Prometheus",
            3001: "Grafana",
            3100: "Loki",
            8080: "Keycloak"
        }
        
        for port, service in required_ports.items():
            try:
                response = requests.get(f"http://localhost:{port}", timeout=5)
                self.log_issue(f"{service} ({port})", "Доступний", "OK")
            except requests.exceptions.ConnectionError:
                self.log_issue(f"{service} ({port})", "Недоступний")
            except requests.exceptions.Timeout:
                self.log_issue(f"{service} ({port})", "Таймаут відповіді", "WARNING")
            except Exception as e:
                self.log_issue(f"{service} ({port})", f"Помилка: {e}", "WARNING")
    
    def check_env_variables(self):
        """Перевірка змінних оточення"""
        env_file = self.project_root / ".env"
        if not env_file.exists():
            self.log_issue("Environment", ".env файл не знайдено")
            return
            
        try:
            with open(env_file, 'r') as f:
                lines = f.readlines()
            
            required_vars = [
                'DATABASE_URL', 'REDIS_URL', 'OPENSEARCH_URL', 
                'SECRET_KEY', 'POSTGRES_PASSWORD', 'REDIS_PASSWORD'
            ]
            
            defined_vars = []
            for line in lines:
                if '=' in line and not line.startswith('#'):
                    var_name = line.split('=')[0].strip()
                    defined_vars.append(var_name)
            
            missing = set(required_vars) - set(defined_vars)
            if missing:
                self.log_issue("Environment", f"Відсутні змінні: {', '.join(missing)}")
            else:
                self.log_issue("Environment", "Всі необхідні змінні визначені", "OK")
                
        except Exception as e:
            self.log_issue("Environment", f"Помилка читання .env: {e}")
    
    def check_volume_mounts(self):
        """Перевірка volume монтувань"""
        important_volumes = [
            self.project_root / "logs",
            self.project_root / "backend",
            self.project_root / "frontend", 
            self.project_root / "agents"
        ]
        
        for volume_path in important_volumes:
            if volume_path.exists():
                self.log_issue(f"Volume {volume_path.name}", "Існує", "OK")
            else:
                self.log_issue(f"Volume {volume_path.name}", "Не знайдено")
    
    def analyze_common_issues(self):
        """Аналіз типових проблем"""
        print("\n🔍 АНАЛІЗ ТИПОВИХ ПРОБЛЕМ:")
        
        # Перевірка на конфлікти портів
        if any("Недоступний" in issue for issue in self.issues):
            print("💡 Можливі причини недоступності сервісів:")
            print("   - Порти зайняті іншими процесами")
            print("   - Контейнери не запущені")
            print("   - Health checks не проходять")
        
        # Перевірка на проблеми з ресурсами
        if any("Високе" in warning for warning in self.warnings):
            print("💡 Проблеми з ресурсами:")
            print("   - Зменште кількість одночасних сервісів")
            print("   - Перевірте Docker Desktop налаштування")
            print("   - Закрийте непотрібні програми")
        
        # Рекомендації для orange/warning статусів
        print("💡 Щодо оранжевих (WARNING) статусів:")
        print("   - starting: контейнер ще запускається, зачекайте")
        print("   - unhealthy: перевірте логи контейнера")
        print("   - Таймаут: збільште timeout в health check")
    
    def run_full_diagnostic(self):
        """Повна діагностика"""
        print("🚀 PREDATOR11 STACK DIAGNOSTICS")
        print("=" * 60)
        print(f"Час: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Проект: {self.project_root}")
        print()
        
        print("📋 Перевірка компонентів...")
        self.check_system_resources()
        self.check_docker_daemon()
        self.check_docker_compose_config()
        self.check_env_variables()
        self.check_volume_mounts()
        self.check_container_status()
        self.check_ports_availability()
        
        # Результати
        print("\n📊 РЕЗУЛЬТАТИ ДІАГНОСТИКИ:")
        print("=" * 60)
        
        if self.ok_services:
            print("✅ ПРАЦЮЮЧІ СЕРВІСИ:")
            for service in self.ok_services:
                print(f"   {service}")
        
        if self.warnings:
            print("\n⚠️ ПОПЕРЕДЖЕННЯ (ORANGE STATUS):")
            for warning in self.warnings:
                print(f"   {warning}")
        
        if self.issues:
            print("\n❌ КРИТИЧНІ ПРОБЛЕМИ:")
            for issue in self.issues:
                print(f"   {issue}")
        
        # Аналіз
        self.analyze_common_issues()
        
        # Загальний висновок
        print(f"\n📈 ЗАГАЛЬНИЙ СТАН:")
        total = len(self.ok_services) + len(self.warnings) + len(self.issues)
        if len(self.issues) == 0 and len(self.warnings) <= 2:
            print("🟢 СИСТЕМА В НОРМІ")
        elif len(self.issues) == 0:
            print("🟡 СИСТЕМА ПРАЦЮЄ З ПОПЕРЕДЖЕННЯМИ")
        else:
            print("🔴 СИСТЕМА МАЄ КРИТИЧНІ ПРОБЛЕМИ")
        
        print(f"Всього перевірено: {total} компонентів")
        return len(self.issues) == 0

if __name__ == "__main__":
    diagnostics = Predator11Diagnostics()
    success = diagnostics.run_full_diagnostic()
    sys.exit(0 if success else 1)
