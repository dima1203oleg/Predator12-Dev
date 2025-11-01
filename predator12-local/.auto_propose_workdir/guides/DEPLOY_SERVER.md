# Deploying on a Server (Docker Compose)

This guide shows how to run the same development stack on a Linux server using Docker Compose.

## Prerequisites

- Linux host with Docker and Docker Compose plugin
- Recommended resources: 4 CPU, 8+ GB RAM
- Open required ports in firewall (3010, 3000, 8080, 9000, 9001, 9090, 9093, 5601)

## Steps

1. Clone the repository on the server:

```bash
git clone <your-repo-url> predator
cd predator
```

2. Create environment file:

```bash
cp .env.example .env
# Edit .env and set GITHUB_TOKEN or OPENAI_API_KEY, and credentials as needed
```

3. Start the stack:

```bash
docker compose up -d
```

4. Verify services:

```bash
# MCP server readiness
curl -fsS http://localhost:3010/ready

# Prometheus
curl -fsS http://localhost:9090/-/healthy

# Keycloak metrics
curl -fsS http://localhost:8080/metrics | head -n 5
```

5. Access UIs (use server's public IP or domain):

- MCP: http://<host>:3010/ready
- Grafana: http://<host>:3000
- Keycloak: http://<host>:8080
- MinIO Console: http://<host>:9001
- OpenSearch Dashboards: http://<host>:5601

## Security considerations

- Change all default credentials in `.env`
- Put the stack behind a reverse proxy (nginx/Traefik) with HTTPS (Let's Encrypt)
- Restrict public exposure of internal UIs in production (e.g., Prometheus, Alertmanager)
- Consider moving to Kubernetes later using Helm charts based on these services
