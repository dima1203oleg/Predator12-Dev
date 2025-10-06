#!/usr/bin/env python3
"""
Скрипт перевірки пропущених важливих файлів з вихідних папок AAPredator8.0 та codespaces-models
"""
import os
from pathlib import Path

def get_important_files() -> dict:
    """Список важливих файлів, які могли залишитись у вихідних папках"""
    return {
        'AAPredator8.0': {
            'configs': [
                'requirements.txt', '.env.example', 'docker-compose.yml',
                'Makefile', '.vscode/settings.json', '.devcontainer/devcontainer.json'
            ],
            'etl_scripts': [
                'test_complete_etl.py', 'test_customs_parser.py', 'test_simple_parser.py',
                'test_etl_quick.py', 'check_excel_parser.py'
            ],
            'test_data': [
                'test_data/sample_customs.csv', 'test_data/generate_test_data.py'
            ],
            'etl_templates': [
                'etl-parsing/pandas-pipelines/customs_registry_full_auto_etl.py',
                'etl-parsing/pandas-pipelines/customs_registry_etl_template.py'
            ],
            'docs': [
                'README.md', 'FINAL_STATUS.txt', 'DEPLOYMENT_CHECKLIST.md',
                'PRODUCTION_READINESS_REPORT.md', 'SYSTEM_STATUS_REPORT.md'
            ],
            'shell_scripts': [
                'start_services.sh', 'stop_services.sh', 'check_status.sh',
                'test_alerts.sh', 'start-webapp.sh'
            ]
        },
        'codespaces-models': {
            'server': ['server.js', 'package.json'],
            'ai_tools': [
                'advanced_ai_bot.py', 'ai_integration_hub.py', 'ai_model_tester.py',
                'model-helper.mjs', 'model-limits-utils.mjs'
            ],
            'web_ui': ['public/modern.html', 'public/simple.html'],
            'scripts': [
                'scripts/discover_all_models.mjs', 'scripts/test_models.mjs',
                'scripts/query_models.py', 'scripts/list_models.mjs'
            ],
            'docs': [
                'README.md', 'PRODUCTION_GUIDE.md', 'ALL_MODELS_FIXED.md',
                'MODEL_DISCOVERY_REPORT.md', 'TOOLS.md'
            ],
            'configs': [
                'ecosystem.config.js', '.env.example', 'model-config.json'
            ]
        }
    }

def check_file_exists_in_new_structure(file_path: str, base_path: Path) -> bool:
    """Перевіряє, чи існує файл у новій структурі проекту"""
    # Можливі місця розташування файлів у новій структурі
    possible_locations = [
        base_path / file_path,                    # Пряме розташування
        base_path / 'backend/app' / file_path,    # В backend
        base_path / 'backend/app/mcp' / file_path,# В MCP
        base_path / 'etl' / file_path,           # В ETL
        base_path / 'scripts' / file_path,       # В scripts
        base_path / 'docs' / file_path,          # В docs
        base_path / 'frontend' / file_path,      # В frontend
        base_path / 'tests' / file_path,         # В tests
        base_path / 'ml' / file_path,            # В ML
        base_path / Path(file_path).name,        # Тільки ім'я файлу в корені
    ]
    
    # Також шукаємо файли з схожими іменами
    file_name = Path(file_path).name
    for location in possible_locations:
        if location.exists():
            return True
    
    # Пошук по всьому проекту
    for root, dirs, files in os.walk(base_path):
        if file_name in files:
            return True
    
    return False

def main():
    """Основна функція перевірки"""
    base_path = Path(__file__).parent.parent
    source_paths = {
        'AAPredator8.0': base_path / 'AAPredator8.0',
        'codespaces-models': base_path / 'codespaces-models'
    }
    
    important_files = get_important_files()
    missing_files = []
    
    print("🔍 Перевірка пропущених важливих файлів...")
    print("=" * 60)
    
    for source_name, source_path in source_paths.items():
        if not source_path.exists():
            print(f"⚠️  Папка {source_name} не існує - можливо, вже видалена")
            continue
            
        print(f"\n📁 Перевірка {source_name}:")
        
        for category, files in important_files[source_name].items():
            print(f"\n  📂 {category.upper()}:")
            
            for file_path in files:
                full_source_path = source_path / file_path
                
                if full_source_path.exists():
                    # Файл існує у вихідній папці, перевіряємо чи є в новій структурі
                    if check_file_exists_in_new_structure(file_path, base_path):
                        print(f"    ✅ {file_path} - перенесено")
                    else:
                        print(f"    ❌ {file_path} - НЕ ПЕРЕНЕСЕНО!")
                        missing_files.append((source_name, file_path, full_source_path))
                else:
                    print(f"    ➖ {file_path} - відсутній у вихідній папці")
    
    # Підсумок
    print("\n" + "=" * 60)
    if missing_files:
        print(f"⚠️  ЗНАЙДЕНО {len(missing_files)} ВАЖЛИВИХ ФАЙЛІВ, ЯКІ НЕ БУЛИ ПЕРЕНЕСЕНІ:")
        print("\nРекомендації:")
        
        for source, file_path, full_path in missing_files:
            print(f"\n📋 {source}/{file_path}:")
            
            # Аналіз типу файлу та рекомендації
            if file_path.endswith('.py'):
                if 'test_' in file_path:
                    print("  → Скопіювати до: tests/legacy/")
                elif 'etl' in file_path.lower():
                    print("  → Скопіювати до: etl/legacy/")
                else:
                    print("  → Скопіювати до: scripts/legacy/")
            elif file_path.endswith(('.md', '.txt')):
                print("  → Скопіювати до: docs/legacy/")
            elif file_path.endswith(('.sh', '.js', '.mjs')):
                print("  → Скопіювати до: scripts/legacy/")
            elif 'config' in file_path.lower() or file_path.endswith('.json'):
                print("  → Скопіювати до: config/legacy/")
            else:
                print("  → Скопіювати до: misc/legacy/")
                
            print(f"  📂 Повний шлях: {full_path}")
        
        print("\n🔧 Команда для швидкого копіювання:")
        print("mkdir -p docs/legacy etl/legacy scripts/legacy config/legacy tests/legacy misc/legacy")
        
    else:
        print("✅ ВСІ ВАЖЛИВІ ФАЙЛИ БУЛИ УСПІШНО ПЕРЕНЕСЕНІ!")
        print("\n🗑️  Вихідні папки можна безпечно видалити:")
        print("rm -rf AAPredator8.0/ codespaces-models/")
    
    print("\n📊 Статистика:")
    print(f"  • Перевірено папок: {len([p for p in source_paths.values() if p.exists()])}")
    total_expected_files = sum(
        len(file_list)
        for source_categories in important_files.values()
        for file_list in source_categories.values()
    )
    print(f"  • Всього файлів для перевірки: {total_expected_files}")
    print(f"  • Не перенесено: {len(missing_files)}")

if __name__ == '__main__':
    main()
