# 🎯 CYBER-ACE: ACTION PLAN

**Пріоритет:** HIGH 🔴  
**Термін:** СЬОГОДНІ  
**Мета:** Запустити та протестувати повну систему

---

## ✅ ЩО ВЖЕ ГОТОВО

- ✅ Frontend компоненти (100%)
- ✅ Backend сервіси (100%)
- ✅ API інтеграція (100%)
- ✅ Тестові скрипти (100%)
- ✅ Документація (100%)

---

## 🎯 ACTION ITEMS

### 🔴 ПРІОРИТЕТ #1: Запуск Backend

**Команди:**

```bash
# Термінал 1
cd /Users/dima/Documents/Predator12/predator12-local/backend

# Перевірити Python
python3 --version

# Встановити залежності
pip3 install fastapi uvicorn openai pydantic python-dotenv

# Запустити server
python3 -m uvicorn app.main:app --reload --port 8000
```

**Очікуваний результат:**

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Перевірка:**

- Відкрити: <http://localhost:8000/docs>
- Перевірити: <http://localhost:8000/api/cyber-ace/health>

---

### 🟡 ПРІОРИТЕТ #2: Запуск Frontend

**Команди:**

```bash
# Термінал 2
cd /Users/dima/Documents/Predator12/predator12-local/frontend

# Запустити dev server
npm run dev
```

**Очікуваний результат:**

```
VITE ready in XXX ms
Local:   http://localhost:5173/
```

**Перевірка:**

- Відкрити: <http://localhost:5173>
- Відкрити: <http://localhost:5173/cyber-ace>

---

### 🟢 ПРІОРИТЕТ #3: Тестування API

**Команди:**

```bash
# Термінал 3
cd /Users/dima/Documents/Predator12/predator12-local

# Запустити тести
chmod +x test-cyber-ace-integration.sh
./test-cyber-ace-integration.sh
```

**Очікуваний результат:**

```
🧪 CYBER-ACE INTEGRATION TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing health endpoint... ✓ PASS
Testing chat endpoint... ✓ PASS
Testing agents endpoint... ✓ PASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All tests passed! (3/3)
```

---

### 🔵 ПРІОРИТЕТ #4: Функціональне Тестування

**UI Tests:**

1. **Перейти на CYBER-ACE:**
   - URL: <http://localhost:5173/cyber-ace>
   - Має відобразитись 3D аватар

2. **Голосова Команда:**
   - Натиснути 🎤
   - Сказати: "Привіт"
   - Отримати відповідь

3. **Quick Action:**
   - Натиснути "System Status"
   - Перевірити виконання

4. **Chat:**
   - Ввести: "Аналізувати блокчейн"
   - Отримати AI відповідь

5. **Agents:**
   - Перевірити відображення агентів
   - Перевірити статуси

---

## 📋 CHECKLIST ЗАПУСКУ

### Backend

- [ ] Python 3.11+ встановлено
- [ ] Dependencies встановлено
- [ ] Server запущено на port 8000
- [ ] Health endpoint працює
- [ ] Swagger UI доступний

### Frontend

- [ ] Node.js встановлено
- [ ] npm dependencies встановлено
- [ ] Dev server запущено на port 5173
- [ ] Головна сторінка доступна
- [ ] CYBER-ACE сторінка доступна

### Integration

- [ ] Health test пройшов
- [ ] Chat test пройшов
- [ ] Agents test пройшов
- [ ] Frontend підключився до Backend
- [ ] CORS налаштовано правильно

### Функціонал

- [ ] 3D аватар відображається
- [ ] Голосові команди працюють
- [ ] Quick actions працюють
- [ ] Chat працює
- [ ] Agents відображаються
- [ ] Status bar оновлюється

---

## 🐛 TROUBLESHOOTING GUIDE

### Problem: Backend не запускається

**Рішення 1:** Перевірити port 8000

```bash
lsof -ti:8000
kill -9 $(lsof -ti:8000)
```

**Рішення 2:** Встановити dependencies

```bash
cd backend
pip3 install --upgrade -r cyber_ace/requirements.txt
```

**Рішення 3:** Перевірити Python version

```bash
python3 --version  # Має бути 3.11+
```

---

### Problem: Frontend не підключається

**Рішення 1:** Перевірити .env

```bash
cat frontend/.env.development
# Має бути: VITE_API_BASE_URL=http://localhost:8000
```

**Рішення 2:** Перевірити CORS

```bash
# В backend/app/main.py має бути:
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
```

**Рішення 3:** Перезапустити обидва сервери

```bash
# Вбити процеси
kill -9 $(lsof -ti:8000)
kill -9 $(lsof -ti:5173)

# Запустити знову
./cyber-ace-start.sh
```

---

### Problem: Tests падають

**Рішення 1:** Перевірити, чи запущено backend

```bash
curl http://localhost:8000/docs
```

**Рішення 2:** Перевірити logs

```bash
tail -f backend/logs/cyber_ace.log
```

**Рішення 3:** Запустити тести по одному

```bash
# Health test
curl http://localhost:8000/api/cyber-ace/health

# Chat test
curl -X POST http://localhost:8000/api/cyber-ace/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Привіт","user_id":"test","language":"uk"}'

# Agents test
curl http://localhost:8000/api/cyber-ace/agents
```

---

## 🚀 ШВИДКИЙ ЗАПУСК (ВСЕ В ОДНОМУ)

**Використати автоматичний скрипт:**

```bash
cd /Users/dima/Documents/Predator12/predator12-local
chmod +x cyber-ace-start.sh
./cyber-ace-start.sh
```

Цей скрипт:

1. Перевірить поточний стан
2. Запустить backend (якщо не запущено)
3. Запустить frontend (якщо не запущено)
4. Почекає на готовність серверів
5. Запустить тести
6. Виведе summary

---

## 📊 EXPECTED OUTPUT

### Після запуску backend:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Після запуску frontend:

```
VITE v5.0.0  ready in 450 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Після тестів:

```
🧪 CYBER-ACE INTEGRATION TEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Backend is running
🧪 Running API tests...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing health endpoint... ✓ PASS
Testing chat endpoint... ✓ PASS
Testing agents endpoint... ✓ PASS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ All tests passed! (3/3)
🎉 CYBER-ACE is ready!
```

---

## ⏱️ TIMELINE

| Task                     | Time         | Status     |
| ------------------------ | ------------ | ---------- |
| Запуск Backend           | 2-3 хв       | ⏳ Pending |
| Запуск Frontend          | 1-2 хв       | ⏳ Pending |
| Запуск Тестів            | 30 сек       | ⏳ Pending |
| Функціональне Тестування | 5-10 хв      | ⏳ Pending |
| **TOTAL**                | **10-15 хв** | ⏳ Pending |

---

## 🎯 SUCCESS CRITERIA

✅ **Backend:**

- Server запущено
- Health endpoint відповідає 200
- Swagger UI доступний

✅ **Frontend:**

- Dev server запущено
- Сторінка завантажується
- Аватар відображається

✅ **Integration:**

- Всі API tests пройшли
- Frontend підключився до backend
- Дані передаються коректно

✅ **Функціонал:**

- Голосові команди працюють
- Quick actions виконуються
- Chat отримує відповіді
- Agents відображаються

---

## 📞 NEXT ACTIONS

1. **ЗАРАЗ:** Запустити backend (`uvicorn app.main:app --reload --port 8000`)
2. **ДАЛІ:** Запустити frontend (`npm run dev`)
3. **ПОТІМ:** Запустити тести (`./test-cyber-ace-integration.sh`)
4. **ФІНАЛ:** Протестувати UI

---

## 🎉 READY TO GO!

Все готово! Просто виконайте команди вище та система запрацює! 🚀

**Швидкий старт:**

```bash
# Option 1: Автоматичний
./cyber-ace-start.sh

# Option 2: Ручний
# Terminal 1: Backend
cd backend && python3 -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: Tests
./test-cyber-ace-integration.sh
```

---

**📌 Збережіть цей файл як швидкий довідник!**
