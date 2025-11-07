# Інтеграція Predator Telegram Bot

Цей документ описує два режими роботи Telegram-бота Predator 12 та кроки для його деплою в інфраструктурі (FastAPI + Kubernetes + Helm + ArgoCD + Vault/SealedSecrets).

## 1. Режими роботи

| Режим                    | Файл                           | Призначення                                                             |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------------- |
| Локальний тест (polling) | `bots/telegram/bot_polling.py` | Швидко перевірити токен BotFather та базові команди, без вебхука.       |
| Webhook сервіс           | `bots/telegram/app/main.py`    | Продакшен-варіант (FastAPI). Приймає апдейти через HTTPS `/tg/webhook`. |

## 2. Можливості (MVP)

- `/start` — вітання та швидкий гайд.
- `/help` — список команд.
- `/status` — стан сервісів Predator (TODO: підключити реальні health-check API).
- `/upload` — інструкція щодо модуля завантаження даних.
- `/id` — повертає `chat_id` (корисно для тригерів/сповіщень).
- Логування/метрики: стандартні stdout → Loki; Prometheus scrape через annotations або `/metrics` (додайте middleware при потребі).

## 3. Швидкий тест токена (polling)

```bash
cd bots/telegram
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export TELEGRAM_BOT_TOKEN=...  # токен BotFather
python bot_polling.py
```

Відправте `/start`, `/status` у Telegram. Якщо бот відповідає — токен коректний.

## 4. Webhook сервіс

```bash
cd bots/telegram
pip install -r requirements.txt

export TELEGRAM_BOT_TOKEN=...
export WEBHOOK_SECRET=some-strong-value
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

Установлення webhook:

```bash
curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -d "url=https://bot.predator.example/tg/webhook?token=${WEBHOOK_SECRET}"
```

Healthcheck: `GET /healthz → {"status":"ok"}`.

## 5. Контейнер

Dockerfile: `bots/telegram/Dockerfile`

```bash
docker build -t predator-telegram-bot bots/telegram
docker run --rm -p8080:8080 \
  -e TELEGRAM_BOT_TOKEN=... \
  -e WEBHOOK_SECRET=... \
  predator-telegram-bot
```

## 6. Helm / Kubernetes

Чарт: `helm/predator-telegram-bot`

```bash
helm upgrade --install predator-telegram-bot helm/predator-telegram-bot \
  --namespace predator --create-namespace \
  --set image.repository=<registry>/<image> \
  --set image.tag=<tag> \
  --set env.WEBHOOK_SECRET=<secret> \
  --set-file secretEnv.TELEGRAM_BOT_TOKEN=./telegram-token.b64
```

> Рекомендація: замість `--set-file` використовуйте SealedSecrets або Vault. У values.yaml вже є поле `secretEnv.TELEGRAM_BOT_TOKEN`, яке підхопить запечатаний секрет.

### 6.1 SealedSecret (приклад)

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: tg-bot-token
  namespace: predator
spec:
  encryptedData:
    TELEGRAM_BOT_TOKEN: <kubeseal output>
```

В Helm-чарті:

```yaml
envFrom:
  - secretRef:
      name: tg-bot-token
```

### 6.2 Ingress

У `values.yaml` передбачено секцію `ingress`. Увімкніть TLS (Let’s Encrypt/Cert-Manager). Налаштуйте rate limiting у NGINX Ingress при потребі.

## 7. ArgoCD

Додайте Helm-деплой до ArgoCD (наприклад, через umbrella-чарт):

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: predator-telegram-bot
spec:
  project: predator
  source:
    repoURL: https://github.com/.../predator12-local.git
    path: helm/predator-telegram-bot
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: predator
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## 8. Безпека

- Не зберігайте токени в git. Використовуйте Vault/SealedSecrets.
- TLS обов’язковий для webhook endpoint.
- Додайте `WEBHOOK_SECRET` (query або header guard).
- Обмежте команди для адмінів через whitelist `allowed_user_ids` (TODO).
- Регулярно ротируйте токени після тестів.

## 9. Спостережуваність

- Логи → stdout → Loki (label `app=predator-telegram-bot`).
- Прості метрики (кількість апдейтів, помилки) — додайте Prometheus middleware або OTEL SDK.
- Tracing (опційно) через OpenTelemetry.

## 10. Тестування (UAT)

1. `/start`, `/help`, `/status`, `/id` — відповіді коректні.
2. `setWebhook` повертає `{"ok":true}`; після `/start` у логах видно апдейт.
3. `curl -I https://bot.predator.../healthz` → 200.
4. Ротація токена: старий відкликано, новий працює.
5. Логи/метрики доступні, алерти налаштовано (за потреби).

## 11. Подальша інтеграція

- `/status` → викликати бекенд (FastAPI `/healthz`), БД, черги.
- Notification service: бекенд публікує повідомлення в Kafka → бот надсилає `sendMessage`.
- `/upload` може повертати динамічне посилання з токеном/one-time URL на модуль «Заливка даних».
