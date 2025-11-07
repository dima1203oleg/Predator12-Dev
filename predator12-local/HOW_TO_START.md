# 🎯 ЯК ПОЧАТИ РОБОТУ З PREDATOR12

**Ласкаво просимо до Predator12 - локальне dev-середовище готове!**

---

## 🚀 Три простих кроки

### Крок 1: Перейдіть у директорію проекту

```bash
cd /Users/dima/Documents/Predator12/predator12-local
```

### Крок 2: Запустіть автоматичне налаштування

```bash
./quick-setup.sh
```

Цей скрипт **автоматично**:

- ✅ Перевірить prerequisites (Python, Node.js, PostgreSQL)
- ✅ Перевірить доступність портів
- ✅ Створить .env файл з налаштуваннями
- ✅ Встановить всі залежності (backend + frontend)
- ✅ Ініціалізує базу даних PostgreSQL
- ✅ Виконає міграції
- ✅ Запустить smoke тести

### Крок 3: Запустіть dev-середовище

```bash
make dev
```

**Або вручну** у двох терміналах:

Термінал 1 (Backend):

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Термінал 2 (Frontend):

```bash
cd frontend
npm run dev
```

### Крок 4: Відкрийте у браузері

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Backend API**: http://localhost:8000

---

## 📚 Альтернативні способи

### Спосіб 1: Інтерактивне меню (найпростіше)

```bash
cd predator12-local
./predator11.sh
```

Виберіть опцію з меню:

- 🚀 Dev - Запуск розробки
- 🧪 Test - Тестування
- 📊 Monitor - Моніторинг
- 🔒 Security - Безпека
- 💾 Backup - Резервні копії

### Спосіб 2: VS Code Tasks

1. Відкрийте `predator12-local/` у VS Code
2. Натисніть `Cmd+Shift+P`
3. Виберіть "Tasks: Run Task"
4. Виберіть потрібну задачу:
   - "Start Backend"
   - "Start Frontend"
   - "Run Migrations"
   - і т.д.

### Спосіб 3: Makefile команди

```bash
make setup    # Перевірка системи
make dev      # Запуск розробки
make test     # Тестування
make smoke    # Швидкі тести
```

---

## 📖 Документація

### Для початківців:

1. **START_HERE.md** - Почніть звідси! (356 рядків)
2. **QUICK_START.md** - 5-хвилинний гід
3. **QUICK_REFERENCE.md** - Швидкий довідник команд

### Для досвідчених:

1. **README.md** - Повна документація (502 рядки)
2. **LOCAL_DEV_STATUS.md** - Детальний статус (563 рядки)
3. **FINAL_COMPLETION_REPORT.md** - Звіт про завершення (400+ рядків)

### Для DevOps:

1. **migration_plan.md** - План міграції даних
2. **DEPLOYMENT_CHECKLIST.md** - 100+ критеріїв приймання
3. **Makefile** - Всі команди автоматизації

---

## 🔧 Що робити при проблемах?

### База даних не підключається?

```bash
brew services restart postgresql@15
```

### Порти зайняті?

```bash
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>  # Вбити процес
```

### Залежності не встановлюються?

```bash
# Backend
cd backend
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### Потрібна допомога?

```bash
make help              # Список команд
./predator11.sh --help # Допомога
```

Або прочитайте **QUICK_REFERENCE.md** для детального troubleshooting.

---

## ✅ Перевірка що все працює

### Швидка перевірка (1 хвилина):

```bash
./smoke_tests/run_smoke.sh
```

### Детальна перевірка (3-5 хвилин):

```bash
cd smoke_tests
python3.11 python_smoke.py
```

### Статус системи:

```bash
make status
# або
./predator11.sh check
```

---

## 🎓 Наступні кроки

### Розробка Backend:

1. Відкрийте `backend/app/` у VS Code
2. Внесіть зміни в код
3. Hot reload спрацює автоматично
4. Перевірте: http://localhost:8000/docs

### Розробка Frontend:

1. Відкрийте `frontend/src/` у VS Code
2. Внесіть зміни в компоненти
3. HMR оновить сторінку автоматично
4. Перевірте: http://localhost:3000

### Full Stack Debug:

1. Натисніть F5 у VS Code
2. Виберіть "Full Stack Debug"
3. Breakpoints працюватимуть на backend та frontend!

### Додавання нової таблиці:

```bash
cd backend
source venv/bin/activate
alembic revision -m "add new table"
# Редагуйте файл міграції
./scripts/migrate_db.sh
```

---

## 📊 Корисні команди

```bash
# Логи
make logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Тести
make test
make smoke

# Безпека
make security

# Backup
make backup

# Моніторинг
make monitor

# Очищення
make clean
```

---

## 🎉 Готово!

Ви готові до розробки! Всі компоненти налаштовані та готові до використання.

**Для швидкого старту**:

```bash
cd predator12-local && ./quick-setup.sh && make dev
```

**Для огляду проекту**:

```bash
../project-overview.sh
```

---

## 📞 Підтримка

- **Документація**: всі .md файли в директорії
- **Команди**: `make help` або `./predator11.sh --help`
- **Статус**: `make status`

---

**Успішної розробки! 🚀**

_Створено командою Predator12_  
_Дата: 5 жовтня 2025 р._
