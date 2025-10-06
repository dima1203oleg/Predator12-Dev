# MCP Інтеграція

## Model Context Protocol (MCP) Integration

Predator11 підтримує MCP протокол для інтеграції з GitHub Copilot у VS Code.

## Налаштування MCP

### 1. Конфігурація VS Code

У файлі `.vscode/settings.json`:

```json
{
  "github.copilot.chat.enabled": true,
  "github.copilot.chat.agents.enabled": true,
  "mcp.servers": {
    "predator-ai": {
      "command": "python",
      "args": ["-m", "backend.app.mcp.server"],
      "env": {
        "PREDATOR_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

### 2. Запуск MCP сервера

```bash
# Автоматично запускається з системою
make start

# Перевірка статусу MCP
curl http://localhost:8000/api/v1/mcp/status
```

## Доступні команди

### Базові команди:
- `/help` - список усіх команд
- `/status` - статус системи та агентів
- `/agents` - список активних агентів

### Пошук та аналітика:
- `/search <query>` - пошук у даних
- `/analyze <dataset>` - аналіз датасету
- `/anomalies` - виявлення аномалій

### Управління системою:
- `/heal` - запуск самовідновлення
- `/metrics` - системні метрики
- `/logs <service>` - логи сервісу

## Приклади використання

```
@predator-ai /search митна декларація 2024
@predator-ai /analyze customs_declarations
@predator-ai /anomalies --last-24h
```

## Безпека MCP

- Усі запити логуються
- Доступ лише до safe індексів  
- Автентифікація через JWT токени
