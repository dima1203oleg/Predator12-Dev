"""
Agent System for Predator Analytics
===================================

Multi-agent system with self-healing, optimization, and modernization capabilities.
Implements Plan-then-Execute pattern with fallback mechanisms and telemetry.
"""

from .base import AgentResult, AgentStatus, AgentTask, BaseAgent

# Modernization agents
from .modernize import (
    AccessibilityModernizer,
    APIModernizer,
    ArchitectureModernizer,
    ComplianceModernizer,
    DatabaseModernizer,
    DevOpsModernizer,
    DocumentationModernizer,
    InfrastructureModernizer,
    SecurityModernizer,
    TechStackUpgrader,
)

# Optimization agents
from .optimize import OptimizationAgent
from .registry import AgentRegistry, ModelRegistry
from .router import AgentRouter, ModelSelector

# Self-healing agents
from .self_heal import (
    BackupRestoreAgent,
    ConfigurationHealAgent,
    DataIntegrityAgent,
    DependencyFixAgent,
    MonitoringRepairAgent,
    NetworkHealAgent,
    PerformanceRecoveryAgent,
    SecurityPatchAgent,
    ServiceRestartAgent,
    SystemRecoveryAgent,
)
from .supervisor import AgentSupervisor
from .telemetry import AgentTelemetry

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
    MonitoringRepairAgent,
]

OPTIMIZE_AGENTS = [
    OptimizationAgent,
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
    DocumentationModernizer,
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
    "OptimizationAgent",
    "ArchitectureModernizer",
    "TechStackUpgrader",
    "SecurityModernizer",
    "APIModernizer",
    "DatabaseModernizer",
    "InfrastructureModernizer",
    "DevOpsModernizer",
    "ComplianceModernizer",
    "AccessibilityModernizer",
    "DocumentationModernizer",
]
