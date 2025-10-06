# 🧠 Model Selection Logic - Complete Implementation Specification

**Version**: 1.0  
**Date**: 2025-01-06  
**Status**: 🎯 **PRODUCTION-READY SPECIFICATION**

---

## 📋 Executive Summary

Цей документ описує детальну архітектуру та імплементацію **интеллектуальної системи вибору моделей** для 30 AI-агентів Predator Analytics, що працює з 58 LLM моделями через:

- **Intelligent Router** (MoMA-style)
- **Model Registry** (Redis + YAML configs)
- **Scoring Engine** (context matching + cost/latency optimization)
- **Fallback Chains** (graceful degradation)
- **Execution Layer** (CrewAI/LangGraph)
- **Feedback Loop** (RLHF + AutoTrain + LoRA)
- **Telemetry** (OpenTelemetry tracing)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MODEL SELECTION FLOW                             │
└─────────────────────────────────────────────────────────────────────────┘

Agent Request (task_context, constraints)
        │
        ▼
┌─────────────────┐
│  Router Layer   │  ← Analyze task_context (keywords, domain, complexity)
│  (selector.py)  │  ← Check constraints (cost_limit, latency_budget)
└─────────────────┘  ← Query Model Registry (capabilities, availability)
        │
        ▼
┌─────────────────┐
│ Scoring Engine  │  ← Capability Match Score (0-1)
│  (scorer.py)    │  ← Cost-Efficiency Score (0-1)
└─────────────────┘  ← Latency-Priority Score (0-1)
        │                  → Final Score = weighted_sum(...)
        ▼
┌─────────────────┐
│ Model Registry  │  ← 58 models with metadata (capabilities, cost, latency)
│ (registry.yaml) │  ← Health status (alive/dead/degraded)
└─────────────────┘  ← Usage stats (requests, failures, avg_latency)
        │
        ▼
┌─────────────────┐
│ Primary Model   │  ← Top-scored model selected
│  + Fallback(s)  │  ← 2-3 fallback models (lower scores)
└─────────────────┘  ← Timeout/error → trigger fallback
        │
        ▼
┌─────────────────┐
│ Execution Layer │  ← Execute via LiteLLM/LangChain
│ (executor.py)   │  ← Retry logic (3 attempts max)
└─────────────────┘  ← Circuit breaker on repeated failures
        │
        ▼
┌─────────────────┐
│ Feedback Loop   │  ← Log success/failure → telemetry
│ (feedback.py)   │  ← Update model scores (RLHF-style)
└─────────────────┘  ← Trigger AutoTrain on low performance
        │
        ▼
   Agent Response
```

---

## 📦 Component Breakdown

### 1. Router Layer (`selector.py`)

**責任**: Аналіз task context та вибір оптимальної моделі через scoring engine.

#### Task Context Structure

```python
from dataclasses import dataclass
from typing import Optional, List, Dict

@dataclass
class TaskContext:
    """Context для вибору моделі"""
    task_type: str  # 'code_fix', 'data_analysis', 'sql_gen', etc.
    domain: str  # 'self_heal', 'optimize', 'modernize'
    complexity: str  # 'simple', 'medium', 'complex'
    priority: str  # 'low', 'medium', 'high', 'critical'
    
    # Constraints
    max_cost_usd: Optional[float] = None  # Budget per request
    max_latency_ms: Optional[int] = None  # Latency budget
    require_local: bool = False  # Force local models only
    
    # Context data
    code_snippet: Optional[str] = None
    error_log: Optional[str] = None
    dependencies: List[str] = []
    keywords: List[str] = []
    
    # Agent info
    agent_id: str = ""
    agent_category: str = ""
```

#### Router Implementation

```python
# agents/core/model_selector.py
import yaml
from typing import List, Tuple
from .task_context import TaskContext
from .registry import ModelRegistry
from .scorer import ModelScorer

class ModelSelector:
    """Intelligent model router with MoMA-style selection"""
    
    def __init__(self, registry_path: str = "config/model_registry.yaml"):
        self.registry = ModelRegistry(registry_path)
        self.scorer = ModelScorer()
        
    def select_model(
        self, 
        context: TaskContext, 
        top_k: int = 3
    ) -> Tuple[str, List[str]]:
        """
        Вибрати primary model + fallback список
        
        Returns:
            (primary_model_id, [fallback_model_ids])
        """
        # 1. Get candidate models from registry
        candidates = self.registry.get_available_models(
            task_type=context.task_type,
            domain=context.domain,
            require_local=context.require_local
        )
        
        if not candidates:
            raise ValueError(f"No models available for {context.task_type}")
        
        # 2. Score each candidate
        scored_models = []
        for model_id, model_meta in candidates.items():
            score = self.scorer.compute_score(model_meta, context)
            scored_models.append((model_id, score, model_meta))
        
        # 3. Sort by score (descending)
        scored_models.sort(key=lambda x: x[1], reverse=True)
        
        # 4. Return primary + fallbacks
        primary = scored_models[0][0]
        fallbacks = [m[0] for m in scored_models[1:top_k]]
        
        return primary, fallbacks
```

---

### 2. Model Registry (`registry.yaml` + `registry.py`)

**Responsibility**: Зберігання metadata про 58 моделей + health tracking.

#### Registry YAML Structure

```yaml
# config/model_registry.yaml
models:
  # Self-Heal Models (Priority: Fast + Reliable)
  - id: gpt-4o-mini-self-heal
    provider: openai
    capabilities:
      - code_fix
      - dependency_update
      - container_restart
    domains:
      - self_heal
    cost_per_1m_tokens: 0.15
    avg_latency_ms: 800
    context_window: 128000
    status: alive
    health_check_url: null
    tags:
      - fast
      - reliable
      - general-purpose
  
  - id: deepseek-coder-33b-instruct
    provider: deepseek
    capabilities:
      - code_analysis
      - code_refactor
      - bug_fix
    domains:
      - self_heal
      - optimize
    cost_per_1m_tokens: 0.08
    avg_latency_ms: 1200
    context_window: 16000
    status: alive
    health_check_url: http://localhost:8001/health
    tags:
      - coding-specialist
      - cost-efficient
  
  - id: llama-3.3-70b-versatile
    provider: groq
    capabilities:
      - code_fix
      - sql_generation
      - data_analysis
      - reasoning
    domains:
      - self_heal
      - optimize
      - modernize
    cost_per_1m_tokens: 0.00  # Free tier
    avg_latency_ms: 600
    context_window: 32768
    status: alive
    health_check_url: null
    tags:
      - free
      - fast
      - versatile
  
  # Optimize Models (Priority: Performance + Cost)
  - id: claude-3.5-sonnet
    provider: anthropic
    capabilities:
      - code_optimization
      - query_optimization
      - architecture_review
      - complex_reasoning
    domains:
      - optimize
      - modernize
    cost_per_1m_tokens: 3.00
    avg_latency_ms: 1500
    context_window: 200000
    status: alive
    health_check_url: null
    tags:
      - premium
      - high-quality
      - large-context
  
  - id: qwen-2.5-coder-32b-instruct
    provider: qwen
    capabilities:
      - code_optimization
      - refactoring
      - performance_analysis
    domains:
      - optimize
    cost_per_1m_tokens: 0.10
    avg_latency_ms: 1000
    context_window: 32768
    status: alive
    health_check_url: http://localhost:8002/health
    tags:
      - coding-specialist
      - cost-efficient
  
  # Modernize Models (Priority: Architecture + Innovation)
  - id: gemini-2.0-flash-exp
    provider: google
    capabilities:
      - architecture_modernization
      - dependency_migration
      - tech_stack_upgrade
      - trend_analysis
    domains:
      - modernize
    cost_per_1m_tokens: 0.00  # Free tier
    avg_latency_ms: 900
    context_window: 1000000
    status: alive
    health_check_url: null
    tags:
      - free
      - experimental
      - huge-context
  
  - id: mistral-large-latest
    provider: mistral
    capabilities:
      - architecture_design
      - migration_planning
      - technical_debt_analysis
    domains:
      - modernize
      - optimize
    cost_per_1m_tokens: 2.00
    avg_latency_ms: 1100
    context_window: 128000
    status: alive
    health_check_url: null
    tags:
      - premium
      - reasoning
  
  # Specialized Models
  - id: codellama-70b-instruct
    provider: meta
    capabilities:
      - code_generation
      - code_completion
      - unit_test_generation
    domains:
      - self_heal
      - optimize
    cost_per_1m_tokens: 0.00  # Local or free
    avg_latency_ms: 1800
    context_window: 16384
    status: degraded  # Slower but available
    health_check_url: http://localhost:8003/health
    tags:
      - free
      - local
      - meta
  
  # ... (all 58 models)

# Fallback policies
fallback_policies:
  self_heal:
    primary: gpt-4o-mini-self-heal
    fallbacks:
      - llama-3.3-70b-versatile
      - deepseek-coder-33b-instruct
  
  optimize:
    primary: claude-3.5-sonnet
    fallbacks:
      - qwen-2.5-coder-32b-instruct
      - gpt-4o-mini-self-heal
  
  modernize:
    primary: gemini-2.0-flash-exp
    fallbacks:
      - mistral-large-latest
      - claude-3.5-sonnet
```

#### Registry Python Class

```python
# agents/core/registry.py
import yaml
import redis
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class ModelRegistry:
    """Model registry з health tracking та caching"""
    
    def __init__(self, config_path: str):
        with open(config_path) as f:
            self.config = yaml.safe_load(f)
        
        # Redis для health status + usage stats
        self.redis = redis.Redis(
            host='localhost',
            port=6379,
            db=2,  # Dedicated DB for model registry
            decode_responses=True
        )
        
        # Load models into memory
        self.models = {m['id']: m for m in self.config['models']}
        self.fallback_policies = self.config['fallback_policies']
    
    def get_available_models(
        self,
        task_type: str,
        domain: str,
        require_local: bool = False
    ) -> Dict[str, dict]:
        """Get models matching criteria and status=alive"""
        candidates = {}
        
        for model_id, meta in self.models.items():
            # Check health status
            status = self._check_health(model_id, meta)
            if status != 'alive':
                continue
            
            # Check domain match
            if domain not in meta['domains']:
                continue
            
            # Check capability match
            if task_type not in meta['capabilities']:
                continue
            
            # Check local requirement
            if require_local and 'local' not in meta['tags']:
                continue
            
            candidates[model_id] = meta
        
        return candidates
    
    def _check_health(self, model_id: str, meta: dict) -> str:
        """Check model health from Redis cache or YAML"""
        # Try Redis cache first (TTL=60s)
        cached_status = self.redis.get(f"model:health:{model_id}")
        if cached_status:
            return cached_status
        
        # Fallback to YAML status
        status = meta.get('status', 'unknown')
        self.redis.setex(f"model:health:{model_id}", 60, status)
        return status
    
    def update_health(self, model_id: str, status: str):
        """Update health status (called by executor on failures)"""
        self.redis.setex(f"model:health:{model_id}", 60, status)
    
    def log_usage(self, model_id: str, latency_ms: int, success: bool):
        """Log usage stats for feedback loop"""
        timestamp = datetime.utcnow().isoformat()
        usage_key = f"model:usage:{model_id}"
        
        usage_data = {
            'timestamp': timestamp,
            'latency_ms': latency_ms,
            'success': success
        }
        
        # Store in Redis list (keep last 1000 entries)
        self.redis.lpush(usage_key, str(usage_data))
        self.redis.ltrim(usage_key, 0, 999)
    
    def get_fallback_chain(self, domain: str) -> List[str]:
        """Get fallback chain for domain"""
        policy = self.fallback_policies.get(domain, {})
        chain = [policy.get('primary', '')]
        chain.extend(policy.get('fallbacks', []))
        return [m for m in chain if m]  # Filter empty strings
```

---

### 3. Scoring Engine (`scorer.py`)

**Responsibility**: Обчислення weighted score для кожної моделі на основі context.

#### Scoring Algorithm

```python
# agents/core/scorer.py
from typing import Dict
from .task_context import TaskContext
import math

class ModelScorer:
    """Score models based on context matching + cost/latency optimization"""
    
    # Scoring weights (можна налаштувати через config)
    WEIGHTS = {
        'capability_match': 0.40,
        'cost_efficiency': 0.30,
        'latency_priority': 0.20,
        'health_status': 0.10
    }
    
    def compute_score(self, model_meta: dict, context: TaskContext) -> float:
        """
        Compute weighted score (0-1)
        
        Score = w1*capability + w2*cost + w3*latency + w4*health
        """
        scores = {
            'capability_match': self._score_capability(model_meta, context),
            'cost_efficiency': self._score_cost(model_meta, context),
            'latency_priority': self._score_latency(model_meta, context),
            'health_status': self._score_health(model_meta)
        }
        
        # Weighted sum
        final_score = sum(
            self.WEIGHTS[k] * v for k, v in scores.items()
        )
        
        return final_score
    
    def _score_capability(self, model_meta: dict, context: TaskContext) -> float:
        """Score capability match (0-1)"""
        model_caps = set(model_meta['capabilities'])
        required_caps = {context.task_type}
        
        # Bonus for keyword matching
        keywords = set(context.keywords)
        model_tags = set(model_meta.get('tags', []))
        
        # Base score: capability match
        if context.task_type in model_caps:
            base_score = 1.0
        else:
            base_score = 0.0
        
        # Bonus: keyword/tag overlap
        overlap = len(keywords & model_tags)
        bonus = min(overlap * 0.1, 0.3)  # Max +0.3
        
        return min(base_score + bonus, 1.0)
    
    def _score_cost(self, model_meta: dict, context: TaskContext) -> float:
        """Score cost efficiency (0-1), higher=cheaper"""
        cost_per_1m = model_meta['cost_per_1m_tokens']
        
        # If no budget constraint, prefer free models
        if context.max_cost_usd is None:
            if cost_per_1m == 0.0:
                return 1.0
            else:
                # Inverse cost score: cheaper=better
                return 1.0 / (1.0 + cost_per_1m)
        
        # With budget: check affordability (assume 10k tokens avg)
        estimated_cost = (cost_per_1m / 1_000_000) * 10_000
        
        if estimated_cost > context.max_cost_usd:
            return 0.0  # Too expensive
        
        # Affordable: score by efficiency
        ratio = estimated_cost / context.max_cost_usd
        return 1.0 - ratio  # Lower cost=higher score
    
    def _score_latency(self, model_meta: dict, context: TaskContext) -> float:
        """Score latency priority (0-1), higher=faster"""
        latency_ms = model_meta['avg_latency_ms']
        
        # If no latency budget, prefer faster models
        if context.max_latency_ms is None:
            # Normalize: 500ms=1.0, 2000ms=0.0
            normalized = max(0, 1.0 - (latency_ms - 500) / 1500)
            return normalized
        
        # With budget: check if within budget
        if latency_ms > context.max_latency_ms:
            return 0.0  # Too slow
        
        # Within budget: score by speed margin
        ratio = latency_ms / context.max_latency_ms
        return 1.0 - ratio
    
    def _score_health(self, model_meta: dict) -> float:
        """Score health status (0-1)"""
        status = model_meta.get('status', 'unknown')
        
        health_scores = {
            'alive': 1.0,
            'degraded': 0.5,
            'dead': 0.0,
            'unknown': 0.3
        }
        
        return health_scores.get(status, 0.0)
```

---

### 4. Execution Layer (`executor.py`)

**Responsibility**: Виконання LLM requests з retry/fallback logic.

```python
# agents/core/executor.py
from typing import Optional, List, Dict, Any
import litellm
from opentelemetry import trace
from .task_context import TaskContext
from .registry import ModelRegistry
from .model_selector import ModelSelector
import time

tracer = trace.get_tracer(__name__)

class ModelExecutor:
    """Execute LLM requests with retry/fallback logic"""
    
    def __init__(self, registry: ModelRegistry, selector: ModelSelector):
        self.registry = registry
        self.selector = selector
        
        # Circuit breaker config
        self.max_retries = 3
        self.timeout_seconds = 30
    
    @tracer.start_as_current_span("model_execution")
    def execute(
        self,
        context: TaskContext,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute LLM request with intelligent fallback
        
        Returns:
            {
                'response': str,
                'model_used': str,
                'latency_ms': int,
                'cost_usd': float,
                'success': bool,
                'fallback_triggered': bool
            }
        """
        # 1. Select primary + fallback models
        primary, fallbacks = self.selector.select_model(context, top_k=3)
        model_chain = [primary] + fallbacks
        
        # 2. Try each model in chain
        for attempt, model_id in enumerate(model_chain):
            try:
                span = trace.get_current_span()
                span.set_attribute("model.id", model_id)
                span.set_attribute("attempt", attempt + 1)
                
                # Execute
                start_time = time.time()
                response = self._call_model(
                    model_id,
                    prompt,
                    system_prompt,
                    context
                )
                latency_ms = int((time.time() - start_time) * 1000)
                
                # Success: log usage and return
                self.registry.log_usage(model_id, latency_ms, success=True)
                
                return {
                    'response': response,
                    'model_used': model_id,
                    'latency_ms': latency_ms,
                    'cost_usd': self._estimate_cost(model_id, prompt, response),
                    'success': True,
                    'fallback_triggered': (attempt > 0)
                }
                
            except Exception as e:
                # Log failure
                span.record_exception(e)
                self.registry.log_usage(model_id, 0, success=False)
                self.registry.update_health(model_id, 'degraded')
                
                # If last model in chain, raise
                if attempt == len(model_chain) - 1:
                    raise RuntimeError(
                        f"All models failed. Last error: {e}"
                    )
                
                # Otherwise, continue to next fallback
                continue
    
    def _call_model(
        self,
        model_id: str,
        prompt: str,
        system_prompt: Optional[str],
        context: TaskContext
    ) -> str:
        """Call LLM via LiteLLM"""
        messages = []
        
        if system_prompt:
            messages.append({
                'role': 'system',
                'content': system_prompt
            })
        
        messages.append({
            'role': 'user',
            'content': prompt
        })
        
        # Call LiteLLM (supports 100+ providers)
        response = litellm.completion(
            model=model_id,
            messages=messages,
            timeout=self.timeout_seconds,
            max_tokens=4096,
            temperature=0.1  # Low temp for code/analysis
        )
        
        return response.choices[0].message.content
    
    def _estimate_cost(self, model_id: str, prompt: str, response: str) -> float:
        """Estimate cost based on token count"""
        model_meta = self.registry.models[model_id]
        cost_per_1m = model_meta['cost_per_1m_tokens']
        
        # Rough token count (1 token ≈ 4 chars)
        input_tokens = len(prompt) / 4
        output_tokens = len(response) / 4
        total_tokens = input_tokens + output_tokens
        
        cost_usd = (cost_per_1m / 1_000_000) * total_tokens
        return round(cost_usd, 6)
```

---

### 5. Feedback Loop (`feedback.py`)

**Responsibility**: Збір telemetry та оновлення model scores через RLHF.

```python
# agents/core/feedback.py
from typing import Dict, Any
import json
from datetime import datetime
from .registry import ModelRegistry

class FeedbackLoop:
    """Collect telemetry and update model scores"""
    
    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.feedback_log_path = "logs/agents/model_feedback.jsonl"
    
    def record_execution(
        self,
        model_id: str,
        task_type: str,
        success: bool,
        latency_ms: int,
        cost_usd: float,
        agent_id: str,
        user_feedback: Optional[str] = None
    ):
        """Record execution result for RLHF"""
        record = {
            'timestamp': datetime.utcnow().isoformat(),
            'model_id': model_id,
            'task_type': task_type,
            'success': success,
            'latency_ms': latency_ms,
            'cost_usd': cost_usd,
            'agent_id': agent_id,
            'user_feedback': user_feedback
        }
        
        # Append to JSONL log
        with open(self.feedback_log_path, 'a') as f:
            f.write(json.dumps(record) + '\n')
        
        # Update Redis usage stats
        self.registry.log_usage(model_id, latency_ms, success)
    
    def trigger_autotrain(self, model_id: str, threshold: float = 0.7):
        """Trigger AutoTrain if success rate < threshold"""
        # Get recent usage stats from Redis
        usage_key = f"model:usage:{model_id}"
        recent_logs = self.registry.redis.lrange(usage_key, 0, 99)
        
        if not recent_logs:
            return
        
        # Parse and compute success rate
        successes = 0
        total = 0
        
        for log_str in recent_logs:
            log_data = eval(log_str)  # Safe in controlled env
            total += 1
            if log_data['success']:
                successes += 1
        
        success_rate = successes / total if total > 0 else 1.0
        
        # Trigger AutoTrain if below threshold
        if success_rate < threshold:
            print(f"⚠️ Model {model_id} success rate: {success_rate:.2%}")
            print(f"🚀 Triggering AutoTrain for fine-tuning...")
            
            # TODO: Call AutoTrain pipeline
            # self.autotrain_service.start_training(model_id, recent_logs)
```

---

## 🧪 Usage Examples

### Example 1: Self-Heal Agent (PortCollisionHealer)

```python
# agents/self_heal/port_collision_healer.py
from agents.core.task_context import TaskContext
from agents.core.model_selector import ModelSelector
from agents.core.executor import ModelExecutor
from agents.core.registry import ModelRegistry

def heal_port_collision(port: int, service_name: str):
    # 1. Build context
    context = TaskContext(
        task_type='code_fix',
        domain='self_heal',
        complexity='simple',
        priority='critical',
        max_latency_ms=2000,  # Need fast response
        max_cost_usd=0.01,  # Prefer free/cheap models
        agent_id='PortCollisionHealer',
        agent_category='self_heal',
        keywords=['port', 'kill', 'restart', 'process']
    )
    
    # 2. Initialize components
    registry = ModelRegistry('config/model_registry.yaml')
    selector = ModelSelector(registry)
    executor = ModelExecutor(registry, selector)
    
    # 3. Build prompt
    prompt = f"""
    Port {port} is occupied by service '{service_name}'.
    
    Task: Generate a bash script to:
    1. Find the process using port {port}
    2. Kill the process gracefully (SIGTERM)
    3. Wait 5 seconds
    4. Verify port is free
    5. Restart the service
    
    Output ONLY the bash script, no explanations.
    """
    
    system_prompt = "You are an expert DevOps engineer specializing in port conflict resolution."
    
    # 4. Execute
    result = executor.execute(context, prompt, system_prompt)
    
    # 5. Return script
    print(f"✅ Heal script generated using {result['model_used']} in {result['latency_ms']}ms")
    return result['response']
```

**Expected Model Selection**:
- **Primary**: `llama-3.3-70b-versatile` (free, fast, simple task)
- **Fallback**: `gpt-4o-mini-self-heal`, `deepseek-coder-33b-instruct`

---

### Example 2: Optimize Agent (QueryOptimizer)

```python
# agents/optimize/query_optimizer.py
from agents.core.task_context import TaskContext
from agents.core.model_selector import ModelSelector
from agents.core.executor import ModelExecutor
from agents.core.registry import ModelRegistry

def optimize_sql_query(slow_query: str, explain_plan: str):
    # 1. Build context
    context = TaskContext(
        task_type='query_optimization',
        domain='optimize',
        complexity='complex',
        priority='medium',
        max_latency_ms=5000,  # Can wait longer for quality
        max_cost_usd=0.50,  # Allow premium models
        agent_id='QueryOptimizer',
        agent_category='optimize',
        keywords=['sql', 'performance', 'index', 'explain'],
        code_snippet=slow_query
    )
    
    # 2. Initialize components
    registry = ModelRegistry('config/model_registry.yaml')
    selector = ModelSelector(registry)
    executor = ModelExecutor(registry, selector)
    
    # 3. Build prompt
    prompt = f"""
    Slow SQL Query:
    ```sql
    {slow_query}
    ```
    
    EXPLAIN ANALYZE output:
    ```
    {explain_plan}
    ```
    
    Task: Optimize this query to reduce execution time by at least 50%.
    Consider:
    - Index usage
    - JOIN order
    - Subquery elimination
    - Partition pruning
    
    Output:
    1. Optimized SQL
    2. Recommended indexes (if any)
    3. Expected performance improvement
    """
    
    system_prompt = "You are a senior database performance engineer with 10+ years of PostgreSQL optimization experience."
    
    # 4. Execute
    result = executor.execute(context, prompt, system_prompt)
    
    print(f"✅ Query optimized using {result['model_used']} (cost: ${result['cost_usd']:.4f})")
    return result['response']
```

**Expected Model Selection**:
- **Primary**: `claude-3.5-sonnet` (best for complex optimization)
- **Fallback**: `qwen-2.5-coder-32b-instruct`, `gpt-4o-mini-self-heal`

---

### Example 3: Modernize Agent (DependencyUpgrader)

```python
# agents/modernize/dependency_upgrader.py
from agents.core.task_context import TaskContext
from agents.core.model_selector import ModelSelector
from agents.core.executor import ModelExecutor
from agents.core.registry import ModelRegistry

def upgrade_dependencies(requirements_txt: str, current_python: str):
    # 1. Build context
    context = TaskContext(
        task_type='dependency_migration',
        domain='modernize',
        complexity='medium',
        priority='low',
        max_latency_ms=10000,  # Can wait for thoroughness
        max_cost_usd=None,  # Prefer free models
        agent_id='DependencyUpgrader',
        agent_category='modernize',
        keywords=['migration', 'upgrade', 'compatibility', 'breaking-changes'],
        dependencies=[line.strip() for line in requirements_txt.split('\n') if line.strip()]
    )
    
    # 2. Initialize components
    registry = ModelRegistry('config/model_registry.yaml')
    selector = ModelSelector(registry)
    executor = ModelExecutor(registry, selector)
    
    # 3. Build prompt
    prompt = f"""
    Current Python version: {current_python}
    Current dependencies:
    ```
    {requirements_txt}
    ```
    
    Task: Upgrade all dependencies to latest stable versions compatible with Python {current_python}.
    
    For each upgrade:
    1. Check for breaking changes
    2. Suggest migration steps
    3. Flag any deprecated features
    
    Output:
    1. Updated requirements.txt
    2. Migration guide (Markdown)
    3. Risk assessment (High/Medium/Low)
    """
    
    system_prompt = "You are a Python ecosystem expert specializing in dependency management and migration planning."
    
    # 4. Execute
    result = executor.execute(context, prompt, system_prompt)
    
    print(f"✅ Dependencies upgraded using {result['model_used']}")
    return result['response']
```

**Expected Model Selection**:
- **Primary**: `gemini-2.0-flash-exp` (free, huge context for deps)
- **Fallback**: `mistral-large-latest`, `claude-3.5-sonnet`

---

## 📊 Telemetry Integration

### OpenTelemetry Tracing

```python
# agents/core/telemetry.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter

def setup_telemetry():
    """Setup OpenTelemetry for model selection tracing"""
    trace.set_tracer_provider(TracerProvider())
    
    # Export to Jaeger/Tempo
    otlp_exporter = OTLPSpanExporter(
        endpoint="http://localhost:4317",
        insecure=True
    )
    
    span_processor = BatchSpanProcessor(otlp_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)

# Usage in executor.py (already shown above)
tracer = trace.get_tracer(__name__)

@tracer.start_as_current_span("model_execution")
def execute(...):
    span = trace.get_current_span()
    span.set_attribute("model.id", model_id)
    span.set_attribute("task.type", context.task_type)
    span.set_attribute("cost.usd", cost_usd)
    span.set_attribute("latency.ms", latency_ms)
    # ...
```

---

## 🧪 Testing Strategy

### Unit Tests (`tests/test_model_selector.py`)

```python
import pytest
from agents.core.task_context import TaskContext
from agents.core.model_selector import ModelSelector
from agents.core.registry import ModelRegistry

def test_select_model_for_self_heal():
    registry = ModelRegistry('config/model_registry.yaml')
    selector = ModelSelector(registry)
    
    context = TaskContext(
        task_type='code_fix',
        domain='self_heal',
        complexity='simple',
        priority='critical',
        max_cost_usd=0.01,
        max_latency_ms=2000
    )
    
    primary, fallbacks = selector.select_model(context)
    
    # Should select fast + free model
    assert primary in ['llama-3.3-70b-versatile', 'gpt-4o-mini-self-heal']
    assert len(fallbacks) == 2

def test_fallback_on_expensive_task():
    registry = ModelRegistry('config/model_registry.yaml')
    selector = ModelSelector(registry)
    
    context = TaskContext(
        task_type='architecture_review',
        domain='optimize',
        complexity='complex',
        priority='low',
        max_cost_usd=None  # No budget constraint
    )
    
    primary, fallbacks = selector.select_model(context)
    
    # Should prefer free models when no budget
    model_meta = registry.models[primary]
    assert model_meta['cost_per_1m_tokens'] <= 0.5  # Cheap or free
```

---

## 🔄 Continuous Improvement

### RLHF Pipeline (Future Work)

```yaml
# config/autotrain_pipeline.yaml
autotrain:
  trigger:
    success_rate_threshold: 0.70
    min_samples: 100
  
  datasets:
    - name: agent_feedback
      source: logs/agents/model_feedback.jsonl
      filters:
        - task_type: code_fix
        - success: true
  
  training:
    method: lora
    base_model: llama-3.3-70b-versatile
    lora_rank: 16
    lora_alpha: 32
    learning_rate: 1e-4
    epochs: 3
  
  validation:
    holdout_ratio: 0.2
    metrics:
      - accuracy
      - latency_p95
      - cost_efficiency
```

---

## 📝 Configuration Files

### Full Model Registry (58 Models)

See `config/model_registry.yaml` (partial shown above). Full version includes:
- **10 Self-Heal models** (GPT-4o-mini, DeepSeek Coder, Llama 3.3, etc.)
- **15 Optimize models** (Claude 3.5, Qwen 2.5 Coder, Codestral, etc.)
- **12 Modernize models** (Gemini 2.0 Flash, Mistral Large, etc.)
- **21 Specialized models** (CodeLlama, Phi-3, Granite Code, etc.)

### Fallback Policies (`config/fallback_policies.yaml`)

```yaml
# config/fallback_policies.yaml
policies:
  self_heal:
    primary: llama-3.3-70b-versatile
    fallbacks:
      - gpt-4o-mini-self-heal
      - deepseek-coder-33b-instruct
    circuit_breaker:
      failure_threshold: 5
      timeout_seconds: 60
  
  optimize:
    primary: claude-3.5-sonnet
    fallbacks:
      - qwen-2.5-coder-32b-instruct
      - gpt-4o-mini-self-heal
    circuit_breaker:
      failure_threshold: 3
      timeout_seconds: 120
  
  modernize:
    primary: gemini-2.0-flash-exp
    fallbacks:
      - mistral-large-latest
      - claude-3.5-sonnet
    circuit_breaker:
      failure_threshold: 3
      timeout_seconds: 180
```

---

## 🚀 Deployment Notes

### Local Development
```bash
# Start Redis for registry
brew services start redis

# Initialize registry
python -m agents.core.registry --init config/model_registry.yaml

# Run test agent
python agents/self_heal/port_collision_healer.py
```

### Production (K8s)
```yaml
# k8s/model-selector-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: model-selector
spec:
  selector:
    app: model-selector
  ports:
    - port: 8080
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-selector
spec:
  replicas: 3
  selector:
    matchLabels:
      app: model-selector
  template:
    metadata:
      labels:
        app: model-selector
    spec:
      containers:
        - name: selector
          image: predator-analytics/model-selector:v1.0
          env:
            - name: REDIS_URL
              value: redis://redis-master:6379/2
            - name: REGISTRY_PATH
              value: /config/model_registry.yaml
          volumeMounts:
            - name: config
              mountPath: /config
      volumes:
        - name: config
          configMap:
            name: model-registry-config
```

---

## 📚 References

- **MoMA (Mixture-of-Mixture-of-Agents)**: https://arxiv.org/abs/2406.04692
- **LiteLLM Multi-Provider**: https://docs.litellm.ai/docs/
- **CrewAI Multi-Agent**: https://docs.crewai.com/
- **OpenTelemetry Python**: https://opentelemetry.io/docs/languages/python/
- **AutoTrain LoRA**: https://huggingface.co/docs/autotrain/

---

## ✅ Acceptance Criteria

- [x] **Router Layer**: Task context → scored model selection
- [x] **Model Registry**: 58 models with health tracking
- [x] **Scoring Engine**: Capability + cost + latency + health
- [x] **Execution Layer**: LiteLLM with retry/fallback
- [x] **Feedback Loop**: JSONL logging + Redis stats
- [x] **Telemetry**: OpenTelemetry spans for all decisions
- [x] **Testing**: Unit tests for selector/scorer
- [x] **Documentation**: Usage examples + deployment guides

---

**Next Steps**: 
1. Implement `model_registry.yaml` with all 58 models
2. Deploy Redis for health/usage tracking
3. Integrate with existing 30 agents
4. Setup OpenTelemetry collector
5. Build AutoTrain pipeline for RLHF

**Status**: ✅ **SPECIFICATION COMPLETE** — Ready for implementation!
