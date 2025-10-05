# Налаштування GitHub

## Крок 1: Створення репозиторію на GitHub

1. Перейдіть на [GitHub.com](https://github.com)
2. Натисніть "New repository"
3. Назвіть репозиторій (наприклад: `Predator12`)
4. НЕ додавайте README, .gitignore або ліцензію (у нас вже є)
5. Натисніть "Create repository"

## Крок 2: Підключення локального репозиторію

Виконайте ці команди в терміналі VS Code:

```bash
# Налаштуйте Git (якщо ще не налаштовано)
git config --global user.name "Ваше Ім'я"
git config --global user.email "ваш@email.com"

# Додайте remote origin (замініть USERNAME та REPOSITORY)
git remote add origin https://github.com/USERNAME/REPOSITORY.git

# Або використовуйте SSH (рекомендовано)
git remote add origin git@github.com:USERNAME/REPOSITORY.git

# Перейменуйте гілку на main (якщо потрібно)
git branch -M main

# Зробіть перший коміт
git add .
git commit -m "Initial commit"

# Відправте на GitHub
git push -u origin main
```

## Крок 3: Швидкі команди для роботи

### Через VS Code Tasks:
1. `Cmd+Shift+P` → `Tasks: Run Task`
2. Виберіть:
   - **Git: Add All** - додати всі зміни
   - **Git: Commit** - зробити коміт
   - **Git: Push** - відправити на GitHub
   - **Git: Quick Commit & Push** - все разом

### Через скрипт:
```bash
# Швидкий коміт і пуш
./git-quick.sh "Ваше повідомлення"

# Або без повідомлення (запитає інтерактивно)
./git-quick.sh
```

### Через команди:
```bash
# Стандартний процес
git add .
git commit -m "Повідомлення коміту"
git push origin main

# Швидкий процес
git add . && git commit -m "Повідомлення" && git push origin main
```

## Налаштування SSH (рекомендовано)

Для безпечної роботи без паролів:

```bash
# Генерація SSH ключа
ssh-keygen -t ed25519 -C "ваш@email.com"

# Додавання до ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Скопіювання публічного ключа
cat ~/.ssh/id_ed25519.pub
```

Потім додайте цей ключ в GitHub Settings → SSH and GPG keys.

## Автоматизація

Після налаштування ви можете:
- Використовувати `./git-quick.sh "повідомлення"` для швидких комітів
- Запускати Git задачі через VS Code Command Palette
- Налаштувати автоматичні коміти через cron (за потребою)
