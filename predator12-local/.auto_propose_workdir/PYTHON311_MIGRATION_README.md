# 🚀 Python 3.11 + Modern Stack Migration

**Статус:** ✅ Ready  
**Дата:** 6 жовтня 2025 р.

---

## ⚡ Швидкий старт

### Автоматична міграція (рекомендовано):

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./migrate-to-python311.sh
```

Скрипт автоматично:
- ✅ Перевірить Python 3.11
- ✅ Створить backup venv та requirements
- ✅ Створить новий Python 3.11 venv
- ✅ Встановить modern dependencies
- ✅ Перевірить імпорти
- ✅ Створить звіт про міграцію

**Час виконання:** ~3-5 хвилин

---

## 📦 Що включено

### Modern Stack (requirements-311-modern.txt):

**Web Framework:**
- ✅ FastAPI 0.118.0
- ✅ Uvicorn 0.37.0 with uvloop
- ✅ Pydantic 2.11.10 (v2!)

**Database:**
- ✅ SQLAlchemy 2.0.43 (modern async)
- ✅ Alembic 1.16.5
- ✅ psycopg 3.2.10 (async PostgreSQL)

**Performance:**
- ✅ uvloop 0.21.0
- ✅ orjson 0.10.14
- ✅ aiocache 0.12.3

**AI/ML:**
- ✅ OpenAI 1.58.1
- ✅ Anthropic 0.42.0
- ✅ LangChain 0.3.14
- ✅ faiss-cpu 1.12.0

**Observability:**
- ✅ OpenTelemetry SDK
- ✅ Prometheus client
- ✅ Sentry SDK

**Logging:**
- ✅ structlog 25.4.0
- ✅ loguru 0.7.3

**Testing:**
- ✅ pytest 8.3.4
- ✅ pytest-asyncio 0.24.0
- ✅ pytest-cov 6.0.0

**Code Quality:**
- ✅ black 25.1.0
- ✅ ruff 0.9.3
- ✅ mypy 1.14.1

---

## 📋 Після міграції

### 1. Оновлення коду

**Pydantic v2:**
```python
# Було
user_dict = user.dict()
user_json = user.json()

# Стало
user_dict = user.model_dump()
user_json = user.model_dump_json()
```

**SQLAlchemy 2.0:**
```python
# Було
users = session.query(User).filter(User.name == "John").all()

# Стало
from sqlalchemy import select
stmt = select(User).where(User.name == "John")
users = session.scalars(stmt).all()
```

**psycopg3:**
```bash
# Було
DATABASE_URL=postgresql://user:pass@localhost/db

# Стало
DATABASE_URL=postgresql+psycopg://user:pass@localhost/db
```

### 2. Тестування

```bash
cd backend
source venv/bin/activate

# Тести
pytest tests/ -v

# Запуск сервера
uvicorn app.main:app --reload

# Перевірка API
curl http://localhost:8000/docs
```

---

## 📚 Документація

- **MIGRATION_GUIDE_PYTHON311.md** - Повний міграційний гід
- **requirements-311-modern.txt** - Список залежностей
- **migrate-to-python311.sh** - Автоматичний скрипт

---

## 🔄 Rollback

Якщо щось пішло не так:

```bash
cd backend

# Видалити новий venv
rm -rf venv

# Відновити старий
mv ../backups/migration-YYYYMMDD-HHMMSS/venv-old venv

# Активувати
source venv/bin/activate
```

Backup знаходиться в `backups/migration-*/`

---

## ✅ Checklist

- [ ] Запустити `./migrate-to-python311.sh`
- [ ] Перевірити версії пакетів
- [ ] Оновити код під Pydantic v2
- [ ] Оновити код під SQLAlchemy 2.0
- [ ] Оновити DATABASE_URL
- [ ] Запустити тести
- [ ] Запустити сервер
- [ ] Перевірити API endpoints

---

## 🎯 Переваги

**Продуктивність:**
- ⚡ uvloop для швидкого event loop
- ⚡ orjson для швидкої JSON серіалізації
- ⚡ psycopg3 з connection pooling
- ⚡ aiocache для async кешування

**Сучасність:**
- 🎯 Pydantic v2 (до 17x швидше)
- 🎯 SQLAlchemy 2.0 (modern async patterns)
- 🎯 Type hints для всього
- 🎯 Async/await всюди

**Якість:**
- 🔍 mypy для type checking
- 🔍 ruff для швидкого linting
- 🔍 black для форматування
- 🔍 pytest для тестування

---

**Готово! Ваш проект тепер використовує найсучасніший Python 3.11 стек!** 🎉
