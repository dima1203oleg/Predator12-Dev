## Технічне завдання (ТЗ): Автоматизована інтеграція розширення для VS Code з повною автономією розгортання

### 1. Мета проекту

Створити кастомне розширення для Visual Studio Code (VS Code), яке реалізує повністю автономний процес розгортання до production-оточення. Розширення повинно активуватись однією командою, виконувати всі етапи без взаємодії з користувачем, приймати рішення на основі вбудованої логіки та інтегруватись з GitHub Copilot для автоматичного схвалення будь-яких пропозицій чи запитів. Ключовий фокус: нульова участь людини — система діє як AI-агент, використовуючи скрипти, API та правила для самостійних дій.

**Принцип роботи:** Після активації розширення (команда `vscode:autodeploy-prod`) процес йде в фоновому режимі з логуванням у Output-панелі. Ризики мінімізуються через авто-відновлення, але рішення приймаються алгоритмічно (наприклад, на основі метрик репозиторію).

### 2. Вимоги до функціоналу

#### 2.1. Активація та автономність

- **Команда запуску:** Реєстрація команди в `package.json` як `extension.autodeploy.toProd`. Тригер через Command Palette (Ctrl+Shift+P) або hotkey (Ctrl+Alt+D). Ніяких промптів, діалогів чи input-полів — все на основі конфігурації з `settings.json`.
- **Автономні рішення:**
  - Сканування репозиторію: git diff для виявлення змін; якщо >5 файлів — вибір “incremental deploy”, інакше “full”.
  - Авто-commit/push з генерованим повідомленням (“Autonomous deploy: [hash] at [date]”).
  - Вибір платформи: На основі `.vscode/deploy.json` (Vercel/Netlify/AWS) — авто-детекція через env-vars.

#### 2.2. Етапи розгортання в розширенні

Розширення реалізує послідовність через VS Code Task Runner + Node.js runtime:

1. **Валідація:** Авто-lint (ESLint/Prettier), тести (Jest/Vitest). При помилках — виклик Copilot для фіксу (див. 2.3).
2. **Білд:** Виконання `npm run build` з оптимізаціями (webpack config auto-adjust).
3. **Деплой:** API-кол у сервіс (наприклад, Vercel CLI via `child_process`). Стратегія: blue-green за замовчуванням, з ротацією на основі load (симуляція через simple HTTP check).
4. **Верифікація:** Smoke-тести (axios ping на ендпоінти). Успіх — лог “Deploy OK”; невдача — rollback via git revert + redeploy.

- **Логування:** Використовувати `vscode.window.createOutputChannel` для реального часу оновлень. Експорт у файл `.vscode/deploy-history.json`.

#### 2.3. Автоматична інтеграція з GitHub Copilot

- **Авто-схвалення:** Розширення перехоплює події Copilot через VS Code API (`onDidChangeTextDocument`, `inlineSuggest`).
  - При пропозиції коду: Авто-виконання `editor.action.inlineSuggest.commit` без затримки.
  - Для чату/запитів: Хук на `copilot.chat.request` — генерувати відповіді шаблонами (“Підтвердити та реалізувати з фокусом на безпеку/ефективність”).
- **Реалізація:**
  - Модуль `copilotInterceptor.ts`: Використовувати `vscode.commands.executeCommand` для симуляції Tab/Enter.
  - Якщо API обмежений — fallback на макроси (інтеграція з `vscode-macro` extension) або Electron overlay для key simulation.
  - Тест: 100% accept-rate на 10+ генерованих сніпетів (Copilot генерує, розширення приймає).
- **Будь-які інструменти:** Дозволено скрипти (TypeScript з `ts-node`), зовнішні libs (axios для API), або fork Copilot для патчу auto-approve.

#### 2.4. Безпека та помилки

- **Обробка:** 3 retry з експоненційною затримкою; rollback до git tag “prod-stable”.
- **Сканування:** Інтеграція `npm audit` + Snyk API (авто-fix via Copilot).
- **Конфіг:** Шифрування токенів у `vscode.workspace.getConfiguration().update` (secrets store).

### 3. Технічні специфікації

- **Версія VS Code:** 1.85+ (activation events: onCommand, onStartupFinished).
- **Структура розширення:**

  ```
  extension/
  ├── package.json       # Commands, activationEvents
  ├── src/
  │   ├── extension.ts   # Головний entrypoint
  │   ├── deployer.ts    # Логіка деплою
  │   └── copilot.ts     # Інтерцептор
  ├── .vscode/
  │   └── tasks.json     # Інтеграція з tasks
  └── deploy.json        # Конфіг (env, targets)
  ```

- **Приклад package.json (фрагмент):**

  ```json
  {
    "contributes": {
      "commands": [
        {
          "command": "extension.autodeploy.toProd",
          "title": "Autonomous Deploy to Prod"
        }
      ]
    },
    "activationEvents": ["onCommand:extension.autodeploy.toProd"]
  }
  ```

- **Приклад extension.ts (основний код):**

  ```typescript
  import * as vscode from "vscode";
  import { Deployer } from "./deployer";

  export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
      "extension.autodeploy.toProd",
      async () => {
        const deployer = new Deployer();
        await deployer.runAutonomous(); // Без await для фону
        vscode.window.showInformationMessage("Autonomous deploy initiated.");
      },
    );
    context.subscriptions.push(disposable);
  }
  ```

- **Залежності:** `@types/node`, `axios`, `simple-git` (для git ops).

### 4. Критерії приймання

- Активація команди виконує деплой без UI (тест: unit + e2e в 3 проектах).
- Copilot-схвалення: Авто-прийняття в реальному часі (відео-лог тесту).
- Сумісність: Windows/Mac/Linux; інтеграція з GitHub Repos.
- Документація: README з установкою (vsix sideload).

### 5. Терміни та ресурси

- **Етап 1:** Базове розширення + деплой-логіка (3-5 днів).
- **Етап 2:** Copilot-інтеграція + тести (5-7 днів).
- **Етап 3:** Пакування та реліз на Marketplace (2 дні).
- **Ресурси:** Розробник VS Code Ext API; тест-оточення з Copilot sub.

---

_Файл згенеровано автоматично як частина workflow. Якщо потрібно — можу створити початкову скелетну реалізацію розширення у вашому репозиторії._
