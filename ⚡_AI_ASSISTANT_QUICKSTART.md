# 🚀 AI Assistant - Quick Start Guide

## ⚡ Швидкий запуск (5 хвилин)

### 1. Встановлення залежностей

```bash
cd predator12-local/frontend
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing d3 zustand react-i18next i18next
```

### 2. Запуск dev-сервера

```bash
npm run dev
```

### 3. Відкрити браузер

```
http://localhost:5173/assistant
```

---

## 🎮 Як користуватися

### Чат

1. **Текст**: Введіть повідомлення → Enter
2. **Голос**: Натисніть 🎤 або `M` → говоріть
3. **Мова**: Перемикач у header (🇺🇦/🇬🇧)

### Граф зв'язків

1. Запитайте: _"Знайди зв'язки компанії X"_
2. Click на node → завантажить деталі
3. Zoom/pan мишкою
4. Reset view → кнопка внизу

### Ризик-алерти

1. Автоматично з'являються внизу
2. Arrows → навігація між alerts
3. X → закрити alert

### 3D Голова

- Реагує на голос (emission)
- Пульсує при TTS
- Слідує за курсором (subtle)

---

## ⌨️ Keyboard Shortcuts

- `M` — Toggle мікрофон
- `Esc` — Зупинити ASR + TTS
- `Ctrl+L` — Очистити чат
- `Enter` — Відправити повідомлення
- `Shift+Enter` — Новий рядок

---

## 🔧 Налаштування

### .env файл

```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_KEYCLOAK_URL=http://localhost:8080/realms/predator
VITE_KEYCLOAK_CLIENT_ID=predator-analytics
```

### Мова за замовчуванням

```typescript
// assistantStore.ts
locale: 'uk-UA', // або 'en-US'
```

---

## 🐛 Troubleshooting

### ASR не працює

- Перевірте дозволи мікрофона в браузері
- Chrome/Edge — працює нативно
- Safari — обмежена підтримка
- Firefox — потрібен fallback API

### TTS не працює

- Перевірте голоси: `speechSynthesis.getVoices()`
- Якщо немає uk-UA → автоматично fallback на en-US

### 3D голова чорна

- Перевірте WebGL2: `canvas.getContext('webgl2')`
- Увімкніть GPU acceleration в браузері

---

## 📁 Структура

```
frontend/src/modules/assistant/
├── AssistantPage.tsx          # Головна сторінка
├── components/                # UI компоненти
├── hooks/                     # React hooks
├── state/                     # Zustand store
├── types/                     # TypeScript типи
├── locales/                   # i18n переклади
└── shaders/                   # GLSL шейдери
```

---

## 📚 Додаткова документація

- **Повна документація**: `🤖_AI_ASSISTANT_README.md`
- **Специфікація**: `🤖_AI_ASSISTANT_SPEC.md`
- **Чеклист**: `✅_AI_ASSISTANT_CHECKLIST.md`
- **API контракти**: `useAssistantAPI.ts`

---

## 🎯 Наступні кроки

1. Запустити dev-сервер
2. Протестувати всі функції
3. Перевірити ASR/TTS
4. Подивитися debug info (права нижня)
5. Спробувати keyboard shortcuts

---

**Версія**: 1.0.0  
**Статус**: MVP Ready  
**Підтримка**: UA 🇺🇦 | EN 🇬🇧

🚀 **Готово до запуску!**
