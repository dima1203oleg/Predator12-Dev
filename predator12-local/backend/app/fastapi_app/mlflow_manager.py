#!/usr/bin/env python3
"""
MLflow Model Registry with Canary Deployment for Predator Analytics
Implements model versioning, drift detection, and explainability.
Part of Delta Revision 1.1 - Block A3
"""

import hashlib
import json
import logging
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)


class ModelStage(Enum):
    """Model lifecycle stages"""

    DEVELOPMENT = "Development"
    STAGING = "Staging"
    PRODUCTION = "Production"
    ARCHIVED = "Archived"
    CANARY = "Canary"


class DriftStatus(Enum):
    """Model drift detection status"""

    STABLE = "stable"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


@dataclass
class ModelVersion:
    """Model version metadata"""

    name: str
    version: str
    stage: ModelStage
    created_at: datetime
    updated_at: datetime
    creator: str
    description: str
    tags: Dict[str, str]
    metrics: Dict[str, float]
    signature: Dict[str, Any]
    artifact_path: str
    model_hash: str


@dataclass
class DriftMetrics:
    """Model drift detection metrics"""

    psi_score: float  # Population Stability Index
    ks_statistic: float  # Kolmogorov-Smirnov test
    wasserstein_distance: float
    feature_importance_shift: float
    prediction_distribution_shift: float
    data_quality_score: float
    timestamp: datetime
    drift_status: DriftStatus


@dataclass
class ExplainabilityResult:
    """Model explainability results"""

    prediction_id: str
    model_version: str
    shap_values: Dict[str, float]
    feature_importance: Dict[str, float]
    lime_explanation: Dict[str, Any]
    counterfactual_examples: List[Dict[str, Any]]
    confidence_intervals: Dict[str, Tuple[float, float]]
    timestamp: datetime


class ModelRegistry:
    """MLflow-compatible model registry"""

    def __init__(self, registry_path: str = "/tmp/model_registry"):
        self.registry_path = Path(registry_path)
        self.registry_path.mkdir(exist_ok=True)
        self.models: Dict[str, List[ModelVersion]] = {}
        self.load_registry()

    def register_model(
        self,
        name: str,
        version: str,
        artifact_path: str,
        creator: str,
        description: str = "",
        tags: Dict[str, str] = None,
        metrics: Dict[str, float] = None,
        signature: Dict[str, Any] = None,
    ) -> ModelVersion:
        """Register a new model version"""

        # Calculate model hash for integrity
        model_hash = self._calculate_model_hash(artifact_path)

        now = datetime.utcnow()
        model_version = ModelVersion(
            name=name,
            version=version,
            stage=ModelStage.DEVELOPMENT,
            created_at=now,
            updated_at=now,
            creator=creator,
            description=description,
            tags=tags or {},
            metrics=metrics or {},
            signature=signature or {},
            artifact_path=artifact_path,
            model_hash=model_hash,
        )

        if name not in self.models:
            self.models[name] = []

        self.models[name].append(model_version)
        self.save_registry()

        logger.info(f"Registered model {name} version {version}")
        return model_version

    def transition_model_stage(self, name: str, version: str, stage: ModelStage) -> bool:
        """Transition model to new stage"""
        model_version = self.get_model_version(name, version)
        if not model_version:
            logger.error(f"Model {name} version {version} not found")
            return False

        # Validation rules for stage transitions
        if stage == ModelStage.PRODUCTION:
            if model_version.stage != ModelStage.STAGING:
                logger.error(f"Cannot transition to Production from {model_version.stage}")
                return False

            # Ensure model has required metrics
            required_metrics = ["accuracy", "precision", "recall"]
            missing_metrics = [m for m in required_metrics if m not in model_version.metrics]
            if missing_metrics:
                logger.error(f"Missing required metrics for Production: {missing_metrics}")
                return False

        model_version.stage = stage
        model_version.updated_at = datetime.utcnow()
        self.save_registry()

        logger.info(f"Transitioned {name} v{version} to {stage.value}")
        return True

    def get_model_version(self, name: str, version: str) -> Optional[ModelVersion]:
        """Get specific model version"""
        if name not in self.models:
            return None

        for model in self.models[name]:
            if model.version == version:
                return model

        return None

    def get_latest_model(
        self, name: str, stage: Optional[ModelStage] = None
    ) -> Optional[ModelVersion]:
        """Get latest model version for stage"""
        if name not in self.models:
            return None

        models = self.models[name]
        if stage:
            models = [m for m in models if m.stage == stage]

        if not models:
            return None

        return max(models, key=lambda m: m.created_at)

    def list_models(self, stage: Optional[ModelStage] = None) -> List[ModelVersion]:
        """List all models, optionally filtered by stage"""
        all_models = []
        for model_list in self.models.values():
            all_models.extend(model_list)

        if stage:
            all_models = [m for m in all_models if m.stage == stage]

        return sorted(all_models, key=lambda m: m.created_at, reverse=True)

    def _calculate_model_hash(self, artifact_path: str) -> str:
        """Calculate hash of model artifacts"""
        try:
            if Path(artifact_path).exists():
                # In real implementation, hash the actual model files
                content = f"model_at_{artifact_path}_{datetime.utcnow().isoformat()}"
                return hashlib.sha256(content.encode()).hexdigest()[:16]
            return "no_artifacts"
        except Exception as e:
            logger.warning(f"Could not calculate model hash: {e}")
            return "unknown"

    def save_registry(self):
        """Save registry to disk"""
        try:
            registry_data = {}
            for name, versions in self.models.items():
                registry_data[name] = []
                for version in versions:
                    version_data = asdict(version)
                    version_data["stage"] = version.stage.value
                    version_data["created_at"] = version.created_at.isoformat()
                    version_data["updated_at"] = version.updated_at.isoformat()
                    registry_data[name].append(version_data)

            registry_file = self.registry_path / "registry.json"
            with open(registry_file, "w") as f:
                json.dump(registry_data, f, indent=2)

            logger.debug(f"Saved registry with {len(self.models)} models")
        except Exception as e:
            logger.error(f"Failed to save registry: {e}")

    def load_registry(self):
        """Load registry from disk"""
        try:
            registry_file = self.registry_path / "registry.json"
            if registry_file.exists():
                with open(registry_file) as f:
                    registry_data = json.load(f)

                for name, versions in registry_data.items():
                    self.models[name] = []
                    for version_data in versions:
                        version_data["stage"] = ModelStage(version_data["stage"])
                        version_data["created_at"] = datetime.fromisoformat(
                            version_data["created_at"]
                        )
                        version_data["updated_at"] = datetime.fromisoformat(
                            version_data["updated_at"]
                        )

                        model_version = ModelVersion(**version_data)
                        self.models[name].append(model_version)

                logger.info(f"Loaded registry with {len(self.models)} models")
        except Exception as e:
            logger.warning(f"Failed to load registry: {e}")
            self.models = {}


class DriftDetector:
    """Model drift detection using statistical tests"""

    def __init__(self, reference_window_days: int = 30):
        self.reference_window_days = reference_window_days
        self.drift_history: List[DriftMetrics] = []

    def calculate_psi(self, expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
        """Calculate Population Stability Index (PSI)"""
        try:
            # Handle edge cases
            if len(expected) == 0 or len(actual) == 0:
                return float("inf")

            # Create bins based on expected distribution
            bin_edges = np.histogram_bin_edges(expected, bins=bins)

            # Calculate distributions
            expected_counts, _ = np.histogram(expected, bins=bin_edges)
            actual_counts, _ = np.histogram(actual, bins=bin_edges)

            # Avoid division by zero
            expected_pct = (expected_counts + 1e-6) / (len(expected) + bins * 1e-6)
            actual_pct = (actual_counts + 1e-6) / (len(actual) + bins * 1e-6)

            # Calculate PSI
            psi = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))

            return float(psi)

        except Exception as e:
            logger.error(f"PSI calculation error: {e}")
            return float("inf")

    def calculate_ks_statistic(self, expected: np.ndarray, actual: np.ndarray) -> float:
        """Calculate Kolmogorov-Smirnov test statistic"""
        try:
            from scipy import stats

            statistic, _ = stats.ks_2samp(expected, actual)
            return float(statistic)
        except ImportError:
            # Fallback implementation
            return self._ks_statistic_fallback(expected, actual)
        except Exception as e:
            logger.error(f"KS test error: {e}")
            return 1.0

    def _ks_statistic_fallback(self, expected: np.ndarray, actual: np.ndarray) -> float:
        """Fallback KS statistic calculation"""
        try:
            # Simple implementation of KS test
            all_values = np.concatenate([expected, actual])
            all_values = np.sort(all_values)

            n1, n2 = len(expected), len(actual)
            cdf1 = np.searchsorted(expected, all_values, side="right") / n1
            cdf2 = np.searchsorted(actual, all_values, side="right") / n2

            return float(np.max(np.abs(cdf1 - cdf2)))
        except Exception:
            return 1.0

    def calculate_wasserstein_distance(self, expected: np.ndarray, actual: np.ndarray) -> float:
        """Calculate Wasserstein (Earth Mover's) distance"""
        try:
            from scipy import stats

            return float(stats.wasserstein_distance(expected, actual))
        except ImportError:
            # Simplified fallback
            return float(np.abs(np.mean(expected) - np.mean(actual)))
        except Exception as e:
            logger.error(f"Wasserstein distance error: {e}")
            return 0.0

    def detect_drift(
        self,
        reference_data: Dict[str, np.ndarray],
        current_data: Dict[str, np.ndarray],
        model_version: str,
    ) -> DriftMetrics:
        """Detect model drift using multiple metrics"""

        try:
            # Calculate drift metrics for each feature
            feature_psi_scores = []
            feature_ks_scores = []
            feature_wasserstein_scores = []

            for feature_name in reference_data.keys():
                if feature_name in current_data:
                    ref_values = reference_data[feature_name]
                    cur_values = current_data[feature_name]

                    psi = self.calculate_psi(ref_values, cur_values)
                    ks = self.calculate_ks_statistic(ref_values, cur_values)
                    wd = self.calculate_wasserstein_distance(ref_values, cur_values)

                    feature_psi_scores.append(psi)
                    feature_ks_scores.append(ks)
                    feature_wasserstein_scores.append(wd)

            # Aggregate metrics
            avg_psi = np.mean(feature_psi_scores) if feature_psi_scores else 0.0
            avg_ks = np.mean(feature_ks_scores) if feature_ks_scores else 0.0
            avg_wd = np.mean(feature_wasserstein_scores) if feature_wasserstein_scores else 0.0

            # Calculate feature importance shift (mock)
            feature_importance_shift = min(avg_psi / 10.0, 1.0)  # Normalize to [0,1]

            # Calculate prediction distribution shift (mock)
            prediction_distribution_shift = avg_ks

            # Calculate data quality score
            data_quality_score = max(0.0, 1.0 - (avg_psi / 2.0 + avg_ks) / 2.0)

            # Determine drift status
            drift_status = DriftStatus.STABLE
            if avg_psi > 0.25 or avg_ks > 0.3:
                drift_status = DriftStatus.CRITICAL
            elif avg_psi > 0.1 or avg_ks > 0.15:
                drift_status = DriftStatus.WARNING

            drift_metrics = DriftMetrics(
                psi_score=float(avg_psi),
                ks_statistic=float(avg_ks),
                wasserstein_distance=float(avg_wd),
                feature_importance_shift=float(feature_importance_shift),
                prediction_distribution_shift=float(prediction_distribution_shift),
                data_quality_score=float(data_quality_score),
                timestamp=datetime.utcnow(),
                drift_status=drift_status,
            )

            self.drift_history.append(drift_metrics)

            logger.info(f"Drift detection completed for {model_version}: {drift_status.value}")
            return drift_metrics

        except Exception as e:
            logger.error(f"Drift detection failed: {e}")
            return DriftMetrics(
                psi_score=0.0,
                ks_statistic=0.0,
                wasserstein_distance=0.0,
                feature_importance_shift=0.0,
                prediction_distribution_shift=0.0,
                data_quality_score=0.0,
                timestamp=datetime.utcnow(),
                drift_status=DriftStatus.UNKNOWN,
            )


class ExplainabilityEngine:
    """Model explainability using SHAP and LIME"""

    def __init__(self):
        self.explanations: List[ExplainabilityResult] = []

    def explain_prediction(
        self,
        prediction_id: str,
        model_version: str,
        input_features: Dict[str, float],
        prediction_value: float,
        model_predict_fn: Optional[callable] = None,
    ) -> ExplainabilityResult:
        """Generate explanation for a single prediction"""

        try:
            # Mock SHAP values (in production, use actual SHAP)
            shap_values = {}
            feature_importance = {}

            total_impact = 0.0
            for feature_name, feature_value in input_features.items():
                # Generate realistic mock SHAP values
                impact = (feature_value - 0.5) * np.random.uniform(-0.1, 0.1)
                shap_values[feature_name] = float(impact)
                feature_importance[feature_name] = float(abs(impact))
                total_impact += impact

            # Normalize feature importance
            total_importance = sum(feature_importance.values())
            if total_importance > 0:
                feature_importance = {
                    k: v / total_importance for k, v in feature_importance.items()
                }

            # Mock LIME explanation
            lime_explanation = {
                "intercept": 0.5,
                "prediction": prediction_value,
                "local_features": list(input_features.keys())[:5],  # Top 5 features
                "explanation_fit": 0.85,
            }

            # Mock counterfactual examples
            counterfactual_examples = []
            for i in range(2):
                cf_features = input_features.copy()
                # Modify top important feature
                top_feature = max(feature_importance.keys(), key=feature_importance.get)
                cf_features[top_feature] = cf_features[top_feature] * (1.0 + 0.1 * (i + 1))

                counterfactual_examples.append(
                    {
                        "features": cf_features,
                        "predicted_value": prediction_value * (0.9 + 0.1 * i),
                        "change_description": f"Increase {top_feature} by {10 * (i + 1)}%",
                    }
                )

            # Mock confidence intervals
            confidence_intervals = {}
            for feature_name in input_features.keys():
                base_value = shap_values[feature_name]
                margin = abs(base_value) * 0.2  # 20% margin
                confidence_intervals[feature_name] = (
                    float(base_value - margin),
                    float(base_value + margin),
                )

            result = ExplainabilityResult(
                prediction_id=prediction_id,
                model_version=model_version,
                shap_values=shap_values,
                feature_importance=feature_importance,
                lime_explanation=lime_explanation,
                counterfactual_examples=counterfactual_examples,
                confidence_intervals=confidence_intervals,
                timestamp=datetime.utcnow(),
            )

            self.explanations.append(result)

            logger.info(f"Generated explanation for prediction {prediction_id}")
            return result

        except Exception as e:
            logger.error(f"Explainability generation failed: {e}")
            return ExplainabilityResult(
                prediction_id=prediction_id,
                model_version=model_version,
                shap_values={},
                feature_importance={},
                lime_explanation={},
                counterfactual_examples=[],
                confidence_intervals={},
                timestamp=datetime.utcnow(),
            )


class CanaryDeploymentManager:
    """Canary deployment for ML models"""

    def __init__(self, registry: ModelRegistry):
        self.registry = registry
        self.canary_configs: Dict[str, Dict[str, Any]] = {}

    def start_canary_deployment(
        self,
        model_name: str,
        new_version: str,
        production_version: str,
        traffic_percentage: float = 5.0,
        success_criteria: Dict[str, float] = None,
    ) -> bool:
        """Start canary deployment for new model version"""

        if traffic_percentage < 0 or traffic_percentage > 100:
            logger.error("Traffic percentage must be between 0 and 100")
            return False

        # Validate model versions exist
        new_model = self.registry.get_model_version(model_name, new_version)
        prod_model = self.registry.get_model_version(model_name, production_version)

        if not new_model or not prod_model:
            logger.error("Model versions not found for canary deployment")
            return False

        # Set new model to canary stage
        if not self.registry.transition_model_stage(model_name, new_version, ModelStage.CANARY):
            return False

        canary_config = {
            "model_name": model_name,
            "canary_version": new_version,
            "production_version": production_version,
            "traffic_percentage": traffic_percentage,
            "start_time": datetime.utcnow(),
            "success_criteria": success_criteria
            or {"min_accuracy": 0.95, "max_latency_ms": 100, "max_error_rate": 0.01},
            "metrics": {
                "canary_requests": 0,
                "production_requests": 0,
                "canary_errors": 0,
                "production_errors": 0,
                "canary_latency": [],
                "production_latency": [],
            },
            "status": "running",
        }

        self.canary_configs[model_name] = canary_config

        logger.info(
            f"Started canary deployment for {model_name}: {traffic_percentage}% to v{new_version}"
        )
        return True

    def route_prediction_request(self, model_name: str) -> Tuple[str, bool]:
        """Route prediction request to canary or production model"""

        if model_name not in self.canary_configs:
            # No canary deployment, use production
            prod_model = self.registry.get_latest_model(model_name, ModelStage.PRODUCTION)
            return prod_model.version if prod_model else "", False

        canary_config = self.canary_configs[model_name]

        # Simple random routing based on traffic percentage
        import random

        if random.random() * 100 < canary_config["traffic_percentage"]:
            return canary_config["canary_version"], True
        else:
            return canary_config["production_version"], False

    def record_prediction_metrics(
        self,
        model_name: str,
        model_version: str,
        is_canary: bool,
        latency_ms: float,
        error: bool = False,
    ):
        """Record prediction metrics for canary analysis"""

        if model_name not in self.canary_configs:
            return

        config = self.canary_configs[model_name]

        if is_canary:
            config["metrics"]["canary_requests"] += 1
            config["metrics"]["canary_latency"].append(latency_ms)
            if error:
                config["metrics"]["canary_errors"] += 1
        else:
            config["metrics"]["production_requests"] += 1
            config["metrics"]["production_latency"].append(latency_ms)
            if error:
                config["metrics"]["production_errors"] += 1

    def evaluate_canary_deployment(self, model_name: str) -> Dict[str, Any]:
        """Evaluate canary deployment performance"""

        if model_name not in self.canary_configs:
            return {"error": "No canary deployment found"}

        config = self.canary_configs[model_name]
        metrics = config["metrics"]
        criteria = config["success_criteria"]

        # Calculate performance metrics
        canary_error_rate = metrics["canary_errors"] / max(metrics["canary_requests"], 1)
        production_error_rate = metrics["production_errors"] / max(
            metrics["production_requests"], 1
        )

        canary_avg_latency = np.mean(metrics["canary_latency"]) if metrics["canary_latency"] else 0
        production_avg_latency = (
            np.mean(metrics["production_latency"]) if metrics["production_latency"] else 0
        )

        # Evaluate against success criteria
        results = {
            "model_name": model_name,
            "canary_version": config["canary_version"],
            "production_version": config["production_version"],
            "evaluation_time": datetime.utcnow().isoformat(),
            "metrics": {
                "canary_error_rate": canary_error_rate,
                "production_error_rate": production_error_rate,
                "canary_avg_latency_ms": canary_avg_latency,
                "production_avg_latency_ms": production_avg_latency,
                "total_canary_requests": metrics["canary_requests"],
                "total_production_requests": metrics["production_requests"],
            },
            "criteria_met": True,
            "recommendation": "continue",
        }

        # Check success criteria
        if canary_error_rate > criteria["max_error_rate"]:
            results["criteria_met"] = False
            results["recommendation"] = "rollback"
            results["reason"] = (
                f"Canary error rate {canary_error_rate:.3f} exceeds threshold {criteria['max_error_rate']}"
            )

        elif canary_avg_latency > criteria["max_latency_ms"]:
            results["criteria_met"] = False
            results["recommendation"] = "rollback"
            results["reason"] = (
                f"Canary latency {canary_avg_latency:.1f}ms exceeds threshold {criteria['max_latency_ms']}ms"
            )

        elif metrics["canary_requests"] > 1000 and canary_error_rate < production_error_rate * 0.8:
            results["recommendation"] = "promote"
            results["reason"] = "Canary performing better than production with sufficient traffic"

        return results

    def promote_canary(self, model_name: str) -> bool:
        """Promote canary model to production"""

        if model_name not in self.canary_configs:
            return False

        config = self.canary_configs[model_name]
        canary_version = config["canary_version"]

        # Transition canary to production
        success = self.registry.transition_model_stage(
            model_name, canary_version, ModelStage.PRODUCTION
        )

        if success:
            # Archive old production model
            old_prod_version = config["production_version"]
            self.registry.transition_model_stage(model_name, old_prod_version, ModelStage.ARCHIVED)

            # Clean up canary config
            del self.canary_configs[model_name]

            logger.info(f"Promoted canary {model_name} v{canary_version} to production")

        return success

    def rollback_canary(self, model_name: str) -> bool:
        """Rollback canary deployment"""

        if model_name not in self.canary_configs:
            return False

        config = self.canary_configs[model_name]
        canary_version = config["canary_version"]

        # Archive canary model
        success = self.registry.transition_model_stage(
            model_name, canary_version, ModelStage.ARCHIVED
        )

        if success:
            # Clean up canary config
            del self.canary_configs[model_name]

            logger.info(f"Rolled back canary {model_name} v{canary_version}")

        return success


# Global instances
model_registry = ModelRegistry()
drift_detector = DriftDetector()
explainability_engine = ExplainabilityEngine()
canary_manager = CanaryDeploymentManager(model_registry)

# Export main components
__all__ = [
    "ModelStage",
    "DriftStatus",
    "ModelVersion",
    "DriftMetrics",
    "ExplainabilityResult",
    "ModelRegistry",
    "DriftDetector",
    "ExplainabilityEngine",
    "CanaryDeploymentManager",
    "model_registry",
    "drift_detector",
    "explainability_engine",
    "canary_manager",
]
