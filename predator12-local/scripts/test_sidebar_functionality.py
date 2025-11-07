#!/usr/bin/env python3
"""
Скрипт для тестування функціональності бічного меню.
"""

import sys
from pathlib import Path

import requests


def test_frontend_availability():
    """Перевіряє доступність фронтенду."""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        return response.status_code == 200
    except requests.RequestException:
        return False


def check_module_components():
    """Перевіряє наявність компонентів модулів."""
    frontend_path = Path(__file__).parent.parent / "frontend" / "src" / "components" / "modules"

    required_modules = [
        "ETLModule.tsx",
        "ChronoModule.tsx",
        "SimulatorModule.tsx",
        "AnalyticsModule.tsx",
        "AdminModule.tsx",
        "OpenSearchModule.tsx",
    ]

    missing_modules = []
    for module in required_modules:
        module_path = frontend_path / module
        if not module_path.exists():
            missing_modules.append(module)

    return missing_modules


def check_nexus_core():
    """Перевіряє конфігурацію NexusCore."""
    nexus_core_path = (
        Path(__file__).parent.parent / "frontend" / "src" / "components" / "nexus" / "NexusCore.tsx"
    )

    if not nexus_core_path.exists():
        return False, "NexusCore.tsx не знайдено"

    content = nexus_core_path.read_text()

    # Перевіряємо наявність імпортів модулів
    expected_imports = [
        "import ETLModule",
        "import ChronoModule",
        "import SimulatorModule",
        "import AnalyticsModule",
        "AdminModule",  # named import
        "OpenSearchModule",  # named import
    ]

    missing_imports = []
    for imp in expected_imports:
        if imp not in content:
            missing_imports.append(imp)

    # Перевіряємо наявність використання модулів у renderModule
    module_cases = [
        "case 'etl':\n        return <ETLModule />",
        "case 'chrono':\n        return <ChronoModule />",
        "case 'simulator':\n        return <SimulatorModule />",
        "case 'opensearch':\n        return <OpenSearchModule />",
        "case 'admin':\n        return <AdminModule />",
    ]

    missing_cases = []
    for case in module_cases:
        if case not in content:
            missing_cases.append(case)

    return len(missing_imports) == 0 and len(missing_cases) == 0, {
        "missing_imports": missing_imports,
        "missing_cases": missing_cases,
    }


def main():
    print("🔍 Тестування функціональності бічного меню...")
    print("=" * 50)
    # 1. Перевірка компонентів модулів
    print("1️⃣ Перевірка наявності компонентів модулів...")
    missing_modules = check_module_components()
    if missing_modules:
        print(f"❌ Відсутні модулі: {', '.join(missing_modules)}")
        return 1
    print("✅ Всі необхідні компоненти модулів присутні")
    # 2. Перевірка конфігурації NexusCore
    print("\n2️⃣ Перевірка конфігурації NexusCore...")
    is_valid, details = check_nexus_core()
    if not is_valid:
        print(f"❌ Проблеми в NexusCore: {details}")
        if isinstance(details, dict):
            if details.get("missing_imports"):
                print(f"   Відсутні імпорти: {details['missing_imports']}")
            if details.get("missing_cases"):
                print(f"   Відсутні case блоки: {details['missing_cases']}")
        return 1
    print("✅ NexusCore правильно налаштовано")
    # 3. Перевірка доступності фронтенду
    print("\n3️⃣ Перевірка доступності фронтенду...")
    if test_frontend_availability():
        print("✅ Фронтенд доступний на http://localhost:3000")
    else:
        print("⚠️ Фронтенд недоступний на http://localhost:3000")
        print("   Запустіть фронтенд командою: npm start (в папці frontend)")
    print("\n🎉 Тест завершено!")
    print("📝 Результат: Всі модулі правильно підключені до бічного меню")
    print("💡 Тепер кнопки бічного меню повинні показувати реальний контент замість заглушок")
    return 0


if __name__ == "__main__":
    sys.exit(main())
