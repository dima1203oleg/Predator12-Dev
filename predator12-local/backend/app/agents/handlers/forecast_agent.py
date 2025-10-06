"""
Агент для прогнозування та передбачення трендів
"""

from __future__ import annotations

import numpy as np
from typing import Any
from datetime import datetime, timedelta

from .base_agent import BaseAgent


class ForecastAgent(BaseAgent):
    """Агент для прогнозування часових рядів та трендів"""
    
    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__("ForecastAgent", config)
        self.models = {}  # Кеш навчених моделей прогнозування
        
    def capabilities(self) -> list[str]:
        return [
            "train_forecast_model",
            "make_forecast",
            "evaluate_forecast", 
            "detect_trends",
            "predict_seasonality",
            "anomaly_forecast"
        ]
        
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання прогнозування"""
        
        self.logger.info("Processing forecast task", task_type=task_type)
        
        if task_type == "train_forecast_model":
            return await self._train_forecast_model(payload)
        elif task_type == "make_forecast":
            return await self._make_forecast(payload)
        elif task_type == "evaluate_forecast":
            return await self._evaluate_forecast(payload)
        elif task_type == "detect_trends":
            return await self._detect_trends(payload)
        elif task_type == "predict_seasonality":
            return await self._predict_seasonality(payload)
        elif task_type == "anomaly_forecast":
            return await self._anomaly_forecast(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _train_forecast_model(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Навчає модель прогнозування"""
        
        dataset_id = payload.get("dataset_id")
        model_type = payload.get("model_type", "arima")
        target_column = payload.get("target_column")
        time_column = payload.get("time_column")
        model_params = payload.get("model_params", {})
        
        try:
            model_id = f"{dataset_id}_{model_type}_{target_column}"
            
            # У реальній реалізації тут буде завантаження справжніх даних
            n_points = payload.get("n_points", 1000)
            
            if model_type == "arima":
                # Симуляція навчання ARIMA моделі
                order = model_params.get("order", (1, 1, 1))
                seasonal_order = model_params.get("seasonal_order", (0, 0, 0, 0))
                
                # Створюємо фейкові дані часового ряду
                dates = [datetime.now() - timedelta(days=i) for i in range(n_points, 0, -1)]
                values = np.cumsum(np.random.randn(n_points)) + 100  # Випадкове блукання
                
                model_metadata = {
                    "model_type": model_type,
                    "dataset_id": dataset_id,
                    "target_column": target_column,
                    "time_column": time_column,
                    "order": order,
                    "seasonal_order": seasonal_order,
                    "n_points": n_points,
                    "last_date": dates[-1].isoformat(),
                    "last_value": float(values[-1])
                }
                
            elif model_type == "linear_trend":
                # Проста лінійна регресія для тренду
                X = np.arange(n_points).reshape(-1, 1)
                y = np.random.randn(n_points).cumsum() + 0.1 * X.flatten()
                
                # Розрахунок коефіцієнтів лінійної регресії
                slope = np.polyfit(X.flatten(), y, 1)[0]
                intercept = np.polyfit(X.flatten(), y, 1)[1]
                
                model_metadata = {
                    "model_type": model_type,
                    "dataset_id": dataset_id,
                    "target_column": target_column,
                    "slope": float(slope),
                    "intercept": float(intercept),
                    "n_points": n_points
                }
                
            else:
                raise ValueError(f"Unknown model type: {model_type}")
            
            # Збереження моделі
            self.models[model_id] = {
                "metadata": model_metadata,
                "trained_at": datetime.now().isoformat()
            }
            
            return {
                "status": "success",
                "model_id": model_id,
                "model_type": model_type,
                "dataset_id": dataset_id,
                "target_column": target_column,
                "parameters": model_params,
                "training_summary": {
                    "n_points": n_points,
                    "training_time": "simulation",
                    "metrics": {
                        "mse": 0.95,  # Фейкові метрики
                        "mae": 0.75,
                        "mape": 5.2
                    }
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to train forecast model", error=str(e), dataset_id=dataset_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _make_forecast(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Робить прогноз на основі навченої моделі"""
        
        model_id = payload.get("model_id")
        forecast_horizon = payload.get("forecast_horizon", 30)
        confidence_intervals = payload.get("confidence_intervals", [0.8, 0.95])
        
        if model_id not in self.models:
            return {
                "status": "error",
                "error": f"Model {model_id} not found"
            }
        
        try:
            model_info = self.models[model_id]
            metadata = model_info["metadata"]
            model_type = metadata["model_type"]
            
            # Генерація прогнозних значень
            if model_type == "arima":
                # Симуляція ARIMA прогнозу
                last_value = metadata["last_value"]
                forecast_values = []
                current_value = last_value
                
                for i in range(forecast_horizon):
                    # Простий випадковий крок з трендом
                    current_value += np.random.randn() * 0.1 + 0.01
                    forecast_values.append(current_value)
                    
            elif model_type == "linear_trend":
                # Лінійний тренд
                slope = metadata["slope"]
                intercept = metadata["intercept"]
                n_points = metadata["n_points"]
                
                forecast_values = []
                for i in range(1, forecast_horizon + 1):
                    value = slope * (n_points + i) + intercept
                    forecast_values.append(value)
                    
            else:
                raise ValueError(f"Unknown model type: {model_type}")
            
            # Генерація довірчих інтервалів
            forecast_std = np.std(forecast_values) * 0.1  # Спрощена оцінка
            
            intervals = {}
            for ci in confidence_intervals:
                z_score = 1.96 if ci == 0.95 else 1.28  # Спрощені z-оцінки
                margin = z_score * forecast_std
                
                intervals[f"ci_{int(ci*100)}"] = {
                    "lower": [float(v - margin) for v in forecast_values],
                    "upper": [float(v + margin) for v in forecast_values]
                }
            
            # Генерація дат для прогнозу
            last_date = datetime.fromisoformat(metadata["last_date"])
            forecast_dates = [(last_date + timedelta(days=i)).isoformat() 
                            for i in range(1, forecast_horizon + 1)]
            
            return {
                "status": "success",
                "model_id": model_id,
                "forecast": {
                    "dates": forecast_dates,
                    "values": [float(v) for v in forecast_values],
                    "confidence_intervals": intervals
                },
                "forecast_horizon": forecast_horizon,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to make forecast", error=str(e), model_id=model_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _evaluate_forecast(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Оцінює якість прогнозу"""
        
        model_id = payload.get("model_id")
        test_data = payload.get("test_data", [])
        forecast_data = payload.get("forecast_data", [])
        
        try:
            if len(test_data) != len(forecast_data):
                return {
                    "status": "error",
                    "error": "Test data and forecast data must have the same length"
                }
            
            # Розрахунок метрик
            actual = np.array(test_data)
            predicted = np.array(forecast_data)
            
            mse = float(np.mean((actual - predicted) ** 2))
            mae = float(np.mean(np.abs(actual - predicted)))
            mape = float(np.mean(np.abs((actual - predicted) / actual)) * 100)
            rmse = float(np.sqrt(mse))
            
            # Додаткові метрики
            correlation = float(np.corrcoef(actual, predicted)[0, 1])
            mean_actual = float(np.mean(actual))
            mean_predicted = float(np.mean(predicted))
            
            return {
                "status": "success",
                "model_id": model_id,
                "metrics": {
                    "mse": mse,
                    "mae": mae, 
                    "mape": mape,
                    "rmse": rmse,
                    "correlation": correlation,
                    "mean_actual": mean_actual,
                    "mean_predicted": mean_predicted,
                    "bias": mean_predicted - mean_actual
                },
                "n_points": len(test_data)
            }
            
        except Exception as e:
            self.logger.error("Failed to evaluate forecast", error=str(e), model_id=model_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _detect_trends(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Виявляє тренди в часовому ряді"""
        
        dataset_id = payload.get("dataset_id")
        time_series = payload.get("time_series", [])
        window_size = payload.get("window_size", 10)
        
        try:
            if len(time_series) < window_size:
                return {
                    "status": "error",
                    "error": f"Time series too short for window size {window_size}"
                }
            
            values = np.array(time_series)
            
            # Розрахунок ковзних середніх
            moving_avg = np.convolve(values, np.ones(window_size)/window_size, mode='valid')
            
            # Виявлення трендів
            trends = []
            for i in range(1, len(moving_avg)):
                if moving_avg[i] > moving_avg[i-1]:
                    trend = "upward"
                elif moving_avg[i] < moving_avg[i-1]:
                    trend = "downward"
                else:
                    trend = "stable"
                    
                trends.append({
                    "index": i + window_size - 1,
                    "trend": trend,
                    "value": float(moving_avg[i]),
                    "change": float(moving_avg[i] - moving_avg[i-1])
                })
            
            # Загальна статистика трендів
            trend_counts = {}
            for trend in trends:
                trend_type = trend["trend"]
                trend_counts[trend_type] = trend_counts.get(trend_type, 0) + 1
            
            return {
                "status": "success",
                "dataset_id": dataset_id,
                "trends": trends,
                "summary": {
                    "total_points": len(trends),
                    "trend_counts": trend_counts,
                    "dominant_trend": max(trend_counts, key=trend_counts.get) if trend_counts else "unknown",
                    "window_size": window_size
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to detect trends", error=str(e), dataset_id=dataset_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _predict_seasonality(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Передбачає сезонні патерни"""
        
        dataset_id = payload.get("dataset_id")
        time_series = payload.get("time_series", [])
        season_length = payload.get("season_length", 12)  # Місяці для річної сезонності
        
        try:
            if len(time_series) < season_length * 2:
                return {
                    "status": "error", 
                    "error": f"Time series too short for season length {season_length}"
                }
            
            values = np.array(time_series)
            
            # Простий алгоритм виявлення сезонності
            seasonal_patterns = []
            
            for season in range(season_length):
                # Беремо всі значення для цього сезону (позиції season, season+season_length, ...)
                seasonal_values = values[season::season_length]
                
                seasonal_patterns.append({
                    "season_index": season,
                    "mean_value": float(np.mean(seasonal_values)),
                    "std_value": float(np.std(seasonal_values)),
                    "min_value": float(np.min(seasonal_values)),
                    "max_value": float(np.max(seasonal_values)),
                    "n_observations": len(seasonal_values)
                })
            
            # Виявлення сезонного тренду
            seasonal_means = [p["mean_value"] for p in seasonal_patterns]
            seasonal_strength = float(np.std(seasonal_means))
            
            return {
                "status": "success",
                "dataset_id": dataset_id,
                "seasonal_patterns": seasonal_patterns,
                "seasonality_metrics": {
                    "season_length": season_length,
                    "seasonal_strength": seasonal_strength,
                    "is_seasonal": seasonal_strength > np.std(values) * 0.1,  # Евристичний поріг
                    "peak_season": max(range(len(seasonal_means)), key=lambda i: seasonal_means[i]),
                    "trough_season": min(range(len(seasonal_means)), key=lambda i: seasonal_means[i])
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to predict seasonality", error=str(e), dataset_id=dataset_id)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _anomaly_forecast(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Прогнозує ймовірність аномалій у майбутньому"""
        
        model_id = payload.get("model_id")
        forecast_horizon = payload.get("forecast_horizon", 30)
        anomaly_threshold = payload.get("anomaly_threshold", 2.0)  # Z-score threshold
        
        try:
            # Робимо стандартний прогноз
            forecast_result = await self._make_forecast({
                "model_id": model_id,
                "forecast_horizon": forecast_horizon
            })
            
            if forecast_result["status"] != "success":
                return forecast_result
                
            forecast_values = forecast_result["forecast"]["values"]
            
            # Розрахунок ймовірності аномалій
            forecast_std = np.std(forecast_values)
            forecast_mean = np.mean(forecast_values)
            
            anomaly_probabilities = []
            for value in forecast_values:
                z_score = abs((value - forecast_mean) / forecast_std) if forecast_std > 0 else 0
                anomaly_prob = min(z_score / anomaly_threshold, 1.0)  # Нормалізуємо до [0,1]
                
                anomaly_probabilities.append({
                    "value": float(value),
                    "z_score": float(z_score),
                    "anomaly_probability": float(anomaly_prob),
                    "is_likely_anomaly": z_score > anomaly_threshold
                })
            
            # Загальна статистика
            high_risk_count = sum(1 for ap in anomaly_probabilities if ap["is_likely_anomaly"])
            avg_risk = np.mean([ap["anomaly_probability"] for ap in anomaly_probabilities])
            
            return {
                "status": "success",
                "model_id": model_id,
                "forecast_dates": forecast_result["forecast"]["dates"],
                "anomaly_forecast": anomaly_probabilities,
                "risk_summary": {
                    "high_risk_periods": high_risk_count,
                    "average_anomaly_risk": float(avg_risk),
                    "max_risk_period": max(range(len(anomaly_probabilities)), 
                                         key=lambda i: anomaly_probabilities[i]["anomaly_probability"]),
                    "threshold_used": anomaly_threshold
                }
            }
            
        except Exception as e:
            self.logger.error("Failed to forecast anomalies", error=str(e), model_id=model_id)
            return {
                "status": "error",
                "error": str(e)
            }
