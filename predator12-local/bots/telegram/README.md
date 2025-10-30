# Predator Telegram Bot

Легкий сервіс для інтеграції Predator 12 із Telegram. Складається з двох режимів:

1. `bot_polling.py` — локальний тестовий runnable (long polling), щоб швидко перевірити токен і базові команди.
2. `app/main.py` — FastAPI webhook, який приймає апдейти через HTTPS (готово до запуску в Kubernetes/Helm).

## Локальний запуск (polling)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export TELEGRAM_BOT_TOKEN=...   # виданий BotFather токен
python bot_polling.py
```

Після запуску відправте `/start` своєму боту в Telegram.

## Webhook сервіс

```bash
export TELEGRAM_BOT_TOKEN=...
export WEBHOOK_SECRET=changeme
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

### Встановлення webhook

```bash
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://bot.predator.local/tg/webhook?token=${WEBHOOK_SECRET}"
```

### healthz

```
GET /healthz -> {"status":"ok"}
```

## Docker

```bash
docker build -t predator-telegram-bot .
docker run --rm -p8080:8080 \
  -e TELEGRAM_BOT_TOKEN=... \
  -e WEBHOOK_SECRET=changeme \
  predator-telegram-bot
```

## Helm

Готовий чарт: `helm/predator-telegram-bot`. Див. `values.yaml` для прикладу конфігурації та інтеграції з Vault/SealedSecrets.
