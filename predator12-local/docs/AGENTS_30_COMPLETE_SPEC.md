# 🤖 Predator Analytics - 30 AI Agents Complete Specification

**Version**: 12.0 Extended  
**Date**: 2025-01-06  
**Status**: 🎯 **COMPREHENSIVE AGENT CATALOG**

---

## 📋 Overview

Система самовдосконалення Predator Analytics базується на **30 автономних AI-агентах**, розподілених на 3 основні категорії:

- **Self-Heal (10 агентів)** — відновлення та стабілізація
- **Optimize (10 агентів)** — оптимізація коду/даних/процесів
- **Modernize (10 агентів)** — модернізація залежностей/архітектури/функціоналу

Кожен агент — це спеціалізований мікросервіс (CrewAI/LangGraph) з чіткою роллю, залежностями, інструментами, тригерами та метриками успіху.

### Key Principles

- ✅ **Plan-then-Execute**: LLM план → risk check → виконання
- ✅ **Human-in-the-Loop**: PR review для ризикових змін
- ✅ **Sandboxing**: CPU/RAM limits, timeouts per agent
- ✅ **OTEL Tracing**: Повна видимість LLM decisions
- ✅ **Intelligent Routing**: MoMA-style model selection
- ✅ **Graceful Degradation**: Fallback chains на failures

---

## 🔧 Category 1: Self-Heal Agents (10 агентів)

### Призначення
Відновлення та стабілізація системи при збоях. Реагують на alerts з Prometheus, виконують playbooks (restart/scale/rollback), логують у `logs/agents/self_heal.log`.

### Architecture Pattern
```
Alert (Prometheus) → SelfDiagnosis → AutoHeal Playbook → Verify → Log/Escalate
```

---

### 1.1 PortCollisionHealer

**Роль**: Kill/restart services на зайнятих портах (8000/3000/5432)

```yaml
agent:
  name: PortCollisionHealer
  category: self_heal
  priority: critical
  
dependencies:
  scripts:
    - scripts/manage-ports.sh
  apis:
    - Docker API
    - Kubernetes API (future)
    
triggers:
  - type: prometheus_alert
    condition: port_in_use{port=~"8000|3000|5432"} == 1
  - type: pre_launch_check
    condition: port_scan_failed
    
execution:
  steps:
    - name: detect_process
      command: lsof -i :${port} | grep LISTEN
    - name: graceful_kill
      command: kill -TERM ${pid}
      timeout: 8s
    - name: force_kill
      command: kill -KILL ${pid}
      condition: process_still_alive
    - name: restart_service
      command: systemctl restart ${service}
      
metrics:
  success_rate: 95%
  resolution_time: <10s
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - meta-llama/llama-3.1-8b-instruct
    - local/tinyllama-1.1b
  context_window: 8192
  temperature: 0.1
  
logging:
  path: logs/agents/self_heal/port_collision.log
  level: INFO
```

---

### 1.2 VenvRestorer

**Роль**: Recreate venv якщо corrupted/missing

```yaml
agent:
  name: VenvRestorer
  category: self_heal
  priority: high
  
dependencies:
  scripts:
    - scripts/setup-venv.sh
  files:
    - backend/requirements-311-modern.txt
    - frontend/package.json
    
triggers:
  - type: import_error
    condition: ModuleNotFoundError
  - type: health_check
    condition: venv_check_failed
    
execution:
  steps:
    - name: backup_old_venv
      command: mv .venv .venv.backup-$(date +%s)
    - name: create_new_venv
      command: python3.11 -m venv .venv
    - name: install_dependencies
      command: .venv/bin/pip install -r requirements-311-modern.txt
    - name: verify_imports
      command: .venv/bin/python -c "import fastapi, celery, sqlalchemy"
      
metrics:
  success_rate: 100%
  restoration_time: <3min
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - mistralai/mistral-small-latest
  temperature: 0.0
```

---

### 1.3 ServiceRestarter

**Роль**: Restart PostgreSQL/Redis/Qdrant/OpenSearch on health fail

```yaml
agent:
  name: ServiceRestarter
  category: self_heal
  priority: critical
  
dependencies:
  commands:
    - brew services (macOS)
    - systemctl (Linux)
  health_checks:
    - pg_isready
    - redis-cli ping
    - curl http://localhost:6333/health
    - curl http://localhost:9200/_cluster/health
    
triggers:
  - type: health_probe_failure
    services: [postgresql, redis, qdrant, opensearch]
    threshold: 3_consecutive_failures
    
execution:
  steps:
    - name: diagnose
      command: systemctl status ${service}
    - name: restart
      command: brew services restart ${service}
      timeout: 30s
    - name: verify
      command: ${health_check_command}
      retries: 5
      backoff: exponential
    - name: escalate
      condition: restart_failed
      action: human_intervention
      
metrics:
  uptime: >99.9%
  recovery_time: <30s
  
llm_config:
  primary: anthropic/claude-3.5-sonnet
  fallbacks:
    - google/gemma-2-2b-it
  temperature: 0.1
```

---

### 1.4 DependencyBreakerFixer

**Роль**: Auto-fix broken deps (pip-audit fail)

```yaml
agent:
  name: DependencyBreakerFixer
  category: self_heal
  priority: high
  
dependencies:
  tools:
    - pip-audit
    - pip-compile
  files:
    - requirements-311-modern.txt
    - pyproject.toml
    
triggers:
  - type: pre_commit_failure
    hook: pip-audit
  - type: cron
    schedule: "0 2 * * *"  # Daily 2am
    
execution:
  steps:
    - name: scan_vulnerabilities
      command: pip-audit --format json
    - name: analyze_fixes
      llm_prompt: |
        Vulnerabilities found: ${vulnerabilities}
        Suggest safest upgrade path while maintaining compatibility.
    - name: update_requirements
      command: pip-compile --upgrade-package ${package}
    - name: test_compatibility
      command: pytest tests/ -x
    - name: create_pr
      condition: tests_pass
      action: git_pr
      labels: [auto-deps, security]
      
metrics:
  dependencies_clean: <5min
  pr_merge_rate: >80%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - deepseek/deepseek-coder-v2-lite
  temperature: 0.2
```

---

### 1.5 LogAnomalyHealer

**Роль**: Parse logs, fix recurring errors (e.g., OOM)

```yaml
agent:
  name: LogAnomalyHealer
  category: self_heal
  priority: high
  
dependencies:
  services:
    - Loki (log aggregation)
    - Tempo (tracing)
  agents:
    - SelfDiagnosisAgent
    
triggers:
  - type: log_error_spike
    condition: error_rate > 5x_baseline
    window: 5min
    
execution:
  steps:
    - name: aggregate_errors
      query: |
        {app="predator12"} |= "ERROR" 
        | json 
        | count by error_type
    - name: classify_error
      llm_prompt: |
        Error patterns: ${error_patterns}
        Classify root cause and suggest fix.
    - name: apply_fix
      actions:
        - increase_memory_limit
        - restart_worker
        - rollback_deployment
    - name: verify_resolution
      condition: error_rate < baseline
      
metrics:
  error_rate_drop: 50%
  resolution_time: <10min
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - meta-llama/llama-3.1-70b-instruct
  temperature: 0.3
```

---

### 1.6 CacheEvictor

**Роль**: Clear Redis/MinIO cache on corruption

```yaml
agent:
  name: CacheEvictor
  category: self_heal
  priority: medium
  
dependencies:
  services:
    - Redis
    - MinIO
  commands:
    - redis-cli
    - mc (MinIO client)
    
triggers:
  - type: cache_hit_rate_low
    condition: hit_rate < 80%
    window: 15min
  - type: cache_corruption_detected
    condition: value_validation_failed
    
execution:
  steps:
    - name: identify_corrupted_keys
      command: redis-cli --scan --pattern "*" | xargs -I {} redis-cli GET {}
    - name: selective_eviction
      command: redis-cli DEL ${corrupted_keys}
    - name: verify_restoration
      command: redis-cli INFO stats
      check: hit_rate > 95%
      
metrics:
  hit_rate_restore: >95%
  eviction_time: <2min
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - microsoft/phi-3-mini-4k-instruct
  temperature: 0.0
```

---

### 1.7 IndexRebuilder

**Роль**: Reindex Qdrant/OpenSearch on drift

```yaml
agent:
  name: IndexRebuilder
  category: self_heal
  priority: high
  
dependencies:
  services:
    - Qdrant
    - OpenSearch
  agents:
    - IndexerAgent
    
triggers:
  - type: index_health_alert
    condition: status != "green"
  - type: query_latency_high
    condition: p95_latency > 5s
    
execution:
  steps:
    - name: backup_index
      command: |
        curl -X POST "localhost:9200/_snapshot/backup/snapshot_$(date +%s)"
    - name: delete_corrupted_index
      command: curl -X DELETE "localhost:9200/${index_name}"
    - name: recreate_index
      agent: IndexerAgent
      params:
        source: postgresql
        target: opensearch
        mode: full_reindex
    - name: verify_health
      command: curl "localhost:9200/_cluster/health?wait_for_status=green"
      
metrics:
  query_latency: <2s
  reindex_time: <15min
  
llm_config:
  primary: anthropic/claude-3.5-sonnet
  fallbacks:
    - mistralai/mistral-large-latest
  temperature: 0.1
```

---

### 1.8 BackupValidator

**Роль**: Verify/restore backups (pgBackRest/Velero)

```yaml
agent:
  name: BackupValidator
  category: self_heal
  priority: critical
  
dependencies:
  tools:
    - pgBackRest
    - Velero (future K8s)
  storage:
    - MinIO (backup repository)
    
triggers:
  - type: scheduled
    cron: "0 3 * * *"  # Daily 3am
  - type: backup_failure_alert
    source: prometheus
    
execution:
  steps:
    - name: list_backups
      command: pgbackrest info
    - name: verify_integrity
      command: pgbackrest verify --stanza=predator12
    - name: test_restore
      environment: isolated_test_db
      command: |
        pgbackrest restore --stanza=predator12 --delta \
          --target-timeline=latest
    - name: validate_data
      query: SELECT count(*) FROM critical_tables
      check: count > 0
      
metrics:
  restore_success: 100%
  validation_time: <30min
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - x-ai/grok-3
  temperature: 0.0
```

---

### 1.9 NetworkResolver

**Роль**: Fix connectivity issues (e.g., Kafka down)

```yaml
agent:
  name: NetworkResolver
  category: self_heal
  priority: high
  
dependencies:
  tools:
    - kubectl (future)
    - NetworkPolicies
    - Istio/Linkerd (future)
    
triggers:
  - type: connectivity_alert
    services: [kafka, postgresql, redis]
  - type: timeout_spike
    threshold: >10x_baseline
    
execution:
  steps:
    - name: diagnose_connectivity
      commands:
        - ping ${service_host}
        - nc -zv ${host} ${port}
        - traceroute ${host}
    - name: check_firewall_rules
      command: iptables -L -n
    - name: restart_network_services
      command: systemctl restart networking
    - name: verify_connectivity
      command: curl ${health_endpoint}
      
metrics:
  ping_success: 100%
  resolution_time: <5min
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - meta-llama/llama-3.2-11b-vision-instruct
  temperature: 0.1
```

---

### 1.10 FailsafeSwitcher

**Роль**: Switch to manual mode on agent cascade fail

```yaml
agent:
  name: FailsafeSwitcher
  category: self_heal
  priority: critical
  
dependencies:
  supervisor: NEXUS_SUPERVISOR
  notification: PagerDuty/Slack
  
triggers:
  - type: agent_error_threshold
    condition: error_rate > 20%
    window: 10min
  - type: cascade_failure
    condition: >3_agents_failing
    
execution:
  steps:
    - name: disable_all_agents
      command: supervisorctl stop all
    - name: notify_humans
      channels: [slack, pagerduty]
      message: |
        🚨 FAILSAFE MODE ACTIVATED
        Multiple agents failing. Manual intervention required.
        Error rate: ${error_rate}%
        Failed agents: ${failed_agents}
    - name: enable_manual_mode
      command: touch .manual_mode_enabled
    - name: provide_diagnostic_report
      llm_prompt: |
        Analyze cascade failure:
        ${agent_logs}
        ${error_patterns}
        Suggest recovery steps.
        
metrics:
  manual_fallback_time: <30s
  notification_delivery: 100%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - anthropic/claude-3.5-sonnet
  temperature: 0.2
```

---

## ⚙️ Category 2: Optimize Agents (10 агентів)

### Призначення
Оптимізація коду, даних, процесів. Працюють у dry-run mode (no write), генерують артефакти (tests/migrations), з human review для PR.

### Architecture Pattern
```
Trigger (code change/metric) → Analyze → Generate Artifacts → Dry-Run Test → PR Review → Merge
```

---

### 2.1 LintOptimizer

**Роль**: Auto-lint/fix code (Ruff/Black dry-run)

```yaml
agent:
  name: LintOptimizer
  category: optimize
  priority: high
  
dependencies:
  tools:
    - ruff
    - black
    - pre-commit
    
triggers:
  - type: pre_commit_failure
    hook: ruff-check
  - type: code_push
    branch: main
    
execution:
  steps:
    - name: run_lint_check
      command: ruff check . --fix --dry-run
    - name: run_format_check
      command: black . --check
    - name: analyze_issues
      llm_prompt: |
        Lint issues: ${lint_issues}
        Suggest safest auto-fixes.
    - name: apply_fixes
      command: |
        ruff check . --fix
        black .
    - name: verify_no_breakage
      command: pytest tests/ -x
    - name: commit_fixes
      condition: tests_pass
      message: "chore: auto-lint fixes [skip ci]"
      
metrics:
  lint_score: 100%
  fix_time: <2min
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - deepseek/deepseek-coder-v2-lite
  temperature: 0.1
```

---

### 2.2 TestGenerator

**Роль**: Generate unit/integration tests (Pytest)

```yaml
agent:
  name: TestGenerator
  category: optimize
  priority: high
  
dependencies:
  tools:
    - pytest
    - pytest-cov
    - Testcontainers
  frameworks:
    - hypothesis (property-based testing)
    
triggers:
  - type: code_change
    files: ["*.py", "!tests/*"]
  - type: coverage_drop
    threshold: <80%
    
execution:
  steps:
    - name: analyze_code
      llm_prompt: |
        Code to test:
        ${code_content}
        
        Generate pytest tests covering:
        - Happy path
        - Edge cases
        - Error handling
        - Property-based tests (hypothesis)
    - name: generate_tests
      output: tests/test_${module}_generated.py
    - name: run_tests
      command: pytest tests/test_${module}_generated.py -v
    - name: measure_coverage
      command: pytest --cov=${module} --cov-report=term
    - name: create_pr
      condition: coverage_increase > 20%
      labels: [auto-generated, tests]
      
metrics:
  coverage_increase: +20%
  test_generation_time: <5min
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - meta-llama/codellama-34b-instruct
  temperature: 0.3
```

---

### 2.3 MigrationBuilder

**Роль**: Generate Alembic migrations (autogenerate + validate)

```yaml
agent:
  name: MigrationBuilder
  category: optimize
  priority: critical
  
dependencies:
  tools:
    - alembic
    - sqlalchemy
  database:
    - PostgreSQL (schema introspection)
    
triggers:
  - type: schema_change_detected
    source: SQLAlchemy models
  - type: manual_request
    command: make migration message="Add user preferences"
    
execution:
  steps:
    - name: detect_model_changes
      command: alembic revision --autogenerate -m "${message}"
    - name: review_migration
      llm_prompt: |
        Migration SQL:
        ${migration_sql}
        
        Review for:
        - Data loss risks (DROP TABLE/COLUMN)
        - Index performance impact
        - Constraint violations
        - Rollback safety
    - name: add_safety_checks
      actions:
        - Add batch operations for large tables
        - Add data validation queries
        - Add rollback migration
    - name: test_migration
      environment: test_database
      commands:
        - alembic upgrade head
        - pytest tests/migrations/
        - alembic downgrade -1
    - name: create_pr
      condition: all_checks_pass
      labels: [migration, review-required]
      reviewers: [database-team]
      
metrics:
  migration_success: 95%
  review_time: <15min
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - mistralai/codestral-latest
  temperature: 0.1
```

---

### 2.4 DataNormalizer

**Роль**: Normalize/validate datasets (Great Expectations)

```yaml
agent:
  name: DataNormalizer
  category: optimize
  priority: high
  
dependencies:
  tools:
    - Great Expectations
    - pandas
    - pyarrow (Parquet)
    
triggers:
  - type: data_ingest
    source: DatasetIngestAgent
  - type: validation_failure
    threshold: >5%_rows_invalid
    
execution:
  steps:
    - name: profile_dataset
      command: great_expectations datasource profile
    - name: run_validation
      suite: default_expectations
      checks:
        - no_null_values
        - column_values_in_range
        - unique_values
    - name: normalize_data
      llm_prompt: |
        Validation failures: ${failures}
        Suggest normalization strategies:
        - Imputation (mean/median/mode)
        - Outlier handling (clip/remove)
        - Deduplication
    - name: apply_normalization
      transformations:
        - fillna(strategy="median")
        - clip(lower=0, upper=1e6)
        - drop_duplicates(subset=["id"])
    - name: revalidate
      command: great_expectations checkpoint run
    - name: log_data_quality
      metrics:
        - completeness
        - uniqueness
        - validity
        
metrics:
  data_quality: >95%
  normalization_time: <10min
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - microsoft/phi-3.5-mini-instruct
  temperature: 0.2
```

---

### 2.5 QueryOptimizer

**Роль**: Rewrite/optimize SQL/RAG queries

```yaml
agent:
  name: QueryOptimizer
  category: optimize
  priority: high
  
dependencies:
  databases:
    - PostgreSQL (EXPLAIN ANALYZE)
    - OpenSearch (profiling API)
  services:
    - Qdrant (query metrics)
    
triggers:
  - type: slow_query_detected
    condition: latency > 2s
  - type: scheduled_optimization
    cron: "0 4 * * 0"  # Weekly Sunday 4am
    
execution:
  steps:
    - name: identify_slow_queries
      query: |
        SELECT query, avg_time, calls
        FROM pg_stat_statements
        WHERE avg_time > 2000
        ORDER BY avg_time DESC
        LIMIT 10
    - name: analyze_execution_plan
      command: EXPLAIN (ANALYZE, BUFFERS) ${query}
    - name: suggest_optimizations
      llm_prompt: |
        Query: ${query}
        Execution plan: ${explain_output}
        
        Suggest optimizations:
        - Missing indexes
        - Query rewrite
        - Partitioning
        - Materialized views
    - name: create_indexes
      command: CREATE INDEX CONCURRENTLY ${index_name} ON ${table}(${columns})
    - name: test_performance
      command: EXPLAIN ANALYZE ${optimized_query}
      check: avg_time < 500ms
    - name: document_changes
      output: docs/query_optimizations.md
      
metrics:
  latency_drop: 30%
  throughput_increase: 20%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - meta-llama/llama-3.1-8b-instruct
  temperature: 0.2
```

---

### 2.6 CacheTuner

**Роль**: Tune Redis/MinIO TTL/eviction

```yaml
agent:
  name: CacheTuner
  category: optimize
  priority: medium
  
dependencies:
  services:
    - Redis (INFO stats)
    - MinIO (lifecycle policies)
  monitoring:
    - Prometheus (cache metrics)
    
triggers:
  - type: cache_miss_high
    condition: miss_rate > 20%
    window: 1hour
  - type: memory_pressure
    condition: redis_memory_used > 80%
    
execution:
  steps:
    - name: analyze_access_patterns
      query: |
        redis-cli --scan --pattern "*" | 
        xargs -I {} redis-cli OBJECT IDLETIME {}
    - name: segment_keys
      categories:
        - hot: accessed < 1hour ago
        - warm: accessed < 24hours ago
        - cold: accessed > 24hours ago
    - name: optimize_ttl
      llm_prompt: |
        Access patterns: ${patterns}
        Current TTLs: ${current_ttls}
        
        Suggest optimal TTL per category.
    - name: apply_ttl_changes
      commands:
        - redis-cli CONFIG SET maxmemory-policy allkeys-lru
        - redis-cli EXPIRE hot_key 3600
        - redis-cli EXPIRE warm_key 86400
    - name: configure_minio_lifecycle
      policy: |
        {
          "Rules": [{
            "Expiration": { "Days": 30 },
            "Filter": { "Prefix": "temp/" }
          }]
        }
    - name: monitor_improvements
      metrics:
        - hit_rate
        - eviction_rate
        - memory_usage
        
metrics:
  hit_rate: >95%
  memory_savings: 20%
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - google/gemma-7b-it
  temperature: 0.3
```

---

### 2.7 ResourceBalancer

**Роль**: Suggest HPA/VPA configs based on metrics

```yaml
agent:
  name: ResourceBalancer
  category: optimize
  priority: medium
  
dependencies:
  kubernetes:
    - HPA API (future)
    - VPA API (future)
  monitoring:
    - Prometheus (resource metrics)
    
triggers:
  - type: cpu_high
    condition: cpu_usage > 70%
    window: 10min
  - type: memory_pressure
    condition: memory_usage > 80%
    
execution:
  steps:
    - name: analyze_resource_trends
      query: |
        rate(container_cpu_usage_seconds_total[5m])
        container_memory_working_set_bytes
    - name: predict_scaling_needs
      llm_prompt: |
        Resource trends: ${trends}
        Current limits: ${current_limits}
        
        Predict optimal HPA/VPA configuration.
    - name: generate_hpa_manifest
      template: |
        apiVersion: autoscaling/v2
        kind: HorizontalPodAutoscaler
        metadata:
          name: ${service}-hpa
        spec:
          minReplicas: ${min_replicas}
          maxReplicas: ${max_replicas}
          metrics:
          - type: Resource
            resource:
              name: cpu
              target:
                type: Utilization
                averageUtilization: 70
    - name: simulate_scaling
      tool: Kubernetes dryrun
    - name: create_pr
      condition: simulation_success
      labels: [optimization, autoscaling]
      
metrics:
  utilization_balanced: 60-80%
  cost_savings: 15%
  
llm_config:
  primary: anthropic/claude-3.5-sonnet
  fallbacks:
    - mistralai/mistral-medium-latest
  temperature: 0.2
```

---

### 2.8 ConfigDrifter

**Роль**: Detect/diff config drift (Git vs live)

```yaml
agent:
  name: ConfigDrifter
  category: optimize
  priority: high
  
dependencies:
  tools:
    - git
    - kubectl (future)
    - ArgoCD CLI (future)
  
triggers:
  - type: scheduled
    cron: "*/15 * * * *"  # Every 15min
  - type: argocd_sync_failure
    
execution:
  steps:
    - name: fetch_live_config
      command: kubectl get all -o yaml > live-config.yaml
    - name: fetch_git_config
      command: git show HEAD:infra/ > git-config.yaml
    - name: compute_diff
      command: diff -u git-config.yaml live-config.yaml
    - name: analyze_drift
      llm_prompt: |
        Drift detected:
        ${diff_output}
        
        Classify:
        - Expected (e.g., auto-generated labels)
        - Unexpected (manual changes)
        - Risky (security configs)
    - name: create_incident
      condition: risky_drift_detected
      severity: high
      assignee: ops-team
    - name: auto_remediate
      condition: expected_drift && auto_fix_enabled
      command: kubectl apply -f infra/
      
metrics:
  drift_detection_time: <5min
  remediation_success: 90%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - x-ai/grok-3
  temperature: 0.1
```

---

### 2.9 PerfProfiler

**Роль**: Profile bottlenecks (cProfile + OTEL)

```yaml
agent:
  name: PerfProfiler
  category: optimize
  priority: medium
  
dependencies:
  tools:
    - cProfile
    - py-spy (sampling profiler)
    - OpenTelemetry (tracing)
  services:
    - Jaeger (trace visualization)
    
triggers:
  - type: latency_spike
    condition: p95_latency > 3s
  - type: manual_profiling
    command: make profile
    
execution:
  steps:
    - name: start_profiling
      command: py-spy record -o profile.svg -- python app/main.py
      duration: 60s
    - name: analyze_hotspots
      llm_prompt: |
        Profiling data: ${profile_svg}
        Top 10 hotspots: ${hotspots}
        
        Suggest optimizations:
        - Algorithm improvements
        - Caching opportunities
        - Async conversions
    - name: generate_otel_spans
      command: |
        from opentelemetry import trace
        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span("slow_function"):
            slow_function()
    - name: visualize_traces
      tool: Jaeger UI
      url: http://localhost:16686
    - name: document_findings
      output: docs/performance_analysis.md
      
metrics:
  bottleneck_identified: 80%
  optimization_applied: 50%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - deepseek/deepseek-v3
  temperature: 0.3
```

---

### 2.10 DocUpdater

**Роль**: Generate/update docs/ADR from code changes

```yaml
agent:
  name: DocUpdater
  category: optimize
  priority: medium
  
dependencies:
  tools:
    - Sphinx
    - mkdocs
  templates:
    - ADR (Architecture Decision Records)
    
triggers:
  - type: code_pr_merged
    files: ["*.py", "*.ts"]
  - type: manual_request
    command: make docs
    
execution:
  steps:
    - name: extract_docstrings
      command: sphinx-apidoc -o docs/api backend/
    - name: analyze_code_changes
      llm_prompt: |
        Code diff: ${git_diff}
        Existing docs: ${current_docs}
        
        Generate/update:
        - API documentation
        - Changelog entry
        - ADR (if architectural change)
    - name: generate_api_docs
      command: sphinx-build -b html docs/ docs/_build/
    - name: create_adr
      condition: architectural_change
      template: |
        # ADR-${number}: ${title}
        
        ## Status
        Accepted
        
        ## Context
        ${context}
        
        ## Decision
        ${decision}
        
        ## Consequences
        ${consequences}
    - name: commit_docs
      message: "docs: update API docs and ADR [skip ci]"
      
metrics:
  doc_coverage: +10%
  freshness: <24hours
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - meta-llama/llama-3.3-70b-instruct
  temperature: 0.4
```

---

## 🚀 Category 3: Modernize Agents (10 агентів)

### Призначення
Модернізація залежностей, архітектури, функціоналу. Пропонують PR з тегом `[auto-deps]`, dry-run, human review для ризикових змін.

### Architecture Pattern
```
Trigger (cron/alert) → Scan → Analyze → Generate PR → Human Review → Merge/Reject
```

---

### 2.21 DepUpdater

**Роль**: Scan/update dependencies (pip-audit + PR)

```yaml
agent:
  name: DepUpdater
  category: modernize
  priority: high
  
dependencies:
  tools:
    - pip-audit
    - safety
    - dependabot (optional)
    
triggers:
  - type: scheduled
    cron: "0 2 * * 1"  # Weekly Monday 2am
  - type: vulnerability_alert
    source: GitHub Security Advisories
    
execution:
  steps:
    - name: scan_vulnerabilities
      commands:
        - pip-audit --format json
        - safety check --json
    - name: analyze_updates
      llm_prompt: |
        Vulnerabilities: ${vulnerabilities}
        Current versions: ${current_versions}
        Available updates: ${available_updates}
        
        Prioritize updates by:
        - Severity (critical > high > medium)
        - Breaking changes risk
        - Dependency tree impact
    - name: update_requirements
      command: pip-compile --upgrade-package ${package}==${version}
    - name: run_tests
      command: pytest tests/ --cov --cov-fail-under=80
    - name: create_pr
      condition: tests_pass
      title: "chore(deps): update ${package} to ${version} [auto-deps]"
      labels: [dependencies, security, auto-deps]
      body: |
        ## 🔐 Security Update
        
        **Package**: ${package}
        **Current**: ${current_version}
        **New**: ${new_version}
        
        **Vulnerabilities Fixed**:
        ${vulnerabilities_fixed}
        
        **Breaking Changes**: ${breaking_changes}
        
        **Test Results**: ✅ All tests passing
        
        /cc @security-team
        
metrics:
  vulnerabilities_fixed: 100%
  pr_merge_time: <48hours
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - meta-llama/codellama-34b-instruct
  temperature: 0.2
```

---

### 2.22 CodeRefactorer

**Роль**: Refactor code (e.g., Pydantic v2 migrate)

```yaml
agent:
  name: CodeRefactorer
  category: modernize
  priority: medium
  
dependencies:
  tools:
    - ruff (refactoring rules)
    - black
    - pyupgrade
    
triggers:
  - type: code_smell_detected
    tool: SonarQube/CodeClimate
  - type: manual_request
    command: make refactor target=pydantic_v2
    
execution:
  steps:
    - name: analyze_refactoring_scope
      llm_prompt: |
        Code to refactor: ${code_files}
        Target: ${refactoring_target}
        
        Plan refactoring:
        - Files to change
        - Breaking changes
        - Test coverage gaps
    - name: apply_automated_refactoring
      commands:
        - ruff --fix --select UP  # pyupgrade rules
        - black .
    - name: manual_refactoring
      llm_prompt: |
        Complex cases: ${complex_cases}
        Generate refactored code.
    - name: run_full_test_suite
      command: pytest tests/ -v --cov
    - name: measure_complexity
      tool: radon
      check: cyclomatic_complexity_decreased
    - name: create_pr
      condition: all_checks_pass
      labels: [refactoring, review-required]
      
metrics:
  complexity_drop: 20%
  test_coverage_maintained: 100%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - mistralai/codestral-latest
  temperature: 0.3
```

---

### 2.23 FeatureSuggester

**Роль**: Suggest new features from user queries

```yaml
agent:
  name: FeatureSuggester
  category: modernize
  priority: low
  
dependencies:
  agents:
    - QueryPatternLearner
  tools:
    - GitHub Issues API
    
triggers:
  - type: user_feedback
    source: feedback_form
  - type: query_pattern_analysis
    frequency: weekly
    
execution:
  steps:
    - name: aggregate_user_queries
      query: |
        SELECT query, count(*) as frequency
        FROM user_queries
        WHERE timestamp > NOW() - INTERVAL '7 days'
        GROUP BY query
        ORDER BY frequency DESC
        LIMIT 20
    - name: identify_feature_gaps
      llm_prompt: |
        Top user queries: ${top_queries}
        Current features: ${current_features}
        
        Suggest new features to address unmet needs.
    - name: estimate_effort
      criteria:
        - development_time
        - dependencies
        - complexity
    - name: create_feature_proposals
      output: GitHub Issues
      labels: [enhancement, user-requested]
      template: |
        ## 💡 Feature Proposal
        
        **User Need**: ${user_need}
        **Suggested Solution**: ${solution}
        **Estimated Effort**: ${effort}
        **Priority**: ${priority}
        
        **Example Queries**:
        ${example_queries}
        
metrics:
  feature_prs: 5/week
  acceptance_rate: >60%
  
llm_config:
  primary: anthropic/claude-3.5-sonnet
  fallbacks:
    - google/gemma-27b-it
  temperature: 0.5
```

---

### 2.24 ArchEvolver

**Роль**: Evolve architecture (e.g., add HPA)

```yaml
agent:
  name: ArchEvolver
  category: modernize
  priority: high
  
dependencies:
  kubernetes:
    - HPA/VPA APIs (future)
  tools:
    - ArgoCD (future)
    
triggers:
  - type: scale_alert
    condition: manual_scaling_frequency > 5/week
  - type: architecture_review
    schedule: quarterly
    
execution:
  steps:
    - name: analyze_scaling_patterns
      query: |
        rate(http_requests_total[5m])
        container_cpu_usage_seconds_total
    - name: propose_architecture_change
      llm_prompt: |
        Current architecture: ${current_arch}
        Scaling patterns: ${patterns}
        
        Propose:
        - HPA configuration
        - Service mesh adoption
        - Caching layer
    - name: create_adr
      template: ADR-${number}-${title}.md
    - name: implement_changes
      steps:
        - Generate Helm values
        - Create K8s manifests
        - Update CI/CD
    - name: measure_efficiency
      metrics:
        - resource_utilization
        - cost_savings
        - latency_improvement
        
metrics:
  efficiency_gain: +15%
  cost_reduction: 10%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - meta-llama/llama-3.1-70b-instruct
  temperature: 0.3
```

---

### 2.25 ModelUpgrader

**Роль**: Upgrade LLMs (e.g., GPT-4o → GPT-4.1)

```yaml
agent:
  name: ModelUpgrader
  category: modernize
  priority: medium
  
dependencies:
  services:
    - ModelRouter
    - MLflow (model registry)
    
triggers:
  - type: model_drift_detected
    condition: accuracy_drop > 5%
  - type: new_model_release
    source: OpenAI/Anthropic announcements
    
execution:
  steps:
    - name: evaluate_new_model
      benchmark: |
        - Accuracy on test set
        - Latency (p50/p95/p99)
        - Cost per 1M tokens
    - name: canary_deployment
      traffic_split:
        old_model: 90%
        new_model: 10%
      duration: 7days
    - name: monitor_metrics
      alerts:
        - error_rate_increase > 10%
        - latency_increase > 20%
    - name: gradual_rollout
      steps:
        - 10% → 25% → 50% → 100%
      promotion_criteria:
        - accuracy >= baseline
        - latency <= baseline * 1.1
        - error_rate <= baseline * 1.05
    - name: update_registry
      command: |
        mlflow models create ${model_name}
        mlflow models update-version ${model_name} ${version}
        
metrics:
  accuracy_gain: +10%
  cost_reduction: 5%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - x-ai/grok-3
  temperature: 0.2
```

---

### 2.26 SecurityHardener

**Роль**: Add security (e.g., OPA policies)

```yaml
agent:
  name: SecurityHardener
  category: modernize
  priority: critical
  
dependencies:
  tools:
    - Trivy (container scanning)
    - Bandit (Python SAST)
    - OPA/Kyverno (policies)
    
triggers:
  - type: vulnerability_scan
    schedule: daily
  - type: compliance_audit
    schedule: quarterly
    
execution:
  steps:
    - name: scan_vulnerabilities
      commands:
        - trivy image ${image} --severity CRITICAL,HIGH
        - bandit -r backend/ -f json
    - name: analyze_security_gaps
      llm_prompt: |
        Vulnerabilities: ${vulnerabilities}
        Current policies: ${current_policies}
        
        Recommend security hardening:
        - OPA policies to add
        - RBAC refinements
        - Secret management improvements
    - name: generate_opa_policies
      template: |
        package kubernetes.admission
        
        deny[msg] {
          input.request.kind.kind == "Pod"
          not input.request.object.spec.securityContext.runAsNonRoot
          msg = "Containers must not run as root"
        }
    - name: test_policies
      command: opa test policies/ -v
    - name: create_pr
      labels: [security, compliance]
      reviewers: [security-team]
      
metrics:
  security_score: +25%
  vulnerabilities_fixed: 100%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - deepseek/deepseek-coder-v2-lite
  temperature: 0.1
```

---

### 2.27 UIEnhancer

**Роль**: Suggest UI improvements (e.g., WCAG fixes)

```yaml
agent:
  name: UIEnhancer
  category: modernize
  priority: medium
  
dependencies:
  tools:
    - Lighthouse
    - axe-core (accessibility)
    - Prettier
    
triggers:
  - type: lighthouse_score_low
    condition: accessibility < 90
  - type: user_feedback
    category: ui_ux
    
execution:
  steps:
    - name: run_accessibility_audit
      command: lighthouse ${url} --only-categories=accessibility
    - name: run_axe_scan
      command: axe ${url} --rules wcag2a,wcag2aa
    - name: analyze_issues
      llm_prompt: |
        Accessibility issues: ${issues}
        Current UI: ${ui_components}
        
        Suggest fixes:
        - ARIA labels
        - Color contrast
        - Keyboard navigation
        - Screen reader support
    - name: generate_fixes
      output: frontend/components/${component}.tsx
      changes:
        - Add aria-label
        - Increase contrast ratio
        - Add keyboard handlers
    - name: test_improvements
      tools:
        - Lighthouse (verify score ≥90)
        - Manual screen reader test
    - name: create_pr
      labels: [ui, accessibility]
      
metrics:
  lighthouse_score: ≥90
  wcag_compliance: 2.1 AA
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - microsoft/phi-3.5-vision-instruct
  temperature: 0.3
```

---

### 2.28 PerfModernizer

**Роль**: Modernize performance (e.g., async Celery)

```yaml
agent:
  name: PerfModernizer
  category: modernize
  priority: high
  
dependencies:
  tools:
    - cProfile
    - OpenTelemetry
    
triggers:
  - type: latency_high
    condition: p95_latency > 2s
  - type: throughput_low
    condition: rps < 100
    
execution:
  steps:
    - name: profile_bottlenecks
      command: py-spy record -o profile.svg -- python app/main.py
    - name: identify_optimization_opportunities
      llm_prompt: |
        Profiling data: ${profile_data}
        
        Suggest modernizations:
        - Convert sync to async
        - Add connection pooling
        - Implement caching
        - Use batch processing
    - name: implement_async_conversion
      example: |
        # Before
        def fetch_data():
            result = requests.get(url)
            return result.json()
        
        # After
        async def fetch_data():
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    return await response.json()
    - name: benchmark_improvements
      tool: locust
      command: locust -f locustfile.py --headless -u 100 -r 10
    - name: create_pr
      condition: throughput_increase > 30%
      labels: [performance, modernization]
      
metrics:
  throughput_gain: +30%
  latency_reduction: 40%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - mistralai/mistral-large-latest
  temperature: 0.2
```

---

### 2.29 DocModernizer

**Роль**: Update docs for new features

```yaml
agent:
  name: DocModernizer
  category: modernize
  priority: low
  
dependencies:
  tools:
    - Sphinx
    - mkdocs
    
triggers:
  - type: feature_merged
    branch: main
  - type: doc_staleness_alert
    condition: last_update > 30days
    
execution:
  steps:
    - name: analyze_code_changes
      command: git diff HEAD~10 --stat
    - name: identify_doc_updates_needed
      llm_prompt: |
        Code changes: ${changes}
        Existing docs: ${current_docs}
        
        Generate doc updates for:
        - New features
        - API changes
        - Configuration updates
    - name: update_documentation
      files:
        - README.md
        - docs/API_REFERENCE.md
        - docs/USER_GUIDE.md
    - name: regenerate_api_docs
      command: sphinx-apidoc -f -o docs/api backend/
    - name: build_docs
      command: mkdocs build
    - name: commit_updates
      message: "docs: update documentation for ${feature} [skip ci]"
      
metrics:
  doc_freshness: 95%
  coverage: +10%
  
llm_config:
  primary: openai/gpt-4o
  fallbacks:
    - meta-llama/llama-3.2-11b-vision-instruct
  temperature: 0.4
```

---

### 2.30 EcoOptimizer

**Роль**: Optimize ecological footprint (green models)

```yaml
agent:
  name: EcoOptimizer
  category: modernize
  priority: low
  
dependencies:
  tools:
    - codecarbon (carbon tracking)
    - ModelRouter
    
triggers:
  - type: cost_alert
    condition: cloud_cost_increase > 20%
  - type: sustainability_review
    schedule: quarterly
    
execution:
  steps:
    - name: measure_carbon_footprint
      command: codecarbon monitor --output carbon.csv
    - name: analyze_energy_usage
      llm_prompt: |
        Carbon emissions: ${emissions}
        Model usage: ${model_usage}
        
        Suggest green alternatives:
        - Smaller models for simple tasks
        - On-premise vs cloud tradeoff
        - Batch processing
    - name: recommend_model_changes
      priorities:
        - Use Phi-3-mini for simple queries
        - Batch similar requests
        - Cache aggressively
    - name: implement_changes
      actions:
        - Update ModelRouter priorities
        - Add request batching
        - Increase cache TTL
    - name: measure_impact
      metrics:
        - carbon_reduction
        - cost_savings
        - performance_impact
        
metrics:
  co2_footprint: -20%
  cost_savings: 15%
  
llm_config:
  primary: openai/gpt-4o-mini
  fallbacks:
    - google/gemma-2-2b-it
  temperature: 0.3
```

---

## 📊 Agent Orchestration (NEXUS_SUPERVISOR)

```python
# backend/agents/supervisor.py
from langchain.agents import AgentExecutor
from langgraph.graph import StateGraph, END
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class NexusSupervisor:
    """
    Central orchestrator for all 30 agents.
    Implements Plan-then-Execute, Human-in-Loop, and Intelligent Routing.
    """
    
    def __init__(self):
        self.agents = self._load_agents()
        self.registry = self._load_registry()
        self.policies = self._load_policies()
        self.model_router = ModelRouter(self.registry)
        self.graph = self._build_execution_graph()
        
    def _load_agents(self) -> Dict[str, Agent]:
        """Load all 30 agents from configuration."""
        agents = {}
        
        # Self-Heal Agents
        agents['port_collision_healer'] = PortCollisionHealer()
        agents['venv_restorer'] = VenvRestorer()
        agents['service_restarter'] = ServiceRestarter()
        agents['dependency_breaker_fixer'] = DependencyBreakerFixer()
        agents['log_anomaly_healer'] = LogAnomalyHealer()
        agents['cache_evictor'] = CacheEvictor()
        agents['index_rebuilder'] = IndexRebuilder()
        agents['backup_validator'] = BackupValidator()
        agents['network_resolver'] = NetworkResolver()
        agents['failsafe_switcher'] = FailsafeSwitcher()
        
        # Optimize Agents
        agents['lint_optimizer'] = LintOptimizer()
        agents['test_generator'] = TestGenerator()
        agents['migration_builder'] = MigrationBuilder()
        agents['data_normalizer'] = DataNormalizer()
        agents['query_optimizer'] = QueryOptimizer()
        agents['cache_tuner'] = CacheTuner()
        agents['resource_balancer'] = ResourceBalancer()
        agents['config_drifter'] = ConfigDrifter()
        agents['perf_profiler'] = PerfProfiler()
        agents['doc_updater'] = DocUpdater()
        
        # Modernize Agents
        agents['dep_updater'] = DepUpdater()
        agents['code_refactorer'] = CodeRefactorer()
        agents['feature_suggester'] = FeatureSuggester()
        agents['arch_evolver'] = ArchEvolver()
        agents['model_upgrader'] = ModelUpgrader()
        agents['security_hardener'] = SecurityHardener()
        agents['ui_enhancer'] = UIEnhancer()
        agents['perf_modernizer'] = PerfModernizer()
        agents['doc_modernizer'] = DocModernizer()
        agents['eco_optimizer'] = EcoOptimizer()
        
        return agents
    
    def _load_registry(self) -> Dict:
        """Load agent-to-model registry."""
        with open('backend/agents/registry.yaml') as f:
            return yaml.safe_load(f)
    
    def _load_policies(self) -> Dict:
        """Load execution policies."""
        with open('backend/agents/policies.yaml') as f:
            return yaml.safe_load(f)
    
    def _build_execution_graph(self) -> StateGraph:
        """Build LangGraph for agent orchestration."""
        graph = StateGraph()
        
        # Add nodes for each category
        graph.add_node("plan", self.plan_execution)
        graph.add_node("self_heal", self.route_self_heal)
        graph.add_node("optimize", self.route_optimize)
        graph.add_node("modernize", self.route_modernize)
        graph.add_node("verify", self.verify_execution)
        graph.add_node("escalate", self.escalate_to_human)
        
        # Add edges
        graph.add_edge("START", "plan")
        graph.add_conditional_edges(
            "plan",
            self.determine_category,
            {
                "self_heal": "self_heal",
                "optimize": "optimize",
                "modernize": "modernize"
            }
        )
        graph.add_edge("self_heal", "verify")
        graph.add_edge("optimize", "verify")
        graph.add_edge("modernize", "verify")
        graph.add_conditional_edges(
            "verify",
            self.check_success,
            {
                "success": END,
                "failure": "escalate",
                "retry": "plan"
            }
        )
        graph.add_edge("escalate", END)
        
        return graph.compile()
    
    async def execute_task(self, task: Dict[str, Any]) -> Dict:
        """
        Execute a task through the agent graph.
        
        Args:
            task: Task specification with type, context, priority
            
        Returns:
            Execution result with status, output, metrics
        """
        try:
            # Check policies
            if not self._check_policies(task):
                raise PolicyViolationError(f"Task violates policies: {task}")
            
            # Plan execution
            execution_plan = await self._plan_execution(task)
            
            # Execute through graph
            result = await self.graph.ainvoke({
                "task": task,
                "plan": execution_plan,
                "context": self._get_context(task)
            })
            
            # Audit log
            await self._audit_log(task, result)
            
            # Update metrics
            await self._update_metrics(task, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}", exc_info=True)
            await self._handle_failure(task, e)
            raise
    
    def _check_policies(self, task: Dict) -> bool:
        """Enforce policies (PII, billing, resources)."""
        user = task.get('user')
        
        # Resource limits
        if self._get_resource_usage() > self.policies['resource_limits']['max_concurrent_agents']:
            logger.warning("Max concurrent agents reached")
            return False
        
        # PII gate
        if task.get('requires_pii') and not user.has_role('view_pii'):
            logger.warning(f"User {user.id} lacks PII access")
            return False
        
        # Cost limits
        estimated_cost = self._estimate_cost(task)
        if estimated_cost > user.quota_remaining:
            logger.warning(f"User {user.id} quota exceeded")
            return False
        
        return True
    
    async def _plan_execution(self, task: Dict) -> Dict:
        """Plan-then-Execute: LLM creates execution plan."""
        prompt = f"""
        Task: {task['description']}
        Category: {task['category']}
        Priority: {task['priority']}
        
        Create a detailed execution plan:
        1. Steps required
        2. Agents to invoke
        3. Dependencies
        4. Rollback strategy
        5. Success criteria
        
        Consider risks and propose safeguards.
        """
        
        model = await self.model_router.select_model({
            'task_type': 'planning',
            'complexity': 'high'
        })
        
        response = await model.ainvoke(prompt)
        plan = self._parse_plan(response)
        
        # Human-in-loop for risky tasks
        if plan['risk_level'] == 'high':
            plan['requires_approval'] = True
            logger.info(f"Plan requires human approval: {plan}")
        
        return plan
    
    def determine_category(self, state: Dict) -> str:
        """Determine which category graph to route to."""
        task_type = state['task']['type']
        
        if task_type in ['alert', 'failure', 'health_check']:
            return 'self_heal'
        elif task_type in ['optimization', 'test_generation', 'profiling']:
            return 'optimize'
        elif task_type in ['dependency_update', 'refactoring', 'feature']:
            return 'modernize'
        else:
            return 'optimize'  # default
```

---

## 🔄 Model Selection Logic Implementation

Детальна реалізація в наступному документі: `MODEL_SELECTION_LOGIC_SPEC.md`

---

**Document Version**: 12.0  
**Last Updated**: 2025-01-06  
**Status**: ✅ **COMPLETE AGENT SPECIFICATION**

