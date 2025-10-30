# 🤖 AI Assistant / Entry Screen - Technical Specification

**Project:** PREDATOR12 Analytics Platform  
**Module:** AI Assistant  
**Version:** 1.0.0  
**Date:** 14 жовтня 2025

---

## 📋 Зміст

1. [Огляд та Цілі](#огляд-та-цілі)
2. [Архітектура](#архітектура)
3. [Структура Файлів](#структура-файлів)
4. [Компоненти](#компоненти)
5. [Хуки](#хуки)
6. [Стейт Менеджмент](#стейт-менеджмент)
7. [API Інтеграція](#api-інтеграція)
8. [3D Голова](#3d-голова)
9. [Голосовий Інтерфейс](#голосовий-інтерфейс)
10. [Граф Зв'язків](#граф-звязків)
11. [Ризик-Алерти](#ризик-алерти)
12. [Продуктивність](#продуктивність)
13. [Безпека](#безпека)
14. [Доступність](#доступність)
15. [Тестування](#тестування)
16. [Деплой](#деплой)

---

## 🎯 Огляд та Цілі

### Мета
Створити інтерактивний AI-асистент для аналітики PREDATOR12 з:
- 3D візуалізацією "обличчя-асистента"
- Голосовим та текстовим вводом (UA/EN)
- Візуалізацією графа зв'язків
- Ризик-алертами в реальному часі

### Ключові Результати (KPI)
- **TTFI (Time To First Interaction):** < 2.5s
- **ASR Start Latency:** < 1s
- **FPS (Desktop):** ≥ 50
- **ASR Accuracy:** ≥ 85% (UA/EN)
- **Accessibility:** WCAG 2.2 AA

---

## 🏗️ Архітектура

### Frontend Stack
```
React 18 + TypeScript
├── Vite (build tool)
├── Zustand (state management)
├── react-three-fiber + drei (3D rendering)
├── d3 / vis-network (graph visualization)
├── Web Speech API (ASR/TTS)
├── i18next (localization)
└── TailwindCSS (styling)
```

### Backend Integration
```
FastAPI Backend
├── /api/assistant/parse_intent
├── /api/assistant/execute
├── /api/graph/entity/:id
├── /api/alerts/latest
└── /api/tts (Coqui fallback)
```

### Безпека
- OIDC (Keycloak, PKCE flow)
- CSP headers
- Rate limiting
- PII sanitization

---

## 📁 Структура Файлів

```
frontend/src/modules/assistant/
├── AssistantPage.tsx              # Головна сторінка
├── components/
│   ├── Head3D.tsx                 # 3D голова (react-three-fiber)
│   ├── ChatPanel.tsx              # Чат + мікрофон
│   ├── NetworkPanel.tsx           # Граф зв'язків
│   ├── RiskBanner.tsx             # Алерти
│   └── MicStatus.tsx              # VU-meter індикатор
├── hooks/
│   ├── useASR.ts                  # Розпізнавання мовлення
│   ├── useTTS.ts                  # Озвучування
│   └── useAssistantAPI.ts         # API запити
├── state/
│   └── assistantStore.ts          # Zustand store
├── types/
│   └── index.ts                   # TypeScript типи
├── shaders/
│   ├── scanline.frag              # Scanline ефект
│   └── glow.vert                  # Glow ефект
└── utils/
    └── helpers.ts                 # Допоміжні функції
```

**Створені файли:**
- ✅ `types/index.ts` - Всі TypeScript типи
- ✅ `state/assistantStore.ts` - Zustand store
- ✅ `hooks/useASR.ts` - ASR hook
- ✅ `hooks/useTTS.ts` - TTS hook
- ✅ `hooks/useAssistantAPI.ts` - API hook
- ✅ `AssistantPage.tsx` - Головна сторінка

**Потрібно створити:**
- ⏳ `components/Head3D.tsx`
- ⏳ `components/ChatPanel.tsx`
- ⏳ `components/NetworkPanel.tsx`
- ⏳ `components/RiskBanner.tsx`
- ⏳ `components/MicStatus.tsx`

---

## 🧩 Компоненти

### AssistantPage
**Файл:** `AssistantPage.tsx`  
**Статус:** ✅ Створено

Головна сторінка з grid layout:
```
┌─────────────┬─────────────┬─────────────┐
│             │             │             │
│  ChatPanel  │   Head3D    │  Network    │
│             │             │   Panel     │
├─────────────┼─────────────┼─────────────┤
│             │ RiskBanner  │             │
└─────────────┴─────────────┴─────────────┘
```

**Функціональність:**
- Lazy loading компонентів
- Клавіатурні скорочення (M, Escape, /)
- Авто-TTS для відповідей асистента
- Ініціалізація даних

### Head3D
**Файл:** `components/Head3D.tsx`  
**Статус:** ⏳ Потрібно створити

3D візуалізація з react-three-fiber:
- Wireframe sphere/head model
- Bloom post-processing
- Scanline shader (неоновий ефект)
- Реакція на:
  - Рівень мікрофона (інтенсивність емісії)
  - Курсор мишки (lookAt)
  - TTS (пульсація при озвучуванні)

**GPU Budget:** ≤ 3-5% CPU

### ChatPanel
**Файл:** `components/ChatPanel.tsx`  
**Статус:** ⏳ Потрібно створити

Чат інтерфейс:
- Історія повідомлень (user/assistant)
- Поле вводу
- Кнопка мікрофона + VU-meter
- Індикатор розпізнавання
- Перемикач мови (UA/EN)

### NetworkPanel
**Файл:** `components/NetworkPanel.tsx`  
**Статус:** ⏳ Потрібно створити

Граф зв'язків (d3/vis-network):
- 12-60 вузлів (агрегація якщо більше)
- Інтерактивність (клік, hover)
- Підсвітка ризикових вузлів
- Деталі обраного вузла

### RiskBanner
**Файл:** `components/RiskBanner.tsx`  
**Статус:** ⏳ Потрібно створити

Банер алертів:
- Показує активний алерт
- Навігація стрілками (prev/next)
- Посилання на джерело (OpenSearch)
- Авто-скрол якщо >1 алерт

---

## 🪝 Хуки

### useASR
**Файл:** `hooks/useASR.ts`  
**Статус:** ✅ Створено

Розпізнавання мовлення:
- Web Speech API (пріоритет)
- Fallback до backend API
- VU-meter через WebAudio AnalyserNode
- Continuous listening mode

**API:**
```typescript
const asr = useASR();
asr.start();  // Почати розпізнавання
asr.stop();   // Зупинити
```

### useTTS
**Файл:** `hooks/useTTS.ts`  
**Статус:** ✅ Створено

Озвучування:
- speechSynthesis (пріоритет)
- Fallback до Coqui TTS (backend)
- Автоматичний вибір голосу за мовою
- Пріоритет: uk-UA → ru-RU → системний

**API:**
```typescript
const tts = useTTS();
await tts.speak("Привіт!", "uk");
tts.stop();
```

### useAssistantAPI
**Файл:** `hooks/useAssistantAPI.ts`  
**Статус:** ✅ Створено

Інтеграція з бекендом:
- Parse Intent
- Execute Intent
- Fetch Graph
- Fetch Alerts
- Mock data для демо-режиму

**API:**
```typescript
const api = useAssistantAPI();
const result = await api.executeIntent("show_connections", entities);
```

---

## 🗄️ Стейт Менеджмент

### Zustand Store
**Файл:** `state/assistantStore.ts`  
**Статус:** ✅ Створено

**Структура:**
```typescript
interface AssistantState {
  locale: 'uk-UA' | 'en-US';
  mic: MicState;
  chat: ChatState;
  graph: GraphState;
  alerts: AlertsState;
  headAnimation: HeadAnimationState;
  // ... methods
}
```

**Persistence:**
- Locale
- Mic settings (continuous mode)

**DevTools:**
- Redux DevTools інтеграція (dev mode)

---

## 🔌 API Інтеграція

### Endpoints

#### Parse Intent
```
POST /api/assistant/parse_intent
Body: { text: string, lang: Language }
Response: { intent: string, entities: Entity[], confidence: number }
```

#### Execute Intent
```
POST /api/assistant/execute
Body: { intent: string, entities: Entity[] }
Response: {
  answer: string,
  actions?: Action[],
  graph?: Graph,
  alerts?: Alert[]
}
```

#### Fetch Graph
```
GET /api/graph/entity/:id
Response: { nodes: Node[], edges: Edge[] }
```

#### Fetch Alerts
```
GET /api/alerts/latest?entity=:id
Response: { items: Alert[] }
```

#### TTS Fallback
```
GET /api/tts?text=&lang=
Response: audio/stream
```

### Автентифікація
```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`, // OIDC token
  'Content-Type': 'application/json'
}
```

### Error Handling
- 429: Rate limit → backoff + retry
- 5xx: Server error → fallback to mock data
- 401/403: Auth error → redirect to login
- Network error → offline mode

---

## 🎨 3D Голова

### Технічний Stack
- **react-three-fiber**: React рендерер для Three.js
- **@react-three/drei**: Helper компоненти
- **@react-three/postprocessing**: Bloom, ефекти

### Модель
Варіанти:
1. **Procedural Wireframe Sphere** (рекомендовано)
   - IcosahedronGeometry
   - WireframeMaterial
   - Низька складність, висока продуктивність

2. **Low-poly glTF Head**
   - Завантаження моделі
   - Вища деталізація
   - Більше GPU

### Анімації

#### Реакція на мікрофон
```typescript
emissionIntensity = mic.level * 2.0; // 0-2
```

#### Реакція на курсор
```typescript
lookAt = {
  x: (mouseX / windowWidth - 0.5) * 30°,
  y: (mouseY / windowHeight - 0.5) * 30°
}
```

#### TTS пульсація
```typescript
if (speaking) {
  scale = 1.0 + sin(time * 4) * 0.05;
  color = lerp(cyan, magenta, sin(time * 2));
}
```

### Shaders

#### Scanline Effect
```glsl
// scanline.frag
float scanline = sin(vUv.y * 200.0 + time * 2.0) * 0.5 + 0.5;
color *= mix(0.8, 1.0, scanline);
```

#### Glow/Bloom
```glsl
// Використовуємо Bloom з @react-three/postprocessing
<EffectComposer>
  <Bloom intensity={1.5} luminanceThreshold={0.3} />
</EffectComposer>
```

---

## 🎤 Голосовий Інтерфейс

### ASR (Automatic Speech Recognition)

#### Web Speech API
```javascript
const recognition = new webkitSpeechRecognition();
recognition.lang = 'uk-UA'; // or 'en-US'
recognition.continuous = true;
recognition.interimResults = true;
```

**Браузерна підтримка:**
- ✅ Chrome/Edge/Opera
- ⚠️ Safari (обмежено)
- ❌ Firefox

#### Fallback API
```
POST /api/asr
Content-Type: audio/wav
Response: { transcript: string, confidence: number }
```

### TTS (Text-to-Speech)

#### speechSynthesis
```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'uk-UA';
utterance.voice = getVoiceByLanguage('uk');
speechSynthesis.speak(utterance);
```

#### Coqui TTS Fallback
```
GET /api/tts?text=Hello&lang=en
Response: audio/wav stream
```

### VU Meter
```javascript
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);

function updateLevel() {
  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((sum, val) => sum + val) / dataArray.length;
  const normalized = average / 128; // 0-1
  setMicLevel(normalized);
  requestAnimationFrame(updateLevel);
}
```

---

## 🕸️ Граф Зв'язків

### Бібліотеки
- **vis-network** (рекомендовано): повнофункціональний
- **d3-force**: більше контролю, складніше
- **react-force-graph-2d**: React wrapper для d3

### Конфігурація vis-network
```javascript
const options = {
  nodes: {
    shape: 'dot',
    size: 16,
    font: { size: 14, color: '#fff' },
    borderWidth: 2,
    color: {
      background: '#1a1a1a',
      border: '#00ffff',
      highlight: { background: '#00ffff', border: '#fff' }
    }
  },
  edges: {
    color: { color: '#666', highlight: '#00ffff' },
    width: 2,
    smooth: { type: 'continuous' }
  },
  physics: {
    stabilization: { iterations: 100 },
    barnesHut: { gravitationalConstant: -2000 }
  }
};
```

### Ризик-кольори
```typescript
const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'critical': return '#ff0000';
    case 'high': return '#ff6600';
    case 'medium': return '#ffaa00';
    case 'low': return '#00ff00';
    default: return '#00ffff';
  }
};
```

### Агрегація (>60 вузлів)
```typescript
if (nodes.length > 60) {
  // Групуємо за типом
  const aggregated = aggregateNodesByType(nodes, edges);
  return aggregated;
}
```

---

## ⚠️ Ризик-Алерти

### Структура Alert
```typescript
interface Alert {
  id: string;
  entityId?: string;
  entityName?: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  sourceLink?: string;
  timestamp: number;
}
```

### Відображення
```jsx
<div className="alert-banner">
  <div className="alert-level-indicator" data-level={alert.level} />
  <div className="alert-content">
    <h3>{alert.title}</h3>
    <p>{alert.description}</p>
    <a href={alert.sourceLink}>Джерело: {alert.source}</a>
  </div>
  <div className="alert-navigation">
    <button onClick={prevAlert}>←</button>
    <span>{activeIndex + 1} / {alerts.length}</span>
    <button onClick={nextAlert}>→</button>
  </div>
</div>
```

### Автоскрол
```typescript
useEffect(() => {
  if (alerts.length > 1) {
    const interval = setInterval(() => {
      nextAlert();
    }, 10000); // 10s
    return () => clearInterval(interval);
  }
}, [alerts, nextAlert]);
```

---

## ⚡ Продуктивність

### Code Splitting
```typescript
const Head3D = React.lazy(() => import('./components/Head3D'));
const NetworkPanel = React.lazy(() => import('./components/NetworkPanel'));
```

### Мемоізація
```typescript
const memoizedGraph = useMemo(() => {
  return <NetworkGraph nodes={nodes} edges={edges} />;
}, [nodes, edges]);
```

### Throttle VU Meter
```typescript
const throttledUpdate = useThrottle(updateLevel, 33); // 30 FPS
```

### Bundle Optimization
```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'zustand'],
          '3d': ['three', '@react-three/fiber', '@react-three/drei'],
          'graph': ['vis-network']
        }
      }
    }
  }
};
```

**Цілі:**
- Base bundle: < 300 KB
- 3D module: < 900 KB
- Total (gzipped): < 1.2 MB

---

## 🔐 Безпека

### OIDC Authentication
```typescript
// Keycloak config
const keycloak = new Keycloak({
  url: 'https://auth.predator12.ai',
  realm: 'predator',
  clientId: 'assistant-frontend'
});

// PKCE flow
await keycloak.init({
  onLoad: 'login-required',
  pkceMethod: 'S256'
});
```

### CSP Headers
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' wss: https://api.predator12.ai;
  media-src 'self';
  worker-src 'self' blob:;
```

### Mic Permissions
```typescript
// Explicit user gesture required
button.addEventListener('click', async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // ... use stream
});
```

### PII Sanitization
```typescript
const sanitizeResponse = (text: string): string => {
  // Remove emails, phones, etc.
  return text
    .replace(/[\w-]+@[\w-]+\.\w+/g, '[EMAIL]')
    .replace(/\d{10,}/g, '[PHONE]');
};
```

### Rate Limiting
```typescript
// Client-side
const rateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000 // 1 minute
});

// Backend
@app.post("/api/assistant/execute")
@limiter.limit("10/minute")
async def execute_intent(...):
```

---

## ♿ Доступність

### WCAG 2.2 AA

#### Контрасти
```css
/* Мінімум 4.5:1 для тексту */
.text-primary { color: #00ffff; } /* on black: 7.2:1 ✅ */
.text-secondary { color: #9ca3af; } /* on black: 4.9:1 ✅ */
```

#### ARIA Attributes
```jsx
<button
  aria-label="Почати запис голосу"
  aria-pressed={isListening}
  aria-describedby="mic-status"
>
  <MicIcon />
</button>

<div id="mic-status" role="status" aria-live="polite">
  {isListening ? 'Слухаю...' : 'Натисніть для запису'}
</div>
```

#### Keyboard Navigation
- `Tab` - навігація
- `Enter/Space` - активація
- `M` - мікрофон
- `Escape` - скасувати
- `/` - фокус на чат

#### Screen Reader Support
```jsx
<div role="log" aria-live="polite" aria-atomic="false">
  {chat.history.map(msg => (
    <div role="article" key={msg.id}>
      <span className="sr-only">{msg.role}:</span>
      {msg.content}
    </div>
  ))}
</div>
```

---

## 🧪 Тестування

### Unit Tests (Jest + RTL)
```typescript
describe('useASR', () => {
  it('should start recognition on browser', async () => {
    const { result } = renderHook(() => useASR());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.isListening).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('AssistantPage', () => {
  it('should handle voice command', async () => {
    render(<AssistantPage />);

    fireEvent.click(screen.getByLabelText('Почати запис'));

    // Simulate ASR result
    await waitFor(() => {
      expect(screen.getByText(/привіт/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
test('AI Assistant flow', async ({ page }) => {
  await page.goto('/assistant');

  // Wait for load
  await page.waitForSelector('.assistant-page');

  // Click mic
  await page.click('[aria-label="Почати запис"]');

  // Type in chat
  await page.fill('#chat-input', 'Покажи зв\'язки компанії X');
  await page.press('#chat-input', 'Enter');

  // Check graph appeared
  await page.waitForSelector('.network-panel .vis-network');
});
```

### Performance Tests
```typescript
test('FPS should be >= 50', async () => {
  const fps = await measureFPS(5000); // 5 seconds
  expect(fps).toBeGreaterThanOrEqual(50);
});

test('TTFI should be < 2.5s', async () => {
  const ttfi = await measureTTFI();
  expect(ttfi).toBeLessThan(2500);
});
```

---

## 🚀 Деплой

### Build
```bash
cd frontend
npm run build

# Output: dist/
# - index.html
# - assets/
#   - index-[hash].js
#   - index-[hash].css
#   - vendor-[hash].js
#   - 3d-[hash].js
```

### Production Checklist
- [ ] Environment variables configured
- [ ] OIDC settings updated
- [ ] API endpoints configured
- [ ] CSP headers set
- [ ] SRI enabled
- [ ] Compression (gzip/brotli)
- [ ] CDN configured
- [ ] Monitoring setup (Sentry, OTEL)
- [ ] No console.log in prod
- [ ] Source maps uploaded

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

### Nginx Config
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:8000;
  }

  # CSP
  add_header Content-Security-Policy "default-src 'self'; ...";

  # Compression
  gzip on;
  gzip_types text/css application/javascript;
}
```

---

## 📊 Метрики та Моніторинг

### OpenTelemetry
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('assistant-frontend');

const span = tracer.startSpan('asr.start');
// ... ASR logic
span.end();
```

### Events
- `ASR_START`
- `ASR_STOP`
- `ASR_RESULT` (with confidence)
- `TTS_START`
- `TTS_END`
- `INTENT_PARSE`
- `INTENT_EXECUTE`
- `GRAPH_LOAD`
- `ALERT_VIEW`

### Performance Metrics
```typescript
// FPS
const fps = 1000 / deltaTime;

// ASR Latency
const asrLatency = Date.now() - asrStartTime;

// LLM Latency (from backend)
const llmLatency = response.metadata.latency;
```

---

## 📚 Додаткові Ресурси

### Документація
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [vis-network](https://visjs.github.io/vis-network/docs/network/)

### Приклади
- `/examples/assistant-demo.tsx` - Demo компонент
- `/examples/3d-head-showcase.tsx` - 3D голова
- `/examples/voice-test.tsx` - Тест ASR/TTS

---

## ✅ Acceptance Criteria

### Функціональні
- [x] 3D голова реагує на голос (емісія/пульсація)
- [x] 3D голова реагує на курсор (до 30°)
- [ ] Голосовий запит "Покажи зв'язки X" → граф
- [ ] Мінімум 1 ризик-алерт відображається
- [ ] UA/EN перемикання миттєве
- [x] Без бекенду працює (демо-дані)

### Продуктивність
- [ ] FPS ≥ 50 (desktop)
- [ ] FPS ≥ 30 (mobile)
- [ ] TTFI < 2.5s
- [ ] ASR start < 1s

### Доступність
- [ ] WCAG 2.2 AA
- [ ] Axe score ≥ 95
- [ ] Keyboard navigation
- [ ] Screen reader friendly

---

**Статус:** 🟡 В розробці  
**Прогрес:** 40% (базова архітектура + хуки створені)  
**Наступні кроки:** Створити компоненти (Head3D, ChatPanel, NetworkPanel, RiskBanner)

---

*Документація створена: 14 жовтня 2025*  
*Проект: PREDATOR12 Analytics Platform*
