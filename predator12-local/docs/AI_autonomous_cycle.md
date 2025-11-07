# Автономний AI-цикл розробки та CI/CD для Predator Analytics

Цей документ описує реалізацію автономного AI-агента розробки, що працює в середовищі VS Code та інтегрується з CI/CD (GitHub Actions → Tekton → ArgoCD). Це інструкція і короткий опис файлів, які додано/оновлено в репозиторії.

## Коротко про ідею

- Агент виконує цикл: генерація коду → запуск тестів → аналіз помилок → автопоправка → (повтор) → локальний деплой → створення PR.
- Режим offline-first: локальний Ollama (Mistral) за замовчуванням; прапорці середовища дозволяють перемкнутися на зовнішні сервіси (OpenAI, HF та ін.).
- Безпека: ліміти ітерацій, логування дій, можливість Dry-run; блокліст для автозлиття у `.github/auto_approve_blocklist.yml`.

## Файли, що створені/оновлені

- `scripts/ai_dev_loop.py` — основний скрипт-оркестратор AI циклу (scaffold). Він надає: генерацію (LLM-покупка), запуск тестів, аналіз помилок та спроби автокорекції. За замовчуванням працює в `--dry-run`.
- `.vscode/tasks.json` — tasks для швидкого запуску AI-циклу, тестів і docker-compose.
- `.vscode/launch.json` — конфігурації дебагу для FastAPI і Celery.
- `.devcontainer/` (`devcontainer.json`, `Dockerfile`) — контейнер розробника з Ollama, Python 3.11, Node 18 та базовими інструментами.
- `.github/workflows/ci.yaml` — базовий CI (pytest, npm test/build) для PR та push в `dev`.
- `tekton/` — приклади `pipeline.yaml` і `trigger.yaml` (scaffold для вашого кластера Tekton).
- `docs/AI_autonomous_cycle.md` — цей документ.
- `scripts/autodeploy_automerge.sh` — оркестратор для E2E автотесту автозлиття (створення PR + мітка `automerge`).

## Як почати локально (резюме)

1. Відкрити репозиторій у VS Code із DevContainer (Remote-Containers) або локально.
2. (Опціонально) В DevContainer встановити Ollama і модель Mistral: `ollama pull mistral`.
3. Запустити VS Code Task: `AI Dev Loop (Generate/Test)` або вручну:

```bash
# Dry-run (без змін у git)
python scripts/ai_dev_loop.py --task "Implement X" --iterations 5 --dry-run

# Якщо готові дозволити агенту створювати гілки/PR (переконайтесь у gh auth):
python scripts/ai_dev_loop.py --task "Implement X" --iterations 5 --no-dry-run --use-local-llm
```

4. Щоб прогнати повний E2E, налаштуйте `BOT_PAT` як GitHub секрет і виконайте `scripts/autodeploy_automerge.sh` (потрібен `gh` CLI і права):

```bash
export GITHUB_REPOSITORY="owner/repo"
export BOT_PAT="ghp_..."
./scripts/autodeploy_automerge.sh
```

> Примітка: автоматичне схвалення PR і автозлиття потребує правильно налаштованого workflow (`.github/workflows/auto-approve-merge.yml`) і секрету `BOT_PAT` з правами `repo`+`workflow`.

## Параметри оточення (ENV)

- `USE_OPENAI_API=true` — дозволити звернення до OpenAI (потрібен `OPENAI_API_KEY`).
- `ENABLE_COPILOT=true` — використовувати Copilot (опціонально).
- `ALLOW_WEB_SEARCH=true` — дозволити інтернет-пошук.
- `USE_HF_API=true` — звертання до HuggingFace API (потрібен токен).
- `USE_GROQ=true` — для Groq, якщо доступна інфраструктура.

За замовчуванням усі прапорці виключені для offline-first режиму.

## Механізми захисту

- Ліміт ітерацій у `ai_dev_loop.py` та `max_iterations` в orchestrator.
- Dry-run за замовчуванням.
- `.github/auto_approve_blocklist.yml` — переліки чутливих шляхів, які забороняють автоматичне автозлиття.
- Лейбл `automerge` + workflow з перевірками чеків (CI) перед дозволом автозлиття.

## Наступні кроки (рекомендації)

1. Підключити реальні LLM-клієнти (LangGraph/CrewAI) у `scripts/ai_dev_loop.py` і забезпечити обробку return types (diffs).
2. Додати автотест, який перевіряє роботу агента на невеликій тестовій задачі (unit/integration тест для `ai_dev_loop` logic).
3. Налаштувати Tekton tasks у вашому кластері (definite Kaniko credentials, git bot SSH key, secrets).
4. Налаштувати ArgoCD Application manifests у `Repo B` і дозволити auto-sync для staging.

---

Якщо хочете, я можу:

- адаптувати `ai_dev_loop.py` під конкретну стратегію генерації диффів (наприклад, PATCH у unified diff) та інтегрувати `git apply`/`gh pr create`;
- створити приклад Task/TaskRun Tekton із Kaniko і секретами;
- підготувати Helm values шаблони і скрипт оновлення образів у `Repo B`.

Скажіть, які з цих кроків зробити далі, або дозволяйте мені прогнати локальний E2E тест (потрібні `gh` та `BOT_PAT`).
