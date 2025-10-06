"""
Агент самовідновлення системи
"""

from __future__ import annotations

import psutil
from datetime import datetime, timedelta
from typing import Any

from .base_agent import BaseAgent


class SelfHealingAgent(BaseAgent):
    """Агент для автоматичного відновлення та самолікування системи"""
    
    def __init__(self, config: dict[str, Any] | None = None):
        super().__init__("SelfHealingAgent", config)
        self.healing_rules = self._load_healing_rules()
        self.recovery_history = []
        
    def capabilities(self) -> list[str]:
        return [
            "monitor_health",
            "detect_failures",
            "execute_recovery",
            "restart_services", 
            "scale_resources",
            "rollback_changes"
        ]
        
    def _load_healing_rules(self) -> dict[str, dict[str, Any]]:
        """Завантажує правила самовідновлення"""
        return {
            "high_cpu": {
                "threshold": 85.0,
                "action": "scale_out",
                "cooldown": 300,  # 5 хвилин
                "max_attempts": 3
            },
            "high_memory": {
                "threshold": 90.0,
                "action": "restart_service",
                "cooldown": 600,  # 10 хвилин
                "max_attempts": 2
            },
            "service_down": {
                "action": "restart_service",
                "cooldown": 60,  # 1 хвилина
                "max_attempts": 5
            },
            "disk_full": {
                "threshold": 95.0,
                "action": "cleanup_logs",
                "cooldown": 1800,  # 30 хвилин
                "max_attempts": 1
            }
        }
        
    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання самовідновлення"""
        
        self.logger.info("Processing self-healing task", task_type=task_type)
        
        if task_type == "monitor_health":
            return await self._monitor_health(payload)
        elif task_type == "detect_failures":
            return await self._detect_failures(payload)
        elif task_type == "execute_recovery":
            return await self._execute_recovery(payload)
        elif task_type == "restart_services":
            return await self._restart_services(payload)
        elif task_type == "scale_resources":
            return await self._scale_resources(payload)
        elif task_type == "rollback_changes":
            return await self._rollback_changes(payload)
        else:
            raise ValueError(f"Unknown task type: {task_type}")
    
    async def _monitor_health(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Моніторить стан системи"""
        
        try:
            # Отримання метрик системи
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Перевірка мережевих з'єднань
            network_stats = psutil.net_io_counters()
            
            # Перевірка процесів
            running_processes = len(psutil.pids())
            
            health_metrics = {
                "timestamp": datetime.now().isoformat(),
                "cpu": {
                    "percent": cpu_percent,
                    "status": "healthy" if cpu_percent < 80 else "warning" if cpu_percent < 95 else "critical"
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "percent": memory.percent,
                    "status": "healthy" if memory.percent < 80 else "warning" if memory.percent < 95 else "critical"
                },
                "disk": {
                    "total": disk.total,
                    "free": disk.free,
                    "percent": (disk.total - disk.free) / disk.total * 100,
                    "status": "healthy" if disk.percent < 85 else "warning" if disk.percent < 95 else "critical"
                },
                "network": {
                    "bytes_sent": network_stats.bytes_sent,
                    "bytes_recv": network_stats.bytes_recv,
                    "status": "healthy"  # Спрощена перевірка
                },
                "processes": {
                    "count": running_processes,
                    "status": "healthy" if running_processes < 500 else "warning"
                }
            }
            
            # Визначення загального статусу
            overall_status = self._determine_overall_health(health_metrics)
            health_metrics["overall_status"] = overall_status
            
            # Перевірка на необхідність втручання
            healing_actions = self._check_healing_triggers(health_metrics)
            
            return {
                "status": "success",
                "health_metrics": health_metrics,
                "healing_actions": healing_actions
            }
            
        except Exception as e:
            self.logger.error("Failed to monitor health", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _determine_overall_health(self, metrics: dict[str, Any]) -> str:
        """Визначає загальний стан системи"""
        
        statuses = [
            metrics["cpu"]["status"],
            metrics["memory"]["status"],
            metrics["disk"]["status"],
            metrics["processes"]["status"]
        ]
        
        if "critical" in statuses:
            return "critical"
        elif "warning" in statuses:
            return "warning"
        else:
            return "healthy"
    
    def _check_healing_triggers(self, metrics: dict[str, Any]) -> list[dict[str, Any]]:
        """Перевіряє чи потрібні дії самовідновлення"""
        
        actions = []
        
        # Перевірка CPU
        if metrics["cpu"]["percent"] > self.healing_rules["high_cpu"]["threshold"]:
            actions.append({
                "trigger": "high_cpu",
                "action": self.healing_rules["high_cpu"]["action"],
                "urgency": "high",
                "current_value": metrics["cpu"]["percent"]
            })
        
        # Перевірка пам'яті
        if metrics["memory"]["percent"] > self.healing_rules["high_memory"]["threshold"]:
            actions.append({
                "trigger": "high_memory",
                "action": self.healing_rules["high_memory"]["action"],
                "urgency": "critical",
                "current_value": metrics["memory"]["percent"]
            })
        
        # Перевірка диска
        if metrics["disk"]["percent"] > self.healing_rules["disk_full"]["threshold"]:
            actions.append({
                "trigger": "disk_full",
                "action": self.healing_rules["disk_full"]["action"],
                "urgency": "high",
                "current_value": metrics["disk"]["percent"]
            })
        
        return actions
    
    async def _detect_failures(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Виявляє відмови сервісів"""
        
        services_to_check = payload.get("services", ["web", "api", "database", "cache"])
        
        try:
            failures = []
            
            for service in services_to_check:
                service_status = await self._check_service_status(service)
                
                if not service_status["is_running"]:
                    failures.append({
                        "service": service,
                        "status": "failed",
                        "last_seen": service_status.get("last_seen"),
                        "failure_reason": service_status.get("error", "Service not responding"),
                        "recovery_action": "restart_service"
                    })
            
            # Перевірка залежностей між сервісами
            dependency_issues = self._check_service_dependencies(services_to_check, failures)
            
            return {
                "status": "success",
                "services_checked": len(services_to_check),
                "failures_detected": len(failures),
                "failures": failures,
                "dependency_issues": dependency_issues
            }
            
        except Exception as e:
            self.logger.error("Failed to detect failures", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _check_service_status(self, service: str) -> dict[str, Any]:
        """Перевіряє стан конкретного сервісу"""
        
        # Симуляція перевірки стану сервісу
        service_configs = {
            "web": {"port": 80, "process_name": "nginx"},
            "api": {"port": 8000, "process_name": "gunicorn"},
            "database": {"port": 5432, "process_name": "postgres"},
            "cache": {"port": 6379, "process_name": "redis"}
        }
        
        config = service_configs.get(service, {})
        
        try:
            # Перевірка процесу (спрощена)
            for proc in psutil.process_iter(['pid', 'name']):
                if config.get("process_name", "").lower() in proc.info['name'].lower():
                    return {
                        "is_running": True,
                        "pid": proc.info['pid'],
                        "status": "healthy"
                    }
            
            # Якщо процес не знайдено
            return {
                "is_running": False,
                "error": f"Process {config.get('process_name')} not found",
                "last_seen": (datetime.now() - timedelta(minutes=5)).isoformat()
            }
            
        except Exception as e:
            return {
                "is_running": False,
                "error": str(e),
                "last_seen": datetime.now().isoformat()
            }
    
    def _check_service_dependencies(self, services: list[str], failures: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Перевіряє залежності між сервісами"""
        
        # Визначення залежностей (спрощена модель)
        dependencies = {
            "web": ["api"],
            "api": ["database", "cache"],
            "database": [],
            "cache": []
        }
        
        dependency_issues = []
        failed_services = {f["service"] for f in failures}
        
        for service in services:
            if service not in failed_services:
                required_deps = dependencies.get(service, [])
                failed_deps = [dep for dep in required_deps if dep in failed_services]
                
                if failed_deps:
                    dependency_issues.append({
                        "service": service,
                        "status": "at_risk",
                        "failed_dependencies": failed_deps,
                        "recommendation": f"Monitor {service} closely due to failed dependencies"
                    })
        
        return dependency_issues
    
    async def _execute_recovery(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує дії відновлення"""
        
        recovery_action = payload.get("action")
        target = payload.get("target")
        parameters = payload.get("parameters", {})
        
        try:
            recovery_id = f"recovery_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            self.logger.info("Executing recovery action", 
                           action=recovery_action, target=target, recovery_id=recovery_id)
            
            result = {}
            
            if recovery_action == "restart_service":
                result = await self._restart_services({"services": [target]})
                
            elif recovery_action == "scale_out":
                result = await self._scale_resources({
                    "resource_type": "compute",
                    "action": "scale_out",
                    "target": target
                })
                
            elif recovery_action == "cleanup_logs":
                result = await self._cleanup_system_logs(parameters)
                
            elif recovery_action == "rollback":
                result = await self._rollback_changes({
                    "target": target,
                    "version": parameters.get("rollback_version")
                })
                
            else:
                raise ValueError(f"Unknown recovery action: {recovery_action}")
            
            # Запис у історію відновлення
            recovery_record = {
                "id": recovery_id,
                "timestamp": datetime.now().isoformat(),
                "action": recovery_action,
                "target": target,
                "parameters": parameters,
                "result": result,
                "success": result.get("status") == "success"
            }
            
            self.recovery_history.append(recovery_record)
            
            return {
                "status": "success",
                "recovery_id": recovery_id,
                "action_result": result,
                "recovery_record": recovery_record
            }
            
        except Exception as e:
            self.logger.error("Failed to execute recovery", error=str(e), action=recovery_action)
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _restart_services(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Перезапускає сервіси"""
        
        services = payload.get("services", [])
        force = payload.get("force", False)
        
        try:
            restart_results = []
            
            for service in services:
                self.logger.info("Restarting service", service=service)
                
                # Симуляція перезапуску сервісу
                # У реальній реалізації тут будуть команди Docker/systemd
                
                restart_result = {
                    "service": service,
                    "action": "restart",
                    "timestamp": datetime.now().isoformat(),
                    "success": True,  # Симуляція успішного перезапуску
                    "message": f"Service {service} restarted successfully"
                }
                
                restart_results.append(restart_result)
            
            successful_restarts = len([r for r in restart_results if r["success"]])
            
            return {
                "status": "success",
                "services_processed": len(services),
                "successful_restarts": successful_restarts,
                "restart_results": restart_results
            }
            
        except Exception as e:
            self.logger.error("Failed to restart services", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def _scale_resources(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Масштабує ресурси системи"""
        
        resource_type = payload.get("resource_type", "compute")
        action = payload.get("action", "scale_out")  # scale_out, scale_in
        target = payload.get("target")
        
        try:
            if resource_type == "compute":
                if action == "scale_out":
                    # Симуляція додавання нових інстансів
                    new_instances = self._add_compute_instances(target)
                    
                    return {
                        "status": "success",
                        "action": "scale_out",
                        "resource_type": "compute",
                        "new_instances": new_instances,
                        "total_instances": len(new_instances) + 2  # Існуючі + нові
                    }
                    
                elif action == "scale_in":
                    # Симуляція видалення інстансів
                    removed_instances = self._remove_compute_instances(target)
                    
                    return {
                        "status": "success",
                        "action": "scale_in", 
                        "resource_type": "compute",
                        "removed_instances": removed_instances,
                        "total_instances": 1  # Залишився мінімум
                    }
            
            elif resource_type == "storage":
                # Симуляція розширення сховища
                expanded_storage = self._expand_storage(target)
                
                return {
                    "status": "success",
                    "action": "expand_storage",
                    "resource_type": "storage",
                    "expanded_capacity": expanded_storage
                }
            
            else:
                raise ValueError(f"Unknown resource type: {resource_type}")
                
        except Exception as e:
            self.logger.error("Failed to scale resources", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _add_compute_instances(self, target: str) -> list[dict[str, Any]]:
        """Додає обчислювальні інстанси"""
        return [
            {
                "instance_id": f"instance_{datetime.now().strftime('%H%M%S')}_1",
                "type": "web-server",
                "status": "starting",
                "created_at": datetime.now().isoformat()
            },
            {
                "instance_id": f"instance_{datetime.now().strftime('%H%M%S')}_2",
                "type": "worker",
                "status": "starting", 
                "created_at": datetime.now().isoformat()
            }
        ]
    
    def _remove_compute_instances(self, target: str) -> list[str]:
        """Видаляє обчислювальні інстанси"""
        return [
            "instance_20240101_120000_1",
            "instance_20240101_120000_2"
        ]
    
    def _expand_storage(self, target: str) -> dict[str, Any]:
        """Розширює сховище"""
        return {
            "volume_id": f"vol_{target}",
            "old_size_gb": 100,
            "new_size_gb": 200,
            "expansion_time": datetime.now().isoformat()
        }
    
    async def _cleanup_system_logs(self, parameters: dict[str, Any]) -> dict[str, Any]:
        """Очищує системні логи"""
        
        try:
            retention_days = parameters.get("retention_days", 7)
            log_types = parameters.get("log_types", ["application", "system", "error"])
            
            # Симуляція очищення логів
            cleaned_logs = []
            total_freed_space = 0
            
            for log_type in log_types:
                cleaned_size = self._simulate_log_cleanup(log_type, retention_days)
                cleaned_logs.append({
                    "log_type": log_type,
                    "files_removed": cleaned_size["files_count"],
                    "space_freed_mb": cleaned_size["size_mb"]
                })
                total_freed_space += cleaned_size["size_mb"]
            
            return {
                "status": "success",
                "retention_days": retention_days,
                "cleaned_logs": cleaned_logs,
                "total_space_freed_mb": total_freed_space
            }
            
        except Exception as e:
            self.logger.error("Failed to cleanup logs", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _simulate_log_cleanup(self, log_type: str, retention_days: int) -> dict[str, Any]:
        """Симулює очищення логів конкретного типу"""
        
        # Симуляція різної кількості логів для різних типів
        cleanup_stats = {
            "application": {"files_count": 50, "size_mb": 150},
            "system": {"files_count": 30, "size_mb": 75},
            "error": {"files_count": 20, "size_mb": 25}
        }
        
        return cleanup_stats.get(log_type, {"files_count": 0, "size_mb": 0})
    
    async def _rollback_changes(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Відкочує зміни до попередньої версії"""
        
        target = payload.get("target")
        rollback_version = payload.get("version", "previous")
        
        try:
            # Симуляція відкату
            rollback_result = {
                "target": target,
                "from_version": "current",
                "to_version": rollback_version,
                "rollback_timestamp": datetime.now().isoformat(),
                "success": True,
                "components_rolled_back": [
                    {"component": "application", "status": "success"},
                    {"component": "configuration", "status": "success"},
                    {"component": "database_schema", "status": "skipped"}
                ]
            }
            
            return {
                "status": "success",
                "rollback_result": rollback_result
            }
            
        except Exception as e:
            self.logger.error("Failed to rollback changes", error=str(e))
            return {
                "status": "error",
                "error": str(e)
            }
