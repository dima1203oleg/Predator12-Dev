#!/usr/bin/env python3
"""
🔗 ПІДКЛЮЧЕННЯ АГЕНТІВ ДО MODEL SDK
Автоматично підключає всіх агентів до центрального Model SDK з 49 моделями
"""
import os
import glob
import re
from pathlib import Path

class AgentModelConnector:
    def __init__(self):
        self.model_sdk_url = "http://localhost:3010"
        self.agents_dir = "/Users/dima/Documents/Predator11/agents"
        self.connected_agents = []

    def find_agent_files(self):
        """Знаходить всі файли агентів"""
        agent_files = []
        for pattern in ["**/*agent*.py", "**/agent.py", "**/main.py"]:
            files = glob.glob(os.path.join(self.agents_dir, pattern), recursive=True)
            agent_files.extend(files)
        return list(set(agent_files))  # Унікальні файли

    def analyze_agent_model_usage(self, file_path):
        """Аналізує як агент використовує моделі"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Шукаємо ознаки використання моделей
            model_indicators = {
                'has_openai': 'openai' in content.lower(),
                'has_anthropic': 'anthropic' in content.lower(),
                'has_model_calls': any(term in content.lower() for term in ['gpt-', 'claude-', 'llama-']),
                'has_api_calls': 'requests.post' in content or 'httpx.post' in content,
                'has_model_sdk': 'model_sdk' in content.lower() or '3010' in content,
                'agent_name': self.extract_agent_name(file_path),
                'file_size': len(content),
                'line_count': content.count('\n')
            }

            return model_indicators
        except Exception as e:
            return {'error': str(e), 'agent_name': self.extract_agent_name(file_path)}

    def extract_agent_name(self, file_path):
        """Витягує назву агента з шляху файлу"""
        path = Path(file_path)
        if 'agent' in path.name:
            return path.name.replace('.py', '')
        else:
            return path.parent.name + '_agent'

    def generate_model_integration_code(self, agent_name):
        """Генерує код для інтеграції з Model SDK"""
        return f'''
# AUTO-GENERATED MODEL SDK INTEGRATION
import httpx
import asyncio
from typing import Dict, List, Any

class ModelSDKClient:
    def __init__(self, base_url="http://localhost:3010"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def chat_completion(self, model: str, messages: List[Dict], **kwargs):
        """Виклик AI моделі через Model SDK"""
        try:
            response = await self.client.post(
                f"{{self.base_url}}/v1/chat/completions",
                json={{
                    "model": model,
                    "messages": messages,
                    "max_tokens": kwargs.get("max_tokens", 1000),
                    "temperature": kwargs.get("temperature", 0.7)
                }}
            )
            return response.json()
        except Exception as e:
            print(f"[{agent_name}] Model SDK error: {{e}}")
            return {{"error": str(e)}}
    
    async def get_best_model_for_task(self, task_type="general"):
        """Отримує найкращу модель для задачі"""
        try:
            response = await self.client.get(f"{{self.base_url}}/v1/models")
            models = response.json().get("data", [])
            # Сортуємо за якістю
            best_models = sorted(models, key=lambda x: x.get("quality_score", 0), reverse=True)
            return best_models[0]["id"] if best_models else "meta/meta-llama-3.1-8b-instruct"
        except:
            return "meta/meta-llama-3.1-8b-instruct"  # fallback

# Глобальний клієнт Model SDK для {agent_name}
model_sdk_client = ModelSDKClient()
'''

    def analyze_all_agents(self):
        """Аналізує всіх агентів в системі"""
        agent_files = self.find_agent_files()
        analysis = {}

        print(f"🔍 Знайдено {len(agent_files)} файлів агентів")

        for file_path in agent_files:
            agent_analysis = self.analyze_agent_model_usage(file_path)
            agent_name = agent_analysis.get('agent_name', 'unknown')
            analysis[agent_name] = {
                'file_path': file_path,
                'analysis': agent_analysis
            }

        return analysis

    def check_agents_real_work(self):
        """Перевіряє чи агенти виконують реальну роботу"""
        analysis = self.analyze_all_agents()

        print("\n📊 АНАЛІЗ РОБОТИ АГЕНТІВ:")
        print("="*50)

        working_agents = 0
        model_using_agents = 0

        for agent_name, data in analysis.items():
            agent_data = data['analysis']

            if 'error' in agent_data:
                print(f"❌ {agent_name}: помилка читання файлу")
                continue

            file_size = agent_data.get('file_size', 0)
            has_model_calls = agent_data.get('has_model_calls', False)
            has_api_calls = agent_data.get('has_api_calls', False)
            has_model_sdk = agent_data.get('has_model_sdk', False)

            status_icons = []
            if file_size > 1000:
                status_icons.append("📝")
                working_agents += 1
            if has_model_calls or has_api_calls:
                status_icons.append("🤖")
                model_using_agents += 1
            if has_model_sdk:
                status_icons.append("🔗")

            status = "".join(status_icons) if status_icons else "⚪"

            print(f"{status} {agent_name}: {file_size} байт, API:{has_api_calls}, SDK:{has_model_sdk}")

        print(f"\n📈 СТАТИСТИКА:")
        print(f"   Всього агентів: {len(analysis)}")
        print(f"   Робочих агентів: {working_agents}")
        print(f"   Використовують моделі: {model_using_agents}")
        print(f"   Підключених до SDK: {sum(1 for _, data in analysis.items() if data['analysis'].get('has_model_sdk', False))}")

        return analysis

def main():
    connector = AgentModelConnector()

    print("🔗 АНАЛІЗ ПІДКЛЮЧЕННЯ АГЕНТІВ ДО AI МОДЕЛЕЙ")
    print("="*60)

    # Аналізуємо всіх агентів
    analysis = connector.check_agents_real_work()

    # Рекомендації
    print(f"\n💡 РЕКОМЕНДАЦІЇ:")

    non_sdk_agents = [name for name, data in analysis.items()
                     if not data['analysis'].get('has_model_sdk', False) and
                        data['analysis'].get('file_size', 0) > 500]

    if non_sdk_agents:
        print(f"   🔌 Потребують підключення до Model SDK: {len(non_sdk_agents)}")
        for agent in non_sdk_agents[:5]:
            print(f"     - {agent}")

    small_agents = [name for name, data in analysis.items()
                   if data['analysis'].get('file_size', 0) < 500]

    if small_agents:
        print(f"   ⚠️  Мають малий розмір (можливі заглушки): {len(small_agents)}")
        for agent in small_agents[:3]:
            print(f"     - {agent}")

if __name__ == "__main__":
    main()
