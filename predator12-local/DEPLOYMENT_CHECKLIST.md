# ✅ Чек-ліст розгортання Predator12

## 📋 Acceptance Criteria

Система вважається **готовою до розробки**, коли всі пункти виконані:

### 1. 🗂️ Структура проекту

- [ ] Папка `predator12-local` створена
- [ ] Всі файли з Predator11 скопійовані
- [ ] Структура папок коректна:
  - [ ] `backend/` - Python код
  - [ ] `frontend/` - React код
  - [ ] `agents/` - AI агенти
  - [ ] `scripts/` - допоміжні скрипти
  - [ ] `.vscode/` - конфігурації VS Code
  - [ ] `smoke_tests/` - тести
  - [ ] `backups/` - бекапи (створюється автоматично)
  - [ ] `logs/` - логи (створюється автоматично)
  - [ ] `local_storage/` - файли (створюється автоматично)

### 2. 📄 Документація

- [ ] `README.md` - повна документація проекту
- [ ] `QUICK_START.md` - інструкції швидкого старту
- [ ] `migration_plan.md` - план міграції даних
- [ ] `DEPLOYMENT_CHECKLIST.md` - цей чек-ліст
- [ ] `.env.example` - приклад конфігурації

### 3. ⚙️ Конфігурація

- [ ] Файл `.env` створений з `.env.example`
- [ ] Паролі БД налаштовані в `.env`
- [ ] API ключі додані (якщо потрібно)
- [ ] Локальні шляхи налаштовані
- [ ] `Makefile` працює коректно

### 4. 🛠️ Залежності

#### Python Backend

- [ ] Python 3.10+ встановлений
- [ ] Віртуальне середовище `.venv` створене
- [ ] Залежності з `requirements.txt` встановлені
- [ ] `uvicorn` доступний
- [ ] `alembic` доступний
- [ ] `pytest` доступний (для тестів)

#### Node.js Frontend

- [ ] Node.js 18+ встановлений
- [ ] `npm` або `yarn` доступний
- [ ] Залежності з `package.json` встановлені
- [ ] `node_modules/` створена
- [ ] Vite працює

### 5. 🗄️ База даних

- [ ] PostgreSQL встановлений локально
- [ ] PostgreSQL запущений
- [ ] Користувач `predator_user` створений
- [ ] База даних `predator` створена
- [ ] Права доступу налаштовані
- [ ] Підключення працює
- [ ] Міграції виконані (`alembic upgrade head`)
- [ ] Таблиці створені

#### Тест підключення:

```bash
psql -h 127.0.0.1 -U predator_user -d predator -c "SELECT 1;"
```

### 6. 🔧 Додаткові сервіси (опційно)

- [ ] Redis встановлений (для Celery)
- [ ] Redis запущений
- [ ] Підключення до Redis працює

### 7. 📦 Скрипти

Всі скрипти виконувані (`chmod +x`):

- [ ] `scripts/init_local_db.sh`
- [ ] `scripts/migrate_db.sh`
- [ ] `scripts/pg_dump_from_container.sh`
- [ ] `scripts/pg_restore_to_local.sh`
- [ ] `smoke_tests/run_smoke.sh`
- [ ] `smoke_tests/python_smoke.py`

### 8. 🎯 VS Code Конфігурація

- [ ] `.vscode/tasks-local.json` створений
- [ ] `.vscode/launch.json` створений
- [ ] `.vscode/settings-local.json` створений
- [ ] Tasks доступні в Command Palette
- [ ] Launch конфігурації доступні в Debug панелі

### 9. 🚀 Запуск Backend

- [ ] Backend запускається: `make backend`
- [ ] Backend доступний на `http://localhost:8000`
- [ ] Health endpoint працює: `http://localhost:8000/health`
- [ ] API docs доступні: `http://localhost:8000/docs`
- [ ] Немає критичних помилок в логах

#### Тест:

```bash
curl http://localhost:8000/health
# Очікується: {"status": "ok"} або подібне
```

### 10. 🌐 Запуск Frontend

- [ ] Frontend запускається: `make frontend`
- [ ] Frontend доступний на `http://localhost:3000`
- [ ] Сторінка завантажується
- [ ] Немає помилок в консолі браузера
- [ ] Assets завантажуються

#### Тест:

```bash
curl http://localhost:3000
# Очікується: HTML код сторінки
```

### 11. 🧪 Smoke Тести

- [ ] Smoke тести запускаються: `make smoke`
- [ ] Успішність >= 90%
- [ ] Всі критичні тести проходять:
  - [ ] Підключення до БД
  - [ ] Backend health
  - [ ] Frontend доступність
  - [ ] Файлове сховище

#### Запуск:

```bash
make smoke
# Або
./smoke_tests/run_smoke.sh
```

### 12. 📊 Міграція даних (якщо потрібно)

- [ ] Дамп з Predator11 створений
- [ ] Дамп відновлений в локальну БД
- [ ] Файли з MinIO скопійовані
- [ ] Дані доступні через API
- [ ] Таблиці містять дані

#### Перевірка:

```bash
PGPASSWORD=changeme psql -h 127.0.0.1 -U predator_user -d predator -c "\dt"
```

### 13. 🔍 Функціональність

- [ ] API ендпоінти відповідають
- [ ] Frontend відображає дані
- [ ] AI агенти можуть виконувати запити (якщо налаштовані)
- [ ] Файли можна завантажувати/скачувати
- [ ] Логування працює

### 14. 🛡️ Безпека та Конфігурація

- [ ] `.env` не в git (є в `.gitignore`)
- [ ] Паролі не стандартні (не "changeme" в продакшн)
- [ ] API ключі налаштовані (якщо потрібно)
- [ ] CORS налаштований правильно

### 15. 📝 Git

- [ ] Репозиторій ініціалізований (якщо потрібно)
- [ ] `.gitignore` налаштований
- [ ] Початковий коміт зроблений
- [ ] Remote repository налаштований (якщо потрібно)

## 🎯 Фінальна перевірка

### Швидкий тест (5 хв)

```bash
# 1. Статус сервісів
make status

# 2. Smoke тести
make smoke

# 3. Мануальна перевірка
open http://localhost:8000/docs
open http://localhost:3000

# 4. Тест API
curl -X POST http://localhost:8000/api/test \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

### Результати мають бути:

- ✅ Backend відповідає на всі запити
- ✅ Frontend завантажується і працює
- ✅ Smoke тести >= 90% успішності
- ✅ Немає критичних помилок в логах

## 📊 Критерії готовності

| Критерій               | Мінімум | Рекомендовано |
| ---------------------- | ------- | ------------- |
| Smoke тести успішність | 70%     | 90%+          |
| Backend response time  | < 1s    | < 300ms       |
| Frontend load time     | < 5s    | < 2s          |
| БД таблиць             | > 0     | > 5           |
| API endpoints          | > 0     | > 10          |

## 🚨 Якщо щось не працює

### Backend не запускається

```bash
# Перевірка
source .venv/bin/activate
python -c "import backend.main"

# Переінсталяція
rm -rf .venv
make install
```

### Frontend не запускається

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### БД не підключається

```bash
# Перевірка PostgreSQL
brew services list | grep postgresql
brew services restart postgresql

# Реініціалізація
make initdb
```

### Smoke тести провалюються

```bash
# Перевірка що все запущено
ps aux | grep uvicorn
ps aux | grep vite

# Перевірка портів
lsof -i :8000
lsof -i :3000

# Перезапуск
make clean
make dev
```

## ✅ Фінальний чек-ліст

Відмітьте коли все готово:

- [ ] Всі залежності встановлені
- [ ] БД ініціалізована і працює
- [ ] Backend запущений і відповідає
- [ ] Frontend запущений і працює
- [ ] Smoke тести проходять (>90%)
- [ ] VS Code налаштований
- [ ] Документація прочитана
- [ ] Можу розпочати розробку! 🎉

## 📞 Наступні кроки

Після виконання всього чек-ліста:

1. **Почати розробку**
   - Відкрити VS Code
   - Запустити Full Stack Debug (F5)
   - Почати кодити!

2. **Налаштувати під себе**
   - Додати свої API ключі
   - Налаштувати AI моделі
   - Додати свої агенти

3. **Створити резервні копії**

   ```bash
   make backup
   ```

4. **Регулярно тестувати**
   ```bash
   make smoke
   make test
   ```

---

**🏆 Вітаємо! Predator12 готовий до розробки!**

Дата виконання чек-ліста: **\*\***\_\_\_**\*\***

Підпис: **\*\***\_\_\_**\*\***
