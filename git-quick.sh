#!/bin/bash

# Quick Git commit and push script
# Usage: ./git-quick.sh "commit message"

# Check if commit message is provided
if [ -z "$1" ]; then
    echo "Введіть повідомлення для коміту:"
    read commit_message
else
    commit_message="$1"
fi

# Add all changes
echo "Додаю всі зміни..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "Немає змін для коміту"
    exit 0
fi

# Commit changes
echo "Комічу зміни з повідомленням: $commit_message"
git commit -m "$commit_message"

# Push to GitHub
echo "Відправляю на GitHub..."
if git push origin main; then
    echo "✅ Успішно відправлено на GitHub!"
else
    echo "❌ Помилка при відправці на GitHub"
    echo "Можливо, потрібно налаштувати remote origin або створити репозиторій на GitHub"
fi
