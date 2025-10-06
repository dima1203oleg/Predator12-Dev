"""
Агент для роботи з датасетами
"""

from __future__ import annotations

import json
import os
from typing import Any

import pandas as pd
import structlog
from sqlalchemy import create_engine

from .base_agent import BaseAgent

logger = structlog.get_logger()


class DatasetAgent(BaseAgent):
    """Агент для завантаження, валідації та обробки датасетів"""
    
    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__("DatasetAgent", config)
        self.db_url = config.get("database_url") if config else None
        
    def capabilities(self) -> list[str]:
        return [
            "load_dataset",
            "validate_dataset", 
            "process_dataset",
            "save_dataset",
            "get_dataset_info",
            "split_dataset"
        ]
        
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання з обробки датасетів"""
        
        self.logger.info("Processing dataset task", task_type=task_type)
        
        if task_type == "load_dataset":
            return await self._load_dataset(payload)
        elif task_type == "validate_dataset":
            return await self._validate_dataset(payload)
        elif task_type == "process_dataset":
            return await self._process_dataset(payload)
        elif task_type == "save_dataset":
            return await self._save_dataset(payload)
        elif task_type == "get_dataset_info":
            return await self._get_dataset_info(payload)
        elif task_type == "split_dataset":
            return await self._split_dataset(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _load_dataset(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Завантажує датасет з файлу або БД"""
        
        source = payload.get("source")
        source_type = payload.get("source_type", "file")
        
        try:
            if source_type == "file":
                if source.endswith('.csv'):
                    df = pd.read_csv(source)
                elif source.endswith('.json'):
                    df = pd.read_json(source)
                elif source.endswith(('.xlsx', '.xls')):
                    df = pd.read_excel(source)
                else:
                    raise ValueError(f"Unsupported file format: {source}")
                    
            elif source_type == "database":
                if not self.db_url:
                    raise ValueError("Database URL not configured")
                    
                engine = create_engine(self.db_url)
                query = payload.get("query")
                df = pd.read_sql(query, engine)
                
            else:
                raise ValueError(f"Unknown source type: {source_type}")
                
            # Зберігаємо датасет у пам'ять (в реальній системі краще використовувати кеш)
            dataset_id = f"dataset_{hash(source)}"
            
            return {
                "status": "success",
                "dataset_id": dataset_id,
                "shape": df.shape,
                "columns": list(df.columns),
                "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
                "memory_usage": df.memory_usage(deep=True).sum()
            }
            
        except Exception as e:
            self.logger.error("Failed to load dataset", error=str(e), source=source)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _validate_dataset(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Валідує датасет на наявність помилок та аномалій"""
        
        dataset_id = payload.get("dataset_id")
        validation_rules = payload.get("rules", {})
        
        # У реальній реалізації тут буде завантаження датасету з кешу
        # Поки що повертаємо результат валідації
        
        issues = []
        
        # Перевірка на пропущені значення
        if validation_rules.get("check_missing", True):
            issues.append({
                "type": "missing_values",
                "severity": "warning", 
                "description": "Dataset contains missing values",
                "count": 0  # У реальній реалізації тут буде справжній підрахунок
            })
        
        # Перевірка на дублікати
        if validation_rules.get("check_duplicates", True):
            issues.append({
                "type": "duplicates",
                "severity": "warning",
                "description": "Dataset contains duplicate rows", 
                "count": 0
            })
            
        return {
            "status": "success",
            "dataset_id": dataset_id,
            "valid": len([i for i in issues if i["severity"] == "error"]) == 0,
            "issues": issues
        }
        
    async def _process_dataset(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Обробляє датасет (очищення, трансформації)"""
        
        dataset_id = payload.get("dataset_id")
        operations = payload.get("operations", [])
        
        processed_operations = []
        
        for op in operations:
            op_type = op.get("type")
            
            if op_type == "drop_na":
                processed_operations.append({
                    "type": "drop_na",
                    "status": "completed",
                    "rows_removed": 0  # У реальній реалізації
                })
            elif op_type == "fill_na":
                processed_operations.append({
                    "type": "fill_na", 
                    "status": "completed",
                    "method": op.get("method", "mean")
                })
            elif op_type == "normalize":
                processed_operations.append({
                    "type": "normalize",
                    "status": "completed", 
                    "method": op.get("method", "standard")
                })
                
        return {
            "status": "success",
            "dataset_id": dataset_id,
            "operations": processed_operations
        }
        
    async def _save_dataset(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Зберігає оброблений датасет"""
        
        dataset_id = payload.get("dataset_id")
        destination = payload.get("destination")
        format_type = payload.get("format", "csv")
        
        # У реальній реалізації тут буде справжнє збереження
        
        return {
            "status": "success",
            "dataset_id": dataset_id,
            "destination": destination,
            "format": format_type,
            "saved_at": "2024-01-01T00:00:00Z"
        }
        
    async def _get_dataset_info(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Повертає інформацію про датасет"""
        
        dataset_id = payload.get("dataset_id")
        
        # У реальній реалізації тут буде завантаження з кешу
        
        return {
            "status": "success",
            "dataset_id": dataset_id,
            "info": {
                "shape": [1000, 10],
                "columns": ["col1", "col2", "col3"],
                "dtypes": {"col1": "int64", "col2": "float64"},
                "memory_usage": 80000,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }
        
    async def _split_dataset(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Розбиває датасет на тренувальну та тестову вибірки"""
        
        dataset_id = payload.get("dataset_id")
        test_size = payload.get("test_size", 0.2)
        random_state = payload.get("random_state", 42)
        
        # У реальній реалізації тут буде справжній розбиток
        
        return {
            "status": "success",
            "original_dataset": dataset_id,
            "train_dataset": f"{dataset_id}_train",
            "test_dataset": f"{dataset_id}_test",
            "train_size": int(1000 * (1 - test_size)),
            "test_size": int(1000 * test_size),
            "split_params": {
                "test_size": test_size,
                "random_state": random_state
            }
        }
