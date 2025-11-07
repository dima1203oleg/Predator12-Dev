# 🚀 Predator12 Quick Reference

**Версія**: 1.0  
**Дата**: 5 жовтня 2025 р.

---

## ⚡ Найшвидший старт (3 команди)

```bash
cd predator12-local
./quick-setup.sh
make dev
```

**Готово!** Відкрийте http://localhost:3000

---

## 📋 Швидкі команди

### Автоматизація через скрипти

```bash
# Автоматичне налаштування всього
./quick-setup.sh

# Інтерактивне меню
./predator11.sh

# Огляд проекту
../project-overview.sh
```

### Makefile команди

```bash
make help       # Список всіх команд
make setup      # Перевірка prerequisites
make dev        # Запуск dev (backend + frontend)
make test       # Запуск тестів
make smoke      # Smoke тести
make prod       # Production деплой
make backup     # Backup системи
make monitor    # Моніторинг здоров'я
make clean      # Очищення
make status     # Статус системи
```

### Пряме управління

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (новий термінал)
cd frontend
npm run dev

# Smoke тести
./smoke_tests/run_smoke.sh
# або
cd smoke_tests && python3.11 python_smoke.py
```

### База даних

```bash
# Ініціалізація
./scripts/init_local_db.sh

# Міграції
./scripts/migrate_db.sh

# Експорт з Docker
./scripts/pg_dump_from_container.sh

# Імпорт в локальну БД
./scripts/pg_restore_to_local.sh

# Підключення до БД
psql -U predator -d predator -h localhost
```

---

## 🛠️ VS Code

### Tasks (Cmd+Shift+P → "Tasks: Run Task")

1. **Init Local DB** - Ініціалізація БД
2. **Run Migrations** - Міграції
3. **Start Backend** - Запуск FastAPI
4. **Start Frontend** - Запуск React/Vite
5. **Run Smoke Tests (Bash)**
6. **Run Smoke Tests (Python)**
7. **Dump from Container**
8. **Restore to Local**
9. **Create Dev User**
10. **Test DB Connection**
11. **View Logs**

### Debug (F5 або Run → Start Debugging)

- **Python: Backend FastAPI** - Debug backend
- **Python: Current File** - Debug поточний файл
- **Node: Frontend (Chrome)** - Debug frontend
- **Full Stack Debug** - Compound (backend + frontend)

---

## 📚 Документація

| Файл                           | Коли використовувати                |
| ------------------------------ | ----------------------------------- |
| **START_HERE.md**              | Перший раз працюєте з проектом      |
| **QUICK_START.md**             | Хочете швидко запустити за 5 хв     |
| **README.md**                  | Потрібна повна документація         |
| **LOCAL_DEV_STATUS.md**        | Хочете побачити статус налаштування |
| **FINAL_COMPLETION_REPORT.md** | Хочете детальний звіт               |
| **migration_plan.md**          | Плануєте міграцію даних             |
| **DEPLOYMENT_CHECKLIST.md**    | Готуєтесь до деплою                 |

---

## 🔗 Важливі URL

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:8000
API Docs:     http://localhost:8000/docs
PostgreSQL:   postgresql://localhost:5432/predator
```

---

## 🐛 Troubleshooting

### База даних не підключається

```bash
brew services restart postgresql@15
psql -U predator -d predator -h localhost
```

### Порти зайняті

```bash
# Перевірка портів
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL

# Якщо потрібно вбити процес
kill -9 <PID>
```

### Backend не запускається

```bash
cd backend
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend не збирається

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Залежності застарілі

```bash
# Python
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Node.js
cd frontend
npm update
```

---

## 📊 Перевірка статусу

```bash
# Швидка перевірка
make status

# Детальна перевірка
./predator11.sh check

# Smoke тести
./smoke_tests/run_smoke.sh
```

---

## 🔒 Безпека

```bash
# Аудит безпеки
make security

# Або вручну
./scripts/security-audit.sh
```

---

## 💾 Backup & Restore

```bash
# Backup
make backup

# Restore
make restore

# Або вручну
./scripts/backup-system.sh
```

---

## 🧪 Тестування

```bash
# Smoke тести (швидко)
make smoke

# Повні тести
make test

# Або вручну
./smoke_tests/run_smoke.sh
cd smoke_tests && python3.11 python_smoke.py
```

---

## 🎯 Типові задачі

### Створити нову функцію

1. Backend: додати код в `backend/app/`
2. Frontend: додати компоненти в `frontend/src/`
3. Тестувати: `make smoke`
4. Debug: F5 → "Full Stack Debug"

### Додати нову таблицю в БД

1. Створити міграцію: `cd backend && alembic revision -m "description"`
2. Редагувати міграцію в `backend/alembic/versions/`
3. Застосувати: `./scripts/migrate_db.sh` або `make migrate`

### Оновити залежності

```bash
# Python
cd backend && source venv/bin/activate
pip install <package>
pip freeze > requirements.txt

# Node.js
cd frontend
npm install <package>
```

### Перевірити логи

```bash
# Всі логи
make logs

# Backend логи
tail -f logs/backend.log

# Frontend логи
tail -f logs/frontend.log
```

---

## 🚀 Деплой

```bash
# Production деплой
make prod

# Або вручну
./scripts/deploy-production.sh
```

---

## 📞 Допомога

### Команди допомоги

```bash
make help              # Список команд Makefile
./predator11.sh --help # Допомога по головному скрипту
./quick-setup.sh --help # Допомога по setup
```

### Документація

- **START_HERE.md** - Початок роботи
- **README.md** - Повна документація
- **LOCAL_DEV_STATUS.md** - Статус налаштування

### Git

```bash
git status          # Поточний стан
git log --oneline   # Історія комітів
git diff            # Зміни
```

---

## 🎯 Чек-ліст для початку

- [ ] Перевірити prerequisites: `make setup`
- [ ] Створити .env: `cp .env.example .env`
- [ ] Ініціалізувати БД: `make initdb`
- [ ] Виконати міграції: `make migrate`
- [ ] Запустити smoke тести: `make smoke`
- [ ] Запустити dev: `make dev`
- [ ] Відкрити http://localhost:3000
- [ ] Перевірити API docs: http://localhost:8000/docs

---

**Статус**: ✅ Ready to use  
**Версія**: 1.0  
**Підтримка**: predator12-local/

---

**Pro tip**: Використовуйте `./quick-setup.sh` для автоматичного виконання всіх кроків! 🚀
