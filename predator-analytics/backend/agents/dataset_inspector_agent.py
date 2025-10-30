"""
Dataset Inspector Agent
"""

import logging
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from agents.base import BaseAgent

logger = logging.getLogger(__name__)


class DatasetInspectorAgent(BaseAgent):
    """
    Agent responsible for analyzing and validating datasets.
    Performs data quality checks, statistics, and transformations.
    """

    def __init__(self):
        super().__init__(
            agent_id="dataset-inspector-001",
            name="Dataset Inspector",
            agent_type="dataset_inspector",
        )

    async def execute(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Inspect and analyze dataset

        Args:
            task_data: Must contain 'dataset' or 'dataset_path'

        Returns:
            Dataset analysis results
        """
        try:
            # Load dataset
            df = await self._load_dataset(task_data)

            # Perform analysis
            analysis = {
                "basic_info": self._get_basic_info(df),
                "statistics": self._get_statistics(df),
                "data_quality": self._check_data_quality(df),
                "column_analysis": self._analyze_columns(df),
                "recommendations": self._generate_recommendations(df),
            }

            return {"success": True, "agent": self.name, "analysis": analysis}

        except Exception as e:
            return await self.handle_error(e)

    async def _load_dataset(self, task_data: Dict[str, Any]) -> pd.DataFrame:
        """Load dataset from various sources"""
        if "dataset" in task_data:
            # Dataset provided directly
            return pd.DataFrame(task_data["dataset"])
        elif "dataset_path" in task_data:
            # Load from file
            path = task_data["dataset_path"]
            if path.endswith(".csv"):
                return pd.read_csv(path)
            elif path.endswith(".json"):
                return pd.read_json(path)
            elif path.endswith((".xlsx", ".xls")):
                return pd.read_excel(path)
            else:
                raise ValueError(f"Unsupported file format: {path}")
        else:
            raise ValueError("No dataset or dataset_path provided")

    def _get_basic_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get basic dataset information"""
        return {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "memory_usage_mb": df.memory_usage(deep=True).sum() / 1024 / 1024,
        }

    def _get_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate dataset statistics"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns

        stats = {}
        if len(numeric_cols) > 0:
            desc = df[numeric_cols].describe()
            stats["numeric"] = desc.to_dict()

        # Categorical statistics
        cat_cols = df.select_dtypes(include=["object", "category"]).columns
        if len(cat_cols) > 0:
            stats["categorical"] = {
                col: {
                    "unique_values": df[col].nunique(),
                    "top_values": df[col].value_counts().head(5).to_dict(),
                }
                for col in cat_cols
            }

        return stats

    def _check_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Check data quality issues"""
        quality = {
            "missing_values": df.isnull().sum().to_dict(),
            "missing_percentage": (df.isnull().sum() / len(df) * 100).to_dict(),
            "duplicate_rows": int(df.duplicated().sum()),
            "total_missing": int(df.isnull().sum().sum()),
        }

        # Check for outliers in numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        outliers = {}

        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers[col] = int(((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum())

        quality["outliers"] = outliers

        return quality

    def _analyze_columns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detailed column analysis"""
        columns = {}

        for col in df.columns:
            col_data = df[col]
            columns[col] = {
                "dtype": str(col_data.dtype),
                "non_null_count": int(col_data.count()),
                "null_count": int(col_data.isnull().sum()),
                "unique_count": int(col_data.nunique()),
            }

            # Add type-specific analysis
            if pd.api.types.is_numeric_dtype(col_data):
                columns[col].update(
                    {
                        "min": float(col_data.min()) if not col_data.empty else None,
                        "max": float(col_data.max()) if not col_data.empty else None,
                        "mean": float(col_data.mean()) if not col_data.empty else None,
                        "median": float(col_data.median()) if not col_data.empty else None,
                    }
                )
            elif pd.api.types.is_string_dtype(col_data):
                columns[col].update(
                    {
                        "avg_length": (
                            float(col_data.str.len().mean()) if not col_data.empty else None
                        ),
                        "max_length": int(col_data.str.len().max()) if not col_data.empty else None,
                    }
                )

        return columns

    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generate data quality recommendations"""
        recommendations = []

        # Missing values
        missing_pct = df.isnull().sum() / len(df) * 100
        high_missing = missing_pct[missing_pct > 50]
        if len(high_missing) > 0:
            recommendations.append(
                f"Consider removing columns with >50% missing values: {high_missing.index.tolist()}"
            )

        # Duplicates
        if df.duplicated().sum() > 0:
            recommendations.append(
                f"Found {df.duplicated().sum()} duplicate rows - consider deduplication"
            )

        # Low variance
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if df[col].std() < 0.01:
                recommendations.append(
                    f"Column '{col}' has very low variance - might not be useful for analysis"
                )

        # High cardinality
        for col in df.columns:
            if df[col].nunique() > len(df) * 0.9:
                recommendations.append(
                    f"Column '{col}' has high cardinality - consider if it should be an identifier"
                )

        if not recommendations:
            recommendations.append("Dataset looks good! No major issues detected.")

        return recommendations
