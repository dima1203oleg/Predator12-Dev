# ⚡ ШВИДКИЙ ЗАПУСК CYBER-ACE

**Версія:** 1.0  
**Час запуску:** 5-10 хвилин

---

## 🚀 Крок 1: Запуск Backend

```bash
cd /Users/dima/Documents/Predator12/predator12-local/backend

# Встановити залежності (якщо потрібно)
pip3 install -r cyber_ace/requirements.txt

# Створити .env файл
cp cyber_ace/.env.template cyber_ace/.env

# Запустити server
python3 -m uvicorn app.main:app --reload --port 8000
```

✅ **Перевірка:** Відкрийте <http://localhost:8000/docs> - має з'явитися Swagger UI

---

## 🚀 Крок 2: Запуск Frontend

**У новому терміналі:**

```bash
cd /Users/dima/Documents/Predator12/predator12-local/frontend

# Запустити dev server
npm run dev
```

✅ **Перевірка:** Відкрийте <http://localhost:5173> - має з'явитися головна сторінка

---

## 🚀 Крок 3: Відкрити CYBER-ACE

Перейдіть на: <http://localhost:5173/cyber-ace>

✅ **Очікуваний результат:**

- 3D аватар CYBER-ACE
- Кнопка мікрофону
- Швидкі дії (Quick Actions)
- Картки агентів
- Status bar внизу

---

## 🧪 Крок 4: Тестування

```bash
# У новому терміналі
cd /Users/dima/Documents/Predator12/predator12-local
./test-cyber-ace-integration.sh
```

---

## 🎯 Швидкі Тести

### 1. Голосова Команда

1. Натисніть кнопку мікрофону 🎤
2. Скажіть: **"Привіт"** або **"Hello"**
3. Має з'явитися відповідь від CYBER-ACE

### 2. Quick Action

1. Натисніть **"System Status"**
2. Має виконатися перевірка статусу системи

### 3. Chat

1. Натисніть на аватар або кнопку чату
2. Введіть: **"Аналізувати блокчейн"**
3. Отримайте AI відповідь

---

## 🔧 Налаштування (Опціонально)

### Додати OpenAI API Key

```bash
nano /Users/dima/Documents/Predator12/predator12-local/backend/cyber_ace/.env
```

Додайте:

```env
OPENAI_API_KEY=sk-your-key-here
```

---

## 🐛 Проблеми?

### Backend не запускається

```bash
# Перевірити port 8000
lsof -ti:8000

# Вбити процес, якщо зайнятий
kill -9 $(lsof -ti:8000)
```

### Frontend не підключається

```bash
# Перевірити .env.development
cat /Users/dima/Documents/Predator12/predator12-local/frontend/.env.development

# Має бути: VITE_API_BASE_URL=http://localhost:8000
```

### OpenAI помилки

- Додайте API key у backend/.env
- Перезапустіть backend server

---

## 📚 Детальна Документація

- 🎯 Наступні кроки: `🎯_CYBER_ACE_NEXT_STEPS.md`
- 🔗 Інтеграція: `🔗_CYBER_ACE_INTEGRATION_COMPLETED.md`
- 🚀 Готово до запуску: `🚀_ГОТОВО_ДО_ЗАПУСКУ.md`
- 🤖 Концепція: `🤖_CYBER_ACE_CONCEPT.md`

---

## ✅ Checklist

- [ ] Backend запущено на port 8000
- [ ] Frontend запущено на port 5173
- [ ] CYBER-ACE сторінка відкривається
- [ ] Аватар відображається
- [ ] Голосові команди працюють
- [ ] Quick actions працюють
- [ ] Integration tests пройшли

---

**🎉 Готово! Насолоджуйтесь CYBER-ACE!**
