# ✅ PREDATOR12 - Launch Checklist

**Швидкий чек-лист для запуску системи**

---

## 🎯 Перед початком

```bash
cd /Users/dima/Documents/Predator12/predator12-local
```

---

## 📋 Крок 1: Відключити KDM (якщо бачите "Активація KDM...")

```bash
bash scripts/disable-kdm.sh
```

**Або вручну:**
```bash
# Знайти KDM в конфігах
grep -rn "kdm" ~/.zshrc ~/.bashrc

# Закоментувати знайдені рядки
nano ~/.zshrc

# Перезавантажити shell
exec zsh
```

**Результат:** ✅ Термінал відкривається без "Активація KDM"

---

## 📋 Крок 2: Створити Python 3.11 venv

```bash
bash scripts/setup-venv.sh
```

**Або вручну:**
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-311-modern.txt
```

**Результат:** ✅ venv створено, всі пакети встановлено

---

## 📋 Крок 3: Перевірити систему

```bash
bash scripts/system-check.sh
```

**Очікуваний результат:**
```
✅ Python 3.11
✅ PostgreSQL
✅ venv
✅ Порти вільні
✅ Структура проекту
```

---

## 📋 Крок 4: Налаштувати .env

```bash
cd backend
cp .env.example .env
nano .env  # або code .env
```

**Мінімальні параметри:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/predator12
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=change-me-in-production
DEBUG=True
```

**Результат:** ✅ .env налаштовано

---

## 📋 Крок 5: Міграції БД

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

**Результат:** ✅ Таблиці створено

---

## 📋 Крок 6: Запустити систему

```bash
cd /Users/dima/Documents/Predator12/predator12-local
bash scripts/start-all.sh
```

**Результат:** ✅ Backend, Celery, Frontend запущено

---

## 📋 Крок 7: Перевірити

```bash
# Health check
curl http://localhost:8000/health

# API Docs
open http://localhost:8000/docs

# Frontend (якщо запущено)
open http://localhost:3000
```

**Результат:** ✅ Всі endpoints працюють

---

## ⚡ Швидкі команди

```bash
# Перевірка портів
bash scripts/manage-ports.sh check

# Перевірка системи
bash scripts/system-check.sh

# Запуск
bash scripts/start-all.sh

# Зупинка
bash scripts/stop-all.sh

# Health check
source backend/venv/bin/activate && python scripts/health-check.py
```

---

## 🐛 Troubleshooting

### Бачу "Активація KDM..."
```bash
bash scripts/disable-kdm.sh
```

### Порт зайнятий
```bash
bash scripts/manage-ports.sh free-single 8000
```

### Python не 3.11
```bash
python3.11 --version  # перевірити
bash scripts/setup-venv.sh  # пересоздати
```

### PostgreSQL не працює
```bash
brew services restart postgresql@14
```

### Помилки імпортів
```bash
source backend/venv/bin/activate
pip install --force-reinstall -r backend/requirements-311-modern.txt
```

---

## ✅ Фінальний чек-лист

- [ ] KDM відключено (якщо було)
- [ ] Python 3.11 venv створено
- [ ] Залежності встановлено
- [ ] system-check.sh пройдено
- [ ] .env налаштовано
- [ ] Міграції БД застосовано
- [ ] Backend запущено (localhost:8000)
- [ ] Health endpoint працює
- [ ] API Docs доступні (localhost:8000/docs)

---

## 🎉 Готово!

Якщо всі чекбокси виконано:

```bash
open http://localhost:8000/docs
```

**Welcome to Predator12! 🚀**

---

## 📚 Документація

- **READY_TO_LAUNCH.md** - повний гайд
- **QUICKSTART.md** - детальні інструкції
- **DISABLE_KDM.md** - відключення KDM
- **PORTS_READY.md** - порти та troubleshooting
