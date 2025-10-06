# 🚀 PREDATOR12 - Порти звільнено та готові до роботи!

**Дата:** 6 жовтня 2025 р.

---

## ✅ Статус портів

Всі необхідні порти для Predator12 перевірено та готові:

| Порт  | Сервіс                    | Статус    | Примітка                          |
|-------|---------------------------|-----------|-----------------------------------|
| 8000  | Backend FastAPI           | ✅ Вільний | Готовий до запуску               |
| 3000  | Frontend React/Next.js    | ✅ Вільний | Готовий до запуску               |
| 5432  | PostgreSQL                | ⚡ Активний | Запущений та готовий             |
| 6379  | Redis                     | ✅ Вільний | Готовий до запуску               |
| 9200  | OpenSearch                | ✅ Вільний | Готовий до запуску               |
| 5601  | OpenSearch Dashboards     | ✅ Вільний | Готовий до запуску               |
| 5672  | RabbitMQ                  | ✅ Вільний | Готовий до запуску               |
| 15672 | RabbitMQ Management       | ✅ Вільний | Готовий до запуску               |
| 6333  | Qdrant Vector DB          | ✅ Вільний | Готовий до запуску               |
| 9000  | MinIO S3                  | ✅ Вільний | Готовий до запуску               |
| 9001  | MinIO Console             | ✅ Вільний | Готовий до запуску               |
| 5555  | Celery Flower             | ✅ Вільний | Готовий до запуску               |

**Підсумок:** 11 портів вільних, 1 активний (PostgreSQL - як і очікувалося).

---

## 🛠️ Створені інструменти управління

### 1. Управління портами
```bash
# Перевірити статус всіх портів
./scripts/manage-ports.sh check

# Звільнити dev-порти (8000, 3000, 5555)
./scripts/manage-ports.sh free-dev

# Звільнити конкретний порт
./scripts/manage-ports.sh free-single 8000

# Звільнити всі порти
./scripts/manage-ports.sh free

# Довідка
./scripts/manage-ports.sh help
```

### 2. Health Check
```bash
# Перевірити всі залежності та готовність системи
python3 scripts/health-check.py

# Або через venv
source backend/venv/bin/activate
python scripts/health-check.py
```

### 3. Запуск всіх сервісів
```bash
# Запустити всі сервіси одразу (інтерактивно)
./scripts/start-all.sh

# Зупинити всі сервіси
./scripts/stop-all.sh
```

---

## 📋 Швидкий старт (Step by Step)

### Крок 1: Перевірка портів
```bash
cd /Users/dima/Documents/Predator12/predator12-local
./scripts/manage-ports.sh check
```

### Крок 2: Створення Python 3.11 venv (якщо ще не створено)
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements-311-modern.txt
```

### Крок 3: Health Check
```bash
source backend/venv/bin/activate
python scripts/health-check.py
```

### Крок 4: Налаштування .env
```bash
cd backend
cp .env.example .env
# Відредагуйте .env за потребою
```

### Крок 5: Міграції БД
```bash
source backend/venv/bin/activate
alembic upgrade head
```

### Крок 6: Запуск сервісів

**Варіант А: Автоматичний запуск всього**
```bash
./scripts/start-all.sh
```

**Варіант Б: Ручний запуск по черзі**
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

# Terminal 4: Celery Flower (опціонально)
cd backend
source venv/bin/activate
celery -A app.celery_app flower --port=5555
```

---

## 🔍 Перевірка роботи

### Backend API
```bash
# Health endpoint
curl http://localhost:8000/health

# API Docs
open http://localhost:8000/docs

# OpenAPI spec
curl http://localhost:8000/openapi.json | jq
```

### PostgreSQL
```bash
psql -U postgres -d predator12 -c "SELECT version();"
```

### Redis
```bash
redis-cli ping
# Очікувана відповідь: PONG
```

### OpenSearch (якщо запущено)
```bash
curl http://localhost:9200/
# або з auth
curl -u admin:admin http://localhost:9200/
```

---

## 📊 Моніторинг

### Логи
```bash
# Backend
tail -f logs/backend.log

# Celery
tail -f logs/celery.log

# Frontend
tail -f logs/frontend.log

# Flower
tail -f logs/flower.log
```

### Процеси
```bash
# Подивитися запущені сервіси
cat .running-services.txt

# Перевірити конкретний процес
ps aux | grep uvicorn
ps aux | grep celery
ps aux | grep node
```

### Системні ресурси
```bash
# CPU/Memory usage
top -pid $(cat .backend.pid)

# Мережеві з'єднання
lsof -i -P | grep LISTEN
```

---

## 🧪 Тестування

### Базові тести
```bash
source backend/venv/bin/activate
pytest tests/ -v
```

### Smoke tests
```bash
# Швидка перевірка критичних endpoints
pytest tests/smoke/ -v --tb=short
```

### Coverage
```bash
pytest tests/ --cov=app --cov-report=html
open htmlcov/index.html
```

---

## 🛑 Зупинка сервісів

### Автоматична зупинка
```bash
./scripts/stop-all.sh
```

### Ручна зупинка
```bash
# Backend
kill $(cat .backend.pid)

# Celery
kill $(cat .celery.pid)

# Flower
kill $(cat .flower.pid)

# Frontend
kill $(cat .frontend.pid)

# Або через порти
lsof -ti :8000 | xargs kill -9
lsof -ti :3000 | xargs kill -9
```

---

## 🔧 Troubleshooting

### Порт зайнятий
```bash
# Знайти процес
lsof -i :8000

# Вбити процес
kill -9 <PID>

# Або через скрипт
./scripts/manage-ports.sh free-single 8000
```

### venv не активується
```bash
# Пересоздати venv
rm -rf backend/venv
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements-311-modern.txt
```

### Помилки імпортів
```bash
# Перевірити встановлені пакети
pip list

# Переустановити requirements
pip install --force-reinstall -r requirements-311-modern.txt

# Health check
python scripts/health-check.py
```

### PostgreSQL не підключається
```bash
# Перевірити статус
brew services list | grep postgres

# Перезапустити
brew services restart postgresql@14

# Перевірити підключення
psql -U postgres -d predator12
```

### Redis не підключається
```bash
# Перевірити статус
brew services list | grep redis

# Перезапустити
brew services restart redis

# Перевірити
redis-cli ping
```

---

## 📚 Корисні посилання

- **Backend API Docs:** http://localhost:8000/docs
- **Celery Flower:** http://localhost:5555
- **OpenSearch Dashboards:** http://localhost:5601
- **MinIO Console:** http://localhost:9001

---

## ✅ Чек-лист готовності

- [x] Python 3.11 встановлено
- [x] Всі порти вільні (окрім PostgreSQL)
- [x] PostgreSQL запущено та доступний
- [x] requirements-311-modern.txt створено
- [x] Скрипти управління створено та виконувані
- [x] Структура проекту готова
- [x] Документація оновлена
- [x] .gitignore налаштовано
- [ ] venv створено та залежності встановлено
- [ ] .env налаштовано
- [ ] Міграції БД застосовано
- [ ] Backend запущено та працює
- [ ] Health check пройдено

---

## 🎯 Наступні кроки

1. **Створити venv та встановити залежності:**
   ```bash
   cd backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements-311-modern.txt
   ```

2. **Налаштувати .env:**
   ```bash
   cp .env.example .env
   # Відредагувати .env
   ```

3. **Запустити міграції:**
   ```bash
   alembic upgrade head
   ```

4. **Запустити все:**
   ```bash
   ./scripts/start-all.sh
   ```

5. **Перевірити роботу:**
   ```bash
   curl http://localhost:8000/health
   open http://localhost:8000/docs
   ```

---

**Система готова до розробки! 🚀**

Всі порти звільнено, інструменти створено, документація оновлена.
Приємної розробки на Predator12!
