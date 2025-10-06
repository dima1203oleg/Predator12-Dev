#!/bin/bash

# Визначаємо можливі шляхи до директорії фронтенду
FRONTEND_DIRS=("frontend" "client" "ui" "web" "frontend-app")

# Перевіряємо, яка з директорій існує
FRONTEND_PATH=""
for dir in "${FRONTEND_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    FRONTEND_PATH="$dir"
    break
  fi
done

if [ -z "$FRONTEND_PATH" ]; then
  echo "Помилка: Не знайдено директорію фронтенду. Перевірте, що вона існує."
  echo "Можливі назви директорій: ${FRONTEND_DIRS[*]}"
  exit 1
fi

echo "Знайдено директорію фронтенду: $FRONTEND_PATH"
cd "$FRONTEND_PATH" || exit 1

# Перевіряємо наявність package.json
if [ ! -f "package.json" ]; then
  echo "Помилка: package.json не знайдено у директорії $FRONTEND_PATH"
  exit 1
fi

# Встановлюємо залежності, якщо node_modules не існує
if [ ! -d "node_modules" ]; then
  echo "Встановлюємо залежності..."
  npm install
fi

# Запускаємо фронтенд
echo "Запускаємо фронтенд..."
npm start

# Якщо npm start не спрацює, пробуємо альтернативні команди
if [ $? -ne 0 ]; then
  echo "npm start не спрацював, пробуємо альтернативні команди..."
  
  if grep -q "\"dev\"" package.json; then
    npm run dev
  elif grep -q "\"serve\"" package.json; then
    npm run serve
  else
    echo "Не вдалося запустити фронтенд. Перевірте команди запуску в package.json"
    exit 1
  fi
fi
