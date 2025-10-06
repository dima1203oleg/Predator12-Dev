"""
Agent Registry and Model Registry
=================================

Central registry for managing agents and models.
"""

import json
import logging
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any, Type
from dataclasses import dataclass, asdict
from datetime import datetime

from .base import BaseAgent, AgentStatus

logger = logging.getLogger(__name__)

@dataclass
class AgentRegistration:
    """Agent registration information"""
    name: str
    agent_class: str
    agent_type: str
    version: str
    capabilities: List[str]
    dependencies: List[str]
    config_schema: Dict[str, Any]
    enabled: bool = True
    registered_at: str = None
    last_health_check: str = None
    health_status: str = "unknown"
    
    def __post_init__(self):
        if self.registered_at is None:
            self.registered_at = datetime.now().isoformat()

@dataclass
class ModelRegistration:
    """Model registration information"""
    name: str
    model_type: str
    provider: str
    version: str
    capabilities: List[str]
    config: Dict[str, Any]
    enabled: bool = True
    cost_per_token: float = 0.0
    latency_ms: float = 1000.0
    context_window: int = 4096
    reliability_score: float = 0.9
    registered_at: str = None
    
    def __post_init__(self):
        if self.registered_at is None:
            self.registered_at = datetime.now().isoformat()

class AgentRegistry:
    """Central registry for all agents"""
    
    def __init__(self, registry_file: str = "agents/registry.yaml"):
        self.registry_file = Path(registry_file)
        self.agents: Dict[str, AgentRegistration] = {}
        self.agent_instances: Dict[str, BaseAgent] = {}
        self._load_registry()
    
    def _load_registry(self):
        """Load agent registry from file"""
        if self.registry_file.exists():
            try:
                with open(self.registry_file, 'r') as f:
                    data = yaml.safe_load(f) or {}
                
                agents_data = data.get('agents', [])
                for agent_data in agents_data:
                    registration = AgentRegistration(**agent_data)
                    self.agents[registration.name] = registration
                
                logger.info(f"Loaded {len(self.agents)} agents from registry")
                
            except Exception as e:
                logger.error(f"Failed to load agent registry: {e}")
                self._create_default_registry()
        else:
            logger.info("Registry file not found, creating default registry")
            self._create_default_registry()
    
    def _create_default_registry(self):
        """Create default agent registry"""
        
        # Self-healing agents
        self_heal_agents = [
            {
                'name': 'SystemRecoveryAgent',
                'agent_class': 'agents.self_heal.SystemRecoveryAgent',
                'agent_type': 'self_heal',
                'version': '1.0.0',
                'capabilities': ['system_recovery', 'service_restart', 'health_check'],
                'dependencies': ['docker', 'kubectl'],
                'config_schema': {
                    'max_restart_attempts': {'type': 'int', 'default': 3},
                    'restart_delay_seconds': {'type': 'int', 'default': 30}
                }
            },
            {
                'name': 'ServiceRestartAgent',
                'agent_class': 'agents.self_heal.ServiceRestartAgent',
                'agent_type': 'self_heal',
                'version': '1.0.0',
                'capabilities': ['service_restart', 'process_management'],
                'dependencies': ['systemctl', 'docker'],
                'config_schema': {
                    'graceful_shutdown_timeout': {'type': 'int', 'default': 30}
                }
            },
            {
                'name': 'DependencyFixAgent',
                'agent_class': 'agents.self_heal.DependencyFixAgent',
                'agent_type': 'self_heal',
                'version': '1.0.0',
                'capabilities': ['dependency_resolution', 'package_management'],
                'dependencies': ['pip', 'npm', 'apt'],
                'config_schema': {
                    'auto_install_missing': {'type': 'bool', 'default': False}
                }
            }
        ]
        
        # Optimization agents
        optimize_agents = [
            {
                'name': 'PerformanceOptimizer',
                'agent_class': 'agents.optimize.PerformanceOptimizer',
                'agent_type': 'optimize',
                'version': '1.0.0',
                'capabilities': ['performance_analysis', 'bottleneck_detection', 'optimization'],
                'dependencies': ['profiler', 'metrics'],
                'config_schema': {
                    'optimization_target': {'type': 'str', 'default': 'latency'}
                }
            },
            {
                'name': 'ResourceOptimizer',
                'agent_class': 'agents.optimize.ResourceOptimizer',
                'agent_type': 'optimize',
                'version': '1.0.0',
                'capabilities': ['resource_management', 'scaling', 'cost_optimization'],
                'dependencies': ['kubernetes', 'docker'],
                'config_schema': {
                    'max_cpu_utilization': {'type': 'float', 'default': 0.8}
                }
            }
        ]
        
        # Modernization agents
        modernize_agents = [
            {
                'name': 'ArchitectureModernizer',
                'agent_class': 'agents.modernize.ArchitectureModernizer',
                'agent_type': 'modernize',
                'version': '1.0.0',
                'capabilities': ['architecture_analysis', 'migration_planning', 'refactoring'],
                'dependencies': ['git', 'docker'],
                'config_schema': {
                    'target_architecture': {'type': 'str', 'default': 'microservices'}
                }
            }
        ]
        
        # Register all agents
        for agent_data in self_heal_agents + optimize_agents + modernize_agents:
            registration = AgentRegistration(**agent_data)
            self.agents[registration.name] = registration
        
        self._save_registry()
        logger.info(f"Created default registry with {len(self.agents)} agents")
    
    def register_agent(self, 
                      agent_class: Type[BaseAgent],
                      capabilities: List[str],
                      dependencies: List[str] = None,
                      config_schema: Dict[str, Any] = None) -> bool:
        """Register a new agent"""
        
        agent_name = agent_class.__name__
        
        if agent_name in self.agents:
            logger.warning(f"Agent {agent_name} already registered, updating")
        
        # Determine agent type from class name/module
        agent_type = self._determine_agent_type(agent_class)
        
        registration = AgentRegistration(
            name=agent_name,
            agent_class=f"{agent_class.__module__}.{agent_class.__name__}",
            agent_type=agent_type,
            version="1.0.0",  # Could be extracted from class metadata
            capabilities=capabilities,
            dependencies=dependencies or [],
            config_schema=config_schema or {}
        )
        
        self.agents[agent_name] = registration
        self._save_registry()
        
        logger.info(f"Registered agent {agent_name} with capabilities: {capabilities}")
        return True
    
    def _determine_agent_type(self, agent_class: Type[BaseAgent]) -> str:
        """Determine agent type from class information"""
        module_name = agent_class.__module__.lower()
        class_name = agent_class.__name__.lower()
        
        if 'self_heal' in module_name or any(kw in class_name for kw in ['recovery', 'restart', 'fix', 'heal']):
            return 'self_heal'
        elif 'optimize' in module_name or any(kw in class_name for kw in ['optimizer', 'performance', 'resource']):
            return 'optimize'
        elif 'modernize' in module_name or any(kw in class_name for kw in ['modernizer', 'upgrade', 'migrate']):
            return 'modernize'
        else:
            return 'general'
    
    def get_agent(self, name: str) -> Optional[AgentRegistration]:
        """Get agent registration by name"""
        return self.agents.get(name)
    
    def list_agents(self, 
                   agent_type: str = None, 
                   enabled_only: bool = True) -> List[AgentRegistration]:
        """List agents with optional filtering"""
        agents = list(self.agents.values())
        
        if agent_type:
            agents = [a for a in agents if a.agent_type == agent_type]
        
        if enabled_only:
            agents = [a for a in agents if a.enabled]
        
        return agents
    
    def enable_agent(self, name: str) -> bool:
        """Enable an agent"""
        if name in self.agents:
            self.agents[name].enabled = True
            self._save_registry()
            logger.info(f"Enabled agent {name}")
            return True
        return False
    
    def disable_agent(self, name: str) -> bool:
        """Disable an agent"""
        if name in self.agents:
            self.agents[name].enabled = False
            self._save_registry()
            logger.info(f"Disabled agent {name}")
            return True
        return False
    
    def update_health_status(self, name: str, status: str):
        """Update agent health status"""
        if name in self.agents:
            self.agents[name].health_status = status
            self.agents[name].last_health_check = datetime.now().isoformat()
            # Don't save on every health check to avoid I/O overhead
    
    def get_agents_by_capability(self, capability: str) -> List[AgentRegistration]:
        """Get agents that have a specific capability"""
        return [
            agent for agent in self.agents.values()
            if capability in agent.capabilities and agent.enabled
        ]
    
    def validate_dependencies(self, name: str) -> Dict[str, bool]:
        """Validate agent dependencies"""
        agent = self.agents.get(name)
        if not agent:
            return {}
        
        # This would check if dependencies are actually available
        # For now, we'll simulate this
        dependency_status = {}
        for dep in agent.dependencies:
            # In real implementation, check if command/tool exists
            dependency_status[dep] = True
        
        return dependency_status
    
    def _save_registry(self):
        """Save registry to file"""
        try:
            # Create directory if it doesn't exist
            self.registry_file.parent.mkdir(parents=True, exist_ok=True)
            
            registry_data = {
                'version': '1.0.0',
                'updated_at': datetime.now().isoformat(),
                'agents': [asdict(agent) for agent in self.agents.values()]
            }
            
            with open(self.registry_file, 'w') as f:
                yaml.dump(registry_data, f, default_flow_style=False, sort_keys=False)
            
            logger.debug(f"Saved agent registry to {self.registry_file}")
            
        except Exception as e:
            logger.error(f"Failed to save agent registry: {e}")
    
    def export_registry(self, format: str = 'yaml') -> str:
        """Export registry in specified format"""
        registry_data = {
            'version': '1.0.0',
            'exported_at': datetime.now().isoformat(),
            'agents': [asdict(agent) for agent in self.agents.values()]
        }
        
        if format.lower() == 'json':
            return json.dumps(registry_data, indent=2)
        else:
            return yaml.dump(registry_data, default_flow_style=False)
    
    def get_registry_stats(self) -> Dict[str, Any]:
        """Get registry statistics"""
        agents_by_type = {}
        enabled_count = 0
        disabled_count = 0
        
        for agent in self.agents.values():
            # Count by type
            if agent.agent_type not in agents_by_type:
                agents_by_type[agent.agent_type] = 0
            agents_by_type[agent.agent_type] += 1
            
            # Count enabled/disabled
            if agent.enabled:
                enabled_count += 1
            else:
                disabled_count += 1
        
        return {
            'total_agents': len(self.agents),
            'enabled_agents': enabled_count,
            'disabled_agents': disabled_count,
            'agents_by_type': agents_by_type,
            'registry_file': str(self.registry_file),
            'last_updated': max([a.registered_at for a in self.agents.values()]) if self.agents else None
        }

class ModelRegistry:
    """Central registry for AI models"""
    
    def __init__(self, registry_file: str = "agents/models.yaml"):
        self.registry_file = Path(registry_file)
        self.models: Dict[str, ModelRegistration] = {}
        self._load_registry()
    
    def _load_registry(self):
        """Load model registry from file"""
        if self.registry_file.exists():
            try:
                with open(self.registry_file, 'r') as f:
                    data = yaml.safe_load(f) or {}
                
                models_data = data.get('models', [])
                for model_data in models_data:
                    registration = ModelRegistration(**model_data)
                    self.models[registration.name] = registration
                
                logger.info(f"Loaded {len(self.models)} models from registry")
                
            except Exception as e:
                logger.error(f"Failed to load model registry: {e}")
                self._create_default_registry()
        else:
            self._create_default_registry()
    
    def _create_default_registry(self):
        """Create default model registry"""
        
        default_models = [
            {
                'name': 'gpt-4',
                'model_type': 'language_model',
                'provider': 'openai',
                'version': '0613',
                'capabilities': ['reasoning', 'coding', 'analysis', 'planning'],
                'config': {
                    'temperature': 0.7,
                    'max_tokens': 4096
                },
                'cost_per_token': 0.03,
                'latency_ms': 2000,
                'context_window': 8192,
                'reliability_score': 0.95
            },
            {
                'name': 'gpt-3.5-turbo',
                'model_type': 'language_model',
                'provider': 'openai',
                'version': '0613',
                'capabilities': ['reasoning', 'coding', 'analysis'],
                'config': {
                    'temperature': 0.7,
                    'max_tokens': 4096
                },
                'cost_per_token': 0.002,
                'latency_ms': 1000,
                'context_window': 4096,
                'reliability_score': 0.90
            },
            {
                'name': 'claude-3-sonnet',
                'model_type': 'language_model',
                'provider': 'anthropic',
                'version': '20240229',
                'capabilities': ['reasoning', 'analysis', 'planning', 'safety'],
                'config': {
                    'temperature': 0.7,
                    'max_tokens': 4096
                },
                'cost_per_token': 0.015,
                'latency_ms': 1500,
                'context_window': 200000,
                'reliability_score': 0.93
            },
            {
                'name': 'local-llama',
                'model_type': 'language_model',
                'provider': 'local',
                'version': '7b',
                'capabilities': ['reasoning', 'coding'],
                'config': {
                    'temperature': 0.7,
                    'max_tokens': 2048
                },
                'cost_per_token': 0.0,
                'latency_ms': 5000,
                'context_window': 2048,
                'reliability_score': 0.80
            }
        ]
        
        for model_data in default_models:
            registration = ModelRegistration(**model_data)
            self.models[registration.name] = registration
        
        self._save_registry()
        logger.info(f"Created default model registry with {len(self.models)} models")
    
    def register_model(self, model_data: Dict[str, Any]) -> bool:
        """Register a new model"""
        
        registration = ModelRegistration(**model_data)
        self.models[registration.name] = registration
        self._save_registry()
        
        logger.info(f"Registered model {registration.name}")
        return True
    
    def get_model(self, name: str) -> Optional[ModelRegistration]:
        """Get model registration by name"""
        return self.models.get(name)
    
    def list_models(self, 
                   model_type: str = None, 
                   provider: str = None,
                   enabled_only: bool = True) -> List[ModelRegistration]:
        """List models with optional filtering"""
        models = list(self.models.values())
        
        if model_type:
            models = [m for m in models if m.model_type == model_type]
        
        if provider:
            models = [m for m in models if m.provider == provider]
        
        if enabled_only:
            models = [m for m in models if m.enabled]
        
        return models
    
    def get_models_by_capability(self, capability: str) -> List[ModelRegistration]:
        """Get models that have a specific capability"""
        return [
            model for model in self.models.values()
            if capability in model.capabilities and model.enabled
        ]
    
    def _save_registry(self):
        """Save registry to file"""
        try:
            self.registry_file.parent.mkdir(parents=True, exist_ok=True)
            
            registry_data = {
                'version': '1.0.0',
                'updated_at': datetime.now().isoformat(),
                'models': [asdict(model) for model in self.models.values()]
            }
            
            with open(self.registry_file, 'w') as f:
                yaml.dump(registry_data, f, default_flow_style=False, sort_keys=False)
            
        except Exception as e:
            logger.error(f"Failed to save model registry: {e}")

# Export main classes
__all__ = [
    'AgentRegistry',
    'ModelRegistry',
    'AgentRegistration',
    'ModelRegistration'
]
