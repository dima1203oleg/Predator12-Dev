# Predator11 - Advanced AI-Powered Analytics Platform

![Predator11 Logo](docs/assets/predator11-logo.png)

Predator11 є комплексною AI-платформою для аналізу даних з підтримкою мультиагентної архітектури, автоматичного самовідновлення, розширеного спостереження та інтеграції з GitHub Copilot через Model Context Protocol (MCP).

## Architecture

![Architecture Diagram](docs/architecture.png)

## Prerequisites

- Docker 20.10+ and Docker Compose 1.29+
- At least 8GB RAM (16GB recommended)
- At least 20GB free disk space

## Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5433 | Main database |
| Redis | 6379 | Caching layer |
| OpenSearch | 9201 | Search and analytics engine |
| OpenSearch Dashboards | 5601 | Visualization for OpenSearch |
| MinIO | 9000/9001 | Object storage |
| Qdrant | 6333/6334 | Vector database |
| Keycloak | 8081 | Identity and access management |
| Prometheus | 9090 | Metrics collection and alerting |
| Alertmanager | 9093 | Alert routing and notification |
| Grafana | 3000 | Metrics visualization |
| Loki | 3100 | Log aggregation |
| Promtail | - | Log shipping |
| pgAdmin | 5050 | PostgreSQL administration |
| Portainer | 9000 | Container management |
| Autoheal | 8080 | Container health management |

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/predator-analytics.git
   cd predator-analytics
   ```

2. Create a `.env` file with your configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - Grafana: http://localhost:3000 (admin/admin)
   - Prometheus: http://localhost:9090
   - OpenSearch Dashboards: http://localhost:5601
   - pgAdmin: http://localhost:5050 (admin@predator.ai/admin)
   - Portainer: http://localhost:9000

## Configuration

### Autoheal Service

The autoheal service monitors and automatically restarts unhealthy containers. To enable autoheal for a container, add the following label:

```yaml
labels:
  autoheal: "true"
```

### Alerting

Alert rules are defined in `observability/prometheus/rules/`. To modify alerts, edit the corresponding YAML files.

### Logging

Logs are collected by Promtail and stored in Loki. You can query logs in Grafana using the Logs datasource.

## Monitoring

Pre-configured dashboards are available in Grafana:

- System Overview: CPU, memory, disk, and network metrics
- Container Metrics: Resource usage by container
- Application Metrics: Application-specific metrics
- Logs: Centralized logging interface

## Security

- All services are secured with authentication
- Default credentials should be changed in production
- HTTPS should be enabled for production deployments

## Backup and Recovery

### Database Backups

```bash
# Backup PostgreSQL
pg_dump -h localhost -p 5433 -U predator_user -d predator_analytics > backup.sql

# Restore PostgreSQL
psql -h localhost -p 5433 -U predator_user -d predator_analytics < backup.sql
```

### Volume Backups

```bash
# Create a backup of all volumes
docker run --rm -v $(pwd)/backups:/backup -v predator_analytics_postgres_data:/source alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz -C /source .

# Restore a volume
docker run --rm -v $(pwd)/backups:/backup -v predator_analytics_postgres_data:/target alpine sh -c "cd /target && tar xzf /backup/backup_file.tar.gz"
```

## Troubleshooting

### View logs for all services

```bash
docker-compose logs -f
```

### View logs for a specific service

```bash
docker-compose logs -f service_name
```

### Check container status

```bash
docker-compose ps
```

### Restart a service

```bash
docker-compose restart service_name
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
