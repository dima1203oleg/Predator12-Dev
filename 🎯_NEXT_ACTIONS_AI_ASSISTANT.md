# 🎯 AI Assistant - Наступні дії для команди

## 🚀 Immediate Actions (Сьогодні/Завтра)

### 1. Виправити TypeScript помилки ⚠️

```bash
cd predator12-local/frontend
npm run type-check
```

**Проблеми**:
- Lazy loading module resolution
- D3 types compatibility
- Store method signatures

**Рішення**:
```typescript
// Add default exports to components
export default function Head3D() { ... }

// Fix D3 types
const simulation = d3.forceSimulation(graph.nodes as any)

// Update setGraph calls
setGraph(nodes, edges); // correct signature
```

### 2. Встановити залежності 📦

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing d3 zustand react-i18next i18next
```

### 3. Manual Testing 🧪

**Чеклист**:
- [ ] ASR працює (Chrome/Edge)
- [ ] TTS працює (всі браузери)
- [ ] 3D голова рендериться
- [ ] Граф інтерактивний
- [ ] Алерти відображаються
- [ ] Мова перемикається
- [ ] Keyboard shortcuts працюють

**Тестові сценарії**:

```bash
# 1. Голос
- Press M
- Say: "Знайди компанію X"
- Check transcript in chat
- Check 3D head pulsation

# 2. Чат
- Type: "Hello"
- Press Enter
- Wait for response
- Check TTS playback

# 3. Граф
- Click node
- Check selected state
- Zoom/pan
- Reset view

# 4. Алерти
- Wait for auto-scroll
- Navigate with arrows
- Dismiss alert
```

---

## 🔌 Backend Integration (Цей тиждень)

### 1. FastAPI Endpoints

```python
# backend/api/assistant.py

@router.post("/intent/execute")
async def execute_intent(
    intent: IntentRequest,
    user: User = Depends(get_current_user)
) -> IntentResponse:
    """Execute user intent and return response"""
    # NLU pipeline
    # OpenSearch query
    # Qdrant similarity search
    # Generate response
    pass

@router.get("/entities/{entity_id}/graph")
async def get_entity_graph(
    entity_id: str,
    depth: int = 2,
    user: User = Depends(get_current_user)
) -> GraphResponse:
    """Get entity connection graph"""
    # OpenSearch graph query
    # Cytoscape.js format
    pass

@router.get("/alerts")
async def get_alerts(
    user: User = Depends(get_current_user)
) -> AlertsResponse:
    """Get risk alerts for user"""
    # OpenSearch alerts query
    # Sort by severity
    pass
```

### 2. OIDC Integration

```typescript
// useAssistantAPI.ts

const getToken = async () => {
  const { keycloak } = useKeycloak();
  await keycloak.updateToken(5);
  return keycloak.token;
};

const executeIntent = async (text: string) => {
  const token = await getToken();
  const response = await fetch(`${API_BASE}/intent/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, locale }),
  });
  return response.json();
};
```

### 3. WebSocket для Alerts

```typescript
// useAssistantAPI.ts

useEffect(() => {
  const ws = new WebSocket(`${WS_BASE}/alerts`);
  
  ws.onmessage = (event) => {
    const alert = JSON.parse(event.data);
    useAssistantStore.getState().setAlerts([
      ...useAssistantStore.getState().alerts.items,
      alert,
    ]);
  };

  return () => ws.close();
}, []);
```

---

## 🧪 Testing (Наступний тиждень)

### 1. Unit Tests

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

```typescript
// __tests__/assistantStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAssistantStore } from '../state/assistantStore';

describe('assistantStore', () => {
  it('should push message', () => {
    const { result } = renderHook(() => useAssistantStore());
    
    act(() => {
      result.current.pushMessage({ role: 'user', text: 'Hello' });
    });
    
    expect(result.current.chat.history).toHaveLength(1);
    expect(result.current.chat.history[0].text).toBe('Hello');
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/ChatPanel.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPanel from '../components/ChatPanel';

describe('ChatPanel Integration', () => {
  it('should send message and receive response', async () => {
    render(<ChatPanel />);
    
    const input = screen.getByPlaceholderText(/type a message/i);
    const button = screen.getByRole('button', { name: /send/i });
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E Tests

```typescript
// e2e/assistant.spec.ts
import { test, expect } from '@playwright/test';

test('voice interaction flow', async ({ page }) => {
  await page.goto('http://localhost:5173/assistant');
  
  // Grant mic permissions
  await page.context().grantPermissions(['microphone']);
  
  // Click mic button
  await page.click('button[aria-label="Start recording"]');
  
  // Wait for ASR
  await page.waitForTimeout(2000);
  
  // Check transcript
  const transcript = await page.textContent('.chat-message.user');
  expect(transcript).toBeTruthy();
});
```

---

## ⚡ Optimization (2 тижні)

### 1. Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Expected output
# three.js: ~150KB
# d3.js: ~80KB
# react-three: ~60KB
# app code: ~130KB
# Total: ~420KB gzipped
```

**Optimization**:
```typescript
// Use CDN for heavy libs
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0"></script>

// Dynamic imports
const Head3D = lazy(() => import(/* webpackChunkName: "head3d" */ './components/Head3D'));
```

### 2. Performance Monitoring

```typescript
// analytics.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);
```

### 3. Accessibility Audit

```bash
npm install --save-dev @axe-core/react

# Run Lighthouse
lighthouse http://localhost:5173/assistant --view

# Target: WCAG 2.2 AA (95+ score)
```

---

## 🚀 Production Deployment

### 1. Build

```bash
npm run build
npm run preview  # test prod build
```

### 2. Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy Assistant
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: docker/build-push-action@v4
```

---

## 📞 Contacts

**Tech Lead**: @tech-lead  
**Frontend**: @frontend-team  
**Backend**: @backend-team  
**QA**: @qa-team

---

## 📚 Resources

- **Docs**: `/Users/dima/Documents/Predator12/🤖_AI_ASSISTANT_*.md`
- **Code**: `/Users/dima/Documents/Predator12/predator12-local/frontend/src/modules/assistant/`
- **Jira**: [PRED-XXX]
- **Figma**: [Design Link]

---

**Оновлено**: $(date)  
**Пріоритет**: 🔥 HIGH  
**Статус**: 🟢 MVP Ready, pending tests + backend
