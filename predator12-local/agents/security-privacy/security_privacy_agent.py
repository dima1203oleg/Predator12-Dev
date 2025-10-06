#!/usr/bin/env python3
"""
🛡️ Security & Privacy Agent - PII Protection and Access Control
PII-маскування, RBAC/ABAC, UEBA-аномалії та журнал доступу
"""

import re
import hashlib
from datetime import datetime
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass
from enum import Enum

import redis
from fastapi import FastAPI, HTTPException, Depends, Header
import structlog

logger = structlog.get_logger(__name__)

class PIIType(Enum):
    EMAIL = "email"
    PHONE = "phone"
    SSN = "ssn"
    CREDIT_CARD = "credit_card"
    IBAN = "iban"
    PASSPORT = "passport"
    NAME = "name"
    ADDRESS = "address"

class MaskingMethod(Enum):
    FULL_MASK = "full_mask"          # ***MASKED***
    PARTIAL_MASK = "partial_mask"    # user***@domain.com
    HASH = "hash"                    # SHA256 hash
    PSEUDONYM = "pseudonym"          # pseudo_12345
    REMOVE = "remove"                # полне видалення

@dataclass
class PIIPattern:
    """Патерн для виявлення PII"""
    pii_type: PIIType
    regex_pattern: str
    confidence_threshold: float
    description: str

@dataclass
class AccessLog:
    """Запис журналу доступу"""
    user_id: str
    resource: str
    action: str
    pii_accessed: List[str]
    timestamp: datetime
    ip_address: str
    user_agent: str
    success: bool
    risk_score: float

class SecurityPrivacyAgent:
    """Агент безпеки та приватності"""
    
    def __init__(self):
        self.app = FastAPI(title="Security & Privacy Agent", version="1.0.0")
        self.redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
        
        # PII патерни
        self.pii_patterns = self._init_pii_patterns()
        
        # Ролі та дозволи
        self.rbac_roles = self._init_rbac_roles()
        
        self._setup_routes()
    
    def _init_pii_patterns(self) -> List[PIIPattern]:
        """Ініціалізація патернів для виявлення PII"""
        return [
            PIIPattern(
                pii_type=PIIType.EMAIL,
                regex_pattern=r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                confidence_threshold=0.9,
                description="Email addresses"
            ),
            PIIPattern(
                pii_type=PIIType.PHONE,
                regex_pattern=r'(?:\+38|8)?[\s\-]?\(?0\d{2}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}',
                confidence_threshold=0.8,
                description="Ukrainian phone numbers"
            ),
            PIIPattern(
                pii_type=PIIType.CREDIT_CARD,
                regex_pattern=r'\b(?:\d{4}[\s\-]?){3}\d{4}\b',
                confidence_threshold=0.95,
                description="Credit card numbers"
            ),
            PIIPattern(
                pii_type=PIIType.IBAN,
                regex_pattern=r'\b[A-Z]{2}\d{2}\s?[A-Z0-9]{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}\b',
                confidence_threshold=0.9,
                description="IBAN account numbers"
            ),
            PIIPattern(
                pii_type=PIIType.SSN,
                regex_pattern=r'\b\d{3}-?\d{2}-?\d{4}\b',
                confidence_threshold=0.85,
                description="Social Security Numbers"
            ),
            PIIPattern(
                pii_type=PIIType.PASSPORT,
                regex_pattern=r'\b[A-Z]{2}\d{6}\b',
                confidence_threshold=0.8,
                description="Passport numbers"
            )
        ]
    
    def _init_rbac_roles(self) -> Dict[str, Dict[str, Any]]:
        """Ініціалізація ролей RBAC"""
        return {
            "admin": {
                "permissions": ["*"],
                "pii_access": True,
                "data_export": True,
                "user_management": True,
                "description": "Full system access"
            },
            "analyst": {
                "permissions": ["analytics.*", "synthetic.*", "graph.*", "forecast.*"],
                "pii_access": False,
                "data_export": True,
                "user_management": False,
                "description": "Analytics access without PII"
            },
            "sec_officer": {
                "permissions": ["security.*", "compliance.*", "audit.*"],
                "pii_access": True,
                "data_export": True,
                "user_management": False,
                "description": "Security and compliance officer"
            },
            "viewer": {
                "permissions": ["dashboard.read", "report.read"],
                "pii_access": False,
                "data_export": False,
                "user_management": False,
                "description": "Read-only access"
            },
            "data_engineer": {
                "permissions": ["ingest.*", "etl.*", "quality.*"],
                "pii_access": False,
                "data_export": False,
                "user_management": False,
                "description": "Data pipeline access"
            }
        }
    
    def _setup_routes(self):
        """Налаштування HTTP маршрутів"""
        
        @self.app.post("/security/mask")
        async def mask_pii_data(request: dict):
            """Маскування PII в даних"""
            try:
                data = request["data"]
                method = MaskingMethod(request.get("method", "full_mask"))
                fields = request.get("fields", [])  # Специфічні поля для маскування
                
                result = await self.mask_pii(data, method, fields)
                return result
                
            except Exception as e:
                logger.error("Error masking PII", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/security/detect")
        async def detect_pii(request: dict):
            """Виявлення PII в тексті або даних"""
            try:
                text = request.get("text", "")
                data = request.get("data", {})
                
                detected_pii = await self.detect_pii_in_data(text, data)
                return {"detected_pii": detected_pii}
                
            except Exception as e:
                logger.error("Error detecting PII", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/security/audit")
        async def log_access(request: dict, x_user_id: str = Header(None), 
                           x_forwarded_for: str = Header(None),
                           user_agent: str = Header(None)):
            """Журналювання доступу до ресурсів"""
            try:
                resource = request["resource"]
                action = request["action"]
                pii_accessed = request.get("pii_accessed", [])
                success = request.get("success", True)
                
                access_log = AccessLog(
                    user_id=x_user_id or "anonymous",
                    resource=resource,
                    action=action,
                    pii_accessed=pii_accessed,
                    timestamp=datetime.now(),
                    ip_address=x_forwarded_for or "unknown",
                    user_agent=user_agent or "unknown",
                    success=success,
                    risk_score=self._calculate_risk_score(action, pii_accessed)
                )
                
                await self._store_access_log(access_log)
                
                return {"status": "logged", "risk_score": access_log.risk_score}
                
            except Exception as e:
                logger.error("Error logging access", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/security/permissions/{user_role}")
        async def get_role_permissions(user_role: str):
            """Отримання дозволів для ролі"""
            if user_role not in self.rbac_roles:
                raise HTTPException(status_code=404, detail="Role not found")
            
            return self.rbac_roles[user_role]
        
        @self.app.post("/security/authorize")
        async def authorize_access(request: dict):
            """Авторизація доступу до ресурсу"""
            try:
                user_role = request["user_role"]
                resource = request["resource"]
                action = request["action"]
                
                authorized = await self.check_authorization(user_role, resource, action)
                
                return {
                    "authorized": authorized,
                    "user_role": user_role,
                    "resource": resource,
                    "action": action
                }
                
            except Exception as e:
                logger.error("Error checking authorization", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/security/audit/report")
        async def get_audit_report(hours: int = 24, user_id: Optional[str] = None):
            """Звіт аудиту доступу"""
            try:
                report = await self.generate_audit_report(hours, user_id)
                return report
                
            except Exception as e:
                logger.error("Error generating audit report", error=str(e))
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/security/health")
        async def health():
            """Health check"""
            return {
                "status": "healthy",
                "pii_patterns_count": len(self.pii_patterns),
                "roles_count": len(self.rbac_roles),
                "timestamp": datetime.now().isoformat()
            }
    
    async def mask_pii(self, data: Any, method: MaskingMethod, 
                      specific_fields: List[str] = None) -> Dict[str, Any]:
        """Маскування PII в даних"""
        
        if isinstance(data, str):
            # Маскування в тексті
            masked_text = self._mask_text(data, method)
            return {"original_type": "text", "masked_data": masked_text}
        
        elif isinstance(data, dict):
            # Маскування в словнику
            masked_dict = {}
            pii_found = []
            
            for key, value in data.items():
                should_mask = specific_fields is None or key in specific_fields
                
                if should_mask and isinstance(value, str):
                    masked_value, found_pii = self._mask_field_value(key, value, method)
                    masked_dict[key] = masked_value
                    pii_found.extend(found_pii)
                else:
                    masked_dict[key] = value
            
            return {
                "original_type": "dict",
                "masked_data": masked_dict,
                "pii_found": pii_found
            }
        
        elif isinstance(data, list):
            # Маскування в списку
            masked_list = []
            pii_found = []
            
            for item in data:
                if isinstance(item, dict):
                    masked_item = await self.mask_pii(item, method, specific_fields)
                    masked_list.append(masked_item["masked_data"])
                    pii_found.extend(masked_item.get("pii_found", []))
                else:
                    masked_list.append(item)
            
            return {
                "original_type": "list",
                "masked_data": masked_list,
                "pii_found": pii_found
            }
        
        else:
            return {"original_type": "other", "masked_data": data}
    
    def _mask_text(self, text: str, method: MaskingMethod) -> str:
        """Маскування PII в тексті"""
        
        masked_text = text
        
        for pattern in self.pii_patterns:
            regex = re.compile(pattern.regex_pattern, re.IGNORECASE)
            matches = regex.findall(text)
            
            for match in matches:
                if method == MaskingMethod.FULL_MASK:
                    replacement = "***MASKED***"
                elif method == MaskingMethod.PARTIAL_MASK:
                    replacement = self._partial_mask(match, pattern.pii_type)
                elif method == MaskingMethod.HASH:
                    replacement = f"hash_{hashlib.sha256(match.encode()).hexdigest()[:8]}"
                elif method == MaskingMethod.PSEUDONYM:
                    replacement = f"pseudo_{hash(match) % 100000}"
                else:  # REMOVE
                    replacement = ""
                
                masked_text = masked_text.replace(match, replacement)
        
        return masked_text
    
    def _mask_field_value(self, field_name: str, value: str, 
                         method: MaskingMethod) -> tuple[str, List[str]]:
        """Маскування значення поля"""
        
        pii_found = []
        
        # Перевіряємо чи є поле потенційно PII по назві
        pii_field_names = {
            'email', 'e_mail', 'mail', 'phone', 'tel', 'telephone',
            'ssn', 'social_security', 'passport', 'iban', 'account',
            'credit_card', 'card_number', 'name', 'full_name',
            'first_name', 'last_name', 'address'
        }
        
        is_pii_field = any(pii_name in field_name.lower() for pii_name in pii_field_names)
        
        if is_pii_field:
            pii_found.append(f"{field_name}:{value[:10]}...")
            
            if method == MaskingMethod.FULL_MASK:
                return "***MASKED***", pii_found
            elif method == MaskingMethod.PARTIAL_MASK:
                if len(value) > 6:
                    return f"{value[:2]}***{value[-2:]}", pii_found
                else:
                    return "***", pii_found
            elif method == MaskingMethod.HASH:
                return f"hash_{hashlib.sha256(value.encode()).hexdigest()[:12]}", pii_found
            elif method == MaskingMethod.PSEUDONYM:
                return f"pseudo_{hash(value) % 100000}", pii_found
            else:  # REMOVE
                return "", pii_found
        
        # Перевіряємо за патернами
        for pattern in self.pii_patterns:
            if re.search(pattern.regex_pattern, value, re.IGNORECASE):
                pii_found.append(f"{field_name}:{pattern.pii_type.value}")
                return self._mask_text(value, method), pii_found
        
        return value, pii_found
    
    def _partial_mask(self, text: str, pii_type: PIIType) -> str:
        """Часткове маскування залежно від типу PII"""
        
        if pii_type == PIIType.EMAIL:
            if "@" in text:
                local, domain = text.split("@", 1)
                if len(local) > 2:
                    return f"{local[:2]}***@{domain}"
                else:
                    return f"***@{domain}"
        
        elif pii_type in [PIIType.PHONE, PIIType.CREDIT_CARD, PIIType.IBAN]:
            if len(text) > 6:
                return f"{text[:2]}***{text[-2:]}"
            else:
                return "***"
        
        elif pii_type == PIIType.NAME:
            words = text.split()
            if len(words) > 1:
                return f"{words[0][0]}*** {words[-1][0]}***"
            else:
                return f"{text[0]}***"
        
        # Загальний випадок
        if len(text) > 4:
            return f"{text[:2]}***{text[-1]}"
        else:
            return "***"
    
    async def detect_pii_in_data(self, text: str, data: Dict) -> List[Dict[str, Any]]:
        """Виявлення PII в тексті та даних"""
        
        detected = []
        
        # Пошук в тексті
        if text:
            for pattern in self.pii_patterns:
                matches = re.finditer(pattern.regex_pattern, text, re.IGNORECASE)
                for match in matches:
                    detected.append({
                        "type": pattern.pii_type.value,
                        "value": match.group()[:10] + "...",
                        "confidence": pattern.confidence_threshold,
                        "location": "text",
                        "start_pos": match.start(),
                        "end_pos": match.end()
                    })
        
        # Пошук в структурованих даних
        if data:
            for key, value in data.items():
                if isinstance(value, str):
                    for pattern in self.pii_patterns:
                        if re.search(pattern.regex_pattern, value, re.IGNORECASE):
                            detected.append({
                                "type": pattern.pii_type.value,
                                "field": key,
                                "value": value[:10] + "...",
                                "confidence": pattern.confidence_threshold,
                                "location": "structured_data"
                            })
        
        return detected
    
    async def check_authorization(self, user_role: str, resource: str, action: str) -> bool:
        """Перевірка авторизації доступу"""
        
        if user_role not in self.rbac_roles:
            return False
        
        role_config = self.rbac_roles[user_role]
        permissions = role_config["permissions"]
        
        # Admin має доступ до всього
        if "*" in permissions:
            return True
        
        # Перевірка специфічних дозволів
        resource_action = f"{resource}.{action}"
        resource_wildcard = f"{resource}.*"
        
        return (resource_action in permissions or 
                resource_wildcard in permissions or
                resource in permissions)
    
    def _calculate_risk_score(self, action: str, pii_accessed: List[str]) -> float:
        """Розрахунок ризику доступу"""
        
        base_risk = {
            "read": 0.1,
            "write": 0.3,
            "delete": 0.7,
            "export": 0.5,
            "admin": 0.8
        }.get(action.lower(), 0.2)
        
        # Збільшуємо ризик за кількість PII
        pii_risk = min(len(pii_accessed) * 0.1, 0.5)
        
        # Загальний ризик
        total_risk = min(base_risk + pii_risk, 1.0)
        
        return round(total_risk, 3)
    
    async def _store_access_log(self, access_log: AccessLog):
        """Зберігання журналу доступу"""
        
        log_data = {
            "user_id": access_log.user_id,
            "resource": access_log.resource,
            "action": access_log.action,
            "pii_accessed": ",".join(access_log.pii_accessed),
            "timestamp": access_log.timestamp.isoformat(),
            "ip_address": access_log.ip_address,
            "user_agent": access_log.user_agent,
            "success": str(access_log.success),
            "risk_score": str(access_log.risk_score)
        }
        
        # Зберігаємо в Redis з TTL
        log_key = f"security:audit:{access_log.timestamp.strftime('%Y%m%d')}:{access_log.user_id}:{int(access_log.timestamp.timestamp())}"
        self.redis_client.hset(log_key, mapping=log_data)
        self.redis_client.expire(log_key, 30 * 24 * 3600)  # 30 днів
        
        # Публікуємо подію для високого ризику
        if access_log.risk_score > 0.6:
            await self._publish_event("security.high_risk_access", {
                "user_id": access_log.user_id,
                "resource": access_log.resource,
                "risk_score": access_log.risk_score,
                "pii_accessed": access_log.pii_accessed
            })
    
    async def generate_audit_report(self, hours: int, user_id: Optional[str]) -> Dict[str, Any]:
        """Генерація звіту аудиту"""
        
        # Симуляція звіту (в реальності запит до Redis)
        report = {
            "period_hours": hours,
            "user_filter": user_id,
            "total_accesses": 150,
            "high_risk_accesses": 5,
            "pii_accesses": 23,
            "failed_accesses": 2,
            "top_resources": [
                {"resource": "customs_data", "count": 45},
                {"resource": "analytics", "count": 32},
                {"resource": "reports", "count": 28}
            ],
            "risk_distribution": {
                "low": 120,
                "medium": 25,
                "high": 5
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return report
    
    async def _publish_event(self, event_type: str, data: Dict[str, Any]):
        """Публікація події в Redis Streams"""
        try:
            event_data = {
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "source": "SecurityPrivacyAgent",
                **data
            }
            
            self.redis_client.xadd("pred:events:security", event_data)
            logger.debug("Security event published", event_type=event_type)
            
        except Exception as e:
            logger.error("Failed to publish security event", error=str(e))

# Запуск агента
if __name__ == "__main__":
    import uvicorn
    
    agent = SecurityPrivacyAgent()
    uvicorn.run(agent.app, host="0.0.0.0", port=9050)
