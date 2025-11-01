# AutoIndexing (Qdrant/OpenSearch)

AutoIndexing — автоматичне індексування нових даних у Qdrant або OpenSearch.

## Приклад реалізації (псевдокод)

```python
# Псевдокод для автоматичного індексування
from qdrant_client import QdrantClient

def auto_index(data):
    client = QdrantClient(url="http://qdrant:6333")
    # ... логіка додавання/оновлення векторів ...

# Для OpenSearch — використовуйте аналогічний підхід через офіційний клієнт
```

> Рекомендується винести цю логіку у окремий ETL-скрипт або мікросервіс.
