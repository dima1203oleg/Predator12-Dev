# Troubleshooting

## Загальні проблеми та рішення

### Проблеми з запуском

#### Сервіси не запускаються
```bash
# Перевірити статус контейнерів
docker ps -a

# Перевірити логи
make logs

# Перевірити ресурси системи
docker system df
free -h

# Очистити та перезапустити
make clean && make start
```

#### Порти зайняті
```bash
# Знайти процеси на портах
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
lsof -i :9200  # OpenSearch

# Зупинити конфліктуючі процеси
sudo kill -9 <PID>
```

### Проблеми з агентами

#### Агенти не відповідають
```bash
# Перезапуск агентів
make agents-restart

# Перевірка статусу
make agents-status

# Детальна діагностика
curl http://localhost:8000/api/v1/agents/diagnosis
```

#### Помилки моделей
```bash
# Перевірити API ключі
grep -E "(OPENAI|GITHUB|BING)" .env

# Тест підключення до моделей
curl -X POST http://localhost:8000/api/v1/agents/test-models
```

### Проблеми з даними

#### Помилки ETL
```bash
# Статус ETL процесів
curl http://localhost:8000/api/v1/etl/status

# Перевірити індекси OpenSearch
curl http://localhost:9200/_cat/indices?v

# Ручний запуск індексації
curl -X POST http://localhost:8000/api/v1/etl/index \
  -H "Content-Type: application/json" \
  -d '{"table_name": "your_table"}'
```

#### Проблеми з PII маскуванням
```bash
# Перевірити конфігурацію PII
python3 scripts/indexing/discover_pg_schema.py --dry-run

# Тест маскування
python3 -c "from backend.app.core.pii import mask_pii; print(mask_pii('test data'))"

# Переіндексація з новими правилами PII
curl -X POST http://localhost:8000/api/v1/etl/reindex-pii
```

### Проблеми з продуктивністю

#### Повільні відповіді агентів
```bash
# Перевірити метрики в Grafana
# http://localhost:3001

# Оптимізувати використання моделей
curl -X POST http://localhost:8000/api/v1/agents/optimize-routing
```

#### Високе навантаження на систему
```bash
# Моніторинг ресурсів
htop
iotop

# Масштабування сервісів
docker-compose up -d --scale backend=3
```

### Проблеми з безпекою

#### Помилки автентифікації
```bash
# Перевірити Keycloak
curl http://localhost:8080/auth/realms/predator11/.well-known/openid_configuration

# Оновити JWT секрети
# Відредагуйте JWT_SECRET_KEY в .env та перезапустіть
```

#### Проблеми доступу до PII
```bash
# Перевірити ролі користувача
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:8000/api/v1/users/me/roles

# Аудит доступу до PII
curl http://localhost:8000/api/v1/audit/pii-access?limit=100
```

## Діагностичні команди

### Системна діагностика
```bash
# Повна перевірка системи
make health-check

# Експорт всіх логів
make export-logs

# Тест всіх компонентів
make test-system
```

### Налагодження розробки
```bash
# Режим розробки з детальними логами
DEBUG=true make dev

# Підключення до контейнера для налагодження
docker exec -it predator11_backend_1 /bin/bash
```

## Отримання допомоги

1. **Перевірте логи** - завжди починайте з `make logs`
2. **GitHub Issues** - створіть issue з детальним описом
3. **Документація** - перевірте відповідний розділ docs/
4. **Телеграм алерти** - налаштуйте для оперативних сповіщень

## Часті помилки

| Помилка | Причина | Рішення |
|---------|---------|---------|
| `Connection refused` | Сервіс не запущений | `make start` |
| `Permission denied` | Проблеми з Docker | `sudo usermod -aG docker $USER` |
| `Port already in use` | Конфлікт портів | Змініть порти в .env |
| `Model API error` | Невірні API ключі | Перевірте .env файл |
| `PII detection failed` | Помилка маскування | Перевірте PII_SALT |
