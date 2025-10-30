# 🔌 BACKEND INTEGRATION COMPLETE GUIDE

## 📊 ОГЛЯД

**Дата:** ${new Date().toISOString().split('T')[0]}  
**Версія:** Phase 2 - Backend Integration  
**Статус:** ✅ READY FOR IMPLEMENTATION

---

## 🎯 ЩО СТВОРЕНО

### 1️⃣ Backend API Endpoints

**Файл:** `/predator12-local/backend/src/api/providers.ts`

**Endpoints:**
```typescript
GET    /api/providers                    // Список всіх провайдерів
POST   /api/providers                    // Додати новий акаунт
PUT    /api/providers/:id                // Оновити акаунт
DELETE /api/providers/:id                // Видалити акаунт
GET    /api/providers/:id/models         // Моделі акаунту
POST   /api/providers/:id/models/config  // Зберегти конфігурацію
POST   /api/providers/:id/test           // Тест підключення
GET    /api/providers/:id/stats          // Статистика провайдера
GET    /api/providers/stats/overall      // Загальна статистика
```

**Features:**
- ✅ Express Router з TypeScript
- ✅ Zod validation schemas
- ✅ Error handling
- ✅ TODO markers для database integration

---

### 2️⃣ Frontend API Service

**Файл:** `/predator12-local/frontend/src/services/providerAPI.ts`

**Functions:**
- `fetchProviders()` - Отримати всіх провайдерів
- `addProvider(data)` - Додати нового провайдера
- `updateProvider(id, data)` - Оновити провайдера
- `deleteProvider(id)` - Видалити провайдера
- `fetchProviderModels(id)` - Отримати моделі
- `saveModelConfig(id, config)` - Зберегти конфігурацію
- `testConnection(id, modelId)` - Тестувати підключення
- `fetchProviderStats(id)` - Статистика провайдера
- `fetchOverallStats()` - Загальна статистика
- `toggleProviderStatus(id, isActive)` - Змінити статус

**Features:**
- ✅ Axios з interceptors
- ✅ Authentication (Bearer token)
- ✅ Error handling
- ✅ TypeScript types
- ✅ Automatic retry logic

---

### 3️⃣ WebSocket Service

**Файл:** `/predator12-local/frontend/src/services/websocket.ts`

**Events:**
- `provider:stats:update` - Real-time оновлення статистики
- `provider:status:change` - Зміна статусу провайдера
- `model:request:complete` - Завершення запиту до моделі
- `connection:established` - Підключення встановлено
- `connection:lost` - Підключення втрачено
- `connection:failed` - Підключення не вдалося

**Features:**
- ✅ Socket.IO client
- ✅ Auto-reconnect
- ✅ Event subscriptions
- ✅ Custom React hook (`useWebSocket`)
- ✅ Connection state management

---

### 4️⃣ Custom React Hook

**Файл:** `/predator12-local/frontend/src/hooks/useProviders.ts`

**Returns:**
```typescript
{
  // Data
  providers: ProviderAccount[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchProviders: () => Promise<void>;
  addProvider: (data) => Promise<void>;
  updateProvider: (id, data) => Promise<void>;
  deleteProvider: (id) => Promise<void>;
  toggleProviderStatus: (id) => Promise<void>;

  // Real-time
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}
```

**Features:**
- ✅ State management
- ✅ API integration
- ✅ WebSocket integration
- ✅ Optimistic updates
- ✅ Error handling
- ✅ Auto-fetch on mount

---

### 5️⃣ Updated ModelProviderManager

**Файл:** `/predator12-local/frontend/src/components/models/ModelProviderManager.tsx`

**Changes:**
- ✅ Використовує `useProviders` hook
- ✅ Використовує `useWebSocket` hook
- ✅ Асинхронні обробники подій
- ✅ Loading states
- ✅ Error handling
- ✅ Auto-connect WebSocket
- ✅ Auto-subscribe до updates

---

## 📦 АРХІТЕКТУРА

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ModelProviderManager Component                    │
│         │                                           │
│         ├─→ useProviders Hook                      │
│         │   └─→ providerAPI Service                │
│         │       └─→ Axios → Backend API            │
│         │                                           │
│         └─→ useWebSocket Hook                      │
│             └─→ websocket Service                  │
│                 └─→ Socket.IO → Backend WS         │
│                                                     │
└─────────────────────────────────────────────────────┘
                      ↓↑ HTTP/WS
┌─────────────────────────────────────────────────────┐
│                   BACKEND                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Express Server                                     │
│         │                                           │
│         ├─→ /api/providers Router                  │
│         │   ├─→ GET /providers                     │
│         │   ├─→ POST /providers                    │
│         │   ├─→ PUT /providers/:id                 │
│         │   ├─→ DELETE /providers/:id              │
│         │   ├─→ GET /providers/:id/models          │
│         │   ├─→ POST /providers/:id/models/config  │
│         │   ├─→ POST /providers/:id/test           │
│         │   ├─→ GET /providers/:id/stats           │
│         │   └─→ GET /providers/stats/overall       │
│         │                                           │
│         └─→ Socket.IO Server                       │
│             ├─→ provider:stats:update              │
│             ├─→ provider:status:change             │
│             └─→ model:request:complete             │
│                                                     │
└─────────────────────────────────────────────────────┘
                      ↓↑
┌─────────────────────────────────────────────────────┐
│                   DATABASE                          │
├─────────────────────────────────────────────────────┤
│  Tables:                                            │
│  ├─ providers                                       │
│  ├─ provider_accounts                               │
│  ├─ models                                          │
│  ├─ model_configs                                   │
│  ├─ usage_stats                                     │
│  └─ request_logs                                    │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 ШВИДКИЙ СТАРТ

### 1. Backend Setup

```bash
# Navigate to backend
cd predator12-local/backend

# Install dependencies
npm install express zod socket.io cors

# Create .env file
echo "PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/predator12
JWT_SECRET=your-secret-key" > .env

# Start server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd predator12-local/frontend

# Install dependencies
npm install axios socket.io-client

# Create .env file
echo "REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001" > .env

# Start development server
npm start
```

### 3. Test API

```bash
# Test GET providers
curl http://localhost:3001/api/providers

# Test POST provider
curl -X POST http://localhost:3001/api/providers \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "openai",
    "accountName": "Test Account",
    "apiKey": "sk-test123456789",
    "models": ["gpt-4"]
  }'
```

---

## 📋 DATABASE SCHEMA

### Providers Table

```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  default_endpoint VARCHAR(255),
  requires_api_key BOOLEAN DEFAULT true,
  supported_models JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Provider Accounts Table

```sql
CREATE TABLE provider_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  api_key TEXT NOT NULL,
  api_endpoint VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  request_count INTEGER DEFAULT 0,
  models JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);
```

### Model Configs Table

```sql
CREATE TABLE model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES provider_accounts(id) ON DELETE CASCADE,
  model_id VARCHAR(100) NOT NULL,
  max_tokens INTEGER,
  temperature DECIMAL(3,2),
  top_p DECIMAL(3,2),
  frequency_penalty DECIMAL(3,2),
  presence_penalty DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Usage Stats Table

```sql
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES provider_accounts(id) ON DELETE CASCADE,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_latency INTEGER,
  total_tokens BIGINT DEFAULT 0,
  estimated_cost DECIMAL(10,2) DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Backend

- [ ] Setup Express server
- [ ] Install dependencies (express, zod, socket.io, cors)
- [ ] Setup database (PostgreSQL/MongoDB)
- [ ] Create database tables/collections
- [ ] Implement providers router
- [ ] Add authentication middleware
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Setup Socket.IO server
- [ ] Implement WebSocket events
- [ ] Add logging
- [ ] Write unit tests
- [ ] Setup environment variables

### Frontend

- [ ] Install dependencies (axios, socket.io-client)
- [ ] Setup environment variables
- [ ] Verify providerAPI service works
- [ ] Verify websocket service works
- [ ] Test useProviders hook
- [ ] Test ModelProviderManager with API
- [ ] Add error notifications (toast/snackbar)
- [ ] Add success notifications
- [ ] Test loading states
- [ ] Test error states
- [ ] Test WebSocket connection
- [ ] Test real-time updates
- [ ] Write component tests

---

## 🧪 TESTING

### Unit Tests

```typescript
// Backend - providers.test.ts
describe('Providers API', () => {
  test('GET /api/providers returns list', async () => {
    const response = await request(app).get('/api/providers');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /api/providers creates new provider', async () => {
    const newProvider = {
      providerId: 'openai',
      accountName: 'Test Account',
      apiKey: 'sk-test123'
    };
    const response = await request(app)
      .post('/api/providers')
      .send(newProvider);
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});

// Frontend - useProviders.test.ts
describe('useProviders hook', () => {
  test('fetches providers on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProviders());
    await waitForNextUpdate();
    expect(result.current.providers.length).toBeGreaterThan(0);
  });

  test('adds provider successfully', async () => {
    const { result } = renderHook(() => useProviders());
    await act(async () => {
      await result.current.addProvider({
        providerId: 'openai',
        accountName: 'Test',
        apiKey: 'sk-test'
      });
    });
    expect(result.current.providers.length).toBe(1);
  });
});
```

---

## 📊 MONITORING

### Backend Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log API requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});
```

### Frontend Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Track API errors
api.interceptors.response.use(
  response => response,
  error => {
    Sentry.captureException(error);
    return Promise.reject(error);
  }
);
```

---

## 🎉 ВИСНОВОК

**СТАТУС:** ✅ Backend Integration Code READY

**Створено:**
- ✅ Backend API endpoints (~300 lines)
- ✅ Frontend API service (~250 lines)
- ✅ WebSocket service (~200 lines)
- ✅ Custom React hook (~150 lines)
- ✅ Updated ModelProviderManager

**Наступні кроки:**
1. Implement database layer
2. Setup Express server
3. Test API endpoints
4. Test WebSocket events
5. Integration testing
6. Production deployment

**ETA:** 1-2 тижні для повної імплементації

---

**Файли:**
- Backend: `/predator12-local/backend/src/api/providers.ts`
- API Service: `/predator12-local/frontend/src/services/providerAPI.ts`
- WebSocket: `/predator12-local/frontend/src/services/websocket.ts`
- Hook: `/predator12-local/frontend/src/hooks/useProviders.ts`
- Component: `/predator12-local/frontend/src/components/models/ModelProviderManager.tsx`

🎊 **READY FOR IMPLEMENTATION!** 🎊
