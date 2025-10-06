"""
Agents Configuration Module
Centralized configuration for all agents in the system
"""

import os
from typing import Dict, List, Optional

from pydantic import BaseModel


class AgentConfig(BaseModel):
    """Configuration for a single agent"""

    name: str
    url: str
    port: int
    health_endpoint: str
    timeout: float = 10.0
    retry_count: int = 3


class AgentsSystemConfig:
    """Central configuration for the agents system"""

    def __init__(self):
        self.agents = self._load_agent_configs()
        self.workflow = self._load_workflow_config()
        self.dependencies = self._load_dependencies()
        self.analysis_descriptions = self._load_analysis_descriptions()

    def _load_agent_configs(self) -> Dict[str, AgentConfig]:
        """Load agent configurations"""
        base_timeout = float(os.getenv("AGENT_TIMEOUT", "10.0"))
        
        # All 26 agents configuration
        return {
            "chief": AgentConfig(
                name="Chief Orchestrator",
                url="http://chief-orchestrator:9001",
                port=9001,
                health_endpoint="/chief/health",
                timeout=base_timeout,
            ),
            "model_router": AgentConfig(
                name="Model Router",
                url="http://model-router:9002",
                port=9002,
                health_endpoint="/router/health",
                timeout=base_timeout,
            ),
            "ingest": AgentConfig(
                name="Ingest Agent",
                url="http://ingest-agent:9003",
                port=9003,
                health_endpoint="/ingest/health",
                timeout=base_timeout,
            ),
            "dataset": AgentConfig(
                name="Dataset Agent",
                url="http://dataset-agent:9004",
                port=9004,
                health_endpoint="/dataset/health",
                timeout=base_timeout,
            ),
            "anomaly": AgentConfig(
                name="Anomaly Agent",
                url="http://anomaly-agent:9005",
                port=9005,
                health_endpoint="/anomaly/health",
                timeout=base_timeout,
            ),
            "forecast": AgentConfig(
                name="Forecast Agent",
                url="http://forecast-agent:9006",
                port=9006,
                health_endpoint="/forecast/health",
                timeout=base_timeout,
            ),
            "graph": AgentConfig(
                name="Graph Agent",
                url="http://graph-agent:9007",
                port=9007,
                health_endpoint="/graph/health",
                timeout=base_timeout,
            ),
            "self_healing": AgentConfig(
                name="Self Healing Agent",
                url="http://self-healing-agent:9008",
                port=9008,
                health_endpoint="/self-healing/health",
                timeout=base_timeout,
            ),
            "auto_improve": AgentConfig(
                name="Auto Improve Agent",
                url="http://auto-improve-agent:9009",
                port=9009,
                health_endpoint="/auto-improve/health",
                timeout=base_timeout,
            ),
            "security": AgentConfig(
                name="Security Agent",
                url="http://security-agent:9010",
                port=9010,
                health_endpoint="/security/health",
                timeout=base_timeout,
            ),
            "core_orchestrator": AgentConfig(
                name="Core Orchestrator",
                url="http://core-orchestrator:9011",
                port=9011,
                health_endpoint="/core/health",
                timeout=base_timeout,
            ),
            "SecurityAgent": AgentConfig(
                name="SecurityAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "SecurityPrivacyAgent": AgentConfig(
                name="SecurityPrivacyAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "CostOptimizerAgent": AgentConfig(
                name="CostOptimizerAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "DashboardBuilderAgent": AgentConfig(
                name="DashboardBuilderAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "ChiefOrchestratorAgent": AgentConfig(
                name="ChiefOrchestratorAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "SelfHealingAgent": AgentConfig(
                name="SelfHealingAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "PromptEngineeringAgent": AgentConfig(
                name="PromptEngineeringAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "IngestAgent": AgentConfig(
                name="IngestAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "DataQualityAgent": AgentConfig(
                name="DataQualityAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "AutoImproveAgent": AgentConfig(
                name="AutoImproveAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "GraphAgent": AgentConfig(
                name="GraphAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "ModelRouterAgent": AgentConfig(
                name="ModelRouterAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "EntityResolutionAgent": AgentConfig(
                name="EntityResolutionAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "TieredCacheChiefOrchestrator": AgentConfig(
                name="TieredCacheChiefOrchestrator",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "MetricsChiefOrchestrator": AgentConfig(
                name="MetricsChiefOrchestrator",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "ValidatedChiefOrchestrator": AgentConfig(
                name="ValidatedChiefOrchestrator",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "GeoEnrichmentAgent": AgentConfig(
                name="GeoEnrichmentAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "ComplianceAgent": AgentConfig(
                name="ComplianceAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "SelfImprovementAgent": AgentConfig(
                name="SelfImprovementAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "DeepInvestigatorAgent": AgentConfig(
                name="DeepInvestigatorAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "ReleaseManagerAgent": AgentConfig(
                name="ReleaseManagerAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "SelfDiagnosisAgent": AgentConfig(
                name="SelfDiagnosisAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "SyntheticDataAgent": AgentConfig(
                name="SyntheticDataAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "ArbiterAgent": AgentConfig(
                name="ArbiterAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "RiskScoringAgent": AgentConfig(
                name="RiskScoringAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "QueryPlannerAgent": AgentConfig(
                name="QueryPlannerAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "AutoHealAgent": AgentConfig(
                name="AutoHealAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "PatternMiningAgent": AgentConfig(
                name="PatternMiningAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "BillingQuotaAgent": AgentConfig(
                name="BillingQuotaAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "AutoTrainAgent": AgentConfig(
                name="AutoTrainAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
            "ReportGenAgent": AgentConfig(
                name="ReportGenAgent",
                url="http://localhost:8000",
                port=8000,
                health_endpoint="/health",
                timeout=10.0,
            ),
        }

    def _load_workflow_config(self) -> Dict[str, Any]:
        """Load workflow configuration"""
        return {
            "enabled": True,
            "max_concurrent_workflows": 10,
            "workflow_timeout": 300,
        }

    def _load_dependencies(self) -> Dict[str, List[str]]:
        """Load agent dependencies"""
        return {
            "chief": [],
            "model_router": [],
            "ingest": [],
            "dataset": [],
            "anomaly": [],
            "forecast": [],
            "graph": [],
            "self_healing": [],
            "auto_improve": [],
            "security": [],
            "core_orchestrator": [],
        }

    def _load_analysis_descriptions(self) -> Dict[str, str]:
        """Load analysis descriptions"""
        return {
            "chief": "Central orchestration and coordination",
            "model_router": "Intelligent model selection and routing",
            "ingest": "Data ingestion and preprocessing",
            "dataset": "Dataset management and optimization",
            "anomaly": "Anomaly detection and threat analysis",
            "forecast": "Predictive analytics and forecasting",
            "graph": "Graph analysis and relationship mapping",
            "self_healing": "System health monitoring and auto-recovery",
            "auto_improve": "Continuous system optimization",
            "security": "Security monitoring and threat detection",
            "core_orchestrator": "Core system orchestration",
        }

    def get_enabled_agents(self) -> List[str]:
        """Get list of enabled agent names"""
        return [name for name, config in self.agents.items() if config.enabled]

    def get_agent_config(self, name: str) -> Optional[AgentConfig]:
        """Get configuration for a specific agent"""
        return self.agents.get(name)


# Global instance
agents_config = AgentsSystemConfig()
