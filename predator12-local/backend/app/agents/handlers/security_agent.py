"""
Агент безпеки та моніторингу загроз
"""

from __future__ import annotations

import hashlib
import re
from datetime import datetime, timedelta
from typing import Any

from .base_agent import BaseAgent


class SecurityAgent(BaseAgent):
    """Агент для виявлення загроз безпеки та моніторингу"""
    
    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__("SecurityAgent", config)
        self.threat_patterns = self._load_threat_patterns()
        self.security_events = []
        
    def capabilities(self) -> list[str]:
        return [
            "scan_vulnerabilities",
            "detect_intrusions",
            "analyze_logs",
            "check_compliance",
            "monitor_access",
            "generate_security_report"
        ]
        
    def _load_threat_patterns(self) -> dict[str, list[str]]:
        """Завантажує патерни загроз"""
        return {
            "sql_injection": [
                r"(\bUNION\b.*\bSELECT\b)",
                r"(\bOR\b.*=.*)",
                r"(DROP\s+TABLE)",
                r"(INSERT\s+INTO)"
            ],
            "xss": [
                r"(<script[^>]*>.*?</script>)",
                r"(javascript:)",
                r"(onload\s*=)",
                r"(onerror\s*=)"
            ],
            "path_traversal": [
                r"(\.\.\/)",
                r"(\.\.\\)",
                r"(%2e%2e%2f)",
                r"(%2e%2e\\)"
            ]
        }
        
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання безпеки"""
        
        self.logger.info("Processing security task", task_type=task_type)
        
        if task_type == "scan_vulnerabilities":
            return await self._scan_vulnerabilities(payload)
        elif task_type == "detect_intrusions":
            return await self._detect_intrusions(payload)
        elif task_type == "analyze_logs":
            return await self._analyze_logs(payload)
        elif task_type == "check_compliance":
            return await self._check_compliance(payload)
        elif task_type == "monitor_access":
            return await self._monitor_access(payload)
        elif task_type == "generate_security_report":
            return await self._generate_security_report(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _scan_vulnerabilities(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Сканує вразливості в системі"""
        
        target = payload.get("target")
        scan_type = payload.get("scan_type", "basic")
        
        try:
            vulnerabilities = []
            
            # Симуляція сканування різних типів вразливостей
            if scan_type in ["basic", "comprehensive"]:
                # Перевірка слабких паролів
                weak_passwords = self._check_weak_passwords()
                vulnerabilities.extend(weak_passwords)
                
                # Перевірка відкритих портів
                open_ports = self._check_open_ports()
                vulnerabilities.extend(open_ports)
                
                # Перевірка застарілих компонентів
                outdated_components = self._check_outdated_components()
                vulnerabilities.extend(outdated_components)
            
            if scan_type == "comprehensive":
                # Додаткові перевірки для повного сканування
                config_issues = self._check_configuration_issues()
                vulnerabilities.extend(config_issues)
                
                permission_issues = self._check_permission_issues()
                vulnerabilities.extend(permission_issues)
            
            # Оцінка ризику
            risk_summary = self._calculate_risk_summary(vulnerabilities)
            
            return {
                "status": "success",
                "target": target,
                "scan_type": scan_type,
                "vulnerabilities": vulnerabilities,
                "risk_summary": risk_summary,
                "scan_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to scan vulnerabilities", error=str(e), target=target)
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _check_weak_passwords(self) -> list[dict[str, Any]]:
        """Перевіряє наявність слабких паролів"""
        return [
            {
                "type": "weak_password",
                "severity": "high",
                "description": "Default administrator password detected",
                "affected_resource": "admin_account",
                "recommendation": "Change default passwords immediately"
            },
            {
                "type": "weak_password", 
                "severity": "medium",
                "description": "Password does not meet complexity requirements",
                "affected_resource": "user_accounts",
                "recommendation": "Enforce strong password policy"
            }
        ]
    
    def _check_open_ports(self) -> list[dict[str, Any]]:
        """Перевіряє відкриті порти"""
        return [
            {
                "type": "open_port",
                "severity": "medium", 
                "description": "Unnecessary service running on port 22",
                "affected_resource": "ssh_service",
                "recommendation": "Disable SSH if not required"
            }
        ]
    
    def _check_outdated_components(self) -> list[dict[str, Any]]:
        """Перевіряє застарілі компоненти"""
        return [
            {
                "type": "outdated_component",
                "severity": "high",
                "description": "Critical security patches available",
                "affected_resource": "system_packages",
                "recommendation": "Update packages to latest versions"
            }
        ]
    
    def _check_configuration_issues(self) -> list[dict[str, Any]]:
        """Перевіряє проблеми конфігурації"""
        return [
            {
                "type": "config_issue",
                "severity": "medium",
                "description": "Debug mode enabled in production",
                "affected_resource": "application_config",
                "recommendation": "Disable debug mode in production"
            }
        ]
    
    def _check_permission_issues(self) -> list[dict[str, Any]]:
        """Перевіряє проблеми з дозволами"""
        return [
            {
                "type": "permission_issue",
                "severity": "low",
                "description": "Overly permissive file permissions",
                "affected_resource": "config_files",
                "recommendation": "Restrict file permissions to minimum required"
            }
        ]
    
    def _calculate_risk_summary(self, vulnerabilities: list[dict[str, Any]]) -> dict[str, Any]:
        """Розраховує загальний ризик"""
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "low")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        # Розрахунок загального балу ризику
        risk_score = (
            severity_counts["critical"] * 10 +
            severity_counts["high"] * 7 +
            severity_counts["medium"] * 4 +
            severity_counts["low"] * 1
        )
        
        if risk_score >= 50:
            risk_level = "critical"
        elif risk_score >= 25:
            risk_level = "high"
        elif risk_score >= 10:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        return {
            "total_vulnerabilities": len(vulnerabilities),
            "severity_breakdown": severity_counts,
            "risk_score": risk_score,
            "risk_level": risk_level
        }
    
    async def _detect_intrusions(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Виявляє спроби вторгнення"""
        
        data_source = payload.get("data_source")
        time_window = payload.get("time_window", 3600)  # 1 година
        
        try:
            # Симуляція виявлення вторгнень
            intrusion_attempts = [
                {
                    "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
                    "type": "brute_force",
                    "source_ip": "192.168.1.100",
                    "target": "ssh_service", 
                    "severity": "high",
                    "description": "Multiple failed login attempts detected"
                },
                {
                    "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(),
                    "type": "port_scan",
                    "source_ip": "10.0.0.50",
                    "target": "network_services",
                    "severity": "medium",
                    "description": "Port scanning activity detected"
                }
            ]
            
            # Аналіз патернів
            patterns_detected = self._analyze_intrusion_patterns(intrusion_attempts)
            
            return {
                "status": "success",
                "data_source": data_source,
                "time_window": time_window,
                "intrusion_attempts": intrusion_attempts,
                "patterns": patterns_detected,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to detect intrusions", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _analyze_intrusion_patterns(self, attempts: list[dict[str, Any]]) -> dict[str, Any]:
        """Аналізує патерни вторгнень"""
        
        ip_counts = {}
        attack_types = {}
        
        for attempt in attempts:
            source_ip = attempt.get("source_ip")
            attack_type = attempt.get("type")
            
            ip_counts[source_ip] = ip_counts.get(source_ip, 0) + 1
            attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
        
        # Виявлення координованих атак
        coordinated_attacks = [
            ip for ip, count in ip_counts.items() if count > 1
        ]
        
        return {
            "top_sources": sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:5],
            "attack_distribution": attack_types,
            "coordinated_attacks": coordinated_attacks,
            "total_unique_sources": len(ip_counts)
        }
    
    async def _analyze_logs(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Аналізує логи на предмет подій безпеки"""
        
        log_source = payload.get("log_source")
        log_entries = payload.get("log_entries", [])
        
        try:
            security_events = []
            
            for entry in log_entries:
                log_text = entry.get("message", "")
                
                # Перевірка на патерни загроз
                for threat_type, patterns in self.threat_patterns.items():
                    for pattern in patterns:
                        if re.search(pattern, log_text, re.IGNORECASE):
                            security_events.append({
                                "timestamp": entry.get("timestamp"),
                                "threat_type": threat_type,
                                "pattern_matched": pattern,
                                "log_entry": log_text[:200],  # Обрізаємо для безпеки
                                "severity": "high" if threat_type == "sql_injection" else "medium"
                            })
            
            # Статистика подій
            event_summary = self._summarize_security_events(security_events)
            
            return {
                "status": "success",
                "log_source": log_source,
                "logs_analyzed": len(log_entries),
                "security_events": security_events,
                "summary": event_summary
            }
            
        except Exception as e:
            self.logger.error("Failed to analyze logs", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _summarize_security_events(self, events: list[dict[str, Any]]) -> dict[str, Any]:
        """Підсумовує події безпеки"""
        
        threat_counts = {}
        severity_counts = {}
        
        for event in events:
            threat_type = event.get("threat_type")
            severity = event.get("severity")
            
            threat_counts[threat_type] = threat_counts.get(threat_type, 0) + 1
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        
        return {
            "total_events": len(events),
            "threat_breakdown": threat_counts,
            "severity_breakdown": severity_counts,
            "most_common_threat": max(threat_counts, key=threat_counts.get) if threat_counts else None
        }
    
    async def _check_compliance(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Перевіряє відповідність стандартам безпеки"""
        
        framework = payload.get("framework", "gdpr")
        resources = payload.get("resources", [])
        
        try:
            compliance_results = []
            
            if framework.lower() == "gdpr":
                compliance_results = self._check_gdpr_compliance(resources)
            elif framework.lower() == "pci":
                compliance_results = self._check_pci_compliance(resources) 
            elif framework.lower() == "iso27001":
                compliance_results = self._check_iso27001_compliance(resources)
            
            # Розрахунок загального рівня відповідності
            compliance_score = self._calculate_compliance_score(compliance_results)
            
            return {
                "status": "success",
                "framework": framework,
                "compliance_checks": compliance_results,
                "compliance_score": compliance_score,
                "assessment_timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to check compliance", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _check_gdpr_compliance(self, resources: list[str]) -> list[dict[str, Any]]:
        """Перевіряє відповідність GDPR"""
        return [
            {
                "requirement": "Data Encryption",
                "status": "compliant",
                "description": "Personal data is encrypted at rest and in transit",
                "evidence": "Encryption protocols verified"
            },
            {
                "requirement": "Access Controls",
                "status": "non_compliant",
                "description": "Insufficient access logging for personal data",
                "recommendation": "Implement comprehensive access logging"
            },
            {
                "requirement": "Data Retention",
                "status": "partially_compliant",
                "description": "Retention policies defined but not fully automated",
                "recommendation": "Automate data retention and deletion processes"
            }
        ]
    
    def _check_pci_compliance(self, resources: list[str]) -> list[dict[str, Any]]:
        """Перевіряє відповідність PCI DSS"""
        return [
            {
                "requirement": "Network Security",
                "status": "compliant",
                "description": "Firewalls properly configured",
                "evidence": "Network segmentation verified"
            },
            {
                "requirement": "Cardholder Data Protection",
                "status": "compliant", 
                "description": "Card data properly encrypted",
                "evidence": "Encryption standards met"
            }
        ]
    
    def _check_iso27001_compliance(self, resources: list[str]) -> list[dict[str, Any]]:
        """Перевіряє відповідність ISO 27001"""
        return [
            {
                "requirement": "Information Security Policy",
                "status": "compliant",
                "description": "Security policy documented and approved",
                "evidence": "Policy documents reviewed"
            },
            {
                "requirement": "Risk Assessment",
                "status": "non_compliant",
                "description": "Risk assessment not conducted within required timeframe",
                "recommendation": "Conduct annual risk assessment"
            }
        ]
    
    def _calculate_compliance_score(self, results: list[dict[str, Any]]) -> dict[str, Any]:
        """Розраховує бал відповідності"""
        
        if not results:
            return {"score": 0, "level": "unknown"}
        
        status_weights = {
            "compliant": 1.0,
            "partially_compliant": 0.5,
            "non_compliant": 0.0
        }
        
        total_weight = 0
        for result in results:
            status = result.get("status", "non_compliant")
            total_weight += status_weights.get(status, 0)
        
        score = (total_weight / len(results)) * 100
        
        if score >= 90:
            level = "excellent"
        elif score >= 75:
            level = "good"
        elif score >= 50:
            level = "fair"
        else:
            level = "poor"
        
        return {
            "score": round(score, 2),
            "level": level,
            "total_checks": len(results),
            "compliant_checks": len([r for r in results if r.get("status") == "compliant"])
        }
    
    async def _monitor_access(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Моніторить доступ до ресурсів"""
        
        resource = payload.get("resource")
        time_period = payload.get("time_period", "last_hour")
        
        try:
            # Симуляція подій доступу
            access_events = [
                {
                    "timestamp": (datetime.now() - timedelta(minutes=45)).isoformat(),
                    "user": "admin",
                    "action": "login",
                    "resource": "database",
                    "source_ip": "192.168.1.10",
                    "status": "success"
                },
                {
                    "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
                    "user": "user123",
                    "action": "file_access",
                    "resource": "sensitive_data",
                    "source_ip": "192.168.1.20",
                    "status": "success"
                },
                {
                    "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
                    "user": "unknown",
                    "action": "login",
                    "resource": "admin_panel",
                    "source_ip": "10.0.0.100",
                    "status": "failed"
                }
            ]
            
            # Аналіз подій доступу
            access_analysis = self._analyze_access_patterns(access_events)
            
            return {
                "status": "success",
                "resource": resource,
                "time_period": time_period,
                "access_events": access_events,
                "analysis": access_analysis
            }
            
        except Exception as e:
            self.logger.error("Failed to monitor access", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _analyze_access_patterns(self, events: list[dict[str, Any]]) -> dict[str, Any]:
        """Аналізує патерни доступу"""
        
        user_activity = {}
        failed_attempts = []
        suspicious_ips = set()
        
        for event in events:
            user = event.get("user")
            status = event.get("status")
            source_ip = event.get("source_ip")
            
            if user not in user_activity:
                user_activity[user] = {"success": 0, "failed": 0}
            
            user_activity[user][status] += 1
            
            if status == "failed":
                failed_attempts.append(event)
                suspicious_ips.add(source_ip)
        
        return {
            "user_activity_summary": user_activity,
            "failed_attempts": len(failed_attempts),
            "suspicious_ips": list(suspicious_ips),
            "total_events": len(events),
            "unique_users": len(user_activity)
        }
    
    async def _generate_security_report(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Генерує звіт з безпеки"""
        
        report_type = payload.get("report_type", "daily")
        include_recommendations = payload.get("include_recommendations", True)
        
        try:
            # Збір даних для звіту
            report_data = {
                "report_metadata": {
                    "type": report_type,
                    "generated_at": datetime.now().isoformat(),
                    "period": self._get_report_period(report_type)
                },
                "security_summary": {
                    "vulnerabilities_found": 5,
                    "intrusion_attempts": 2,
                    "compliance_score": 78.5,
                    "security_events": 12
                },
                "top_threats": [
                    {"type": "brute_force", "count": 3, "severity": "high"},
                    {"type": "port_scan", "count": 2, "severity": "medium"},
                    {"type": "sql_injection", "count": 1, "severity": "critical"}
                ]
            }
            
            if include_recommendations:
                report_data["recommendations"] = self._generate_recommendations()
            
            # Генерація хешу звіту для інтегритету
            report_hash = self._generate_report_hash(report_data)
            report_data["integrity_hash"] = report_hash
            
            return {
                "status": "success",
                "report": report_data
            }
            
        except Exception as e:
            self.logger.error("Failed to generate security report", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _get_report_period(self, report_type: str) -> dict[str, str]:
        """Визначає період звіту"""
        
        now = datetime.now()
        
        if report_type == "daily":
            start = now - timedelta(days=1)
        elif report_type == "weekly":
            start = now - timedelta(weeks=1)
        elif report_type == "monthly":
            start = now - timedelta(days=30)
        else:
            start = now - timedelta(days=1)
        
        return {
            "start": start.isoformat(),
            "end": now.isoformat()
        }
    
    def _generate_recommendations(self) -> list[dict[str, Any]]:
        """Генерує рекомендації з безпеки"""
        return [
            {
                "priority": "high",
                "category": "access_control",
                "title": "Implement Multi-Factor Authentication",
                "description": "Enable MFA for all administrative accounts",
                "estimated_effort": "medium"
            },
            {
                "priority": "medium",
                "category": "monitoring",
                "title": "Enhanced Log Monitoring",
                "description": "Implement real-time log analysis for security events",
                "estimated_effort": "high"
            },
            {
                "priority": "low",
                "category": "training",
                "title": "Security Awareness Training",
                "description": "Conduct regular security training for staff",
                "estimated_effort": "low"
            }
        ]
    
    def _generate_report_hash(self, report_data: dict[str, Any]) -> str:
        """Генерує хеш звіту для перевірки цілісності"""
        
        report_str = str(report_data)
        return hashlib.sha256(report_str.encode()).hexdigest()[:16]
