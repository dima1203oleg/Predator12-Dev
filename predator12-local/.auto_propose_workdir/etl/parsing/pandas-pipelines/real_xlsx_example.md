# Приклад інтеграції реального XLSX-файлу з реєстром у пайплайн

## 1. Extract
```python
import pandas as pd
# Вкажіть шлях до файлу
file_path = '/Users/dima/Desktop/Лютий_10.xlsx'
df = pd.read_excel(file_path, dtype=str)
print(df.head())
```

## 2. Transform
- Далі використовуйте стандартні кроки нормалізації, очищення, перевірки якості (див. шаблони).

## 3. Load
- Завантажуйте у PostgreSQL, MinIO, knowledge graph за аналогією з іншими пайплайнами.

> Можна інтегрувати цей код у будь-який ETL-скрипт з etl-parsing/pandas-pipelines/.
