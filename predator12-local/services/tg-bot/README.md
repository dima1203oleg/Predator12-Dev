# Predator 12 — Telegram bot (tg-bot)

This folder contains a minimal Telegram bot implementation for Predator Analytics.

Modes:

- Quick local test: `bot_polling.py` (long polling)
- Production: `app/main.py` (FastAPI + webhook)

Security: NEVER commit real tokens. Use Vault or SealedSecrets in production.

Quick local test (polling)

1. Create `.env.local` (copy from `.env.local.example`) and set `TELEGRAM_BOT_TOKEN` to your test token (local only).
2. Install dependencies (recommended inside venv):

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

3. Run:

```bash
export $(cat .env.local | xargs)
python bot_polling.py
```

Check: send `/start` to your bot in Telegram. Metrics are exposed at `http://localhost:8001/`.

Webhook (production)

1. Build image and push to your registry.
2. Use Helm chart in `helm/` (values.yaml references SealedSecrets/Vault for `TELEGRAM_BOT_TOKEN`).
3. Deploy via ArgoCD using `argocd-application.yaml` (edit repoURL/branch/path if needed).
4. Set webhook:

```bash
export TELEGRAM_BOT_TOKEN=... # from Vault
export WEBHOOK_URL="https://bot.predator.example/tg/webhook?token=YOUR_WEBHOOK_SECRET"
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" -d "url=${WEBHOOK_URL}"
```

UAT checklist

- Local polling: `/start`, `/help`, `/status`, `/id` return expected answers.
- Webhook: `setWebhook` returns `{ok: true}` and FastAPI logs show updates.
- TLS: `curl -I https://bot.predator.../healthz` → HTTP/2 200.
- Metrics: Prometheus scrapes `/metrics`.

IMPORTANT: After local tests with any temporary token, revoke it in BotFather and replace with production token stored in Vault/SealedSecrets.
