# Інтеграція митних декларацій з іншими реєстрами (шаблон)

## 1. Злиття з податковими накладними
- JOIN по ЄДРПОУ або назві компанії:
```sql
SELECT c.*, t.*
FROM customs_registry c
LEFT JOIN tax_invoices t ON c.edrpou = t.edrpou
```

## 2. Зв’язок із судовими справами
- JOIN по ПІБ посадових осіб:
```sql
SELECT c.*, s.*
FROM customs_registry c
LEFT JOIN court_cases s ON c.director_name = s.person_name
```

## 3. Групування по товарних кодах
- Аналіз імпорту/експорту по HS/UKT ZED:
```sql
SELECT hs_code, SUM(amount_usd) as total_import
FROM customs_registry
GROUP BY hs_code
```

## 4. Векторний пошук схожих компаній
- Використовуйте Qdrant/pgvector для пошуку схожих описів компаній:
```python
from qdrant_client import QdrantClient
client = QdrantClient(url="http://qdrant:6333")
# ...далі — пошук схожих векторів...
```

## 5. Автоматизація
- Додавайте ці кроки у ETL-процес після завантаження митних декларацій.
- Можна запускати як окремий скрипт або інтегрувати у knowledge graph.

## 6. Self-healing, auto-fix, chaos engineering, AI-агенти (Best Practices)

- **Self-healing merge:** Всі злиття мають автоматичне виправлення конфліктів (auto-fix, LLM, auto-heal).
- **AI anomaly detection:** Використовуйте deepchecks, Grafana ML для виявлення аномалій у злитих даних.
- **Chaos engineering:** Додавайте chaos monkey-тести для resiliency merge-процесів.
- **Auto-rollback:** При помилках — автоматичне повернення до попередньої версії.
- **Knowledge graph auto-update:** Всі зміни автоматично оновлюють граф знань.
- **Auto-train loop:** Всі AI-агенти донавчаються на нових даних.
- **Observability:** Моніторинг, алерти, логування через Prometheus, Grafana, Loki.
- **Policy-as-code:** Валідація злиття через OPA/Kyverno.
- **Auto-test:** Всі merge-процеси мають автотести (pytest, great_expectations).

> Додавайте ці best practices у всі нові сценарії злиття та інтеграції для production-ready resiliency.

> Для складніших сценаріїв — використовуйте NetworkX для побудови графів зв’язків між компаніями, особами, справами, податковими накладними.
