import logging
import os

import httpx
from aiogram import Bot, Dispatcher
from aiogram.enums.parse_mode import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.types import Update
from fastapi import FastAPI, HTTPException, Request
from prometheus_client import CONTENT_TYPE_LATEST, Counter, generate_latest
from starlette.responses import Response

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("predator-tg-bot")

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "change-me")
BACKEND_HEALTH_URL = os.getenv("BACKEND_HEALTH_URL", "http://backend:8000/healthz")

if not BOT_TOKEN:
    raise SystemExit("TELEGRAM_BOT_TOKEN is not set in env")

bot = Bot(BOT_TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher()
app = FastAPI(title="Predator Telegram Webhook")

# Prometheus metrics
UPDATES_COUNTER = Counter("tg_bot_updates_total", "Total Telegram updates processed")
ERROR_COUNTER = Counter("tg_bot_errors_total", "Total Telegram handler errors")


@dp.message(CommandStart())
async def start(m: "aiogram.types.Message"):
    UPDATES_COUNTER.inc()
    await m.answer("👋 Predator 12 тут. /help")


@dp.message(Command("help"))
async def help_(m: "aiogram.types.Message"):
    UPDATES_COUNTER.inc()
    await m.answer("Команди: /status, /upload, /id")


@dp.message(Command("status"))
async def status(m: "aiogram.types.Message"):
    UPDATES_COUNTER.inc()
    # simple backend ping
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(BACKEND_HEALTH_URL)
            if r.status_code == 200:
                await m.answer("✅ OK (prod webhook).")
                return
    except Exception as e:
        logger.warning("Backend health check failed: %s", e)
    await m.answer("⚠️ Один або кілька сервісів недоступні (демо).")


@dp.message(Command("upload"))
async def upload(m: "aiogram.types.Message"):
    UPDATES_COUNTER.inc()
    await m.answer("🔼 Відкрийте модуль «Заливка даних» у Predator.")


@dp.message(Command("id"))
async def cid(m: "aiogram.types.Message"):
    UPDATES_COUNTER.inc()
    await m.answer(f"🆔 <code>{m.chat.id}</code>")


@app.post("/tg/webhook")
async def tg_webhook(request: Request):
    if request.query_params.get("token") != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="bad token")
    data = await request.json()
    update = Update.model_validate(data)
    try:
        await dp.feed_update(bot, update)
        return {"ok": True}
    except Exception as e:
        ERROR_COUNTER.inc()
        logger.exception("Failed to feed update: %s", e)
        raise HTTPException(status_code=500, detail="handler error")


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, log_level="info")
