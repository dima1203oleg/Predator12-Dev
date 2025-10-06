# Using MCP with GitHub Copilot in VS Code

This project exposes an MCP-compatible endpoint via the Node proxy server in `codespaces-models/`.

## Prerequisites

- VS Code
- GitHub Copilot and Copilot Chat extensions
- Running stack (see `README.md` → Quick Start)

## Configuration

- The file `.vscode/mcp.json` declares the server for discovery:

```json
{
  "servers": [
    {
      "name": "Predator AI Server",
      "url": "http://localhost:3010/v1/simple-chat",
      "allowUntrusted": true,
      "commands": [
        { "name": "/help", "description": "Show available commands" }
      ]
    }
  ]
}
```

- Start the stack with `make start` (or `docker compose up -d`).

## Using in Copilot Chat

1. Open Copilot Chat (Ctrl+I or View → Copilot Chat)
2. Switch to Agent Mode (if applicable in your Copilot version)
3. Select "Predator AI Server" from the available sources
4. Chat as usual — requests are served by the local MCP server at `http://localhost:3010`

## Troubleshooting

- Ensure `http://localhost:3010/ready` returns `{ ready: true }`
- Check logs with `make logs` or `docker compose logs mcp-server`
- Verify `.env` contains `GITHUB_TOKEN` or `OPENAI_API_KEY` if you proxy upstream
