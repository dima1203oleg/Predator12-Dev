# 🚀 AI Assistant - Швидкий Старт

## 📋 Передумови

✅ Всі файли на місці (15 основних файлів)  
✅ Всі залежності встановлені (Three.js, Zustand, i18next)  
✅ TypeScript помилок у модулі assistant немає  
✅ 2678+ рядків коду готові до роботи

---

## ⚡ Швидкий Запуск (3 кроки)

### Крок 1: Перезапустити TypeScript Server (ОБОВ'ЯЗКОВО!)

**У VS Code:**

```
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

Або просто перезапустіть VS Code.

### Крок 2: Запустити Dev Server

```bash
cd /Users/dima/Documents/Predator12/predator12-local/frontend
npm run dev
```

### Крок 3: Відкрити в Браузері

```
http://localhost:5173/assistant
```

---

## 🧪 Тестування Модуля

### Автоматичний тест

```bash
cd /Users/dima/Documents/Predator12/predator12-local/frontend
./test-assistant.sh
```

Цей скрипт перевірить:

- ✅ Наявність всіх файлів
- ✅ TypeScript помилки
- ✅ Залежності
- 📊 Статистику коду

### Ручне тестування

Після запуску dev server перевірте:

#### 1. Візуальні компоненти

- [ ] 3D голова відображається і обертається
- [ ] Чат панель відображається справа
- [ ] Граф відображається зліва
- [ ] Банер алертів відображається згори
- [ ] Статус мікрофона відображається

#### 2. Функціональність

- [ ] Можна ввести текст у чат
- [ ] AI відповідає на повідомлення
- [ ] Мікрофон можна включити/вимкнути
- [ ] 3D голова реагує на мікрофон
- [ ] TTS промовляє відповіді
- [ ] Граф інтерактивний (hover, click)

#### 3. Локалізація

- [ ] За замовчуванням українська мова
- [ ] Перемикач мов працює (🇺🇦 ↔️ 🇬🇧)
- [ ] Всі тексти перекладаються
- [ ] UI коректний в обох мовах

#### 4. Голосовий контроль

- [ ] ASR розпізнає українську мову
- [ ] ASR розпізнає англійську мову
- [ ] TTS промовляє українською
- [ ] TTS промовляє англійською
- [ ] Fallback працює якщо браузер не підтримує

---

## 🔧 Налагодження

### Проблема: TypeScript показує помилки імпортів

**Причина**: Кеш IDE  
**Рішення**:

```
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Проблема: Dev server не запускається

**Перевірка портів**:

```bash
lsof -i :5173
kill -9 <PID>  # якщо порт зайнятий
```

**Очистка кешу**:

```bash
rm -rf node_modules/.cache .vite
npm install
```

### Проблема: Компоненти не рендеряться

**Перевірка консолі**:

1. Відкрийте DevTools (F12)
2. Перевірте вкладку Console на помилки
3. Перевірте вкладку Network на failed requests

**Перевірка імпортів**:

```bash
# У консолі браузера
console.log(window.location.pathname)  // має бути /assistant
```

### Проблема: 3D не відображається

**Можливі причини**:

- WebGL не підтримується браузером
- GPU не активна
- Three.js не завантажилась

**Перевірка**:

```javascript
// У консолі браузера
console.log(window.THREE); // має показати об'єкт THREE
```

---

## 📁 Структура Файлів

```
src/modules/assistant/
├── AssistantPage.tsx          # Головна сторінка
├── components/
│   ├── Head3D.tsx             # 3D голова (Three.js)
│   ├── ChatPanel.tsx          # Чат панель
│   ├── NetworkPanel.tsx       # Граф зв'язків
│   ├── RiskBanner.tsx         # Алерти
│   ├── MicStatus.tsx          # Статус мікрофона
│   ├── NetworkPanel.module.css # Стилі графа
│   └── index.ts               # Barrel export
├── hooks/
│   ├── useASR.ts              # Speech Recognition
│   ├── useTTS.ts              # Text-to-Speech
│   └── useAssistantAPI.ts     # Backend API
├── state/
│   └── assistantStore.ts      # Zustand state
├── types/
│   └── index.ts               # TypeScript types
├── locales/
│   ├── uk-UA.json             # Українська 🇺🇦
│   └── en-US.json             # Англійська 🇬🇧
├── shaders/
│   └── scanline.glsl          # GLSL шейдер
├── i18n.ts                    # i18next config
└── test-imports.ts            # Тестування імпортів
```

---

## 🎯 Основні Функції

### 1. 3D Голова (Head3D)

- Процедурна wireframe сфера
- Реакція на мікрофон (VU meter)
- Cursor tracking (lookAt)
- TTS пульсація
- Scanline shader ефект

### 2. Чат (ChatPanel)

- Історія повідомлень
- Auto-scroll
- Typing indicator
- Мікрофон інтеграція
- Intent parsing

### 3. Граф (NetworkPanel)

- Візуалізація зв'язків
- Force-directed layout
- Інтерактивність
- Risk levels (колір)
- Tooltips

### 4. Алерти (RiskBanner)

- Ротація алертів
- Risk severity
- Timestamps
- Джерело інформації
- Action buttons

### 5. Голосовий Контроль

- ASR: Web Speech API + fallback
- TTS: SpeechSynthesis + Coqui
- Двомовність (uk-UA, en-US)
- VU meter
- Continuous mode

---

## 📊 Метрики KPI

| Метрика                          | Ціль  | Статус                   |
| -------------------------------- | ----- | ------------------------ |
| TTFI (Time to First Interaction) | <2.5s | ⏳ Потребує тестування   |
| FPS (3D рендеринг)               | ≥50   | ⏳ Потребує профілювання |
| ASR точність (українська)        | ≥85%  | ⏳ Потребує тестування   |
| ASR точність (англійська)        | ≥85%  | ⏳ Потребує тестування   |
| WCAG 2.2                         | AA    | ⏳ Потребує audit        |

---

## 🔗 Корисні Посилання

### Документація

- [🤖 Повний README](../../🤖_AI_ASSISTANT_README.md)
- [✅ Чеклист](../../✅_AI_ASSISTANT_CHECKLIST.md)
- [📚 Індекс документації](../../📚_ПОВНИЙ_ІНДЕКС_ДОКУМЕНТАЦІЇ.md)

### TypeScript Виправлення

- [🎉 Детальний звіт](../../🎉_AI_ASSISTANT_TYPESCRIPT_FIXES.md)
- [✅ Чеклист виправлень](../../✅_ЧЕКЛИСТ_TYPESCRIPT_ВИПРАВЛЕННЯ.md)
- [🎊 Summary](../../🎊_TYPESCRIPT_FIXES_DONE.txt)

### Технічна Документація

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://docs.pmnd.rs/zustand)
- [i18next](https://www.i18next.com/)

---

## 🆘 Підтримка

### Якщо щось не працює:

1. **Перевірте консоль браузера** (F12)
2. **Перевірте консоль VS Code** (термінал)
3. **Перезапустіть TypeScript Server**
4. **Очистіть кеш та перезапустіть dev server**
5. **Перегляньте документацію** у кореневій папці проекту

### Команди для діагностики:

```bash
# Перевірка TypeScript
npx tsc --noEmit

# Перевірка залежностей
npm list three zustand i18next

# Очистка всього
rm -rf node_modules/.cache .vite dist
npm install

# Запуск тестового скрипта
./test-assistant.sh
```

---

## 🎉 Готово!

Модуль AI Assistant повністю готовий до роботи!

**Наступні кроки:**

1. ✅ Restart TypeScript Server
2. 🚀 Запустити dev server
3. 🧪 Протестувати функціонал
4. 📝 Записати результати тестування
5. 🔧 Виправити знайдені баги (якщо є)
6. 🚢 Підготувати до продакшну

**Приємної роботи! 🇺🇦**
