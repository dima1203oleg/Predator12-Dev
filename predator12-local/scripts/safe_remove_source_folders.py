#!/usr/bin/env python3
"""
Безпечне видалення вихідних папок AAPredator8.0 та codespaces-models після консолідації
"""
import os
import shutil
import sys
from pathlib import Path
from datetime import datetime

def create_backup_summary(source_path: Path, backup_path: Path):
    """Створює підсумок того, що було у вихідній папці перед видаленням"""
    summary = []
    summary.append(f"# Backup Summary for {source_path.name}")
    summary.append(f"Created: {datetime.now()}")
    summary.append(f"Original path: {source_path}")
    summary.append("")
    
    # Підрахунок файлів
    total_files = 0
    total_dirs = 0
    
    for root, dirs, files in os.walk(source_path):
        total_dirs += len(dirs)
        total_files += len(files)
        
        rel_root = Path(root).relative_to(source_path)
        if rel_root != Path('.'):
            summary.append(f"## {rel_root}/")
        else:
            summary.append("## Root files:")
            
        for file in files:
            file_path = Path(root) / file
            size = file_path.stat().st_size
            summary.append(f"  - {file} ({size:,} bytes)")
    
    summary.append("")
    summary.append(f"**Total**: {total_files} files, {total_dirs} directories")
    
    # Збереження summary
    summary_file = backup_path / f"{source_path.name}_summary.md"
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(summary))
    
    return summary_file

def safe_remove_source_folders():
    """Безпечно видаляє вихідні папки з можливістю створення backup"""
    base_path = Path(__file__).parent.parent
    
    source_folders = {
        'AAPredator8.0': base_path / 'AAPredator8.0',
        'codespaces-models': base_path / 'codespaces-models'
    }
    
    print("🗑️  Безпечне видалення вихідних папок")
    print("=" * 50)
    
    # Перевірка чи існують папки
    existing_folders = {name: path for name, path in source_folders.items() if path.exists()}
    
    if not existing_folders:
        print("ℹ️  Вихідні папки вже були видалені або не існують")
        return
    
    print(f"📋 Знайдено папки для видалення:")
    for name, path in existing_folders.items():
        size = sum(f.stat().st_size for f in path.rglob('*') if f.is_file())
        size_mb = size / (1024 * 1024)
        print(f"  • {name}: {size_mb:.1f} MB")
    
    # Питання про backup
    create_backup = input("\n❓ Створити backup перед видаленням? (y/N): ").lower().startswith('y')
    
    if create_backup:
        backup_base = base_path / "backup_before_deletion"
        backup_base.mkdir(exist_ok=True)
        
        print(f"\n📦 Створення backup в {backup_base}...")
        
        for name, source_path in existing_folders.items():
            backup_path = backup_base / name
            
            try:
                # Створення summary
                print(f"  📄 Створення summary для {name}...")
                summary_file = create_backup_summary(source_path, backup_base)
                
                # Копіюємо лише важливі файли (не node_modules, .venv тощо)
                print(f"  📂 Backup важливих файлів з {name}...")
                
                important_extensions = {'.py', '.js', '.mjs', '.json', '.yml', '.yaml', 
                                      '.md', '.txt', '.sh', '.env', '.example'}
                important_dirs = {'docs', 'scripts', 'config', 'templates'}
                
                backup_path.mkdir(exist_ok=True)
                
                for item in source_path.rglob('*'):
                    if item.is_file():
                        # Пропускаємо великі папки та файли
                        if any(skip in str(item) for skip in ['.venv', 'node_modules', '.git', '__pycache__', '.pytest_cache']):
                            continue
                            
                        # Берємо файли з важливими розширеннями або в важливих папках
                        if (item.suffix in important_extensions or 
                            any(important_dir in item.parts for important_dir in important_dirs)):
                            
                            rel_path = item.relative_to(source_path)
                            backup_item = backup_path / rel_path
                            backup_item.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(item, backup_item)
                
                print(f"  ✅ Backup {name} завершено")
                
            except Exception as e:
                print(f"  ❌ Помилка при створенні backup для {name}: {e}")
    
    # Фінальне підтвердження
    print(f"\n⚠️  УВАГА: Це назавжди видалить наступні папки:")
    for name, path in existing_folders.items():
        print(f"  • {path}")
    
    if create_backup:
        print(f"\n💾 Backup збережено в: {backup_base}")
    
    confirmation = input(f"\n❓ Ви впевнені, що хочете видалити ці папки? Введіть 'DELETE' для підтвердження: ")
    
    if confirmation != 'DELETE':
        print("❌ Операція скасована користувачем")
        return
    
    # Видалення папок
    print(f"\n🗑️  Видалення папок...")
    deleted_count = 0
    
    for name, path in existing_folders.items():
        try:
            print(f"  🗂️  Видаляю {name}...")
            shutil.rmtree(path)
            print(f"  ✅ {name} успішно видалено")
            deleted_count += 1
        except Exception as e:
            print(f"  ❌ Помилка при видаленні {name}: {e}")
    
    print(f"\n🎉 Операція завершена!")
    print(f"  • Видалено папок: {deleted_count}/{len(existing_folders)}")
    
    if create_backup:
        print(f"  • Backup зберігається в: {backup_base}")
        print(f"  • Ви можете видалити backup пізніше, коли переконаєтесь що все працює")
    
    # Рекомендації
    print(f"\n💡 Рекомендації:")
    print(f"  • Перевірте роботу системи: make test-system")
    print(f"  • Переконайтеся що всі сервіси працюють: make health-check")
    print(f"  • При необхідності backup можна відновити з {backup_base if create_backup else 'не створено'}")

def main():
    """Основна функція"""
    try:
        safe_remove_source_folders()
    except KeyboardInterrupt:
        print("\n❌ Операція перервана користувачем")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Непередбачена помилка: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
