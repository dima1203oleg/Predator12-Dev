# ✅ SETUP ЗАВЕРШЕНО!

**Дата**: 6 жовтня 2025 р.

---

## 🎉 Що зроблено:

### 1. Середовище ✅
- ✅ Python 3.11 встановлено та налаштовано
- ✅ Node.js та npm готові
- ✅ PostgreSQL 14 запущено
- ✅ Git налаштовано

### 2. База даних ✅
- ✅ Користувач `predator` створено
- ✅ База даних `predator11` створена
- ✅ Підключення працює

### 3. Залежності ✅
- ✅ Backend Python venv створено
- ✅ Backend залежності встановлено
- ✅ Frontend node_modules готові

---

## 🚀 Наступні кроки:

### Крок 1: Виконати міграції

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./scripts/migrate_db.sh
```

Або через Makefile:
```bash
make migrate
```

### Крок 2: Запустити backend

**У першому терміналі:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Або через Makefile:
```bash
make backend
```

### Крок 3: Запустити frontend

**У другому терміналі:**
```bash
cd frontend
npm run dev
```

Або через Makefile:
```bash
make frontend
```

### Крок 4: Відкрити у браузері

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🧪 Перевірка системи

### Швидка перевірка (1 хвилина):

```bash
./smoke_tests/run_smoke.sh
```

### Детальна перевірка (3-5 хвилин):

```bash
cd smoke_tests
/opt/homebrew/bin/python3.11 python_smoke.py
```

### Перевірка бази даних:

```bash
psql -U predator -d predator11 -c "\dt"
```

---

## 📋 Корисні команди

### Makefile:
```bash
make help       # Список команд
make setup      # Перевірка системи
make dev        # Запуск dev-середовища
make test       # Тести
make smoke      # Smoke тести
make status     # Статус системи
```

### VS Code:
1. Відкрийте проект у VS Code
2. `Cmd+Shift+P` → "Tasks: Run Task"
3. Виберіть потрібну задачу

### PostgreSQL:
```bash
# Запуск
brew services start postgresql

# Зупинка
brew services stop postgresql

# Перезапуск
brew services restart postgresql

# Статус
brew services list | grep postgresql

# Підключення
psql -U predator -d predator11
```

---

## 🐛 Troubleshooting

### База даних не підключається:
```bash
brew services restart postgresql
psql -U predator -d predator11
```

### Порти зайняті:
```bash
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>
```

### Python не знайдено:
```bash
# Додайте до ~/.zshrc:
export PATH="/opt/homebrew/bin:$PATH"
alias python3.11="/opt/homebrew/bin/python3.11"

# Перезавантажте shell:
source ~/.zshrc
```

---

## 📚 Документація

- **HOW_TO_START.md** - Як почати
- **QUICK_REFERENCE.md** - Швидкий довідник
- **README.md** - Повна документація
- **LOCAL_DEV_STATUS.md** - Статус налаштування

---

## ✅ Статус

**Система готова до розробки!**

Всі основні компоненти налаштовані:
- ✅ Python 3.11
- ✅ Node.js
- ✅ PostgreSQL
- ✅ Backend venv
- ✅ Frontend node_modules
- ✅ База даних

**Наступний крок**: Запустіть міграції та backend/frontend

```bash
# Міграції
./scripts/migrate_db.sh

# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend (новий термінал)
cd frontend && npm run dev
```

---

**Створено**: 6 жовтня 2025 р.  
**Статус**: ✅ Ready to develop
