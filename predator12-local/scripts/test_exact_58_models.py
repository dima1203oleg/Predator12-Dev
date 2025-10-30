#!/usr/bin/env python3
"""
🧪 ТЕСТУВАННЯ ВСІХ 58 МОДЕЛЕЙ З INTELLIGENT_MODEL_DISTRIBUTION
Використовує тільки ті моделі що надані в оригінальному файлі
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, Tuple

import aiohttp

# Налаштування логування
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# ТОЧНО ТІ САМІ 58 МОДЕЛЕЙ З INTELLIGENT_MODEL_DISTRIBUTION.PY
EXACT_MODELS = [
    # TIER 1: НАЙПОТУЖНІШІ МОДЕЛІ (8 моделей)
    "deepseek/deepseek-r1",
    "meta/meta-llama-3.3-70b-instruct",
    "openai/gpt-4o-2024-11-20",
    "microsoft/phi-4",
    "qwen/qwen2.5-72b-instruct",
    "mistral/mixtral-8x22b-instruct",
    "openai/o1-preview-2024-09-12",
    "xai/grok-2-1212",
    # TIER 2: ВИСОКОПРОДУКТИВНІ (12 моделей)
    "meta/meta-llama-3.2-90b-vision-instruct",
    "deepseek/deepseek-v3",
    "openai/gpt-4o-mini-2024-07-18",
    "microsoft/phi-3-medium-128k-instruct",
    "qwen/qwen2.5-32b-instruct",
    "mistral/mistral-large-2411",
    "cohere/command-r-plus-08-2024",
    "meta/meta-llama-3.2-11b-vision-instruct",
    "openai/o1-mini-2024-09-12",
    "microsoft/phi-3-vision-128k-instruct",
    "deepseek/deepseek-coder-v2-lite",
    "ai21/ai21-jamba-1-5-large",
    # TIER 3: СПЕЦІАЛІЗОВАНІ (20 моделей)
    "meta/meta-llama-3.2-3b-instruct",
    "meta/meta-llama-3.2-1b-instruct",
    "microsoft/phi-3-small-128k-instruct",
    "microsoft/phi-3-small-8k-instruct",
    "microsoft/phi-3-mini-128k-instruct",
    "microsoft/phi-3-mini-4k-instruct",
    "qwen/qwen2.5-14b-instruct",
    "qwen/qwen2.5-7b-instruct",
    "qwen/qwen2.5-3b-instruct",
    "qwen/qwen2.5-1.5b-instruct",
    "qwen/qwen2.5-0.5b-instruct",
    "mistral/ministral-8b-2410",
    "mistral/ministral-3b-2410",
    "cohere/command-r-08-2024",
    "cohere/command-r7b-12-2024",
    "deepseek/deepseek-coder-v2",
    "ai21/ai21-jamba-1-5-mini",
    "core42/jais-30b-chat",
    "xai/grok-2-vision-1212",
    "meta/meta-llama-3.1-8b-instruct",
    # TIER 4: ШВИДКІ/ЛЕГКІ (18 моделей)
    "meta/meta-llama-3.1-70b-instruct",
    "meta/meta-llama-3.1-405b-instruct",
    "openai/gpt-4-turbo-2024-04-09",
    "openai/gpt-4-0613",
    "openai/gpt-4-0125-preview",
    "openai/gpt-3.5-turbo-0125",
    "openai/gpt-3.5-turbo-1106",
    "openai/chatgpt-4o-latest",
    "openai/gpt-4o-2024-08-06",
    "openai/gpt-4o-2024-05-13",
    "openai/o2-2024-12-17",
    "openai/o3-mini-2024-12-17",
    "openai/o4-2024-12-17",
    "mistral/mistral-nemo-2407",
    "mistral/codestral-2405",
    "cohere/command-light",
    "cohere/embed-english-v3.0",
    "cohere/embed-multilingual-v3.0",
]

# API ENDPOINTS для перевірки
API_ENDPOINTS = [
    "http://localhost:3010/v1/chat/completions",
    "http://localhost:3011/v1/chat/completions",
    "http://localhost:8000/v1/chat/completions",
]


class ExactModelTester:
    def __init__(self):
        self.results = {
            "tested_at": datetime.now().isoformat(),
            "total_models": len(EXACT_MODELS),
            "working_models": [],
            "failed_models": [],
            "test_details": {},
        }

    async def test_single_model(
        self, session: aiohttp.ClientSession, model: str
    ) -> Tuple[bool, str]:
        """Тестує одну модель на всіх доступних endpoints"""

        test_payload = {
            "model": model,
            "messages": [{"role": "user", "content": "Say 'OK' if working"}],
            "max_tokens": 5,
            "temperature": 0,
        }

        for endpoint in API_ENDPOINTS:
            try:
                async with session.post(
                    endpoint,
                    json=test_payload,
                    timeout=aiohttp.ClientTimeout(total=10),
                    headers={"Content-Type": "application/json"},
                ) as response:

                    if response.status == 200:
                        data = await response.json()
                        if "choices" in data and data["choices"]:
                            content = data["choices"][0].get("message", {}).get("content", "")
                            logging.info(f"✅ {model} ПРАЦЮЄ на {endpoint}")
                            return True, f"Working on {endpoint}: {content}"
                    else:
                        error_text = await response.text()
                        logging.warning(
                            f"⚠️ {model} помилка {response.status} на {endpoint}: {error_text[:100]}"
                        )

            except Exception as e:
                logging.warning(f"🔧 {model} exception на {endpoint}: {str(e)[:100]}")
                continue

        logging.error(f"❌ {model} НЕ ПРАЦЮЄ на жодному endpoint")
        return False, "Failed on all endpoints"

    async def test_all_models(self):
        """Тестує всі 58 моделей"""
        logging.info("🚀 Тестую всі 58 моделей з intelligent_model_distribution.py")

        async with aiohttp.ClientSession() as session:
            for i, model in enumerate(EXACT_MODELS, 1):
                print(f"[{i}/58] Тестую: {model}")

                success, message = await self.test_single_model(session, model)

                self.results["test_details"][model] = {
                    "success": success,
                    "message": message,
                    "tested_at": datetime.now().isoformat(),
                }

                if success:
                    self.results["working_models"].append(model)
                else:
                    self.results["failed_models"].append(model)

                # Пауза між тестами
                await asyncio.sleep(0.2)

        print(f"\n🏁 Тестування завершено!")
        print(f"✅ Працює: {len(self.results['working_models'])}/58")
        print(f"❌ Не працює: {len(self.results['failed_models'])}/58")

    def save_results(self):
        """Зберігає результати"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Детальний JSON звіт
        json_path = f"/Users/dima/Documents/Predator11/EXACT_MODELS_TEST_{timestamp}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)

        # Список працюючих моделей для використання
        working_path = f"/Users/dima/Documents/Predator11/WORKING_MODELS_{timestamp}.py"
        with open(working_path, "w", encoding="utf-8") as f:
            f.write("# ПРАЦЮЮЧІ МОДЕЛІ З ТЕСТУВАННЯ\n\n")
            f.write("WORKING_MODELS = [\n")
            for model in self.results["working_models"]:
                f.write(f'    "{model}",\n')
            f.write("]\n\n")
            f.write(f"# Всього працюючих: {len(self.results['working_models'])}\n")
            f.write(f"# Дата тестування: {self.results['tested_at']}\n")

        # Markdown звіт
        md_path = f"/Users/dima/Documents/Predator11/MODEL_TEST_RESULTS_{timestamp}.md"
        with open(md_path, "w", encoding="utf-8") as f:
            f.write("# 🧪 РЕЗУЛЬТАТИ ТЕСТУВАННЯ 58 МОДЕЛЕЙ\n\n")
            f.write(f"**Дата:** {self.results['tested_at']}\n")
            f.write(f"**Всього моделей:** 58\n")
            f.write(f"**Працює:** {len(self.results['working_models'])}\n")
            f.write(f"**Не працює:** {len(self.results['failed_models'])}\n\n")

            if self.results["working_models"]:
                f.write("## ✅ ПРАЦЮЮЧІ МОДЕЛІ\n\n")
                for model in self.results["working_models"]:
                    f.write(f"- `{model}`\n")
                f.write("\n")

            if self.results["failed_models"]:
                f.write("## ❌ НЕ ПРАЦЮЮЧІ МОДЕЛІ\n\n")
                for model in self.results["failed_models"]:
                    f.write(f"- `{model}`\n")

        print(f"\n📊 Звіти збережені:")
        print(f"  📄 JSON: {json_path}")
        print(f"  🐍 Python: {working_path}")
        print(f"  📋 Markdown: {md_path}")

        return json_path, working_path, md_path


async def main():
    print("🧪 ТЕСТУВАННЯ 58 МОДЕЛЕЙ З INTELLIGENT_MODEL_DISTRIBUTION")
    print("=" * 60)

    tester = ExactModelTester()

    try:
        await tester.test_all_models()
        json_path, working_path, md_path = tester.save_results()

        print(f"\n🎯 РЕЗУЛЬТАТ:")
        print(f"✅ Працюючих моделей: {len(tester.results['working_models'])}")
        print(f"❌ Не працюючих моделей: {len(tester.results['failed_models'])}")

        if len(tester.results["working_models"]) < 58:
            print(f"\n⚠️ УВАГА: {58 - len(tester.results['working_models'])} моделей не працюють!")
            print("🔧 Потрібно:")
            print("1. Перевірити конфігурацію серверів")
            print("2. Додати недоступні моделі до провайдерів")
            print("3. Оновити розподіл тільки з працюючими моделями")
        else:
            print("🎉 Всі моделі працюють відмінно!")

    except Exception as e:
        print(f"❌ Критична помилка: {e}")
        logging.error(f"Critical error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
