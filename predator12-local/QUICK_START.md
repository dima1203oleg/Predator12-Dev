# ⚡ Швидкий старт Predator12

## 🚀 За 5 хвилин до запуску

### Варіант А: Автоматичний (рекомендовано)

```bash
# 1. Встановити все
make install

# 2. Ініціалізувати БД
make initdb

# 3. Виконати міграції
make migrate

# 4. Запустити (в двох терміналах)
# Термінал 1:
make backend

# Термінал 2:
make frontend
```

### Варіант Б: Через VS Code

1. Відкрити папку `predator12-local` в VS Code
2. `Cmd+Shift+P` → `Tasks: Run Task` → `🚀 Install Dependencies`
3. `Cmd+Shift+P` → `Tasks: Run Task` → `🗄️ Initialize Database`
4. `Cmd+Shift+P` → `Tasks: Run Task` → `🔄 Run Migrations`
5. `F5` → Вибрати `🚀 Full Stack Debug`

## 📋 Передумови

### macOS

```bash
# Встановити Homebrew (якщо немає)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Встановити необхідні пакети
brew install python@3.11 node postgresql redis
brew services start postgresql
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3.11 python3-pip nodejs npm postgresql redis-server
sudo systemctl start postgresql
sudo systemctl start redis-server
```

## 🔧 Перша налаштування

### 1. Клонувати або скопіювати проект

```bash
cd /Users/dima/Documents/Predator12
# Папка predator12-local вже має бути створена
```

### 2. Налаштувати .env

```bash
cd predator12-local
cp .env.example .env

# Відредагувати .env (мінімальні зміни)
nano .env
# Змінити паролі та API ключі
```

### 3. Встановити залежності

#### Backend (Python)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

#### Frontend (Node.js)

```bash
cd frontend
npm install
cd ..
```

### 4. Ініціалізувати базу даних

```bash
# Створити користувача та БД
./scripts/init_local_db.sh

# Виконати міграції
source .venv/bin/activate
cd backend
alembic upgrade head
cd ..
```

### 5. Запустити сервіси

#### Backend

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend (в іншому терміналі)

```bash
cd frontend
npm run dev
```

## 🔍 Перевірка

### Швидкий тест

```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# API docs
open http://localhost:8000/docs
```

### Повний smoke тест

```bash
make smoke
```

## 📊 Міграція даних з Predator11

### Якщо потрібно перенести дані

```bash
# 1. Створити дамп з контейнера
cd ../Predator11
docker compose ps  # Перевірити що контейнери запущені

cd ../predator12-local
make dump

# 2. Відновити в локальну БД
make restore
```

Детальніше: див. `migration_plan.md`

## 🐞 Дебагінг у VS Code

### Запустити з дебагером

1. Відкрити VS Code
2. `F5` або Debug panel → Вибрати конфігурацію:
   - `🐍 Python: FastAPI Backend Debug` - тільки backend
   - `🌐 Node: Frontend Debug` - тільки frontend
   - `🚀 Full Stack Debug` - все разом

### Breakpoints

- Backend: Поставити breakpoint в `backend/main.py` або в агентах
- Frontend: Поставити breakpoint в `frontend/src/` файлах

## 📁 Структура проекту

```
predator12-local/
├── backend/              # Python FastAPI API
│   ├── main.py          # Головний файл
│   ├── requirements.txt # Залежності
│   └── alembic/         # Міграції БД
├── frontend/            # React + Vite
│   ├── src/             # Вихідний код
│   ├── package.json     # Залежності
│   └── vite.config.ts   # Конфігурація
├── agents/              # AI агенти
├── scripts/             # Допоміжні скрипти
├── .vscode/             # VS Code конфігурація
├── local_storage/       # Локальні файли
├── logs/                # Логи
└── backups/             # Бекапи БД
```

## 🛠️ Корисні команди

```bash
# Показати всі команди
make help

# Статус сервісів
make status

# Очистити кеш
make clean

# Запустити тести
make test

# Створити бекап БД
make backup

# Показати логи
make logs
```

## 🔗 Посилання

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## ⚠️ Типові помилки

### Помилка: "Port already in use"

```bash
# Знайти процес
lsof -ti:8000  # Backend
lsof -ti:3000  # Frontend

# Вбити процес
kill -9 $(lsof -ti:8000)
```

### Помилка: "Cannot connect to database"

```bash
# Перевірити PostgreSQL
brew services list | grep postgresql

# Перезапустити
brew services restart postgresql

# Перевірити статус
psql -h 127.0.0.1 -U postgres -c "SELECT 1;"
```

### Помилка: "Module not found"

```bash
# Backend
source .venv/bin/activate
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install
```

### Помилка: "Migration failed"

```bash
# Очистити БД і почати заново
psql -U predator_user -d predator -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cd backend && alembic upgrade head
```

## 📚 Додаткова документація

- Повна документація: `README.md`
- План міграції: `migration_plan.md`
- Налаштування: `.env.example`
- VS Code конфіги: `.vscode/`

## 💡 Поради

1. **Використовуйте VS Code Tasks** для швидкого запуску
2. **Налаштуйте .env** перед першим запуском
3. **Створюйте бекапи** перед великими змінами: `make backup`
4. **Запускайте smoke тести** після змін: `make smoke`
5. **Читайте логи** при помилках: `tail -f logs/predator.log`

## 🆘 Допомога

Якщо нічого не працює:

```bash
# Повне перевстановлення
make clean
rm -rf .venv node_modules
make install
make initdb
make migrate
```

---

**🎉 Готово! Тепер можна розробляти!**

Наступні кроки:

1. Відкрити http://localhost:3000
2. Перевірити API на http://localhost:8000/docs
3. Почати кодити! 🚀
