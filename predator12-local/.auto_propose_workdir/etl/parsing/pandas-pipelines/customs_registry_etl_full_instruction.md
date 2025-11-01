# Інструкція: ETL та інтеграція митних декларацій у Predator Analytics

## 1. Extract
- pandas: імпорт XLS/CSV (до 300МБ)
- Playwright/Scrapy: парсинг з вебпорталів
- pdfplumber: парсинг PDF
- Kafka Connect/Redpanda: стрімінг оновлень
- Telethon: Telegram-канали

## 2. Transform
- pandas: нормалізація дат, валют, кодів ЄДРПОУ
- DatasetInspectorAgent: перевірка якості, пошук аномалій
- AutoHealAgent: автоматичне виправлення схеми
- SyntheticDataAgent: генерація тестових декларацій

## 3. Load
- PostgreSQL/TimescaleDB: основна база для табличних і часових даних
- MinIO: зберігання оригіналів файлів
- Qdrant/pgvector: векторизація для AI-пошуку

## 4. Зв’язування з іншими реєстрами
- JOIN по ЄДРПОУ, ПІБ, кодах товарів (SQL, pandas merge)
- Векторний пошук схожих компаній (Qdrant/pgvector)
- NetworkX: побудова графів зв’язків

## 5. Аналітика та візуалізація
- OpenSearch/Meilisearch: повнотекстовий пошук
- Grafana: графіки, тренди
- OpenSearch Dashboard: візуалізація декларацій
- NetworkX + D3.js: інтерактивні графи у фронтенді

## 6. AI/ML та самонавчання
- MLflow/Ollama: тренування моделей для виявлення схем, фірм-прокладок
- AutoTrain Loop: автоматичне перенавчання моделей

## 7. Безпека, доступ, білінг
- Keycloak: RBAC, MFA, контроль доступу
- Kong/APISIX: API-gateway, білінг, приховування чутливих даних

## 8. Автоматизація
- Автоматичний запуск ETL при появі нового файлу у MinIO
- Автоматичне оновлення knowledge graph після кожного імпорту
- Автоматичне створення алертів при аномаліях (Grafana ML anomaly detection)

> Всі шаблони, скрипти та інструкції вже є у etl-parsing/pandas-pipelines/ та documentation/. Інтегруйте під свої дані та сценарії — і система працюватиме повністю автономно.
