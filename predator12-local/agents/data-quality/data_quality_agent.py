#!/usr/bin/env python3
"""
🔍 Data Quality Agent - Data Validation and Quality Gates
Валідація якості даних, правила контролю та quality-gate перед аналітикою
"""

import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

import redis
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
import structlog

logger = structlog.get_logger(__name__)

class ValidationSeverity(Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

@dataclass
class ValidationRule:
    """Правило валідації"""
    name: str
    field: str
    rule_type: str  # not_null, range, regex, custom
    parameters: Dict[str, Any]
    severity: ValidationSeverity
    description: str

@dataclass
class ValidationResult:
    """Результат валідації"""
    rule_name: str
    field: str
    passed: bool
    error_count: int
    total_count: int
    error_rate: float
    severity: ValidationSeverity
    details: List[Dict[str, Any]]
    timestamp: datetime

class DataQualityAgent:
    """Агент контролю якості даних"""
    
    def __init__(self):
        self.app = FastAPI(title="Data Quality Agent", version="1.0.0")
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
        
        # Базові правила валідації
        self.default_rules = self._init_default_rules()
        
        self._setup_routes()
    
    def _init_default_rules(self) -> List[ValidationRule]:
        """Ініціалізація базових правил валідації"""
        rules = [
            ValidationRule(
                name="not_null_amount",
                field="amount",
                rule_type="not_null",
                parameters={},
                severity=ValidationSeverity.ERROR,
                description="Amount field must not be null"
            ),
            ValidationRule(
                name="positive_amount",
                field="amount",
                rule_type="range",
                parameters={"min_value": 0},
                severity=ValidationSeverity.ERROR,
                description="Amount must be positive"
            ),
            ValidationRule(
                name="valid_hs_code",
                field="hs_code",
                rule_type="regex",
                parameters={"pattern": r"^\d{4,8}$"},
                severity=ValidationSeverity.WARNING,
                description="HS Code must be 4-8 digits"
            ),
            ValidationRule(
                name="reasonable_amount_range",
                field="amount",
                rule_type="range",
                parameters={"min_value": 1, "max_value": 10000000},
                severity=ValidationSeverity.WARNING,
                description="Amount should be in reasonable range (1-10M)"
            ),
            ValidationRule(
                name="valid_email_format",
                field="email",
                rule_type="regex",
                parameters={"pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"},
                severity=ValidationSeverity.ERROR,
                description="Email must have valid format"
            ),
            ValidationRule(
                name="valid_phone_format",
                field="phone",
                rule_type="regex",
                parameters={"pattern": r"^\+?\d{10,15}$"},
                severity=ValidationSeverity.WARNING,
                description="Phone must be 10-15 digits with optional +"
            )
        ]
        return rules
    
    def _setup_routes(self):
        """Налаштування HTTP маршрутів"""
        
        @self.app.post("/quality/run")
        async def run_validation(request: dict):
            """Запуск валідації якості даних"""
            try:
                dataset_id = request.get("dataset_id")
                index_name = request.get("index", "customs_safe_current")
                rules = request.get("rules", [])
                
                result = await self.validate_dataset(
                    dataset_id=dataset_id,
                    index_name=index_name,
                    custom_rules=rules
                )
                return result
                
            except Exception as e:
                logger.error("Error running validation", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/quality/rules")
        async def list_rules():
            """Список доступних правил валідації"""
            rules_info = []
            for rule in self.default_rules:
                rules_info.append({
                    "name": rule.name,
                    "field": rule.field,
                    "rule_type": rule.rule_type,
                    "severity": rule.severity.value,
                    "description": rule.description
                })
            return {"rules": rules_info}
        
        @self.app.post("/quality/rules")
        async def add_custom_rule(rule_data: dict):
            """Додавання кастомного правила"""
            try:
                rule = ValidationRule(
                    name=rule_data["name"],
                    field=rule_data["field"],
                    rule_type=rule_data["rule_type"],
                    parameters=rule_data.get("parameters", {}),
                    severity=ValidationSeverity(rule_data.get("severity", "warning")),
                    description=rule_data.get("description", "")
                )
                
                # Зберігаємо правило в Redis
                rule_key = f"quality:rules:{rule.name}"
                rule_json = {
                    "name": rule.name,
                    "field": rule.field,
                    "rule_type": rule.rule_type,
                    "parameters": rule.parameters,
                    "severity": rule.severity.value,
                    "description": rule.description
                }
                self.redis_client.hset(rule_key, mapping=rule_json)
                
                return {"status": "success", "rule": rule_json}
                
            except Exception as e:
                logger.error("Error adding rule", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/quality/report/{dataset_id}")
        async def get_quality_report(dataset_id: str):
            """Звіт по якості конкретного датасету"""
            try:
                # Отримуємо збережені результати з Redis
                report_key = f"quality:reports:{dataset_id}"
                report_data = self.redis_client.hgetall(report_key)
                
                if not report_data:
                    raise HTTPException(status_code=404, detail="Report not found")
                
                return report_data
                
            except Exception as e:
                logger.error("Error getting quality report", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/quality/health")
        async def health():
            """Health check"""
            return {
                "status": "healthy",
                "rules_count": len(self.default_rules),
                "timestamp": datetime.now().isoformat()
            }
    
    async def validate_dataset(self, dataset_id: Optional[str], 
                             index_name: str, 
                             custom_rules: List[dict]) -> Dict[str, Any]:
        """Валідація датасету за правилами"""
        
        start_time = time.time()
        
        # Симулюємо отримання даних (в реальному випадку з OpenSearch/DB)
        data = self._simulate_data()
        df = pd.DataFrame(data)
        
        logger.info("Starting data quality validation", 
                   dataset_id=dataset_id, records_count=len(df))
        
        # Комбінуємо базові правила з кастомними
        all_rules = self.default_rules.copy()
        
        for rule_data in custom_rules:
            try:
                rule = ValidationRule(
                    name=rule_data["name"],
                    field=rule_data["field"],
                    rule_type=rule_data["rule_type"],
                    parameters=rule_data.get("parameters", {}),
                    severity=ValidationSeverity(rule_data.get("severity", "warning")),
                    description=rule_data.get("description", "")
                )
                all_rules.append(rule)
            except Exception as e:
                logger.warning("Invalid custom rule", error=str(e), rule=rule_data)
        
        # Виконуємо валідацію
        validation_results = []
        total_errors = 0
        critical_errors = 0
        
        for rule in all_rules:
            if rule.field in df.columns:
                result = self._validate_field(df, rule)
                validation_results.append(result)
                
                if not result.passed:
                    total_errors += result.error_count
                    if result.severity == ValidationSeverity.CRITICAL:
                        critical_errors += result.error_count
        
        # Обчислюємо загальну якість
        total_records = len(df)
        overall_quality = 1.0 - (total_errors / max(1, total_records * len(all_rules)))
        
        quality_grade = self._calculate_quality_grade(overall_quality, critical_errors)
        
        # Підсумкові метрики
        summary = {
            "dataset_id": dataset_id,
            "total_records": total_records,
            "rules_checked": len(all_rules),
            "passed_rules": len([r for r in validation_results if r.passed]),
            "failed_rules": len([r for r in validation_results if not r.passed]),
            "total_errors": total_errors,
            "critical_errors": critical_errors,
            "overall_quality_score": round(overall_quality, 4),
            "quality_grade": quality_grade,
            "processing_time": round(time.time() - start_time, 3),
            "timestamp": datetime.now().isoformat()
        }
        
        # Публікуємо подію про результати валідації
        event_type = "quality.passed" if critical_errors == 0 else "quality.failed"
        await self._publish_event(event_type, {
            "dataset_id": dataset_id,
            "summary": summary,
            "critical_issues": critical_errors > 0
        })
        
        # Зберігаємо звіт в Redis
        if dataset_id:
            report_key = f"quality:reports:{dataset_id}"
            self.redis_client.hset(report_key, mapping={
                "summary": str(summary),
                "results": str([r.__dict__ for r in validation_results]),
                "timestamp": datetime.now().isoformat()
            })
            self.redis_client.expire(report_key, 86400)  # TTL 24 години
        
        return {
            "summary": summary,
            "validation_results": [self._result_to_dict(r) for r in validation_results],
            "recommendations": self._generate_recommendations(validation_results)
        }
    
    def _validate_field(self, df: pd.DataFrame, rule: ValidationRule) -> ValidationResult:
        """Валідація окремого поля за правилом"""
        
        field_data = df[rule.field]
        total_count = len(field_data)
        error_details = []
        
        try:
            if rule.rule_type == "not_null":
                null_mask = field_data.isnull()
                error_count = null_mask.sum()
                
                if error_count > 0:
                    error_details = [
                        {"row": int(idx), "value": None, "error": "Null value"}
                        for idx in df[null_mask].index[:10]  # Перші 10 помилок
                    ]
            
            elif rule.rule_type == "range":
                min_val = rule.parameters.get("min_value")
                max_val = rule.parameters.get("max_value")
                
                numeric_data = pd.to_numeric(field_data, errors='coerce')
                error_mask = pd.Series([False] * len(numeric_data))
                
                if min_val is not None:
                    error_mask |= (numeric_data < min_val)
                if max_val is not None:
                    error_mask |= (numeric_data > max_val)
                
                error_count = error_mask.sum()
                
                if error_count > 0:
                    error_details = [
                        {
                            "row": int(idx), 
                            "value": float(numeric_data.iloc[idx]) if pd.notna(numeric_data.iloc[idx]) else None,
                            "error": f"Out of range [{min_val}, {max_val}]"
                        }
                        for idx in range(len(error_mask)) if error_mask.iloc[idx]
                    ][:10]
            
            elif rule.rule_type == "regex":
                import re
                pattern = rule.parameters.get("pattern", ".*")
                
                string_data = field_data.astype(str)
                error_mask = ~string_data.str.match(pattern, na=False)
                error_count = error_mask.sum()
                
                if error_count > 0:
                    error_details = [
                        {
                            "row": int(idx),
                            "value": str(string_data.iloc[idx]),
                            "error": f"Does not match pattern: {pattern}"
                        }
                        for idx in range(len(error_mask)) if error_mask.iloc[idx]
                    ][:10]
            
            else:
                # Кастомні правила можна додати тут
                error_count = 0
        
        except Exception as e:
            logger.error("Error validating field", rule=rule.name, error=str(e))
            error_count = total_count  # Вся колонка - помилка
            error_details = [{"error": f"Validation failed: {str(e)}"}]
        
        error_rate = error_count / total_count if total_count > 0 else 0
        passed = error_count == 0
        
        return ValidationResult(
            rule_name=rule.name,
            field=rule.field,
            passed=passed,
            error_count=error_count,
            total_count=total_count,
            error_rate=error_rate,
            severity=rule.severity,
            details=error_details,
            timestamp=datetime.now()
        )
    
    def _calculate_quality_grade(self, quality_score: float, critical_errors: int) -> str:
        """Розрахунок класу якості"""
        if critical_errors > 0:
            return "F"
        elif quality_score >= 0.95:
            return "A"
        elif quality_score >= 0.90:
            return "B"
        elif quality_score >= 0.80:
            return "C"
        elif quality_score >= 0.70:
            return "D"
        else:
            return "F"
    
    def _generate_recommendations(self, results: List[ValidationResult]) -> List[str]:
        """Генерація рекомендацій по покращенню якості"""
        recommendations = []
        
        for result in results:
            if not result.passed:
                if result.rule_name == "not_null_amount":
                    recommendations.append("Fill missing amount values or exclude incomplete records")
                elif result.rule_name == "positive_amount":
                    recommendations.append("Check data source for negative amounts - possible data error")
                elif result.rule_name == "valid_hs_code":
                    recommendations.append("Standardize HS codes format - use 6 or 8 digit codes")
                elif result.error_rate > 0.1:
                    recommendations.append(f"High error rate ({result.error_rate:.1%}) in {result.field} - investigate data source")
        
        if not recommendations:
            recommendations.append("Data quality is good - no major issues found")
        
        return recommendations
    
    def _result_to_dict(self, result: ValidationResult) -> Dict[str, Any]:
        """Конвертація результату в словник"""
        return {
            "rule_name": result.rule_name,
            "field": result.field,
            "passed": result.passed,
            "error_count": result.error_count,
            "total_count": result.total_count,
            "error_rate": round(result.error_rate, 4),
            "severity": result.severity.value,
            "details": result.details[:5],  # Обмежуємо деталі
            "timestamp": result.timestamp.isoformat()
        }
    
    def _simulate_data(self) -> List[Dict[str, Any]]:
        """Симуляція даних для тестування"""
        import random
        
        data = []
        for i in range(1000):
            record = {
                "id": i,
                "amount": random.choice([
                    random.uniform(100, 50000),  # Нормальні суми
                    None,                        # Null значення (5% випадків)
                    -random.uniform(10, 100),    # Негативні суми (помилки)
                    random.uniform(50000000, 100000000)  # Дуже великі суми
                ]) if random.random() > 0.05 else random.uniform(100, 50000),
                
                "hs_code": random.choice([
                    f"{random.randint(1000, 9999)}{random.randint(10, 99)}",  # Правильні коди
                    "INVALID",                                                  # Неправильні коди
                    f"{random.randint(100, 999)}"                              # Короткі коди
                ]),
                
                "email": random.choice([
                    f"user{i}@example.com",        # Правильні email
                    f"invalid-email{i}",           # Неправильні email
                    None                           # Null email
                ]) if random.random() > 0.1 else f"user{i}@example.com",
                
                "phone": random.choice([
                    f"+380{random.randint(100000000, 999999999)}",  # Правильні номери
                    f"{random.randint(123, 999)}",                  # Короткі номери
                    "invalid-phone"                                 # Неправильні номери
                ])
            }
            data.append(record)
        
        return data
    
    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Публікація події в Redis Streams"""
        try:
            event_data = {
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "source": "DataQualityAgent",
                **data
            }
            
            self.redis_client.xadd("pred:events:quality", event_data)
            logger.debug("Event published", event_type=event_type)
            
        except Exception as e:
            logger.error("Failed to publish event", error=str(e))

# Запуск агента
if __name__ == "__main__":
    import uvicorn
    
    agent = DataQualityAgent()
    uvicorn.run(agent.app, host="0.0.0.0", port=9012)
