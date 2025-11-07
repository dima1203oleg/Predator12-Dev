# 🔍 OpenSearch Setup Guide (Local, без Docker)

**Дата:** 6 жовтня 2025 р.  
**Версія:** OpenSearch 2.19.x (стабільна)

---

## ⚡ Швидкий старт (Homebrew - рекомендовано)

### Встановлення

```bash
# Встановлення OpenSearch та Dashboards
brew install opensearch opensearch-dashboards

# Запуск сервісів
brew services start opensearch
brew services start opensearch-dashboards
```

### Перевірка

```bash
# OpenSearch API
curl http://localhost:9200

# OpenSearch Dashboards
open http://localhost:5601
```

**Дефолтні порти:**

- OpenSearch: `http://localhost:9200`
- Dashboards: `http://localhost:5601`

**Логін:** admin / (встановіть через `OPENSEARCH_INITIAL_ADMIN_PASSWORD`)

---

## 🎯 Детальне налаштування (Tarball)

### Крок 1: Завантаження

```bash
cd ~/Downloads

# OpenSearch 2.19.3 (приклад для macOS ARM)
wget https://artifacts.opensearch.org/releases/bundle/opensearch/2.19.3/opensearch-2.19.3-darwin-arm64.tar.gz
tar -xzf opensearch-2.19.3-darwin-arm64.tar.gz

# OpenSearch Dashboards
wget https://artifacts.opensearch.org/releases/bundle/opensearch-dashboards/2.19.3/opensearch-dashboards-2.19.3-darwin-arm64.tar.gz
tar -xzf opensearch-dashboards-2.19.3-darwin-arm64.tar.gz

# Переміщення в зручне місце
sudo mv opensearch-2.19.3 /usr/local/opensearch
sudo mv opensearch-dashboards-2.19.3 /usr/local/opensearch-dashboards
```

### Крок 2: Налаштування OpenSearch (single-node для dev)

```bash
cd /usr/local/opensearch

# Додати конфігурацію single-node
echo "discovery.type: single-node" >> config/opensearch.yml

# Для HTTP (без TLS) - dev режим
echo "plugins.security.disabled: true" >> config/opensearch.yml

# Або для TLS (production-like):
# Залиште дефолтні налаштування, встановіть пароль через env
```

**config/opensearch.yml (мінімальний для dev):**

```yaml
cluster.name: predator-opensearch
node.name: node-1
path.data: /usr/local/opensearch/data
path.logs: /usr/local/opensearch/logs
network.host: 127.0.0.1
http.port: 9200
discovery.type: single-node

# Для dev без TLS (не для production!)
plugins.security.disabled: true
# Heap size (512MB для dev)
# Встановлюється через OPENSEARCH_JAVA_OPTS
```

### Крок 3: Налаштування Dashboards

```bash
cd /usr/local/opensearch-dashboards
```

**config/opensearch_dashboards.yml:**

```yaml
server.host: "127.0.0.1"
server.port: 5601
server.name: "predator-dashboards"

# Підключення до OpenSearch
opensearch.hosts: ["http://localhost:9200"] # HTTP для dev
# opensearch.hosts: ["https://localhost:9200"]  # HTTPS для production

# Для dev без SSL
opensearch.ssl.verificationMode: none
# Для production з TLS
# opensearch.ssl.verificationMode: full
# opensearch.username: "admin"
# opensearch.password: "your_password"
```

### Крок 4: Запуск

**OpenSearch (термінал 1):**

```bash
cd /usr/local/opensearch

# Встановити heap size та admin password
export OPENSEARCH_INITIAL_ADMIN_PASSWORD='Str0ng_Pass!'
export OPENSEARCH_JAVA_OPTS="-Xms512m -Xmx512m"

# Запуск
./bin/opensearch
```

**Dashboards (термінал 2):**

```bash
cd /usr/local/opensearch-dashboards

# Запуск
./bin/opensearch-dashboards
```

### Крок 5: Перевірка

```bash
# Перевірка OpenSearch
curl http://localhost:9200

# Відповідь:
{
  "name" : "node-1",
  "cluster_name" : "predator-opensearch",
  "version" : {
    "number" : "2.19.3",
    ...
  }
}

# Відкрити Dashboards
open http://localhost:5601
```

---

## 🐛 Troubleshooting

### 1. Dashboards не підключаються

**Симптом:** "Unable to connect to OpenSearch"

**Рішення:**

```bash
# Перевірка, що OpenSearch працює
curl http://localhost:9200

# Перевірка конфігу Dashboards
cat /usr/local/opensearch-dashboards/config/opensearch_dashboards.yml | grep opensearch.hosts

# Має бути:
opensearch.hosts: ["http://localhost:9200"]

# Додати якщо потрібно:
opensearch.ssl.verificationMode: none
```

### 2. Порт 5601 зайнятий

**Перевірка:**

```bash
sudo lsof -i :5601
```

**Рішення:**

```bash
# Вбити процес
kill -9 <PID>

# Або змінити порт у config/opensearch_dashboards.yml:
server.port: 5602
```

### 3. OpenSearch не стартує (мало пам'яті)

**Симптом:** OutOfMemoryError

**Рішення:**

```bash
# Зменшити heap
export OPENSEARCH_JAVA_OPTS="-Xms256m -Xmx512m"

# Або закрити інші програми
```

### 4. TLS/SSL помилки

**Симптом:** "certificate verify failed"

**Рішення (для dev):**

```yaml
# У opensearch_dashboards.yml
opensearch.ssl.verificationMode: none
plugins.security.disabled: true
```

### 5. Python клієнт не підключається

**Симптом:** `ConnectionError` у Python

**Перевірка версії:**

```python
from opensearch_py import __version__
print(__version__)  # Має бути >=2.4.1,<3.0 для кластера 2.x
```

**Рішення:**

```bash
# Для OpenSearch 2.x (brew default)
pip install 'opensearch-py>=2.4.1,<3.0'

# Для OpenSearch 3.x
pip install 'opensearch-py==3.0.0'
```

---

## 🔧 Сумісність версій

| OpenSearch Server | opensearch-py Client | Примітка                |
| ----------------- | -------------------- | ----------------------- |
| 2.x (2.19.3)      | `>=2.4.1,<3.0`       | Brew default, стабільно |
| 3.x               | `==3.0.0`            | Breaking changes        |

**Важливо:** Перевірте версію кластера перед встановленням клієнта!

```bash
curl http://localhost:9200 | grep number
```

### 📌 Різниця між opensearch-py 2.x та 3.x

**opensearch-py 2.x (Рекомендовано для Predator12):**

- ✅ Стабільний, тестований
- ✅ Сумісний з OpenSearch 2.x clusters
- ✅ Ретроспективна сумісність з Elasticsearch API
- ✅ Всі поточні агенти працюють без змін

```python
# requirements.txt
opensearch-py>=2.4.1,<3.0

# Код залишається незмінним
from opensearchpy import OpenSearch
client = OpenSearch(hosts=['http://localhost:9200'])
```

**opensearch-py 3.x (Тільки для OpenSearch 3.x):**

- ⚠️ Breaking changes в API
- ⚠️ Може потребувати рефакторингу існуючого коду
- ⚠️ Не працює з OpenSearch 2.x
- ✅ Нові фічі для OpenSearch 3.x

```python
# requirements.txt
opensearch-py==3.0.0

# Можливі зміни в API (приклад):
# - Зміни в методах індексації
# - Інша обробка помилок
# - Оновлені параметри search/bulk операцій
```

**Наша рекомендація для Predator12:**

```bash
# Використовуйте 2.x для максимальної стабільності
pip install 'opensearch-py>=2.4.1,<3.0'

# Міграція на 3.x тільки якщо:
# 1. Вам потрібні фічі OpenSearch 3.x
# 2. Ви готові протестувати всі агенти
# 3. Є час на рефакторинг (якщо потрібно)
```

---

## 📊 Python інтеграція

### Базове підключення

```python
from opensearchpy import OpenSearch

# Для dev (без TLS)
client = OpenSearch(
    hosts=[{'host': 'localhost', 'port': 9200}],
    http_compress=True,
    use_ssl=False,
    verify_certs=False,
    ssl_assert_hostname=False,
    ssl_show_warn=False
)

# Перевірка підключення
info = client.info()
print(f"Connected to OpenSearch {info['version']['number']}")

# Створення індексу
client.indices.create(
    index='test-index',
    body={
        'settings': {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }
    }
)

# Додавання документу
doc = {
    'title': 'Test Document',
    'content': 'This is a test'
}
client.index(index='test-index', body=doc, id=1)

# Пошук
response = client.search(
    index='test-index',
    body={
        'query': {
            'match': {
                'content': 'test'
            }
        }
    }
)

print(response['hits']['hits'])
```

### Async клієнт

```python
from opensearchpy import AsyncOpenSearch
import asyncio

async def main():
    client = AsyncOpenSearch(
        hosts=[{'host': 'localhost', 'port': 9200}],
        use_ssl=False,
        verify_certs=False
    )

    info = await client.info()
    print(f"Connected: {info['version']['number']}")

    await client.close()

asyncio.run(main())
```

---

## 🎯 Production конфігурація (базова)

### OpenSearch (з TLS)

```yaml
# config/opensearch.yml
cluster.name: predator-production
node.name: node-1

network.host: 0.0.0.0
http.port: 9200

# Security
plugins.security.ssl.http.enabled: true
plugins.security.ssl.http.pemcert_filepath: certs/node.pem
plugins.security.ssl.http.pemkey_filepath: certs/node-key.pem
plugins.security.ssl.http.pemtrustedcas_filepath: certs/root-ca.pem
# Heap
# export OPENSEARCH_JAVA_OPTS="-Xms2g -Xmx2g"
```

### Dashboards (з TLS)

```yaml
# config/opensearch_dashboards.yml
server.host: "0.0.0.0"
server.port: 5601

opensearch.hosts: ["https://localhost:9200"]
opensearch.ssl.verificationMode: full
opensearch.username: "admin"
opensearch.password: "${OPENSEARCH_PASSWORD}"
```

---

## 🚀 Автоматизація

### Bash скрипт для старту

```bash
#!/bin/bash
# start-opensearch.sh

export OPENSEARCH_INITIAL_ADMIN_PASSWORD='Str0ng_Pass!'
export OPENSEARCH_JAVA_OPTS="-Xms512m -Xmx512m"

cd /usr/local/opensearch
./bin/opensearch &

# Чекаємо на старт
sleep 10

cd /usr/local/opensearch-dashboards
./bin/opensearch-dashboards &

echo "OpenSearch: http://localhost:9200"
echo "Dashboards: http://localhost:5601"
```

### launchd для автостарту (macOS)

```bash
# Якщо встановлено через brew
brew services start opensearch
brew services start opensearch-dashboards

# Перевірка
brew services list
```

---

## 📋 Checklist

- [ ] Встановити OpenSearch (brew або tarball)
- [ ] Налаштувати single-node для dev
- [ ] Встановити OpenSearch Dashboards
- [ ] Налаштувати підключення до OpenSearch
- [ ] Запустити обидва сервіси
- [ ] Перевірити http://localhost:9200
- [ ] Відкрити http://localhost:5601
- [ ] Встановити правильну версію `opensearch-py`
- [ ] Протестувати Python підключення

---

## 🔗 Корисні посилання

- [OpenSearch Documentation](https://opensearch.org/docs/latest/)
- [OpenSearch Dashboards Guide](https://opensearch.org/docs/latest/dashboards/)
- [opensearch-py Client](https://opensearch.org/docs/latest/clients/python/)
- [Tarball Installation](https://opensearch.org/docs/latest/install-and-configure/install-opensearch/tar/)

---

**Готово!** OpenSearch налаштовано та готовий до використання! 🎉
