# Шаблон для створення нового AI-агента

## 1. Визначте задачу (наприклад, пошук нових схем, аномалій, фірм-прокладок)

## 2. Створіть клас агента у agents/
```python
class NewSchemeAgent:
    def analyze(self, data):
        # Додавайте логіку аналізу
        return result
```

## 3. Інтегруйте агента у ETL/аналітичний пайплайн
```python
from agents.new_scheme_agent import NewSchemeAgent
agent = NewSchemeAgent()
result = agent.analyze(data)
```

## 4. Додавайте результати у knowledge graph, алерти, звіти.

> Можна створювати агентів для будь-яких задач: fraud detection, anomaly detection, risk scoring тощо.
