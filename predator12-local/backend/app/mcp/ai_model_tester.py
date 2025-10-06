#!/usr/bin/env python3
"""
🧪 Система автоматичного тестування AI моделей з промптами
Використовує промпти з test_prompts.txt для тестування всіх доступних моделей
"""

import os
import sys
import json
import time
import requests
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple

class AIModelTester:
    def __init__(self, workspace_path: str = "/Users/dima/Documents/NIMDA/codespaces-models"):
        self.workspace = Path(workspace_path)
        self.base_url = "http://localhost:4000/v1"  # Основний API
        self.backup_url = "http://localhost:3010/v1"  # Резервний API
        self.current_api = None
        self.test_results = []
        self.working_models = []
        self.failed_models = []
        
    def run_comprehensive_tests(self) -> Dict:
        """Запуск комплексних тестів всіх моделей"""
        print("🧪 Система автоматичного тестування AI моделей")
        print("=" * 60)
        
        start_time = time.time()
        
        # 1. Підключення до API
        if not self.connect_to_api():
            print("❌ Не вдалося підключитися до API")
            return {'error': 'API недоступний'}
        
        # 2. Завантаження промптів
        test_prompts = self.load_test_prompts()
        if not test_prompts:
            print("❌ Не вдалося завантажити тестові промпти")
            return {'error': 'Промпти недоступні'}
        
        # 3. Отримання списку моделей
        available_models = self.get_available_models()
        if not available_models:
            print("❌ Не вдалося отримати список моделей")
            return {'error': 'Моделі недоступні'}
        
        print(f"📋 Знайдено {len(available_models)} моделей")
        print(f"📝 Завантажено {len(test_prompts)} тестових промптів")
        print(f"🔗 Використовується API: {self.current_api}")
        
        # 4. Тестування моделей
        self.test_all_models(available_models, test_prompts)
        
        # 5. Генерація звіту
        duration = time.time() - start_time
        return self.generate_test_report(duration, len(available_models), len(test_prompts))
        
    def connect_to_api(self) -> bool:
        """Підключення до API"""
        print("🔌 Підключення до AI API...")
        
        apis_to_try = [
            (self.base_url, "Основний API (4000)"),
            (self.backup_url, "Резервний API (3010)")
        ]
        
        for api_url, name in apis_to_try:
            try:
                response = requests.get(f"{api_url}/models", timeout=10)
                if response.status_code == 200:
                    self.current_api = api_url
                    print(f"   ✅ {name}: підключено")
                    return True
                else:
                    print(f"   ❌ {name}: HTTP {response.status_code}")
            except Exception as e:
                print(f"   ❌ {name}: {type(e).__name__}")
        
        return False
        
    def load_test_prompts(self) -> List[str]:
        """Завантаження тестових промптів"""
        print("📝 Завантаження тестових промптів...")
        
        prompts_file = self.workspace / 'test_prompts.txt'
        
        if not prompts_file.exists():
            print("   ⚠️ test_prompts.txt не знайдено, використовуємо базові промпти")
            return self.get_default_prompts()
        
        try:
            with open(prompts_file, 'r', encoding='utf-8') as f:
                prompts = [line.strip() for line in f.readlines() if line.strip()]
            
            print(f"   ✅ Завантажено {len(prompts)} промптів з файлу")
            return prompts
            
        except Exception as e:
            print(f"   ❌ Помилка читання файлу: {e}")
            return self.get_default_prompts()
            
    def get_default_prompts(self) -> List[str]:
        """Базові промпти для тестування"""
        return [
            "Привіт! Як справи?",
            "Розкажи анекдот",
            "Що таке штучний інтелект?", 
            "Напиши код на Python для Hello World",
            "Дай пораду по програмуванню",
            "Яка столиця України?",
            "Поясни квантову фізику простими словами",
            "Створи план вивчення Python за місяць"
        ]
        
    def get_available_models(self) -> List[str]:
        """Отримання списку доступних моделей"""
        print("🤖 Отримання списку моделей...")
        
        try:
            response = requests.get(f"{self.current_api}/models", timeout=15)
            if response.status_code == 200:
                data = response.json()
                models = [model['id'] for model in data.get('data', [])]
                print(f"   ✅ Отримано {len(models)} моделей")
                return models
            else:
                print(f"   ❌ Помилка API: HTTP {response.status_code}")
                return []
                
        except Exception as e:
            print(f"   ❌ Помилка запиту моделей: {e}")
            return []
            
    def test_all_models(self, models: List[str], prompts: List[str]):
        """Тестування всіх моделей з усіма промптами"""
        print(f"\n🧪 Початок тестування {len(models)} моделей...")
        print("-" * 60)
        
        total_tests = len(models) * len(prompts)
        current_test = 0
        
        for i, model in enumerate(models, 1):
            print(f"\n🔍 [{i}/{len(models)}] Тестування моделі: {model}")
            
            model_results = {
                'model': model,
                'tests': [],
                'success_rate': 0,
                'avg_response_time': 0,
                'total_tokens': 0,
                'errors': []
            }
            
            successful_tests = 0
            total_time = 0
            total_tokens = 0
            
            for j, prompt in enumerate(prompts, 1):
                current_test += 1
                progress = (current_test / total_tests) * 100
                
                print(f"   📝 [{j}/{len(prompts)}] Промпт: {prompt[:50]}{'...' if len(prompt) > 50 else ''}")
                
                # Тестування промпту з моделлю
                test_result = self.test_single_prompt(model, prompt)
                model_results['tests'].append(test_result)
                
                if test_result['success']:
                    successful_tests += 1
                    total_time += test_result['response_time']
                    total_tokens += test_result.get('tokens', 0)
                    print(f"   ✅ Успішно ({test_result['response_time']:.1f}s, {test_result.get('tokens', 0)} токенів)")
                else:
                    model_results['errors'].append(test_result['error'])
                    print(f"   ❌ Помилка: {test_result['error'][:100]}")
                
                # Прогрес
                if current_test % 5 == 0:
                    print(f"   📊 Прогрес: {progress:.1f}% ({current_test}/{total_tests})")
                
                time.sleep(1)  # Пауза між запитами
            
            # Підрахунок статистики для моделі
            model_results['success_rate'] = (successful_tests / len(prompts)) * 100
            if successful_tests > 0:
                model_results['avg_response_time'] = total_time / successful_tests
                model_results['total_tokens'] = total_tokens
            
            self.test_results.append(model_results)
            
            # Класифікація моделі
            if model_results['success_rate'] >= 80:
                self.working_models.append(model)
                print(f"   🟢 Модель працює відмінно ({model_results['success_rate']:.1f}%)")
            elif model_results['success_rate'] >= 50:
                print(f"   🟡 Модель працює з проблемами ({model_results['success_rate']:.1f}%)")
            else:
                self.failed_models.append(model)
                print(f"   🔴 Модель не працює ({model_results['success_rate']:.1f}%)")
                
    def test_single_prompt(self, model: str, prompt: str) -> Dict:
        """Тестування одного промпту з однією моделлю"""
        start_time = time.time()
        
        try:
            response = requests.post(
                f"{self.current_api}/chat/completions",
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 200,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('choices') and len(data['choices']) > 0:
                    content = data['choices'][0].get('message', {}).get('content', '')
                    tokens = data.get('usage', {}).get('total_tokens', 0)
                    
                    return {
                        'success': True,
                        'prompt': prompt,
                        'response': content[:200],  # Перші 200 символів
                        'response_time': response_time,
                        'tokens': tokens,
                        'status_code': response.status_code
                    }
                else:
                    return {
                        'success': False,
                        'prompt': prompt,
                        'error': 'Немає відповіді в choices',
                        'response_time': response_time,
                        'status_code': response.status_code
                    }
            else:
                return {
                    'success': False,
                    'prompt': prompt,
                    'error': f'HTTP {response.status_code}: {response.text[:200]}',
                    'response_time': response_time,
                    'status_code': response.status_code
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'prompt': prompt,
                'error': 'Таймаут запиту (30s)',
                'response_time': time.time() - start_time
            }
        except Exception as e:
            return {
                'success': False,
                'prompt': prompt,
                'error': f'{type(e).__name__}: {str(e)[:200]}',
                'response_time': time.time() - start_time
            }
            
    def generate_test_report(self, duration: float, total_models: int, total_prompts: int) -> Dict:
        """Генерація звіту тестування"""
        print("\n" + "=" * 60)
        print("📊 ЗВІТ ТЕСТУВАННЯ AI МОДЕЛЕЙ")
        print("=" * 60)
        
        # Підрахунок загальної статистики
        total_tests = len(self.test_results) * total_prompts if self.test_results else 0
        successful_tests = sum(
            len([t for t in model['tests'] if t['success']]) 
            for model in self.test_results
        )
        
        overall_success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Найкращі та найгірші моделі
        if self.test_results:
            sorted_models = sorted(self.test_results, key=lambda x: x['success_rate'], reverse=True)
            best_models = sorted_models[:5]
            worst_models = sorted_models[-5:]
        else:
            best_models = worst_models = []
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'test_duration': round(duration, 2),
            'api_used': self.current_api,
            'summary': {
                'total_models_tested': len(self.test_results),
                'total_prompts': total_prompts,
                'total_tests_run': total_tests,
                'successful_tests': successful_tests,
                'overall_success_rate': round(overall_success_rate, 2),
                'working_models': len(self.working_models),
                'failed_models': len(self.failed_models)
            },
            'best_models': [
                {
                    'model': m['model'],
                    'success_rate': round(m['success_rate'], 1),
                    'avg_response_time': round(m['avg_response_time'], 2),
                    'total_tokens': m['total_tokens']
                }
                for m in best_models
            ],
            'worst_models': [
                {
                    'model': m['model'], 
                    'success_rate': round(m['success_rate'], 1),
                    'main_errors': m['errors'][:3]  # Перші 3 помилки
                }
                for m in worst_models
            ],
            'working_models': self.working_models,
            'failed_models': self.failed_models,
            'detailed_results': self.test_results
        }
        
        # Виведення звіту
        print(f"⏱️ Тривалість тестування: {duration:.1f} секунд")
        print(f"🎯 Загальний успіх: {overall_success_rate:.1f}%")
        print(f"🤖 Протестовано моделей: {len(self.test_results)}")
        print(f"📝 Використано промптів: {total_prompts}")
        print(f"🧪 Всього тестів: {total_tests}")
        print(f"✅ Успішних тестів: {successful_tests}")
        
        print(f"\n🟢 Робочі моделі ({len(self.working_models)}):")
        for model in self.working_models[:10]:  # Перші 10
            model_data = next((m for m in self.test_results if m['model'] == model), {})
            success_rate = model_data.get('success_rate', 0)
            avg_time = model_data.get('avg_response_time', 0)
            print(f"   ✅ {model} ({success_rate:.1f}%, {avg_time:.1f}s)")
        
        if len(self.working_models) > 10:
            print(f"   ... та ще {len(self.working_models) - 10} моделей")
        
        if self.failed_models:
            print(f"\n🔴 Проблемні моделі ({len(self.failed_models)}):")
            for model in self.failed_models[:5]:  # Перші 5
                model_data = next((m for m in self.test_results if m['model'] == model), {})
                success_rate = model_data.get('success_rate', 0)
                print(f"   ❌ {model} ({success_rate:.1f}%)")
        
        print(f"\n🏆 ТОП-5 НАЙКРАЩИХ МОДЕЛЕЙ:")
        for i, model in enumerate(best_models, 1):
            print(f"   {i}. {model['model']}")
            print(f"      📊 Успішність: {model['success_rate']:.1f}%")
            print(f"      ⚡ Швидкість: {model['avg_response_time']:.2f}s")
            print(f"      🔤 Токенів: {model['total_tokens']}")
        
        # Збереження звіту
        report_file = self.workspace / f'ai_models_test_report_{int(time.time())}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Збереження списку робочих моделей
        working_models_file = self.workspace / 'working_models_list.txt'
        with open(working_models_file, 'w', encoding='utf-8') as f:
            f.write("# Список робочих AI моделей\n")
            f.write(f"# Тестування: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"# Успішність >= 80%\n\n")
            for model in self.working_models:
                model_data = next((m for m in self.test_results if m['model'] == model), {})
                f.write(f"{model} # {model_data.get('success_rate', 0):.1f}%\n")
        
        print(f"\n📄 Детальний звіт: {report_file}")
        print(f"📋 Список робочих моделей: {working_models_file}")
        
        print(f"\n🚀 Рекомендовані команди:")
        if self.working_models:
            print(f"   # Тестування найкращої моделі")
            print(f"   curl -X POST {self.current_api}/chat/completions \\")
            print(f"     -H 'Content-Type: application/json' \\")
            print(f"     -d '{{\"model\":\"{self.working_models[0]}\",\"messages\":[{{\"role\":\"user\",\"content\":\"Привіт!\"}}]}}'")
        
        return report

def main():
    """Головна функція"""
    print("🧪 Система автоматичного тестування AI моделей")
    print("🎯 Тестує всі доступні моделі з промптами з test_prompts.txt")
    
    tester = AIModelTester()
    
    try:
        report = tester.run_comprehensive_tests()
        
        if 'error' in report:
            print(f"❌ Помилка тестування: {report['error']}")
            return 1
        
        success_rate = report['summary']['overall_success_rate']
        if success_rate >= 70:
            print(f"\n🎉 Тестування завершено успішно! Система працює добре.")
            return 0
        elif success_rate >= 40:
            print(f"\n⚠️ Тестування завершено з застереженнями. Частина моделей має проблеми.")
            return 1
        else:
            print(f"\n❌ Тестування виявило серйозні проблеми з більшістю моделей.")
            return 2
            
    except KeyboardInterrupt:
        print(f"\n👋 Тестування перервано користувачем")
        return 1
    except Exception as e:
        print(f"\n❌ Критична помилка: {e}")
        return 2

if __name__ == "__main__":
    sys.exit(main())
