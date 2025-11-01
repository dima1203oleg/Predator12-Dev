# Автоматизація побудови графів зв’язків та інтеграція з AI-агентами

## 1. Побудова графа зв’язків після ETL/merge
- Використовуйте NetworkX для побудови графа компаній, осіб, декларацій, судових справ:
```python
import networkx as nx
import pandas as pd
G = nx.Graph()
df = pd.read_sql('SELECT * FROM customs_registry', engine)
for _, row in df.iterrows():
    G.add_node(row['edrpou'], type='company')
    G.add_node(row['director_name'], type='person')
    G.add_edge(row['edrpou'], row['director_name'], type='director')
# ...додавайте інші зв’язки (судові справи, податкові накладні)...
nx.write_gml(G, 'customs_graph.gml')
```

## 2. Інтеграція з AI-агентами
- Після побудови графа викликайте AI-агента для аналізу схем, аномалій, пошуку фірм-прокладок:
```python
from agents.arbiter_agent import analyze_graph
anomalies = analyze_graph('customs_graph.gml')
print(anomalies)
```

## 3. Автоматизація
- Додавайте ці кроки у ETL/merge pipeline або запускайте автоматично після кожного імпорту.
- Результати аналізу можна зберігати у knowledge graph, відображати у Grafana/OpenSearch Dashboard, або надсилати алерти.

> Таким чином, система автоматично будує графи зв’язків, аналізує їх AI-агентами та інтегрує результати у knowledge graph для подальшої аналітики та візуалізації.
