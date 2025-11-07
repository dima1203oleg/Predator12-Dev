# 🚀 Predator12 - Шпаргалка (Cheat Sheet)

Швидкий довідник команд для повсякденної роботи.

---

## 🎯 Найчастіше використовувані команди

### Активація середовища

```bash
cd /Users/dima/Documents/Predator12/predator12-local/backend
source venv/bin/activate
```

### Перевірка портів

```bash
bash scripts/manage-ports.sh check
```

### Запуск backend

```bash
# Спосіб 1: через uvicorn
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Спосіб 2: через скрипт
bash scripts/start-all.sh
```

### Health check

```bash
python scripts/health-check.py
```

### Перегляд логів

```bash
tail -f logs/backend.log
tail -f logs/celery.log
```

---

## 📦 Управління пакетами

### Встановлення/оновлення

```bash
source backend/venv/bin/activate
pip install -U pip
pip install -r backend/requirements-311-modern.txt
```

### Додати новий пакет

```bash
pip install package-name
pip freeze | grep package-name >> backend/requirements-311-modern.txt
```

### Перевірка встановлених пакетів

```bash
pip list
pip list | grep fastapi
```

---

## 🔧 Порти

### Перевірка всіх портів

```bash
bash scripts/manage-ports.sh check
```

### Звільнити dev-порти (8000, 3000, 5555)

```bash
bash scripts/manage-ports.sh free-dev
```

### Звільнити конкретний порт

```bash
bash scripts/manage-ports.sh free-single 8000
```

### Знайти процес на порту

```bash
lsof -i :8000
sudo lsof -i :8000  # якщо потрібен root
```

### Вбити процес

```bash
kill -9 <PID>
```

---

## 🗄️ База даних

### Підключення

```bash
psql -U postgres -d predator12
```

### Створити БД

```bash
createdb -U postgres predator12
```

### Міграції (Alembic)

```bash
cd backend && source venv/bin/activate

# Переглянути історію
alembic history

# Поточна версія
alembic current

# Застосувати всі міграції
alembic upgrade head

# Відкотити одну міграцію
alembic downgrade -1

# Створити нову міграцію
alembic revision --autogenerate -m "Description"
```

---

## 🧪 Тестування

### Запуск всіх тестів

```bash
cd backend && source venv/bin/activate
pytest
```

### З verbose output

```bash
pytest -v
```

### З coverage

```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

### Конкретний файл/тест

```bash
pytest tests/test_main.py
pytest tests/test_main.py::test_function_name
```

---

## 🔍 OpenSearch

### Перевірка статусу

```bash
curl http://localhost:9200/
curl -u admin:admin http://localhost:9200/  # з auth
```

### Список індексів

```bash
curl http://localhost:9200/_cat/indices?v
```

### Dashboards

```bash
open http://localhost:5601
```

### Запуск/зупинка (Homebrew)

```bash
brew services start opensearch
brew services stop opensearch
brew services restart opensearch
```

---

## 🐰 Celery

### Запуск worker

```bash
cd backend && source venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

### Flower (monitoring)

```bash
celery -A app.celery_app flower --port=5555
open http://localhost:5555
```

### Inspect tasks

```bash
celery -A app.celery_app inspect active
celery -A app.celery_app inspect registered
```

---

## 🔴 Redis

### Підключення

```bash
redis-cli
```

### Основні команди

```bash
redis-cli ping                # Перевірка
redis-cli keys '*'            # Всі ключі
redis-cli get key_name        # Отримати значення
redis-cli del key_name        # Видалити ключ
redis-cli flushall            # Очистити все (ОБЕРЕЖНО!)
```

### Запуск/зупинка

```bash
brew services start redis
brew services stop redis
```

---

## 🎨 VS Code

### Вибрати Python interpreter

```
Cmd+Shift+P → Python: Select Interpreter
```

### Перезавантажити вікно

```
Cmd+Shift+P → Developer: Reload Window
```

### Відкрити налаштування

```
Cmd+, → Settings
```

### Debug

```
F5 → Backend: FastAPI (debugpy)
```

### Виправити всі помилки VS Code

```bash
bash scripts/fix-vscode.sh
```

---

## 📝 Git

### Статус

```bash
git status
git status --short
```

### Додати зміни

```bash
git add file.py
git add .
```

### Commit

```bash
git commit -m "feat: description"

# Багаторядковий
git commit -F- <<'MSG'
feat: title

- point 1
- point 2
MSG
```

### Лог

```bash
git log --oneline -10
git log --graph --oneline -20
```

### Відкотити зміни

```bash
git checkout -- file.py
git restore file.py
```

---

## 🧹 Очистка

### Python cache

```bash
find . -type d -name "__pycache__" -exec rm -r {} +
find . -name "*.pyc" -delete
```

### Logs

```bash
rm logs/*.log
```

### Pytest cache

```bash
rm -rf .pytest_cache
```

### VS Code

```bash
rm -rf .vscode/*.backup.*
```

---

## 🔥 Troubleshooting

### Порт зайнятий

```bash
bash scripts/manage-ports.sh free-single 8000
```

### Imports не працюють

```bash
# Перевірити interpreter
which python

# Переустановити пакети
pip install --force-reinstall sqlalchemy psycopg fastapi
```

### PostgreSQL не підключається

```bash
brew services restart postgresql@14
psql -U postgres -c "SELECT 1"
```

### venv не активується

```bash
cd backend
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements-311-modern.txt
```

---

## 🌐 URL's

| Сервіс      | URL                                | Опис              |
| ----------- | ---------------------------------- | ----------------- |
| Backend API | http://localhost:8000              | FastAPI           |
| API Docs    | http://localhost:8000/docs         | Swagger UI        |
| ReDoc       | http://localhost:8000/redoc        | Alternative docs  |
| OpenAPI     | http://localhost:8000/openapi.json | OpenAPI spec      |
| Frontend    | http://localhost:3000              | Next.js           |
| Flower      | http://localhost:5555              | Celery monitoring |
| OpenSearch  | http://localhost:9200              | OpenSearch API    |
| Dashboards  | http://localhost:5601              | OpenSearch UI     |

---

## 📋 Змінні середовища (.env)

### Основні

```bash
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/predator12
REDIS_URL=redis://localhost:6379/0
```

### OpenSearch

```bash
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_USER=admin
OPENSEARCH_PASSWORD=admin
```

### Celery

```bash
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

---

## ⚡ Швидкі дії

### Повний перезапуск

```bash
bash scripts/stop-all.sh
bash scripts/start-all.sh
```

### Швидка перевірка

```bash
bash scripts/manage-ports.sh check
python scripts/health-check.py
curl http://localhost:8000/health
```

### Після git pull

```bash
source backend/venv/bin/activate
pip install -r backend/requirements-311-modern.txt
alembic upgrade head
```

---

**Тримай цей файл під рукою для швидкого доступу до команд! 🚀**
