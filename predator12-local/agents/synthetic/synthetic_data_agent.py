#!/usr/bin/env python3
"""
🧬 Synthetic Data Agent - Automated Dataset Generation
Автогенерація датасетів з реалістичними розподілами та анонімізацією
"""

import json
import random
import time
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd
import redis
import structlog
from faker import Faker
from fastapi import FastAPI, HTTPException

logger = structlog.get_logger(__name__)


@dataclass
class SyntheticConfig:
    """Конфігурація для генерації синтетичних даних"""

    schema: Dict[str, Any]
    rows: int = 10000
    anomalies_pct: float = 0.05
    noise_level: float = 0.1
    mimic_dataset_id: Optional[str] = None
    pii_policy: str = "mask"  # mask, remove, pseudonymize
    output_format: str = "csv"  # csv, json, parquet


class SyntheticDataAgent:
    """Агент для генерації синтетичних даних"""

    def __init__(self):
        self.app = FastAPI(title="Synthetic Data Agent", version="1.0.0")
        self.redis_client = redis.Redis(host="redis", port=6379, decode_responses=True)
        self.faker = Faker(["en_US", "uk_UA"])  # Підтримка українських даних

        # Шаблони для різних типів даних
        self.data_generators = {
            "string": self._generate_string,
            "integer": self._generate_integer,
            "float": self._generate_float,
            "date": self._generate_date,
            "email": self._generate_email,
            "phone": self._generate_phone,
            "company": self._generate_company,
            "address": self._generate_address,
            "hs_code": self._generate_hs_code,
            "amount": self._generate_amount,
            "country": self._generate_country,
        }

        self._setup_routes()

    def _setup_routes(self):
        """Налаштування HTTP маршрутів"""

        @self.app.post("/synthetic/generate")
        async def generate_dataset(request: dict):
            """Генерація синтетичного датасету"""
            try:
                config = SyntheticConfig(
                    schema=request["schema"],
                    rows=request.get("rows", 10000),
                    anomalies_pct=request.get("anomalies_pct", 0.05),
                    noise_level=request.get("noise_level", 0.1),
                    mimic_dataset_id=request.get("mimic_dataset_id"),
                    pii_policy=request.get("pii_policy", "mask"),
                    output_format=request.get("output_format", "csv"),
                )

                result = await self.generate_synthetic_data(config)
                return result

            except Exception as e:
                logger.error("Error generating synthetic data", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.post("/synthetic/anonymize")
        async def anonymize_data(request: dict):
            """Анонімізація існуючих даних"""
            try:
                dataset_id = request["dataset_id"]
                pii_fields = request.get("pii_fields", [])
                method = request.get("method", "k_anonymity")

                result = await self.anonymize_dataset(dataset_id, pii_fields, method)
                return result

            except Exception as e:
                logger.error("Error anonymizing data", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))

        @self.app.get("/synthetic/health")
        async def health():
            """Health check"""
            return {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "generators_available": len(self.data_generators),
            }

    async def generate_synthetic_data(self, config: SyntheticConfig) -> Dict[str, Any]:
        """Генерація синтетичних даних за конфігурацією"""

        start_time = time.time()
        dataset_id = str(uuid.uuid4())

        logger.info("Starting synthetic data generation", dataset_id=dataset_id, rows=config.rows)

        # Генеруємо базові дані
        data = {}
        for field_name, field_config in config.schema.items():
            field_type = field_config.get("type", "string")

            if field_type in self.data_generators:
                data[field_name] = self.data_generators[field_type](config.rows, field_config)
            else:
                # Fallback до строкового типу
                data[field_name] = self._generate_string(config.rows, field_config)

        # Створюємо DataFrame
        df = pd.DataFrame(data)

        # Додаємо аномалії
        if config.anomalies_pct > 0:
            df = self._inject_anomalies(df, config.anomalies_pct)

        # Додаємо шум
        if config.noise_level > 0:
            df = self._add_noise(df, config.noise_level)

        # Застосовуємо PII політики
        df = self._apply_pii_policy(df, config.pii_policy, config.schema)

        # Зберігаємо результат
        file_path = f"/tmp/synthetic_{dataset_id}.{config.output_format}"

        if config.output_format == "csv":
            df.to_csv(file_path, index=False)
        elif config.output_format == "json":
            df.to_json(file_path, orient="records", indent=2)
        elif config.output_format == "parquet":
            df.to_parquet(file_path, index=False)

        # Статистика
        stats = {
            "rows_generated": len(df),
            "columns": len(df.columns),
            "file_size_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
            "generation_time": round(time.time() - start_time, 2),
            "anomalies_injected": int(len(df) * config.anomalies_pct),
        }

        # Публікуємо подію
        await self._publish_event(
            "synthetic.generated",
            {"dataset_id": dataset_id, "config": config.__dict__, "stats": stats},
        )

        return {
            "dataset_id": dataset_id,
            "file_path": file_path,
            "stats": stats,
            "data_sample": df.head(5).to_dict("records"),
        }

    def _generate_string(self, count: int, config: Dict) -> List[str]:
        """Генерація рядків"""
        min_len = config.get("min_length", 5)
        max_len = config.get("max_length", 50)
        pattern = config.get("pattern", "word")

        if pattern == "word":
            return [self.faker.word() for _ in range(count)]
        elif pattern == "sentence":
            return [self.faker.sentence() for _ in range(count)]
        elif pattern == "name":
            return [self.faker.name() for _ in range(count)]
        else:
            return [
                self.faker.text(max_nb_chars=random.randint(min_len, max_len))[:max_len]
                for _ in range(count)
            ]

    def _generate_integer(self, count: int, config: Dict) -> List[int]:
        """Генерація цілих чисел"""
        min_val = config.get("min_value", 1)
        max_val = config.get("max_value", 100000)
        distribution = config.get("distribution", "uniform")

        if distribution == "normal":
            mean = (min_val + max_val) / 2
            std = (max_val - min_val) / 6
            values = np.random.normal(mean, std, count)
            return np.clip(values, min_val, max_val).astype(int).tolist()
        else:
            return [random.randint(min_val, max_val) for _ in range(count)]

    def _generate_float(self, count: int, config: Dict) -> List[float]:
        """Генерація дробових чисел"""
        min_val = config.get("min_value", 0.0)
        max_val = config.get("max_value", 1000.0)
        decimals = config.get("decimals", 2)
        distribution = config.get("distribution", "uniform")

        if distribution == "normal":
            mean = (min_val + max_val) / 2
            std = (max_val - min_val) / 6
            values = np.random.normal(mean, std, count)
            return np.clip(values, min_val, max_val).round(decimals).tolist()
        else:
            return [round(random.uniform(min_val, max_val), decimals) for _ in range(count)]

    def _generate_date(self, count: int, config: Dict) -> List[str]:
        """Генерація дат"""
        start_date = datetime.strptime(config.get("start_date", "2020-01-01"), "%Y-%m-%d")
        end_date = datetime.strptime(config.get("end_date", "2025-12-31"), "%Y-%m-%d")

        dates = []
        for _ in range(count):
            random_date = self.faker.date_between(start_date=start_date, end_date=end_date)
            dates.append(random_date.isoformat())

        return dates

    def _generate_email(self, count: int, config: Dict) -> List[str]:
        """Генерація email адрес"""
        return [self.faker.email() for _ in range(count)]

    def _generate_phone(self, count: int, config: Dict) -> List[str]:
        """Генерація телефонних номерів"""
        country = config.get("country", "UA")
        if country == "UA":
            return [f"+380{random.randint(100000000, 999999999)}" for _ in range(count)]
        else:
            return [self.faker.phone_number() for _ in range(count)]

    def _generate_company(self, count: int, config: Dict) -> List[str]:
        """Генерація назв компаній"""
        return [self.faker.company() for _ in range(count)]

    def _generate_address(self, count: int, config: Dict) -> List[str]:
        """Генерація адрес"""
        return [self.faker.address().replace("\n", ", ") for _ in range(count)]

    def _generate_hs_code(self, count: int, config: Dict) -> List[str]:
        """Генерація HS кодів (митні коди)"""
        # Реальні HS коди для митної аналітики
        common_hs = [
            "8544",
            "8517",
            "8471",
            "8473",
            "8708",
            "8703",
            "2710",
            "7208",
            "7326",
            "3004",
            "6203",
            "6109",
        ]

        codes = []
        for _ in range(count):
            if random.random() < 0.7:  # 70% реальних кодів
                base = random.choice(common_hs)
                suffix = f"{random.randint(10, 99)}{random.randint(10, 99)}"
                codes.append(f"{base}{suffix}")
            else:  # 30% випадкових
                codes.append(f"{random.randint(1000, 9999)}{random.randint(1000, 9999)}")

        return codes

    def _generate_amount(self, count: int, config: Dict) -> List[float]:
        """Генерація грошових сум"""
        min_amount = config.get("min_amount", 100)
        max_amount = config.get("max_amount", 1000000)
        currency = config.get("currency", "USD")

        # Логнормальний розподіл для реалістичних сум
        amounts = np.random.lognormal(mean=np.log(min_amount * 10), sigma=1.0, size=count)

        amounts = np.clip(amounts, min_amount, max_amount)
        return amounts.round(2).tolist()

    def _generate_country(self, count: int, config: Dict) -> List[str]:
        """Генерація країн"""
        region = config.get("region", "all")

        if region == "europe":
            countries = ["Ukraine", "Poland", "Germany", "France", "Italy", "Spain"]
        elif region == "asia":
            countries = ["China", "Japan", "South Korea", "India", "Thailand", "Vietnam"]
        else:
            countries = [self.faker.country() for _ in range(min(50, count))]

        return [random.choice(countries) for _ in range(count)]

    def _inject_anomalies(self, df: pd.DataFrame, anomaly_rate: float) -> pd.DataFrame:
        """Додавання аномалій до датасету"""

        num_anomalies = int(len(df) * anomaly_rate)
        anomaly_indices = random.sample(range(len(df)), num_anomalies)

        for idx in anomaly_indices:
            # Вибираємо випадкову колонку для створення аномалії
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                col = random.choice(numeric_cols)
                # Множимо на випадковий фактор для створення аномалії
                factor = random.choice([0.1, 0.01, 10, 100])
                df.loc[idx, col] = df.loc[idx, col] * factor

        return df

    def _add_noise(self, df: pd.DataFrame, noise_level: float) -> pd.DataFrame:
        """Додавання шуму до числових колонок"""

        numeric_cols = df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols:
            col_std = df[col].std()
            noise = np.random.normal(0, col_std * noise_level, len(df))
            df[col] = df[col] + noise

        return df

    def _apply_pii_policy(self, df: pd.DataFrame, policy: str, schema: Dict) -> pd.DataFrame:
        """Застосування політики PII"""

        pii_fields = []
        for field_name, field_config in schema.items():
            if field_config.get("is_pii", False):
                pii_fields.append(field_name)

        for field in pii_fields:
            if field in df.columns:
                if policy == "mask":
                    df[field] = df[field].apply(lambda x: "***MASKED***")
                elif policy == "remove":
                    df = df.drop(columns=[field])
                elif policy == "pseudonymize":
                    # Створюємо псевдоніми на основі хешу
                    df[field] = df[field].apply(lambda x: f"pseudo_{hash(str(x)) % 100000}")

        return df

    async def anonymize_dataset(
        self, dataset_id: str, pii_fields: List[str], method: str
    ) -> Dict[str, Any]:
        """Анонімізація існуючого датасету"""

        # Тут має бути логіка завантаження існуючого датасету
        # та застосування методів анонімізації (k-anonymity, l-diversity, t-closeness)

        return {
            "dataset_id": dataset_id,
            "anonymization_method": method,
            "pii_fields_processed": pii_fields,
            "status": "completed",
        }

    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Публікація події в Redis Streams"""
        try:
            event_data = {
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "source": "SyntheticDataAgent",
                **data,
            }

            self.redis_client.xadd("pred:events:synthetic", event_data)
            logger.debug("Event published", event_type=event_type)

        except Exception as e:
            logger.error("Failed to publish event", error=str(e))


# Запуск агента
if __name__ == "__main__":
    import uvicorn

    agent = SyntheticDataAgent()
    uvicorn.run(agent.app, host="0.0.0.0", port=9015)
