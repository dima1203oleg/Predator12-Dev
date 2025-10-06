"""
MLOps Enhanced Manager - Дельта-ревізія 1.2
MLflow registry, canary deployment, drift detection, SHAP explanations
"""

import logging
import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

try:
    import mlflow
    import mlflow.tracking
    import shap
    from mlflow.tracking import MlflowClient
    from scipy import stats

    MLFLOW_AVAILABLE = True
except ImportError:
    MLFLOW_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("⚠️  MLflow not available, using mock implementation")

logger = logging.getLogger(__name__)


class ModelStage(Enum):
    """Стадії моделі в MLflow"""

    STAGING = "Staging"
    PRODUCTION = "Production"
    ARCHIVED = "Archived"


class DriftStatus(Enum):
    """Статус drift detection"""

    NO_DRIFT = "no_drift"
    DRIFT_DETECTED = "drift_detected"
    SEVERE_DRIFT = "severe_drift"


class CanaryStatus(Enum):
    """Статус canary deployment"""

    PREPARING = "preparing"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    ROLLBACK = "rollback"


class ModelMetrics:
    """Метрики моделі"""

    def __init__(self):
        self.accuracy: Optional[float] = None
        self.precision: Optional[float] = None
        self.recall: Optional[float] = None
        self.f1_score: Optional[float] = None
        self.auc_roc: Optional[float] = None
        self.drift_score: Optional[float] = None
        self.prediction_latency_ms: Optional[float] = None
        self.timestamp: datetime = datetime.now()


class CanaryDeployment:
    """Canary deployment конфігурація"""

    def __init__(
        self,
        deployment_id: str,
        model_name: str,
        candidate_version: str,
        production_version: str,
        traffic_percentage: int = 10,
        success_threshold: float = 0.95,
        max_duration_hours: int = 24,
    ):
        self.deployment_id = deployment_id
        self.model_name = model_name
        self.candidate_version = candidate_version
        self.production_version = production_version
        self.traffic_percentage = traffic_percentage
        self.success_threshold = success_threshold
        self.max_duration_hours = max_duration_hours
        self.status = CanaryStatus.PREPARING
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
        self.metrics: Dict[str, Any] = {}
        self.requests_served = 0
        self.success_rate = 0.0


class DriftDetector:
    """Детектор drift'а данных"""

    def __init__(
        self,
        baseline_data: Optional[np.ndarray] = None,
        psi_threshold: float = 0.1,
        ks_threshold: float = 0.05,
    ):
        self.baseline_data = baseline_data
        self.psi_threshold = psi_threshold  # Population Stability Index
        self.ks_threshold = ks_threshold  # Kolmogorov-Smirnov test
        self.feature_stats: Dict[str, Any] = {}

    def calculate_psi(self, baseline: np.ndarray, current: np.ndarray, bins: int = 10) -> float:
        """Вычисление Population Stability Index"""
        try:
            # Определяем границы бинов на основе baseline
            _, bin_edges = np.histogram(baseline, bins=bins)

            # Распределения для baseline и current
            baseline_counts, _ = np.histogram(baseline, bins=bin_edges)
            current_counts, _ = np.histogram(current, bins=bin_edges)

            # Нормализация в проценты
            baseline_percents = baseline_counts / len(baseline) + 1e-10  # Избегаем деления на 0
            current_percents = current_counts / len(current) + 1e-10

            # Вычисление PSI
            psi = np.sum(
                (current_percents - baseline_percents)
                * np.log(current_percents / baseline_percents)
            )

            return float(psi)

        except Exception as e:
            logger.error(f"❌ Error calculating PSI: {e}")
            return 0.0

    def kolmogorov_smirnov_test(
        self, baseline: np.ndarray, current: np.ndarray
    ) -> Tuple[float, float]:
        """Kolmogorov-Smirnov тест"""
        try:
            ks_statistic, p_value = stats.ks_2samp(baseline, current)
            return float(ks_statistic), float(p_value)
        except Exception as e:
            logger.error(f"❌ Error in KS test: {e}")
            return 0.0, 1.0

    def detect_drift(
        self, current_data: np.ndarray, feature_name: str = "feature"
    ) -> Dict[str, Any]:
        """Основной метод детекции drift'а"""
        if self.baseline_data is None:
            return {
                "drift_status": DriftStatus.NO_DRIFT.value,
                "error": "No baseline data available",
            }

        # PSI calculation
        psi_score = self.calculate_psi(self.baseline_data, current_data)

        # KS test
        ks_statistic, ks_p_value = self.kolmogorov_smirnov_test(self.baseline_data, current_data)

        # Определяем статус drift'а
        drift_status = DriftStatus.NO_DRIFT
        if psi_score > self.psi_threshold or ks_p_value < self.ks_threshold:
            if psi_score > self.psi_threshold * 2:  # Серьезный drift
                drift_status = DriftStatus.SEVERE_DRIFT
            else:
                drift_status = DriftStatus.DRIFT_DETECTED

        result = {
            "feature_name": feature_name,
            "drift_status": drift_status.value,
            "psi_score": psi_score,
            "psi_threshold": self.psi_threshold,
            "ks_statistic": ks_statistic,
            "ks_p_value": ks_p_value,
            "ks_threshold": self.ks_threshold,
            "baseline_samples": len(self.baseline_data),
            "current_samples": len(current_data),
            "timestamp": datetime.now().isoformat(),
        }

        return result


class MLOpsEnhancedManager:
    """Расширений MLOps менеджер"""

    def __init__(self, mlflow_tracking_uri: str = "http://localhost:5000"):
        self.mlflow_tracking_uri = mlflow_tracking_uri
        self.mlflow_client: Optional[MlflowClient] = None
        self.models_registry: Dict[str, Dict] = {}
        self.canary_deployments: Dict[str, CanaryDeployment] = {}
        self.drift_detectors: Dict[str, DriftDetector] = {}
        self.shap_explainers: Dict[str, Any] = {}

        # Кеш для предсказаний і пояснень
        self.prediction_cache: Dict[str, Any] = {}

    async def initialize(self):
        """Ініціалізація MLOps manager"""
        logger.info("🚀 Initializing MLOps Enhanced Manager...")

        if MLFLOW_AVAILABLE:
            try:
                mlflow.set_tracking_uri(self.mlflow_tracking_uri)
                self.mlflow_client = MlflowClient(tracking_uri=self.mlflow_tracking_uri)
                logger.info(f"✅ Connected to MLflow: {self.mlflow_tracking_uri}")
            except Exception as e:
                logger.error(f"❌ Failed to connect to MLflow: {e}")
                self.mlflow_client = None
        else:
            logger.warning("⚠️  MLflow not available, using mock implementation")

        # Ініціалізуємо базові моделі
        await self._initialize_default_models()

    async def _initialize_default_models(self):
        """Ініціалізація стандартних моделей"""
        default_models = [
            {
                "name": "customs_anomaly_detector",
                "version": "1.0.0",
                "stage": ModelStage.PRODUCTION.value,
                "description": "Детектор аномалий в митних деклараціях",
            },
            {
                "name": "tax_risk_classifier",
                "version": "1.2.0",
                "stage": ModelStage.PRODUCTION.value,
                "description": "Классифікатор податкових ризиків",
            },
            {
                "name": "market_forecaster",
                "version": "2.1.0",
                "stage": ModelStage.STAGING.value,
                "description": "Прогнозування ринкових трендів",
            },
        ]

        for model_config in default_models:
            model_name = model_config["name"]
            self.models_registry[model_name] = model_config

            # Ініціалізуємо drift detector для кожної моделі
            if model_name not in self.drift_detectors:
                # Генеруємо baseline дані для прикладу
                baseline_data = np.random.normal(0, 1, 1000)
                self.drift_detectors[model_name] = DriftDetector(baseline_data=baseline_data)

        logger.info(f"✅ Initialized {len(default_models)} default models")

    def register_model_version(
        self,
        model_name: str,
        version: str,
        model_path: str,
        metrics: ModelMetrics,
        description: str = "",
    ) -> str:
        """Реєстрація нової версії моделі"""
        try:
            if self.mlflow_client and MLFLOW_AVAILABLE:
                # Реєстрація в MLflow
                run_id = str(uuid.uuid4())

                with mlflow.start_run(run_id=run_id):
                    # Логируем метрики
                    if metrics.accuracy is not None:
                        mlflow.log_metric("accuracy", metrics.accuracy)
                    if metrics.precision is not None:
                        mlflow.log_metric("precision", metrics.precision)
                    if metrics.recall is not None:
                        mlflow.log_metric("recall", metrics.recall)
                    if metrics.f1_score is not None:
                        mlflow.log_metric("f1_score", metrics.f1_score)

                    # Регистрируем модель
                    model_uri = f"runs:/{run_id}/model"

                    mv = mlflow.register_model(model_uri, model_name)

                logger.info(f"✅ Registered model {model_name} version {version} in MLflow")

            # Обновляем локальний реєстр
            self.models_registry[model_name] = {
                "name": model_name,
                "version": version,
                "stage": ModelStage.STAGING.value,
                "model_path": model_path,
                "metrics": metrics.__dict__,
                "description": description,
                "registered_at": datetime.now().isoformat(),
            }

            return version

        except Exception as e:
            logger.error(f"❌ Error registering model: {e}")
            return ""

    def transition_model_stage(self, model_name: str, version: str, stage: ModelStage) -> bool:
        """Перевод моделі в іншу стадію"""
        try:
            if self.mlflow_client and MLFLOW_AVAILABLE:
                self.mlflow_client.transition_model_version_stage(
                    name=model_name, version=version, stage=stage.value
                )
                logger.info(f"✅ Transitioned {model_name} v{version} to {stage.value}")

            # Обновляем локальний реєстр
            if model_name in self.models_registry:
                self.models_registry[model_name]["stage"] = stage.value
                self.models_registry[model_name]["updated_at"] = datetime.now().isoformat()

            return True

        except Exception as e:
            logger.error(f"❌ Error transitioning model stage: {e}")
            return False

    def start_canary_deployment(
        self, model_name: str, candidate_version: str, traffic_percentage: int = 10
    ) -> Optional[CanaryDeployment]:
        """Запуск canary deployment"""
        try:
            # Получаем текущую production версию
            production_version = "unknown"
            if model_name in self.models_registry:
                model_info = self.models_registry[model_name]
                if model_info["stage"] == ModelStage.PRODUCTION.value:
                    production_version = model_info["version"]

            deployment_id = str(uuid.uuid4())

            canary = CanaryDeployment(
                deployment_id=deployment_id,
                model_name=model_name,
                candidate_version=candidate_version,
                production_version=production_version,
                traffic_percentage=traffic_percentage,
            )

            canary.status = CanaryStatus.RUNNING
            canary.start_time = datetime.now()

            self.canary_deployments[deployment_id] = canary

            logger.info(
                f"🚀 Started canary deployment: {model_name} v{candidate_version} ({traffic_percentage}% traffic)"
            )
            return canary

        except Exception as e:
            logger.error(f"❌ Error starting canary deployment: {e}")
            return None

    def update_canary_metrics(self, deployment_id: str, success: bool, latency_ms: float = None):
        """Обновление метрик canary deployment"""
        if deployment_id not in self.canary_deployments:
            return False

        canary = self.canary_deployments[deployment_id]
        canary.requests_served += 1

        if success:
            canary.metrics.setdefault("successes", 0)
            canary.metrics["successes"] += 1
        else:
            canary.metrics.setdefault("failures", 0)
            canary.metrics["failures"] += 1

        # Обновляем success rate
        total_requests = canary.metrics.get("successes", 0) + canary.metrics.get("failures", 0)
        if total_requests > 0:
            canary.success_rate = canary.metrics.get("successes", 0) / total_requests

        # Добавляем latency
        if latency_ms is not None:
            latencies = canary.metrics.setdefault("latencies", [])
            latencies.append(latency_ms)

            # Сохраняем только последние 100 измерений
            if len(latencies) > 100:
                latencies.pop(0)

        return True

    def evaluate_canary_deployment(self, deployment_id: str) -> Dict[str, Any]:
        """Оцінка canary deployment і прийняття рішення"""
        if deployment_id not in self.canary_deployments:
            return {"error": "Deployment not found"}

        canary = self.canary_deployments[deployment_id]

        # Перевіряємо умови завершення
        duration_hours = 0
        if canary.start_time:
            duration_hours = (datetime.now() - canary.start_time).total_seconds() / 3600

        evaluation = {
            "deployment_id": deployment_id,
            "model_name": canary.model_name,
            "duration_hours": duration_hours,
            "requests_served": canary.requests_served,
            "success_rate": canary.success_rate,
            "success_threshold": canary.success_threshold,
            "recommendation": "continue",
        }

        # Перевірка на успіх
        if (
            canary.success_rate >= canary.success_threshold
            and canary.requests_served >= 100
            and duration_hours >= 1
        ):

            evaluation["recommendation"] = "promote"
            canary.status = CanaryStatus.SUCCESS

        # Перевірка на невдачу
        elif (
            canary.success_rate < canary.success_threshold * 0.8
            or duration_hours >= canary.max_duration_hours
        ):

            evaluation["recommendation"] = "rollback"
            canary.status = CanaryStatus.FAILED

        return evaluation

    def detect_model_drift(self, model_name: str, current_data: np.ndarray) -> Dict[str, Any]:
        """Детекція drift'а для моделі"""
        if model_name not in self.drift_detectors:
            return {"error": "Drift detector not found for model"}

        detector = self.drift_detectors[model_name]
        drift_result = detector.detect_drift(current_data, feature_name=f"{model_name}_features")

        # Сохраняем результат для мониторинга
        drift_key = f"drift_{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.prediction_cache[drift_key] = drift_result

        # Алерт при обнаружении drift'а
        if drift_result["drift_status"] != DriftStatus.NO_DRIFT.value:
            logger.warning(
                f"🚨 Model drift detected for {model_name}: {drift_result['drift_status']}"
            )

        return drift_result

    def generate_prediction_explanation(
        self, model_name: str, prediction_result: Any, feature_values: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Генерація пояснення предсказання з допомогою SHAP"""
        try:
            # Мок пояснення, так як справжній SHAP вимагає навченої моделі
            explanation = {
                "model_name": model_name,
                "prediction": str(prediction_result),
                "explanation_type": "shap_mock",
                "feature_importance": {},
                "summary": "",
                "timestamp": datetime.now().isoformat(),
            }

            # Генерируем мок важности признаков
            total_features = len(feature_values)
            remaining_importance = 1.0

            for i, (feature_name, feature_value) in enumerate(feature_values.items()):
                if i == total_features - 1:  # Последний признак получает оставшуюся важность
                    importance = remaining_importance
                else:
                    importance = np.random.uniform(0.05, remaining_importance * 0.3)
                    remaining_importance -= importance

                explanation["feature_importance"][feature_name] = {
                    "value": feature_value,
                    "importance": round(importance, 3),
                    "contribution": "positive" if importance > 0.1 else "negative",
                }

            # Створюємо summary без backslash в f-string
            importance_key = "importance"
            explanation["summary"] = (
                f"Основні факторы рішення: "
                f"{', '.join([f'{feat} ({info[importance_key]:.1%})' for feat, info in top_features])}"
            )

            return explanation

        except Exception as e:
            logger.error(f"❌ Error generating explanation: {e}")
            return {"error": str(e), "explanation": "Объяснение недоступно"}

    def get_model_registry_status(self) -> Dict[str, Any]:
        """Статус реєстра моделей"""
        status = {
            "total_models": len(self.models_registry),
            "by_stage": {},
            "active_canaries": len(
                [c for c in self.canary_deployments.values() if c.status == CanaryStatus.RUNNING]
            ),
            "drift_detectors": len(self.drift_detectors),
            "models": [],
        }

        for model_name, model_info in self.models_registry.items():
            stage = model_info.get("stage", "unknown")
            if stage not in status["by_stage"]:
                status["by_stage"][stage] = 0
            status["by_stage"][stage] += 1

            # Інформація про модель
            model_summary = {
                "name": model_name,
                "version": model_info.get("version", "unknown"),
                "stage": stage,
                "description": model_info.get("description", ""),
                "has_drift_detector": model_name in self.drift_detectors,
                "registered_at": model_info.get("registered_at", ""),
            }

            status["models"].append(model_summary)

        return status

    def get_canary_deployments_status(self) -> List[Dict[str, Any]]:
        """Статус всіх canary deployments"""
        canaries = []

        for deployment_id, canary in self.canary_deployments.items():
            canary_info = {
                "deployment_id": deployment_id,
                "model_name": canary.model_name,
                "candidate_version": canary.candidate_version,
                "production_version": canary.production_version,
                "traffic_percentage": canary.traffic_percentage,
                "status": canary.status.value,
                "requests_served": canary.requests_served,
                "success_rate": canary.success_rate,
                "start_time": canary.start_time.isoformat() if canary.start_time else None,
                "end_time": canary.end_time.isoformat() if canary.end_time else None,
            }

            canaries.append(canary_info)

        return canaries


# Singleton instance
mlops_manager = MLOpsEnhancedManager()


async def get_mlops_manager() -> MLOpsEnhancedManager:
    """Отримання MLOps manager"""
    return mlops_manager
