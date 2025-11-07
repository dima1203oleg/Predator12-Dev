#!/usr/bin/env python3
"""
Простий тест для запуску та перевірки активності агентів
"""

import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path


class AgentTester:
    def __init__(self):
        self.project_root = Path("/Users/dima/Documents/Predator11")
        self.agents = {
            "AutoHeal": self.project_root / "agents/auto-heal/auto_heal_agent.py",
            "SelfImprovement": self.project_root
            / "agents/self-improvement/self_improvement_agent.py",
            "SelfDiagnosis": self.project_root / "agents/self-diagnosis/self_diagnosis_agent.py",
        }
        self.processes = {}

    def setup_environment(self):
        """Налаштування змінних оточення"""
        os.environ.update(
            {
                "REDIS_URL": "redis://localhost:6379/0",
                "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/predator11",
                "KAFKA_BROKERS": "localhost:9092",
            }
        )

    def check_services(self):
        """Перевірка доступності сервісів"""
        print("🔍 Перевірка сервісів...")

        services = {
            "Redis": ("redis-cli", "ping"),
            "PostgreSQL": ("pg_isready", "-h", "localhost", "-p", "5432"),
        }

        available_services = []

        for service_name, cmd in services.items():
            try:
                result = subprocess.run(cmd, capture_output=True, timeout=5)
                if result.returncode == 0:
                    print(f"   ✅ {service_name}: ДОСТУПНИЙ")
                    available_services.append(service_name)
                else:
                    print(f"   ❌ {service_name}: НЕДОСТУПНИЙ")
            except (subprocess.TimeoutExpired, FileNotFoundError):
                print(f"   ❌ {service_name}: НЕДОСТУПНИЙ (команда не знайдена)")

        return available_services

    def start_agent(self, name, path):
        """Запуск агента"""
        print(f"🤖 Запуск {name}...")

        if not path.exists():
            print(f"   ❌ Файл не знайдено: {path}")
            return False

        try:
            # Запуск агента в окремому процесі
            process = subprocess.Popen(
                [sys.executable, str(path)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=path.parent,
            )

            self.processes[name] = process
            print(f"   ✅ Запущено з PID: {process.pid}")
            return True

        except Exception as e:
            print(f"   ❌ Помилка запуску: {e}")
            return False

    def monitor_agents(self, duration=30):
        """Моніторинг агентів"""
        print(f"\n📊 Моніторинг активності ({duration} секунд)...")

        start_time = time.time()

        while time.time() - start_time < duration:
            active_count = 0

            for name, process in self.processes.items():
                if process.poll() is None:  # Процес ще активний
                    active_count += 1

            print(
                f"\r   Активних агентів: {active_count}/{len(self.processes)}", end="", flush=True
            )
            time.sleep(1)

        print()  # Новий рядок

    def collect_results(self):
        """Збір результатів тестування"""
        print("\n📈 Збір результатів...")

        results = {}

        for name, process in self.processes.items():
            if process.poll() is None:
                print(f"   ✅ {name}: АКТИВНИЙ (PID: {process.pid})")
                results[name] = "active"
            else:
                print(f"   ❌ {name}: ЗУПИНЕНИЙ (код: {process.returncode})")
                results[name] = "stopped"

                # Показати помилки якщо є
                if process.stderr:
                    stderr = process.stderr.read().decode("utf-8", errors="ignore")
                    if stderr.strip():
                        print(f"      Помилка: {stderr[:100]}...")

        return results

    def check_logs(self):
        """Перевірка створених логів"""
        print("\n📝 Перевірка логів...")

        log_locations = [
            self.project_root / "logs/agents",
            self.project_root / "logs/autoheal",
            Path("/tmp"),
        ]

        found_logs = []

        for log_dir in log_locations:
            if log_dir.exists():
                for log_file in log_dir.glob("*.log"):
                    # Перевірити чи файл створено нещодавно
                    if time.time() - log_file.stat().st_mtime < 300:  # 5 хвилин
                        found_logs.append(log_file)
                        print(f"   📄 {log_file.name}: {log_file.stat().st_size} байт")

        if not found_logs:
            print("   ❌ Нових логів не знайдено")

        return found_logs

    def cleanup(self):
        """Зупинка всіх агентів"""
        print("\n🛑 Зупинка агентів...")

        for name, process in self.processes.items():
            if process.poll() is None:
                print(f"   Зупиняю {name}...")
                process.terminate()

                # Дати час на graceful shutdown
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    print(f"   Примусове завершення {name}...")
                    process.kill()
                    process.wait()

    def run_test(self):
        """Запуск повного тесту"""
        print("🚀 PREDATOR11 AGENTS ACTIVITY TEST")
        print("=" * 50)
        print(f"Час запуску: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        try:
            # 1. Налаштування
            self.setup_environment()

            # 2. Перевірка сервісів
            available_services = self.check_services()

            # 3. Запуск агентів
            print(f"\n🤖 Запуск агентів...")
            started_agents = 0

            for name, path in self.agents.items():
                if self.start_agent(name, path):
                    started_agents += 1
                    time.sleep(2)  # Затримка між запусками

            if started_agents == 0:
                print("❌ Жоден агент не було запущено!")
                return

            # 4. Моніторинг
            self.monitor_agents(30)

            # 5. Збір результатів
            results = self.collect_results()

            # 6. Перевірка логів
            logs = self.check_logs()

            # 7. Підсумок
            print(f"\n📋 ПІДСУМОК")
            print("=" * 30)
            print(f"Доступних сервісів: {len(available_services)}")
            print(f"Запущених агентів: {started_agents}/{len(self.agents)}")

            active_agents = len([r for r in results.values() if r == "active"])
            print(f"Активних агентів: {active_agents}/{len(self.agents)}")
            print(f"Знайдено логів: {len(logs)}")

            # Оцінка результату
            if active_agents >= 2 and len(available_services) > 0:
                print("\n🎯 РЕЗУЛЬТАТ: ✅ УСПІШНО - Агенти працюють!")
            elif active_agents >= 1:
                print("\n🎯 РЕЗУЛЬТАТ: 🟡 ЧАСТКОВО - Деякі агенти працюють")
            else:
                print("\n🎯 РЕЗУЛЬТАТ: ❌ НЕУСПІШНО - Агенти не працюють")

            return {
                "available_services": available_services,
                "started_agents": started_agents,
                "active_agents": active_agents,
                "logs_found": len(logs),
                "success": active_agents >= 1,
            }

        except KeyboardInterrupt:
            print("\n⚠️ Тест перервано користувачем")
        except Exception as e:
            print(f"\n❌ Помилка тесту: {e}")
        finally:
            self.cleanup()


def main():
    tester = AgentTester()
    results = tester.run_test()

    # Збереження результатів
    if results:
        results_file = Path("/Users/dima/Documents/Predator11/test_results.json")
        import json

        with open(results_file, "w") as f:
            json.dump({"timestamp": datetime.now().isoformat(), "results": results}, f, indent=2)

        print(f"\n📄 Результати збережено: {results_file}")


if __name__ == "__main__":
    main()
