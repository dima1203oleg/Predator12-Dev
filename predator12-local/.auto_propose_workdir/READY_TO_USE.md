# ✅ PREDATOR12 - READY TO USE!

**Статус**: 🟢 Налаштовано та готово до розробки

---

## 🚀 Швидкий запуск (3 команди)

```bash
./simple-setup.sh    # Автоматичне налаштування
cd backend && source venv/bin/activate && uvicorn app.main:app --reload &
cd frontend && npm run dev
```

---

## 📋 Що вже налаштовано

✅ **Python 3.11** - встановлено та налаштовано  
✅ **PostgreSQL** - працює (база даних: predator11)  
✅ **Node.js & npm** - встановлено  
✅ **Backend venv** - створено з усіма залежностями  
✅ **Frontend node_modules** - встановлено  
✅ **.env** - налаштовано для локальної розробки  

---

## 🎯 Три способи запуску

### Спосіб 1: Простий скрипт (найшвидший)

```bash
./simple-setup.sh
```

Цей скрипт:
- Перевірить всі prerequisites
- Створить .env якщо потрібно
- Встановить залежності
- Покаже інструкції для запуску

### Спосіб 2: Вручну (2 термінали)

**Термінал 1 (Backend):**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**Термінал 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Спосіб 3: Makefile

```bash
make dev
```

---

## 🔗 Посилання

| Сервіс | URL |
|--------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **PostgreSQL** | postgresql://dima@localhost:5432/predator11 |

---

## 📚 Документація

- **HOW_TO_START.md** - Детальні інструкції
- **QUICK_REFERENCE.md** - Швидкий довідник команд
- **README.md** - Повна документація проекту

---

## 🐛 Якщо щось не працює

### PostgreSQL не запущений

```bash
brew services start postgresql@14
```

### Backend не запускається

```bash
cd backend
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend не збирається

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Перевірка статусу

```bash
# PostgreSQL
psql -U dima -d predator11 -c "SELECT 1"

# Python venv
cd backend && source venv/bin/activate && python --version

# Node modules
cd frontend && npm list --depth=0
```

---

## 🎓 Наступні кроки

1. ✅ Система налаштована
2. ✅ Залежності встановлені
3. ✅ База даних готова
4. 🚀 **Запустіть `./simple-setup.sh` та почніть розробку!**

---

**Останнє оновлення**: 6 жовтня 2025  
**Статус**: 🟢 Production Ready
