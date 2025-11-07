# 🚀 PREDATOR12 - Система автоматизації та управління

Повнофункціональна система для автоматичного запуску, моніторингу та управління Predator12 проєктом.

## 🎯 Швидкий старт

### Запуск панелі управління
```bash
./control-panel.sh
```

### Або використовуйте окремі команди:

#### 🚀 Автозапуск системи з автосхваленням
```bash
./auto-approve.sh
```

#### 🎯 Перевірка статусу
```bash
./quick-status.sh
```

#### 🛑 Зупинка всіх сервісів
```bash
./stop-all.sh
```

#### 🔄 Перезапуск системи
```bash
./restart-all.sh
```

#### 📋 Перегляд логів
```bash
./watch-logs.sh
```

## 📊 Що включено в систему

### 1. **Auto-Approve System** (`auto-approve.sh`)
- ✅ Автоматичне схвалення всіх змін
- ✅ Commit з timestamp
- ✅ Push до GitHub
- ✅ Запуск Backend API (port 8000)
- ✅ Запуск Frontend (port 3000)
- ✅ Health check обох сервісів

### 2. **Control Panel** (`control-panel.sh`)
Інтерактивна панель управління з наступними функціями:
- 🚀 Start/Auto-approve System
- 🛑 Stop All Services
- 🔄 Restart All Services
- 🎯 Check System Status
- 📋 Watch Logs
- 📊 Show Backend/Frontend Logs
- 📦 Git Operations
- 🌐 Quick Access до Frontend/API Docs

### 3. **Status Check** (`quick-status.sh`)
Швидка перевірка статусу:
- Backend API status
- Frontend status
- Git status
- Running processes
- PID information

### 4. **Service Management**
- `stop-all.sh` - Зупинка всіх сервісів
- `restart-all.sh` - Перезапуск системи
- `watch-logs.sh` - Перегляд логів в реальному часі

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🔧 Структура проєкту

```
Predator12/
├── backend/
│   └── hero_api.py          # Backend API
├── predator-analytics/
│   └── frontend/            # Next.js Frontend
├── logs/
│   ├── backend.log          # Backend logs
│   └── frontend.log         # Frontend logs
├── auto-approve.sh          # Головний скрипт автозапуску
├── control-panel.sh         # Панель управління
├── quick-status.sh          # Перевірка статусу
├── stop-all.sh              # Зупинка сервісів
├── restart-all.sh           # Перезапуск
├── watch-logs.sh            # Перегляд логів
├── .backend.pid             # PID Backend процесу
└── .frontend.pid            # PID Frontend процесу
```

## 📋 Вимоги

- Python 3.11+
- Node.js (для Frontend)
- npm
- Git
- curl

## 🎮 Використання Control Panel

1. Запустіть панель:
   ```bash
   ./control-panel.sh
   ```

2. Виберіть опцію з меню (1-12)

3. Система виконає вибрану команду

4. Натисніть Enter для повернення до меню

## 🚀 Автоматичний workflow

Система `auto-approve.sh` автоматично:
1. ✅ Перевіряє наявність змін у Git
2. ✅ Додає всі зміни до staging
3. ✅ Створює commit з timestamp
4. ✅ Push до GitHub
5. ✅ Запускає Backend API
6. ✅ Запускає Frontend
7. ✅ Виконує health check
8. ✅ Показує статус системи

## 📊 Моніторинг

### Перевірка статусу вручну:
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

### Перегляд логів:
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# Або через watch-logs.sh
./watch-logs.sh
```

## 🛑 Зупинка системи

### Через Control Panel:
```bash
./control-panel.sh
# Виберіть опцію 2
```

### Або напряму:
```bash
./stop-all.sh
```

### Або вручну:
```bash
kill $(cat .backend.pid .frontend.pid 2>/dev/null)
```

## 🔄 Troubleshooting

### Port already in use:
```bash
# Знайти процес на порту
lsof -ti:8000
lsof -ti:3000

# Зупинити
./stop-all.sh
```

### Backend не запускається:
```bash
# Перевірити логи
cat logs/backend.log

# Перевірити Python
python3.11 --version
```

### Frontend не запускається:
```bash
# Перевірити логи
cat logs/frontend.log

# Перевірити Node.js
node --version
npm --version
```

## 🎯 Best Practices

1. **Завжди використовуйте `auto-approve.sh`** для запуску системи
2. **Перевіряйте статус** через `quick-status.sh` перед операціями
3. **Зупиняйте сервіси** через `stop-all.sh` перед вимкненням
4. **Моніторте логи** при виникненні проблем
5. **Використовуйте Control Panel** для зручності

## 🌟 Features

- ✅ Автоматичне схвалення змін
- ✅ Автоматичний Git push
- ✅ Автоматичний запуск сервісів
- ✅ Health monitoring
- ✅ Логування
- ✅ PID management
- ✅ Кольорове виведення
- ✅ Інтерактивна панель управління
- ✅ Error handling

## 📝 License

MIT License - Predator12 Project

## 👥 Author

Predator12 Development Team

---

**🎉 Готово до використання!** Запустіть `./control-panel.sh` для початку роботи.
