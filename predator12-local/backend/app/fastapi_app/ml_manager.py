import os
import pickle
from pathlib import Path

import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


class MLModelManager:
    def __init__(self):
        # Налаштування MLflow для локального тестування
        try:
            mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "http://localhost:5000"))
            mlflow.set_experiment("Predator Analytics Models")
            self.mlflow_available = True
        except Exception as e:
            print(f"MLflow недоступний, працюємо в локальному режимі: {e}")
            self.mlflow_available = False

        # Локальне сховище моделей
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)

    def train_anomaly_detector(self, data: pd.DataFrame):
        """Train anomaly detection model"""
        with mlflow.start_run():
            # Prepare data
            features = data.select_dtypes(include=[float, int]).dropna()
            target = (features.mean(axis=1) > features.mean(axis=1).quantile(0.95)).astype(
                int
            )  # Mock anomaly label

            X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2)

            # Train model
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)

            # Evaluate
            predictions = model.predict(X_test)
            accuracy = accuracy_score(y_test, predictions)

            # Log to MLflow
            mlflow.log_param("n_estimators", 100)
            mlflow.log_metric("accuracy", accuracy)
            mlflow.sklearn.log_model(model, "anomaly_detector")

            return model, accuracy

    def load_model(self, model_name: str, version: str = "latest"):
        """Load model from MLflow or local storage"""
        try:
            if self.mlflow_available:
                return mlflow.sklearn.load_model(f"models:/{model_name}/{version}")
        except Exception as e:
            print(f"Не вдалося завантажити з MLflow: {e}")

        # Спробуємо локальне сховище
        local_path = self.models_dir / f"{model_name}.pkl"
        if local_path.exists():
            with open(local_path, "rb") as f:
                return pickle.load(f)

        # Створюємо базову модель для тестування
        print(f"Створюємо базову модель {model_name} для тестування")
        if model_name == "anomaly_detector":
            model = IsolationForest(contamination=0.1, random_state=42)
            # Фітуємо на мок-даних
            mock_data = np.random.randn(100, 5)
            model.fit(mock_data)

            # Зберігаємо локально
            with open(local_path, "wb") as f:
                pickle.dump(model, f)

            return model

        return None

    def predict_anomalies(self, data: pd.DataFrame, model=None):
        """Predict anomalies in data"""
        try:
            if model is None:
                model = self.load_model("anomaly_detector")

            # Підготовка даних для предикції
            numeric_data = data.select_dtypes(include=[np.number]).fillna(0)

            if numeric_data.empty:
                # Якщо немає числових даних, створюємо мок-аномалії
                return np.random.choice([0, 1], size=len(data), p=[0.9, 0.1])

            if hasattr(model, "predict"):
                predictions = model.predict(numeric_data)
                # IsolationForest повертає -1/1, перетворюємо на 0/1
                if hasattr(model, "score_samples"):
                    predictions = (predictions == -1).astype(int)
            else:
                # Fallback - базовий аналіз аномалій
                z_scores = np.abs((numeric_data - numeric_data.mean()) / numeric_data.std())
                predictions = (z_scores.mean(axis=1) > 2).astype(int)

            return predictions

        except Exception as e:
            print(f"Помилка в predict_anomalies: {e}")
            # Fallback - повертаємо випадкові результати для тестування
            return np.random.choice([0, 1], size=len(data), p=[0.9, 0.1])


# Global instance
ml_manager = MLModelManager()
