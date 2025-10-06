"""
Agent Router and Model Selector
===============================

Intelligent routing and model selection for agents.
"""

import logging
from typing import Dict, List, Optional, Any, Type
from dataclasses import dataclass
from enum import Enum
import json

from .base import BaseAgent, AgentTask, TaskPriority, RiskLevel

logger = logging.getLogger(__name__)

class ModelType(Enum):
    """Types of AI models"""
    LANGUAGE_MODEL = "language_model"
    VISION_MODEL = "vision_model"
    CODE_MODEL = "code_model"
    EMBEDDING_MODEL = "embedding_model"
    LOCAL_MODEL = "local_model"

@dataclass
class ModelMetadata:
    """Metadata for AI models"""
    name: str
    model_type: ModelType
    provider: str  # openai, anthropic, local, etc.
    cost_per_token: float
    latency_ms: float
    context_window: int
    capabilities: List[str]
    reliability_score: float  # 0.0 - 1.0
    max_concurrent_requests: int
    
    def calculate_score(self, criteria: Dict[str, float]) -> float:
        """Calculate weighted score based on criteria"""
        score = 0.0
        
        # Cost factor (lower is better)
        if 'cost_weight' in criteria:
            cost_score = max(0, 1 - (self.cost_per_token / 0.1))  # Normalize to $0.10 per token
            score += criteria['cost_weight'] * cost_score
        
        # Latency factor (lower is better)
        if 'latency_weight' in criteria:
            latency_score = max(0, 1 - (self.latency_ms / 10000))  # Normalize to 10s
            score += criteria['latency_weight'] * latency_score
        
        # Reliability factor
        if 'reliability_weight' in criteria:
            score += criteria['reliability_weight'] * self.reliability_score
        
        # Context window factor
        if 'context_weight' in criteria:
            context_score = min(1.0, self.context_window / 32000)  # Normalize to 32k
            score += criteria['context_weight'] * context_score
        
        return score

class ModelSelector:
    """Selects optimal models based on task requirements"""
    
    def __init__(self):
        self.models: Dict[str, ModelMetadata] = {}
        self._load_model_registry()
    
    def _load_model_registry(self):
        """Load model metadata registry"""
        # Language models
        self.models['gpt-4'] = ModelMetadata(
            name='gpt-4',
            model_type=ModelType.LANGUAGE_MODEL,
            provider='openai',
            cost_per_token=0.03,
            latency_ms=2000,
            context_window=8192,
            capabilities=['reasoning', 'coding', 'analysis', 'planning'],
            reliability_score=0.95,
            max_concurrent_requests=100
        )
        
        self.models['gpt-3.5-turbo'] = ModelMetadata(
            name='gpt-3.5-turbo',
            model_type=ModelType.LANGUAGE_MODEL,
            provider='openai',
            cost_per_token=0.002,
            latency_ms=1000,
            context_window=4096,
            capabilities=['reasoning', 'coding', 'analysis'],
            reliability_score=0.90,
            max_concurrent_requests=200
        )
        
        self.models['claude-3-sonnet'] = ModelMetadata(
            name='claude-3-sonnet',
            model_type=ModelType.LANGUAGE_MODEL,
            provider='anthropic',
            cost_per_token=0.015,
            latency_ms=1500,
            context_window=200000,
            capabilities=['reasoning', 'analysis', 'planning', 'safety'],
            reliability_score=0.93,
            max_concurrent_requests=50
        )
        
        self.models['local-llama'] = ModelMetadata(
            name='local-llama',
            model_type=ModelType.LOCAL_MODEL,
            provider='local',
            cost_per_token=0.0,
            latency_ms=5000,
            context_window=2048,
            capabilities=['reasoning', 'coding'],
            reliability_score=0.80,
            max_concurrent_requests=5
        )
        
        # Code-specific models
        self.models['codellama'] = ModelMetadata(
            name='codellama',
            model_type=ModelType.CODE_MODEL,
            provider='local',
            cost_per_token=0.0,
            latency_ms=3000,
            context_window=4096,
            capabilities=['coding', 'debugging', 'refactoring'],
            reliability_score=0.85,
            max_concurrent_requests=10
        )
    
    def select_model(self, 
                    task: AgentTask, 
                    agent_type: str,
                    required_capabilities: List[str] = None,
                    preferences: Dict[str, float] = None) -> str:
        """Select optimal model for task"""
        
        required_capabilities = required_capabilities or []
        preferences = preferences or {
            'cost_weight': 0.3,
            'latency_weight': 0.3,
            'reliability_weight': 0.4
        }
        
        # Filter models by capabilities
        candidate_models = []
        for model_name, metadata in self.models.items():
            if all(cap in metadata.capabilities for cap in required_capabilities):
                candidate_models.append((model_name, metadata))
        
        if not candidate_models:
            logger.warning(f"No models found with capabilities {required_capabilities}, using default")
            return 'gpt-3.5-turbo'
        
        # Score models based on task requirements
        scored_models = []
        for model_name, metadata in candidate_models:
            # Adjust preferences based on task
            task_preferences = self._adjust_preferences_for_task(task, agent_type, preferences)
            score = metadata.calculate_score(task_preferences)
            scored_models.append((model_name, metadata, score))
        
        # Sort by score (highest first)
        scored_models.sort(key=lambda x: x[2], reverse=True)
        
        selected_model = scored_models[0][0]
        logger.info(f"Selected model {selected_model} for {agent_type} task {task.name}")
        
        return selected_model
    
    def _adjust_preferences_for_task(self, 
                                   task: AgentTask, 
                                   agent_type: str,
                                   base_preferences: Dict[str, float]) -> Dict[str, float]:
        """Adjust model selection preferences based on task characteristics"""
        preferences = base_preferences.copy()
        
        # High priority tasks prefer reliability over cost
        if task.priority in [TaskPriority.HIGH, TaskPriority.CRITICAL, TaskPriority.EMERGENCY]:
            preferences['reliability_weight'] = 0.6
            preferences['cost_weight'] = 0.1
            preferences['latency_weight'] = 0.3
        
        # High risk tasks prefer most reliable models
        if task.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            preferences['reliability_weight'] = 0.7
            preferences['cost_weight'] = 0.1
            preferences['latency_weight'] = 0.2
        
        # Self-healing tasks need fast response
        if agent_type == 'self_heal':
            preferences['latency_weight'] = 0.5
            preferences['reliability_weight'] = 0.4
            preferences['cost_weight'] = 0.1
        
        # Optimization tasks can use more cost-effective models
        if agent_type == 'optimize':
            preferences['cost_weight'] = 0.4
            preferences['reliability_weight'] = 0.3
            preferences['latency_weight'] = 0.3
        
        # Modernization tasks prefer advanced models
        if agent_type == 'modernize':
            preferences['context_weight'] = 0.3
            preferences['reliability_weight'] = 0.4
            preferences['cost_weight'] = 0.2
            preferences['latency_weight'] = 0.1
        
        return preferences
    
    def get_fallback_models(self, primary_model: str, agent_type: str) -> List[str]:
        """Get fallback models for a primary model"""
        primary_metadata = self.models.get(primary_model)
        if not primary_metadata:
            return ['gpt-3.5-turbo', 'local-llama']
        
        # Find models with similar capabilities but lower cost/latency requirements
        fallbacks = []
        
        for model_name, metadata in self.models.items():
            if model_name == primary_model:
                continue
            
            # Check if model has overlapping capabilities
            capability_overlap = set(metadata.capabilities) & set(primary_metadata.capabilities)
            if len(capability_overlap) >= len(primary_metadata.capabilities) * 0.5:
                fallbacks.append(model_name)
        
        # Sort fallbacks by reliability
        fallbacks.sort(key=lambda x: self.models[x].reliability_score, reverse=True)
        
        # Always include local model as final fallback
        if 'local-llama' not in fallbacks:
            fallbacks.append('local-llama')
        
        return fallbacks[:3]  # Limit to 3 fallbacks

class AgentRouter:
    """Routes tasks to appropriate agents"""
    
    def __init__(self):
        self.agents: Dict[str, Type[BaseAgent]] = {}
        self.agent_capabilities: Dict[str, List[str]] = {}
        self.agent_priorities: Dict[str, Dict[str, float]] = {}
        self.model_selector = ModelSelector()
    
    def register_agent(self, 
                      agent_class: Type[BaseAgent], 
                      capabilities: List[str],
                      priority_weights: Dict[str, float] = None):
        """Register an agent with its capabilities"""
        agent_name = agent_class.__name__
        self.agents[agent_name] = agent_class
        self.agent_capabilities[agent_name] = capabilities
        self.agent_priorities[agent_name] = priority_weights or {}
        
        logger.info(f"Registered agent {agent_name} with capabilities: {capabilities}")
    
    def route_task(self, task: AgentTask) -> Optional[str]:
        """Route task to most appropriate agent"""
        
        # Extract task characteristics
        task_type = task.context.get('type', 'general')
        required_capabilities = task.context.get('required_capabilities', [])
        domain = task.context.get('domain', 'general')
        
        # Score agents based on task fit
        agent_scores = []
        
        for agent_name, capabilities in self.agent_capabilities.items():
            score = self._calculate_agent_score(
                agent_name, 
                task, 
                capabilities, 
                required_capabilities
            )
            
            if score > 0:
                agent_scores.append((agent_name, score))
        
        if not agent_scores:
            logger.warning(f"No suitable agent found for task {task.name}")
            return None
        
        # Sort by score (highest first)
        agent_scores.sort(key=lambda x: x[1], reverse=True)
        
        selected_agent = agent_scores[0][0]
        logger.info(f"Routed task {task.name} to agent {selected_agent}")
        
        return selected_agent
    
    def _calculate_agent_score(self, 
                             agent_name: str, 
                             task: AgentTask,
                             agent_capabilities: List[str],
                             required_capabilities: List[str]) -> float:
        """Calculate how well an agent fits a task"""
        
        score = 0.0
        
        # Capability matching
        if required_capabilities:
            capability_matches = len(set(agent_capabilities) & set(required_capabilities))
            capability_score = capability_matches / len(required_capabilities)
            score += capability_score * 0.5
        else:
            score += 0.5  # No specific requirements
        
        # Task type matching
        task_type = task.context.get('type', 'general')
        
        # Self-healing agents
        if 'self_heal' in agent_name.lower():
            if task_type in ['recovery', 'repair', 'restart', 'fix']:
                score += 0.3
            if task.priority in [TaskPriority.CRITICAL, TaskPriority.EMERGENCY]:
                score += 0.2
        
        # Optimization agents
        elif 'optim' in agent_name.lower():
            if task_type in ['optimize', 'improve', 'enhance', 'tune']:
                score += 0.3
            if 'performance' in task.description.lower():
                score += 0.2
        
        # Modernization agents
        elif 'modern' in agent_name.lower():
            if task_type in ['modernize', 'upgrade', 'migrate', 'refactor']:
                score += 0.3
            if task.risk_level in [RiskLevel.MEDIUM, RiskLevel.HIGH]:
                score += 0.1  # Modernization often involves risk
        
        # Domain-specific bonuses
        domain = task.context.get('domain', 'general')
        if domain in agent_name.lower():
            score += 0.2
        
        # Priority-based adjustments
        priority_weights = self.agent_priorities.get(agent_name, {})
        if task.priority.name.lower() in priority_weights:
            score *= priority_weights[task.priority.name.lower()]
        
        return score
    
    def create_agent_instance(self, 
                            agent_name: str, 
                            task: AgentTask,
                            config: Dict[str, Any] = None) -> Optional[BaseAgent]:
        """Create an instance of the selected agent"""
        
        if agent_name not in self.agents:
            logger.error(f"Agent {agent_name} not registered")
            return None
        
        agent_class = self.agents[agent_name]
        
        # Select optimal model for this task
        agent_type = self._get_agent_type(agent_name)
        required_capabilities = task.context.get('required_capabilities', [])
        
        primary_model = self.model_selector.select_model(
            task, 
            agent_type, 
            required_capabilities
        )
        
        fallback_models = self.model_selector.get_fallback_models(primary_model, agent_type)
        
        # Merge configuration
        agent_config = config or {}
        agent_config.update({
            'primary_model': primary_model,
            'fallback_models': fallback_models,
            'requires_review': self._requires_review(task, agent_name),
            'safe_mode': task.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]
        })
        
        try:
            agent = agent_class(
                name=f"{agent_name}_{task.id[:8]}",
                agent_type=agent_type,
                config=agent_config
            )
            
            logger.info(f"Created agent instance {agent.name} with model {primary_model}")
            return agent
            
        except Exception as e:
            logger.error(f"Failed to create agent {agent_name}: {e}")
            return None
    
    def _get_agent_type(self, agent_name: str) -> str:
        """Determine agent type from name"""
        if any(keyword in agent_name.lower() for keyword in ['heal', 'recovery', 'restart', 'fix']):
            return 'self_heal'
        elif any(keyword in agent_name.lower() for keyword in ['optim', 'improve', 'enhance']):
            return 'optimize'
        elif any(keyword in agent_name.lower() for keyword in ['modern', 'upgrade', 'migrate']):
            return 'modernize'
        else:
            return 'general'
    
    def _requires_review(self, task: AgentTask, agent_name: str) -> bool:
        """Determine if task requires human review"""
        
        # Always require review for critical risk
        if task.risk_level == RiskLevel.CRITICAL:
            return True
        
        # High priority + high risk = review required
        if (task.priority in [TaskPriority.CRITICAL, TaskPriority.EMERGENCY] and 
            task.risk_level == RiskLevel.HIGH):
            return True
        
        # Certain agent types doing risky operations
        risky_operations = ['deploy', 'migrate', 'delete', 'restart', 'modify']
        if (any(op in task.description.lower() for op in risky_operations) and
            task.risk_level in [RiskLevel.MEDIUM, RiskLevel.HIGH]):
            return True
        
        # Task explicitly requests review
        if task.requires_review:
            return True
        
        return False
    
    def get_routing_stats(self) -> Dict[str, Any]:
        """Get routing statistics"""
        return {
            'registered_agents': len(self.agents),
            'agent_types': {
                agent_name: self._get_agent_type(agent_name)
                for agent_name in self.agents.keys()
            },
            'capabilities': self.agent_capabilities,
            'available_models': list(self.model_selector.models.keys())
        }

# Export main classes
__all__ = [
    'AgentRouter',
    'ModelSelector',
    'ModelMetadata',
    'ModelType'
]
