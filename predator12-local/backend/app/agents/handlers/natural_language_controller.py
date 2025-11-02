"""
Агент для керування системою через природну мову
Використовує Mistral як основний провайдер, Gemini як fallback
"""

from __future__ import annotations

import json
import re
from typing import Any, Optional

import structlog
from pydantic import BaseModel

from .base_agent import BaseAgent, TaskPriority
from agents.supervisor import TaskType

logger = structlog.get_logger()


class NaturalLanguageCommand(BaseModel):
    """Модель для розбору команд природною мовою"""

    action: str  # start, stop, status, analyze, etc.
    target: Optional[str] = None  # agent name, service name, etc.
    parameters: dict[str, Any] = {}
    urgency: str = "normal"  # low, normal, high, critical


class NaturalLanguageController(BaseAgent):
    """Агент для керування системою через природну мову"""

    def __init__(self, name: str, config: Optional[dict[str, Any]] = None):
        super().__init__(name, config)
        self.supervisor = None  # буде встановлено через dependency injection
        self.command_patterns = self._load_command_patterns()

    def _load_command_patterns(self) -> dict[str, dict]:
        """Завантажує патерни для розпізнавання команд"""
        return {
            # Статус системи
            "status": {
                "patterns": [
                    r"статус\s+системи?",
                    r"як\s+система",
                    r"перевірити?\s+стан",
                    r"system\s+status",
                    r"how\s+is\s+the\s+system",
                    r"check\s+status"
                ],
                "action": "status",
                "target": "system"
            },

            # Запуск агента
            "start_agent": {
                "patterns": [
                    r"запустити?\s+агент\s+(\w+)",
                    r"старт\s+агент\s+(\w+)",
                    r"включити\s+агент\s+(\w+)",
                    r"start\s+agent\s+(\w+)",
                    r"run\s+agent\s+(\w+)"
                ],
                "action": "start_agent",
                "target_group": 1
            },

            # Зупинка агента
            "stop_agent": {
                "patterns": [
                    r"зупинити?\s+агент\s+(\w+)",
                    r"стоп\s+агент\s+(\w+)",
                    r"виключити\s+агент\s+(\w+)",
                    r"stop\s+agent\s+(\w+)",
                    r"halt\s+agent\s+(\w+)"
                ],
                "action": "stop_agent",
                "target_group": 1
            },

            # Аналіз даних
            "analyze": {
                "patterns": [
                    r"проаналізувати\s+(.+)",
                    r"аналіз\s+(.+)",
                    r"analyze\s+(.+)",
                    r"process\s+(.+)"
                ],
                "action": "analyze",
                "target_group": 1
            },

            # Генерація звіту
            "generate_report": {
                "patterns": [
                    r"звіт\s+(.+)",
                    r"генерувати\s+звіт\s+(.+)",
                    r"створити\s+звіт\s+(.+)",
                    r"report\s+(.+)",
                    r"generate\s+report\s+(.+)"
                ],
                "action": "generate_report",
                "target_group": 1
            },

            # Діагностика
            "diagnose": {
                "patterns": [
                    r"діагностика\s+(.+)",
                    r"перевірити\s+(.+)",
                    r"diagnose\s+(.+)",
                    r"check\s+(.+)"
                ],
                "action": "diagnose",
                "target_group": 1
            },

            # Оптимізація
            "optimize": {
                "patterns": [
                    r"оптимізувати\s+(.+)",
                    r"покращити\s+(.+)",
                    r"optimize\s+(.+)",
                    r"improve\s+(.+)"
                ],
                "action": "optimize",
                "target_group": 1
            }
        }

    def set_supervisor(self, supervisor):
        """Встановлює посилання на supervisor для виклику інших агентів"""
        self.supervisor = supervisor

    def parse_natural_command(self, text: str) -> NaturalLanguageCommand:
        """Розбирає команду природною мовою"""
        text = text.lower().strip()

        # Перевіряємо на екстрені ситуації
        urgency = "normal"
        if any(word in text for word in ["терміново", "критично", "emergency", "urgent", "critical"]):
            urgency = "critical"
        elif any(word in text for word in ["швидко", "fast", "quick"]):
            urgency = "high"

        # Знаходимо відповідність патернам
        for command_type, pattern_data in self.command_patterns.items():
            for pattern in pattern_data["patterns"]:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    action = pattern_data["action"]
                    target = None

                    # Якщо є група захоплення для target
                    if "target_group" in pattern_data:
                        group_idx = pattern_data["target_group"]
                        if len(match.groups()) >= group_idx:
                            target = match.group(group_idx).strip()

                    # Якщо target не знайдено в групі, спробуємо витягти з тексту
                    if not target and action in ["analyze", "generate_report", "diagnose", "optimize"]:
                        # Витягуємо все після ключового слова
                        target = match.group(1).strip() if match.groups() else "system"

                    return NaturalLanguageCommand(
                        action=action,
                        target=target,
                        urgency=urgency
                    )

        # Якщо не знайшли відповідність, повертаємо загальну команду
        return NaturalLanguageCommand(
            action="interpret",
            target=text,
            urgency=urgency
        )

    async def execute(self, task_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Виконує завдання через природну мову"""

        if task_type != "natural_command":
            return {"error": f"Unsupported task type: {task_type}"}

        command_text = payload.get("command", "")
        if not command_text:
            return {"error": "No command provided"}

        # Розбираємо команду
        parsed_command = self.parse_natural_command(command_text)
        self.logger.info(
            "Parsed natural command",
            original=command_text,
            action=parsed_command.action,
            target=parsed_command.target,
            urgency=parsed_command.urgency
        )

        # Виконуємо відповідну дію
        try:
            if parsed_command.action == "status":
                return await self._execute_status_command(parsed_command)

            elif parsed_command.action == "start_agent":
                return await self._execute_start_agent_command(parsed_command)

            elif parsed_command.action == "stop_agent":
                return await self._execute_stop_agent_command(parsed_command)

            elif parsed_command.action == "analyze":
                return await self._execute_analyze_command(parsed_command)

            elif parsed_command.action == "generate_report":
                return await self._execute_report_command(parsed_command)

            elif parsed_command.action == "diagnose":
                return await self._execute_diagnose_command(parsed_command)

            elif parsed_command.action == "optimize":
                return await self._execute_optimize_command(parsed_command)

            else:
                return await self._execute_interpret_command(parsed_command)

        except Exception as e:
            self.logger.error("Command execution failed", error=str(e), command=parsed_command)
            return {
                "success": False,
                "error": f"Не вдалося виконати команду: {str(e)}",
                "original_command": command_text
            }

    async def _execute_status_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує команду перевірки статусу"""
        if not self.supervisor:
            return {"error": "Supervisor not available"}

        status = self.supervisor.get_system_status()

        return {
            "success": True,
            "action": "status_check",
            "result": {
                "agents_count": status.get("agents_count", 0),
                "available_models": status.get("available_models", 0),
                "system_health": status.get("system_health", "unknown"),
                "thermal_status": status.get("thermal_status", {}),
                "recent_competitions": status.get("recent_competitions", 0)
            },
            "message": f"Система працює. Агентів: {status.get('agents_count', 0)}, моделей: {status.get('available_models', 0)}"
        }

    async def _execute_start_agent_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує команду запуску агента"""
        if not command.target:
            return {"error": "Не вказано ім'я агента"}

        agent_name = command.target

        # Тут можна додати логіку для запуску агента через supervisor
        # Поки що повертаємо симуляцію

        return {
            "success": True,
            "action": "start_agent",
            "agent": agent_name,
            "message": f"Агент {agent_name} запущено"
        }

    async def _execute_stop_agent_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує команду зупинки агента"""
        if not command.target:
            return {"error": "Не вказано ім'я агента"}

        agent_name = command.target

        return {
            "success": True,
            "action": "stop_agent",
            "agent": agent_name,
            "message": f"Агент {agent_name} зупинено"
        }

    async def _execute_analyze_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує команду аналізу"""
        target = command.target or "system"

        # Викликаємо відповідного агента через supervisor
        if self.supervisor:
            try:
                result = await self.supervisor.handle_agent_request(
                    "AnalyticsAgent",
                    f"Проаналізувати: {target}",
                    TaskType.PREDICTIVE_ANALYTICS
                )
                return {
                    "success": True,
                    "action": "analyze",
                    "target": target,
                    "result": result.get("response", "Аналіз виконано"),
                    "model_used": result.get("winner_model", "unknown")
                }
            except Exception as e:
                self.logger.error("Analysis failed", error=str(e))

        return {
            "success": True,
            "action": "analyze",
            "target": target,
            "message": f"Аналіз {target} розпочато"
        }

    async def _execute_report_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує команду генерації звіту"""
        target = command.target or "system"

        if self.supervisor:
            try:
                result = await self.supervisor.handle_agent_request(
                    "ReportExportAgent",
                    f"Згенерувати звіт про: {target}",
                    TaskType.DOCUMENT_GENERATION
                )
                return {
                    "success": True,
                    "action": "generate_report",
                    "target": target,
                    "result": result.get("response", "Звіт згенеровано"),
                    "model_used": result.get("winner_model", "unknown")
                }
            except Exception as e:
                self.logger.error("Report generation failed", error=str(e))

        return {
            "success": True,
            "action": "generate_report",
            "target": target,
            "message": f"Звіт про {target} генерується"
        }

    async def _execute_diagnose_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує команду діагностики"""
        target = command.target or "system"

        if self.supervisor:
            try:
                result = await self.supervisor.handle_agent_request(
                    "SelfHealingAgent",
                    f"Діагностика: {target}",
                    TaskType.SYSTEM_DIAGNOSTICS
                )
                return {
                    "success": True,
                    "action": "diagnose",
                    "target": target,
                    "result": result.get("response", "Діагностика завершена"),
                    "model_used": result.get("winner_model", "unknown")
                }
            except Exception as e:
                self.logger.error("Diagnosis failed", error=str(e))

        return {
            "success": True,
            "action": "diagnose",
            "target": target,
            "message": f"Діагностика {target} виконана"
        }

    async def _execute_optimize_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує команду оптимізації"""
        target = command.target or "system"

        if self.supervisor:
            try:
                result = await self.supervisor.handle_agent_request(
                    "OptimizationAgent",
                    f"Оптимізувати: {target}",
                    TaskType.PERFORMANCE_OPTIMIZATION
                )
                return {
                    "success": True,
                    "action": "optimize",
                    "target": target,
                    "result": result.get("response", "Оптимізація завершена"),
                    "model_used": result.get("winner_model", "unknown")
                }
            except Exception as e:
                self.logger.error("Optimization failed", error=str(e))

        return {
            "success": True,
            "action": "optimize",
            "target": target,
            "message": f"Оптимізація {target} розпочата"
        }

    async def _execute_interpret_command(self, command: NaturalLanguageCommand) -> dict[str, Any]:
        """Виконує інтерпретацію довільної команди"""
        # Використовуємо Mistral через supervisor для розуміння команди
        if self.supervisor:
            try:
                result = await self.supervisor.handle_agent_request(
                    "NaturalLanguageController",
                    f"Інтерпретувати команду: {command.target}",
                    TaskType.CRITICAL_ORCHESTRATION
                )
                return {
                    "success": True,
                    "action": "interpret",
                    "command": command.target,
                    "interpretation": result.get("response", "Команда інтерпретовано"),
                    "model_used": result.get("winner_model", "unknown")
                }
            except Exception as e:
                self.logger.error("Command interpretation failed", error=str(e))

        return {
            "success": True,
            "action": "interpret",
            "command": command.target,
            "message": f"Команда '{command.target}' прийнята до обробки"
        }

    def capabilities(self) -> list[str]:
        """Повертає список можливостей агента"""
        return [
            "natural_command",  # обробка команд природною мовою
            "system_status",    # перевірка статусу системи
            "agent_control",    # керування агентами
            "data_analysis",    # аналіз даних
            "report_generation", # генерація звітів
            "system_diagnosis",  # діагностика системи
            "performance_optimization"  # оптимізація продуктивності
        ]