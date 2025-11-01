# 🚀 PREDATOR12 - Швидкий старт

**Дата:** 6 жовтня 2025 р.  
**Версія:** Python 3.11 + Modern Stack

---

## ⚡ Найшвидший спосіб (для досвідчених)

```bash
# 1. Перейти в проект
cd /Users/dima/Documents/Predator12/predator12-local

# 2. Перевірити порти
bash scripts/manage-ports.sh check

# 3. Створити venv + встановити залежності
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -U pip && pip install -r requirements-311-modern.txt

# 4. Налаштувати .env
cp .env.example .env
# Відредагувати .env

# 5. Міграції
alembic upgrade head

# 6. Запуск
cd ..
bash scripts/start-all.sh
```

---

## 📋 Покрокова інструкція

### Крок 1: Перевірка системи

```bash
# Python 3.11
python3.11 --version
# Очікувано: Python 3.11.x

# PostgreSQL
psql --version
brew services list | grep postgresql

# Git
git --version
```

### Крок 2: Клонування/перехід до проекту

```bash
cd /Users/dima/Documents/Predator12/predator12-local
git status
git log --oneline -5
```

### Крок 3: Перевірка портів

```bash
# Перевірити всі порти
bash scripts/manage-ports.sh check

# Якщо потрібно звільнити (окрім PostgreSQL)
bash scripts/manage-ports.sh free-dev
```

### Крок 4: Створення Python venv

```bash
cd backend

# Створити venv з Python 3.11
python3.11 -m venv venv

# Активувати
source venv/bin/activate

# Перевірити версію
python --version  # має бути 3.11.x

# Оновити pip
pip install --upgrade pip setuptools wheel

# Встановити залежності
pip install -r requirements-311-modern.txt
```

**Очікуваний час:** 5-10 хвилин (залежно від інтернету)

### Крок 5: Health Check

```bash
# З активованим venv
cd ..
python scripts/health-check.py
```

**Якщо помилки:**
- Перевірте версію Python: `python --version`
- Переустановіть пакети: `pip install --force-reinstall -r backend/requirements-311-modern.txt`
- Перегляньте PORTS_READY.md для troubleshooting

### Крок 6: Налаштування .env

```bash
cd backend

# Якщо є .env.example
cp .env.example .env

# Або створити новий
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/predator12

# Redis
REDIS_URL=redis://localhost:6379/0

# OpenSearch (optional)
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200

# App
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
EOF

# Відредагувати
nano .env  # або vim, code, etc.
```

### Крок 7: Ініціалізація БД

```bash
# Перевірити PostgreSQL
psql -U postgres -c "SELECT version();"

# Створити БД (якщо не існує)
createdb -U postgres predator12

# Запустити міграції
alembic upgrade head
```

**Якщо помилки alembic:**
- Перевірте DATABASE_URL у .env
- Перевірте підключення: `psql -U postgres -d predator12`
- Перегляньте alembic/versions/

### Крок 8: Запуск сервісів

**Варіант A: Автоматичний (рекомендовано)**

```bash
cd /Users/dima/Documents/Predator12/predator12-local
bash scripts/start-all.sh
```

Скрипт запитає:
- Звільнити порти? (якщо зайняті)
- Запустити OpenSearch?
- Запустити Celery Worker?
- Запустити Frontend?

**Варіант B: Ручний**

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Celery (опціонально)
cd backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info

# Terminal 3: Frontend (якщо є)
cd frontend
npm install
npm run dev
```

### Крок 9: Перевірка

```bash
# Backend API
curl http://localhost:8000/health

# OpenAPI Docs
open http://localhost:8000/docs

# Redoc
open http://localhost:8000/redoc

# Frontend (якщо запущено)
open http://localhost:3000
```

---

## 🛑 Зупинка

```bash
# Автоматична зупинка всього
bash scripts/stop-all.sh

# Або вручну (Ctrl+C в кожному терміналі)
```

---

## 🔧 Troubleshooting

### Порт зайнятий

```bash
# Подивитися який процес
lsof -i :8000

# Вбити процес
kill -9 <PID>

# Або через скрипт
bash scripts/manage-ports.sh free-single 8000
```

### Помилки імпортів

```bash
# Перевірити встановлені пакети
pip list | grep -i fastapi
pip list | grep -i sqlalchemy

# Переустановити
pip install --force-reinstall fastapi sqlalchemy

# Health check
python scripts/health-check.py
```

### PostgreSQL не підключається

```bash
# Перевірити статус
brew services list | grep postgres

# Запустити
brew services start postgresql@14

# Перевірити підключення
psql -U postgres -c "SELECT 1"
```

### Alembic помилки

```bash
# Перевірити історію міграцій
alembic history

# Перевірити поточну версію
alembic current

# Відкатити останню міграцію
alembic downgrade -1

# Застосувати заново
alembic upgrade head
```

---

## 📚 Корисні посилання

- **Документація:**
  - [README.md](README.md) - Основна інформація
  - [PORTS_READY.md](PORTS_READY.md) - Порти та запуск
  - [OPENSEARCH_SETUP_GUIDE.md](OPENSEARCH_SETUP_GUIDE.md) - OpenSearch для macOS
  - [MIGRATION_GUIDE_PYTHON311.md](MIGRATION_GUIDE_PYTHON311.md) - Міграція на Python 3.11

- **API:**
  - http://localhost:8000/docs - Swagger UI
  - http://localhost:8000/redoc - ReDoc
  - http://localhost:8000/openapi.json - OpenAPI Spec

- **Моніторинг:**
  - http://localhost:5555 - Celery Flower
  - http://localhost:5601 - OpenSearch Dashboards

---

## 🎯 Чек-лист готовності

- [ ] Python 3.11 встановлено
- [ ] PostgreSQL запущено
- [ ] Порти вільні (окрім 5432)
- [ ] venv створено
- [ ] Залежності встановлено
- [ ] Health check пройдено ✅
- [ ] .env налаштовано
- [ ] Міграції застосовано
- [ ] Backend запущено
- [ ] API працює (curl /health)

---

## 💡 Поради

1. **Завжди активуйте venv:** `source backend/venv/bin/activate`
2. **Перевіряйте порти перед запуском:** `bash scripts/manage-ports.sh check`
3. **Використовуйте health-check:** `python scripts/health-check.py`
4. **Перегляньте логи:** `tail -f logs/backend.log`
5. **Для продакшну:** Змініть SECRET_KEY, DEBUG=False у .env

---

## 🆘 Потрібна допомога?

1. Перегляньте [PORTS_READY.md](PORTS_READY.md) - детальні інструкції
2. Перевірте [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - типові проблеми
3. Запустіть health-check: `python scripts/health-check.py`
4. Перевірте git log: `git log --oneline -10`

---

**Готово! Приємної розробки на Predator12! 🚀**
