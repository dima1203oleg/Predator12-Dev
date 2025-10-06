#!/usr/bin/env python3
"""
Data Governance Module for Predator Analytics
Implements data lineage, catalog, standardization, and ILM policies.
Part of Delta Revision 1.1 - Block A1
"""

import hashlib
import json
import logging
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class DataClassification(Enum):
    """Data classification levels"""

    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    PII = "pii"


class RetentionPolicy(Enum):
    """Data retention policies"""

    SHORT_TERM = "30d"  # 30 days
    MEDIUM_TERM = "1y"  # 1 year
    LONG_TERM = "7y"  # 7 years
    PERMANENT = "permanent"
    LEGAL_HOLD = "legal_hold"


@dataclass
class DataLineage:
    """Data lineage tracking"""

    dataset_id: str
    source: str
    transformations: List[str]
    created_at: datetime
    updated_at: datetime
    version: str
    checksum: str
    classification: DataClassification
    retention_policy: RetentionPolicy
    tags: List[str]
    metadata: Dict[str, Any]


class DataCatalog:
    """Central data catalog for governance"""

    def __init__(self, catalog_path: Optional[str] = None):
        self.catalog_path = catalog_path or "/tmp/data_catalog.json"
        self.catalog: Dict[str, DataLineage] = {}
        self.load_catalog()

    def register_dataset(
        self,
        dataset_id: str,
        source: str,
        data_content: bytes,
        classification: DataClassification = DataClassification.INTERNAL,
        retention: RetentionPolicy = RetentionPolicy.MEDIUM_TERM,
        tags: List[str] = None,
        metadata: Dict[str, Any] = None,
    ) -> DataLineage:
        """Register a new dataset in the catalog"""

        checksum = hashlib.sha256(data_content).hexdigest()
        now = datetime.utcnow()

        lineage = DataLineage(
            dataset_id=dataset_id,
            source=source,
            transformations=[],
            created_at=now,
            updated_at=now,
            version="1.0.0",
            checksum=checksum,
            classification=classification,
            retention_policy=retention,
            tags=tags or [],
            metadata=metadata or {},
        )

        self.catalog[dataset_id] = lineage
        self.save_catalog()

        logger.info(f"Registered dataset {dataset_id} with classification {classification.value}")
        return lineage

    def add_transformation(self, dataset_id: str, transformation: str) -> bool:
        """Add transformation to dataset lineage"""
        if dataset_id not in self.catalog:
            logger.error(f"Dataset {dataset_id} not found in catalog")
            return False

        self.catalog[dataset_id].transformations.append(transformation)
        self.catalog[dataset_id].updated_at = datetime.utcnow()
        self.save_catalog()

        logger.info(f"Added transformation to {dataset_id}: {transformation}")
        return True

    def get_lineage(self, dataset_id: str) -> Optional[DataLineage]:
        """Get data lineage for dataset"""
        return self.catalog.get(dataset_id)

    def search_datasets(
        self,
        classification: Optional[DataClassification] = None,
        tags: Optional[List[str]] = None,
        retention_policy: Optional[RetentionPolicy] = None,
    ) -> List[DataLineage]:
        """Search datasets by criteria"""
        results = []

        for lineage in self.catalog.values():
            if classification and lineage.classification != classification:
                continue

            if tags and not any(tag in lineage.tags for tag in tags):
                continue

            if retention_policy and lineage.retention_policy != retention_policy:
                continue

            results.append(lineage)

        return results

    def get_expired_datasets(self) -> List[str]:
        """Get datasets that have exceeded their retention period"""
        expired = []
        now = datetime.utcnow()

        for dataset_id, lineage in self.catalog.items():
            if lineage.retention_policy == RetentionPolicy.PERMANENT:
                continue

            if lineage.retention_policy == RetentionPolicy.LEGAL_HOLD:
                continue

            retention_days = {
                RetentionPolicy.SHORT_TERM: 30,
                RetentionPolicy.MEDIUM_TERM: 365,
                RetentionPolicy.LONG_TERM: 2555,  # 7 years
            }.get(lineage.retention_policy, 365)

            expiry_date = lineage.created_at + timedelta(days=retention_days)
            if now > expiry_date:
                expired.append(dataset_id)

        return expired

    def load_catalog(self):
        """Load catalog from disk"""
        try:
            if Path(self.catalog_path).exists():
                with open(self.catalog_path) as f:
                    data = json.load(f)

                for dataset_id, item in data.items():
                    # Convert datetime strings back to datetime objects
                    item["created_at"] = datetime.fromisoformat(item["created_at"])
                    item["updated_at"] = datetime.fromisoformat(item["updated_at"])
                    item["classification"] = DataClassification(item["classification"])
                    item["retention_policy"] = RetentionPolicy(item["retention_policy"])

                    self.catalog[dataset_id] = DataLineage(**item)

                logger.info(f"Loaded {len(self.catalog)} datasets from catalog")
        except Exception as e:
            logger.warning(f"Failed to load catalog: {e}")
            self.catalog = {}

    def save_catalog(self):
        """Save catalog to disk"""
        try:
            # Convert to serializable format
            data = {}
            for dataset_id, lineage in self.catalog.items():
                item = asdict(lineage)
                item["created_at"] = lineage.created_at.isoformat()
                item["updated_at"] = lineage.updated_at.isoformat()
                item["classification"] = lineage.classification.value
                item["retention_policy"] = lineage.retention_policy.value
                data[dataset_id] = item

            with open(self.catalog_path, "w") as f:
                json.dump(data, f, indent=2)

            logger.info(f"Saved catalog with {len(data)} datasets")
        except Exception as e:
            logger.error(f"Failed to save catalog: {e}")


class StandardDataDictionary:
    """Standardized data dictionary for consistent field naming"""

    STANDARD_FIELDS = {
        # Temporal fields
        "timestamp": {"type": "datetime", "format": "ISO8601", "required": True},
        "created_at": {"type": "datetime", "format": "ISO8601", "required": False},
        "updated_at": {"type": "datetime", "format": "ISO8601", "required": False},
        # Geographic fields
        "latitude": {"type": "float", "range": [-90, 90], "required": False},
        "longitude": {"type": "float", "range": [-180, 180], "required": False},
        "location": {"type": "string", "pattern": "^[A-Za-z0-9\\s,.-]+$", "required": False},
        # Identification fields
        "id": {"type": "string", "pattern": "^[a-zA-Z0-9_-]+$", "required": True},
        "user_id": {"type": "string", "classification": "PII", "required": False},
        "session_id": {"type": "string", "required": False},
        # Measurement fields
        "value": {"type": "float", "required": True},
        "unit": {
            "type": "string",
            "enum": ["count", "percent", "bytes", "seconds"],
            "required": False,
        },
        "confidence": {"type": "float", "range": [0, 1], "required": False},
        # Classification fields
        "category": {"type": "string", "required": False},
        "severity": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"],
            "required": False,
        },
        "status": {
            "type": "string",
            "enum": ["active", "inactive", "pending", "completed"],
            "required": False,
        },
    }

    @classmethod
    def validate_field(cls, field_name: str, value: Any) -> tuple[bool, str]:
        """Validate field against standard dictionary"""
        if field_name not in cls.STANDARD_FIELDS:
            return True, ""  # Allow non-standard fields with warning

        field_spec = cls.STANDARD_FIELDS[field_name]

        # Type validation
        expected_type = field_spec["type"]
        if expected_type == "datetime":
            try:
                if isinstance(value, str):
                    datetime.fromisoformat(value.replace("Z", "+00:00"))
                elif not isinstance(value, datetime):
                    return False, f"Field {field_name} must be datetime or ISO8601 string"
            except ValueError:
                return False, f"Field {field_name} has invalid datetime format"

        elif expected_type == "float":
            try:
                float_val = float(value)
                if "range" in field_spec:
                    min_val, max_val = field_spec["range"]
                    if not (min_val <= float_val <= max_val):
                        return False, f"Field {field_name} out of range [{min_val}, {max_val}]"
            except (ValueError, TypeError):
                return False, f"Field {field_name} must be a number"

        elif expected_type == "string":
            if not isinstance(value, str):
                return False, f"Field {field_name} must be a string"

            if "enum" in field_spec:
                if value not in field_spec["enum"]:
                    return False, f"Field {field_name} must be one of {field_spec['enum']}"

        return True, ""

    @classmethod
    def detect_pii_fields(cls, data: Dict[str, Any]) -> List[str]:
        """Detect potential PII fields in data"""
        pii_fields = []

        # Standard PII field names
        pii_indicators = {
            "email",
            "phone",
            "ssn",
            "passport",
            "credit_card",
            "user_id",
            "customer_id",
            "name",
            "address",
            "ip_address",
        }

        for field_name, value in data.items():
            # Check if field is marked as PII in standard dictionary
            if field_name in cls.STANDARD_FIELDS:
                if cls.STANDARD_FIELDS[field_name].get("classification") == "PII":
                    pii_fields.append(field_name)

            # Check field name patterns
            field_lower = field_name.lower()
            if any(indicator in field_lower for indicator in pii_indicators):
                pii_fields.append(field_name)

            # Check value patterns (basic email/phone detection)
            if isinstance(value, str):
                if "@" in value and "." in value:  # Basic email pattern
                    pii_fields.append(field_name)
                elif (
                    value.replace("-", "")
                    .replace("(", "")
                    .replace(")", "")
                    .replace(" ", "")
                    .isdigit()
                ):
                    if (
                        len(
                            value.replace("-", "")
                            .replace("(", "")
                            .replace(")", "")
                            .replace(" ", "")
                        )
                        >= 10
                    ):
                        pii_fields.append(field_name)  # Possible phone number

        return list(set(pii_fields))


class PIIProcessor:
    """PII detection and pseudonymization"""

    def __init__(self, salt: str = "predator_pii_salt_2024"):
        self.salt = salt

    def pseudonymize_field(self, value: str, field_name: str) -> str:
        """Pseudonymize a PII field value"""
        # Create deterministic hash for same values
        hash_input = f"{self.salt}:{field_name}:{value}"
        hashed = hashlib.sha256(hash_input.encode()).hexdigest()

        # Return formatted pseudonym based on field type
        if "email" in field_name.lower():
            return f"user_{hashed[:8]}@example.com"
        elif "phone" in field_name.lower():
            return f"+1-555-{hashed[:3]}-{hashed[3:7]}"
        elif "name" in field_name.lower():
            return f"User_{hashed[:8]}"
        else:
            return f"PSEUDO_{hashed[:12]}"

    def process_data(self, data: Dict[str, Any], pii_fields: List[str]) -> Dict[str, Any]:
        """Process data to pseudonymize PII fields"""
        processed = data.copy()

        for field_name in pii_fields:
            if field_name in processed:
                original_value = processed[field_name]
                if isinstance(original_value, str):
                    processed[field_name] = self.pseudonymize_field(original_value, field_name)
                    logger.info(f"Pseudonymized PII field: {field_name}")

        return processed


# Global instances
data_catalog = DataCatalog()
pii_processor = PIIProcessor()


def enforce_data_governance(
    dataset_id: str,
    data: Dict[str, Any],
    source: str,
    classification: DataClassification = DataClassification.INTERNAL,
) -> Dict[str, Any]:
    """Main data governance enforcement function"""

    # 1. Validate against standard dictionary
    validation_errors = []
    for field_name, value in data.items():
        is_valid, error_msg = StandardDataDictionary.validate_field(field_name, value)
        if not is_valid:
            validation_errors.append(error_msg)

    if validation_errors:
        logger.warning(f"Data validation errors for {dataset_id}: {validation_errors}")

    # 2. Detect and handle PII
    pii_fields = StandardDataDictionary.detect_pii_fields(data)
    if pii_fields:
        logger.info(f"Detected PII fields in {dataset_id}: {pii_fields}")
        if classification in [DataClassification.PUBLIC, DataClassification.INTERNAL]:
            # Pseudonymize PII for non-restricted classifications
            data = pii_processor.process_data(data, pii_fields)
            classification = DataClassification.PII  # Upgrade classification

    # 3. Register in data catalog
    data_bytes = json.dumps(data, default=str).encode()
    lineage = data_catalog.register_dataset(
        dataset_id=dataset_id,
        source=source,
        data_content=data_bytes,
        classification=classification,
        tags=pii_fields if pii_fields else [],
    )

    logger.info(f"Data governance applied to {dataset_id}: classification={classification.value}")

    return data


def cleanup_expired_data() -> List[str]:
    """Cleanup expired datasets based on retention policies"""
    expired_datasets = data_catalog.get_expired_datasets()

    if expired_datasets:
        logger.info(f"Found {len(expired_datasets)} expired datasets for cleanup")

        for dataset_id in expired_datasets:
            # In production, this would delete from actual storage
            logger.info(f"Would cleanup expired dataset: {dataset_id}")

    return expired_datasets


# Export main functions
__all__ = [
    "DataClassification",
    "RetentionPolicy",
    "DataLineage",
    "DataCatalog",
    "StandardDataDictionary",
    "PIIProcessor",
    "enforce_data_governance",
    "cleanup_expired_data",
    "data_catalog",
    "pii_processor",
]
