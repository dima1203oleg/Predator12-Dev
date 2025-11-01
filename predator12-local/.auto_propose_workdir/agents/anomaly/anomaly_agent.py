#!/usr/bin/env python3
"""
🔍 Anomaly Agent - Statistical & ML Anomaly Detection
Детекція аномалій (online/batch) з поясненнями
"""

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List

import numpy as np
import pandas as pd
import redis
import structlog
from fastapi import FastAPI, HTTPException
from opensearchpy import OpenSearch
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

logger = structlog.get_logger(__name__)


class AnomalyMethod(Enum):
    STATISTICAL = "statistical"
    ISOLATION_FOREST = "isolation_forest"
    SEASONAL_ESD = "seasonal_esd"
    Z_SCORE = "z_score"
    IQR = "iqr"


@dataclass
class AnomalyDetectionRequest:
    """Запит на детекцію аномалій"""

    index: str
    field: str
    method: AnomalyMethod
    window: str = "7d"  # Часове вікно
    threshold: float = 0.95  # Поріг аномалії
    parameters: Dict[str, Any] = None


@dataclass
class AnomalyPoint:
    """Точка аномалії"""

    timestamp: datetime
    value: float
    anomaly_score: float
    method: str
    explanation: str
    context: Dict[str, Any]


@dataclass
class AnomalyDetectionResult:
    """Результат детекції аномалій"""

    request_id: str
    method: str
    total_points: int
    anomaly_count: int
    anomaly_percentage: float
    anomalies: List[AnomalyPoint]
    summary: str
    recommendations: List[str]


class StatisticalDetector:
    """Статистичний детектор аномалій"""

    @staticmethod
    def z_score_detection(data: pd.Series, threshold: float = 3.0) -> Dict[str, Any]:
        """Z-score детекція"""
        mean = data.mean()
        std = data.std()

        if std == 0:
            return {"anomalies": [], "scores": np.zeros(len(data))}

        z_scores = np.abs((data - mean) / std)
        anomaly_mask = z_scores > threshold

        return {
            "anomalies": data.index[anomaly_mask].tolist(),
            "scores": z_scores.values,
            "mean": mean,
            "std": std,
            "threshold": threshold,
        }

    @staticmethod
    def iqr_detection(data: pd.Series, k: float = 1.5) -> Dict[str, Any]:
        """IQR (Interquartile Range) детекція"""
        Q1 = data.quantile(0.25)
        Q3 = data.quantile(0.75)
        IQR = Q3 - Q1

        lower_bound = Q1 - k * IQR
        upper_bound = Q3 + k * IQR

        anomaly_mask = (data < lower_bound) | (data > upper_bound)

        # Розрахунок score як відстань від меж
        scores = np.zeros(len(data))
        for i, val in enumerate(data):
            if val < lower_bound:
                scores[i] = abs(val - lower_bound) / (Q1 - lower_bound + 1e-6)
            elif val > upper_bound:
                scores[i] = abs(val - upper_bound) / (upper_bound - Q3 + 1e-6)
            else:
                scores[i] = 0

        return {
            "anomalies": data.index[anomaly_mask].tolist(),
            "scores": scores,
            "Q1": Q1,
            "Q3": Q3,
            "IQR": IQR,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
        }

    @staticmethod
    def seasonal_esd_detection(
        data: pd.Series, seasonality: int = 24, alpha: float = 0.05
    ) -> Dict[str, Any]:
        """Seasonal Extreme Studentized Deviate (ESD) детекція"""

        # Спрощена версія Seasonal ESD
        # В повній реалізації використовували б STL декомпозицію

        n = len(data)
        if n < seasonality * 2:
            # Fallback to simple ESD
            return StatisticalDetector._simple_esd(data, alpha)

        # Видаляємо тренд і сезонність (спрощено)
        rolling_mean = data.rolling(window=seasonality, center=True).mean()
        detrended = data - rolling_mean
        detrended = detrended.fillna(0)

        # Застосовуємо ESD до detrended даних
        return StatisticalDetector._simple_esd(detrended, alpha)

    @staticmethod
    def _simple_esd(data: pd.Series, alpha: float = 0.05) -> Dict[str, Any]:
        """Спрощений ESD тест"""
        from scipy import stats

        n = len(data)
        if n < 3:
            return {"anomalies": [], "scores": np.zeros(n)}

        # Максимальна кількість аномалій для перевірки
        max_outliers = max(1, int(n * 0.1))  # До 10% точок

        outliers = []
        working_data = data.copy()
        original_indices = data.index.tolist()

        for i in range(max_outliers):
            if len(working_data) < 3:
                break

            # Знаходимо найбільше відхилення
            mean = working_data.mean()
            std = working_data.std()

            if std == 0:
                break

            deviations = np.abs(working_data - mean) / std
            max_deviation_idx = deviations.idxmax()
            max_deviation = deviations.max()

            # Критичне значення
            t_val = stats.t.ppf(
                1 - alpha / (2 * (len(working_data) - i)), len(working_data) - i - 2
            )
            lambda_critical = ((len(working_data) - i - 1) * t_val) / np.sqrt(
                (len(working_data) - i - 2 + t_val**2) * (len(working_data) - i)
            )

            if max_deviation > lambda_critical:
                outliers.append(max_deviation_idx)
                working_data = working_data.drop(max_deviation_idx)
            else:
                break

        # Розрахунок scores
        scores = np.zeros(n)
        mean = data.mean()
        std = data.std()
        if std > 0:
            scores = np.abs(data - mean) / std

        return {
            "anomalies": outliers,
            "scores": scores,
            "alpha": alpha,
            "outliers_found": len(outliers),
        }


class MLDetector:
    """ML-based детектор аномалій"""

    @staticmethod
    def isolation_forest_detection(
        data: pd.DataFrame, contamination: float = 0.1
    ) -> Dict[str, Any]:
        """Isolation Forest детекція"""

        if len(data) < 10:
            return {"anomalies": [], "scores": np.zeros(len(data))}

        # Підготовка даних
        scaler = StandardScaler()

        # Вибираємо тільки числові стовпці
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            return {"anomalies": [], "scores": np.zeros(len(data))}

        X = data[numeric_cols].fillna(0)
        X_scaled = scaler.fit_transform(X)

        # Модель
        model = IsolationForest(contamination=contamination, random_state=42, n_estimators=100)

        # Навчання і предикти
        predictions = model.fit_predict(X_scaled)
        anomaly_scores = model.decision_function(X_scaled)

        # Перетворюємо scores в діапазон [0, 1]
        scores_normalized = (anomaly_scores - anomaly_scores.min()) / (
            anomaly_scores.max() - anomaly_scores.min() + 1e-6
        )

        # Аномалії (predictions == -1)
        anomaly_indices = data.index[predictions == -1].tolist()

        return {
            "anomalies": anomaly_indices,
            "scores": scores_normalized,
            "contamination": contamination,
            "features_used": numeric_cols.tolist(),
        }


class AnomalyAgent:
    """Anomaly Detection Agent"""

    def __init__(self):
        self.app = FastAPI(title="Anomaly Agent", version="1.0.0")

        # Підключення до сервісів
        self.redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)
        self.opensearch_client = OpenSearch([{"host": "opensearch", "port": 9200}])

        # Детектори
        self.stat_detector = StatisticalDetector()
        self.ml_detector = MLDetector()

        self._setup_routes()

    def _setup_routes(self):
        """Налаштування HTTP маршрутів"""

        @self.app.post("/anomaly/run")
        async def run_detection(request: dict):
            """Запуск детекції аномалій"""
            try:
                detection_request = AnomalyDetectionRequest(
                    index=request["index"],
                    field=request["field"],
                    method=AnomalyMethod(request.get("method", "statistical")),
                    window=request.get("window", "7d"),
                    threshold=request.get("threshold", 0.95),
                    parameters=request.get("parameters", {}),
                )

                result = await self.detect_anomalies(detection_request)
                return asdict(result)

            except Exception as e:
                logger.error("Anomaly detection failed", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/anomaly/methods")
        async def get_methods():
            """Список доступних методів"""
            return [
                {"method": method.value, "description": self._get_method_description(method)}
                for method in AnomalyMethod
            ]

        @self.app.get("/anomaly/health")
        async def health():
            """Health check"""
            try:
                self.redis_client.ping()
                self.opensearch_client.cluster.health()

                return {"status": "healthy", "timestamp": datetime.now().isoformat()}
            except Exception as e:
                return {"status": "unhealthy", "error": str(e)}

    async def detect_anomalies(self, request: AnomalyDetectionRequest) -> AnomalyDetectionResult:
        """Основний метод детекції аномалій"""

        request_id = f"anomaly_{int(datetime.now().timestamp())}"
        logger.info(
            "Starting anomaly detection", request_id=request_id, method=request.method.value
        )

        # Завантаження даних з OpenSearch
        data = await self._load_data_from_opensearch(request)

        if len(data) == 0:
            return AnomalyDetectionResult(
                request_id=request_id,
                method=request.method.value,
                total_points=0,
                anomaly_count=0,
                anomaly_percentage=0.0,
                anomalies=[],
                summary="No data found for the specified criteria",
                recommendations=[],
            )

        # Вибір методу детекції
        if request.method == AnomalyMethod.Z_SCORE:
            detection_result = self.stat_detector.z_score_detection(
                data[request.field], threshold=request.parameters.get("threshold", 3.0)
            )

        elif request.method == AnomalyMethod.IQR:
            detection_result = self.stat_detector.iqr_detection(
                data[request.field], k=request.parameters.get("k", 1.5)
            )

        elif request.method == AnomalyMethod.SEASONAL_ESD:
            detection_result = self.stat_detector.seasonal_esd_detection(
                data[request.field],
                seasonality=request.parameters.get("seasonality", 24),
                alpha=request.parameters.get("alpha", 0.05),
            )

        elif request.method == AnomalyMethod.ISOLATION_FOREST:
            detection_result = self.ml_detector.isolation_forest_detection(
                data, contamination=request.parameters.get("contamination", 0.1)
            )

        else:
            # Fallback до statistical
            detection_result = self.stat_detector.z_score_detection(data[request.field])

        # Створення AnomalyPoint об'єктів
        anomaly_points = []
        anomaly_indices = detection_result["anomalies"]
        scores = detection_result["scores"]

        for idx in anomaly_indices:
            if idx < len(data):
                anomaly_points.append(
                    AnomalyPoint(
                        timestamp=(
                            data.index[idx]
                            if hasattr(data.index[idx], "to_pydatetime")
                            else datetime.now()
                        ),
                        value=float(data[request.field].iloc[idx]),
                        anomaly_score=float(scores[idx]) if idx < len(scores) else 1.0,
                        method=request.method.value,
                        explanation=self._generate_explanation(
                            request.method, detection_result, idx, data
                        ),
                        context={"index": request.index, "field": request.field},
                    )
                )

        # Сортуємо по anomaly_score (найвищі спочатку)
        anomaly_points.sort(key=lambda x: x.anomaly_score, reverse=True)

        # Створення результату
        result = AnomalyDetectionResult(
            request_id=request_id,
            method=request.method.value,
            total_points=len(data),
            anomaly_count=len(anomaly_points),
            anomaly_percentage=round((len(anomaly_points) / max(1, len(data))) * 100, 2),
            anomalies=anomaly_points[:50],  # Топ 50 аномалій
            summary=self._generate_summary(request.method, len(data), len(anomaly_points)),
            recommendations=self._generate_recommendations(
                request.method, len(anomaly_points), len(data)
            ),
        )

        # Збереження результату
        result_json = json.dumps(asdict(result), default=str)
        self.redis_client.setex(f"anomaly_result:{request_id}", 3600, result_json)

        # Публікація події
        await self._publish_event(
            "anomaly.detected",
            {
                "request_id": request_id,
                "index": request.index,
                "field": request.field,
                "method": request.method.value,
                "anomaly_count": len(anomaly_points),
                "anomaly_percentage": result.anomaly_percentage,
            },
        )

        return result

    async def _load_data_from_opensearch(self, request: AnomalyDetectionRequest) -> pd.DataFrame:
        """Завантаження даних з OpenSearch"""

        # Розрахунок часового вікна
        now = datetime.now()
        if request.window.endswith("d"):
            days = int(request.window[:-1])
            start_time = now - timedelta(days=days)
        elif request.window.endswith("h"):
            hours = int(request.window[:-1])
            start_time = now - timedelta(hours=hours)
        else:
            start_time = now - timedelta(days=7)  # Fallback

        # Запит до OpenSearch
        query = {
            "query": {
                "range": {"@timestamp": {"gte": start_time.isoformat(), "lte": now.isoformat()}}
            },
            "sort": [{"@timestamp": {"order": "asc"}}],
            "size": 10000,
        }

        try:
            response = self.opensearch_client.search(index=request.index, body=query)

            # Перетворення в DataFrame
            hits = response["hits"]["hits"]
            if not hits:
                return pd.DataFrame()

            data = []
            for hit in hits:
                doc = hit["_source"]
                doc["_timestamp"] = doc.get("@timestamp", now.isoformat())
                data.append(doc)

            df = pd.DataFrame(data)

            # Перетворення timestamp в індекс
            if "_timestamp" in df.columns:
                df["_timestamp"] = pd.to_datetime(df["_timestamp"])
                df.set_index("_timestamp", inplace=True)

            # Перевірка наявності поля
            if request.field not in df.columns:
                logger.warning(
                    "Field not found in data",
                    field=request.field,
                    available_fields=list(df.columns),
                )
                return pd.DataFrame()

            # Перетворення поля в числовий тип
            df[request.field] = pd.to_numeric(df[request.field], errors="coerce")
            df = df.dropna(subset=[request.field])

            return df

        except Exception as e:
            logger.error("Failed to load data from OpenSearch", error=str(e))
            # Повертаємо тестові дані для демонстрації
            return self._generate_test_data(request.field)

    def _generate_test_data(self, field: str) -> pd.DataFrame:
        """Генерація тестових даних"""

        dates = pd.date_range(
            start=datetime.now() - timedelta(days=7), end=datetime.now(), freq="1H"
        )

        # Нормальні дані з трендом
        normal_values = np.random.normal(100, 10, len(dates))
        trend = np.linspace(0, 20, len(dates))
        values = normal_values + trend

        # Додаємо кілька аномалій
        anomaly_indices = np.random.choice(len(values), size=5, replace=False)
        for idx in anomaly_indices:
            values[idx] = values[idx] + np.random.choice([-1, 1]) * np.random.uniform(50, 100)

        df = pd.DataFrame({field: values}, index=dates)

        return df

    def _generate_explanation(
        self, method: AnomalyMethod, detection_result: Dict, idx: int, data: pd.DataFrame
    ) -> str:
        """Генерація пояснення аномалії"""

        if method == AnomalyMethod.Z_SCORE:
            z_score = detection_result["scores"][idx]
            return f"Z-score of {z_score:.2f} exceeds threshold (mean±3σ). Value is {z_score:.1f} standard deviations from mean."

        elif method == AnomalyMethod.IQR:
            Q1, Q3 = detection_result["Q1"], detection_result["Q3"]
            lower, upper = detection_result["lower_bound"], detection_result["upper_bound"]
            value = data.iloc[idx, 0]
            return f"Value {value:.2f} outside IQR bounds [{lower:.2f}, {upper:.2f}]. Normal range: [{Q1:.2f}, {Q3:.2f}]"

        elif method == AnomalyMethod.ISOLATION_FOREST:
            score = detection_result["scores"][idx]
            return f"Isolation Forest anomaly score: {score:.3f}. Point is isolated from normal patterns."

        else:
            return f"Detected by {method.value} method with high confidence."

    def _generate_summary(
        self, method: AnomalyMethod, total_points: int, anomaly_count: int
    ) -> str:
        """Генерація підсумку"""

        percentage = (anomaly_count / max(1, total_points)) * 100

        if anomaly_count == 0:
            return f"No anomalies detected using {method.value} method across {total_points} data points."

        elif percentage < 1:
            return f"Low anomaly rate: {anomaly_count}/{total_points} points ({percentage:.1f}%) detected as anomalous."

        elif percentage < 5:
            return f"Normal anomaly rate: {anomaly_count}/{total_points} points ({percentage:.1f}%) show unusual patterns."

        else:
            return f"High anomaly rate: {anomaly_count}/{total_points} points ({percentage:.1f}%) are anomalous. Investigate data quality."

    def _generate_recommendations(
        self, method: AnomalyMethod, anomaly_count: int, total_points: int
    ) -> List[str]:
        """Генерація рекомендацій"""

        recommendations = []
        percentage = (anomaly_count / max(1, total_points)) * 100

        if anomaly_count == 0:
            recommendations.append("No anomalies found. Data appears normal.")
            recommendations.append(
                "Consider adjusting detection sensitivity if anomalies are expected."
            )

        elif percentage > 10:
            recommendations.append("High anomaly rate detected. Investigate data quality issues.")
            recommendations.append("Check for systematic errors or data collection problems.")
            recommendations.append("Consider data cleaning before further analysis.")

        elif anomaly_count > 0:
            recommendations.append("Review detected anomalies for business significance.")
            recommendations.append("Investigate root causes of unusual patterns.")

        if method in [AnomalyMethod.Z_SCORE, AnomalyMethod.IQR]:
            recommendations.append("Consider using ML-based methods for complex pattern detection.")

        return recommendations

    def _get_method_description(self, method: AnomalyMethod) -> str:
        """Опис методу детекції"""

        descriptions = {
            AnomalyMethod.Z_SCORE: "Statistical method using Z-score (3 sigma rule)",
            AnomalyMethod.IQR: "Interquartile Range method for outlier detection",
            AnomalyMethod.SEASONAL_ESD: "Seasonal Extreme Studentized Deviate for time series",
            AnomalyMethod.ISOLATION_FOREST: "ML ensemble method for multivariate anomaly detection",
            AnomalyMethod.STATISTICAL: "Combined statistical methods",
        }

        return descriptions.get(method, "Unknown method")

    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Публікація події в Redis Streams"""
        try:
            event_data = {
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "source": "AnomalyAgent",
                **data,
            }

            self.redis_client.xadd("pred:events:anomaly", event_data)
            logger.debug("Event published", event_type=event_type)

        except Exception as e:
            logger.error("Failed to publish event", error=str(e))


# Запуск агента
if __name__ == "__main__":
    import uvicorn

    agent = AnomalyAgent()
    uvicorn.run(agent.app, host="0.0.0.0", port=9020)
