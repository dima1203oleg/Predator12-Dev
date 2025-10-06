#!/usr/bin/env python3
"""
📊 Model Usage Analytics & Monitoring Dashboard
Система аналізу використання всіх 58 моделей в multi-agent системі
"""

import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict, Counter
from typing import Any
import matplotlib.pyplot as plt
import pandas as pd

class ModelUsageAnalytics:
    """Аналітика використання моделей в multi-agent системі"""
    
    def __init__(self, log_file: str = "model_usage.log"):
        self.log_file = Path(log_file)
        self.usage_stats = defaultdict(lambda: {
            'total_requests': 0,
            'success_count': 0,
            'error_count': 0,
            'avg_response_time': 0.0,
            'total_response_time': 0.0,
            'agents_using': set(),
            'task_types': Counter(),
            'daily_usage': defaultdict(int),
            'hourly_distribution': defaultdict(int),
            'performance_scores': []
        })
        self.agent_stats = defaultdict(lambda: {
            'models_used': Counter(),
            'total_requests': 0,
            'success_rate': 0.0,
            'favorite_model': '',
            'task_distribution': Counter()
        })
        self.load_existing_data()
    
    def log_model_usage(self, model: str, agent: str, task_type: str, 
                       success: bool, response_time: float, 
                       performance_score: float = 0.0):
        """Логування використання моделі"""
        timestamp = datetime.now()
        
        # Оновлення статистики моделі
        stats = self.usage_stats[model]
        stats['total_requests'] += 1
        stats['agents_using'].add(agent)
        stats['task_types'][task_type] += 1
        
        if success:
            stats['success_count'] += 1
        else:
            stats['error_count'] += 1
        
        # Оновлення часу відповіді
        stats['total_response_time'] += response_time
        stats['avg_response_time'] = stats['total_response_time'] / stats['total_requests']
        
        # Додавання оцінки продуктивності
        if performance_score > 0:
            stats['performance_scores'].append(performance_score)
        
        # Часова статистика
        date_key = timestamp.strftime('%Y-%m-%d')
        hour_key = timestamp.hour
        stats['daily_usage'][date_key] += 1
        stats['hourly_distribution'][hour_key] += 1
        
        # Статистика агента
        agent_stats = self.agent_stats[agent]
        agent_stats['models_used'][model] += 1
        agent_stats['total_requests'] += 1
        agent_stats['task_distribution'][task_type] += 1
        
        # Визначення улюбленої моделі агента
        agent_stats['favorite_model'] = agent_stats['models_used'].most_common(1)[0][0]
        
        # Розрахунок success rate для агента
        total_success = sum(1 for m in agent_stats['models_used'] 
                          if self.usage_stats[m]['success_count'] > 0)
        agent_stats['success_rate'] = total_success / len(agent_stats['models_used']) if agent_stats['models_used'] else 0
        
        # Збереження в лог
        log_entry = {
            'timestamp': timestamp.isoformat(),
            'model': model,
            'agent': agent,
            'task_type': task_type,
            'success': success,
            'response_time': response_time,
            'performance_score': performance_score
        }
        
        self.save_log_entry(log_entry)
    
    def generate_comprehensive_report(self) -> dict[str, Any]:
        """Генерація повного аналітичного звіту"""
        
        total_models = len(self.usage_stats)
        total_requests = sum(stats['total_requests'] for stats in self.usage_stats.values())
        
        # Топ-моделі за використанням
        top_models = sorted(
            [(model, stats['total_requests']) for model, stats in self.usage_stats.items()],
            key=lambda x: x[1], reverse=True
        )[:10]
        
        # Найефективніші моделі
        efficient_models = []
        for model, stats in self.usage_stats.items():
            if stats['total_requests'] > 5:  # Мінімум запитів для статистики
                efficiency = (stats['success_count'] / stats['total_requests']) * 100
                efficient_models.append((model, efficiency, stats['avg_response_time']))
        
        efficient_models.sort(key=lambda x: x[1], reverse=True)
        
        # Розподіл за провайдерами
        provider_stats = defaultdict(lambda: {'models': 0, 'requests': 0})
        for model, stats in self.usage_stats.items():
            provider = model.split('/')[0] if '/' in model else 'unknown'
            provider_stats[provider]['models'] += 1
            provider_stats[provider]['requests'] += stats['total_requests']
        
        # Аналіз агентів
        agent_analysis = {}
        for agent, stats in self.agent_stats.items():
            agent_analysis[agent] = {
                'total_requests': stats['total_requests'],
                'models_count': len(stats['models_used']),
                'favorite_model': stats['favorite_model'],
                'success_rate': f"{stats['success_rate']:.1%}",
                'top_tasks': dict(stats['task_distribution'].most_common(3))
            }
        
        # Часовий аналіз
        current_date = datetime.now().strftime('%Y-%m-%d')
        today_usage = sum(stats['daily_usage'].get(current_date, 0) for stats in self.usage_stats.values())
        
        # Пікові години
        all_hourly = defaultdict(int)
        for stats in self.usage_stats.values():
            for hour, count in stats['hourly_distribution'].items():
                all_hourly[hour] += count
        
        peak_hours = sorted(all_hourly.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "summary": {
                "total_models_available": 58,
                "models_actively_used": total_models,
                "usage_coverage": f"{(total_models/58)*100:.1f}%",
                "total_requests": total_requests,
                "today_requests": today_usage
            },
            "top_models": top_models[:5],
            "most_efficient": efficient_models[:5],
            "provider_distribution": dict(provider_stats),
            "agent_analysis": agent_analysis,
            "time_analysis": {
                "peak_hours": peak_hours,
                "current_date": current_date
            },
            "recommendations": self._generate_recommendations()
        }
    
    def _generate_recommendations(self) -> list[str]:
        """Генерація рекомендацій на основі статистики"""
        recommendations = []
        
        # Аналіз неактивних моделей
        unused_models = []
        for model_id in self._get_all_available_models():
            if model_id not in self.usage_stats or self.usage_stats[model_id]['total_requests'] == 0:
                unused_models.append(model_id)
        
        if unused_models:
            recommendations.append(
                f"🔍 {len(unused_models)} моделей не використовуються. "
                f"Розгляньте інтеграцію: {', '.join(unused_models[:3])}"
            )
        
        # Аналіз продуктивності
        slow_models = []
        for model, stats in self.usage_stats.items():
            if stats['avg_response_time'] > 5.0 and stats['total_requests'] > 10:
                slow_models.append((model, stats['avg_response_time']))
        
        if slow_models:
            slowest = min(slow_models, key=lambda x: x[1])
            recommendations.append(
                f"⚡ Модель {slowest[0]} має повільний час відповіді ({slowest[1]:.1f}s). "
                f"Розгляньте fallback опції."
            )
        
        # Рекомендації по балансуванню
        high_usage_models = [model for model, stats in self.usage_stats.items() 
                           if stats['total_requests'] > 100]
        
        if high_usage_models:
            recommendations.append(
                f"📊 Високе навантаження на моделі: {', '.join(high_usage_models[:2])}. "
                f"Розподіліть навантаження на альтернативи."
            )
        
        return recommendations[:5]  # Топ-5 рекомендацій
    
    def _get_all_available_models(self) -> list[str]:
        """Отримання списку всіх 58 доступних моделей"""
        return [
            # AI21 Labs
            "ai21-labs/ai21-jamba-1.5-large", "ai21-labs/ai21-jamba-1.5-mini",
            # Cohere
            "cohere/cohere-command-a", "cohere/cohere-command-r-08-2024",
            "cohere/cohere-command-r-plus-08-2024", "cohere/cohere-embed-v3-english",
            "cohere/cohere-embed-v3-multilingual",
            # Core42
            "core42/jais-30b-chat",
            # DeepSeek
            "deepseek/deepseek-r1", "deepseek/deepseek-r1-0528", "deepseek/deepseek-v3-0324",
            # Meta
            "meta/llama-3.2-11b-vision-instruct", "meta/llama-3.2-90b-vision-instruct",
            "meta/llama-3.3-70b-instruct", "meta/llama-4-maverick-17b-128e-instruct-fp8",
            "meta/llama-4-scout-17b-16e-instruct", "meta/meta-llama-3.1-405b-instruct",
            "meta/meta-llama-3.1-8b-instruct",
            # Microsoft
            "microsoft/mai-ds-r1", "microsoft/phi-3-medium-128k-instruct",
            "microsoft/phi-3-medium-4k-instruct", "microsoft/phi-3-mini-128k-instruct",
            "microsoft/phi-3-mini-4k-instruct", "microsoft/phi-3-small-128k-instruct",
            "microsoft/phi-3-small-8k-instruct", "microsoft/phi-3.5-mini-instruct",
            "microsoft/phi-3.5-moe-instruct", "microsoft/phi-3.5-vision-instruct",
            "microsoft/phi-4", "microsoft/phi-4-mini-instruct", 
            "microsoft/phi-4-mini-reasoning", "microsoft/phi-4-multimodal-instruct",
            "microsoft/phi-4-reasoning",
            # Mistral AI
            "mistral-ai/codestral-2501", "mistral-ai/ministral-3b",
            "mistral-ai/mistral-large-2411", "mistral-ai/mistral-medium-2505",
            "mistral-ai/mistral-nemo", "mistral-ai/mistral-small-2503",
            # OpenAI
            "openai/gpt-4.1", "openai/gpt-4.1-mini", "openai/gpt-4.1-nano",
            "openai/gpt-4o", "openai/gpt-4o-mini", "openai/gpt-5",
            "openai/gpt-5-chat", "openai/gpt-5-mini", "openai/gpt-5-nano",
            "openai/o1", "openai/o1-mini", "openai/o1-preview",
            "openai/o3", "openai/o3-mini", "openai/o4-mini",
            "openai/text-embedding-3-large", "openai/text-embedding-3-small",
            # xAI
            "xai/grok-3", "xai/grok-3-mini"
        ]
    
    def save_log_entry(self, entry: dict[str, Any]):
        """Збереження запису в лог"""
        try:
            with open(self.log_file, 'a') as f:
                f.write(json.dumps(entry) + '\n')
        except Exception as e:
            print(f"❌ Помилка збереження логу: {e}")
    
    def load_existing_data(self):
        """Завантаження існуючих даних з логу"""
        if not self.log_file.exists():
            return
        
        try:
            with open(self.log_file) as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        self.log_model_usage(
                            entry['model'], entry['agent'], entry['task_type'],
                            entry['success'], entry['response_time'],
                            entry.get('performance_score', 0.0)
                        )
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            print(f"❌ Помилка завантаження існуючих даних: {e}")
    
    def generate_visual_report(self, save_path: str = "model_usage_report.png"):
        """Генерація візуального звіту"""
        try:
            fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 12))
            
            # 1. Топ-10 моделей за використанням
            top_models = sorted(
                [(model, stats['total_requests']) for model, stats in self.usage_stats.items()],
                key=lambda x: x[1], reverse=True
            )[:10]
            
            if top_models:
                models, counts = zip(*top_models)
                ax1.barh(range(len(models)), counts)
                ax1.set_yticks(range(len(models)))
                ax1.set_yticklabels([m.split('/')[-1][:20] for m in models])
                ax1.set_title('Топ-10 моделей за використанням')
                ax1.set_xlabel('Кількість запитів')
            
            # 2. Розподіл за провайдерами
            provider_counts = defaultdict(int)
            for model in self.usage_stats:
                provider = model.split('/')[0] if '/' in model else 'unknown'
                provider_counts[provider] += self.usage_stats[model]['total_requests']
            
            if provider_counts:
                ax2.pie(provider_counts.values(), labels=provider_counts.keys(), autopct='%1.1f%%')
                ax2.set_title('Розподіл використання за провайдерами')
            
            # 3. Погодинний розподіл
            all_hourly = defaultdict(int)
            for stats in self.usage_stats.values():
                for hour, count in stats['hourly_distribution'].items():
                    all_hourly[hour] += count
            
            if all_hourly:
                hours = sorted(all_hourly.keys())
                counts = [all_hourly[h] for h in hours]
                ax3.plot(hours, counts, marker='o')
                ax3.set_title('Погодинний розподіл використання')
                ax3.set_xlabel('Година доби')
                ax3.set_ylabel('Кількість запитів')
                ax3.grid(True)
            
            # 4. Ефективність моделей
            efficient_data = []
            for model, stats in self.usage_stats.items():
                if stats['total_requests'] > 5:
                    success_rate = (stats['success_count'] / stats['total_requests']) * 100
                    efficient_data.append((model.split('/')[-1][:15], success_rate, stats['avg_response_time']))
            
            if efficient_data:
                models, success_rates, response_times = zip(*efficient_data[:10])
                
                ax4_twin = ax4.twinx()
                bars1 = ax4.bar(range(len(models)), success_rates, alpha=0.7, label='Success Rate %')
                bars2 = ax4_twin.plot(range(len(models)), response_times, 'ro-', label='Response Time (s)')
                
                ax4.set_xticks(range(len(models)))
                ax4.set_xticklabels(models, rotation=45, ha='right')
                ax4.set_title('Ефективність моделей')
                ax4.set_ylabel('Success Rate (%)', color='blue')
                ax4_twin.set_ylabel('Response Time (s)', color='red')
                
                ax4.legend(loc='upper left')
                ax4_twin.legend(loc='upper right')
            
            plt.tight_layout()
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            print(f"📊 Візуальний звіт збережено: {save_path}")
            
        except ImportError:
            print("❌ matplotlib не встановлено. Візуальний звіт недоступний.")
        except Exception as e:
            print(f"❌ Помилка генерації візуального звіту: {e}")

def main():
    """Демонстрація системи аналізу використання моделей"""
    analytics = ModelUsageAnalytics()
    
    print("📊 PREDATOR ANALYTICS - MODEL USAGE ANALYTICS")
    print("=" * 60)
    
    # Симуляція використання різних моделей
    test_scenarios = [
        ("deepseek/deepseek-r1", "AnomalyAgent", "anomaly_detection", True, 2.5, 95.0),
        ("openai/gpt-4o-mini", "DatasetAgent", "data_processing", True, 1.2, 88.0),
        ("microsoft/phi-4-reasoning", "SecurityAgent", "threat_analysis", True, 3.1, 92.0),
        ("mistral-ai/mistral-large-2411", "ForecastAgent", "prediction", True, 4.2, 97.0),
        ("meta/meta-llama-3.1-405b-instruct", "CoreOrchestrator", "coordination", True, 5.8, 98.0),
        ("openai/o1", "ArbiterAgent", "decision_making", True, 3.8, 96.0),
        ("cohere/cohere-command-r-plus-08-2024", "OSINTAgent", "information_gathering", False, 6.2, 75.0),
        ("microsoft/phi-3.5-vision-instruct", "OSINTAgent", "image_analysis", True, 2.8, 91.0),
        ("xai/grok-3", "RedTeamAgent", "penetration_testing", True, 4.5, 89.0),
        ("deepseek/deepseek-v3-0324", "AnomalyAgent", "pattern_analysis", True, 2.1, 93.0),
    ]
    
    print("🔄 Симуляція використання моделей...")
    for scenario in test_scenarios:
        analytics.log_model_usage(*scenario)
        time.sleep(0.1)  # Симуляція часової затримки
    
    # Генерація звіту
    report = analytics.generate_comprehensive_report()
    
    print("\n📋 АНАЛІТИЧНИЙ ЗВІТ:")
    print(f"   📊 Загальна статистика:")
    for key, value in report['summary'].items():
        print(f"      • {key}: {value}")
    
    print(f"\n🏆 Топ-5 моделей за використанням:")
    for i, (model, count) in enumerate(report['top_models'], 1):
        print(f"   {i}. {model}: {count} запитів")
    
    print(f"\n⚡ Найефективніші моделі:")
    for i, (model, efficiency, response_time) in enumerate(report['most_efficient'], 1):
        print(f"   {i}. {model}: {efficiency:.1f}% success, {response_time:.1f}s avg")
    
    print(f"\n🤖 Аналіз агентів:")
    for agent, stats in report['agent_analysis'].items():
        print(f"   • {agent}: {stats['total_requests']} запитів, "
              f"улюблена модель: {stats['favorite_model'].split('/')[-1]}")
    
    print(f"\n💡 Рекомендації:")
    for i, recommendation in enumerate(report['recommendations'], 1):
        print(f"   {i}. {recommendation}")
    
    # Спроба генерації візуального звіту
    analytics.generate_visual_report()
    
    print(f"\n✅ Аналіз використання 58 моделей завершено!")
    print(f"📁 Дані збережено у: {analytics.log_file}")

if __name__ == "__main__":
    main()
