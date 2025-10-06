#!/usr/bin/env python3
"""
Звіт про автоматичні зміни MAS агентів за останні 3 години
"""
import asyncio
import aioredis
import os
import json
from datetime import datetime, timedelta
from typing import Dict, List

class AutoChangesReporter:
    def __init__(self):
        self.redis = None
        # Всі 26 агентів системи Predator11
        self.all_agents = [
            # Orchestration Layer
            'ChiefOrchestratorAgent',
            'ModelRouterAgent',
            'ArbiterAgent',

            # Data Layer
            'IngestAgent',
            'SchemaLineageAgent',
            'DataQualityAgent',
            'EntityResolutionAgent',
            'GeoEnrichmentAgent',
            'SyntheticDataAgent',

            # Analytics Layer
            'AnomalyAgent',
            'ForecastAgent',
            'PatternMiningAgent',
            'GraphAgent',
            'RiskScoringAgent',

            # LLM/UX Layer
            'PromptEngineeringAgent',
            'QueryPlannerAgent',
            'ReportGenAgent',
            'DashboardBuilderAgent',

            # Operational Layer (включаючи MAS агентів)
            'SelfDiagnosisAgent',
            'SelfHealingAgent',
            'AutoTrainAgent',
            'ReleaseManagerAgent',
            'SecurityPrivacyAgent',
            'ComplianceAgent',
            'BillingQuotaAgent',
            'CostOptimizerAgent'
        ]
        self.logs_dir = "/Users/dima/Documents/Predator11/logs/agents"

    async def initialize(self):
        """Ініціалізація Redis з'єднання"""
        try:
            self.redis = aioredis.from_url(
                'redis://localhost:6379',
                encoding="utf-8", decode_responses=True
            )
            await self.redis.ping()
            print("✅ Підключено до Redis")
        except Exception as e:
            print(f"⚠️ Redis недоступний: {e}")
            self.redis = None

    async def get_agent_changes_log(self, agent_name: str, hours: int = 3) -> List[Dict]:
        """Отримання логу змін агента з Redis"""
        if not self.redis:
            return []

        changes_key = f"agent:{agent_name}:changes"
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)

        try:
            # Отримуємо всі зміни
            changes_data = await self.redis.lrange(changes_key, 0, -1)
            recent_changes = []

            for change_str in changes_data:
                try:
                    change = json.loads(change_str) if isinstance(change_str, str) else change_str
                    change_time = datetime.fromisoformat(change.get('timestamp', ''))
                    if change_time >= cutoff_time:
                        recent_changes.append(change)
                except:
                    continue

            return sorted(recent_changes, key=lambda x: x.get('timestamp', ''), reverse=True)
        except Exception as e:
            print(f"Помилка читання змін для {agent_name}: {e}")
            return []

    def get_log_changes(self, agent_name: str, hours: int = 3) -> List[str]:
        """Читання змін з лог файлів"""
        log_file = os.path.join(self.logs_dir, f"{agent_name.lower()}.log")
        if not os.path.exists(log_file):
            return []

        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_logs = []

        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            for line in lines:
                # Розширений пошук автоматичних дій для всіх типів агентів
                if any(keyword in line.lower() for keyword in [
                    # MAS агенти
                    'autoheal:', 'selfimprovement:', 'selfdiagnosis:', 'performed', 'applied', 'generated',
                    # Оркестрація
                    'routed', 'orchestrated', 'delegated', 'arbitrated',
                    # Дані
                    'ingested', 'validated', 'enriched', 'resolved', 'synthesized',
                    # Аналітика
                    'detected', 'forecasted', 'analyzed', 'scored', 'mined',
                    # UX/LLM
                    'optimized prompt', 'generated report', 'built dashboard', 'planned query',
                    # Операційні
                    'deployed', 'secured', 'compliant', 'billed', 'cost optimized',
                    # Загальні автоматичні дії
                    'optimization', 'automatic', 'auto', 'intelligent', 'adaptive'
                ]):
                    recent_logs.append(line.strip())

        except Exception as e:
            print(f"Помилка читання логу {agent_name}: {e}")

        return recent_logs

    async def generate_changes_report(self) -> str:
        """Генерація звіту про автоматичні зміни"""
        report = "🔄 ЗВІТ АВТОМАТИЧНИХ ЗМІН ВСІХ АГЕНТІВ PREDATOR11 (Останні 3 години)\n"
        report += "=" * 70 + "\n"
        report += f"⏰ Період: {(datetime.now() - timedelta(hours=3)).strftime('%H:%M')} - {datetime.now().strftime('%H:%M')}\n"
        report += f"📅 Дата: {datetime.now().strftime('%Y-%m-%d')}\n"
        report += f"🤖 Агентів для аналізу: {len(self.all_agents)}\n\n"

        total_changes = 0
        total_improvements = 0
        total_fixes = 0
        active_agents = 0
        agents_with_changes = []

        # Аналіз кожного агента
        for i, agent_name in enumerate(self.all_agents, 1):
            # Зміни з Redis логів
            agent_changes = await self.get_agent_changes_log(agent_name)
            log_changes = self.get_log_changes(agent_name)

            has_activity = bool(agent_changes or log_changes)
            if has_activity:
                active_agents += 1
                agents_with_changes.append(agent_name)

                report += f"{'='*50}\n"
                report += f"🤖 {i}/26: {agent_name}\n"
                report += f"{'='*50}\n\n"

                if agent_changes:
                    report += f"📝 АВТОМАТИЧНІ ЗМІНИ З REDIS ({len(agent_changes)})\n"
                    for j, change in enumerate(agent_changes[:3], 1):  # Топ 3 для компактності
                        change_type = change.get('type', 'unknown')
                        description = change.get('description', 'Опис відсутній')
                        timestamp = change.get('timestamp', 'Невідомо')
                        action = change.get('action', '')

                        type_emoji = {
                            'optimization': '⚡',
                            'fix': '🔧',
                            'improvement': '📈',
                            'refactor': '🔄',
                            'diagnosis': '🔍',
                            'feature': '✨',
                            'ingestion': '📥',
                            'analysis': '🔬',
                            'deployment': '🚀'
                        }.get(change_type, '🔹')

                        report += f"  {type_emoji} {j}. {description}\n"
                        report += f"       ⏱️  {timestamp}\n"
                        if action:
                            report += f"       🎯 Дія: {action}\n"

                        if change_type == 'improvement':
                            total_improvements += 1
                        elif change_type == 'fix':
                            total_fixes += 1

                        total_changes += 1

                    report += "\n"

                if log_changes:
                    report += f"📋 АКТИВНІСТЬ З ЛОГІВ ({len(log_changes)})\n"
                    for log_entry in log_changes[-5:]:  # Останні 5 для компактності
                        report += f"  📄 {log_entry}\n"
                    report += "\n"

        # Підсумкова статистика
        report += f"{'='*60}\n"
        report += f"📊 ПІДСУМКОВА СТАТИСТИКА СИСТЕМИ\n"
        report += f"{'='*60}\n\n"

        report += f"🤖 Активних агентів: {active_agents}/26\n"
        report += f"🔢 Загальна кількість змін: {total_changes}\n"
        report += f"📈 Покращення системи: {total_improvements}\n"
        report += f"🔧 Автоматичні виправлення: {total_fixes}\n\n"

        # Список активних агентів
        if agents_with_changes:
            report += f"✅ АГЕНТИ З АВТОМАТИЧНИМИ ЗМІНАМИ:\n"
            for agent in agents_with_changes:
                report += f"├─ {agent}\n"
            report += "\n"

        # Неактивні агенти
        inactive_agents = [agent for agent in self.all_agents if agent not in agents_with_changes]
        if inactive_agents:
            report += f"⏸️  АГЕНТИ БЕЗ ЗМІН ({len(inactive_agents)}):\n"
            for agent in inactive_agents[:10]:  # Показуємо перші 10
                report += f"├─ {agent}\n"
            if len(inactive_agents) > 10:
                report += f"└─ ... та ще {len(inactive_agents) - 10} агентів\n"
            report += "\n"

        # Оцінка активності
        activity_percentage = (active_agents / len(self.all_agents)) * 100

        if activity_percentage >= 80:
            activity_level = "🟢 ВІДМІННА - Більшість агентів активні"
        elif activity_percentage >= 50:
            activity_level = "🟡 ДОБРА - Достатня активність агентів"
        elif activity_percentage >= 20:
            activity_level = "🟠 НИЗЬКА - Мало активних агентів"
        else:
            activity_level = "🔴 КРИТИЧНА - Дуже мало активних агентів"

        report += f"⚡ Рівень активності системи: {activity_level} ({activity_percentage:.1f}%)\n\n"

        # Рекомендації
        report += f"💡 РЕКОМЕНДАЦІЇ:\n"
        if active_agents == 0:
            report += f"├─ ⚠️  Жоден агент не показує активності - перевірте запуск системи\n"
            report += f"├─ 🔄 Можливо потрібно перезапустити launch_full_system.py\n"
        elif active_agents < 10:
            report += f"├─ 📈 Система тільки розпочинає роботу - дайте більше часу\n"
            report += f"├─ 🔍 Перевірте логи неактивних агентів на помилки\n"
        else:
            report += f"├─ ✅ Система працює добре - {active_agents} агентів активні\n"

        report += f"└─ 📊 Детальні метрики в Redis: agent:*:changes\n"

        return report

async def main():
    print("🔍 Генерую звіт про автоматичні зміни MAS агентів...")

    reporter = AutoChangesReporter()
    await reporter.initialize()

    report = await reporter.generate_changes_report()
    print(report)

    # Зберігаємо звіт
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"/Users/dima/Documents/Predator11/logs/auto_changes_report_{timestamp}.txt"

    os.makedirs(os.path.dirname(report_file), exist_ok=True)
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"\n📄 Звіт збережено: {report_file}")

if __name__ == "__main__":
    asyncio.run(main())
