# Auto-approve & Auto-merge — швидка інструкція

Цей файл описує мінімальні кроки для безпечного увімкнення автоматичного схвалення PR та автоматичного злиття (automerge) за допомогою workflow, який використовує `BOT_PAT`.

## 1) Створення PAT для бота (BOT_PAT)

1. Увійдіть на GitHub під користувачем/ботом, що буде виконувати approve & automerge.
2. Перейдіть: Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token.
3. Дайте опис, термін дії і оберіть права:
   - repo (повний доступ до репозиторію)
   - workflow (за потреби для запуску/управління workflow)
   - optionally: discussions / pull_request scope якщо необхідно
4. Скопіюйте токен — це і буде значення для секрету `BOT_PAT`.

## 2) Додавання секрету в репозиторій

Через веб UI: Settings → Secrets and variables → Actions → New repository secret

Ім'я: `BOT_PAT`
Значення: (ваш PAT)

Або через gh CLI:

```bash
# приклад (вставте значення PAT у змінну):
gh secret set BOT_PAT --body "$BOT_PAT_VALUE"
```

## 3) Увімкнення Auto-merge та branch protection

1. Repo → Settings → Merge button → увімкніть Auto-merge (Squash / Rebase / Merge as you prefer).
2. Repo → Settings → Branches → Branch protection для `main`:
   - Встановіть required status checks (CI), вимагайте останній green build.
   - Дозвольте авто-мердж (переконайтесь, що bot має потрібні права).

## 4) Guardrails через blocklist

У репозиторії є файл `.github/auto_approve_blocklist.yml`. Додайте у нього glob-патерни шляхів, які **не можна** автоматично схвалювати та зливати. Поточний список блокує, наприклад, `infra/**`, `backend/secrets/**`, `helm/**/values-prod.yaml`, усі `.env` файли та ключі.

- Якщо PR змінює будь-який з цих шляхів, job `guardrails` у `.github/workflows/auto-approve-merge.yml` коментує PR і зупиняє автоматичне злиття.
- Для перевірки можна локально прогнати:
  ```bash
  gh pr checkout <номер PR>
  gh workflow run "Auto Approve & Merge" -f pull_request[number]=<номер PR>
  ```
  або просто подивитися список змінених файлів: `gh pr diff <номер PR>`.
- Щоби додати новий захищений шлях, просто допишіть його у YAML-список `blocked_paths`.

## 5) Workflow: робота з лейблом (опційно)

Якщо хочете, щоб лише певні PR автоматично схвалювались і зливалися, додайте умову по лейблу у workflow. Приклад умови для job'ів у YAML:

```yaml
if: contains(github.event.pull_request.labels.*.name, 'automerge')
```

Тобто: робот буде діяти тільки коли PR має лейбл `automerge`.

## 6) Тестовий сценарій

1. Створіть тестовий PR у репозиторії.
2. Переконайтесь, що перевірки (CI) запускаються і проходять.
3. Якщо workflow додано (файл `.github/workflows/auto-approve-merge.yml`), він почне чекати успішних checks, потім використає `BOT_PAT` щоб approve PR і ввімкне automerge.

## 7) Безпека і обмеження

- Не давайте BOT_PAT більшого доступу, ніж потрібно. Використовуйте окремий бот-акаунт.
- Логи автоматичного approve зберігайте — це корисно для аудиту.
- Якщо у вас є codeowners або інші вимоги до рев'ю, переконайтесь, що branch-protection дозволяє автоматичний merge у вашому сценарії.

## Додатково: як автоматично проставити лейбл з локального агента

Я додав простий скрипт `scripts/label_pr.sh`, який використовує `gh` (GitHub CLI) для додавання лейбла до PR.

Приклад використання:

```bash
# Встановіть GitHub CLI і увійдіть: gh auth login
./scripts/label_pr.sh 42 automerge
```

Скрипт підходить для виклику від локального агента або CI-скрипту, який вирішив, що PR готовий для автоматичного approve/merge.

Також додано безголовий варіант для агента, який використовує BOT_PAT без інтерактивного логіна: `scripts/label_pr_bot.sh`.

Приклад використання з BOT_PAT (локально або з агента):

```bash
# Встановіть BOT_PAT як змінну середовища (в CI / процесі агента):
export BOT_PAT="<your_bot_pat_here>"
export GITHUB_REPOSITORY="owner/repo" # опціонально, якщо не запущено в гит-репо
./scripts/label_pr_bot.sh 42 automerge
```

Скрипт знайде репозиторій через `GITHUB_REPOSITORY` або спробує вичитати `remote.origin.url` і виконає non-interactive API виклик для додавання лейбла.

---

Якщо хочете — можу додати додатковий приклад gh CLI для створення лейблів і автоматичного додавання лейбла в PR від агента, або додати правила RBAC для бота.
