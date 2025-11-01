# 🚀 PREDATOR12 - Ready to Launch!

**Статус:** ✅ ВСЕ ГОТОВО  
**Дата:** 6 жовтня 2025 р.  
**Python:** 3.11+ Modern Stack

---

## 📊 Поточний стан

✅ **Виконано:**
- [x] requirements-311-modern.txt оновлено (telethon, opensearch-py, faiss-cpu)
- [x] Scripts створені (manage-ports, health-check, start-all, stop-all)
- [x] Bash 3.x compatibility (замість zsh)
- [x] .gitignore налаштовано
- [x] Документація повна (QUICKSTART, PORTS_READY, OPENSEARCH_SETUP, DISABLE_KDM)
- [x] Git commits чисті
- [x] Порти перевірені (11 вільних)
- [x] PostgreSQL активний

⚠️ **Залишилось:**
- [ ] Відключити старе KDM середовище
- [ ] Створити новий Python 3.11 venv
- [ ] Встановити залежності
- [ ] Налаштувати .env
- [ ] Запустити систему

---

## 🎯 Швидкий старт (5 хвилин)

```bash
# 1. Перейти в проект
cd /Users/dima/Documents/Predator12/predator12-local

# 2. Відключити KDM (якщо потрібно)
bash scripts/disable-kdm.sh

# 3. Створити Python 3.11 venv
bash scripts/setup-venv.sh

# 4. Перевірити систему
bash scripts/system-check.sh

# 5. Запустити все
bash scripts/start-all.sh
```

---

## 📋 Детальні інструкції

### 1. Відключення KDM середовища

**Проблема:** Бачите "Активація середовища KDM..." при відкритті терміналу

**Рішення:**

```bash
# Автоматичне відключення
bash scripts/disable-kdm.sh

# Або вручну (див. DISABLE_KDM.md):
grep -rn "kdm" ~/.zshrc ~/.bashrc
# Закоментуйте знайдені рядки
nano ~/.zshrc
source ~/.zshrc
```

### 2. Створення Python 3.11 venv

```bash
# Автоматично (рекомендовано)
bash scripts/setup-venv.sh
```

Скрипт зробить:
- ✅ Перевірить Python 3.11
- ✅ Backup старого venv
- ✅ Створить новий venv
- ✅ Встановить всі залежності з requirements-311-modern.txt
- ✅ Протестує імпорти
- ✅ Налаштує VS Code

**Вручну:**

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-311-modern.txt
```

### 3. Перевірка системи

```bash
# Повна перевірка
bash scripts/system-check.sh
```

Перевіряє:
- Python 3.11 ✅
- PostgreSQL ✅
- Redis ✅
- Структуру проекту ✅
- venv ✅
- Порти ✅
- .env ✅
- OpenSearch ✅
- Node.js ✅

### 4. Налаштування .env

```bash
cd backend
cp .env.example .env
nano .env  # або code .env
```

**Мінімальні параметри:**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/predator12
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-me
DEBUG=True
```

### 5. Міграції БД

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### 6. Запуск системи

**Автоматично:**

```bash
bash scripts/start-all.sh
```

**Вручну:**

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Celery (опціонально)
cd backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info

# Terminal 3: Frontend (якщо є)
cd frontend
npm install
npm run dev
```

### 7. Перевірка

```bash
# Health check
curl http://localhost:8000/health

# API Docs
open http://localhost:8000/docs

# Frontend
open http://localhost:3000
```

---

## 🛠️ Доступні скрипти

### Управління портами

```bash
# Перевірити порти
bash scripts/manage-ports.sh check

# Звільнити dev-порти (8000, 3000, 5555)
bash scripts/manage-ports.sh free-dev

# Звільнити конкретний порт
bash scripts/manage-ports.sh free-single 8000

# Довідка
bash scripts/manage-ports.sh help
```

### Управління venv

```bash
# Створити/пересоздати venv
bash scripts/setup-venv.sh

# Перевірити систему
bash scripts/system-check.sh

# Health check
source backend/venv/bin/activate
python scripts/health-check.py
```

### Управління сервісами

```bash
# Запустити все
bash scripts/start-all.sh

# Зупинити все
bash scripts/stop-all.sh
```

### Відключення KDM

```bash
# Автоматичне відключення
bash scripts/disable-kdm.sh
```

---

## 📚 Документація

| Файл | Опис |
|------|------|
| [QUICKSTART.md](QUICKSTART.md) | Покрокова інструкція для новачків |
| [PORTS_READY.md](PORTS_READY.md) | Порти, сервіси, troubleshooting |
| [OPENSEARCH_SETUP_GUIDE.md](OPENSEARCH_SETUP_GUIDE.md) | OpenSearch для macOS |
| [DISABLE_KDM.md](DISABLE_KDM.md) | Відключення старого KDM середовища |
| [ALL_FIXES_APPLIED.md](ALL_FIXES_APPLIED.md) | Підсумок всіх виправлень |
| [MIGRATION_GUIDE_PYTHON311.md](MIGRATION_GUIDE_PYTHON311.md) | Міграція на Python 3.11 |

---

## 🎓 Корисні команди

### Git

```bash
# Статус
git status
git log --oneline -10

# Останні зміни
git diff HEAD~1

# Останній commit
git show
```

### Python

```bash
# Активувати venv
source backend/venv/bin/activate

# Перевірити версію
python --version
pip --version

# Список пакетів
pip list

# Оновити пакет
pip install --upgrade fastapi
```

### PostgreSQL

```bash
# Підключитися
psql -U postgres -d predator12

# Список таблиць
\dt

# Перевірити версію
SELECT version();

# Вийти
\q
```

### Redis

```bash
# Підключитися
redis-cli

# Пінг
PING

# Перевірити ключі
KEYS *

# Вийти
quit
```

---

## 🐛 Troubleshooting

### "Активація середовища KDM..."

```bash
bash scripts/disable-kdm.sh
# або див. DISABLE_KDM.md
```

### Порт зайнятий

```bash
bash scripts/manage-ports.sh check
bash scripts/manage-ports.sh free-single 8000
```

### Python не 3.11

```bash
python3.11 --version  # перевірити наявність
bash scripts/setup-venv.sh  # пересоздати venv
```

### Помилки імпортів

```bash
source backend/venv/bin/activate
pip install --force-reinstall -r backend/requirements-311-modern.txt
python scripts/health-check.py
```

### PostgreSQL не підключається

```bash
brew services list | grep postgres
brew services restart postgresql@14
psql -U postgres -c "SELECT 1"
```

---

## ✅ Чек-лист готовності

### Базові вимоги
- [ ] macOS з Homebrew
- [ ] Python 3.11 встановлено
- [ ] PostgreSQL встановлено та запущено
- [ ] Git встановлено

### Налаштування проекту
- [ ] KDM відключено (якщо було)
- [ ] Python 3.11 venv створено
- [ ] Залежності встановлено
- [ ] Health check пройдено
- [ ] .env налаштовано
- [ ] Міграції БД застосовано

### Запуск
- [ ] Backend запущено (http://localhost:8000)
- [ ] API Docs доступні (http://localhost:8000/docs)
- [ ] Health endpoint працює (curl /health)
- [ ] PostgreSQL підключено
- [ ] Redis підключено (якщо використовується)

---

## 🎉 Готово!

Якщо всі чек-листи виконано:

```bash
bash scripts/start-all.sh
open http://localhost:8000/docs
```

**Welcome to Predator12! 🚀**

---

## 🆘 Потрібна допомога?

1. **System check:**
   ```bash
   bash scripts/system-check.sh
   ```

2. **Документація:**
   - QUICKSTART.md - швидкий старт
   - PORTS_READY.md - порти та сервіси
   - DISABLE_KDM.md - відключення KDM

3. **Логи:**
   ```bash
   tail -f logs/backend.log
   tail -f logs/celery.log
   ```

4. **Git history:**
   ```bash
   git log --oneline --graph -10
   ```

---

**Happy coding! 💪**
