# Інтеграція генератора автопатчів (Autogen)

Цей документ описує як підключити реальні генератори патчів (Codeium, Claude, локальні LLM) до таску `improve.generate_suggested_patch`.

1) Варіант: Codeium (комерційно/безкоштовний план)
- Створіть API ключ у Codeium і збережіть його як `CODEIUM_API_KEY` у середовищі CI або локальному shell.
- Оновіть реалізацію `backend/app/agents/handlers/auto_improve_agent.py` або `backend/app/agents/tasks/auto_improve_tasks.py` щоб викликати Codeium API і повертати поле `patch` в результаті.

2) Варіант: Claude / Cline agent
- Якщо використовуєте `saoudrizwan.claude-dev` agent у VSCode, можна вручну запускати процес генерації і зберігати `suggested.patch`.

3) Варіант: Локальний LLM (рекомендується для безкоштовної роботи)
- Розгорніть локальну модель (mistral-oss, llama.cpp, ggml) на машині з достатніми ресурсами.
- Напишіть скрипт-обгортку, який приймає `target_path`, викликає модель для генерації змін і повертає unified diff в полі `patch`.

4) Безпека та guardrails
- Автогенерація повинна створювати тільки `suggested.patch` і PR; заборонено автоматичне мердження в `main`.
- Включіть тестовий прогін та lint у `scripts/auto_propose.sh` (вже наявний skeleton).

5) Приклади виклику таску вручну (Celery)

```py
from backend.app.agents.tasks.auto_improve_tasks import generate_suggested_patch
generate_suggested_patch.delay(target_path='backend/', provider='local')
```

6) Дещо про production readiness
- Почніть з локального провайдера (пункт 3) і тестуйте процес на `feature/*` гілках.
- Поступово додайте в CI перевірки на конфлікти, security scan, та review gates.

## Безкоштовні VS Code розширення для автогенерації та автодовиправлень

1. **Continue (`Continue.continue`)**
   - Відкритий фреймворк для керування локальними та хмарними LLM із VS Code. Підтримує кастомні маршрути, тому підходить для локальних моделей, що вже інтегровані у Predator Analytics.
   - Рекомендується під'єднати до тих самих endpoint-ів, які використовуються в `auto_improve_tasks.py`, щоб мати єдиний стек моделей.

2. **Codeium (`Codeium.codeium`)**
   - Безкоштовний для індивідуального використання інструмент автодоповнення та генерації патчів.
   - Для офлайн/секретних проєктів можна запускати локальний Codeium сервер і використовувати його API в існуючому автоген воркфлоу.

3. **Sourcegraph Cody (`sourcegraph.cody-ai`)**
   - Забезпечує контекстно-орієнтовані пояснення та автоматичні refactor-и з урахуванням великої кодової бази.
   - Використовуйте Cody для швидкого аналізу pull request-ів перед запуском `scripts/auto_propose.sh`, особливо якщо є складні agent-пайплайни.

4. **Tabnine (`TabNine.tabnine-vscode`)**
   - Працює локально, має офлайн-режим і пропонує заповнення коду на основі ваших репозиторіїв.
   - Добре поєднується з автогенерацією, коли потрібно швидко дописувати boilerplate навколо патчів, створених таском.

5. **Bito AI (`Bito.Bito`)**
   - Зосереджений на автодовиправленні та генерації тестів; пропонує промпти для швидкої перевірки змін.
   - Може бути корисним для швидкого наповнення тестів у `scripts/test_system.sh` та інших сценаріях валідації перед деплоєм.

> Усі ці розширення безкоштовні для індивідуального користування. Після інсталяції VS Code автоматично запропонує їх завдяки оновленому файлу `.vscode/extensions.json`. Комбінуйте їх із вже наявним воркфлоу (`auto_propose.sh`, `generate_patch_local.py`) для максимального ефекту.

## Повністю автономний режим (максимальна автоматизація)

> ⚠️ Використовуйте обережно. Режим без участі людини може призвести до автоматичного мерджу небажаних змін. Рекомендується застосовувати лише на внутрішніх гілках або у форках.

1. **Скрипт `scripts/auto_approve_and_commit.sh`**
   - Генерує патч (через `AUTO_APPROVE_GENERATOR`), застосовує його до поточного репозиторію, запускає тести (`AUTO_APPROVE_TEST_CMD`), комітить і за бажанням пушить.
   - За замовчуванням створює гілку `auto/<base>-<timestamp>`, щоб не псувати `main`.

   > Для dry-run режиму використовуйте `scripts/auto_propose.sh`: він викликає генератор (через `AUTO_PROPOSE_GENERATOR`, за замовчуванням `python scripts/generate_patch_local.py`), застосовує патч у sandbox і зберігає `suggested.patch` у корені репозиторію разом із `.auto_propose_report.txt`. Якщо потрібно прокинути оновлений генератор у sandbox, можна задати `AUTO_PROPOSE_GENERATOR='cp \"$ROOT_REPO/scripts/generate_patch_local.py\" scripts/generate_patch_local.py && python scripts/generate_patch_local.py'`.

2. **Налаштування команд генерації**
   - Підключіть локальний LLM чи CLI агента: `AUTO_APPROVE_GENERATOR="python scripts/run_local_model.py --target backend/"`.
   - Можна використовувати REST-клієнти (`curl`, `httpie`) для виклику віддаленого сервісу, який повертає `suggested.patch`.

3. **Автотести перед комітом**
   - Приклад: `AUTO_APPROVE_TEST_CMD="scripts/test_system.sh"` або більш легкі цільові тести `pytest backend/tests/agents`.
   - Якщо тести впадуть — патч автоматично відкатується.
   - Для dry-run можна задати `AUTO_PROPOSE_TEST_CMD="pytest backend/tests/agents -q"` або залишити змінну порожньою, щоб вимкнути запуски.

4. **Глибока інтеграція з VS Code**
   - Додайте задачу в `.vscode/tasks.json`, що викликає `scripts/auto_approve_and_commit.sh`, і прив’яжіть її до хоткеїв.
   - У `Continue` чи іншому агенті додайте action, який після генерації патчу виконує `AUTO_APPROVE_PUSH=1 scripts/auto_approve_and_commit.sh`.

5. **Безлюдна доставка**
   - Для повної автономії задайте змінні:
     ```bash
     AUTO_APPROVE_GENERATOR="python scripts/generate_patch_local.py --target backend/app"
     AUTO_APPROVE_TEST_CMD="pytest backend/tests"
     AUTO_APPROVE_PUSH=1 AUTO_APPROVE_REMOTE=origin AUTO_APPROVE_BRANCH=auto/main \
       scripts/auto_approve_and_commit.sh
     ```
   - Запускайте цей ланцюжок із cron/CI, але пам’ятайте про необхідність додаткових guardrails (lint, security scan).
