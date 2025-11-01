# Шаблон інтеграції з державними/міжнародними реєстрами

## 1. Завантаження даних
- Використовуйте pandas для CSV/XLS, requests для API, pdfplumber для PDF.
- Для санкційних списків — автоматичний парсинг з офіційних сайтів (OFAC, EU, UN).

## 2. Нормалізація
- Приводьте імена, коди, країни до єдиного формату (наприклад, ISO-коди країн).

## 3. Злиття з основною базою
- JOIN по імені, коду, країні, бенефіціару.

## 4. Додавання у knowledge graph
- Додавайте вузли/ребра для нових обʼєктів (санкційна особа, компанія, країна).

## 5. Автоматизація
- Запускати ETL через CI/CD або webhook.

---

## 6. Приклад інтеграції Excel-файлу з іншими реєстрами без конфліктів

### 6.1. Завантаження Excel та основної бази
```python
import pandas as pd
# Завантаження Excel-файлу (наприклад, customs_registry_feb.csv та Лютий_10.xlsx)
df_main = pd.read_csv('../../PredatorAnalytics/data/customs_registry_feb.csv', sep=';', dtype=str)
df_new = pd.read_excel('../../PredatorAnalytics/data/Лютий_10.xlsx', dtype=str)
```

### 6.2. Нормалізація ключових полів
```python
# Нормалізуємо коди, імена, країни (приклад для ЄДРПОУ та країни)
df_main['ЄДРПОУ одержувача'] = df_main['ЄДРПОУ одержувача'].str.zfill(8)
df_new['ЄДРПОУ одержувача'] = df_new['ЄДРПОУ одержувача'].str.zfill(8)
# ...інші поля за потреби...
```

### 6.3. Перевірка дублікатів та злиття
```python
# Визначаємо унікальний ключ для злиття
merge_keys = ['Номер митної декларації', 'ЄДРПОУ одержувача', 'Код товару']
# Виявляємо потенційні конфлікти
conflicts = pd.merge(df_main, df_new, on=merge_keys, how='inner')
if not conflicts.empty:
    print('Конфліктні записи:')
    print(conflicts)
# Злиття без дублікатів
merged = pd.concat([df_main, df_new]).drop_duplicates(subset=merge_keys, keep='first')
```

### 6.4. Логування конфліктів
```python
if not conflicts.empty:
    conflicts.to_csv('conflicts_log.csv', index=False)
```

---

## 7. Self-healing, auto-fix, observability, chaos engineering (Best Practices)

- **Self-healing:** Всі ETL-скрипти мають автоматично виправляти помилки (pandera, great_expectations, auto-heal, LLM).
- **AI anomaly detection:** Використовуйте deepchecks, Grafana ML для виявлення аномалій та автоматичного виправлення.
- **Chaos engineering:** Додавайте chaos monkey-тести для перевірки стійкості пайплайнів.
- **Observability:** Інтегруйте Prometheus, Grafana, Loki для моніторингу, алертів, логування.
- **Policy-as-code:** Валідація даних через OPA/Kyverno (автоматичне блокування неякісних даних).
- **Auto-test:** Всі пайплайни мають автотести (pytest, great_expectations).
- **Auto-documentation:** Генеруйте документацію автоматично (Sphinx, mkdocs, auto-docs).
- **Auto-rollback:** При помилках — автоматичне повернення до стабільної версії.
- **Auto-train loop:** Всі AI/ML-моделі мають автоматичне донавчання та self-improvement.
- **Knowledge graph:** Автоматичне оновлення графу знань, AI-агенти для аналізу та самонавчання.
- **CI/CD:** Всі зміни проходять через GitHub Actions з auto-lint, auto-fix, chaos/self-heal тестами.

> Додавайте ці best practices у всі нові інтеграції та ETL-скрипти для production-ready resiliency.
