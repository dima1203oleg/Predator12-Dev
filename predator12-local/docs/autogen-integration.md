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
