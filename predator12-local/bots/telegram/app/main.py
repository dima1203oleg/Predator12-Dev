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
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import Update
from fastapi import FastAPI, HTTPException, Request

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not BOT_TOKEN:
    raise RuntimeError("TELEGRAM_BOT_TOKEN env variable is required")

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "change-me")

bot = Bot(BOT_TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()
app = FastAPI(title="Predator Telegram Webhook")


@dp.message(CommandStart())
async def handle_start(message: types.Message) -> None:
    await message.answer("👋 Predator 12 тут. Використовуйте /help для списку команд.")


@dp.message(Command("help"))
async def handle_help(message: types.Message) -> None:
    await message.answer("Команди: /status, /upload, /id")


@dp.message(Command("status"))
async def handle_status(message: types.Message) -> None:
    # TODO: додати реальні healthchecks (FastAPI backend, DB, queue)
    await message.answer("✅ Predator Analytics online (webhook).")


@dp.message(Command("upload"))
async def handle_upload(message: types.Message) -> None:
    await message.answer("🔼 Веб-інтерфейс → модуль «Заливка даних» (Predator Analytics).")


@dp.message(Command("id"))
async def handle_chat_id(message: types.Message) -> None:
    await message.answer(f"🆔 Ваш chat_id: <code>{message.chat.id}</code>")


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
    return {"status": "ok"}
