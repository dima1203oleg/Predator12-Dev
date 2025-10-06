# Predator Analytics — Nexus Core: Фінальне доповнення до ТЗ (Δ 1.2)

Дата: 24.09.2025
Стан готовності: ≈99%

---

## 1) Діаграми (архітектура та послідовності)

### 1.1 Архітектура (Mermaid)

```mermaid
graph TD
  subgraph UI[Nexus Core UI (React+TS)]
    A1[Main Dashboard]
    A2[DataOps Hub]
    A3[OpenSearch Deck (SSO)]
    A4[Connections/3D/Graphs]
    A5[Chrono-Spatial]
    A6[Reality Simulator]
    A7[LLM Assistant]
    A8[Admin/Billing]
  end

  subgraph API[FastAPI + WS]
    B1[/auth, /users, /billing/]
    B2[/datasets, /ingest, /search/]
    B3[/ml, /osint, /simulations/]
    B4[/events, /export/]
    WS[/ws: alerts, progress, graph, simulations/]
    Svc1[AuthService]
    Svc2[DatasetRegistry]
    Svc3[OpenSearchService]
    Svc4[ParserService]
    Svc5[MLService]
    Svc6[AnomalyEngine]
    Svc7[BillingService]
    Svc8[SimulationEngine]
    Svc9[GeoService]
  end

  subgraph Data[Data Layer]
    PG[(PostgreSQL staging/gold)]
    OS[(OpenSearch safe/restricted + ILM + Aliases)]
    VEC[(Qdrant vectors)]
    OBJ[(MinIO objects)]
    RED[(Redis cache/sessions)]
    KAF[(Kafka topics)]
    CAT[[OpenMetadata Catalog]]
  end

  subgraph ETL[ETL/OSINT]
    AF[Airflow DAGs]
    PARSERS[Telethon / Playwright / Scrapy / RSS]
    GE[Great Expectations]
  end

  subgraph Sec[Security/Observability]
    KC[Keycloak SSO/MFA/FIDO2]
    VA[Vault Secrets]
    OPA[OPA/Kyverno Policies]
    WAF[Ingress WAF/Rate-Limits]
    PR[Prometheus+Alertmanager]
    GF[Grafana]
    LO[Loki Logs]
    TR[Tempo/Jaeger (OTel)]
  end

  subgraph DevOps[DevOps/GitOps]
    DOCK[Docker Images (SBOM+Sign)]
    GHA[GitHub Actions]
    ARGO[ArgoCD]
    K8S[Kubernetes (HPA/VPA/Probes/PDB)]
  end

  %% flows
  UI -->|OIDC| KC
  UI -->|REST/WS| API
  API --> PG
  API --> OS
  API --> VEC
  API --> OBJ
  API --> RED
  API --> KAF
  PARSERS --> AF
  AF --> PG
  AF --> OS
  AF --> VEC
  AF --> OBJ
  AF --> GE
  PG --> CAT
  OS --> CAT
  API --> PR
  API --> LO
  API --> TR
  K8S --> API
  K8S --> AF
  K8S --> OS
  GHA --> DOCK --> ARGO --> K8S
  VA --> API
  OPA --> K8S
  WAF --> UI
```

### 1.2 Послідовність: імпорт великого файлу

```mermaid
sequenceDiagram
  participant U as User (UI)
  participant FE as Nexus UI
  participant BE as FastAPI
  participant OBJ as MinIO
  participant AF as Airflow DAG
  participant PG as PostgreSQL
  participant OS as OpenSearch
  participant VEC as Qdrant

  U->>FE: Обрати CSV/XLSX (500–700 МБ)
  FE->>BE: POST /ingest/upload (chunked)
  BE->>OBJ: Записати частини файлу
  FE-->>U: Прогрес (WS /ws/progress)
  FE->>BE: POST /ingest/commit
  BE->>AF: Trigger DAG (ingest_csv)
  AF->>OBJ: Читати файл
  AF->>PG: Profile/Validate → Parquet → staging/gold
  AF->>OS: Індексація safe/restricted + ILM + Aliases
  AF->>VEC: (optional) Векторизація
  BE-->>FE: status: SUCCEEDED + saved view link
  FE-->>U: Готовий датасет + дашборд
```

### 1.3 Послідовність: запит аналітики

```mermaid
sequenceDiagram
  participant U as User
  participant FE as Nexus UI/LLM
  participant BE as FastAPI (Planner)
  participant OS as OpenSearch
  participant PG as PostgreSQL
  participant VEC as Qdrant
  participant ML as MLService

  U->>FE: Природний запит / конструктор
  FE->>BE: POST /search/query (filters, include_pii?)
  BE->>BE: Auth (Keycloak) + Billing + PII policy
  alt Aggregations
    BE->>OS: Aggregations/Filters
  else Joins
    BE->>PG: SQL query
  end
  opt Semantic
    BE->>VEC: Vector search
  end
  opt ML
    BE->>ML: anomalies/predict/explain (SHAP)
  end
  BE-->>FE: Результат + пояснення + маскування (якщо без прав)
  FE-->>U: Таблиці/графіки/3D + “why”
```

---

## 2) Перша сторінка пульта (макет)

### 2.1 Wireframe (текстово)

Top Bar: [NEXUS CORE] [Global Search…] [Mode: Analyst] [Notifications] [User]

Sidebar:
  • Overview (active)
  • DataOps Hub
  • OS Deck
  • 3D Map
  • Graph
  • Simulator
  • Incident Feed
  • Admin/Billing

Main (Overview):
  ┌ System Pulse (API p95, OS lag, ETL SLA, ML drift)
  ├ Daily Briefing (OSINT+аналітика+AI-висновок)
  ├ Top Anomalies (клік → деталі/SHAP/докази)
  ├ KPI Summary (тренди імпорт/експорт/HS)
  ├ Mini 3D Geo Timeline | Saved OpenSearch Views
  └ Bottom Actions: [Upload CSV] [New Dataset] [Open AI]

### 2.2 Каркас React (спрощено)

```tsx
// src/pages/Overview.tsx
export default function Overview() {
  return (
    <Layout>
      <SystemPulse />
      <Grid>
        <DailyBriefing />
        <TopAnomalies />
        <KpiSummary />
        <MiniGeoTimeline />
        <SavedOSViews />
      </Grid>
      <ActionsBar />
    </Layout>
  );
}
```

---

## 3) Шаблони конфігурацій (вирізки)

### 3.1 Helm values (backend)

```yaml
image:
  repository: ghcr.io/org/nexus-backend
  tag: v1.0.0
  pullPolicy: IfNotPresent

env:
  DB_URL: postgresql+psycopg://user:pass@postgres:5432/nexus
  OPENSEARCH_URL: https://opensearch:9200
  QDRANT_URL: http://qdrant:6333
  MINIO_ENDPOINT: http://minio:9000
  REDIS_URL: redis://redis:6379/0
  KAFKA_BROKERS: kafka:9092
  KEYCLOAK_URL: https://keycloak:8443
  VAULT_ADDR: http://vault:8200
  DATASETS_AUTO_GEN_ENABLED: "true"
  OS_ALIAS_MODE: "enabled"
  BILLING_ENFORCE: "true"

resources:
  requests: { cpu: "500m", memory: "1024Mi" }
  limits:   { cpu: "2",    memory: "4096Mi" }

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70

probes:
  liveness:  { path: /healthz/liveness,  port: 8000 }
  readiness: { path: /healthz/readiness, port: 8000 }
```

### 3.2 Kustomize overlay (prod)

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
  - ../../base
patches:
  - target:
      kind: Deployment
      name: backend
    patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: "4096Mi"
      - op: add
        path: /spec/template/spec/containers/0/env/-
        value: { name: BILLING_ENFORCE, value: "true" }
```

### 3.3 OpenSearch ISM/ILM (скорочено)

```json
{ "policy": { "default_state": "hot", "states":[
  {"name":"hot","actions":[{"rollover":{"min_size":"50gb","min_index_age":"3d"}}],
   "transitions":[{"state_name":"warm","conditions":{"min_index_age":"14d"}}]},
  {"name":"warm","actions":[{"replica_count":{"number_of_replicas":0}}],
   "transitions":[{"state_name":"cold","conditions":{"min_index_age":"60d"}}]},
  {"name":"cold","actions":[{"force_merge":{"max_num_segments":1}}]}
], "ism_template":[{"index_patterns":["customs_*"],"priority":100}]}}
```

---

## 4) GitHub Actions (CI) — вирізка

```yaml
name: ci
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - uses: actions/setup-node@v4
        with: { node-version: '20' }

      # Lint/format
      - name: Backend lint
        run: pip install ruff black && ruff backend && black --check backend
      - name: Frontend lint
        run: cd frontend && npm ci && npm run lint

      # Tests (unit/integration with testcontainers)
      - name: Backend tests
        run: pip install -e backend[test] && pytest -q
      - name: Frontend tests
        run: cd frontend && npm run test -- --ci

      # Build images + SBOM + scan + sign
      - name: Build images
        run: docker build -t ghcr.io/org/nexus-backend:${{ github.sha }} backend
      - name: SBOM
        run: curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin && syft packages ghcr.io/org/nexus-backend:${{ github.sha }}
      - name: Scan
        run: docker run --rm aquasec/trivy image ghcr.io/org/nexus-backend:${{ github.sha }}
      - name: Sign (cosign)
        run: cosign sign --key env://COSIGN_KEY ghcr.io/org/nexus-backend:${{ github.sha }}
```

---

## 5) Playwright E2E — вирізка

```ts
import { test, expect } from '@playwright/test';

test('login → upload → ETL → dashboard → PII → export', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#username', process.env.TEST_USER!);
  await page.fill('#password', process.env.TEST_PASS!);
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/overview/);

  // Upload
  await page.click('text=Upload CSV');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('input[type="file"]')
  ]);
  await fileChooser.setFiles('fixtures/customs_500mb.csv');
  await expect(page.locator('[data-test=upload-progress]')).toContainText('%');

  // Wait ETL done (WS badge)
  await expect(page.locator('[data-test=etl-status]')).toHaveText('SUCCEEDED', { timeout: 300000 });

  // Dashboard
  await page.click('text=OpenSearch Views');
  await expect(page).toHaveURL(/dashboards/);

  // PII gating
  await page.click('text=Reveal PII');
  if (process.env.HAS_PII_ROLE !== 'true') {
    await expect(page.locator('[data-test=toast]')).toContainText('FORBIDDEN_PII');
  }

  // Export
  await page.click('text=Export CSV');
  await expect(page.locator('[data-test=export-link]')).toHaveAttribute('href', /signed/);
});
```

---

## 6) Makefile + docker-compose (локальний dev)

```makefile
.PHONY: up down be fe test
up: ; docker-compose up -d
down: ; docker-compose down -v
be: ; uvicorn backend.app.main:app --reload --port 8000
fe:
	cd frontend && npm i && npm run dev
test:
	pytest -q && cd frontend && npm t
```

```yaml
# docker-compose.yml (скорочено для dev)
services:
  postgres: { image: postgres:15, environment: { POSTGRES_PASSWORD: pass }, ports: ["5432:5432"] }
  opensearch: { image: opensearchproject/opensearch:2, environment: { discovery.type: single-node }, ports: ["9200:9200"] }
  dashboards: { image: opensearchproject/opensearch-dashboards:2, ports: ["5601:5601"] }
  qdrant: { image: qdrant/qdrant:latest, ports: ["6333:6333"] }
  minio: { image: minio/minio, command: server /data, ports: ["9000:9000","9001:9001"] }
  redis: { image: redis:7, ports: ["6379:6379"] }
  keycloak: { image: quay.io/keycloak/keycloak:24, command: start-dev, ports: ["8080:8080"] }
```

---

## 7) Runbooks (коротко)
- ETL завис: перевірити Airflow UI → task logs (Loki) → перезапуск task → якщо MinIO outage — дочекатися й rerun.
- OpenSearch повільний: перевірити CPU/iowait, shard count, hit ratio кешів; зменшити painless; перевести часті запити на pre-agg.
- Keycloak down: перевірити pod/logs; сесії чинні; нові логіни — недоступні; SLA 2–5 хв відновлення.
- DR: скрипт відновлення PG з pgBackRest (до RPO), OS snapshot restore, перевипуск alias *_current, smoke-тести.
- Security alert: зупинити зовнішній парсер (feature-flag), увімкнути WAF-правила посиленого рівня.

---

## 8) Ризики та мінімізація
- Сплески навантаження → HPA/VPA, кеш Redis, pre-agg індекси, rate-limit per plan.
- Дрейф ML → PSI/KS метрики, автоперетренування, canary-релізи.
- Зміни схем даних → Great Expectations + семвер для схем; backward-compatible міграції.
- Правові ризики OSINT → robots.txt, whitelist, журнал правомірності джерел.
- Ланцюг постачання → SBOM, підпис образів, Kyverno “only signed images”.

---

## 9) Остаточний чекліст Go/No-Go (99%)

Дані/OS
- ILM/rollover + aliases *_current у всіх індексах
- Pre-agg індекси для топ-дашів; p95 < 3 с @ 1B+
- Data lineage у каталозі; retention, архів Parquet

ML
- MLflow registry (Staging→Prod), canary 10–20%
- Drift PSI/KS у Prometheus + алерти
- SHAP у відповідях /ml/*

Безпека
- PII масковано by default; audit розкриття
- SBOM+Sign (cosign) → Kyverno “signed only”
- DAST (ZAP) green; WAF rules включені

Self-healing/DR
- 5 chaos-сценаріїв пройдено (green)
- RPO ≤ 15 хв, RTO ≤ 30 хв — перевірено на DR-стенді

UI/UX
- Fallback 3D→2D; WCAG 2.1 AA; Lighthouse ≥ 90
- Usage-лічильники, graceful деградація при перевищенні квот

E2E
- Playwright: login→upload→ETL→даш→PII→export — green
- k6/JMeter: 100 RPS, p95 < 3 c — green

---

## Фінальний підсумок
- Документ містить повний склад компонентів, їх ролі, залежності та послідовності (E2E), разом із діаграмами, макетом першої сторінки, конфіг-шаблонами, тестами, runbooks, ризиками й Go/No-Go.
- За цим ТЗ команда або ШІ може побудувати та вивести у прод Predator Analytics — Nexus Core до готовності ~99% з вимірюваними SLA/SLO.
