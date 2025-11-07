"""Stubs for modernization agents.

These are lightweight placeholder implementations so test
discovery/import succeeds in environments where the full implementations
are not required.
"""

from typing import Any, Dict

from agents.base import AgentTask, BaseAgent, ExecutionPlan


class _SimpleModernizer(BaseAgent):
    def __init__(self, name: str):
        super().__init__(name=name, agent_type="modernizer")

    async def plan(self, task: AgentTask) -> ExecutionPlan:
        plan = ExecutionPlan()
        plan.add_step("noop", "noop")
        return plan

    async def execute_step(self, step: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        return {"context_updates": {}, "result": "ok"}


class AccessibilityModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("AccessibilityModernizer")


class APIModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("APIModernizer")


class ArchitectureModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("ArchitectureModernizer")


class ComplianceModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("ComplianceModernizer")


class DatabaseModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("DatabaseModernizer")


class DevOpsModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("DevOpsModernizer")


class DocumentationModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("DocumentationModernizer")


class InfrastructureModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("InfrastructureModernizer")


class SecurityModernizer(_SimpleModernizer):
    def __init__(self):
        super().__init__("SecurityModernizer")


class TechStackUpgrader(_SimpleModernizer):
    def __init__(self):
        super().__init__("TechStackUpgrader")


__all__ = [
    "AccessibilityModernizer",
    "APIModernizer",
    "ArchitectureModernizer",
    "ComplianceModernizer",
    "DatabaseModernizer",
    "DevOpsModernizer",
    "DocumentationModernizer",
    "InfrastructureModernizer",
    "SecurityModernizer",
    "TechStackUpgrader",
]
