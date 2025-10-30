"""Simple polling bot for quick local tests.
Run locally with: export $(cat .env.local | xargs) && python bot_polling.py
DO NOT commit real tokens into the repo.
"""

import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, F, types
from aiogram.enums.parse_mode import ParseMode
from aiogram.filters import Command, CommandStart
from prometheus_client import Counter, start_http_server

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TOKEN:
    raise SystemExit("TELEGRAM_BOT_TOKEN is not set in env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("predator-tg-bot")

# Prometheus metrics
UPDATES_COUNTER = Counter("tg_bot_updates_total", "Total Telegram updates processed")
ERROR_COUNTER = Counter("tg_bot_errors_total", "Total Telegram handler errors")

bot = Bot(TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(m: types.Message):
    UPDATES_COUNTER.inc()
    await m.answer("👋 Вітаю у Predator 12.\n" "Доступні команди: /help, /status, /upload, /id")


@dp.message(Command("help"))
async def help_(m: types.Message):
    UPDATES_COUNTER.inc()
    await m.answer(
        "<b>Довідка</b>\n"
        "/status — стан сервісів\n"
        "/upload — як завантажити документи/Excel/CSV\n"
        "/id — повернути chat_id"
    )


@dp.message(Command("status"))
async def status(m: types.Message):
    UPDATES_COUNTER.inc()
    # minimal demo: actual healthchecks can be added (see BACKEND_HEALTH_URL)
    await m.answer("✅ Сервіси працюють (демо).")


@dp.message(Command("upload"))
async def upload(m: types.Message):
    UPDATES_COUNTER.inc()
    await m.answer(
        "🔼 Завантаження файлів: відкрити модуль у Predator Analytics (адмін UI) → «Заливка даних»."
    )


@dp.message(Command("id"))
async def cid(m: types.Message):
    UPDATES_COUNTER.inc()
    await m.answer(f"🆔 Ваш chat_id: <code>{m.chat.id}</code>")


async def main():
    # Start prometheus metrics endpoint on port 8001 for local testing
    start_http_server(8001)
    logger.info("Prometheus metrics available at http://localhost:8001/")

    # run polling loop
    try:
        await dp.start_polling(bot)
    except Exception as e:
        ERROR_COUNTER.inc()
        logger.exception("Polling stopped: %s", e)


if __name__ == "__main__":
    asyncio.run(main())
