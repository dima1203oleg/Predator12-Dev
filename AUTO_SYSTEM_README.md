# 🚀 PREDATOR12 AUTO-APPROVE & AUTO-START SYSTEM

Повна система автоматизації для проєкту Predator12 з автоматичним схваленням змін, запуском сервісів та управлінням.

## 📋 Зміст

- [Швидкий старт](#швидкий-старт)
- [Доступні скрипти](#доступні-скрипти)
- [Панель управління](#панель-управління)
- [Статус системи](#статус-системи)
- [Порти та сервіси](#порти-та-сервіси)

---

## 🚀 Швидкий старт

### Запуск всієї системи з автосхваленням:
```bash
./auto-approve.sh
```

Цей скрипт автоматично:
- ✅ Схвалює всі зміни в Git
- ✅ Створює commit з timestamp
- ✅ Пушить зміни на GitHub
- ✅ Запускає Backend API
- ✅ Запускає Frontend
- ✅ Показує статус системи

---

## 📜 Доступні скрипти

### 🎮 Головна панель управління
```bash
./control-panel.sh
```
Інтерактивне меню з усіма функціями управління системою.

### 🚀 Запуск системи
```bash
./auto-approve.sh
```
Автоматичне схвалення змін та запуск всіх сервісів.

### 🛑 Зупинка системи
```bash
./auto-stop.sh
```
Зупиняє всі процеси Backend та Frontend.

### 🔄 Перезапуск системи
```bash
./auto-restart.sh
```
Зупиняє та заново запускає всю систему.

### 📊 Перевірка статусу
```bash
./auto-status.sh
```
Показує поточний статус усіх компонентів системи.

---

## 🎮 Панель управління

Інтерактивна панель з наступними опціями:

1. **🚀 Start System** - Запуск з автосхваленням
2. **🛑 Stop System** - Зупинка всіх сервісів
3. **🔄 Restart System** - Перезапуск системи
4. **📊 Check Status** - Перевірка статусу
5. **🌐 Open Frontend** - Відкрити у браузері
6. **📚 Open API Docs** - Відкрити документацію API
7. **📝 View Backend Logs** - Переглянути логи Backend
8. **📝 View Frontend Logs** - Переглянути логи Frontend
9. **🔧 Git Auto-commit** - Автоматичний commit і push
0. **🚪 Exit** - Вихід

---

## 📊 Статус системи

### Backend API
- **Порт:** 8000
- **Health Check:** http://localhost:8000/health
- **API Docs:** http://localhost:8000/docs
- **Логи:** `logs/backend.log`

### Frontend
- **Порт:** 3000
- **URL:** http://localhost:3000
- **Логи:** `logs/frontend.log`

### Перевірка статусу:
```bash
# Швидка перевірка
./auto-status.sh

# Перевірка Backend
curl http://localhost:8000/health

# Перевірка Frontend
curl http://localhost:3000
```

---

## 🌐 Порти та сервіси

| Сервіс | Порт | URL | Статус |
|--------|------|-----|--------|
| Backend API | 8000 | http://localhost:8000 | ✅ |
| Frontend | 3000 | http://localhost:3000 | ✅ |
| API Docs | 8000 | http://localhost:8000/docs | ✅ |

---

## 🔧 Управління процесами

### Запуск окремих сервісів:

**Backend:**
```bash
cd /Users/dima/Documents/Predator12
python3.11 backend/hero_api.py
```

**Frontend:**
```bash
cd /Users/dima/Documents/Predator12/predator-analytics/frontend
npm run dev
```

### Зупинка окремих сервісів:

**По PID:**
```bash
kill $(cat .backend.pid)
kill $(cat .frontend.pid)
```

**По порту:**
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

---

## 📝 Логи

Всі логи зберігаються в директорії `logs/`:

```bash
# Backend логи
tail -f logs/backend.log

# Frontend логи
tail -f logs/frontend.log

# Останні 50 рядків
tail -50 logs/backend.log
tail -50 logs/frontend.log
```

---

## 🔄 Git Workflow

### Автоматичне схвалення змін:
```bash
./auto-approve.sh
```

### Ручне управління Git:
```bash
# Перевірка статусу
git status

# Додавання змін
git add .

# Commit
git commit -m "Your message"

# Push
git push origin $(git rev-parse --abbrev-ref HEAD)
```

---

## 🆘 Troubleshooting

### Backend не запускається:
```bash
# Перевірити чи зайнятий порт
lsof -ti:8000

# Очистити порт
lsof -ti:8000 | xargs kill -9

# Перезапустити
python3.11 backend/hero_api.py
```

### Frontend не запускається:
```bash
# Перевірити чи зайнятий порт
lsof -ti:3000

# Очистити порт
lsof -ti:3000 | xargs kill -9

# Перевірити залежності
cd predator-analytics/frontend
npm install

# Перезапустити
npm run dev
```

### Git конфлікти:
```bash
# Скинути локальні зміни
git reset --hard HEAD

# Або зробити force push
git push -f origin $(git rev-parse --abbrev-ref HEAD)
```

---

## 💡 Корисні команди

```bash
# Швидкий перезапуск всього
./auto-restart.sh

# Перевірка всього за один раз
./auto-status.sh

# Відкрити панель управління
./control-panel.sh

# Зупинити все і очистити
./auto-stop.sh
```

---

## 📦 Структура проєкту

```
Predator12/
├── auto-approve.sh       # Головний скрипт автозапуску
├── auto-status.sh        # Перевірка статусу
├── auto-stop.sh          # Зупинка системи
├── auto-restart.sh       # Перезапуск системи
├── control-panel.sh      # Панель управління
├── backend/
│   └── hero_api.py       # Backend API
├── predator-analytics/
│   └── frontend/         # Frontend Next.js
└── logs/
    ├── backend.log       # Логи Backend
    └── frontend.log      # Логи Frontend
```

---

## 🎯 Готово до роботи!

Система **Predator12** повністю налаштована та готова до використання.

**Швидкий старт:**
```bash
./auto-approve.sh
```

**Або використовуйте панель управління:**
```bash
./control-panel.sh
```

🌐 **Frontend:** http://localhost:3000  
📚 **API Docs:** http://localhost:8000/docs  
💚 **Health Check:** http://localhost:8000/health

---

**Дата створення:** 7 листопада 2025 р.  
**Версія:** 1.0.0  
**Статус:** ✅ READY TO USE
