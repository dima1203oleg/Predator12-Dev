# 🎯 CYBER-ACE: Фінальний Гід

**Дата:** 14 жовтня 2025  
**Версія:** 1.0 FINAL  
**Статус:** 100% Ready to Launch 🚀

---

## ⚡ ШВИДКИЙ СТАРТ (1 команда!)

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./cyber-ace.sh start
```

**Це все!** Скрипт автоматично:

- Перевірить поточний стан
- Запустить backend (якщо потрібно)
- Покаже інструкції для frontend
- Протестує health endpoint
- Виведе всі URL

---

## 🎮 УПРАВЛІННЯ СИСТЕМОЮ

### Основні команди

```bash
# Статус системи
./cyber-ace.sh status

# Запустити все
./cyber-ace.sh start

# Зупинити все
./cyber-ace.sh stop

# Перезапустити
./cyber-ace.sh restart

# Тести
./cyber-ace.sh test

# Логи
./cyber-ace.sh logs
```

### Окремі компоненти

```bash
# Тільки backend
./cyber-ace.sh backend

# Тільки frontend
./cyber-ace.sh frontend
```

### API тести

```bash
# Health check
./cyber-ace.sh health

# Chat test
./cyber-ace.sh chat

# Agents list
./cyber-ace.sh agents
```

### Відкрити в браузері

```bash
# API документація
./cyber-ace.sh docs

# CYBER-ACE UI
./cyber-ace.sh ui
```

---

## 📋 РУЧНИЙ ЗАПУСК (якщо потрібно)

### Terminal 1 - Backend

```bash
cd /Users/dima/Documents/Predator12/predator12-local/backend
python3 -m uvicorn app.main:app --reload --port 8000
```

### Terminal 2 - Frontend

```bash
cd /Users/dima/Documents/Predator12/predator12-local/frontend
npm run dev
```

### Terminal 3 - Tests

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./test-cyber-ace-integration.sh
```

---

## 🌐 URLs

| Сервіс       | URL                                        | Опис              |
| ------------ | ------------------------------------------ | ----------------- |
| Frontend     | http://localhost:5173                      | Головна сторінка  |
| CYBER-ACE    | http://localhost:5173/cyber-ace            | AI Assistant UI   |
| Backend API  | http://localhost:8000                      | REST API          |
| API Docs     | http://localhost:8000/docs                 | Swagger UI        |
| Health Check | http://localhost:8000/api/cyber-ace/health | Перевірка статусу |

---

## 🧪 ТЕСТУВАННЯ

### Автоматичні тести

```bash
# Повні integration tests
./test-cyber-ace-integration.sh

# Швидка перевірка
./cyber-ace.sh status
```

### Ручні тести

```bash
# Health
curl http://localhost:8000/api/cyber-ace/health

# Chat
curl -X POST http://localhost:8000/api/cyber-ace/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Привіт!","user_id":"test","language":"uk"}'

# Agents
curl http://localhost:8000/api/cyber-ace/agents
```

### UI тести

1. **Відкрити:** http://localhost:5173/cyber-ace
2. **Перевірити:**
   - 3D аватар відображається
   - Кнопка мікрофону активна
   - Quick actions присутні
   - Агенти відображаються
   - Status bar внизу

3. **Голосова команда:**
   - Натиснути 🎤
   - Сказати: "Привіт"
   - Отримати відповідь

4. **Quick Action:**
   - Натиснути "System Status"
   - Перевірити виконання

5. **Chat:**
   - Ввести: "Аналізувати блокчейн"
   - Отримати AI відповідь

---

## 🐛 TROUBLESHOOTING

### Backend не запускається

```bash
# Перевірити порт
lsof -ti:8000

# Вбити процес
kill -9 $(lsof -ti:8000)

# Перезапустити
./cyber-ace.sh restart
```

### Frontend не підключається

```bash
# Перевірити .env
cat frontend/.env.development

# Має бути:
# VITE_API_BASE_URL=http://localhost:8000

# Перевірити CORS в backend/app/main.py
```

### Залежності відсутні

```bash
# Backend
cd backend
pip3 install -r cyber_ace/requirements.txt

# Frontend
cd frontend
npm install
```

### Логи показують помилки

```bash
# Backend logs
tail -f backend/logs/cyber_ace.log

# Frontend - дивитись в Browser Console (F12)
```

---

## 📚 ДОКУМЕНТАЦІЯ

### Швидкі довідники

| Файл                          | Коли використовувати             |
| ----------------------------- | -------------------------------- |
| 📚_CYBER_ACE_DOCS_INDEX.md    | Повний індекс документації       |
| ⚡_ЗАПУСК_CYBER_ACE.md        | Перший запуск                    |
| 🎯_ACTION_PLAN_CYBER_ACE.md   | Детальний план + troubleshooting |
| 📊_CYBER_ACE_FINAL_SUMMARY.md | Огляд системи                    |
| 🎯_CYBER_ACE_NEXT_STEPS.md    | Розробка та розширення           |

### Технічна документація

- **Backend:** `backend/cyber_ace/README.md`
- **Frontend API:** `frontend/src/modules/cyber-ace/services/cyberAceAPI.ts`
- **Components:** `frontend/src/modules/cyber-ace/components/`

---

## ✅ CHECKLIST ЗАПУСКУ

### Перший раз

- [ ] Прочитав документацію (📚_CYBER_ACE_DOCS_INDEX.md)
- [ ] Встановив залежності (backend + frontend)
- [ ] Створив .env файли
- [ ] Запустив backend (`./cyber-ace.sh start`)
- [ ] Запустив frontend (окремий terminal)
- [ ] Перевірив статус (`./cyber-ace.sh status`)
- [ ] Запустив тести (`./cyber-ace.sh test`)
- [ ] Відкрив UI (http://localhost:5173/cyber-ace)
- [ ] Протестував функціонал

### Кожен запуск

- [ ] Перевірив статус (`./cyber-ace.sh status`)
- [ ] Запустив сервіси (`./cyber-ace.sh start`)
- [ ] Перевірив health (`./cyber-ace.sh health`)
- [ ] Відкрив UI

### Після змін

- [ ] Перезапустив (`./cyber-ace.sh restart`)
- [ ] Запустив тести (`./cyber-ace.sh test`)
- [ ] Перевірив логи (`./cyber-ace.sh logs`)

---

## 🎉 ГОТОВІ СЦЕНАРІЇ

### Сценарій 1: Швидкий старт

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./cyber-ace.sh start
# У новому терміналі: cd frontend && npm run dev
./cyber-ace.sh ui
```

### Сценарій 2: Розробка

```bash
# Terminal 1: Backend з логами
./cyber-ace.sh backend

# Terminal 2: Frontend
./cyber-ace.sh frontend

# Terminal 3: Моніторинг
watch -n 5 './cyber-ace.sh status'
```

### Сценарій 3: Тестування

```bash
./cyber-ace.sh start
./cyber-ace.sh test
./cyber-ace.sh health
./cyber-ace.sh chat
./cyber-ace.sh agents
```

### Сценарій 4: Дебаг

```bash
# Статус
./cyber-ace.sh status

# Логи в реальному часі
./cyber-ace.sh logs

# В іншому терміналі - тести
./cyber-ace.sh test
```

---

## 🚀 PROD DEPLOYMENT (майбутнє)

### Environment Variables

```bash
# Backend (.env)
OPENAI_API_KEY=your_key
AZURE_SPEECH_KEY=your_key
DATABASE_URL=postgresql://...
SECRET_KEY=generated_secret

# Frontend (.env.production)
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
```

### Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
# Setup production server (gunicorn, nginx, etc.)
```

---

## 📊 КОМАНДИ ЗА КАТЕГОРІЯМИ

### Запуск та зупинка

```bash
./cyber-ace.sh start      # Запустити все
./cyber-ace.sh stop       # Зупинити все
./cyber-ace.sh restart    # Перезапустити
./cyber-ace.sh backend    # Тільки backend
./cyber-ace.sh frontend   # Тільки frontend
```

### Моніторинг

```bash
./cyber-ace.sh status     # Статус системи
./cyber-ace.sh health     # Backend health
./cyber-ace.sh logs       # Backend логи
```

### Тестування

```bash
./cyber-ace.sh test       # Integration tests
./cyber-ace.sh chat       # Chat endpoint test
./cyber-ace.sh agents     # Agents list test
```

### Браузер

```bash
./cyber-ace.sh ui         # Відкрити UI
./cyber-ace.sh docs       # Відкрити API docs
```

---

## 💡 ПОРАДИ

### Продуктивність

- Використовуйте `./cyber-ace.sh` замість ручних команд
- Моніторте логи для швидкого виявлення проблем
- Запускайте тести після кожної зміни

### Розробка

- Backend: uvicorn з `--reload` автоматично перезавантажується
- Frontend: Vite з HMR оновлює сторінку автоматично
- Використовуйте Browser DevTools (F12) для фронтенд дебагу

### Дебаг

- Дивіться backend логи: `./cyber-ace.sh logs`
- Дивіться frontend console в браузері
- Перевіряйте Network tab для API викликів
- Використовуйте Swagger UI для API тестування

---

## 🎯 SUMMARY

**CYBER-ACE v1.0** повністю готовий!

✅ **Один скрипт для всього:** `./cyber-ace.sh`  
✅ **Автоматичні тести:** `./cyber-ace.sh test`  
✅ **Швидка перевірка:** `./cyber-ace.sh status`  
✅ **Повна документація:** 10+ файлів

**Запуск за 30 секунд:**

```bash
cd /Users/dima/Documents/Predator12/predator12-local
./cyber-ace.sh start
```

**Відкрити UI:**

```bash
./cyber-ace.sh ui
```

**Готово! 🎉**

---

## 📞 ШВИДКА ДОПОМОГА

| Проблема                  | Рішення                                       |
| ------------------------- | --------------------------------------------- |
| Backend не запускається   | `./cyber-ace.sh stop && ./cyber-ace.sh start` |
| Frontend не підключається | Перевірити `.env.development`                 |
| Тести не проходять        | `./cyber-ace.sh health`                       |
| Потрібні логи             | `./cyber-ace.sh logs`                         |
| Забули команду            | `./cyber-ace.sh help`                         |

---

**🎉 Успіхів з CYBER-ACE! Все готово до використання! 🚀**
