# 📘 ТЕХНІЧНЕ ЗАВДАННЯ

## Проєкт: Predator Analytics — автономна аналітична платформа з Helm GitOps‑конвеєром

**Версія ТЗ:** 5.0.1 (розширена)  
**Дата:** 31 жовтня 2025  
**Автор:** Кізіма Дмитро Миколайович  
**Місце розробки:** м. Одеса, Україна  
**Статус:** Production‑ready (ціль — zero‑touch deploy, predictive self‑heal, SLSA level 3 compliance)

---

## Зміст

1. Мета проєкту та бізнес‑призначення
2. Короткий опис функціоналу Predator Analytics
3. Архітектура системи (логічна та фізична) + ASCII‑діаграма
4. Repository Strategy (Git structure)
5. GitOps‑конвеєр (Helm + Argo/Flux, immutable pipelines, security gates, fallback)
6. Компоненти платформи (детально)
7. Аналітичні модулі та ML‑пайплайни
8. Ролі користувачів та сценарії взаємодії
9. Безпека та відповідність (SLSA3, OIDC, Vault, Kyverno, Cosign тощо)
10. Disaster Recovery & Backup Strategy
11. Тестування, QA, Chaos і валідація
12. KPI, метрики та приймальні критерії
13. Поступове впровадження / план релізу (14 днів, етапи)
14. Приклади конфігурацій та код‑сніпети (Helm, shell, GH Actions, Kyverno, agent)
15. Deliverables, приймальні документи, подальші кроки
16. Глосарій термінів

---

## 1. Мета проєкту та бізнес‑призначення

Мета — створити автономну, предиктивну платформу для збору, аналізу та кореляції операційних і бізнес‑даних (Kubernetes, мережа, додатки, реєстри) з можливістю безлюдного деплою змін через Helm GitOps‑конвеєр.  
Платформа має:

- раннє виявлення аномалій та оцінку ризику (predictive scoring на основі MCP cache, метрик кластера, історичних даних);
- автоматичне пом’якшення інцидентів (self‑heal, auto‑rollback/scale, Flux fallback <30 с);
- підтримку SLSA level 3 (SBOM + attestations);
- audit trail / повну трасованість (OTEL runId атрибути від VS Code до pod spans);
- інтеграції: GitHub (GH App granular permissions), HashiCorp Vault (auto‑rotate cron), ArgoCD/Flux (predictive failover), Prometheus (anomaly series), Grafana/Tempo (synthetic probes 60 с), SealedSecrets (no‑plaintext), S3 (signed artifacts/SBOM/audit).

**Бізнес‑призначення:**

- зниження часу на розгортання та відкат (MTTR <1.5 хв);
- підвищення доступності (ціль SLA 99.99 %);
- зменшення людських помилок при deploy (100 % low‑risk auto‑merge GH App, high‑risk PR gates);
- автоматизація регресійних перевірок і постійне донавчання моделей (monthly retrain IsolationForest F1 ≥0.95);
- підтримка compliance (CIS K8s v1.9.0, SLSA3, zero‑trust Kyverno deny gates).

**Бізнес‑вигоди:**

- економія ~80 % часу DevOps на рутинні deploys;
- зниження ризиків downtime на ~70 %;
- повна traceability для SOC/audit (OTEL runId + SOS S3 90 днів);
- масштабованість (multi‑cluster: prod/staging/dev, autoscaling HPA CPU70 %).

---

## 2. Короткий опис функціоналу Predator Analytics

Predator Analytics — платформа для моніторингу, аналізу та автоматизації операцій в K8s‑екосистемі, з фокусом на predictive insights та self‑optimization. Основний функціонал:

- **Моніторинг:** збір метрик (Prometheus scrape kubelet/pod), logs (Loki tail‑f), traces (OTEL spans runId).
- **Аналіз:** predictive scoring (MCP confidence ≥0.85 low‑risk), anomaly detection (IsolationForest on CPU/latency/events, F1 ≥0.95).
- **Автоматизація:** zero‑touch deploy (VS Code QuickPick → GH App auto‑merge → Argo/Flux sync), self‑heal (scale/restart on anomaly score <0), auto‑patch (draft PR або maintenance window apply).
- **Security:** SLSA3 supply‑chain (syft SBOM mandatory, Cosign attest fail‑pipeline), zero‑trust gates (Kyverno deny no‑limits/PSA restricted/DB mig auto).
- **Observability:** synthetic probes (Grafana CRD /health 60 с success), dashboards (Grafana Tempo OTEL traces, Prometheus anomaly graphs), alerts (PagerDuty webhook on fallback/MTTR >1.5 хв).
- **Self‑Learning:** monthly retrain (cache last‑10 runs + K8s events), conservative patches (draft PR default, auto apply only if conf ≥0.99 + sandbox chaos ≥90 % recovery).
- **Governance:** approval matrix (path‑based risk: values.yaml low, migrations high PR), audit SOS S3 90 д export, kill‑switch /kill UI (block autodeploy by namespace label).

**Ключові сценарії:**

- Low‑risk config change: VS Code predict → auto‑merge → sync healthy <1.5 хв.
- High‑risk DB mig: MCP force PR → SRE approval → manual merge + rollback ready.
- Anomaly CPU spike: IsolationForest score <0 → auto‑scale HPA + alert PagerDuty.

---

## 3. Архітектура системи (логічна та фізична) + ASCII‑діаграма

### Логічна архітектура:

- **Entry Point:** VS Code Extension (QuickPick env, OTEL span runId start).
- **Control Plane:** MCP Analyzer, StateManager (OTEL attr log), Supervisor Agent (anomaly heal + Vault rotate), Self‑Learning Agent.
- **CI/CD Layer:** GitHub Actions (syft SBOM mandatory, Cosign attest, Kyverno deny gates), GH App (atomic merges).
- **GitOps Layer:** ArgoCD (primary sync/prune), Flux (fallback reconcile <30 с).
- **Runtime Layer:** Kubernetes clusters (ns=predator‑prod/staging/dev, PSA restricted, HPA autoscaling CPU70 %), apps (analytics Deployment probes /health, ingress nginx tls letsencrypt).
- **Observability Layer:** OTEL Collector (endpoint 4317 sampling 0.1 runId attr), Prometheus (series anomaly), Grafana (Tempo traces, synthetic probes CRD 60 с), Loki (logs tail‑f runId).
- **Storage Layer:** S3 (immutable charts/SBOM/audit signed Cosign), Vault (secrets rotation cron 30 д), Postgres/Timeseries (cache last‑10 runs).

### Фізична/розгортна топологія:

- Clusters: Multi‑AZ EKS (prod, 3 nodes m5.large), k3s (staging, 2 nodes), kind (dev sim).
- Storage: S3 (replicated EU‑central, lifecycle 90 д prune), Vault HA (3 pods Raft).
- Network: VPC private subnets, NetworkPolicy deny‑all ingress, ALB ingress tls.
- External: GitHub Enterprise (GH App registered, OIDC trust to EKS IAM roles), PagerDuty webhook /kill UI.
- Backup: S3 versioning charts/SBOM, Thanos Prometheus snapshots, Vault snapshot cron.

### ASCII‑діаграма (спрощено):

[VSCode] –OTEL(runId)→ [Control Plane: MCP | StateManager | Agents]
| |
| v
v [GitHub (GH App)]
[render_and_sync.sh] → [Helm (SBOM + Cosign)] → [Kyverno gates]
| |
v v
[GitOps: ArgoCD primary sync/prune] → [Flux fallback <30s]
| |
v v
[K8s predator‑prod] → [Monitoring: Prometheus/Grafana/Tempo]
← [Self‑Learning Agent] ← [Storage: S3, Vault]

---

## 4. Repository Strategy (Git structure)

- **Code repo(s):** застосунки сервісів (backend, frontend, …) — власні репозиторії.
- **Config/Manifest repo:** окремий Git‑репозиторій для Helm charts, values файлів, GitOps manifests (принцип “infrastructure as code”).
- Відділення середовищ: папки або гілки /dev, /staging, /prod.
- Політика гілок: main/master захищена (no direct push), auto‑merge через GH App тільки при low‑risk.
- Pull‑request шаблони, чеклисти, шаблони з авто‑прив’язками (SBOM, OTEL trace).
- Логування комітів, метаданих runId, audit‑trail через OTEL + S3.

---

## 5. GitOps‑конвеєр (Helm + Argo/Flux, immutable pipelines, security gates, fallback)

### Основні принципи:

- **Immutable releases:** образи та charts з sha256‑digest; артефакти зберігаються в OCI‑сумісному S3, підписані Cosign.
- **SBOM mandatory:** syft генерує SBOM; pipeline fails якщо його немає або знайдено критичні вразливості.
- **OIDC short‑lived:** GH App + OIDC для доступу до кластеру, без довготривалих токенів.
- **Security gates:** Kyverno/OPA pre‑deploy; порушення — блокування.
- **Predictive preflight:** MCC cache (останні 10) формує confidence; low‑risk → auto‑merge; high‑risk/DB mig → PR з SRE approval.
- **Failover:** ArgoCD primary; якщо Argo недоступний — Flux reconcile <30 с (ціль: fallback_rate <1 % alert).
- **Progressive rollout:** canary (5/25/50/100 %) з AnalysisTemplate thresholds (err_rate <0.005, steps=3, failureLimit=1).
- **Self‑Learning:** агрегація метрик + подій → retrain моделей → автоматичні патчі чи draft PR.

### Типовий flow (preflight → render → sync → verify → finalize):

1. VS Code QuickPick env → OTEL span runId start.
2. Preflight: OIDC kubeconfig, Helm lint + graph checksum validate; syft SBOM; Kyverno apply; Vault rotation check.
3. MCP: cache avg(‑10) + consensus; if DB mig path → force high‑risk.
4. Render: immutable dep update; helm template; syft + Cosign attest; push chart φOCI/S3.
5. Sync: low‑risk → GH App atomic push/merge; high‑risk → PR + SRE label.
6. Argo/Flux: Argo sync prune ns=predator‑prod poll 30 с; if fail → Flux reconcile <30 с.
7. Rollout: Canary based on config; lifecycle rev ≤10 prune cron.
8. Verify: Synthetic Probe CRD /health 60 с success; OTEL trace latency <300 мс runId attr; DB query via Vault.
9. Finalize: tag `immutable‑$runId`, Vault rotate cron 30 д; if fail → helm undo rev=stable + Flux prune + PagerDuty /kill UI.

---

## 6. Компоненти платформи (детально)

### 6.1 Helm Umbrella Chart

- Структура: `helm/predator‑umbrella/` (Chart.yaml v5.0.0, dependencies: backend 1.2.0, observability 2.0.0, storage 1.0.0).
- Особливості: annotations `helm.sh/immutable: "true"`, `cosign.attest: "true"`, `kyverno.policy: "restricted"`.
- Templates: Deployment (probes `/health` initialDelay 30 с period 10 с), HPA v2 (targetCPU=70 %, minReplicas=3, maxReplicas=10), Ingress class=nginx (cert‑manager tls letsencrypt‑prod), ConfigMap envFrom SealedSecrets `db‑sealed`.
- Lifecycle: maxRevisions=10, prune cron `"0 2 * * * helm history prune"`.
- values‑prod.yaml (фрагмент):
  ```yaml
  global:
    imageRegistry: "ghcr.io/dima1203oleg"
    pullPolicy: Always
    replicas: 3
    resources:
      limits:
        cpu: 1
        memory: 2Gi
      requests:
        cpu: 500m
        memory: 1Gi
  hpa:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
  secrets:
    dbPass: "sealed"
  observability:
    prometheus:
      enabled: true
      retention: 30d
      rules:
        - alert: HighLatency
          expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.3
          for: 1m
          labels:
            severity: warning
            runId: "{{runId}}"
        - alert: AnomalyScoreLow
          expr: isolation_forest_score < 0
          for: 1m
          labels:
            severity: critical
          annotations:
            summary: "Anomaly detected – predictive self‑heal triggered"
  ```

### 6.2 render_and_sync.sh (скрипт)

… (опис фрагменту, ключі функціоналу)

### 6.3 gitops_sync.sh …

### 6.4 MCP Analyzer …

### 6.5 Supervisor Agent …

### 6.6 Self‑Learning Agent …

### 6.7 VS Code Extension …

### 6.8 Monitoring stack …

(детальні описи збережено як у попередній версії ТЗ)

⸻

## 7. Аналітичні модулі та ML‑пайплайни

7.1 Anomaly Detection (Runtime)

…

7.2 Predictive Scoring (MCP)

…

7.3 Self‑Learning Loop

…

⸻

## 8. Ролі користувачів та сценарії взаємодії

…

⸻

## 9. Безпека та відповідність (SLSA3, OIDC, Vault, Kyverno, Cosign тощо)

…

⸻

## 10. Disaster Recovery & Backup Strategy

…

⸻

## 11. Тестування, QA, Chaos і валідація

…

⸻

## 12. KPI, метрики та приймальні критерії

Метрика Ціль
GH App auto‑merge rate ≥ 95 %
Flux fallback latency < 30 с
Anomaly F1 accuracy ≥ 95 %
SBOM attest success 100 %
OTEL trace coverage ≥ 95 %
Vault rotation compliance 100 %
Chaos recovery ≥ 90 %

Приймальні критерії: …

⸻

## 13. Поступове впровадження / план релізу (14 днів)

…

⸻

## 14. Приклади конфігурацій та код‑сніпети (Helm, shell, GH Actions, Kyverno, agent)

…

⸻

## 15. Deliverables, приймальні документи, подальші кроки

…

⸻

## 16. Глосарій термінів

…

⸻

Документ створено відповідно до норм Markdown‑стилю: заголовки, списки, код‑блоки, таблиці згідно з рекомендаціями.

---
