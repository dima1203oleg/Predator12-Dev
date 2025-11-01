"""
Data Governance Manager - Дельта-ревізія 1.2
Data lineage, каталог, PII реєстр, retention политики
"""

import logging
import uuid
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class DataClassification(Enum):
    """Класифікація даних"""

    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    PII = "pii"


class PIIType(Enum):
    """Типи персональних даних"""

    NAME = "name"
    EMAIL = "email"
    PHONE = "phone"
    ADDRESS = "address"
    PASSPORT = "passport"
    TAX_ID = "tax_id"
    BANK_ACCOUNT = "bank_account"
    IP_ADDRESS = "ip_address"


class DataLineageEvent:
    """Події лінії даних"""

    def __init__(
        self,
        event_id: str,
        source_entity: str,
        target_entity: str,
        operation: str,
        timestamp: datetime,
        metadata: Dict[str, Any] = None,
    ):
        self.event_id = event_id
        self.source_entity = source_entity
        self.target_entity = target_entity
        self.operation = operation
        self.timestamp = timestamp
        self.metadata = metadata or {}


class PIIField:
    """Поле з персональними даними"""

    def __init__(
        self,
        field_path: str,
        pii_type: PIIType,
        classification: DataClassification,
        mask_pattern: str = "*****",
        retention_days: Optional[int] = None,
    ):
        self.field_path = field_path
        self.pii_type = pii_type
        self.classification = classification
        self.mask_pattern = mask_pattern
        self.retention_days = retention_days


class DataCatalogEntry:
    """Запис в каталозі даних"""

    def __init__(
        self,
        entity_id: str,
        entity_name: str,
        entity_type: str,  # table, index, dataset, model
        schema: Dict[str, Any],
        classification: DataClassification,
        pii_fields: List[PIIField] = None,
        retention_policy: Optional[str] = None,
        tags: List[str] = None,
        description: str = "",
    ):
        self.entity_id = entity_id
        self.entity_name = entity_name
        self.entity_type = entity_type
        self.schema = schema
        self.classification = classification
        self.pii_fields = pii_fields or []
        self.retention_policy = retention_policy
        self.tags = tags or []
        self.description = description
        self.created_at = datetime.now()
        self.updated_at = datetime.now()


class DataGovernanceManager:
    """Менеджер управління даними"""

    def __init__(self):
        self.catalog: Dict[str, DataCatalogEntry] = {}
        self.lineage_events: List[DataLineageEvent] = []
        self.pii_registry: Dict[str, List[PIIField]] = {}
        self.retention_policies: Dict[str, Dict[str, Any]] = {}

        # Стандартні PII поля для митних даних
        self._initialize_pii_registry()

        # Стандартні retention політики
        self._initialize_retention_policies()

    def _initialize_pii_registry(self):
        """Ініціалізація реєстру PII полів"""

        # Митні декларації
        customs_pii = [
            PIIField(
                "declarant.name",
                PIIType.NAME,
                DataClassification.PII,
                "***MASKED***",
                2555,
            ),  # 7 років
            PIIField(
                "declarant.email",
                PIIType.EMAIL,
                DataClassification.PII,
                "****@*****.***",
                2555,
            ),
            PIIField(
                "declarant.phone",
                PIIType.PHONE,
                DataClassification.PII,
                "+38*********",
                2555,
            ),
            PIIField(
                "declarant.address",
                PIIType.ADDRESS,
                DataClassification.PII,
                "***MASKED_ADDRESS***",
                2555,
            ),
            PIIField(
                "declarant.passport_number",
                PIIType.PASSPORT,
                DataClassification.RESTRICTED,
                "**CLASSIFIED**",
                2555,
            ),
            PIIField(
                "declarant.tax_id",
                PIIType.TAX_ID,
                DataClassification.PII,
                "**MASKED**",
                2555,
            ),
            PIIField(
                "bank_details.account_number",
                PIIType.BANK_ACCOUNT,
                DataClassification.RESTRICTED,
                "**CLASSIFIED**",
                2555,
            ),
        ]

        # Податкові дані
        tax_pii = [
            PIIField(
                "taxpayer.name",
                PIIType.NAME,
                DataClassification.PII,
                "***MASKED***",
                1825,
            ),  # 5 років
            PIIField(
                "taxpayer.tin",
                PIIType.TAX_ID,
                DataClassification.PII,
                "**MASKED**",
                1825,
            ),
            PIIField(
                "contact.email",
                PIIType.EMAIL,
                DataClassification.PII,
                "****@*****.***",
                1825,
            ),
            PIIField(
                "contact.phone",
                PIIType.PHONE,
                DataClassification.PII,
                "+38*********",
                1825,
            ),
        ]

        # OSINT дані
        osint_pii = [
            PIIField(
                "author.username",
                PIIType.NAME,
                DataClassification.CONFIDENTIAL,
                "***USER***",
                90,
            ),  # 3 місяці
            PIIField(
                "metadata.ip_address",
                PIIType.IP_ADDRESS,
                DataClassification.INTERNAL,
                "XXX.XXX.XXX.XXX",
                30,
            ),
            PIIField(
                "content.phone_numbers",
                PIIType.PHONE,
                DataClassification.PII,
                "+XX*********",
                90,
            ),
        ]

        self.pii_registry = {
            "customs_declarations": customs_pii,
            "tax_data": tax_pii,
            "osint_data": osint_pii,
        }

    def _initialize_retention_policies(self):
        """Ініціалізація retention політик"""
        self.retention_policies = {
            "customs_legal": {
                "description": "Митні дані - законні вимоги",
                "retention_period_days": 2555,  # 7 років
                "archive_after_days": 1095,  # 3 роки - в архів
                "delete_after_days": 2555,  # 7 років - видалення
                "applies_to": [
                    "customs_declarations",
                    "customs_payments",
                    "customs_certificates",
                ],
            },
            "tax_legal": {
                "description": "Податкові дані - законні вимоги",
                "retention_period_days": 1825,  # 5 років
                "archive_after_days": 730,  # 2 роки - в архів
                "delete_after_days": 1825,  # 5 років - видалення
                "applies_to": ["tax_declarations", "tax_payments", "tax_assessments"],
            },
            "osint_operational": {
                "description": "OSINT дані - оперативні потреби",
                "retention_period_days": 365,  # 1 рік
                "archive_after_days": 90,  # 3 місяці - в архів
                "delete_after_days": 365,  # 1 рік - видалення
                "applies_to": ["telegram_messages", "web_scraping", "social_media"],
            },
            "ml_models": {
                "description": "ML моделі та експерименти",
                "retention_period_days": 730,  # 2 роки
                "archive_after_days": 180,  # 6 місяців - в архів
                "delete_after_days": 730,  # 2 роки - видалення
                "applies_to": ["ml_experiments", "model_artifacts", "training_data"],
            },
            "audit_logs": {
                "description": "Аудит логи - безпека",
                "retention_period_days": 2555,  # 7 років
                "archive_after_days": 365,  # 1 рік - в архів
                "delete_after_days": 2555,  # 7 років - видалення
                "applies_to": ["access_logs", "api_logs", "security_events"],
            },
        }

    def register_entity(self, entry: DataCatalogEntry) -> str:
        """Реєстрація сутності в каталозі"""
        self.catalog[entry.entity_id] = entry

        # Записуємо lineage подію
        lineage_event = DataLineageEvent(
            event_id=str(uuid.uuid4()),
            source_entity="data_governance",
            target_entity=entry.entity_id,
            operation="register",
            timestamp=datetime.now(),
            metadata={
                "entity_type": entry.entity_type,
                "classification": entry.classification.value,
                "pii_fields_count": len(entry.pii_fields),
            },
        )
        self.lineage_events.append(lineage_event)

        logger.info(f"✅ Registered entity in catalog: {entry.entity_name}")
        return entry.entity_id

    def track_lineage(
        self,
        source_entity: str,
        target_entity: str,
        operation: str,
        metadata: Dict[str, Any] = None,
    ):
        """Відстеження лінії даних"""
        event = DataLineageEvent(
            event_id=str(uuid.uuid4()),
            source_entity=source_entity,
            target_entity=target_entity,
            operation=operation,
            timestamp=datetime.now(),
            metadata=metadata or {},
        )
        self.lineage_events.append(event)

        logger.info(f"📊 Tracked lineage: {source_entity} → {target_entity} ({operation})")

    def get_lineage_chain(
        self, entity_id: str, direction: str = "downstream"
    ) -> List[DataLineageEvent]:
        """Отримання ланцюжка лінії даних"""
        chain = []

        if direction == "downstream":
            # Вниз по течії: що створено з цієї сутності
            chain = [e for e in self.lineage_events if e.source_entity == entity_id]
        elif direction == "upstream":
            # Вгору по течії: з чого створена ця сутність
            chain = [e for e in self.lineage_events if e.target_entity == entity_id]
        else:
            # Обидві напрямки
            chain = [
                e
                for e in self.lineage_events
                if e.source_entity == entity_id or e.target_entity == entity_id
            ]

        return sorted(chain, key=lambda x: x.timestamp)

    def mask_pii_data(self, data: Dict[str, Any], entity_type: str) -> Dict[str, Any]:
        """Маскування PII даних"""
        if entity_type not in self.pii_registry:
            return data

        masked_data = data.copy()
        pii_fields = self.pii_registry[entity_type]

        for pii_field in pii_fields:
            # Навігація по вкладених полях (напр. "declarant.name")
            field_path = pii_field.field_path.split(".")
            current_obj = masked_data

            try:
                # Дойти до батьківського об'єкта
                for i, path_part in enumerate(field_path[:-1]):
                    if path_part in current_obj:
                        current_obj = current_obj[path_part]
                    else:
                        break
                else:
                    # Замаскувати поле
                    field_name = field_path[-1]
                    if field_name in current_obj:
                        original_value = current_obj[field_name]
                        current_obj[field_name] = pii_field.mask_pattern

                        logger.debug(f"🔒 Masked PII field: {pii_field.field_path}")

            except Exception as e:
                logger.warning(f"⚠️  Could not mask PII field {pii_field.field_path}: {e}")

        return masked_data

    def check_retention_compliance(self, entity_id: str) -> Dict[str, Any]:
        """Перевірка дотримання retention політик"""
        if entity_id not in self.catalog:
            return {"status": "error", "message": "Entity not found in catalog"}

        entity = self.catalog[entity_id]

        if not entity.retention_policy or entity.retention_policy not in self.retention_policies:
            return {"status": "warning", "message": "No retention policy assigned"}

        policy = self.retention_policies[entity.retention_policy]
        age_days = (datetime.now() - entity.created_at).days

        result = {
            "entity_id": entity_id,
            "entity_name": entity.entity_name,
            "policy": entity.retention_policy,
            "age_days": age_days,
            "status": "compliant",
            "actions": [],
        }

        # Перевірка на архівування
        if age_days >= policy["archive_after_days"]:
            result["actions"].append(
                {
                    "action": "archive",
                    "due_date": entity.created_at + timedelta(days=policy["archive_after_days"]),
                    "overdue": True,
                }
            )

        # Перевірка на видалення
        if age_days >= policy["delete_after_days"]:
            result["actions"].append(
                {
                    "action": "delete",
                    "due_date": entity.created_at + timedelta(days=policy["delete_after_days"]),
                    "overdue": True,
                }
            )
            result["status"] = "action_required"

        return result

    def get_catalog_summary(self) -> Dict[str, Any]:
        """Отримання зведення каталогу"""
        total_entities = len(self.catalog)

        # Групування по типах
        by_type = {}
        by_classification = {}
        pii_entities = 0

        for entity in self.catalog.values():
            # По типах
            if entity.entity_type not in by_type:
                by_type[entity.entity_type] = 0
            by_type[entity.entity_type] += 1

            # По класифікації
            if entity.classification.value not in by_classification:
                by_classification[entity.classification.value] = 0
            by_classification[entity.classification.value] += 1

            # PII дані
            if len(entity.pii_fields) > 0:
                pii_entities += 1

        # Lineage статистика
        lineage_operations = {}
        for event in self.lineage_events:
            if event.operation not in lineage_operations:
                lineage_operations[event.operation] = 0
            lineage_operations[event.operation] += 1

        return {
            "catalog": {
                "total_entities": total_entities,
                "by_type": by_type,
                "by_classification": by_classification,
                "pii_entities": pii_entities,
            },
            "lineage": {
                "total_events": len(self.lineage_events),
                "by_operation": lineage_operations,
            },
            "retention_policies": list(self.retention_policies.keys()),
            "pii_registries": list(self.pii_registry.keys()),
        }

    def get_pii_audit_report(self) -> Dict[str, Any]:
        """Звіт аудиту PII даних"""
        pii_summary = {}

        for registry_name, pii_fields in self.pii_registry.items():
            pii_summary[registry_name] = {
                "total_pii_fields": len(pii_fields),
                "by_type": {},
                "by_classification": {},
                "retention_days": {},
            }

            for pii_field in pii_fields:
                # По типах PII
                pii_type = pii_field.pii_type.value
                if pii_type not in pii_summary[registry_name]["by_type"]:
                    pii_summary[registry_name]["by_type"][pii_type] = 0
                pii_summary[registry_name]["by_type"][pii_type] += 1

                # По класифікації
                classification = pii_field.classification.value
                if classification not in pii_summary[registry_name]["by_classification"]:
                    pii_summary[registry_name]["by_classification"][classification] = 0
                pii_summary[registry_name]["by_classification"][classification] += 1

                # По retention
                retention = pii_field.retention_days or 0
                if retention not in pii_summary[registry_name]["retention_days"]:
                    pii_summary[registry_name]["retention_days"][retention] = 0
                pii_summary[registry_name]["retention_days"][retention] += 1

        return {
            "pii_registries": pii_summary,
            "audit_timestamp": datetime.now().isoformat(),
            "total_pii_types": len(PIIType),
            "total_classification_levels": len(DataClassification),
        }


# Singleton instance
governance_manager = DataGovernanceManager()


async def get_governance_manager() -> DataGovernanceManager:
    """Отримання governance manager"""
    return governance_manager
