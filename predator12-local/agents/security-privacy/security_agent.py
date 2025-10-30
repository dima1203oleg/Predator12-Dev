#!/usr/bin/env python3
"""
SecurityAgent - Агент безпеки та аудиту
Контролює доступ до PII даних, моніторить підозрілу активність та забезпечує безпеку
"""

import asyncio
import hashlib
import json
import logging
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Set

# Conditional imports з proper error handling
try:
    import aiohttp
except ImportError:
    aiohttp = None

try:
    import aiofiles
except ImportError:
    aiofiles = None

try:
    import jwt
except ImportError:
    jwt = None

try:
    import asyncpg
except ImportError:
    asyncpg = None

logger = logging.getLogger(__name__)


class SecurityLevel(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"
    TOP_SECRET = "top_secret"


class PIIType(Enum):
    EMAIL = "email"
    PHONE = "phone"
    NAME = "name"
    ID_NUMBER = "id_number"
    CREDIT_CARD = "credit_card"
    ADDRESS = "address"
    PASSPORT = "passport"
    TAX_ID = "tax_id"
    BANK_ACCOUNT = "bank_account"


@dataclass
class SecurityIncident:
    id: str
    timestamp: datetime
    incident_type: str
    severity: str
    source_ip: str
    user_id: Optional[str]
    description: str
    evidence: Dict[str, Any]
    status: str = "open"


@dataclass
class PIIDetection:
    field_name: str
    pii_type: PIIType
    original_value: str
    masked_value: str
    confidence: float
    location: str


class SecurityAgent:
    """
    Агент безпеки та аудиту згідно з технічним завданням
    """

    def __init__(self):
        self.pii_patterns = self._load_pii_patterns()
        self.security_incidents: List[SecurityIncident] = []
        self.pii_audit_log: List[Dict[str, Any]] = []
        self.blocked_ips: Set[str] = set()
        self.failed_login_attempts: Dict[str, int] = {}

        # Налаштування
        self.max_failed_logins = 5
        self.pii_salt = "predator-pii-salt-2024"  # В продакшені з .env
        self.keycloak_url = "http://keycloak:8080"
        self.postgres_url = "postgresql://postgres:postgres@db:5432/predator11"

        # Кеш ролей користувачів для швидкого доступу
        self.user_roles_cache: Dict[str, List[str]] = {}

    def _load_pii_patterns(self) -> Dict[PIIType, List[str]]:
        """Завантажує паттерни для виявлення PII"""
        return {
            PIIType.EMAIL: [r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"],
            PIIType.PHONE: [
                r"\+?3?8?0\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}",  # Ukrainian
                r"\+?1?\d{3}[\s\-]?\d{3}[\s\-]?\d{4}",  # US
                r"\b\d{3}[\s\-]?\d{3}[\s\-]?\d{4}\b",
            ],
            PIIType.NAME: [
                r"\b[А-ЯЇІЄҐ][а-яїієґ]+\s+[А-ЯЇІЄҐ][а-яїієґ]+\b",  # Ukrainian names
                r"\b[A-Z][a-z]+\s+[A-Z][a-z]+\b",  # English names
            ],
            PIIType.ID_NUMBER: [
                r"\b\d{10}\b",  # Ukrainian tax number
                r"\b\d{9}\b",  # US SSN format
                r"\b\d{2}\s?\d{2}\s?\d{6}\b",  # Ukrainian passport
            ],
            PIIType.CREDIT_CARD: [
                r"\b4\d{3}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b",  # Visa
                r"\b5\d{3}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b",  # MasterCard
            ],
            PIIType.ADDRESS: [r"\b\d+\s+[А-Яа-яїієґA-Za-z\s,\.]+\s+\d{5}\b"],
            PIIType.BANK_ACCOUNT: [
                r"\bUA\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b",  # Ukrainian IBAN
                r"\b\d{16,20}\b",  # Generic bank account
            ],
        }

    async def initialize(self):
        """Ініціалізує SecurityAgent"""
        logger.info("🔒 Initializing Security Agent...")

        # Завантажуємо існуючі інциденти з БД
        await self.load_security_incidents()

        # Запускаємо моніторинг безпеки
        asyncio.create_task(self.start_security_monitoring())

        logger.info("✅ Security Agent initialized successfully")

    async def load_security_incidents(self):
        """Завантажує інциденти безпеки з БД"""
        try:
            import asyncpg

            conn = await asyncpg.connect(self.postgres_url)

            # Створюємо таблицю якщо не існує
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS security_incidents (
                    id VARCHAR PRIMARY KEY,
                    timestamp TIMESTAMP,
                    incident_type VARCHAR,
                    severity VARCHAR,
                    source_ip VARCHAR,
                    user_id VARCHAR,
                    description TEXT,
                    evidence JSONB,
                    status VARCHAR DEFAULT 'open'
                )
            """
            )

            # Завантажуємо останні інциденти
            incidents = await conn.fetch(
                """
                SELECT * FROM security_incidents
                WHERE timestamp > NOW() - INTERVAL '7 days'
                ORDER BY timestamp DESC
                LIMIT 1000
            """
            )

            for incident in incidents:
                self.security_incidents.append(
                    SecurityIncident(
                        id=incident["id"],
                        timestamp=incident["timestamp"],
                        incident_type=incident["incident_type"],
                        severity=incident["severity"],
                        source_ip=incident["source_ip"],
                        user_id=incident["user_id"],
                        description=incident["description"],
                        evidence=incident["evidence"],
                        status=incident["status"],
                    )
                )

            await conn.close()

            logger.info(f"📊 Loaded {len(self.security_incidents)} recent security incidents")

        except Exception as e:
            logger.error(f"Failed to load security incidents: {e}")

    async def start_security_monitoring(self):
        """Запускає постійний моніторинг безпеки"""
        logger.info("👁️ Starting continuous security monitoring...")

        while True:
            try:
                # Перевіряємо підозрілу активність
                await self.check_suspicious_activity()

                # Аналізуємо логи доступу
                await self.analyze_access_logs()

                # Перевіряємо blocked IPs
                await self.cleanup_blocked_ips()

                # Оновлюємо кеш ролей
                await self.update_user_roles_cache()

                await asyncio.sleep(60)  # Перевірка кожну хвилину

            except Exception as e:
                logger.error(f"Error in security monitoring: {e}")
                await asyncio.sleep(30)

    async def validate_access_request(
        self, user_token: str, resource: str, action: str
    ) -> Dict[str, Any]:
        """Валідує запит на доступ до ресурсу"""
        try:
            # Декодуємо JWT токен
            user_info = await self.decode_user_token(user_token)
            if not user_info:
                return {"allowed": False, "reason": "Invalid token"}

            user_id = user_info.get("sub")
            user_roles = user_info.get("realm_access", {}).get("roles", [])

            # Перевіряємо чи користувач не заблокований
            if await self.is_user_blocked(user_id):
                await self.log_security_incident(
                    "blocked_user_access_attempt",
                    "warning",
                    user_info.get("ip", "unknown"),
                    user_id,
                    f"Blocked user {user_id} attempted to access {resource}",
                )
                return {"allowed": False, "reason": "User is blocked"}

            # Визначаємо рівень безпеки ресурсу
            resource_security_level = await self.get_resource_security_level(resource)

            # Перевіряємо права доступу
            access_allowed = await self.check_rbac_permissions(user_roles, resource, action)

            if access_allowed:
                # Логуємо успішний доступ
                await self.log_access_attempt(user_id, resource, action, True)
                return {
                    "allowed": True,
                    "user_id": user_id,
                    "roles": user_roles,
                    "security_level": resource_security_level,
                }
            else:
                # Логуємо невдалий доступ
                await self.log_access_attempt(user_id, resource, action, False)
                await self.log_security_incident(
                    "unauthorized_access_attempt",
                    "warning",
                    user_info.get("ip", "unknown"),
                    user_id,
                    f"User {user_id} attempted unauthorized access to {resource}",
                )
                return {"allowed": False, "reason": "Insufficient permissions"}

        except Exception as e:
            logger.error(f"Error validating access request: {e}")
            return {"allowed": False, "reason": "Validation error"}

    async def decode_user_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Декодує JWT токен користувача"""
        try:
            # Отримуємо публічний ключ від Keycloak
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.keycloak_url}/realms/predator11/protocol/openid-connect/certs"
                ) as response:
                    if response.status == 200:
                        keys_data = await response.json()
                        # Для спрощення використовуємо перший ключ
                        # У продакшені потрібна правильна верифікація за kid

                        # Декодуємо токен без верифікації для демонстрації
                        # У продакшені ОБОВ'ЯЗКОВО верифікувати підпис!
                        decoded = jwt.decode(token, options={"verify_signature": False})
                        return decoded

            return None

        except Exception as e:
            logger.error(f"Failed to decode token: {e}")
            return None

    async def is_user_blocked(self, user_id: str) -> bool:
        """Перевіряє чи заблокований користувач"""
        # Перевіряємо в кеші та БД
        try:
            import asyncpg

            conn = await asyncpg.connect(self.postgres_url)

            result = await conn.fetchval(
                """
                SELECT blocked FROM user_security_status
                WHERE user_id = $1 AND blocked = true
            """,
                user_id,
            )

            await conn.close()
            return result is not None

        except Exception:
            return False

    async def get_resource_security_level(self, resource: str) -> SecurityLevel:
        """Визначає рівень безпеки ресурсу"""
        # Правила для визначення рівня безпеки
        if "pii" in resource.lower() or "personal" in resource.lower():
            return SecurityLevel.RESTRICTED
        elif "financial" in resource.lower() or "payment" in resource.lower():
            return SecurityLevel.CONFIDENTIAL
        elif "admin" in resource.lower() or "system" in resource.lower():
            return SecurityLevel.RESTRICTED
        elif "internal" in resource.lower():
            return SecurityLevel.INTERNAL
        else:
            return SecurityLevel.PUBLIC

    async def check_rbac_permissions(
        self, user_roles: List[str], resource: str, action: str
    ) -> bool:
        """Перевіряє RBAC права доступу"""
        # Матриця прав доступу згідно з ТЗ
        permissions_matrix = {
            "admin": ["*"],  # Повні права
            "security_officer": ["audit/*", "pii/view", "logs/*"],
            "data_analyst": ["data/read", "analysis/*", "dashboards/*"],
            "viewer": ["dashboards/view", "reports/view"],
        }

        # Спеціальні права для PII даних
        pii_permissions = {
            "admin": True,
            "security_officer": True,
            "pii_viewer": True,  # Спеціальна роль для перегляду PII
        }

        # Перевіряємо доступ до PII
        if "pii" in resource.lower() and action == "read":
            return any(role in pii_permissions for role in user_roles)

        # Перевіряємо загальні права
        for role in user_roles:
            allowed_resources = permissions_matrix.get(role, [])

            if "*" in allowed_resources:
                return True

            for allowed_resource in allowed_resources:
                if allowed_resource.endswith("*"):
                    # Wildcard match
                    prefix = allowed_resource[:-1]
                    if resource.startswith(prefix):
                        return True
                elif resource == allowed_resource:
                    return True

        return False

    async def detect_and_mask_pii(
        self, data: Dict[str, Any], user_has_pii_access: bool = False
    ) -> Dict[str, Any]:
        """Виявляє та маскує PII дані"""
        masked_data = data.copy()
        detections = []

        for field_name, field_value in data.items():
            if not isinstance(field_value, str):
                continue

            # Перевіряємо кожен тип PII
            for pii_type, patterns in self.pii_patterns.items():
                for pattern in patterns:
                    matches = re.finditer(pattern, field_value, re.IGNORECASE)

                    for match in matches:
                        original_value = match.group(0)

                        if user_has_pii_access:
                            # Користувач має доступ до PII - не маскуємо
                            masked_value = original_value
                        else:
                            # Маскуємо дані
                            masked_value = await self.mask_pii_value(original_value, pii_type)

                            # Замінюємо в даних
                            masked_data[field_name] = field_value.replace(
                                original_value, masked_value
                            )

                        detection = PIIDetection(
                            field_name=field_name,
                            pii_type=pii_type,
                            original_value=original_value,
                            masked_value=masked_value,
                            confidence=0.9,  # Високий рівень довіри для regex
                            location=f"field:{field_name}",
                        )
                        detections.append(detection)

                        # Логуємо виявлення PII
                        await self.log_pii_detection(detection, user_has_pii_access)

        return {
            "data": masked_data,
            "pii_detections": [
                {
                    "field": d.field_name,
                    "type": d.pii_type.value,
                    "masked": d.masked_value,
                    "confidence": d.confidence,
                }
                for d in detections
            ],
            "has_pii": len(detections) > 0,
        }

    async def mask_pii_value(self, value: str, pii_type: PIIType) -> str:
        """Маскує PII значення"""
        if pii_type == PIIType.EMAIL:
            # email@domain.com -> e***@d***.com
            parts = value.split("@")
            if len(parts) == 2:
                username = parts[0][0] + "*" * (len(parts[0]) - 1) if len(parts[0]) > 1 else "*"
                domain_parts = parts[1].split(".")
                domain = (
                    domain_parts[0][0] + "*" * (len(domain_parts[0]) - 1)
                    if len(domain_parts[0]) > 1
                    else "*"
                )
                return f"{username}@{domain}.{domain_parts[-1]}"

        elif pii_type == PIIType.PHONE:
            # +380501234567 -> +38050***4567
            if len(value) > 6:
                return (
                    value[:6] + "*" * (len(value) - 9) + value[-3:]
                    if len(value) > 9
                    else value[:3] + "*" * (len(value) - 3)
                )

        elif pii_type == PIIType.NAME:
            # Іван Петров -> І*** П***
            parts = value.split()
            return " ".join(
                [part[0] + "*" * (len(part) - 1) if len(part) > 1 else "*" for part in parts]
            )

        elif pii_type == PIIType.ID_NUMBER:
            # 1234567890 -> 123***7890
            if len(value) > 6:
                return value[:3] + "*" * (len(value) - 6) + value[-3:]

        elif pii_type == PIIType.CREDIT_CARD:
            # 4111111111111111 -> 4111 **** **** 1111
            if len(value) >= 12:
                return value[:4] + " **** **** " + value[-4:]

        # Загальне маскування для інших типів
        if len(value) <= 2:
            return "*" * len(value)
        elif len(value) <= 4:
            return value[0] + "*" * (len(value) - 1)
        else:
            return value[:2] + "*" * (len(value) - 4) + value[-2:]

    async def log_pii_detection(self, detection: PIIDetection, user_has_access: bool):
        """Логує виявлення PII"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "field_name": detection.field_name,
            "pii_type": detection.pii_type.value,
            "confidence": detection.confidence,
            "location": detection.location,
            "user_has_access": user_has_access,
            "masked": not user_has_access,
        }

        self.pii_audit_log.append(log_entry)

        # Обмежуємо розмір лог-файлу в пам'яті
        if len(self.pii_audit_log) > 10000:
            self.pii_audit_log = self.pii_audit_log[-5000:]

        # Зберігаємо в БД для постійного зберігання
        await self.save_pii_audit_log(log_entry)

    async def save_pii_audit_log(self, log_entry: Dict[str, Any]):
        """Зберігає лог PII в БД"""
        try:
            import asyncpg

            conn = await asyncpg.connect(self.postgres_url)

            # Створюємо таблицю якщо не існує
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS pii_audit_log (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP,
                    field_name VARCHAR,
                    pii_type VARCHAR,
                    confidence FLOAT,
                    location VARCHAR,
                    user_has_access BOOLEAN,
                    masked BOOLEAN
                )
            """
            )

            # Вставляємо запис
            await conn.execute(
                """
                INSERT INTO pii_audit_log
                (timestamp, field_name, pii_type, confidence, location, user_has_access, masked)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
                datetime.fromisoformat(log_entry["timestamp"].replace("Z", "+00:00")),
                log_entry["field_name"],
                log_entry["pii_type"],
                log_entry["confidence"],
                log_entry["location"],
                log_entry["user_has_access"],
                log_entry["masked"],
            )

            await conn.close()

        except Exception as e:
            logger.error(f"Failed to save PII audit log: {e}")

    async def log_access_attempt(self, user_id: str, resource: str, action: str, success: bool):
        """Логує спроби доступу"""
        access_log = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "success": success,
            "ip_address": "unknown",  # В реальній системі отримувати з request
        }

        # Якщо невдача - відслідковуємо для блокування
        if not success:
            self.failed_login_attempts[user_id] = self.failed_login_attempts.get(user_id, 0) + 1

            if self.failed_login_attempts[user_id] >= self.max_failed_logins:
                await self.block_user(
                    user_id,
                    f"Too many failed access attempts: {self.failed_login_attempts[user_id]}",
                )
        else:
            # Скидаємо лічильник при успішному доступі
            self.failed_login_attempts.pop(user_id, None)

    async def log_security_incident(
        self,
        incident_type: str,
        severity: str,
        source_ip: str,
        user_id: Optional[str],
        description: str,
        evidence: Dict[str, Any] = None,
    ):
        """Логує інцидент безпеки"""
        incident_id = hashlib.md5(
            f"{datetime.now().isoformat()}-{incident_type}-{source_ip}".encode()
        ).hexdigest()[:16]

        incident = SecurityIncident(
            id=incident_id,
            timestamp=datetime.now(),
            incident_type=incident_type,
            severity=severity,
            source_ip=source_ip,
            user_id=user_id,
            description=description,
            evidence=evidence or {},
        )

        self.security_incidents.append(incident)

        # Зберігаємо в БД
        await self.save_security_incident(incident)

        # Надсилаємо алерт при критичних інцидентах
        if severity in ["critical", "high"]:
            await self.send_security_alert(incident)

        logger.warning(f"🚨 Security incident: {incident_type} - {description}")

    async def save_security_incident(self, incident: SecurityIncident):
        """Зберігає інцидент безпеки в БД"""
        try:
            import asyncpg

            conn = await asyncpg.connect(self.postgres_url)

            await conn.execute(
                """
                INSERT INTO security_incidents
                (id, timestamp, incident_type, severity, source_ip, user_id, description, evidence, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO NOTHING
            """,
                incident.id,
                incident.timestamp,
                incident.incident_type,
                incident.severity,
                incident.source_ip,
                incident.user_id,
                incident.description,
                json.dumps(incident.evidence),
                incident.status,
            )

            await conn.close()

        except Exception as e:
            logger.error(f"Failed to save security incident: {e}")

    async def send_security_alert(self, incident: SecurityIncident):
        """Надсилає алерт про інцидент безпеки"""
        try:
            # Відправляємо в Alertmanager
            alert_data = [
                {
                    "labels": {
                        "alertname": "SecurityIncident",
                        "severity": incident.severity,
                        "incident_type": incident.incident_type,
                        "source_ip": incident.source_ip,
                    },
                    "annotations": {
                        "description": incident.description,
                        "incident_id": incident.id,
                    },
                    "startsAt": incident.timestamp.isoformat() + "Z",
                }
            ]

            async with aiohttp.ClientSession() as session:
                await session.post("http://alertmanager:9093/api/v1/alerts", json=alert_data)

            logger.info(f"🚨 Security alert sent for incident {incident.id}")

        except Exception as e:
            logger.error(f"Failed to send security alert: {e}")

    async def block_user(self, user_id: str, reason: str):
        """Блокує користувача"""
        try:
            import asyncpg

            conn = await asyncpg.connect(self.postgres_url)

            # Створюємо таблицю якщо не існує
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS user_security_status (
                    user_id VARCHAR PRIMARY KEY,
                    blocked BOOLEAN DEFAULT false,
                    blocked_at TIMESTAMP,
                    blocked_reason TEXT,
                    blocked_until TIMESTAMP
                )
            """
            )

            # Блокуємо користувача
            await conn.execute(
                """
                INSERT INTO user_security_status (user_id, blocked, blocked_at, blocked_reason)
                VALUES ($1, true, $2, $3)
                ON CONFLICT (user_id)
                DO UPDATE SET blocked = true, blocked_at = $2, blocked_reason = $3
            """,
                user_id,
                datetime.now(),
                reason,
            )

            await conn.close()

            # Логуємо інцидент блокування
            await self.log_security_incident(
                "user_blocked", "high", "system", user_id, f"User {user_id} blocked: {reason}"
            )

            logger.warning(f"🚫 User {user_id} has been blocked: {reason}")

        except Exception as e:
            logger.error(f"Failed to block user {user_id}: {e}")

    async def check_suspicious_activity(self):
        """Перевіряє підозрілу активність"""
        # Аналізуємо останні невдалі спроби входу
        suspicious_users = [
            user_id for user_id, count in self.failed_login_attempts.items() if count >= 3
        ]

        for user_id in suspicious_users:
            await self.log_security_incident(
                "suspicious_login_pattern",
                "medium",
                "unknown",
                user_id,
                f"User {user_id} has {self.failed_login_attempts[user_id]} failed login attempts",
            )

    async def analyze_access_logs(self):
        """Аналізує логи доступу для виявлення аномалій"""
        # Тут би був аналіз патернів доступу, але для демо просто перевіряємо кількість
        current_hour = datetime.now().replace(minute=0, second=0, microsecond=0)

        # В реальній системі аналізували б логи з файлів або БД
        logger.debug("🔍 Analyzing access logs for anomalies...")

    async def cleanup_blocked_ips(self):
        """Очищає застарілі заблоковані IP"""
        # В реальній системі тут була б логіка розблокування IP через певний час
        pass

    async def update_user_roles_cache(self):
        """Оновлює кеш ролей користувачів"""
        try:
            # В реальній системі тут би був запит до Keycloak API
            # або БД для оновлення кешу ролей
            pass

        except Exception as e:
            logger.error(f"Failed to update user roles cache: {e}")

    async def get_pii_audit_report(
        self, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Генерує звіт про доступ до PII"""
        try:
            import asyncpg

            conn = await asyncpg.connect(self.postgres_url)

            # Отримуємо статистику PII доступів
            pii_stats = await conn.fetch(
                """
                SELECT pii_type, COUNT(*) as detections,
                       SUM(CASE WHEN user_has_access THEN 1 ELSE 0 END) as authorized_access,
                       SUM(CASE WHEN masked THEN 1 ELSE 0 END) as masked_instances
                FROM pii_audit_log
                WHERE timestamp BETWEEN $1 AND $2
                GROUP BY pii_type
            """,
                start_date,
                end_date,
            )

            await conn.close()

            return {
                "period": {"start": start_date.isoformat(), "end": end_date.isoformat()},
                "pii_statistics": [
                    {
                        "pii_type": row["pii_type"],
                        "total_detections": row["detections"],
                        "authorized_access": row["authorized_access"],
                        "masked_instances": row["masked_instances"],
                    }
                    for row in pii_stats
                ],
                "total_pii_detections": sum(row["detections"] for row in pii_stats),
                "compliance_rate": sum(row["masked_instances"] for row in pii_stats)
                / max(sum(row["detections"] for row in pii_stats), 1)
                * 100,
            }

        except Exception as e:
            logger.error(f"Failed to generate PII audit report: {e}")
            return {"error": str(e)}

    async def get_security_status(self) -> Dict[str, Any]:
        """Повертає поточний статус безпеки"""
        recent_incidents = [
            incident
            for incident in self.security_incidents
            if incident.timestamp > datetime.now() - timedelta(hours=24)
        ]

        return {
            "timestamp": datetime.now().isoformat(),
            "security_level": "HIGH" if len(recent_incidents) > 5 else "NORMAL",
            "incidents_last_24h": len(recent_incidents),
            "blocked_users": len(
                [i for i in recent_incidents if i.incident_type == "user_blocked"]
            ),
            "pii_detections_today": len(
                [
                    log
                    for log in self.pii_audit_log
                    if log["timestamp"] > (datetime.now() - timedelta(days=1)).isoformat()
                ]
            ),
            "failed_login_attempts": len(self.failed_login_attempts),
            "status": "active",
        }


# Глобальний екземпляр агента
security_agent = SecurityAgent()


async def main():
    """Основна функція для запуску агента"""
    logger.info("🚀 Starting Predator Analytics Security Agent...")

    try:
        await security_agent.initialize()
        logger.info("🔒 Security Agent is active and monitoring...")

        # Тримаємо агент запущеним
        while True:
            await asyncio.sleep(60)

    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Error in Security Agent: {e}")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    asyncio.run(main())
