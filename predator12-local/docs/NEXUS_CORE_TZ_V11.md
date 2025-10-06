# 📊 Predator Analytics (Nexus Core) - Technical Specification v11.0

**Date**: 2025-01-06  
**Project**: Predator Analytics - Multi-Agent Analytics Platform  
**Version**: 11.0 Local-First Extended Revision  
**Status**: 🎯 **COMPREHENSIVE SPECIFICATION**

---

## 🎯 Executive Summary

**Predator Analytics (Nexus Core)** is a production-grade, self-improving multi-agent analytics platform that processes customs declarations, tax invoices, registries, Telegram data, and various file formats (PDF/Excel/CSV) to detect anomalies, schemes, and forecasts while generating personalized insights.

### Key Differentiators

- 🎮 **Unified Command Center**: Single web interface ("Пульт Керування") integrating all functionality
- 🤖 **30 AI Agents + 58 LLM Models**: Intelligent routing with MoMA-style selection
- 🚀 **Local-First Development**: Zero Docker/Helm locally, full stack with F5
- 📈 **Self-Improving**: Continuous learning through LoRA, AutoTrain, and feedback loops
- 🔒 **Zero-Trust Security**: PII masking, RBAC, audit trails, SBOM signing
- 📊 **Multi-Source Analytics**: PostgreSQL, OpenSearch, Qdrant, MinIO, Kafka

### Current Focus vs. Future

| Aspect | Now (Local-First) | Future (Production) |
|--------|-------------------|---------------------|
| **Services** | brew/apt (PG, Redis, Qdrant, OS) | Docker/Helm/ArgoCD |
| **Launch** | F5 "Run Both" | Canary/Blue-Green Rollouts |
| **Agents** | 30 agents + 58 models local | Distributed K8s pods |
| **GitOps** | Manual scripts | ArgoCD/Tekton automation |
| **DR** | Local backups | RPO≤15min, RTO≤30min |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXUS CORE - UNIFIED COMMAND CENTER                   │
│                         (Single Web Interface)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │   3D/2D      │  │  Data Feed   │  │  Simulator   │                 │
│  │  Dashboard   │  │  (Anomalies) │  │  (What-If)   │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Agent Map   │  │   Billing    │  │   Upload     │                 │
│  │ (vis-network)│  │  (Unlock PII)│  │  Progress    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │            AI Terminal (OpenWebUI - Chat Interface)              │  │
│  │  Natural language queries + RAG + PDF/Excel upload + Viz         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │       Analytics Deck (OpenSearch Dashboard - iframes)            │  │
│  │  Kibana-style dashboards + filters + saved views + raw mode      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER (FastAPI)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  API Routes  │  Auth  │  WebSocket  │  Celery Tasks  │  Telemetry      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MULTI-AGENT ORCHESTRATION (MAS)                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  NEXUS_SUPERVISOR (Central Orchestrator)                       │    │
│  │  Routes tasks, enforces PII/billing gates, monitors health     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Data Agents │  │Query Agents  │  │ Analysis     │                 │
│  │ (10 agents)  │  │ (5 agents)   │  │ Agents       │                 │
│  │              │  │              │  │ (7 agents)   │                 │
│  │ Ingest       │  │ SearchPlanner│  │ Anomaly      │                 │
│  │ Registry     │  │ ModelRouter  │  │ Forecast     │                 │
│  │ Indexer      │  │ Arbiter      │  │ Graph        │                 │
│  │ OSINT        │  │ BillingGate  │  │ Report       │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Self-Heal    │  │ Self-Optimize│  │Self-Modernize│                 │
│  │ (10 agents)  │  │ (10 agents)  │  │ (10 agents)  │                 │
│  │              │  │              │  │              │                 │
│  │ AutoHeal     │  │ Test Gen     │  │ Dep Updates  │                 │
│  │ SelfDiagnosis│  │ Migration Gen│  │ Framework    │                 │
│  │ RedTeam      │  │ Code Lint    │  │ Migrator     │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     MODEL DISTRIBUTION (58 LLM Models)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Model Router (Intelligent Selection)                          │    │
│  │  • MoMA routing logic                                          │    │
│  │  • Context/resource/accuracy scoring                           │    │
│  │  • Fallback chains                                             │    │
│  │  • Real-time profiler updates                                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Primary      │  │ Fallback     │  │ Specialized  │                 │
│  │              │  │              │  │              │                 │
│  │ GPT-4o       │  │ Claude-3.5   │  │ Code: Qwen   │                 │
│  │ Claude-3.5   │  │ Llama-3.3    │  │ Vision: Phi  │                 │
│  │ Gemini-2.0   │  │ DeepSeek-V3  │  │ Embed: BGE   │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER (Storage & Search)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ PostgreSQL   │  │ OpenSearch   │  │   Qdrant     │                 │
│  │ TimescaleDB  │  │ (Full-text)  │  │ (Vectors)    │                 │
│  │ (Structured) │  │              │  │              │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │    Redis     │  │    MinIO     │  │    Kafka     │                 │
│  │   (Cache)    │  │  (Objects)   │  │  (Events)    │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY & SECURITY LAYER                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Prometheus   │  │   Grafana    │  │ Loki/Tempo   │                 │
│  │  (Metrics)   │  │ (Dashboard)  │  │ (Logs/Trace) │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │  Keycloak    │  │    Vault     │  │ OPA/Kyverno  │                 │
│  │ (IAM/RBAC)   │  │  (Secrets)   │  │  (Policies)  │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎮 Unified Command Center (Пульт Керування)

### Overview

The **Command Center** is the single web interface that integrates all functionality:

1. **3D/2D Dashboard** (Three.js with 2D fallback)
2. **Data Feed** (Instagram-like anomaly stream)
3. **Simulator** (What-if scenario modeling)
4. **Agent Map** (Real-time agent visualization)
5. **Upload Manager** (Drag-drop with progress)
6. **Billing Toggle** ("Unlock PII" button)
7. **AI Terminal** (OpenWebUI chat interface)
8. **Analytics Deck** (OpenSearch Dashboard iframes)
9. **Morning Newspaper** (Personalized daily feed)
10. **Chrono-Spatial 3D Map** (Time slider + risk clusters)

### Technology Stack

```typescript
// frontend/package.json
{
  "name": "nexus-command-center",
  "version": "11.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "zustand": "^4.5.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.95.0",
    "d3": "^7.8.0",
    "vis-network": "^9.1.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    "react-dropzone": "^14.2.0",
    "socket.io-client": "^4.6.0",
    "recharts": "^2.10.0",
    "plotly.js": "^2.27.0"
  }
}
```

### Key Features

#### 1. Dashboard Module
```typescript
// frontend/components/Dashboard/Dashboard3D.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D } from '@react-three/drei';

export function Dashboard3D({ data, fallback2D = false }) {
  const [is3DSupported, setIs3DSupported] = useState(true);
  
  useEffect(() => {
    // Detect WebGL support
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl || fallback2D) {
      setIs3DSupported(false);
    }
  }, [fallback2D]);

  if (!is3DSupported) {
    return <Dashboard2D data={data} />;
  }

  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <ambientLight intensity={0.5} />
      <OrbitControls />
      {/* 3D visualization nodes */}
      {data.map(node => (
        <mesh key={node.id} position={node.position}>
          <sphereGeometry args={[node.size, 32, 32]} />
          <meshStandardMaterial color={node.riskLevel} />
        </mesh>
      ))}
    </Canvas>
  );
}
```

#### 2. Data Feed (Anomaly Stream)
```typescript
// frontend/components/Feed/DataFeed.tsx
export function DataFeed() {
  const [anomalies, setAnomalies] = useState([]);
  const socket = useSocket('/ws/feed');

  useEffect(() => {
    socket.on('anomaly', (data) => {
      setAnomalies(prev => [data, ...prev].slice(0, 50));
    });
  }, [socket]);

  return (
    <div className="feed-container">
      {anomalies.map(anomaly => (
        <AnomalyCard 
          key={anomaly.id}
          title={anomaly.title}
          description={anomaly.description}
          riskLevel={anomaly.risk}
          evidence={anomaly.evidence}
          onDrill={() => drillDown(anomaly)}
        />
      ))}
    </div>
  );
}
```

#### 3. AI Terminal (OpenWebUI Integration)
```typescript
// frontend/components/AITerminal/Terminal.tsx
export function AITerminal() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');

  const handleSubmit = async () => {
    const response = await fetch('/api/v1/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        context: 'nexus',
        rag_enabled: true
      })
    });
    
    const result = await response.json();
    setMessages(prev => [...prev, 
      { role: 'user', content: query },
      { role: 'assistant', content: result.response }
    ]);
  };

  return (
    <div className="terminal">
      <MessageList messages={messages} />
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && handleSubmit()}
        placeholder="Ask me anything... (e.g., Show import schemes from Poland 2023)"
      />
    </div>
  );
}
```

#### 4. PII Unlock Interface
```typescript
// frontend/components/Billing/PIIToggle.tsx
export function PIIToggle() {
  const { user, hasPIIAccess } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUnlock = async () => {
    if (!user.roles.includes('view_pii')) {
      setShowUpgradeModal(true);
      return;
    }

    // Audit log the disclosure
    await fetch('/api/v1/audit/pii-disclosure', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        timestamp: new Date().toISOString(),
        reason: 'manual_unlock'
      })
    });

    // Unlock PII display
    store.setState({ piiUnlocked: true });
  };

  return (
    <button 
      onClick={handleUnlock}
      className={hasPIIAccess ? 'unlock-btn' : 'upgrade-btn'}
    >
      {hasPIIAccess ? '🔓 Unlock PII' : '⬆️ Upgrade to Pro'}
    </button>
  );
}
```

---

## 🤖 Multi-Agent System (30 Agents)

### Agent Categories

#### Data Agents (10)
1. **DatasetIngestAgent**: Import CSV/XLSX, Great Expectations validation, PG staging
2. **DatasetRegistryAgent**: Register datasets, create index templates/ISM/aliases
3. **IndexerAgent**: Normalize, PII mask, index to OpenSearch/Qdrant
4. **OSINTAgent**: Telegram/web parsing, NER enrichment, vectorization
5. **GraphIntelligenceAgent**: Build/analyze graphs (NetworkX centrality)
6. **DataQualityAgent**: Continuous validation, anomaly detection in schema
7. **EntityResolutionAgent**: Deduplicate, link entities across sources
8. **GeoEnrichmentAgent**: Geocoding, spatial clustering
9. **SchemaEvolutionAgent**: Track schema changes, suggest migrations
10. **LineageTrackerAgent**: Data lineage DAGs, impact analysis

#### Query Agents (5)
1. **SearchPlannerAgent**: Route queries (PG/OS/Qdrant/ML optimal path)
2. **ModelRouterAgent**: LLM selection (context/resource/accuracy/historical)
3. **ArbiterAgent**: Compare 5 models in parallel, select/assemble best response
4. **BillingGateAgent**: Enforce quotas, PII-gate, disclosure audit
5. **QueryOptimizerAgent**: Rewrite queries for performance, cache suggestions

#### Analysis Agents (7)
1. **AnomalyDetectionAgent**: IsolationForest/AutoEncoder + SHAP explanations
2. **ForecastAgent**: Prophet/LightGBM/XGBoost trends, confidence intervals
3. **ReportExportAgent**: CSV/PNG/PDF/PPTX, "Morning Newspaper", signed MinIO URLs
4. **PatternMiningAgent**: Frequent itemsets, association rules
5. **RiskScoringAgent**: Multi-factor risk models, real-time scoring
6. **ComplianceAgent**: Regulatory checks, flag violations
7. **SentimentAgent**: NLP sentiment on text data (Telegram, reports)

#### Self-Heal Agents (10)
1. **AutoHealAgent**: Alert response (restart/scale/rollback playbooks)
2. **SelfDiagnosisAgent**: Failure classification, stack analysis, similar incidents
3. **RedTeamAgent**: Continuous pentest, vulnerability reports
4. **PortCollisionAgent**: Graceful kill SIGTERM→SIGKILL, whitelist ports
5. **VenvRestoreAgent**: Detect dead venv, recreate from requirements.txt
6. **ServiceHealthAgent**: Monitor PG/Redis/Qdrant/OS, auto-restart
7. **DependencyValidatorAgent**: Check requirements.txt/package.json sync
8. **ConfigAuditorAgent**: Validate .env, detect missing secrets
9. **CertificateRenewalAgent**: Monitor TLS expiry, auto-renew
10. **BackupValidatorAgent**: Test restore, integrity checks

#### Self-Optimize Agents (10)
1. **TestGeneratorAgent**: Unit/integration tests from code (pytest/jest)
2. **MigrationGeneratorAgent**: Alembic migrations from schema changes
3. **CodeLinterAgent**: Ruff/Black/Prettier automation, dry-run mode
4. **PerformanceProfilerAgent**: CPU/memory hotspots, optimization suggestions
5. **QueryLearnerAgent**: Fine-tune on user query patterns, improve search
6. **BundleSizeOptimizerAgent**: Webpack/Vite analysis, tree-shaking suggestions
7. **CachingOptimizerAgent**: Redis/CDN recommendations, hit rate analysis
8. **ImageOptimizerAgent**: Compress, WebP conversion
9. **DocumentationGeneratorAgent**: Docstrings, OpenAPI specs from code
10. **APIResponseOptimizerAgent**: Payload compression, pagination tuning

#### Self-Modernize Agents (10)
1. **DependencyUpdaterAgent**: Automated PRs with [auto-deps] tags
2. **FrameworkMigratorAgent**: React upgrades, API deprecation fixes
3. **PythonVersionMigratorAgent**: 3.11→3.12 compatibility checks
4. **TypeHintGeneratorAgent**: Add mypy types, improve coverage
5. **ESMModuleConverterAgent**: CommonJS→ESM migration
6. **DockerImageUpdaterAgent**: Base image security patches
7. **CICDPipelineOptimizerAgent**: Parallel jobs, caching improvements
8. **K8sManifestValidatorAgent**: Resource limits, readiness probes (future)
9. **SecurityScannerAgent**: Trivy/Snyk integration, CVE alerts
10. **LicenseComplianceAgent**: GPL/MIT compatibility checks

### NEXUS_SUPERVISOR (Central Orchestrator)

```python
# backend/agents/supervisor.py
from langchain.agents import AgentExecutor
from langgraph.graph import StateGraph

class NexusSupervisor:
    """Central orchestrator for all 30 agents."""
    
    def __init__(self):
        self.agents = {}
        self.registry = self.load_registry()
        self.policies = self.load_policies()
        self.graph = self.build_graph()
        
    def load_registry(self):
        """Load agent → model mappings from registry.yaml."""
        with open('backend/agents/registry.yaml') as f:
            return yaml.safe_load(f)
    
    def load_policies(self):
        """Load execution policies from policies.yaml."""
        with open('backend/agents/policies.yaml') as f:
            return yaml.safe_load(f)
    
    def build_graph(self):
        """Build LangGraph for task routing."""
        graph = StateGraph()
        
        # Add nodes for each agent category
        graph.add_node("data_agents", self.route_data_agents)
        graph.add_node("query_agents", self.route_query_agents)
        graph.add_node("analysis_agents", self.route_analysis_agents)
        graph.add_node("self_heal", self.route_self_heal)
        graph.add_node("self_optimize", self.route_self_optimize)
        graph.add_node("self_modernize", self.route_self_modernize)
        
        # Add edges for task flow
        graph.add_edge("START", "data_agents")
        graph.add_edge("data_agents", "query_agents")
        graph.add_edge("query_agents", "analysis_agents")
        
        return graph.compile()
    
    async def execute_task(self, task: dict):
        """Execute a task through the agent graph."""
        # Check policies and quotas
        if not self.check_policies(task):
            raise PolicyViolationError("Task violates policies")
        
        # Route to appropriate agent category
        result = await self.graph.ainvoke({
            "task": task,
            "context": self.get_context(task)
        })
        
        # Audit and log
        await self.audit_log(task, result)
        
        return result
    
    def check_policies(self, task: dict) -> bool:
        """Enforce PII gates, billing limits, resource quotas."""
        user = task.get('user')
        
        # PII gate
        if task.get('requires_pii') and not user.has_role('view_pii'):
            return False
        
        # Billing gate
        if task.get('cost') > user.quota_remaining:
            return False
        
        # Resource limits
        if self.get_resource_usage() > self.policies['max_resources']:
            return False
        
        return True
```

---

## 📊 Model Distribution (58 LLM Models)

### Model Selection Logic

```python
# backend/agents/model_router.py
from typing import List, Dict
import numpy as np
from sklearn.ensemble import RandomForestRegressor

class ModelRouter:
    """Intelligent LLM routing with MoMA-style selection."""
    
    def __init__(self):
        self.registry = self.load_model_registry()
        self.profiler = ModelProfiler()
        self.scorer = ScoringEngine()
        self.fallback_chains = self.build_fallback_chains()
        
    async def select_model(self, task: dict) -> str:
        """Select optimal model for task."""
        # Step 1: Intent classification
        intent = await self.classify_intent(task)
        
        # Step 2: Get candidate models
        candidates = self.get_candidates(intent, top_k=3)
        
        # Step 3: Score candidates
        scores = await self.scorer.score_models(
            candidates=candidates,
            task=task,
            context={
                'latency_budget': task.get('latency_ms', 3000),
                'accuracy_required': task.get('accuracy', 0.85),
                'cost_limit': task.get('max_cost', 0.01)
            }
        )
        
        # Step 4: Select best (threshold > 0.7)
        best = max(scores, key=lambda x: x['score'])
        if best['score'] < 0.7:
            return self.fallback_chains[intent][0]
        
        return best['model']
    
    async def classify_intent(self, task: dict) -> str:
        """Classify task intent using lightweight LLM."""
        prompt = f"""Classify the following task intent:
        Task: {task['description']}
        
        Categories:
        - reasoning: Complex multi-step logic
        - coding: Code generation/analysis
        - translation: Language translation
        - vision: Image analysis
        - embedding: Text vectorization
        - fast_ui: Real-time UI response
        
        Return only the category name.
        """
        
        response = await self.call_classifier(prompt)
        return response.strip().lower()
    
    def get_candidates(self, intent: str, top_k: int = 3) -> List[str]:
        """Get top-k models for intent from registry."""
        models = self.registry.get(intent, [])
        return models[:top_k]
    
    def build_fallback_chains(self) -> Dict[str, List[str]]:
        """Define fallback chains per intent."""
        return {
            'reasoning': [
                'openai/gpt-4o',
                'anthropic/claude-3.5-sonnet',
                'meta-llama/llama-3.3-70b-instruct'
            ],
            'coding': [
                'qwen/qwq-32b-preview',
                'deepseek/deepseek-coder-v2-lite',
                'mistralai/codestral-latest'
            ],
            'fast_ui': [
                'mistralai/ministral-3b',
                'microsoft/phi-3-mini-4k',
                'google/gemma-2-2b'
            ],
            'vision': [
                'meta-llama/llama-3.2-11b-vision-instruct',
                'microsoft/phi-3.5-vision-instruct'
            ],
            'embedding': [
                'BAAI/bge-m3',
                'sentence-transformers/all-MiniLM-L6-v2'
            ]
        }


class ScoringEngine:
    """Score models based on weighted criteria."""
    
    def __init__(self):
        self.weights = {
            'context_match': 0.4,
            'resource_fit': 0.25,
            'historical_perf': 0.2,
            'dependency_score': 0.15
        }
        self.ml_regressor = self.load_regressor()
    
    async def score_models(
        self, 
        candidates: List[str], 
        task: dict, 
        context: dict
    ) -> List[Dict]:
        """Score each candidate model."""
        scores = []
        
        for model in candidates:
            profile = await self.profiler.get_profile(model)
            
            # Calculate sub-scores
            context_match = self.calculate_context_match(
                task, model, profile
            )
            resource_fit = self.calculate_resource_fit(
                context, profile
            )
            historical_perf = self.get_historical_performance(
                model, task['type']
            )
            dependency_score = self.check_dependencies(model)
            
            # Weighted score
            total_score = (
                self.weights['context_match'] * context_match +
                self.weights['resource_fit'] * resource_fit +
                self.weights['historical_perf'] * historical_perf +
                self.weights['dependency_score'] * dependency_score
            )
            
            # ML regressor refinement
            features = np.array([[
                context_match, 
                resource_fit, 
                historical_perf, 
                dependency_score,
                profile['avg_latency'],
                profile['avg_cost']
            ]])
            ml_score = self.ml_regressor.predict(features)[0]
            
            # Combined score
            final_score = 0.7 * total_score + 0.3 * ml_score
            
            scores.append({
                'model': model,
                'score': final_score,
                'breakdown': {
                    'context': context_match,
                    'resource': resource_fit,
                    'historical': historical_perf,
                    'dependency': dependency_score,
                    'ml_prediction': ml_score
                }
            })
        
        return sorted(scores, key=lambda x: x['score'], reverse=True)
```

### Model Registry (registry.yaml)

```yaml
# backend/agents/registry.yaml
model_registry:
  # Reasoning Models
  reasoning:
    - model: openai/gpt-4o
      provider: openai
      context_window: 128000
      cost_per_1k_tokens: 0.005
      avg_latency_ms: 1200
      accuracy_score: 0.95
      fallback: anthropic/claude-3.5-sonnet
      
    - model: anthropic/claude-3.5-sonnet
      provider: anthropic
      context_window: 200000
      cost_per_1k_tokens: 0.003
      avg_latency_ms: 1500
      accuracy_score: 0.94
      fallback: meta-llama/llama-3.3-70b-instruct
      
    - model: meta-llama/llama-3.3-70b-instruct
      provider: fireworks
      context_window: 128000
      cost_per_1k_tokens: 0.0009
      avg_latency_ms: 800
      accuracy_score: 0.88
      fallback: null

  # Coding Models
  coding:
    - model: qwen/qwq-32b-preview
      provider: fireworks
      context_window: 32768
      cost_per_1k_tokens: 0.0009
      avg_latency_ms: 600
      accuracy_score: 0.91
      fallback: deepseek/deepseek-coder-v2-lite
      
    - model: deepseek/deepseek-coder-v2-lite
      provider: deepseek
      context_window: 163840
      cost_per_1k_tokens: 0.00014
      avg_latency_ms: 400
      accuracy_score: 0.87
      fallback: mistralai/codestral-latest

  # Fast UI Models
  fast_ui:
    - model: mistralai/ministral-3b
      provider: fireworks
      context_window: 128000
      cost_per_1k_tokens: 0.00004
      avg_latency_ms: 150
      accuracy_score: 0.75
      fallback: microsoft/phi-3-mini-4k
      
    - model: microsoft/phi-3-mini-4k
      provider: fireworks
      context_window: 4096
      cost_per_1k_tokens: 0.00004
      avg_latency_ms: 120
      accuracy_score: 0.72
      fallback: google/gemma-2-2b

  # Vision Models
  vision:
    - model: meta-llama/llama-3.2-11b-vision-instruct
      provider: fireworks
      context_window: 128000
      cost_per_1k_tokens: 0.0002
      avg_latency_ms: 1800
      accuracy_score: 0.88
      fallback: microsoft/phi-3.5-vision-instruct
      
    - model: microsoft/phi-3.5-vision-instruct
      provider: fireworks
      context_window: 128000
      cost_per_1k_tokens: 0.0002
      avg_latency_ms: 1500
      accuracy_score: 0.85
      fallback: null

  # Embedding Models
  embedding:
    - model: BAAI/bge-m3
      provider: local
      dimensions: 1024
      avg_latency_ms: 50
      fallback: sentence-transformers/all-MiniLM-L6-v2
      
    - model: sentence-transformers/all-MiniLM-L6-v2
      provider: local
      dimensions: 384
      avg_latency_ms: 30
      fallback: null

# Agent-to-Model Mapping
agent_models:
  DatasetIngestAgent:
    primary: openai/gpt-4o
    fallbacks:
      - anthropic/claude-3.5-sonnet
      - meta-llama/llama-3.3-70b-instruct
    embed: BAAI/bge-m3
    
  SearchPlannerAgent:
    primary: openai/gpt-4o
    fallbacks:
      - google/gemini-2.0-flash-exp
      - meta-llama/llama-3.3-70b-instruct
    embed: BAAI/bge-m3
    
  ModelRouterAgent:
    primary: openai/gpt-4o-mini
    fallbacks:
      - mistralai/ministral-3b
    embed: null
    
  ArbiterAgent:
    models:
      - openai/gpt-4o
      - anthropic/claude-3.5-sonnet
      - google/gemini-2.0-flash-exp
      - meta-llama/llama-3.3-70b-instruct
      - deepseek/deepseek-chat
    selection_strategy: parallel_consensus
    
  AutoHealAgent:
    primary: meta-llama/llama-3.3-70b-instruct
    fallbacks:
      - qwen/qwen-2.5-72b-instruct
    embed: null
    
  TestGeneratorAgent:
    primary: qwen/qwq-32b-preview
    fallbacks:
      - deepseek/deepseek-coder-v2-lite
      - mistralai/codestral-latest
    embed: null
    
  DependencyUpdaterAgent:
    primary: qwen/qwen-2.5-coder-32b-instruct
    fallbacks:
      - deepseek/deepseek-coder-v2-lite
    embed: null
```

### Agent Policies (policies.yaml)

```yaml
# backend/agents/policies.yaml
policies:
  # Resource Limits
  resource_limits:
    cpu_per_agent: "500m"
    memory_per_agent: "1Gi"
    max_concurrent_agents: 10
    timeout_seconds: 300
    
  # Rate Limits
  rate_limits:
    requests_per_minute: 60
    tokens_per_hour: 1000000
    cost_per_day: 100.0
    
  # Priority Levels
  priorities:
    critical: 1  # Self-heal, security
    high: 2      # User queries, analysis
    normal: 3    # Optimization, reports
    low: 4       # Modernization, background tasks
    
  # Degradation Strategy
  degradation:
    on_high_load:
      - disable_low_priority_agents
      - use_faster_models
      - increase_cache_ttl
      
    on_model_failure:
      - use_fallback_chain
      - retry_with_backoff: [1s, 5s, 15s]
      - escalate_to_human: 3_failures
      
    on_cost_limit:
      - switch_to_local_models
      - enable_aggressive_caching
      - queue_non_critical_tasks
      
  # PII Protection
  pii_masks:
    default_mask: true
    hash_algorithm: sha256
    pepper_env_var: PII_PEPPER
    
  pii_roles:
    - view_pii
    - export_pii
    - admin
    
  pii_audit:
    log_all_disclosures: true
    retention_days: 730  # 2 years
    
  # Billing Gates
  billing_tiers:
    free:
      queries_per_day: 100
      pii_access: false
      export_formats: [csv]
      
    pro:
      queries_per_day: 10000
      pii_access: true
      export_formats: [csv, pdf, pptx]
      
    enterprise:
      queries_per_day: unlimited
      pii_access: true
      export_formats: [csv, pdf, pptx, api]
      custom_models: true
      
  # Human-in-the-Loop
  human_review_required:
    - migration_generation
    - dependency_updates
    - schema_changes
    - security_policy_changes
    
  # Sandbox Constraints
  sandbox:
    docker_enabled: true
    network_isolation: true
    no_git_write: true
    no_system_calls: true
    
  # Telemetry
  telemetry:
    otel_enabled: true
    trace_sampling_rate: 0.1  # 10%
    metrics_interval_seconds: 30
    log_level: INFO
```

---

## 📊 Data Lifecycle

### Flow Diagram

```
┌──────────────┐
│   Upload     │  User uploads CSV/PDF/Excel/Telegram data
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Ingest     │  DatasetIngestAgent: Parse, validate (Great Expectations)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Staging     │  Store in PostgreSQL staging table
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Register    │  DatasetRegistryAgent: Create index template/ISM/alias
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Index      │  IndexerAgent: Normalize, PII mask, index OS/Qdrant
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│           Multi-Source Query Layer               │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │    PG    │  │    OS    │  │  Qdrant  │      │
│  │(Struct)  │  │(Full-txt)│  │ (Vector) │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  SearchPlannerAgent: Route optimal query path   │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│            Analysis Layer                        │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Anomaly  │  │ Forecast │  │  Graph   │      │
│  │ (IForest)│  │(Prophet) │  │(NetworkX)│      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  ArbiterAgent: Compare 5 models, select best    │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│            Insight Generation                    │
│                                                  │
│  • "Morning Newspaper" (personalized feed)      │
│  • Export (CSV/PDF/PPTX) via MinIO signed URLs  │
│  • Real-time dashboard updates (WebSocket)      │
│  • Audit logs (PII disclosures)                 │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│         Self-Learning Loop                       │
│                                                  │
│  • SyntheticDataAgent: Generate training data   │
│  • LoRATrainer: Fine-tune models (MLflow track) │
│  • ModelRouter: Update registry with new models │
│  • QueryPatternLearner: Improve search quality  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites

```bash
# macOS
brew install python@3.11 node postgresql redis qdrant opensearch minio keycloak

# Linux
sudo apt install python3.11 nodejs postgresql redis qdrant opensearch minio keycloak
```

### Setup

```bash
# 1. Clone repository
git clone https://github.com/yourorg/predator-analytics.git
cd predator-analytics

# 2. Bootstrap environment
make bootstrap

# 3. Start services
make start

# 4. Launch VS Code and press F5
code .
# Select: "🚀 Run Both"
```

### Makefile Targets

```makefile
# Makefile
.PHONY: bootstrap start stop test lint clean

bootstrap:
	@echo "🔧 Setting up Predator Analytics..."
	@python3.11 -m venv .venv
	@.venv/bin/pip install -r backend/requirements-311-modern.txt
	@cd frontend && npm install
	@brew services start postgresql redis qdrant opensearch minio keycloak
	@./scripts/init-databases.sh

start:
	@echo "🚀 Starting Nexus Core..."
	@brew services start postgresql redis qdrant opensearch minio keycloak
	@.venv/bin/uvicorn backend.app.main:app --reload --port 8000 &
	@cd frontend && npm run dev &
	@.venv/bin/python backend/agents/supervisor.py &

stop:
	@echo "🛑 Stopping services..."
	@pkill -f uvicorn
	@pkill -f "npm run dev"
	@pkill -f supervisor.py
	@brew services stop postgresql redis qdrant opensearch minio keycloak

test:
	@echo "🧪 Running tests..."
	@.venv/bin/pytest backend/tests/ -v
	@cd frontend && npm test

lint:
	@echo "🔍 Linting code..."
	@.venv/bin/ruff check .
	@.venv/bin/black --check .
	@cd frontend && npm run lint

clean:
	@echo "🧹 Cleaning up..."
	@rm -rf .venv node_modules backend/__pycache__
	@brew services stop postgresql redis qdrant opensearch minio keycloak
```

---

## 📖 Documentation Index

This is the primary specification document. Additional documentation:

- **[NEXUS_CORE_ARCHITECTURE.md](NEXUS_CORE_ARCHITECTURE.md)** - Detailed architecture
- **[AGENT_IMPLEMENTATION_GUIDE.md](AGENT_IMPLEMENTATION_GUIDE.md)** - Agent development guide
- **[MODEL_ROUTER_SPEC.md](MODEL_ROUTER_SPEC.md)** - Model selection logic
- **[API_REFERENCE.md](API_REFERENCE.md)** - FastAPI endpoints
- **[COMMAND_CENTER_UI.md](COMMAND_CENTER_UI.md)** - Frontend components
- **[DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md)** - Future K8s deployment
- **[SECURITY_GUIDE.md](SECURITY_GUIDE.md)** - Zero-Trust implementation
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and fixes

---

## 🎯 Acceptance Criteria

### Performance
- [ ] Dashboard p95 latency < 3s at ≥1B docs (cache enabled)
- [ ] 500-700MB CSV import E2E ≤ 5min (raw→Parquet→PG→OS/Qdrant)
- [ ] 3D visualization FPS ≥ 30 on recommended hardware
- [ ] Search autocomplete < 200ms

### Self-Healing
- [ ] 5 chaos scenarios pass (pod kill, node failure, MinIO/Keycloak pause)
- [ ] AutoHeal restarts services within 30s
- [ ] SelfDiagnosis classifies failures with 85% accuracy

### PII & Security
- [ ] PII masked by default (sha256+pepper)
- [ ] Unlock audit logged with user/timestamp/reason
- [ ] RBAC enforced (view_pii role required)
- [ ] SBOM generated and signed (cosign)
- [ ] Trivy/CodeQL/DAST scans pass

### ML & Agents
- [ ] Canary deployment promotes better models automatically
- [ ] Drift monitoring alerts on accuracy drop > 5%
- [ ] Arbiter consensus from 5 models completes < 10s
- [ ] Model router selects optimal LLM with score > 0.7
- [ ] Fallback chain activated on primary failure < 2s

### DR & Backups (Future)
- [ ] RPO ≤ 15min (continuous backups)
- [ ] RTO ≤ 30min (verified restore)
- [ ] Quarterly DR drills pass

### Accessibility
- [ ] Lighthouse score ≥ 90 (Perf/Best/Acc/SEO)
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader compatible

### DevEx
- [ ] `make start` launches full stack locally
- [ ] F5 "Run Both" works in VS Code
- [ ] Breakpoints hit in backend/frontend
- [ ] Hot reload functional

---

## 📊 Project Timeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    NEXUS CORE IMPLEMENTATION                      │
└──────────────────────────────────────────────────────────────────┘

Phase 1: Foundation (Weeks 1-4)
├── ✅ Repository structure
├── ✅ Backend (FastAPI + Celery + PG)
├── ✅ Frontend (React + Next.js)
├── ✅ VS Code F5 debug
└── ✅ Local services (brew/apt)

Phase 2: Data Layer (Weeks 5-8)
├── ⚠️ OpenSearch integration
├── ⚠️ Qdrant vector store
├── ⚠️ MinIO object storage
├── ⚠️ Kafka event streaming
└── ⚠️ Great Expectations validation

Phase 3: Agent Framework (Weeks 9-12)
├── ⚠️ NEXUS_SUPERVISOR orchestrator
├── ⚠️ registry.yaml + policies.yaml
├── ⚠️ Model router + scoring engine
├── ⚠️ Arbiter consensus logic
└── ⚠️ 10 core agents (data + query)

Phase 4: Command Center UI (Weeks 13-16)
├── ⚠️ 3D/2D dashboard (Three.js)
├── ⚠️ Data feed (anomaly stream)
├── ⚠️ AI Terminal (OpenWebUI)
├── ⚠️ Analytics Deck (OS Dashboard iframes)
└── ⚠️ PII unlock interface

Phase 5: Self-Improving Agents (Weeks 17-20)
├── ⚠️ 10 self-heal agents
├── ⚠️ 10 self-optimize agents
├── ⚠️ 10 self-modernize agents
└── ⚠️ Telemetry + feedback loops

Phase 6: ML & Analysis (Weeks 21-24)
├── ⚠️ Anomaly detection (IsolationForest)
├── ⚠️ Forecasting (Prophet/LightGBM)
├── ⚠️ Graph intelligence (NetworkX)
├── ⚠️ LoRA fine-tuning pipeline
└── ⚠️ MLflow experiment tracking

Phase 7: Security & Compliance (Weeks 25-28)
├── ⚠️ Keycloak OIDC/RBAC/MFA
├── ⚠️ Vault secret rotation
├── ⚠️ OPA/Kyverno policies
├── ⚠️ SBOM + cosign signing
└── ⚠️ PII masking + audit logs

Phase 8: Testing & Documentation (Weeks 29-32)
├── ⚠️ E2E acceptance tests
├── ⚠️ Chaos engineering (LitmusChaos)
├── ⚠️ Load testing (500-700MB CSV)
├── ⚠️ Comprehensive documentation
└── ⚠️ Runbooks + ADRs

Future: Production Deployment (Q2 2025)
├── ⚠️ Helm umbrella chart
├── ⚠️ ArgoCD + Tekton CI/CD
├── ⚠️ K8s (K3s/RKE2/GKE)
├── ⚠️ Canary/blue-green rollouts
└── ⚠️ DR drills (RPO≤15min, RTO≤30min)

Current Status: Phase 1 Complete, Phase 2-8 In Progress
```

---

## 🎉 Conclusion

**Predator Analytics (Nexus Core) v11.0** is a comprehensive, production-ready specification for a self-improving multi-agent analytics platform with:

- ✅ **Unified Command Center** (single web interface)
- ✅ **30 AI Agents + 58 LLM Models** (intelligent routing)
- ✅ **Local-first development** (F5 → full stack)
- ✅ **Zero-Trust security** (PII masking, RBAC, audit)
- ✅ **Self-improving capabilities** (LoRA, AutoTrain, feedback loops)
- ✅ **Future-ready architecture** (Helm/ArgoCD/K8s planned)

**Next Steps:**
1. Review and approve this specification
2. Begin Phase 2 (Data Layer) implementation
3. Set up CI/CD pipelines
4. Start agent framework development
5. Build Command Center UI prototype

---

**Document Version**: 11.0  
**Last Updated**: 2025-01-06  
**Status**: ✅ **READY FOR IMPLEMENTATION**

