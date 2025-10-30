# Технічне завдання: інтеграція ШІ‑інструментів у Predator 12

## 1. Мета й обсяг
- Забезпечити у VS Code середовище, яке генерує, доповнює та виправляє код без залучення платних або хмарних сервісів, що зберігають користувацький код.
- Обʼєднати локальні LLM, офлайн-орієнтовані розширення та CLI‑агенти з наявним автоген-воркфлоу (`scripts/auto_propose.sh`, `scripts/auto_approve_and_commit.sh`).
- Включити автоматичні guardrails: статичний аналіз, тести, ізольовані sandbox-и.

## 2. Цільова архітектура

| Шар | Компоненти | Призначення |
| --- | --- | --- |
| IDE | VS Code + AI розширення | Інтерактивна генерація, автодовиправлення, чат. |
| Локальні моделі | Ollama / llama.cpp, ggml | Постачають LLM без виходу в інтернет. |
| CLI агенти | `scripts/generate_patch_local.py`, Aider | Генерація `suggested.patch` і перевірка патчів. |
| Автоматизація | `auto_propose.sh`, `auto_approve_and_commit.sh`, GitHub Actions | Автогенерація, автотести, коміти, PR. |
| Guardrails | ESLint/Prettier, Black/Flake8, SonarLint, pytest | Забезпечують якість і безпеку перед автоматичними змінами. |

## 3. Рекомендовані безкоштовні AI‑інструменти

### Continue (Apache 2.0, open source)
- Режими agent/chat/edit, робота офлайн, інтеграція з Ollama, Llama.cpp, кастомні MCP end-point-и.
- Підтримує одночасне редагування кількох файлів і виконання команд (`/run`).
- Рекомендована конфігурація: `continue.userConfig.continueServerUrl` → локальний Ollama (`http://localhost:11434`), `continue.experimental.enableMultiFile=true`.

### Tabnine (Dev plan, приватність)
- Працює локально, не тренує моделі на коді користувача.
- Автодоповнення, генерація тестів, чат. Для суворо безкоштовного режиму використовуйте trial або open-source альтернативи (Continue/Aider).
- Можна розгорнути приватний self-hosted сервер і підключити через `tabnine.cloudEndpoint`.

### Codeium / Windsurf (free tier)
- Ідеальний для каскадних багатокрокових правок. Плагін VS Code забезпечує інлайн-асист та виклики команд.
- Безкоштовний план: 25 кредитів на місяць, можливість підʼєднати власні моделі.
- Для глибоких agent-сценаріїв розгляньте окремий IDE Windsurf.

### Amazon CodeWhisperer (Builder ID безкоштовно)
- Входить до AWS Toolkit для VS Code, забезпечує підказки для інфраструктурного/серверного коду.
- Рекомендовано для робіт з AWS-компонентами. Для повної автономності краще залишатися на локальних моделях Continue.

### Aider (CLI, MIT)
- Терміальний агент, що генерує патчі через OpenAI/Anthropic або локальні моделі (через API сумісні з OpenAI).
- Підтримує роботу з гілками Git, зручний для великих рефакторингів та pair-programming сценаріїв.

## 4. Розширення та налаштування VS Code

1. **Рекомендовані розширення** (`.vscode/extensions.json` вже містить):
   - `Continue.continue`
   - `Codeium.codeium`
   - `sourcegraph.cody-ai`
   - `TabNine.tabnine-vscode`
   - `Bito.Bito`

2. **Обовʼязкові додаткові розширення**:
   - `sonarsource.sonarlint-vscode` — статичний аналіз.
   - `ms-python.black-formatter`, `ms-python.flake8` — Python guardrails.
   - `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode` — фронтенд.
   - `streetsidesoftware.code-spell-checker`, `redhat.vscode-yaml` — документація, YAML.

3. **Settings** (`.vscode/settings.json`):
   - Переконайтесь, що `editor.codeActionsOnSave.source.fixAll.eslint` і `editor.formatOnSave=true` включені (вже налаштовано).
   - Додайте налаштування Continue (приклад):
     ```jsonc
     "continue.serverUrl": "http://localhost:11434",
     "continue.experimental.multiFileEdit": true
     ```
   - Для Tabnine self-hosted:
     ```jsonc
     "tabnine.experimentalSelfHostedServer": "http://localhost:8080"
     ```

4. **Tasks** (`.vscode/tasks.json`):
   - Додати задачі:
     - `🤖 Agents: Auto Propose (dry-run)` → `scripts/auto_propose.sh`
     - `🤖 Agents: Auto Approve (commit)` → `scripts/auto_approve_and_commit.sh`

## 5. Локальні LLM

### 5.1 Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull mistral:instruct
```
- Налаштувати Continue: `continue.llm.provider="ollama"`, `continue.llm.model="mistral:instruct"`.
- Для табличних задач — `ollama pull codellama:7b`. Перевірити ресурси (8–16 GB RAM).

### 5.2 llama.cpp (без GPU)
```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp && make
./main -m ./models/codellama-7b.Q4_K_M.gguf --prompt "..." --n-predict 256
```
- Підключення до Continue через OpenAI-compatible proxy (`llama.cpp` server mode).

### 5.3 ggml / Local pipeline
- Використовувати `backend/scripts/run_local_model.py` (запланувати) або `scripts/generate_patch_local.py` для генерації патчів, викликаючи модель через CLI.

## 6. CLI‑агенти й автоматизація

- `scripts/generate_patch_local.py` — базовий генератор `suggested.patch`.
- `scripts/auto_propose.sh` — запускає агент у sandbox, застосовує патч, гонить тести, формує звіт та копіює `suggested.patch` у корінь (налаштовується через `AUTO_PROPOSE_GENERATOR`; тести можна змінити або вимкнути через `AUTO_PROPOSE_TEST_CMD`).
- `scripts/auto_approve_and_commit.sh` — повністю автономний сценарій (генерація, тести, коміт, опційний пуш).
- Aider (`pip install aider-chat`) — використовуйте для складних рефакторингів, зберігає дифи в git.

## 7. Guardrails: статичний аналіз і автофікси

| Мова | Інструмент | Команда | Де запускається |
| --- | --- | --- | --- |
| JS/TS | ESLint + Prettier | `npm run lint`, `npm run format` | pre-commit, CI, VS Code on save |
| Python | Black, Flake8, isort | `black backend/`, `flake8 backend/` | pre-commit, `auto_approve_and_commit.sh` |
| YAML | `yamllint` | `yamllint .` | CI |
| Security | `bandit`, `npm audit` | задачі CI | `ci-lint-and-test.yml` |

Налаштування pre-commit:
```bash
pip install pre-commit
pre-commit install
```
Файл `.pre-commit-config.yaml` уже існує — переконайтесь, що активні потрібні хуки.

## 8. VS Code + AI воркфлоу

1. **Інтерактивні правки**: Continue або Tabnine виділяють блок коду → `/edit` або inline suggestion → застосування `Accept`.
2. **Генерація патчу**: Запустіть `🤖 Agents: Auto Propose (dry-run)` для створення `suggested.patch` без змін у робочому дереві.
3. **Ревʼю та тести**: Перегляньте `./.auto_propose_report.txt`, при потребі доредагуйте патч.
4. **Безлюдне застосування**: Виконайте `🤖 Agents: Auto Approve (commit)` із заданими змінними середовища (`AUTO_APPROVE_TEST_CMD`, `AUTO_APPROVE_PUSH`).
5. **CI інтеграція**: Використовуйте `autogen-pr.yml`/`autogen-scan.yml` для планових запусків і створення PR.

## 9. Підключення Continue до MCP / локальних агентів

- Додайте у `~/.continue/config.json` або workspace config:
```json
{
  "models": [
    {
      "title": "Local Mistral",
      "provider": "ollama",
      "model": "mistral:instruct"
    }
  ],
  "actions": [
    {
      "name": "Auto Approve",
      "command": "AUTO_APPROVE_TEST_CMD='pytest backend/tests' scripts/auto_approve_and_commit.sh"
    }
  ]
}
```
- Використовуйте MCP (`.vscode/mcp.json`) для реєстрації локальних утиліт як інструментів (агенти Predators).

## 10. План впровадження

1. **Етап 0 — Підготовка**
   - Оновити VS Code до останньої версії, встановити Node.js 18+, Python 3.11+.
   - Інсталювати розширення зі списку (Continue, Tabnine, SonarLint, ESLint, Prettier, Black/Flake8).

2. **Етап 1 — Локальні моделі**
   - Розгорнути Ollama або llama.cpp, підтягнути моделі (`mistral`, `codellama`).
   - Протестувати інтеграцію з Continue (`/chat`, `/edit`).

3. **Етап 2 — Автоматичні патчі**
   - Налаштувати `scripts/generate_patch_local.py` для реальних файлів (додати свою логіку генерації).
   - Запустити `scripts/auto_propose.sh` і переконатися, що sandbox-тести проходять.

4. **Етап 3 — Повна автономність**
   - Виставити `AUTO_APPROVE_TEST_CMD="pytest backend/tests"` і `AUTO_APPROVE_PUSH=1` (для тестової гілки/форку).
   - Налаштувати cron або GitHub Action, який викликає `scripts/auto_approve_and_commit.sh`.

5. **Етап 4 — Guardrails**
   - Увімкнути pre-commit хуки.
   - Додати `sonar-scanner` або `npm audit` у CI.
   - Переглянути `docs/autogen-integration.md` для загальних рекомендацій і оновлень.

## 11. Ризики та запобіжні заходи
- **Автоматичний мердж**: дозволяється лише в окремих гілках. Для main потрібен ручний review.
- **Моделі низької якості**: використовуйте принаймні Mistral 7B або аналогічні для кращої якості патчів.
- **Продуктивність**: локальні моделі потребують 8–16 GB RAM і, бажано, GPU. Тримайте легковагові моделі для фронтенду, важчі для бекенду.
- **Безпека коду**: при використанні сторонніх сервісів (Codeium, CodeWhisperer) відключайте телеметрію та не відправляйте конфіденційні секрети.

## 12. Додаткові ресурси
- `docs/autogen-integration.md` — базова інтеграція генераторів патчів.
- `docs/auto-improvement-plan.md` — стратегія поступового розгортання.
- `scripts/auto_approve_and_commit.sh` — автономний pipeline (детальний опис у розділі 8).
- `backend/app/agents/tasks/auto_improve_tasks.py` — точка підключення для кастомних провайдерів.
