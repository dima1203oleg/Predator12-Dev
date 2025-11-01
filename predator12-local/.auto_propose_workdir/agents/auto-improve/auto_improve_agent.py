#!/usr/bin/env python3
"""
AutoImproveAgent - Агент самовдосконалення коду платформи
Аналізує кодову базу та пропонує покращення згідно з технічним завданням
"""

import ast
import asyncio
import json
import logging
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

import aiofiles
import aiohttp

logger = logging.getLogger(__name__)


@dataclass
class CodeIssue:
    file_path: str
    line_number: int
    issue_type: str
    severity: str
    description: str
    suggestion: str
    confidence: float


@dataclass
class CodeImprovement:
    file_path: str
    original_code: str
    improved_code: str
    description: str
    impact_score: float


class AutoImproveAgent:
    """
    Агент самовдосконалення коду згідно з технічним завданням
    """

    def __init__(self):
        self.project_root = Path("/app")
        self.repo = None
        self.analysis_results = []
        self.improvements_made = []
        self.code_quality_metrics = {}

        # LLM для аналізу коду (через Model SDK)
        self.model_sdk_url = "http://modelsdk:3010/v1"

        # Налаштування аналізу
        self.file_patterns = [
            "**/*.py",
            "**/*.js",
            "**/*.ts",
            "**/*.jsx",
            "**/*.tsx",
            "**/*.yaml",
            "**/*.yml",
            "**/*.json",
            "**/*.md",
        ]

        self.exclude_patterns = [
            "**/node_modules/**",
            "**/.git/**",
            "**/venv/**",
            "**/__pycache__/**",
            "**/dist/**",
            "**/build/**",
        ]

    async def initialize(self):
        """Ініціалізує агент самовдосконалення"""
        logger.info("🚀 Initializing AutoImprove Agent...")

        try:
            import git

            self.repo = git.Repo(self.project_root)
            logger.info(f"✅ Git repository initialized: {self.repo.working_dir}")
        except (ImportError, git.InvalidGitRepositoryError):
            logger.warning(
                "⚠️ Git not available or not a git repository, some features will be limited"
            )
            self.repo = None

        await self.analyze_current_codebase()

    async def start_continuous_improvement(self):
        """Запускає режим постійного самовдосконалення"""
        logger.info("🔄 Starting continuous code improvement...")

        while True:
            try:
                # Аналізуємо поточний стан коду
                await self.analyze_current_codebase()

                # Шукаємо можливості для покращень
                improvements = await self.identify_improvements()

                # Застосовуємо покращення з високою довірою
                if improvements:
                    await self.apply_safe_improvements(improvements)

                # Генерируємо звіт
                await self.generate_improvement_report()

                # Чекаємо годину перед наступним циклом
                await asyncio.sleep(3600)

            except Exception as e:
                logger.error(f"Error in improvement cycle: {e}")
                await asyncio.sleep(300)  # 5 хвилин при помилці

    async def analyze_current_codebase(self):
        """Аналізує поточну кодову базу"""
        logger.info("📊 Analyzing current codebase...")

        self.analysis_results.clear()

        # Знаходимо всі файли для аналізу
        files_to_analyze = await self.find_files_to_analyze()

        # Аналізуємо кожен файл
        analysis_tasks = []
        for file_path in files_to_analyze[:50]:  # Обмежуємо кількість файлів
            task = asyncio.create_task(self.analyze_file(file_path))
            analysis_tasks.append(task)

        await asyncio.gather(*analysis_tasks, return_exceptions=True)

        # Обчислюємо метрики якості коду
        await self.calculate_code_quality_metrics()

        logger.info(
            f"✅ Analyzed {len(files_to_analyze)} files, found {len(self.analysis_results)} issues"
        )

    async def find_files_to_analyze(self) -> List[Path]:
        """Знаходить файли для аналізу"""
        files = []

        for pattern in self.file_patterns:
            for file_path in self.project_root.rglob(pattern):
                if file_path.is_file():
                    # Перевіряємо чи файл не в exclude patterns
                    relative_path = file_path.relative_to(self.project_root)
                    if not any(relative_path.match(exclude) for exclude in self.exclude_patterns):
                        files.append(file_path)

        return files

    async def analyze_file(self, file_path: Path):
        """Аналізує окремий файл"""
        try:
            async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                content = await f.read()

            file_extension = file_path.suffix.lower()

            if file_extension == ".py":
                await self.analyze_python_file(file_path, content)
            elif file_extension in [".js", ".ts", ".jsx", ".tsx"]:
                await self.analyze_javascript_file(file_path, content)
            elif file_extension in [".yaml", ".yml"]:
                await self.analyze_yaml_file(file_path, content)
            elif file_extension == ".json":
                await self.analyze_json_file(file_path, content)

        except Exception as e:
            logger.error(f"Failed to analyze {file_path}: {e}")

    async def analyze_python_file(self, file_path: Path, content: str):
        """Аналізує Python файл"""
        issues = []

        try:
            # Парсимо AST для статичного аналізу
            tree = ast.parse(content)

            # Перевіряємо складність функцій
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    complexity = self.calculate_cyclomatic_complexity(node)
                    if complexity > 10:
                        issues.append(
                            CodeIssue(
                                file_path=str(file_path),
                                line_number=node.lineno,
                                issue_type="high_complexity",
                                severity="warning",
                                description=f"Function {node.name} has high complexity ({complexity})",
                                suggestion="Consider breaking this function into smaller functions",
                                confidence=0.8,
                            )
                        )

                # Перевіряємо довгі функції
                if isinstance(node, ast.FunctionDef):
                    if hasattr(node, "end_lineno") and node.end_lineno:
                        lines = node.end_lineno - node.lineno
                        if lines > 50:
                            issues.append(
                                CodeIssue(
                                    file_path=str(file_path),
                                    line_number=node.lineno,
                                    issue_type="long_function",
                                    severity="info",
                                    description=f"Function {node.name} is {lines} lines long",
                                    suggestion="Consider refactoring into smaller functions",
                                    confidence=0.7,
                                )
                            )

            # Перевіряємо docstrings
            await self.check_docstrings(file_path, tree, content, issues)

            # Перевіряємо стиль коду
            await self.check_python_style(file_path, content, issues)

        except SyntaxError as e:
            issues.append(
                CodeIssue(
                    file_path=str(file_path),
                    line_number=e.lineno or 1,
                    issue_type="syntax_error",
                    severity="error",
                    description=f"Syntax error: {e.msg}",
                    suggestion="Fix the syntax error",
                    confidence=1.0,
                )
            )

        self.analysis_results.extend(issues)

    def calculate_cyclomatic_complexity(self, node: ast.FunctionDef) -> int:
        """Обчислює цикломатичну складність функції"""
        complexity = 1  # Базова складність

        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.AsyncFor)):
                complexity += 1
            elif isinstance(child, ast.ExceptHandler):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1

        return complexity

    async def check_docstrings(
        self, file_path: Path, tree: ast.AST, content: str, issues: List[CodeIssue]
    ):
        """Перевіряє наявність docstrings"""
        lines = content.split("\n")

        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                docstring = ast.get_docstring(node)
                if not docstring and not node.name.startswith("_"):
                    issues.append(
                        CodeIssue(
                            file_path=str(file_path),
                            line_number=node.lineno,
                            issue_type="missing_docstring",
                            severity="info",
                            description=f"{type(node).__name__} {node.name} missing docstring",
                            suggestion="Add a descriptive docstring",
                            confidence=0.9,
                        )
                    )

    async def check_python_style(self, file_path: Path, content: str, issues: List[CodeIssue]):
        """Перевіряє стиль Python коду"""
        lines = content.split("\n")

        for i, line in enumerate(lines, 1):
            # Перевіряємо довжину рядка
            if len(line) > 120:
                issues.append(
                    CodeIssue(
                        file_path=str(file_path),
                        line_number=i,
                        issue_type="long_line",
                        severity="info",
                        description=f"Line too long ({len(line)} characters)",
                        suggestion="Split long line or use line continuation",
                        confidence=0.8,
                    )
                )

            # Перевіряємо trailing whitespace
            if line.rstrip() != line:
                issues.append(
                    CodeIssue(
                        file_path=str(file_path),
                        line_number=i,
                        issue_type="trailing_whitespace",
                        severity="info",
                        description="Trailing whitespace",
                        suggestion="Remove trailing whitespace",
                        confidence=1.0,
                    )
                )

    async def analyze_javascript_file(self, file_path: Path, content: str):
        """Аналізує JavaScript/TypeScript файл"""
        issues = []
        lines = content.split("\n")

        for i, line in enumerate(lines, 1):
            # Перевіряємо console.log (не повинно бути в продакшені)
            if "console.log" in line and not line.strip().startswith("//"):
                issues.append(
                    CodeIssue(
                        file_path=str(file_path),
                        line_number=i,
                        issue_type="console_log",
                        severity="warning",
                        description="Console.log statement found",
                        suggestion="Remove console.log or use proper logging",
                        confidence=0.9,
                    )
                )

            # Перевіряємо var (краще використовувати let/const)
            if line.strip().startswith("var "):
                issues.append(
                    CodeIssue(
                        file_path=str(file_path),
                        line_number=i,
                        issue_type="var_usage",
                        severity="info",
                        description="Using 'var' instead of 'let' or 'const'",
                        suggestion="Use 'let' or 'const' instead of 'var'",
                        confidence=0.8,
                    )
                )

        self.analysis_results.extend(issues)

    async def analyze_yaml_file(self, file_path: Path, content: str):
        """Аналізує YAML файл"""
        issues = []

        try:
            import yaml

            yaml.safe_load(content)
        except yaml.YAMLError as e:
            issues.append(
                CodeIssue(
                    file_path=str(file_path),
                    line_number=getattr(e, "problem_mark", {}).get("line", 1) + 1,
                    issue_type="yaml_error",
                    severity="error",
                    description=f"YAML parsing error: {e}",
                    suggestion="Fix YAML syntax",
                    confidence=1.0,
                )
            )

        self.analysis_results.extend(issues)

    async def analyze_json_file(self, file_path: Path, content: str):
        """Аналізує JSON файл"""
        issues = []

        try:
            json.loads(content)
        except json.JSONDecodeError as e:
            issues.append(
                CodeIssue(
                    file_path=str(file_path),
                    line_number=e.lineno,
                    issue_type="json_error",
                    severity="error",
                    description=f"JSON parsing error: {e.msg}",
                    suggestion="Fix JSON syntax",
                    confidence=1.0,
                )
            )

        self.analysis_results.extend(issues)

    async def identify_improvements(self) -> List[CodeImprovement]:
        """Ідентифікує можливості для покращень"""
        improvements = []

        # Групуємо проблеми за файлами
        issues_by_file = {}
        for issue in self.analysis_results:
            if issue.file_path not in issues_by_file:
                issues_by_file[issue.file_path] = []
            issues_by_file[issue.file_path].append(issue)

        # Генерируємо покращення для кожного файлу
        for file_path, issues in issues_by_file.items():
            file_improvements = await self.generate_file_improvements(file_path, issues)
            improvements.extend(file_improvements)

        return improvements

    async def generate_file_improvements(
        self, file_path: str, issues: List[CodeIssue]
    ) -> List[CodeImprovement]:
        """Генерує покращення для файлу"""
        improvements = []

        try:
            # Читаємо файл
            async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
                content = await f.read()

            # Генерируємо покращення за допомогою LLM
            llm_improvements = await self.generate_llm_improvements(file_path, content, issues)
            improvements.extend(llm_improvements)

            # Автоматичні покращення (високий рівень довіри)
            auto_improvements = await self.generate_automatic_improvements(
                file_path, content, issues
            )
            improvements.extend(auto_improvements)

        except Exception as e:
            logger.error(f"Failed to generate improvements for {file_path}: {e}")

        return improvements

    async def generate_llm_improvements(
        self, file_path: str, content: str, issues: List[CodeIssue]
    ) -> List[CodeImprovement]:
        """Генерує покращення за допомогою LLM"""
        improvements = []

        try:
            # Формуємо промпт для LLM
            issues_description = "\n".join(
                [
                    f"Line {issue.line_number}: {issue.description} ({issue.issue_type})"
                    for issue in issues[:10]  # Обмежуємо кількість проблем
                ]
            )

            prompt = f"""
Analyze the following code and suggest improvements:

File: {file_path}
Issues found:
{issues_description}

Code:
```
{content[:2000]}  # Обмежуємо розмір коду
```

Please suggest specific code improvements that address these issues.
Focus on: code quality, performance, maintainability, and best practices.
Provide the improved code sections.
"""

            # Викликаємо LLM через Model SDK
            async with aiohttp.ClientSession() as session:
                response = await session.post(
                    f"{self.model_sdk_url}/chat/completions",
                    json={
                        "model": "microsoft/phi-4-reasoning",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 1000,
                        "temperature": 0.3,
                    },
                )

                if response.status == 200:
                    result = await response.json()
                    suggestion = result["choices"][0]["message"]["content"]

                    # Парсимо відповідь LLM та створюємо покращення
                    improvement = CodeImprovement(
                        file_path=file_path,
                        original_code=content[:500],  # Фрагмент оригінального коду
                        improved_code=suggestion[:500],  # Фрагмент покращеного коду
                        description="LLM-generated code improvements",
                        impact_score=0.6,  # Помірна довіра до LLM пропозицій
                    )
                    improvements.append(improvement)

        except Exception as e:
            logger.error(f"Failed to generate LLM improvements: {e}")

        return improvements

    async def generate_automatic_improvements(
        self, file_path: str, content: str, issues: List[CodeIssue]
    ) -> List[CodeImprovement]:
        """Генерує автоматичні покращення з високою довірою"""
        improvements = []

        lines = content.split("\n")
        modified_lines = lines.copy()
        changes_made = False

        for issue in issues:
            if issue.confidence >= 0.9:  # Тільки високодовірені покращення
                line_idx = issue.line_number - 1

                if 0 <= line_idx < len(modified_lines):
                    original_line = modified_lines[line_idx]

                    if issue.issue_type == "trailing_whitespace":
                        modified_lines[line_idx] = original_line.rstrip()
                        changes_made = True

                    elif issue.issue_type == "console_log" and "console.log" in original_line:
                        # Коментуємо console.log замість видалення
                        modified_lines[line_idx] = "// " + original_line
                        changes_made = True

        if changes_made:
            improved_content = "\n".join(modified_lines)
            improvement = CodeImprovement(
                file_path=file_path,
                original_code=content,
                improved_code=improved_content,
                description="Automatic code style improvements",
                impact_score=0.9,  # Висока довіра до автоматичних покращень
            )
            improvements.append(improvement)

        return improvements

    async def apply_safe_improvements(self, improvements: List[CodeImprovement]):
        """Застосовує безпечні покращення з високим рівнем довіри"""
        applied_count = 0

        for improvement in improvements:
            if improvement.impact_score >= 0.8:  # Тільки високодовірені покращення
                try:
                    await self.apply_improvement(improvement)
                    applied_count += 1

                    self.improvements_made.append(
                        {
                            "timestamp": datetime.now().isoformat(),
                            "file": improvement.file_path,
                            "description": improvement.description,
                            "impact_score": improvement.impact_score,
                        }
                    )

                except Exception as e:
                    logger.error(f"Failed to apply improvement to {improvement.file_path}: {e}")

        if applied_count > 0:
            logger.info(f"✅ Applied {applied_count} code improvements")

            # Створюємо commit якщо є git repo
            if self.repo:
                await self.create_improvement_commit(applied_count)

    async def apply_improvement(self, improvement: CodeImprovement):
        """Застосовує конкретне покращення"""
        # Створюємо бекап оригінального файлу
        backup_path = Path(improvement.file_path + ".bak")

        try:
            # Бекапимо оригінальний файл
            async with aiofiles.open(improvement.file_path, "r", encoding="utf-8") as f:
                original_content = await f.read()

            async with aiofiles.open(backup_path, "w", encoding="utf-8") as f:
                await f.write(original_content)

            # Записуємо покращений код
            async with aiofiles.open(improvement.file_path, "w", encoding="utf-8") as f:
                await f.write(improvement.improved_code)

            logger.info(f"📝 Applied improvement to {improvement.file_path}")

        except Exception as e:
            # Відновлюємо з бекапу при помилці
            if backup_path.exists():
                async with aiofiles.open(backup_path, "r", encoding="utf-8") as f:
                    original_content = await f.read()

                async with aiofiles.open(improvement.file_path, "w", encoding="utf-8") as f:
                    await f.write(original_content)

            raise e
        finally:
            # Видаляємо бекап
            if backup_path.exists():
                backup_path.unlink()

    async def create_improvement_commit(self, changes_count: int):
        """Створює commit з покращеннями"""
        try:
            # Додаємо всі змінені файли
            self.repo.git.add(".")

            # Створюємо commit
            commit_message = (
                f"🤖 AutoImprove: Applied {changes_count} code improvements\n\n"
                f"- Automated code style fixes\n"
                f"- Performance optimizations\n"
                f"- Best practices implementation\n\n"
                f"Generated by AutoImproveAgent at {datetime.now().isoformat()}"
            )

            self.repo.index.commit(commit_message)
            logger.info(f"📝 Created improvement commit: {changes_count} changes")

        except Exception as e:
            logger.error(f"Failed to create improvement commit: {e}")

    async def calculate_code_quality_metrics(self):
        """Обчислює метрики якості коду"""
        total_issues = len(self.analysis_results)
        error_issues = sum(1 for issue in self.analysis_results if issue.severity == "error")
        warning_issues = sum(1 for issue in self.analysis_results if issue.severity == "warning")

        # Розраховуємо загальний score якості
        files_analyzed = len(set(issue.file_path for issue in self.analysis_results))
        if files_analyzed > 0:
            quality_score = max(0, 100 - (error_issues * 10 + warning_issues * 5) / files_analyzed)
        else:
            quality_score = 100

        self.code_quality_metrics = {
            "timestamp": datetime.now().isoformat(),
            "total_issues": total_issues,
            "error_issues": error_issues,
            "warning_issues": warning_issues,
            "info_issues": total_issues - error_issues - warning_issues,
            "files_analyzed": files_analyzed,
            "quality_score": round(quality_score, 2),
            "improvements_made_total": len(self.improvements_made),
        }

        logger.info(f"📊 Code quality score: {quality_score:.1f}/100")

    async def generate_improvement_report(self) -> Dict[str, Any]:
        """Генерує звіт про покращення"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "code_quality_metrics": self.code_quality_metrics,
            "recent_improvements": self.improvements_made[-10:],  # Останні 10 покращень
            "top_issues": sorted(self.analysis_results, key=lambda x: x.confidence, reverse=True)[
                :20
            ],  # Топ 20 проблем
            "improvement_suggestions": await self.generate_improvement_suggestions(),
        }

        # Зберігаємо звіт
        report_path = (
            self.project_root
            / "reports"
            / f"code_improvement_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        report_path.parent.mkdir(exist_ok=True)

        async with aiofiles.open(report_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(report, indent=2, default=str))

        logger.info(f"📋 Generated improvement report: {report_path}")
        return report

    async def generate_improvement_suggestions(self) -> List[Dict[str, Any]]:
        """Генерує пропозиції для покращення"""
        suggestions = []

        # Аналізуємо найбільш поширені проблеми
        issue_types = {}
        for issue in self.analysis_results:
            issue_types[issue.issue_type] = issue_types.get(issue.issue_type, 0) + 1

        # Топ проблем з пропозиціями
        top_issues = sorted(issue_types.items(), key=lambda x: x[1], reverse=True)[:5]

        for issue_type, count in top_issues:
            suggestions.append(
                {
                    "issue_type": issue_type,
                    "occurrences": count,
                    "priority": "high" if count > 10 else "medium" if count > 5 else "low",
                    "suggestion": await self.get_improvement_suggestion(issue_type),
                }
            )

        return suggestions

    async def get_improvement_suggestion(self, issue_type: str) -> str:
        """Повертає пропозицію для типу проблеми"""
        suggestions = {
            "missing_docstring": "Add comprehensive docstrings to improve code documentation",
            "high_complexity": "Refactor complex functions into smaller, more manageable pieces",
            "long_function": "Break down long functions following Single Responsibility Principle",
            "trailing_whitespace": "Set up automatic trailing whitespace removal in your editor",
            "console_log": "Replace console.log with proper logging framework",
            "var_usage": "Use let/const instead of var for better scoping",
            "long_line": "Configure line length limits and use appropriate formatting",
        }

        return suggestions.get(issue_type, "Review and address this code issue")

    async def get_status(self) -> Dict[str, Any]:
        """Повертає поточний статус агента"""
        return {
            "timestamp": datetime.now().isoformat(),
            "code_quality_metrics": self.code_quality_metrics,
            "total_issues_found": len(self.analysis_results),
            "improvements_made": len(self.improvements_made),
            "last_analysis": self.code_quality_metrics.get("timestamp"),
            "status": "active",
        }


# Глобальний екземпляр агента
auto_improve_agent = AutoImproveAgent()


async def main():
    """Основна функція для запуску агента"""
    logger.info("🚀 Starting Predator Analytics AutoImprove Agent...")

    try:
        await auto_improve_agent.initialize()
        await auto_improve_agent.start_continuous_improvement()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    except Exception as e:
        logger.error(f"Error in AutoImprove Agent: {e}")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    asyncio.run(main())
