# 🔍 АНАЛІЗ ПРОБЛЕМИ З ОРАНЖЕВИМИ КОНТЕЙНЕРАМИ

## 📊 РЕЗУЛЬТАТИ ДІАГНОСТИКИ

### ❌ ОСНОВНА ПРОБЛЕМА

**Docker daemon не запущений** - це корінь всіх проблем.

```
Cannot connect to the Docker daemon at unix:///Users/dima/.docker/run/docker.sock.
Is the docker daemon running?
```

### 🎯 ЩО ЦЕ ОЗНАЧАЄ

1. **Жодного контейнера не працює** - всі сервіси недоступні
2. **Оранжевий статус** у попередніх тестах, швидше за все, був через:
   - Health checks що не проходили
   - Контейнери у стані "starting" або "unhealthy"
   - Проблеми з мережею між контейнерами

### 🛠️ ПЛАН ВИПРАВЛЕННЯ

#### Крок 1: Запустити Docker Desktop

```bash
# Запуск Docker Desktop на macOS
open -a Docker
```

Або запустіть Docker Desktop вручну з Applications.

#### Крок 2: Перевірити статус Docker

```bash
docker --version
docker info
```

#### Крок 3: Виправити застарілі версії в docker-compose

```yaml
# Видалити з docker-compose.yml та docker-compose.override.yml
version: "3.8" # ← Ця строка застаріла
```

#### Крок 4: Запустити stack

```bash
cd /Users/dima/Documents/Predator11
docker-compose up -d
```

#### Крок 5: Перевірити статус контейнерів

```bash
docker-compose ps
docker-compose logs --tail=20
```

### 🔍 МОЖЛИВІ ПРИЧИНИ ОРАНЖЕВИХ СТАТУСІВ

Коли Docker запрацює, оранжеві статуси можуть з'явитися через:

#### 1. 🕐 **Повільний запуск (starting)**

- **Причина**: Великі образи, повільне завантаження
- **Рішення**: Зачекати 2-3 хвилини

#### 2. 🏥 **Неуспішні health checks (unhealthy)**

- **Причина**: Сервіс не відповідає на health check
- **Типові проблеми**:
  - OpenSearch потребує більше пам'яті
  - PostgreSQL довго ініціалізується
  - Backend не може підключитися до DB

#### 3. 🔧 **Проблеми конфігурації**

- **Змінні оточення**: Неправильні або відсутні
- **Порти**: Конфлікти портів
- **Volumes**: Неправильні шляхи

#### 4. 🐌 **Недостатньо ресурсів**

- **RAM**: < 8GB для всього стеку
- **CPU**: Високе навантаження
- **Disk**: Мало місця

### 📋 CHECKLIST ВИПРАВЛЕННЯ

```bash
# 1. Запустити Docker Desktop
open -a Docker

# 2. Видалити застарілі версії
sed -i '' '/^version:/d' docker-compose.yml
sed -i '' '/^version:/d' docker-compose.override.yml

# 3. Перевірити .env файл
cat .env | grep -E "(DATABASE_URL|REDIS_URL|SECRET_KEY)"

# 4. Запустити stack
docker-compose down  # Якщо щось працює
docker-compose up -d

# 5. Моніторити запуск
watch -n 5 'docker-compose ps'

# 6. Перевірити логи проблемних сервісів
docker-compose logs opensearch
docker-compose logs backend
docker-compose logs db
```

### 🎯 ОЧІКУВАНІ РЕЗУЛЬТАТИ

Після запуску Docker та виправлення конфігурації:

- 🟢 **Зелені (healthy)**: db, redis, frontend, prometheus
- 🟡 **Оранжеві (starting)**: opensearch, backend (перші 2-3 хвилини)
- 🔴 **Червоні (unhealthy)**: тільки якщо є реальні проблеми

### 💡 МОНІТОРИНГ

Для відстеження стану в реальному часі:

```bash
# Статус всіх контейнерів
docker-compose ps

# Логи в реальному часі
docker-compose logs -f

# Health статус конкретного сервіса
docker inspect predator11_opensearch_1 | jq '.[0].State.Health'
```

### 🚀 АВТОМАТИЗАЦІЯ

Створений скрипт для автоматичної діагностики:

```bash
python3 scripts/quick_stack_check.py
```

---

**Висновок**: Основна проблема - не запущений Docker. Оранжеві статуси - це нормально під час запуску складного стеку. Критично важливо дати системі час на ініціалізацію.
