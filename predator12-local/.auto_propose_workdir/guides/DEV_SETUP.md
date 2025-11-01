# Developer Setup (VS Code + DevContainer)

This guide explains how to develop and run Predator Analytics locally using Dev Containers and Docker Compose.

## Prerequisites

- Docker Desktop
- VS Code with the Dev Containers extension
- Optional: Node.js 18+ if running parts outside containers

## Open in Dev Container

1. Open the repository in VS Code
2. When prompted, "Reopen in Container". If you do not see a prompt, run:
   - Command Palette → "Dev Containers: Reopen in Container"
3. The Dev Container uses the root `docker-compose.yml` and connects to the `mcp-server` service.

## Services and Ports

- MCP Server: `http://localhost:3010`
- Prometheus: `http://localhost:9090`
- Alertmanager: `http://localhost:9093`
- Grafana: `http://localhost:3000`
- Keycloak: `http://localhost:8080`
- MinIO Console: `http://localhost:9001`
- OpenSearch Dashboards: `http://localhost:5601`

Ports are forwarded via `.devcontainer/devcontainer.json`.

## Environment variables

Create `.env` from `.env.example` in the repository root:

```bash
cp .env.example .env
```

Set the following as needed:

- `GITHUB_TOKEN` if using GitHub Models API
- Or `OPENAI_API_KEY` if using OpenAI upstream
- `GF_SECURITY_ADMIN_PASSWORD` to change Grafana admin password
- `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD` for MinIO credentials

## Starting the stack

- From VS Code Terminal:

```bash
make start
```

or:

```bash
docker compose up -d
```

## Logs and status

- Tail logs:

```bash
make logs
```

- Check services:

```bash
make ps
```

## Stopping the stack

```bash
make stop
```

## Troubleshooting

- Ensure Docker Desktop is running
- If ports are in use, stop conflicting processes or change ports in `docker-compose.yml`
- Use `docker compose logs <service>` for a specific service
