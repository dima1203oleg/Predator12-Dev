"""
FastAPI webhook-сервіс для Predator Telegram Bot.

Маршрути:
    POST /tg/webhook?token=...  — приймає оновлення Telegram.
    GET  /healthz              — перевірка стану сервісу.

Конфігурація через змінні середовища:
    TELEGRAM_BOT_TOKEN  — токен бота (обов'язково).
    WEBHOOK_SECRET      — короткий секрет для додаткового guard (за замовчуванням 'change-me').
"""

from __future__ import annotations

import os
from typing import Any

from aiogram import Bot, Dispatcher, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import Update
from fastapi import FastAPI, HTTPException, Request

# Завантаження змінних середовища з .env файлу
try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass  # python-dotenv не встановлено, продовжуємо без нього

# Імпорт агента для керування природною мовою
try:
    from agents.supervisor import ProductionSupervisor
    from backend.app.agents.handlers import NaturalLanguageController

    AGENT_AVAILABLE = True
except ImportError:
    AGENT_AVAILABLE = False
    NaturalLanguageController = None
    ProductionSupervisor = None

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN env variable is required")

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "change-me")

bot = Bot(BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()
app = FastAPI(title="Predator Telegram Webhook")

# Ініціалізація агента та supervisor
nl_controller = None
supervisor = None

if AGENT_AVAILABLE:
    try:
        supervisor = ProductionSupervisor()
        nl_controller = NaturalLanguageController("NaturalLanguageController")
        nl_controller.set_supervisor(supervisor)
    except Exception as e:
        print(f"Warning: Failed to initialize agent system: {e}")
        nl_controller = None
        supervisor = None


@dp.message(CommandStart())
async def handle_start(message: types.Message) -> None:
    welcome_text = """👋 <b>Predator 12 AI Assistant</b>

Я можу керувати системою природною мовою! Спробуйте:

• "статус системи" - перевірка стану
• "запустити агент AnalyticsAgent" - запуск агента
• "проаналізувати продажі" - аналіз даних
• "звіт про продуктивність" - генерація звіту
• "діагностика системи" - перевірка системи
• "оптимізувати базу даних" - оптимізація

Використовуйте /help для всіх команд."""
    await message.answer(welcome_text)


@dp.message(Command("help"))
async def handle_help(message: types.Message) -> None:
    help_text = """<b>🤖 Команди Predator AI Assistant:</b>

/status - стан системи
/upload - завантаження даних
/id - ваш chat ID

<b>🗣️ Природна мова:</b>
Просто напишіть команду українською або англійською:
• "як система працює?"
• "стоп агент SecurityAgent"
• "аналіз аномалій в даних"
• "згенерувати звіт по продажам"
• "діагностика продуктивності"
• "оптимізувати швидкість відповідей"

<b>⚡ Можливості:</b>
• Керування агентами
• Аналіз даних
• Генерація звітів
• Діагностика системи
• Оптимізація продуктивності"""
    await message.answer(help_text)


@dp.message(Command("status"))
async def handle_status(message: types.Message) -> None:
    if nl_controller and supervisor:
        try:
            # Використовуємо агента для перевірки статусу
            task_id = await nl_controller.submit_task(
                "natural_command", {"command": "статус системи"}
            )
            await message.answer("🔄 Перевіряю статус системи...")

            # Чекаємо результат (в реальному коді краще використовувати webhook або polling)
            import asyncio

            await asyncio.sleep(2)  # Імітація очікування

            status_info = nl_controller.get_task_status(task_id)
            if status_info and status_info.get("result"):
                result = status_info["result"]
                status_text = f"""📊 <b>Статус системи:</b>
• Агентів: {result.get('result', {}).get('agents_count', 'N/A')}
• Моделей: {result.get('result', {}).get('available_models', 'N/A')}
• Здоров'я: {result.get('result', {}).get('system_health', 'N/A')}
• Недавні конкурси: {result.get('result', {}).get('recent_competitions', 'N/A')}"""
                await message.answer(status_text)
            else:
                await message.answer("✅ Predator Analytics online (з агентом).")
        except Exception as e:
            await message.answer(f"❌ Помилка перевірки статусу: {str(e)}")
    else:
        await message.answer("✅ Predator Analytics online (базовий режим).")


@dp.message(Command("upload"))
async def handle_upload(message: types.Message) -> None:
    await message.answer("🔼 Веб-інтерфейс → модуль «Заливка даних» (Predator Analytics).")


@dp.message(Command("id"))
async def handle_chat_id(message: types.Message) -> None:
    await message.answer(f"🆔 Ваш chat_id: <code>{message.chat.id}</code>")


# Обробка повідомлень природною мовою
@dp.message()
async def handle_natural_language(message: types.Message) -> None:
    """Обробляє повідомлення природною мовою через агента"""
    if not nl_controller:
        await message.answer("🤖 Агент природної мови недоступний. Використовуйте команди /help")
        return

    user_text = message.text.strip()
    if not user_text or user_text.startswith("/"):
        return  # Пропускаємо команди

    try:
        # Надсилаємо команду агенту
        task_id = await nl_controller.submit_task("natural_command", {"command": user_text})

        # Показуємо індикатор обробки
        processing_msg = await message.answer("🤔 Обробляю вашу команду...")

        # Чекаємо результат (в продакшені краще використовувати callback або webhook)
        import asyncio

        await asyncio.sleep(3)  # Імітація обробки

        status_info = nl_controller.get_task_status(task_id)
        if status_info and status_info.get("result"):
            result = status_info["result"]

            if result.get("success"):
                response_text = result.get("message", "Команда виконана успішно")

                # Додаємо додаткову інформацію
                if "model_used" in result:
                    response_text += f"\n\n🧠 Використано модель: {result['model_used']}"

                if result.get("action") == "status_check":
                    # Детальна інформація про статус
                    result_data = result.get("result", {})
                    response_text = f"""📊 <b>Статус системи:</b>
• Агентів: {result_data.get('agents_count', 'N/A')}
• Доступних моделей: {result_data.get('available_models', 'N/A')}
• Здоров'я системи: {result_data.get('system_health', 'N/A')}
• Недавні конкурси: {result_data.get('recent_competitions', 'N/A')}"""

                await processing_msg.edit_text(response_text)
            else:
                error_msg = result.get("error", "Невідома помилка")
                await processing_msg.edit_text(f"❌ Помилка: {error_msg}")
        else:
            await processing_msg.edit_text("⏳ Команда обробляється... Спробуйте пізніше.")

    except Exception as e:
        await message.answer(f"❌ Помилка обробки команди: {str(e)}")


@app.post("/tg/webhook")
async def tg_webhook(request: Request) -> dict[str, Any]:
    if request.query_params.get("token") != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="invalid webhook token")

    payload = await request.json()
    update = Update.model_validate(payload)
    await dp.feed_update(bot, update)
    return {"ok": True}


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    agent_status = "available" if nl_controller else "unavailable"
    return {"status": "ok", "agent_system": agent_status}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Predator Telegram Bot")
    parser.add_argument(
        "--mode", choices=["polling", "webhook"], default="polling", help="Режим роботи бота"
    )
    parser.add_argument(
        "--timeout", type=int, default=None, help="Таймаут для тестування (секунди)"
    )

    args = parser.parse_args()

    if args.mode == "polling":
        print("🤖 Запуск бота в режимі polling...")
        import asyncio

        async def run_polling():
            try:
                await dp.start_polling(bot)
            except KeyboardInterrupt:
                print("👋 Зупинка бота...")
            except Exception as e:
                print(f"❌ Помилка: {e}")

        if args.timeout:
            # Для тестування з таймаутом
            import signal

            def timeout_handler(signum, frame):
                print(f"⏰ Таймаут {args.timeout} секунд досягнуто")
                raise KeyboardInterrupt

            signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(args.timeout)

        try:
            asyncio.run(run_polling())
        except KeyboardInterrupt:
            print("✅ Бот зупинено")

    elif args.mode == "webhook":
        print("🌐 Запуск веб-сервісу для webhook...")
        import uvicorn

        uvicorn.run(app, host="0.0.0.0", port=8000)
