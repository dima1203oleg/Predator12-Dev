# 🎨 PREDATOR12 DASHBOARD - VISUAL GUIDE V3

## 📅 Дата: 6 Жовтня 2025

---

## 🌐 ДОСТУП ДО ІНТЕРФЕЙСУ

### 🚀 URLs:
```
✅ DEVELOPMENT:  http://localhost:5091/
✅ PRODUCTION:   http://localhost:3000/
✅ NETWORK:      http://172.20.10.3:5091/
```

---

## 🎯 ІНТЕРФЕЙС DASHBOARD

### 📱 ОСНОВНІ СЕКЦІЇ

#### 1. 🔍 SEARCH BAR (ВЕРХ СТОРІНКИ)
```
┌──────────────────────────────────────────────────┐
│ 🔍 Search services...                           │
└──────────────────────────────────────────────────┘
```
**Функціональність**:
- Real-time пошук по назвам сервісів
- Glassmorphism дизайн
- Focus ефект з підсвічуванням фіолетовим (#8B5CF6)
- Placeholder: "🔍 Search services..."

**Як використовувати**:
1. Клікнути в поле пошуку
2. Почати вводити назву сервісу (наприклад, "postgres")
3. Список сервісів миттєво фільтрується

---

#### 2. 🎯 FILTER CHIPS (ПІД ПОШУКОМ)
```
┌──────────────────────────────────────────────────────────────────┐
│  [All Services 25]  [Core 5]  [Database 4]  [Search 2]  ...    │
└──────────────────────────────────────────────────────────────────┘
```
**Категорії**:
- **All Services (25)** - всі сервіси
- **Core (5)** - Backend API, Frontend, Celery, etc.
- **Database (4)** - PostgreSQL, Redis, MinIO, Qdrant
- **Search (2)** - OpenSearch + Dashboard
- **AI/ML (1)** - Model SDK
- **Monitoring (7)** - Prometheus, Grafana, Loki, etc.
- **Security (1)** - Keycloak Auth

**Візуальні стани**:
```css
/* Активний фільтр */
background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)
color: #fff
font-weight: 600

/* Неактивний фільтр */
background: rgba(255, 255, 255, 0.05)
border: 1px solid rgba(255, 255, 255, 0.1)

/* Hover */
transform: translateY(-2px)
background: rgba(255, 255, 255, 0.08)
```

**Як використовувати**:
1. Клікнути на будь-який chip
2. Список сервісів фільтрується миттєво
3. Лічильники оновлюються динамічно

---

#### 3. 📊 METRICS GRID (4 КАРТИ)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ⚡ CPU       │  │ 💾 Memory    │  │ 💿 Disk      │  │ 🌐 Network   │
│ 45.0%        │  │ 68.0%        │  │ 52.0%        │  │ 34.0 MB/s    │
│ ████████     │  │ ████████████ │  │ ██████████   │  │ ███████      │
│ ↘ -2.3%      │  │ ↗ +1.5%      │  │ ↗ +0.8%      │  │ ↗ +5.2%      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Features**:
- Великі іконки з gradient background
- Progress bar з кольоровим градієнтом
- Trend indicators (↗/↘) з відсотками
- Hover ефект: піднімається + box-shadow
- Real-time оновлення кожні 2 секунди

**Кольори**:
- CPU: #8B5CF6 (фіолетовий)
- Memory: #EC4899 (рожевий)
- Disk: #3B82F6 (синій)
- Network: #10B981 (зелений)

---

#### 4. 📈 SYSTEM PERFORMANCE CHART
```
┌─────────────────────────────────────────────────┐
│ System Performance                              │
│ Real-time monitoring · Last 24 hours            │
│                                                 │
│     ╱╲                                         │
│    ╱  ╲      ╱╲                               │
│   ╱    ╲    ╱  ╲    ╱╲                       │
│  ╱      ╲  ╱    ╲  ╱  ╲                      │
│ ╱        ╲╱      ╲╱    ╲                     │
│                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Requests │ │ Response │ │ Errors   │        │
│ │ 12.4K    │ │ 45ms     │ │ 0.02%    │        │
│ │ +12%     │ │ -8%      │ │ -15%     │        │
│ └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────┘
```

**Features**:
- Canvas-based smooth line chart
- Gradient fill під лінією
- 3 Quick Stats внизу
- Responsive width

---

#### 5. 🗂️ SERVICE STATUS LIST
```
┌─────────────────────────────────────────────────┐
│ Service Status                                  │
│ 25 services · 24 online · 1 warning            │
│                                                 │
│ ⚙️ Core Application Services            [5]    │
│ ┌──────────────────────────────────────────┐  │
│ │ 🟢 Backend API          [ONLINE]        │  │
│ │    Uptime: 99.9%                        │  │
│ │    Requests: 1,247/min                  │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ 🗄️ Database & Storage                  [4]    │
│ ┌──────────────────────────────────────────┐  │
│ │ 🟢 PostgreSQL           [ONLINE]        │  │
│ └──────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────┐  │
│ │ 🟠 Qdrant Vector        [WARNING]       │  │
│ └──────────────────────────────────────────┘  │
│                                                 │
│ ... (всі інші категорії)                       │
└─────────────────────────────────────────────────┘
```

**Категорії Header**:
```
[ICON] Category Name                        [COUNT]
────────────────────────────────────────────────────
```

**Service Card States**:
```
🟢 ONLINE   - зелений (#10B981) + pulse animation
🟠 WARNING  - жовтий  (#F59E0B)
🔴 OFFLINE  - червоний (#EF4444)
```

**Hover ефект**:
- Картка зсувається вправо (translateX(5px))
- Border підсвічується кольором статусу
- Cursor: pointer

**Клік**:
- Відкриває модальне вікно з деталями

---

#### 6. 🔍 SERVICE DETAILS MODAL
```
┌─────────────────────────────────────────────────┐
│ Backend API                              ×     │
│                                                 │
│ ●  ONLINE                                      │
│                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────┐│
│ │ ⏱️       │ │ 📊       │ │ ⚡       │ │ 🔍  ││
│ │ Uptime   │ │ Requests │ │ Response │ │ Last││
│ │ 99.9%    │ │ 1,247/min│ │ 45ms     │ │ 2s  ││
│ └──────────┘ └──────────┘ └──────────┘ └─────┘│
│                                                 │
│ ┌───────────┐ ┌───────────┐ ┌──────────────┐ │
│ │ 📄 Logs   │ │ 🔄 Restart│ │ ⚙️ Configure │ │
│ └───────────┘ └───────────┘ └──────────────┘ │
└─────────────────────────────────────────────────┘
```

**Features**:
- Backdrop з blur ефектом
- Gradient background (#1a1a2e → #16213e)
- Status badge з пульсуючою точкою
- 2×2 metrics grid
- 3 action buttons внизу

**Buttons**:
- **View Logs** - фіолетовий (#8B5CF6)
- **Restart** - жовтий (#F59E0B) warning style
- **Configure** - фіолетовий (#8B5CF6)

**Закриття**:
1. Клік на × кнопку
2. Клік поза модальним вікном
3. ESC клавіша (TODO)

---

#### 7. 📢 ALERT NOTIFICATIONS (FIXED TOP-RIGHT)
```
                    ┌────────────────────────────┐
                    │ ⚠️ WARNING              × │
                    │                            │
                    │ Qdrant Vector DB          │
                    │ experiencing high         │
                    │ response times (156ms)    │
                    │                            │
                    │ 21:34:56                  │
                    └────────────────────────────┘
```

**Position**: Fixed, top: 20px, right: 20px

**Типи**:
```
❌ ERROR   - червоний (#EF4444)
⚠️ WARNING - жовтий  (#F59E0B)
ℹ️ INFO    - синій   (#3B82F6)
```

**Animation**: slideInRight
```css
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}
```

**Закриття**: Клік на × кнопку

---

## 🎨 КОЛЬОРОВА СХЕМА

### Primary Colors:
```css
--purple:     #8B5CF6  /* Фіолетовий - primary accent */
--pink:       #EC4899  /* Рожевий - gradient accent */
--blue:       #3B82F6  /* Синій - disk, info */
--green:      #10B981  /* Зелений - online, network */
--yellow:     #F59E0B  /* Жовтий - warning */
--red:        #EF4444  /* Червоний - error, offline */
```

### Background:
```css
--bg-dark:    #0a0a14  /* Темний фон */
--bg-mid:     #1a1a2e  /* Середній фон */
--bg-light:   #0f0f1e  /* Світліший фон */
```

### Text:
```css
--text-white: #fff     /* Основний текст */
--text-gray:  #888     /* Вторинний текст */
--text-dark:  #666     /* Темний текст */
```

---

## 🎭 АНІМАЦІЇ

### 1. Pulse (для online статусу)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 2. FadeIn (для основного контенту)
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 3. SlideInRight (для alerts)
```css
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}
```

---

## 🖱️ ІНТЕРАКТИВНІ ЕЛЕМЕНТИ

### Hover States:
```css
/* Metric Card */
MetricCard:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 60px [color]40;
  border-color: [status-color];
}

/* Service Card */
ServiceCard:hover {
  transform: translateX(5px);
  border-color: [status-color];
}

/* Filter Chip */
FilterChip:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
}

/* Action Button */
ActionButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px [color]30;
}
```

---

## 📱 RESPONSIVE BEHAVIOR

### Breakpoints:
```css
/* Desktop (> 1400px) */
- 2-column grid (Chart + Services)
- 4 metric cards в ряд

/* Tablet (768px - 1400px) */
- 2-column grid compressed
- 2-4 metric cards (auto-fit)

/* Mobile (< 768px) */
- Single column stack
- 1-2 metric cards per row
- Filter chips wrap
```

### Grid Layout:
```css
/* Metrics Grid */
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

/* Content Grid */
grid-template-columns: 2fr 1fr;  /* Chart : Services */

/* Filter Chips */
display: flex;
flex-wrap: wrap;
```

---

## 🔧 ВИКОРИСТАННЯ ФУНКЦІЙ

### 1. Пошук Сервісів
```
1. Натиснути в search bar
2. Ввести "postgres"
3. Побачити тільки PostgreSQL сервіси
4. Очистити для скидання
```

### 2. Фільтрація по Категорії
```
1. Клік на "Database" chip
2. Побачити 4 database сервіси
3. Клік на "All Services" для скидання
```

### 3. Перегляд Деталей Сервісу
```
1. Клік на будь-яку Service Card
2. Модальне вікно відкривається
3. Переглянути метрики (uptime, requests, response time)
4. Натиснути × або клікнути поза вікном
```

### 4. Закриття Alert
```
1. Побачити alert у верхньому правому куті
2. Натиснути × для закриття
3. Alert зникає з анімацією
```

### 5. Комбінований Пошук + Фільтр
```
1. Ввести "prom" в search
2. Клікнути "Monitoring" filter
3. Побачити Prometheus + Promtail
```

---

## 🎯 EMPTY STATES

### Немає результатів пошуку:
```
┌─────────────────────────────────────┐
│                                     │
│              🔍                     │
│                                     │
│        No services found            │
│                                     │
│  Try adjusting your search or      │
│  filter criteria                    │
│                                     │
└─────────────────────────────────────┘
```

**Коли з'являється**:
- Пошук не знайшов результатів
- Фільтр + пошук не дали збігів

---

## ⚡ PERFORMANCE TIPS

### Best Practices:
1. **Пошук**: Вводити мінімум 2-3 символи для точності
2. **Фільтри**: Використовувати для швидкого доступу до категорії
3. **Модальні вікна**: Закривати після перегляду для кращої продуктивності
4. **Alerts**: Закривати старі для очищення UI

### Shortcuts (майбутнє):
```
⌘/Ctrl + K  - Фокус на пошук
ESC         - Закрити модальне вікно
⌘/Ctrl + F  - Фільтр по категорії
```

---

## 📊 SERVICE CATEGORIES BREAKDOWN

### ⚙️ Core Application Services (5)
```
1. Backend API         - 99.9% uptime, 1,247 req/min, 45ms
2. Frontend React      - 100% uptime, 2,156 req/min, 12ms
3. Celery Worker       - 99.7% uptime, 234 req/min, 78ms
4. Celery Scheduler    - 99.8% uptime, 156 req/min, 23ms
5. Agent Supervisor    - 99.6% uptime, 834 req/min, 56ms
```

### 🗄️ Database & Storage (4)
```
1. PostgreSQL      - 100% uptime, 892 req/min, 15ms
2. Redis Cache     - 99.8% uptime, 3,421 req/min, 3ms
3. MinIO Storage   - 100% uptime, 678 req/min, 89ms
4. Qdrant Vector   - ⚠️ 98.5% uptime, 456 req/min, 156ms
```

### 🔍 Search & Indexing (2)
```
1. OpenSearch           - 99.9% uptime, 2,145 req/min, 67ms
2. OpenSearch Dashboard - 99.8% uptime, 567 req/min, 123ms
```

### 📦 Message Queue (1)
```
1. Redpanda Kafka - 99.7% uptime, 1,876 req/min, 34ms
```

### 🤖 AI/ML Services (1)
```
1. Model SDK - 99.5% uptime, 743 req/min, 234ms
```

### 📊 Monitoring Stack (7)
```
1. Prometheus       - 100% uptime, 445 req/min, 56ms
2. Grafana          - 100% uptime, 789 req/min, 78ms
3. Loki Logs        - 99.9% uptime, 2,341 req/min, 43ms
4. Promtail         - 99.9% uptime, 3,567 req/min, 23ms
5. Tempo Tracing    - 99.8% uptime, 1,234 req/min, 67ms
6. AlertManager     - 100% uptime, 67 req/min, 45ms
7. Blackbox Exporter- 100% uptime, 234 req/min, 12ms
```

### 📈 System Metrics (2)
```
1. cAdvisor      - 100% uptime, 567 req/min, 34ms
2. Node Exporter - 100% uptime, 890 req/min, 23ms
```

### 🔒 Security & Auth (1)
```
1. Keycloak Auth - 100% uptime, 445 req/min, 89ms
```

---

## 🚀 ЗАПУСК DASHBOARD

### Development Mode:
```bash
cd predator12-local/frontend
npm run dev

# Відкрити в браузері:
http://localhost:5091/
```

### Production Mode:
```bash
cd predator12-local/frontend
npm run build

# Сервіс на Docker:
docker-compose up frontend

# Відкрити в браузері:
http://localhost:3000/
```

---

## 🎉 FEATURES SUMMARY

✅ **Search** - Real-time пошук по всіх сервісах  
✅ **Filters** - 8 категорій з динамічними лічильниками  
✅ **Metrics** - 4 системні метрики з trends  
✅ **Charts** - Performance graph з quick stats  
✅ **Services** - 25 сервісів з детальною інформацією  
✅ **Modal** - Детальний перегляд сервісу з метриками  
✅ **Alerts** - Система сповіщень (error/warning/info)  
✅ **Animations** - Плавні transitions та hover effects  
✅ **Responsive** - Адаптивний дизайн для всіх екранів  
✅ **Glassmorphism** - Сучасний UI з blur ефектами  

---

**Створено**: 6 Жовтня 2025  
**Версія**: 3.0  
**Статус**: ✅ ACTIVE  
**Dev Server**: http://localhost:5091/  
**Production**: http://localhost:3000/
