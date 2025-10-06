# Розширення knowledge graph для митних декларацій та реєстрів

## 1. Додавання зв’язків у knowledge graph
- Після злиття декларацій з іншими реєстрами додавайте у knowledge_graph.json вузли та ребра:
```python
import json
with open('knowledge_graph.json') as f:
    kg = json.load(f)
# Додаємо вузол для нової компанії
kg['nodes'].append({
    'id': 'company:12345678',
    'type': 'company',
    'name': 'ТОВ "Ромашка"',
    'edrpou': '12345678'
})
# Додаємо ребро між компанією та декларацією
kg['edges'].append({
    'source': 'company:12345678',
    'target': 'declaration:2024-01-01-0001',
    'type': 'declared_by'
})
with open('knowledge_graph.json', 'w') as f:
    json.dump(kg, f, indent=2)
```

## 2. Автоматизація
- Додавайте цей крок у ETL/merge pipeline після кожного злиття.
- Knowledge graph автоматично оновлюється для semantic search, AI-аналізу, побудови графів зв’язків.

## 3. Візуалізація
- Використовуйте D3.js/NetworkX для побудови інтерактивних графів у фронтенді.

> Таким чином, knowledge graph стає центральною точкою для аналітики, AI та візуалізації зв’язків між компаніями, деклараціями, судовими справами, податковими накладними.
