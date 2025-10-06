# 📋 План міграції даних з Predator11 на Predator12

## 🎯 Мета
Перенести всі дані з контейнерного середовища Predator11 у локальну розробницьку версію Predator12 без втрати даних.

## 📊 Що потрібно мігрувати

### 1. База даних PostgreSQL
- **Джерело**: Docker контейнер `predator_db` або `postgres`
- **Призначення**: Локальний PostgreSQL на `127.0.0.1:5432`
- **Обсяг**: ~100-500MB (залежить від даних)

### 2. Файлове сховище (MinIO → Local)
- **Джерело**: MinIO контейнер `/data` bucket
- **Призначення**: `./local_storage/`
- **Обсяг**: ~50-200MB

### 3. Векторна БД (Qdrant)
- **Джерело**: Qdrant контейнер
- **Призначення**: Mock або локальний Qdrant
- **Обсяг**: ~10-50MB

### 4. Redis дані (опційно)
- **Джерело**: Redis контейнер
- **Призначення**: Локальний Redis або не потрібно для dev

## 🔄 Порядок міграції

### Крок 1: Підготовка (10 хв)

```bash
# 1. Переконайтесь що контейнери Predator11 запущені
cd /Users/dima/Documents/Predator12/Predator11
docker compose ps

# 2. Встановіть локальний PostgreSQL
brew install postgresql
brew services start postgresql

# 3. Встановіть локальний Redis (опційно)
brew install redis
brew services start redis

# 4. Перейдіть в predator12-local
cd /Users/dima/Documents/Predator12/predator12-local
```

### Крок 2: Експорт даних з контейнерів (15-20 хв)

#### 2.1. Експорт PostgreSQL
```bash
# Варіант А: Автоматичний експорт
make dump

# Варіант Б: Ручний експорт
# Знайти назву контейнера
docker ps | grep postgres

# Створити дамп (SQL формат)
docker exec predator11-db-1 pg_dump -U postgres -d predator11 > backups/predator_export.sql

# Або бінарний дамп (швидший для великих БД)
docker exec predator11-db-1 pg_dump -U postgres -F c -d predator11 > backups/predator_export.dump
```

#### 2.2. Експорт файлів з MinIO
```bash
# Створити папку для експорту
mkdir -p backups/minio_export

# Варіант А: Через docker cp
MINIO_CONTAINER=$(docker ps | grep minio | awk '{print $1}')
docker cp $MINIO_CONTAINER:/data/predator11 backups/minio_export/

# Варіант Б: Через MinIO CLI (якщо встановлено)
mc alias set predator http://localhost:9001 minioadmin minioadmin
mc mirror predator/predator11 backups/minio_export/
```

#### 2.3. Експорт Qdrant векторів (опційно)
```bash
# Створити snapshot через API
curl -X POST "http://localhost:6333/collections/predator_vectors/snapshots" \
  -H "Content-Type: application/json"

# Завантажити snapshot
curl "http://localhost:6333/collections/predator_vectors/snapshots/snapshot_name" \
  --output backups/qdrant_snapshot.snapshot
```

### Крок 3: Підготовка локальної БД (5 хв)

```bash
# 1. Ініціалізувати локальну БД
make initdb

# Або вручну
./scripts/init_local_db.sh

# 2. Перевірити підключення
psql -h 127.0.0.1 -U predator_user -d predator -c "SELECT version();"
```

### Крок 4: Імпорт даних (10-15 хв)

#### 4.1. Імпорт PostgreSQL
```bash
# Варіант А: Автоматичний імпорт
make restore

# Варіант Б: Ручний імпорт SQL дампу
PGPASSWORD=changeme psql -h 127.0.0.1 -U predator_user -d predator < backups/predator_export.sql

# Варіант В: Імпорт бінарного дампу
pg_restore -h 127.0.0.1 -U predator_user -d predator --clean --if-exists backups/predator_export.dump
```

#### 4.2. Імпорт файлів
```bash
# Копіювати файли в локальне сховище
cp -r backups/minio_export/* local_storage/

# Встановити права
chmod -R 755 local_storage/
```

#### 4.3. Налаштування моделей
```bash
# Скопіювати конфігурації моделей
cp Predator11/agents/registry_production.yaml agents/registry_local.yaml

# Оновити шляхи в конфігурації
# Замінити http://modelsdk:3010 на http://localhost:3010
```

### Крок 5: Перевірка міграції (5 хв)

```bash
# 1. Перевірити структуру БД
PGPASSWORD=changeme psql -h 127.0.0.1 -U predator_user -d predator -c "\dt"

# 2. Перевірити кількість записів
PGPASSWORD=changeme psql -h 127.0.0.1 -U predator_user -d predator -c "
SELECT 
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC
LIMIT 10;"

# 3. Перевірити файли
ls -lh local_storage/

# 4. Тест підключення
python -c "
import psycopg2
conn = psycopg2.connect('postgresql://predator_user:changeme@127.0.0.1:5432/predator')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM information_schema.tables')
print(f'Tables count: {cur.fetchone()[0]}')
conn.close()
"
```

### Крок 6: Налаштування .env (5 хв)

```bash
# Копіювати приклад
cp .env.example .env

# Відредагувати .env (важливі параметри)
cat >> .env << EOF

# Локальні налаштування
DATABASE_URL=postgresql://predator_user:changeme@127.0.0.1:5432/predator
REDIS_URL=redis://127.0.0.1:6379/0
STORAGE_BACKEND=local
STORAGE_LOCAL_PATH=./local_storage
AUTH_BACKEND=dev

# API ключі (якщо є)
OPENROUTER_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
EOF
```

### Крок 7: Виконання міграцій (5 хв)

```bash
# Активувати віртуальне середовище
source .venv/bin/activate

# Виконати міграції
cd backend
alembic upgrade head
cd ..

# Або через Makefile
make migrate
```

### Крок 8: Запуск і тестування (10 хв)

```bash
# 1. Запустити backend (в окремому терміналі)
make backend

# 2. Запустити frontend (в окремому терміналі)
make frontend

# 3. Запустити smoke тести
make smoke

# 4. Перевірити вручну
# Backend: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

## 📊 Чек-ліст міграції

- [ ] Контейнери Predator11 запущені
- [ ] Локальний PostgreSQL встановлений і запущений
- [ ] Дамп PostgreSQL створений
- [ ] Файли з MinIO експортовані
- [ ] Локальна БД ініціалізована
- [ ] Дамп PostgreSQL імпортований
- [ ] Файли скопійовані в local_storage
- [ ] .env налаштований
- [ ] Міграції виконані
- [ ] Backend запускається без помилок
- [ ] Frontend запускається без помилок
- [ ] Smoke тести проходять
- [ ] API відповідає на запити
- [ ] Дані доступні через API

## 🚨 Можливі проблеми та рішення

### Проблема 1: Помилка підключення до PostgreSQL
```bash
# Рішення
brew services restart postgresql
# Або перевірити лог
tail -f /usr/local/var/log/postgres.log
```

### Проблема 2: Дамп занадто великий
```bash
# Використати бінарний формат з компресією
docker exec predator_db pg_dump -U postgres -F c -Z 9 -f /tmp/dump.gz predator11
docker cp predator_db:/tmp/dump.gz backups/
```

### Проблема 3: Конфлікт версій схеми
```bash
# Видалити всі таблиці і створити заново
psql -U predator_user -d predator -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Потім імпортувати дамп
```

### Проблема 4: Відсутні залежності Python
```bash
# Перевстановити все
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## 📈 Очікувані результати

Після успішної міграції:
- ✅ Локальна БД містить всі дані з продакшн
- ✅ Backend API працює на `localhost:8000`
- ✅ Frontend працює на `localhost:3000`
- ✅ Всі файли доступні через API
- ✅ AI агенти можуть виконувати запити
- ✅ Smoke тести проходять на 90%+

## 🕒 Загальний час міграції

- **Мінімум**: 45 хвилин (базова міграція)
- **Середнє**: 1-1.5 години (з тестуванням)
- **Максимум**: 2-3 години (з налагодженням проблем)

## 📞 Допомога

Якщо виникли проблеми:
1. Перевірте логи: `tail -f logs/predator.log`
2. Перевірте статус: `make status`
3. Запустіть діагностику: `make smoke`
4. Перегляньте документацію: `cat README.md`

---

**Останнє оновлення**: 5 жовтня 2025
**Версія плану**: 1.0
