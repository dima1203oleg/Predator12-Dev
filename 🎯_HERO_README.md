# 🎯 PREDATOR ANALYTICS - HERO INTERFACE

<div align="center">

![Status](https://img.shields.io/badge/status-READY-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-macOS%20M3-orange)

**Неоновий AI HUD інтерфейс з голосовим вводом та графом зв'язків**

</div>

---

## ⚡ ШВИДКИЙ СТАРТ

```bash
# Одна команда для запуску всього
./🚀_START_HERO.sh
```

Відкрийте браузер: **http://localhost:5173**

---

## 🎨 FEATURES

### ✨ AI Hero Interface
- 🧠 **AI HUD** - Неонова сітка-обличчя з анімацією
- 💬 **Smart Chat** - Інтелектуальний чат з backend
- 🎙️ **Voice I/O** - Голосове введення (uk-UA) + TTS відповідей
- 🕸️ **Network Graph** - Cytoscape міні-граф зв'язків
- ⚠️ **Risk Ticker** - Стрічка виявлених ризиків
- 📡 **Agent Events** - Realtime SSE стрім агентських подій

### 🚀 Оптимізація
- ⚡ Легкий для M3/8GB (без WebGL)
- 📱 Responsive design (mobile-first)
- 🎭 SVG анімації замість 3D
- 🔄 Dynamic imports для оптимізації
- 💾 Lazy loading компонентів

---

## 📁 СТРУКТУРА ПРОЄКТУ

```
Predator12/
├── 🚀_START_HERO.sh                 # Автозапуск frontend + backend
├── 🎉_HERO_INTERFACE_COMPLETE.md    # Фінальний звіт
├── ⚡_HERO_QUICKSTART.txt           # Швидка інструкція
├── ✅_HERO_CHECKLIST.md             # Чеклист готовності
│
├── frontend/src/
│   ├── pages/
│   │   └── Home.tsx                 # 🏠 Головна сторінка
│   ├── components/Hero/
│   │   ├── HeroHUD.tsx             # AI HUD + Events
│   │   ├── AIFace.tsx              # SVG неонове обличчя
│   │   ├── ChatDock.tsx            # Чат + Voice I/O
│   │   └── NetworkMini.tsx         # Cytoscape граф
│   └── styles/
│       └── hero.css                # Неонові стилі
│
└── predator12-local/
    ├── frontend/
    │   ├── .env.development        # Frontend config
    │   └── package.json            # Dependencies
    └── backend/app/
        └── main.py                 # FastAPI + Hero endpoints
```

---

## 🔌 API ENDPOINTS

### Backend (FastAPI)

#### `POST /api/chat`
Обробка повідомлень чату
```json
{
  "message": "Покажи контрагента",
  "trace": true
}
```

#### `GET /api/events` (SSE)
Realtime стрім подій агентів
```
Content-Type: text/event-stream
data: [12:34:56] Router Agent: Обробка запиту...
```

#### `GET /api/network`
Дані графа зв'язків
```json
{
  "nodes": [...],
  "edges": [...]
}
```

---

## 🛠️ ТЕХНОЛОГІЇ

### Frontend
- **React 18.3** - UI Framework
- **TypeScript** - Type safety
- **Vite 5.4** - Build tool
- **Cytoscape** - Граф візуалізація
- **Framer Motion** - Анімації
- **Web Speech API** - Голосовий ввід/вивід

### Backend
- **FastAPI** - Python web framework
- **Uvicorn** - ASGI server
- **SSE** - Server-Sent Events
- **Python 3.11** - Backend runtime

---

## 📦 ВСТАНОВЛЕННЯ

### Автоматичне (рекомендовано)
```bash
./🚀_START_HERO.sh
```

### Ручне

#### Frontend
```bash
cd predator12-local/frontend
npm install
npm run dev
```

#### Backend
```bash
cd predator12-local/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🎮 ВИКОРИСТАННЯ

### 1. Текстовий чат
- Введіть запит у поле вводу
- Натисніть **Enter** або кнопку **📤**
- AI відповість з аналізом

### 2. Голосовий ввід
- Клікніть на **🎙️**
- Дозвольте доступ до мікрофону
- Говоріть українською
- AI розпізнає та відповість голосом

### 3. Граф зв'язків
- Клік на вузол → підсвітка зв'язків
- Zoom: колесо миші
- Drag: перетягування вузлів

### 4. Агентські події
- Автоматичний SSE стрім
- Показує статуси агентів
- Realtime оновлення

---

## 🔧 КОНФІГУРАЦІЯ

### Frontend (.env.development)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ENABLE_VOICE=true
VITE_DEBUG_MODE=true
```

### Backend (app/main.py)
```python
# CORS налаштування
allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000"
]
```

---

## 🐛 TROUBLESHOOTING

### Frontend не запускається
```bash
cd predator12-local/frontend
rm -rf node_modules package-lock.json
npm install
```

### Граф не відображається
```bash
npm install cytoscape @types/cytoscape
```

### Backend не відповідає
```bash
# Перевірте чи запущено
curl http://localhost:8000/health

# Перезапустіть
pkill -f uvicorn
uvicorn app.main:app --reload --port 8000
```

### Голосовий ввід не працює
- Використовуйте Chrome/Edge
- Дайте дозвіл на мікрофон
- Перевірте `VITE_ENABLE_VOICE=true`

---

## 📊 PERFORMANCE

### Оптимізовано для M3/8GB
- ✅ SVG замість WebGL
- ✅ Dynamic imports
- ✅ Lazy loading
- ✅ Debounced handlers
- ✅ Cleanup on unmount

### Метрики
- **Bundle size:** ~2MB (gzip)
- **Initial load:** <3s
- **TTI:** <5s
- **Memory:** <200MB

---

## 🎯 ROADMAP

### v1.1 (Short-term)
- [ ] WebGL version AI face (Three.js)
- [ ] Chat history (localStorage)
- [ ] Message animations
- [ ] Theme switcher

### v2.0 (Mid-term)
- [ ] Live graph updates (WebSocket)
- [ ] Drag & drop files
- [ ] Multi-language support
- [ ] Dashboard metrics

### v3.0 (Long-term)
- [ ] Multimodal (images, PDF)
- [ ] 3D network graph
- [ ] PWA support
- [ ] Mobile app

---

## 📚 ДОКУМЕНТАЦІЯ

- [Фінальний звіт](./🎉_HERO_INTERFACE_COMPLETE.md)
- [Швидка інструкція](./⚡_HERO_QUICKSTART.txt)
- [Чеклист](./✅_HERO_CHECKLIST.md)
- [API Docs](http://localhost:8000/docs)

---

## 🤝 ПІДТРИМКА

### Контакти
- **GitHub:** [Predator Analytics](https://github.com/predator-analytics)
- **Docs:** http://localhost:8000/docs

### Посилання
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Cytoscape.js](https://js.cytoscape.org/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## 📝 LICENSE

MIT License - використовуйте вільно для комерційних та некомерційних проєктів.

---

<div align="center">

**Створено з ❤️ для Predator Analytics**

*Оптимізовано для MacBook Pro M3 (8GB)*

🚀 **READY TO LAUNCH!**

</div>
