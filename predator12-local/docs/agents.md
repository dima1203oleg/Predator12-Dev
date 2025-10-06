# Конфігурація Агентів

## Огляд системи агентів

Predator11 використовує систему з 16 спеціалізованих AI-агентів, кожен з яких оптимізований для конкретних завдань.

## Основні агенти

### NEXUS_SUPERVISOR
- **Призначення**: Головний координатор системи
- **Primary Model**: meta/llama-3.1-405b
- **Fallback Models**: mistral-large-2411, phi-4

### DatasetIngestAgent
- **Призначення**: Завантаження та обробка даних
- **Primary Model**: phi-4-reasoning
- **Fallback Models**: gpt-4o-mini, llama-3.1-8b

### IndexerAgent
- **Призначення**: Індексація з PII маскуванням
- **Primary Model**: llama-3.1-8b
- **Fallback Models**: phi-4-mini

## Конфігурація

Конфігурація агентів знаходиться в файлі `backend/app/agents/registry.yaml`:

```yaml
agents:
  NEXUS_SUPERVISOR:
    primary_model: meta/llama-3.1-405b
    fallback_models:
      - mistral/mistral-large-2411
      - microsoft/phi-4
    embedding_model: cohere/cohere-embed-v3-multilingual
    
  DatasetIngestAgent:
    primary_model: microsoft/phi-4-reasoning
    fallback_models:
      - openai/gpt-4o-mini
      - meta/llama-3.1-8b
```

## Політики

Політики та ліміти налаштовуються в `backend/app/agents/policies.yaml`.
