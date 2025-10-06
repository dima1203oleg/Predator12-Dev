"""
Agent System for Predator Analytics
===================================

Multi-agent system with self-healing, optimization, and modernization capabilities.
Implements Plan-then-Execute pattern with fallback mechanisms and telemetry.
"""

from .base import BaseAgent, AgentTask, AgentResult, AgentStatus
from .router import AgentRouter, ModelSelector
from .registry import AgentRegistry, ModelRegistry
from .supervisor import AgentSupervisor
from .telemetry import AgentTelemetry

# Self-healing agents
from .self_heal import (
    SystemRecoveryAgent,
    ServiceRestartAgent,
    DependencyFixAgent,
    ConfigurationHealAgent,
    PerformanceRecoveryAgent,
    SecurityPatchAgent,
    DataIntegrityAgent,
    NetworkHealAgent,
    BackupRestoreAgent,
    MonitoringRepairAgent
)

# Optimization agents
from .optimize import (
    PerformanceOptimizer,
    ResourceOptimizer,
    DatabaseOptimizer,
    CacheOptimizer,
    NetworkOptimizer,
    CodeOptimizer,
    WorkflowOptimizer,
    CostOptimizer,
    EnergyOptimizer,
    ScalingOptimizer
)

# Modernization agents
from .modernize import (
    ArchitectureModernizer,
    TechStackUpgrader,
    SecurityModernizer,
    APIModernizer,
    DatabaseModernizer,
    InfrastructureModernizer,
    DevOpsModernizer,
    ComplianceModernizer,
    AccessibilityModernizer,
    DocumentationModernizer
)

# Agent collections
SELF_HEAL_AGENTS = [
    SystemRecoveryAgent,
    ServiceRestartAgent,
    DependencyFixAgent,
    ConfigurationHealAgent,
    PerformanceRecoveryAgent,
    SecurityPatchAgent,
    DataIntegrityAgent,
    NetworkHealAgent,
    BackupRestoreAgent,
    MonitoringRepairAgent
]

OPTIMIZE_AGENTS = [
    PerformanceOptimizer,
    ResourceOptimizer,
    DatabaseOptimizer,
    CacheOptimizer,
    NetworkOptimizer,
    CodeOptimizer,
    WorkflowOptimizer,
    CostOptimizer,
    EnergyOptimizer,
    ScalingOptimizer
]

MODERNIZE_AGENTS = [
    ArchitectureModernizer,
    TechStackUpgrader,
    SecurityModernizer,
    APIModernizer,
    DatabaseModernizer,
    InfrastructureModernizer,
    DevOpsModernizer,
    ComplianceModernizer,
    AccessibilityModernizer,
    DocumentationModernizer
]

ALL_AGENTS = SELF_HEAL_AGENTS + OPTIMIZE_AGENTS + MODERNIZE_AGENTS

__version__ = "1.0.0"
__author__ = "Predator Analytics Team"

__all__ = [
    # Core classes
    "BaseAgent",
    "AgentTask", 
    "AgentResult",
    "AgentStatus",
    "AgentRouter",
    "ModelSelector",
    "AgentRegistry",
    "ModelRegistry",
    "AgentSupervisor",
    "AgentTelemetry",
    
    # Agent collections
    "SELF_HEAL_AGENTS",
    "OPTIMIZE_AGENTS", 
    "MODERNIZE_AGENTS",
    "ALL_AGENTS",
    
    # Individual agents
    "SystemRecoveryAgent",
    "ServiceRestartAgent",
    "DependencyFixAgent",
    "ConfigurationHealAgent",
    "PerformanceRecoveryAgent",
    "SecurityPatchAgent",
    "DataIntegrityAgent",
    "NetworkHealAgent",
    "BackupRestoreAgent",
    "MonitoringRepairAgent",
    "PerformanceOptimizer",
    "ResourceOptimizer",
    "DatabaseOptimizer",
    "CacheOptimizer",
    "NetworkOptimizer",
    "CodeOptimizer",
    "WorkflowOptimizer",
    "CostOptimizer",
    "EnergyOptimizer",
    "ScalingOptimizer",
    "ArchitectureModernizer",
    "TechStackUpgrader",
    "SecurityModernizer",
    "APIModernizer",
    "DatabaseModernizer",
    "InfrastructureModernizer",
    "DevOpsModernizer",
    "ComplianceModernizer",
    "AccessibilityModernizer",
    "DocumentationModernizer"
]
