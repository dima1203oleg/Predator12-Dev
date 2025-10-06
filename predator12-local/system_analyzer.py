#!/usr/bin/env python3
"""
🔍 АНАЛІЗАТОР СИСТЕМИ PREDATOR11
Перевіряє роботу агентів, використання моделей та дублювання функцій контейнерів
"""
import asyncio
import aiohttp
import docker
import json
import psutil
from datetime import datetime, timedelta
from collections import defaultdict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SystemAnalyzer:
    def __init__(self):
        self.docker_client = docker.from_env()
        self.model_sdk_url = "http://localhost:3010"
        self.agents_discovered = []
        self.containers_analysis = {}

    async def analyze_model_usage(self):
        """Аналіз використання моделей агентами"""
        logger.info("🔍 Аналізую використання AI моделей...")

        try:
            async with aiohttp.ClientSession() as session:
                # Перевіряю Model SDK
                async with session.get(f"{self.model_sdk_url}/health") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        logger.info(f"📊 Model SDK: {data.get('models_total', 0)} моделей, {data.get('providers_connected', 0)} провайдерів підключено")
                        return data
                    else:
                        logger.error(f"❌ Model SDK недоступний: {resp.status}")
                        return None
        except Exception as e:
            logger.error(f"❌ Помилка підключення до Model SDK: {e}")
            return None

    def analyze_containers(self):
        """Аналіз всіх Docker контейнерів"""
        logger.info("🐳 Аналізую Docker контейнери...")

        containers = self.docker_client.containers.list(all=True)

        # Групую контейнери за функціональністю
        groups = {
            'core': [],           # Основні сервіси
            'monitoring': [],     # Моніторинг та логи
            'storage': [],        # Бази даних та сховища
            'agents': [],         # AI агенти
            'setup': [],          # Setup та ініціалізація
            'unknown': []         # Невизначені
        }

        for container in containers:
            name = container.name
            image = container.image.tags[0] if container.image.tags else "unknown"
            status = container.status

            # Класифікація контейнерів
            if any(keyword in name.lower() for keyword in ['backend', 'frontend', 'modelsdk']):
                groups['core'].append({'name': name, 'image': image, 'status': status})
            elif any(keyword in name.lower() for keyword in ['prometheus', 'grafana', 'loki', 'tempo', 'promtail']):
                groups['monitoring'].append({'name': name, 'image': image, 'status': status})
            elif any(keyword in name.lower() for keyword in ['db', 'redis', 'minio', 'qdrant', 'opensearch']):
                groups['storage'].append({'name': name, 'image': image, 'status': status})
            elif any(keyword in name.lower() for keyword in ['agent', 'worker', 'celery', 'scheduler']):
                groups['agents'].append({'name': name, 'image': image, 'status': status})
            elif any(keyword in name.lower() for keyword in ['setup', 'init']):
                groups['setup'].append({'name': name, 'image': image, 'status': status})
            else:
                groups['unknown'].append({'name': name, 'image': image, 'status': status})

        self.containers_analysis = groups
        return groups

    def detect_duplicates(self):
        """Виявлення дублюючих функцій"""
        logger.info("🔄 Шукаю дублювання функцій...")

        duplicates = []

        # Перевірка дублікатів моніторингу
        monitoring = self.containers_analysis.get('monitoring', [])
        if len(monitoring) > 6:  # Більше ніж очікувано
            duplicates.append({
                'type': 'monitoring_excess',
                'description': f'Забагато контейнерів моніторингу: {len(monitoring)}',
                'containers': [c['name'] for c in monitoring]
            })

        # Перевірка дублікатів сховищ
        storage = self.containers_analysis.get('storage', [])
        db_containers = [c for c in storage if 'db' in c['name'].lower()]
        if len(db_containers) > 1:
            duplicates.append({
                'type': 'database_duplicate',
                'description': f'Кілька БД контейнерів: {len(db_containers)}',
                'containers': [c['name'] for c in db_containers]
            })

        # Перевірка дублікатів агентів
        agents = self.containers_analysis.get('agents', [])
        agent_workers = [c for c in agents if 'worker' in c['name'].lower()]
        if len(agent_workers) > 2:
            duplicates.append({
                'type': 'worker_excess',
                'description': f'Забагато worker контейнерів: {len(agent_workers)}',
                'containers': [c['name'] for c in agent_workers]
            })

        return duplicates

    def check_agents_activity(self):
        """Перевірка активності агентів"""
        logger.info("🤖 Перевіряю активність AI агентів...")

        agents_status = []

        # Перевірка через процеси
        for proc in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_info']):
            try:
                cmdline = ' '.join(proc.info['cmdline'] or [])
                if 'agent' in cmdline.lower() and '.py' in cmdline:
                    agents_status.append({
                        'name': proc.info['name'],
                        'cmdline': cmdline,
                        'cpu_percent': proc.info['cpu_percent'],
                        'memory_mb': proc.info['memory_info'].rss / 1024 / 1024 if proc.info['memory_info'] else 0,
                        'status': 'running'
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        return agents_status

    def analyze_container_necessity(self):
        """Аналіз необхідності кожного контейнера"""
        logger.info("📋 Аналізую необхідність контейнерів...")

        analysis = {}

        for group_name, containers in self.containers_analysis.items():
            for container in containers:
                name = container['name']
                status = container['status']

                # Визначення необхідності
                if group_name == 'core':
                    necessity = 'critical'
                elif group_name == 'storage':
                    necessity = 'critical'
                elif group_name == 'agents':
                    necessity = 'important'
                elif group_name == 'monitoring':
                    necessity = 'useful' if len(containers) <= 6 else 'optional'
                elif group_name == 'setup':
                    necessity = 'temporary'
                else:
                    necessity = 'unknown'

                analysis[name] = {
                    'group': group_name,
                    'status': status,
                    'necessity': necessity,
                    'recommendation': self._get_recommendation(name, status, necessity)
                }

        return analysis

    def _get_recommendation(self, name, status, necessity):
        """Рекомендації для контейнера"""
        if necessity == 'temporary' and status in ['exited', 'created']:
            return 'можна видалити'
        elif necessity == 'optional' and status == 'exited':
            return 'можна видалити'
        elif necessity == 'critical' and status != 'running':
            return 'потрібно запустити'
        elif 'setup' in name.lower() and status == 'exited':
            return 'можна видалити (setup завершено)'
        else:
            return 'залишити як є'

    async def generate_report(self):
        """Генерує повний звіт аналізу системи"""
        logger.info("📊 Генерую повний звіт...")

        # Збираємо всі дані
        model_data = await self.analyze_model_usage()
        containers_groups = self.analyze_containers()
        duplicates = self.detect_duplicates()
        agents_activity = self.check_agents_activity()
        necessity_analysis = self.analyze_container_necessity()

        report = {
            'timestamp': datetime.now().isoformat(),
            'model_sdk': model_data,
            'containers': {
                'total': sum(len(group) for group in containers_groups.values()),
                'by_groups': {k: len(v) for k, v in containers_groups.items()},
                'detailed': containers_groups
            },
            'duplicates': duplicates,
            'agents': {
                'running_count': len(agents_activity),
                'details': agents_activity
            },
            'recommendations': necessity_analysis
        }

        return report

    def print_summary_report(self, report):
        """Виводить короткий звіт українською"""
        print("\n" + "="*60)
        print("🔍 ЗВІТ АНАЛІЗУ СИСТЕМИ PREDATOR11")
        print("="*60)

        # Model SDK статус
        model_sdk = report['model_sdk']
        if model_sdk:
            print(f"\n🤖 MODEL SDK:")
            print(f"   📊 Всього моделей: {model_sdk.get('models_total', 0)}")
            print(f"   📡 Доступних через API: {model_sdk.get('models_available', 0)}")
            print(f"   🔌 Підключених провайдерів: {model_sdk.get('providers_connected', 0)}")
        else:
            print(f"\n❌ MODEL SDK: недоступний")

        # Контейнери
        containers = report['containers']
        print(f"\n🐳 КОНТЕЙНЕРИ: {containers['total']} всього")
        for group, count in containers['by_groups'].items():
            print(f"   {group}: {count}")

        # Дублікати
        duplicates = report['duplicates']
        if duplicates:
            print(f"\n⚠️ ЗНАЙДЕНО ДУБЛІКАТІВ: {len(duplicates)}")
            for dup in duplicates:
                print(f"   - {dup['description']}")
        else:
            print(f"\n✅ ДУБЛІКАТІВ НЕ ЗНАЙДЕНО")

        # Агенти
        agents = report['agents']
        print(f"\n🤖 АКТИВНИХ АГЕНТІВ: {agents['running_count']}")
        for agent in agents['details'][:5]:  # Показуємо перші 5
            print(f"   - CPU: {agent['cpu_percent']:.1f}%, RAM: {agent['memory_mb']:.0f}MB")

        # Рекомендації
        recommendations = report['recommendations']
        to_remove = [k for k, v in recommendations.items() if 'видалити' in v['recommendation']]
        to_start = [k for k, v in recommendations.items() if 'запустити' in v['recommendation']]

        if to_remove:
            print(f"\n🗑️ РЕКОМЕНДУЮ ВИДАЛИТИ ({len(to_remove)}):")
            for container in to_remove[:5]:
                print(f"   - {container}")

        if to_start:
            print(f"\n🚀 РЕКОМЕНДУЮ ЗАПУСТИТИ ({len(to_start)}):")
            for container in to_start:
                print(f"   - {container}")

        print("\n" + "="*60)

async def main():
    analyzer = SystemAnalyzer()
    report = await analyzer.generate_report()

    # Виводимо звіт
    analyzer.print_summary_report(report)

    # Зберігаємо детальний звіт
    with open('/Users/dima/Documents/Predator11/system_analysis_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Детальний звіт збережено: system_analysis_report.json")

if __name__ == "__main__":
    asyncio.run(main())
