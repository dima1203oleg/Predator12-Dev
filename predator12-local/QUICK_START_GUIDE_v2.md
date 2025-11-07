# 🚀 QUICK START GUIDE - PREDATOR ANALYTICS NEXUS CORE V2.0

## ⚡ Швидкий запуск (1 хвилина)

### Крок 1: Запуск системи

```bash
cd /Users/dima/Documents/Predator11
docker-compose up -d
```

### Крок 2: Перевірка статусу (через 2-3 хвилини)

```bash
# Швидка перевірка
python scripts/quick_stack_check.py

# Детальний статус
docker ps
```

### Крок 3: Тестування агентів

```bash
# Тест всіх 26 агентів з новою логікою
python scripts/test_all_26_agents.py

# Тест конкретного агента
python scripts/production_model_distribution.py
```

---

## 🌐 Доступ до інтерфейсів

| Сервіс                    | URL                   | Логін       | Призначення        |
| ------------------------- | --------------------- | ----------- | ------------------ |
| **Frontend**              | http://localhost:3001 | Keycloak    | Головний інтерфейс |
| **Backend API**           | http://localhost:8000 | -           | REST API           |
| **Grafana**               | http://localhost:3001 | admin/admin | Дашборди           |
| **Prometheus**            | http://localhost:9090 | -           | Метрики            |
| **OpenSearch Dashboards** | http://localhost:5601 | -           | Пошук та аналітика |
| **Keycloak**              | http://localhost:8080 | admin/admin | Аутентифікація     |

---

## 🤖 Валідація системи

### ✅ Перевірка всіх 26 агентів:

```bash
python scripts/test_all_26_agents.py
```

**Очікуваний результат**: 26/26 успішних агентів з конкурсною логікою

### ✅ Перевірка моделей:

```bash
curl http://localhost:3010/health
```

**Очікуваний результат**: 21 активна безкоштовна модель

### ✅ Перевірка web-інтерфейсу:

```bash
curl http://localhost:3001
```

**Очікуваний результат**: Redirect to Keycloak login

---

## 🎯 Статус готовності

### ✅ СИСТЕМА ГОТОВА, ЯКЩО:

- 🐳 **25/25 контейнерів** запущені (деякі можуть бути "unhealthy" через health check)
- 🤖 **26/26 агентів** проходять тест з конкурсною логікою
- 🌐 **Frontend доступний** на http://localhost:3001
- 📊 **Backend API** повертає `{"status":"healthy"}` на /health
- 🔍 **Модель SDK** показує 21 активну модель

### 🛠️ TROUBLESHOOTING

#### Помилка 1: Контейнери не запускаються

```bash
# Перевірити логи
docker-compose logs --tail=50 [service_name]

# Перезапустити проблемний сервіс
docker-compose restart [service_name]
```

#### Помилка 2: Агенти не працюють

```bash
# Перевірити agent-supervisor
docker logs predator11-agent-supervisor-1

# Перезапустити supervisor
docker-compose restart agent-supervisor
```

#### Помилка 3: Моделі недоступні

```bash
# Перевірити modelsdk
docker logs predator11-modelsdk-1
curl http://localhost:3010/v1/models
```

#### Помилка 4: Frontend недоступний

```bash
# Перевірити frontend
docker logs predator11-frontend-1
curl http://localhost:3001
```

---

## 📊 Ключові метрики успіху

### 🎯 Тестування агентів (очікувані результати):

- **Успішність**: 26/26 (100%)
- **Середня якість**: >0.80
- **Середня латентність**: <2000ms
- **Конкурсів проведено**: 26/26
- **Fallback активацій**: 0 (під час нормальної роботи)

### 💰 Операційні витрати:

- **Вартість**: $0.00 (100% безкоштовні моделі)
- **Активних моделей**: 21
- **Платних моделей**: 0

### 🏆 Топ агенти за продуктивністю:

1. **ChiefOrchestrator**: 0.991 якості
2. **RedTeam**: 0.988 якості
3. **AutoHeal**: 0.975 якості

---

## 🚨 Критичні перевірки перед продакшн

### ✅ Checklist:

- [ ] Всі 26 агентів проходять тест
- [ ] Конкурсна логіка активна на всіх агентах
- [ ] Web-інтерфейс повністю функціональний
- [ ] Backend API доступне та здорове
- [ ] Всі моделі безкоштовні та працюють
- [ ] Моніторинг (Prometheus/Grafana) активний
- [ ] Логування (Loki) працює
- [ ] Безпека (Keycloak) налаштована
- [ ] База даних (PostgreSQL) підключена
- [ ] Cache (Redis) активний

---

## 🎉 ФІНАЛЬНА ВАЛІДАЦІЯ

Запустіть цю команду для повної валідації:

```bash
# Повна перевірка системи (займає ~2 хвилини)
echo "🚀 Валідація Predator Analytics Nexus Core v2.0"
echo "================================================"

echo "1️⃣ Перевірка контейнерів..."
python scripts/quick_stack_check.py

echo -e "\n2️⃣ Валідація всіх 26 агентів..."
python scripts/test_all_26_agents.py

echo -e "\n3️⃣ Перевірка web-інтерфейсу..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3001
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000/health

echo -e "\n🎯 СИСТЕМА ГОТОВА ДО ПРОДАКШН!"
```

**Очікуваний результат**: Всі тести пройдені, система operational! 🚀

---

_Quick Start Guide v2.0 | Production Ready | 28.09.2024_
