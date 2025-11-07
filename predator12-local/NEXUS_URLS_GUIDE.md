# 🚀 Predator Analytics Nexus - Правильні URL адреси

## 📍 Основні адреси веб-інтерфейсів

### 🎯 Frontend (Nexus Core UI)

- **Development**: `http://localhost:3000`
- **Production**: `http://localhost:3000` (через Docker)
- **Налаштування**: `frontend/vite.config.ts` - порт 3000

### 🛠️ Backend API

- **Development**: `http://localhost:8000`
- **Production**: `http://localhost:8000` (через Docker)
- **Health Check**: `http://localhost:8000/healthz/readiness`

### 📊 Grafana Dashboard

- **URL**: `http://localhost:3001`
- **Login**: admin/admin
- **Призначення**: Моніторинг та візуалізація метрик

### 🔍 OpenSearch Dashboard

- **URL**: `http://localhost:5601`
- **Призначення**: Пошук та аналіз логів

### ⚡ Prometheus

- **URL**: `http://localhost:9090`
- **Призначення**: Збір та зберігання метрик

### 🔄 Kafka UI

- **URL**: `http://localhost:8080`
- **Призначення**: Управління Kafka топіками та повідомленнями

## 🎮 Команди запуску

### Frontend Development

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

### Docker Compose (все разом)

```bash
docker compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Grafana: http://localhost:3001
```

### Debug Script

```bash
bash debug_nexus_ui.sh
# → Автоматично відкриває http://localhost:3000
```

## ❌ Неправильні адреси

- ~~`http://localhost:5173`~~ - стандартний Vite порт, але не використовується
- ~~`http://localhost:3000/dashboards`~~ - неправильний шлях

## ✅ Правильна адреса для веб-інтерфейсу:

# 🌟 http://localhost:3000

**Це основний Nexus Core інтерфейс з усіма 26 агентами, 48 AI моделями та покращеним 3D гідом!**

---

_Створено 27 вересня 2025 р._
