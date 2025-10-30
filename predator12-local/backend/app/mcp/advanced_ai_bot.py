#!/usr/bin/env python3
"""
🤖 Advanced AI Chat Bot
Розширений чат-бот з підтримкою різних платформ
"""

import argparse
import asyncio
import json
import sys
import time
from datetime import datetime

import aiohttp


class AIBot:
    def __init__(self, base_url="http://localhost:4000"):
        self.base_url = base_url
        self.session = None
        self.current_model = "gpt-4o-mini"
        self.conversation_history = []
        self.stats = {
            "messages_sent": 0,
            "total_tokens": 0,
            "avg_response_time": 0,
            "errors": 0,
        }

    async def init_session(self):
        """Ініціалізація HTTP сесії"""
        self.session = aiohttp.ClientSession()

    async def close_session(self):
        """Закриття HTTP сесії"""
        if self.session:
            await self.session.close()

    async def get_models(self):
        """Отримання списку доступних моделей"""
        try:
            async with self.session.get(f"{self.base_url}/v1/models") as response:
                data = await response.json()
                return [model["id"] for model in data["data"]]
        except Exception as e:
            print(f"❌ Помилка отримання моделей: {e}")
            return []

    async def send_message(self, message, model=None, max_tokens=500, stream=False):
        """Відправка повідомлення до AI"""
        if not model:
            model = self.current_model

        start_time = time.time()

        try:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": message}],
                "max_tokens": max_tokens,
                "stream": stream,
            }

            # Додавання історії розмови (останні 10 повідомлень)
            if self.conversation_history:
                payload["messages"] = self.conversation_history[-10:] + payload["messages"]

            async with self.session.post(
                f"{self.base_url}/v1/chat/completions",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60),
            ) as response:

                if response.status == 200:
                    data = await response.json()
                    end_time = time.time()
                    response_time = end_time - start_time

                    # Отримання відповіді
                    ai_response = data["choices"][0]["message"]["content"]
                    tokens_used = data.get("usage", {}).get("total_tokens", 0)

                    # Оновлення статистики
                    self.stats["messages_sent"] += 1
                    self.stats["total_tokens"] += tokens_used
                    current_avg = self.stats["avg_response_time"]
                    total_messages = self.stats["messages_sent"]
                    self.stats["avg_response_time"] = (
                        current_avg * (total_messages - 1) + response_time
                    ) / total_messages

                    # Додавання до історії
                    self.conversation_history.extend(
                        [
                            {"role": "user", "content": message},
                            {"role": "assistant", "content": ai_response},
                        ]
                    )

                    return {
                        "success": True,
                        "response": ai_response,
                        "tokens_used": tokens_used,
                        "response_time": response_time,
                        "model": model,
                    }
                else:
                    error_text = await response.text()
                    self.stats["errors"] += 1
                    return {
                        "success": False,
                        "error": f"HTTP {response.status}: {error_text}",
                        "response_time": time.time() - start_time,
                    }

        except Exception as e:
            self.stats["errors"] += 1
            return {
                "success": False,
                "error": str(e),
                "response_time": time.time() - start_time,
            }

    def print_stats(self):
        """Виведення статистики"""
        print("\n" + "=" * 50)
        print("📊 СТАТИСТИКА РОЗМОВИ")
        print("=" * 50)
        print(f"💬 Повідомлень відправлено: {self.stats['messages_sent']}")
        print(f"🔢 Загальна кількість токенів: {self.stats['total_tokens']:,}")
        print(f"⚡ Середній час відповіді: {self.stats['avg_response_time']:.2f}с")
        print(f"❌ Помилки: {self.stats['errors']}")
        if self.stats["messages_sent"] > 0:
            print(
                f"✅ Успішність: {((self.stats['messages_sent'] - self.stats['errors']) / self.stats['messages_sent'] * 100):.1f}%"
            )
        print("=" * 50)

    async def interactive_chat(self):
        """Інтерактивний чат"""
        print("🤖 AI Bot - Інтерактивний чат")
        print("Команди: /models, /switch <model>, /stats, /clear, /help, /quit")
        print("-" * 50)

        models = await self.get_models()
        print(f"📋 Доступно моделей: {len(models)}")
        print(f"🎯 Поточна модель: {self.current_model}")
        print("-" * 50)

        while True:
            try:
                user_input = input("\n💬 Ви: ").strip()

                if not user_input:
                    continue

                # Обробка команд
                if user_input.startswith("/"):
                    command_parts = user_input.split()
                    command = command_parts[0].lower()

                    if command == "/quit":
                        print("👋 До побачення!")
                        break
                    elif command == "/models":
                        print("\n📋 Доступні моделі:")
                        for i, model in enumerate(models, 1):
                            current_marker = " ← поточна" if model == self.current_model else ""
                            print(f"  {i}. {model}{current_marker}")
                        continue
                    elif command == "/switch":
                        if len(command_parts) > 1:
                            new_model = " ".join(command_parts[1:])
                            if new_model in models:
                                self.current_model = new_model
                                print(f"✅ Модель змінена на: {new_model}")
                            else:
                                print(f"❌ Модель '{new_model}' не знайдена")
                        else:
                            print("❌ Використання: /switch <назва_моделі>")
                        continue
                    elif command == "/stats":
                        self.print_stats()
                        continue
                    elif command == "/clear":
                        self.conversation_history = []
                        print("✅ Історія розмови очищена")
                        continue
                    elif command == "/help":
                        print("\n🆘 Доступні команди:")
                        print("  /models - показати всі моделі")
                        print("  /switch <model> - змінити модель")
                        print("  /stats - показати статистику")
                        print("  /clear - очистити історію")
                        print("  /help - показати допомогу")
                        print("  /quit - вийти")
                        continue
                    else:
                        print("❌ Невідома команда. Використайте /help для допомоги")
                        continue

                # Відправка повідомлення
                print("🤔 Думаю...", end="", flush=True)
                result = await self.send_message(user_input)
                print("\r" + " " * 20 + "\r", end="", flush=True)

                if result["success"]:
                    print(f"🤖 AI ({result['model']}): {result['response']}")
                    print(f"📊 {result['tokens_used']} токенів | {result['response_time']:.2f}с")
                else:
                    print(f"❌ Помилка: {result['error']}")

            except KeyboardInterrupt:
                print("\n👋 До побачення!")
                break
            except Exception as e:
                print(f"\n❌ Несподівана помилка: {e}")

    async def batch_chat(self, messages, model=None):
        """Пакетна обробка повідомлень"""
        results = []

        print(f"🚀 Обробка {len(messages)} повідомлень...")

        for i, message in enumerate(messages, 1):
            print(f"📝 Обробка {i}/{len(messages)}: {message[:50]}...")

            result = await self.send_message(message, model)
            results.append({"message": message, "result": result})

            # Пауза між запитами
            if i < len(messages):
                await asyncio.sleep(1)

        return results

    async def benchmark_models(self, test_message="Привіт! Розкажи про себе"):
        """Бенчмарк всіх моделей"""
        models = await self.get_models()
        results = []

        print(f"🏁 Бенчмарк {len(models)} моделей...")
        print(f"📝 Тестове повідомлення: {test_message}")
        print("-" * 50)

        for i, model in enumerate(models, 1):
            print(f"🧪 Тестування {i}/{len(models)}: {model}...")

            result = await self.send_message(test_message, model, max_tokens=100)
            results.append(
                {
                    "model": model,
                    "success": result["success"],
                    "response_time": result.get("response_time", 0),
                    "tokens": result.get("tokens_used", 0),
                    "error": result.get("error", ""),
                }
            )

            if result["success"]:
                print(
                    f"  ✅ {result['response_time']:.2f}с | {result.get('tokens_used', 0)} токенів"
                )
            else:
                print(f"  ❌ {result.get('error', 'Невідома помилка')}")

            # Пауза між моделями
            await asyncio.sleep(2)

        return results


async def main():
    parser = argparse.ArgumentParser(description="Advanced AI Chat Bot")
    parser.add_argument(
        "--mode",
        choices=["chat", "batch", "benchmark"],
        default="chat",
        help="Режим роботи",
    )
    parser.add_argument("--model", help="Модель для використання")
    parser.add_argument("--url", default="http://localhost:4000", help="URL API сервера")
    parser.add_argument("--messages", nargs="+", help="Повідомлення для пакетної обробки")

    args = parser.parse_args()

    bot = AIBot(args.url)
    await bot.init_session()

    try:
        if args.model:
            models = await bot.get_models()
            if args.model in models:
                bot.current_model = args.model
            else:
                print(f"❌ Модель '{args.model}' не знайдена")
                return

        if args.mode == "chat":
            await bot.interactive_chat()
        elif args.mode == "batch":
            if args.messages:
                results = await bot.batch_chat(args.messages, args.model)
                print("\n📋 РЕЗУЛЬТАТИ ПАКЕТНОЇ ОБРОБКИ:")
                for i, result in enumerate(results, 1):
                    print(f"\n{i}. {result['message'][:50]}...")
                    if result["result"]["success"]:
                        print(f"   ✅ {result['result']['response'][:100]}...")
                    else:
                        print(f"   ❌ {result['result']['error']}")
            else:
                print("❌ Для пакетного режиму потрібні повідомлення (--messages)")
        elif args.mode == "benchmark":
            results = await bot.benchmark_models()

            # Статистика бенчмарку
            successful = [r for r in results if r["success"]]
            failed = [r for r in results if not r["success"]]

            print(f"\n🏆 РЕЗУЛЬТАТИ БЕНЧМАРКУ:")
            print(f"✅ Успішно: {len(successful)}")
            print(f"❌ Помилки: {len(failed)}")

            if successful:
                avg_time = sum(r["response_time"] for r in successful) / len(successful)
                avg_tokens = sum(r["tokens"] for r in successful) / len(successful)
                print(f"⚡ Середній час: {avg_time:.2f}с")
                print(f"🔢 Середня кількість токенів: {avg_tokens:.1f}")

                # Топ-3 найшвидших
                fastest = sorted(successful, key=lambda x: x["response_time"])[:3]
                print(f"\n🚀 Найшвидші моделі:")
                for i, result in enumerate(fastest, 1):
                    print(f"  {i}. {result['model']} - {result['response_time']:.2f}с")

        bot.print_stats()

    finally:
        await bot.close_session()


if __name__ == "__main__":
    print("🤖 Advanced AI Chat Bot")
    print("Використання:")
    print("  python3 advanced_ai_bot.py --mode chat")
    print("  python3 advanced_ai_bot.py --mode benchmark")
    print("  python3 advanced_ai_bot.py --mode batch --messages 'Привіт' 'Як справи?'")
    print()

    asyncio.run(main())
