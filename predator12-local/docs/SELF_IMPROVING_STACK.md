# Self-Improving & AI-Driven Architecture for Predator12

## 🎯 Мета

Еволюціонувати Predator12 у самонавчальний стек: автоматичне відновлення сервісів, ML-прогноз навантаження, автоскейл, пропозиції оптимізацій коду/запитів і контроль якості випусків — із чіткими фіче-тоглами, автоматичними тестами приймання та безпечними rollback'ами.

## 📋 Передумови

### Стек
- **Backend:** Python 3.11 (Pydantic v2, SQLAlchemy 2.0, psycopg3), FastAPI, Celery
- **Storage:** Redis, PostgreSQL 14+ (Timescale опціонально), Qdrant, OpenSearch 2.x
- **Orchestration:** Kubernetes (K3s для dev/edge, RKE2/k8s для prod), GitOps з Argo CD + Helm
- **Observability:** OpenTelemetry → OTEL Collector, Prometheus + Alertmanager, Grafana, OpenSearch logs
- **CI/CD:** GitHub Actions (або GitLab CI), VS Code + debugpy
- **Security:** Vault (або SealedSecrets), RBAC, NetworkPolicy
- **Agents:** 26+ AI агентів (supervisor, ETL, RAG, телеграм, etc.)

---

## 🧩 Архітектурні Модулі (з фіче-тоглами)

| Модуль | Опис | Тогл | MVP індикатор успіху |
|--------|------|------|---------------------|
| **Self-Healing** | Автовідкат/рестарт при деградації метрик | `features.selfHealing.enabled` | 100% автоматичний rollback у canary протягом ≤2 хв |
| **AI-Autoscaling** | Прогноз навантаження + HPA за custom метриками | `features.autoscale.enabled` | P95 latency стабільний ±10% під піками |
| **AI-CI/CD Guard** | ML-валідація конфігів/логів у пайплайні | `features.aicicd.enabled` | ≤5% зниження failure-деплоїв |
| **Code & Query Optimizer** | Агенти пропонують PR/індекси | `features.optimizers.enabled` | 1 авто-PR/тиждень із прийнятими змінами |
| **Edge Offload** | Частина ETL/векторного пошуку на edge | `features.edge.enabled` | −25–40% latency для edge-трафіку |
| **Federated Learning** | Обмін оновленнями моделей між кластерами | `features.federation.enabled` | Успішна глобальна агрегація моделі 1×/день |
| **Agent Web UI** | Веб-інтерфейс для моніторингу всіх 26+ агентів | `features.agentUI.enabled` | Real-time статус всіх агентів + логи |

**Всі модулі:** off-by-default у prod. Включення через Helm values.

---

## 📅 План Впровадження (14 днів, PoC → Guard-Rails)

### Тиждень 1
1. **Self-Healing** (Argo Rollouts + Prometheus)
   - Налаштування Rollouts з canary
   - AnalysisTemplates для метрик
   - PrometheusRules для алертів

2. **AI-Autoscaling** (HPA + custom metrics)
   - HPA з CPU + Celery queue
   - Prometheus Adapter для custom metrics
   - Базовий ML-прогноз навантаження

3. **Observability жорстко**
   - Трасування FastAPI (OpenTelemetry)
   - Базові алерти (latency, errors, saturation)
   - Grafana dashboards

### Тиждень 2
4. **AI-CI/CD Guard** (GitHub Actions)
   - Легкі евристики + опційний ML
   - Валідація Helm values
   - Аномалії в логах

5. **Code/Query Optimizer**
   - Read-only пропозиції
   - Без авто-merge
   - PR comments з аналізом

6. **Agent Web UI**
   - Dashboard для 26+ агентів
   - Real-time статус
   - Логи та метрики

7. **Документація**
   - Playbooks
   - Acceptance-тести
   - Rollback-план

---

## ⚙️ Helm Values (фіче-тогли)

```yaml
# values.yaml
features:
  selfHealing:
    enabled: true
  autoscale:
    enabled: true
    targetCPU: 70
    minReplicas: 1
    maxReplicas: 5
  aicicd:
    enabled: true
  optimizers:
    enabled: true
  edge:
    enabled: false
  federation:
    enabled: false
  agentUI:
    enabled: true
    port: 8080

observability:
  otel:
    enabled: true
    endpoint: "otel-collector:4317"
  prometheus:
    rulesEnabled: true
    scrapeInterval: 30s
  grafana:
    enabled: true

security:
  vault:
    enabled: true
    address: "http://vault:8200"
  rbac:
    enabled: true
  networkPolicy:
    enabled: true

agents:
  supervisor:
    enabled: true
    replicas: 1
  etl:
    enabled: true
    replicas: 2
  rag:
    enabled: true
    replicas: 3
  telegram:
    enabled: true
    replicas: 1
  # ... інші агенти (26+)
```

---

## 🔄 Self-Healing: Argo Rollouts + Prometheus

### Rollout Configuration

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: predator-backend
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: predator-backend
  template:
    metadata:
      labels:
        app: predator-backend
    spec:
      containers:
      - name: backend
        image: predator-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://otel-collector:4317"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: {duration: 60}
        - analysis:
            templates:
              - templateName: latency-check
            args:
              - name: svc
                value: "predator-backend"
        - setWeight: 50
        - pause: {duration: 60}
        - analysis:
            templates:
              - templateName: error-rate-check
        - setWeight: 100
      trafficRouting:
        nginx:
          stableIngress: predator-backend
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: latency-check
  namespace: default
spec:
  metrics:
  - name: p95-latency
    interval: 30s
    successCondition: result[0] < 0.250  # <250ms
    failureLimit: 1
    provider:
      prometheus:
        address: http://prometheus-server.prometheus:80
        query: |
          histogram_quantile(0.95, 
            sum(rate(http_server_requests_seconds_bucket{
              service="{{args.svc}}"
            }[1m])) by (le)
          )
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: error-rate-check
  namespace: default
spec:
  metrics:
  - name: error-rate
    interval: 30s
    successCondition: result[0] < 0.05  # <5%
    failureLimit: 0
    provider:
      prometheus:
        address: http://prometheus-server.prometheus:80
        query: |
          sum(rate(http_requests_total{
            service="{{args.svc}}",
            status=~"5.."
          }[1m])) /
          sum(rate(http_requests_total{
            service="{{args.svc}}"
          }[1m]))
```

### PrometheusRule (алерти)

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: predator-selfhealing
  namespace: prometheus
spec:
  groups:
  - name: selfhealing
    interval: 30s
    rules:
    - alert: PredatorHighErrorRate
      expr: |
        sum(rate(http_requests_total{
          service="predator-backend",
          status=~"5.."
        }[5m])) /
        sum(rate(http_requests_total{
          service="predator-backend"
        }[5m])) > 0.05
      for: 2m
      labels:
        severity: critical
        component: backend
      annotations:
        summary: "High 5xx error rate (>5%)"
        description: "Backend error rate is {{ $value | humanizePercentage }}"
        runbook_url: "https://docs.predator12.io/runbooks/self-healing"
    
    - alert: PredatorHighLatency
      expr: |
        histogram_quantile(0.95,
          sum(rate(http_server_requests_seconds_bucket{
            service="predator-backend"
          }[5m])) by (le)
        ) > 0.5
      for: 2m
      labels:
        severity: warning
        component: backend
      annotations:
        summary: "High P95 latency (>500ms)"
        description: "P95 latency is {{ $value }}s"
        runbook_url: "https://docs.predator12.io/runbooks/latency"
    
    - alert: PredatorAgentDown
      expr: |
        up{job="predator-agents"} == 0
      for: 1m
      labels:
        severity: critical
        component: agents
      annotations:
        summary: "Agent {{ $labels.instance }} is down"
        runbook_url: "https://docs.predator12.io/runbooks/agents"
```

---

## 📈 AI-Autoscaling: HPA + Custom Metrics

### HPA Configuration

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: predator-backend
  namespace: default
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: predator-backend
  minReplicas: 1
  maxReplicas: 5
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 30
      - type: Pods
        value: 2
        periodSeconds: 30
      selectPolicy: Max
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: External
      external:
        metric:
          name: predator_celery_queue_length
          selector:
            matchLabels:
              queue: default
        target:
          type: AverageValue
          averageValue: "50"
    - type: External
      external:
        metric:
          name: predator_predicted_load
          selector:
            matchLabels:
              service: backend
        target:
          type: Value
          value: "100"
```

### Autoscale Agent (ML-прогноз)

```python
# scripts/autoscale_agent.py
"""
AI-driven autoscaling agent for Predator12.
Predicts load and exposes custom metrics for HPA.
"""

import time
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import numpy as np
from prometheus_client import Gauge, start_http_server
from prometheus_api_client import PrometheusConnect
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
PREDICTED_LOAD = Gauge(
    'predator_predicted_load',
    'Predicted load for next 5 minutes',
    ['service']
)

CELERY_QUEUE_LENGTH = Gauge(
    'predator_celery_queue_length',
    'Current Celery queue length',
    ['queue']
)

class AutoscaleAgent:
    def __init__(
        self,
        prometheus_url: str = "http://prometheus-server:80",
        lookback_minutes: int = 60,
        predict_minutes: int = 5
    ):
        self.prom = PrometheusConnect(url=prometheus_url, disable_ssl=True)
        self.lookback = lookback_minutes
        self.predict_ahead = predict_minutes
    
    async def fetch_historical_load(self, service: str) -> np.ndarray:
        """Fetch historical load from Prometheus."""
        query = f'''
            rate(http_requests_total{{service="{service}"}}[1m])
        '''
        end_time = datetime.now()
        start_time = end_time - timedelta(minutes=self.lookback)
        
        result = self.prom.custom_query_range(
            query=query,
            start_time=start_time,
            end_time=end_time,
            step='1m'
        )
        
        if not result:
            return np.array([])
        
        values = [float(r['value'][1]) for r in result[0]['values']]
        return np.array(values)
    
    def simple_forecast(self, data: np.ndarray) -> float:
        """
        Simple exponential moving average forecast.
        TODO: Replace with ARIMA/Prophet/LSTM for production.
        """
        if len(data) < 2:
            return 0.0
        
        # EMA with alpha=0.3
        alpha = 0.3
        ema = data[0]
        for value in data[1:]:
            ema = alpha * value + (1 - alpha) * ema
        
        # Add 10% buffer for safety
        return ema * 1.1
    
    async def fetch_celery_queue(self, queue: str = "default") -> int:
        """Fetch Celery queue length from Redis/metrics."""
        query = f'celery_queue_length{{queue="{queue}"}}'
        result = self.prom.custom_query(query=query)
        
        if not result:
            return 0
        
        return int(float(result[0]['value'][1]))
    
    async def run(self):
        """Main loop."""
        logger.info("Starting autoscale agent...")
        start_http_server(9090)  # Expose metrics
        
        while True:
            try:
                # Predict backend load
                historical = await self.fetch_historical_load("predator-backend")
                if len(historical) > 0:
                    predicted = self.simple_forecast(historical)
                    PREDICTED_LOAD.labels(service="backend").set(predicted)
                    logger.info(f"Predicted load: {predicted:.2f} req/s")
                
                # Fetch Celery queue
                queue_len = await self.fetch_celery_queue()
                CELERY_QUEUE_LENGTH.labels(queue="default").set(queue_len)
                logger.info(f"Celery queue length: {queue_len}")
                
                await asyncio.sleep(30)  # Update every 30s
                
            except Exception as e:
                logger.error(f"Error in autoscale loop: {e}")
                await asyncio.sleep(60)

if __name__ == "__main__":
    agent = AutoscaleAgent()
    asyncio.run(agent.run())
```

---

## 🛡️ AI-CI/CD Guard (GitHub Actions)

### Workflow Configuration

```yaml
# .github/workflows/ai-guard.yml
name: AI-CI/CD Guard
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
      
      - name: Install dependencies
        run: |
          pip install -r predator12-local/backend/requirements-311-modern.txt
          pip install ruff pytest pytest-cov pytest-asyncio
      
      - name: Ruff lint
        run: ruff check predator12-local/backend --output-format=github
      
      - name: Run tests
        run: |
          cd predator12-local
          pytest backend/tests/ -v --cov=backend --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./predator12-local/coverage.xml

  config-sanity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      
      - name: Install tools
        run: |
          pip install pyyaml jsonschema
          curl -LO https://dl.k8s.io/release/v1.28.0/bin/linux/amd64/kubectl
          chmod +x kubectl && sudo mv kubectl /usr/local/bin/
          curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
      
      - name: Helm values sanity
        run: |
          python scripts/ci/values_sanity.py helm/values.yaml
      
      - name: Helm lint
        run: |
          helm lint helm/predator-backend
      
      - name: Kubeval validation
        run: |
          helm template predator-backend helm/predator-backend | \
          kubeval --strict --ignore-missing-schemas
      
      - name: Log anomaly detection
        run: |
          python scripts/ci/logs_heuristics.py artifacts/build.log || true
      
      - name: Security scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'config'
          scan-ref: 'helm/'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  ai-review:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      
      - name: Install AI reviewer
        run: |
          pip install openai anthropic
      
      - name: AI code review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          python scripts/ci/ai_code_reviewer.py \
            --pr-number ${{ github.event.pull_request.number }} \
            --repo ${{ github.repository }}
```

---

## 🔍 Code & Query Optimizer

### Database Query Optimizer

```python
# scripts/db/query_optimizer_agent.py
"""
Database query optimizer for PostgreSQL.
Analyzes slow queries and suggests indexes.
"""

import asyncio
import logging
from typing import List, Dict, Optional
from dataclasses import dataclass
import asyncpg
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class QueryAnalysis:
    query: str
    calls: int
    total_time: float
    mean_time: float
    suggested_indexes: List[str]
    improvement_estimate: float

class QueryOptimizer:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Establish database connection."""
        self.pool = await asyncpg.create_pool(
            self.db_url,
            min_size=1,
            max_size=5
        )
        # Enable pg_stat_statements
        async with self.pool.acquire() as conn:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS pg_stat_statements")
    
    async def fetch_slow_queries(
        self,
        min_calls: int = 10,
        min_time_ms: float = 100.0
    ) -> List[Dict]:
        """Fetch slow queries from pg_stat_statements."""
        query = """
        SELECT
            query,
            calls,
            total_exec_time,
            mean_exec_time,
            rows
        FROM pg_stat_statements
        WHERE calls >= $1
          AND mean_exec_time >= $2
          AND query NOT LIKE '%pg_stat_statements%'
        ORDER BY total_exec_time DESC
        LIMIT 20
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, min_calls, min_time_ms)
            return [dict(row) for row in rows]
    
    async def analyze_query(self, query: str) -> Dict:
        """Get EXPLAIN ANALYZE for query."""
        try:
            async with self.pool.acquire() as conn:
                result = await conn.fetch(f"EXPLAIN (ANALYZE, BUFFERS) {query}")
                return {"plan": [dict(r) for r in result]}
        except Exception as e:
            logger.error(f"Error analyzing query: {e}")
            return {"error": str(e)}
    
    def suggest_indexes(self, query: str, plan: Dict) -> List[str]:
        """
        Suggest indexes based on query and execution plan.
        Simple heuristics - can be enhanced with ML.
        """
        suggestions = []
        query_lower = query.lower()
        
        # Look for sequential scans
        plan_text = str(plan)
        if "seq scan" in plan_text.lower():
            # Extract table name
            import re
            tables = re.findall(r'from\s+(\w+)', query_lower)
            for table in tables:
                # Check WHERE clauses
                where_cols = re.findall(rf'{table}\.(\w+)\s*=', query_lower)
                for col in where_cols:
                    suggestions.append(
                        f"CREATE INDEX idx_{table}_{col} ON {table}({col});"
                    )
        
        # Look for JOINs without indexes
        if " join " in query_lower:
            join_cols = re.findall(r'on\s+\w+\.(\w+)\s*=\s*\w+\.(\w+)', query_lower)
            for col1, col2 in join_cols:
                suggestions.append(
                    f"-- Consider composite index for JOIN: ({col1}, {col2})"
                )
        
        return suggestions
    
    async def generate_report(self) -> str:
        """Generate optimization report."""
        slow_queries = await self.fetch_slow_queries()
        
        report = ["# Database Query Optimization Report\n"]
        report.append(f"Generated: {datetime.now().isoformat()}\n")
        report.append(f"Total slow queries: {len(slow_queries)}\n\n")
        
        for i, q in enumerate(slow_queries[:10], 1):
            report.append(f"## Query {i}\n")
            report.append(f"```sql\n{q['query'][:500]}\n```\n")
            report.append(f"- Calls: {q['calls']}")
            report.append(f"- Mean time: {q['mean_exec_time']:.2f}ms")
            report.append(f"- Total time: {q['total_exec_time']:.2f}ms\n")
            
            # Analyze and suggest
            plan = await self.analyze_query(q['query'])
            if 'error' not in plan:
                suggestions = self.suggest_indexes(q['query'], plan)
                if suggestions:
                    report.append("### Suggested optimizations:\n")
                    for sug in suggestions:
                        report.append(f"```sql\n{sug}\n```\n")
            report.append("\n---\n\n")
        
        return "".join(report)
    
    async def create_pr_comment(self, report: str):
        """Create GitHub PR comment with optimization suggestions."""
        # TODO: Integrate with GitHub API
        logger.info("Optimization report generated")
        logger.info(report)
        
        # Save to file for manual review
        with open("optimization_report.md", "w") as f:
            f.write(report)

async def main():
    DB_URL = "postgresql://user:pass@localhost:5432/predator"
    optimizer = QueryOptimizer(DB_URL)
    
    await optimizer.connect()
    report = await optimizer.generate_report()
    await optimizer.create_pr_comment(report)

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🌐 Agent Web UI (26+ Agents Dashboard)

### FastAPI Backend for Agent Management

```python
# backend/agent_ui/main.py
"""
Web UI for managing and monitoring 26+ Predator12 agents.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from typing import List, Dict
import asyncio
import json
from datetime import datetime
from enum import Enum

app = FastAPI(title="Predator12 Agent Dashboard")

class AgentStatus(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"
    STARTING = "starting"

# In-memory agent registry (replace with Redis/DB)
AGENTS: Dict[str, Dict] = {
    "supervisor": {
        "name": "Supervisor Agent",
        "status": AgentStatus.RUNNING,
        "last_seen": datetime.now().isoformat(),
        "metrics": {"tasks_processed": 1234, "errors": 2}
    },
    "etl_csv": {
        "name": "ETL CSV Agent",
        "status": AgentStatus.RUNNING,
        "last_seen": datetime.now().isoformat(),
        "metrics": {"files_processed": 567, "rows": 123456}
    },
    "etl_pdf": {
        "name": "ETL PDF Agent",
        "status": AgentStatus.RUNNING,
        "last_seen": datetime.now().isoformat(),
        "metrics": {"pdfs_processed": 89, "pages": 2345}
    },
    "rag_query": {
        "name": "RAG Query Agent",
        "status": AgentStatus.RUNNING,
        "last_seen": datetime.now().isoformat(),
        "metrics": {"queries": 4567, "avg_latency_ms": 145}
    },
    "rag_indexer": {
        "name": "RAG Indexer Agent",
        "status": AgentStatus.RUNNING,
        "last_seen": datetime.now().isoformat(),
        "metrics": {"documents_indexed": 12345, "vectors": 987654}
    },
    "telegram_bot": {
        "name": "Telegram Bot Agent",
        "status": AgentStatus.RUNNING,
        "last_seen": datetime.now().isoformat(),
        "metrics": {"messages_handled": 789, "users": 45}
    },
    "ml_embeddings": {
        "name": "ML Embeddings Agent",
        "status": AgentStatus.RUNNING,
        "last_seen": datetime.now().isoformat(),
        "metrics": {"embeddings_generated": 56789, "avg_time_ms": 23}
    },
    # Add 19+ more agents...
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.get("/")
async def root():
    return HTMLResponse(content=DASHBOARD_HTML)

@app.get("/api/agents")
async def get_agents():
    """Get all agents status."""
    return {"agents": AGENTS}

@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific agent details."""
    if agent_id not in AGENTS:
        return {"error": "Agent not found"}, 404
    return AGENTS[agent_id]

@app.post("/api/agents/{agent_id}/restart")
async def restart_agent(agent_id: str):
    """Restart an agent."""
    if agent_id not in AGENTS:
        return {"error": "Agent not found"}, 404
    
    AGENTS[agent_id]["status"] = AgentStatus.STARTING
    await manager.broadcast({"type": "agent_update", "agent_id": agent_id})
    
    # Simulate restart
    await asyncio.sleep(2)
    AGENTS[agent_id]["status"] = AgentStatus.RUNNING
    await manager.broadcast({"type": "agent_update", "agent_id": agent_id})
    
    return {"message": "Agent restarted"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates."""
    await manager.connect(websocket)
    try:
        while True:
            # Send periodic updates
            await asyncio.sleep(5)
            await websocket.send_json({
                "type": "heartbeat",
                "timestamp": datetime.now().isoformat(),
                "agents_count": len(AGENTS)
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Dashboard HTML (simplified - use React/Vue for production)
DASHBOARD_HTML = """
<!DOCTYPE html>
<html>
<head>
    <title>Predator12 Agent Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
        }
        h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 1.2em;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            color: #667eea;
            font-size: 1.1em;
            margin-bottom: 10px;
        }
        .stat-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
        }
        .agents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .agent-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .agent-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .agent-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .agent-name {
            font-size: 1.2em;
            font-weight: bold;
            color: #333;
        }
        .status {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .status.running {
            background: #10b981;
            color: white;
        }
        .status.stopped {
            background: #6b7280;
            color: white;
        }
        .status.error {
            background: #ef4444;
            color: white;
        }
        .metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 15px;
        }
        .metric {
            display: flex;
            flex-direction: column;
        }
        .metric-label {
            font-size: 0.85em;
            color: #666;
            margin-bottom: 5px;
        }
        .metric-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
        }
        .actions {
            margin-top: 15px;
            display: flex;
            gap: 10px;
        }
        button {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-restart {
            background: #f59e0b;
            color: white;
        }
        .btn-restart:hover {
            background: #d97706;
        }
        .btn-logs {
            background: #3b82f6;
            color: white;
        }
        .btn-logs:hover {
            background: #2563eb;
        }
        .loading {
            text-align: center;
            padding: 50px;
            color: white;
            font-size: 1.5em;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 Predator12 Agent Dashboard</h1>
            <div class="subtitle">Real-time monitoring of 26+ AI agents</div>
        </header>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Agents</h3>
                <div class="value" id="total-agents">0</div>
            </div>
            <div class="stat-card">
                <h3>Running</h3>
                <div class="value" id="running-agents">0</div>
            </div>
            <div class="stat-card">
                <h3>Errors</h3>
                <div class="value" id="error-agents">0</div>
            </div>
            <div class="stat-card">
                <h3>CPU Usage</h3>
                <div class="value" id="cpu-usage">0%</div>
            </div>
        </div>
        
        <div id="agents-container" class="agents-grid">
            <div class="loading">Loading agents...</div>
        </div>
    </div>
    
    <script>
        let ws;
        
        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:8080/ws');
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                if (data.type === 'heartbeat') {
                    console.log('Heartbeat:', data);
                } else if (data.type === 'agent_update') {
                    loadAgents();
                }
            };
            
            ws.onerror = function(error) {
                console.error('WebSocket error:', error);
            };
            
            ws.onclose = function() {
                console.log('WebSocket closed, reconnecting...');
                setTimeout(connectWebSocket, 3000);
            };
        }
        
        async function loadAgents() {
            try {
                const response = await fetch('/api/agents');
                const data = await response.json();
                renderAgents(data.agents);
            } catch (error) {
                console.error('Error loading agents:', error);
            }
        }
        
        function renderAgents(agents) {
            const container = document.getElementById('agents-container');
            const agentsList = Object.entries(agents);
            
            // Update stats
            document.getElementById('total-agents').textContent = agentsList.length;
            document.getElementById('running-agents').textContent = 
                agentsList.filter(([_, a]) => a.status === 'running').length;
            document.getElementById('error-agents').textContent = 
                agentsList.filter(([_, a]) => a.status === 'error').length;
            
            // Render agent cards
            container.innerHTML = agentsList.map(([id, agent]) => `
                <div class="agent-card">
                    <div class="agent-header">
                        <div class="agent-name">${agent.name}</div>
                        <div class="status ${agent.status}">${agent.status}</div>
                    </div>
                    <div class="metrics">
                        ${Object.entries(agent.metrics).map(([key, value]) => `
                            <div class="metric">
                                <div class="metric-label">${key}</div>
                                <div class="metric-value">${value}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="actions">
                        <button class="btn-restart" onclick="restartAgent('${id}')">
                            🔄 Restart
                        </button>
                        <button class="btn-logs" onclick="viewLogs('${id}')">
                            📋 Logs
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        async function restartAgent(agentId) {
            try {
                const response = await fetch(`/api/agents/${agentId}/restart`, {
                    method: 'POST'
                });
                const data = await response.json();
                console.log('Agent restarted:', data);
            } catch (error) {
                console.error('Error restarting agent:', error);
            }
        }
        
        function viewLogs(agentId) {
            alert(`Viewing logs for ${agentId} (not implemented yet)`);
        }
        
        // Initialize
        connectWebSocket();
        loadAgents();
        setInterval(loadAgents, 10000); // Refresh every 10s
    </script>
</body>
</html>
"""
```

Продовжую створення файлів...

