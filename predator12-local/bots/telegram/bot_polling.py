"""
Локальний long-polling запуск Predator Telegram Bot.

Призначення:
    - швидко перевірити валідність токена;
    - вручну протестувати базові команди перед деплоєм webhook-сервісу.

Використання:
    export TELEGRAM_BOT_TOKEN=...
    python bots/telegram/bot_polling.py
"""

from __future__ import annotations

import asyncio
import os

from aiogram import Bot, Dispatcher, F, Router, types
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

if not TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN env variable is required")

bot = Bot(TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()


@dp.message(CommandStart())
async def handle_start(message: types.Message) -> None:
    """Handle /start command."""
    await message.answer(
        "👋 Вітаємо у Predator 12 Telegram Bot.\n" "Доступні команди: /help, /status, /upload, /id"
    )


@dp.message(Command("help"))
async def handle_help(message: types.Message) -> None:
    """Handle /help command."""
    await message.answer(
        "<b>Довідка</b>\n"
        "/status — стан сервісів\n"
        "/upload — як завантажити документи/Excel/CSV\n"
        "/id — повернути chat_id"
    )


@dp.message(Command("status"))
async def handle_status(message: types.Message) -> None:
    """Handle /status command."""
    # Invoke real healthcheck of Predator Analytics backend
    await message.answer("✅ Сервіси працюють (демо режим).")


@dp.message(Command("upload"))
async def handle_upload(message: types.Message) -> None:
    """Handle /upload command."""
    await message.answer(
        "🔼 Завантаження даних: відкрийте Predator Analytics → модуль «Заливка даних»."
    )


@dp.message(Command("id"))
async def handle_chat_id(message: types.Message) -> None:
    """Handle /id command."""
    await message.answer(f"🆔 Ваш chat_id: <code>{message.chat.id}</code>")


async def main() -> None:
    """Main polling loop."""
    router = Router()
    router.message.filter(F.chat.type.in_({"private", "group", "supergroup"}))
    dp.include_router(router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
