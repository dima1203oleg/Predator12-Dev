"""
Агент для детекції аномалій
"""

from __future__ import annotations

import numpy as np
from typing import Any
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

from .base_agent import BaseAgent


class AnomalyDetectionAgent(BaseAgent):
    """Агент для виявлення аномалій в даних"""
    
    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__("AnomalyDetectionAgent", config)
        self.models = {}  # Кеш навчених моделей
        
    def capabilities(self) -> list[str]:
        return [
            "detect_anomalies",
            "train_anomaly_model",
            "evaluate_model",
            "get_anomaly_score",
            "set_threshold"
        ]
        
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання з детекції аномалій"""
        
        self.logger.info("Processing anomaly detection task", task_type=task_type)
        
        if task_type == "detect_anomalies":
            return await self._detect_anomalies(payload)
        elif task_type == "train_anomaly_model":
            return await self._train_anomaly_model(payload)
        elif task_type == "evaluate_model":
            return await self._evaluate_model(payload)
        elif task_type == "get_anomaly_score":
            return await self._get_anomaly_score(payload)
        elif task_type == "set_threshold":
            return await self._set_threshold(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _detect_anomalies(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Виявляє аномалії в датасеті"""
        
        dataset_id = payload.get("dataset_id")
        model_type = payload.get("model_type", "isolation_forest")
        threshold = payload.get("threshold", 0.1)
        
        try:
            # У реальній реалізації тут буде завантаження датасету
            # Поки що симулюємо роботу з фейковими даними
            n_samples = payload.get("n_samples", 1000)
            n_features = payload.get("n_features", 10)
            
            # Симуляція виявлення аномалій
            if model_type == "isolation_forest":
                contamination = payload.get("contamination", 0.1)
                model = IsolationForest(contamination=contamination, random_state=42)
                
                # У реальній реалізації тут буде справжні дані
                X = np.random.randn(n_samples, n_features)
                anomaly_scores = model.fit_predict(X)
                
                anomalies = np.where(anomaly_scores == -1)[0].tolist()
                
            elif model_type == "statistical":
                # Статистичний метод (z-score)
                z_threshold = payload.get("z_threshold", 3.0)
                X = np.random.randn(n_samples, n_features)
                
                # Обчислення z-score для кожної ознаки
                z_scores = np.abs((X - np.mean(X, axis=0)) / np.std(X, axis=0))
                anomalies = np.where(np.any(z_scores > z_threshold, axis=1))[0].tolist()
                
            else:
                raise ValueError(f"Unknown model type: {model_type}")
                
            return {
                "status": "success",
                "dataset_id": dataset_id,
                "model_type": model_type,
                "anomalies_count": len(anomalies),
                "anomalies_indices": anomalies[:100],  # Обмежуємо вивід
                "anomaly_rate": len(anomalies) / n_samples,
                "threshold": threshold,
                "parameters": payload
            }
            
        except Exception as e:
            self.logger.error("Failed to detect anomalies", error=str(e), dataset_id=dataset_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _train_anomaly_model(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Навчає модель для детекції аномалій"""
        
        dataset_id = payload.get("dataset_id")
        model_type = payload.get("model_type", "isolation_forest")
        model_params = payload.get("model_params", {})
        
        try:
            model_id = f"{dataset_id}_{model_type}"
            
            if model_type == "isolation_forest":
                contamination = model_params.get("contamination", 0.1)
                n_estimators = model_params.get("n_estimators", 100)
                max_samples = model_params.get("max_samples", "auto")
                
                model = IsolationForest(
                    contamination=contamination,
                    n_estimators=n_estimators,
                    max_samples=max_samples,
                    random_state=42
                )
                
                # У реальній реалізації тут буде завантаження справжніх даних
                n_samples = payload.get("n_samples", 10000)
                n_features = payload.get("n_features", 20)
                X = np.random.randn(n_samples, n_features)
                
                # Навчання моделі
                model.fit(X)
                
                # Збереження моделі в кеші
                self.models[model_id] = {
                    "model": model,
                    "scaler": None,
                    "metadata": {
                        "model_type": model_type,
                        "dataset_id": dataset_id,
                        "n_samples": n_samples,
                        "n_features": n_features,
                        "parameters": model_params
                    }
                }
                
            else:
                raise ValueError(f"Unknown model type: {model_type}")
                
            return {
                "status": "success",
                "model_id": model_id,
                "model_type": model_type,
                "dataset_id": dataset_id,
                "parameters": model_params,
                "trained_at": "2024-01-01T00:00:00Z"
            }
            
        except Exception as e:
            self.logger.error("Failed to train anomaly model", error=str(e), dataset_id=dataset_id)
            return {
                "status": "error", 
                "error": str(e)
            }
    
    async def _evaluate_model(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Оцінює якість моделі детекції аномалій"""
        
        model_id = payload.get("model_id")
        test_dataset_id = payload.get("test_dataset_id")
        
        if model_id not in self.models:
            return {
                "status": "error",
                "error": f"Model {model_id} not found"
            }
        
        try:
            model_info = self.models[model_id]
            model = model_info["model"]
            
            # У реальній реалізації тут буде завантаження тестових даних
            n_samples = 1000
            n_features = model_info["metadata"]["n_features"]
            X_test = np.random.randn(n_samples, n_features)
            
            # Передбачення аномалій
            predictions = model.predict(X_test)
            anomaly_scores = model.decision_function(X_test)
            
            # Підрахунок метрик (у реальній системі з ground truth)
            n_anomalies = len(np.where(predictions == -1)[0])
            anomaly_rate = n_anomalies / n_samples
            
            return {
                "status": "success",
                "model_id": model_id,
                "test_dataset_id": test_dataset_id,
                "metrics": {
                    "anomaly_rate": anomaly_rate,
                    "n_anomalies": n_anomalies,
                    "n_samples": n_samples,
                    "mean_anomaly_score": float(np.mean(anomaly_scores)),
                    "std_anomaly_score": float(np.std(anomaly_scores))
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to evaluate model", error=str(e), model_id=model_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _get_anomaly_score(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Отримує оцінку аномальності для конкретних точок"""
        
        model_id = payload.get("model_id")
        data_points = payload.get("data_points", [])
        
        if model_id not in self.models:
            return {
                "status": "error",
                "error": f"Model {model_id} not found"
            }
        
        try:
            model_info = self.models[model_id]
            model = model_info["model"]
            
            # Конвертація в numpy array
            X = np.array(data_points)
            
            # Отримання оцінок
            predictions = model.predict(X)
            scores = model.decision_function(X)
            
            results = []
            for i, (pred, score) in enumerate(zip(predictions, scores)):
                results.append({
                    "index": i,
                    "is_anomaly": bool(pred == -1),
                    "anomaly_score": float(score),
                    "confidence": float(abs(score))  # Простий розрахунок впевненості
                })
                
            return {
                "status": "success",
                "model_id": model_id,
                "results": results,
                "summary": {
                    "total_points": len(data_points),
                    "anomalies_detected": sum(1 for r in results if r["is_anomaly"]),
                    "mean_score": float(np.mean(scores))
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to get anomaly scores", error=str(e), model_id=model_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _set_threshold(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Встановлює поріг для класифікації аномалій"""
        
        model_id = payload.get("model_id")
        threshold = payload.get("threshold")
        
        if model_id not in self.models:
            return {
                "status": "error",
                "error": f"Model {model_id} not found"
            }
        
        # Оновлення порогу в метаданих моделі
        self.models[model_id]["metadata"]["threshold"] = threshold
        
        return {
            "status": "success",
            "model_id": model_id,
            "new_threshold": threshold,
            "updated_at": "2024-01-01T00:00:00Z"
        }
