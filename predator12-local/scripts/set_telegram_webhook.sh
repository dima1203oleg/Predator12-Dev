#!/usr/bin/env bash
# Helper to set Telegram webhook for Predator bot.
# Usage:
#   TELEGRAM_BOT_TOKEN=... WEBHOOK_URL=https://... ./scripts/set_telegram_webhook.sh

set -euo pipefail

if [[ -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
  echo "TELEGRAM_BOT_TOKEN env variable is required" >&2
  exit 1
fi

if [[ -z "${WEBHOOK_URL:-}" ]]; then
  echo "WEBHOOK_URL env variable is required" >&2
  exit 1
fi

echo "Setting webhook to ${WEBHOOK_URL}"
response=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=${WEBHOOK_URL}")

if command -v jq >/dev/null 2>&1; then
  echo "$response" | jq .
else
  echo "$response"
fi
