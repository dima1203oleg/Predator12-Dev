#!/usr/bin/env python3
"""
🔍 Predator11 Components Usage Analysis
Аналіз використання всіх компонентів проекту та виявлення невикористаних файлів
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Set


def analyze_project_structure() -> Dict[str, Any]:
    """Аналіз структури проекту"""

    base_path = Path(__file__).parent.parent

    # Компоненти які повинні бути задіяні
    expected_components = {
        "agents": {
            "chief": ["chief_orchestrator.py", "Dockerfile", "requirements.txt"],
            "model-router": ["model_router.py", "Dockerfile", "requirements.txt"],
            "ingest": ["ingest_agent.py", "Dockerfile", "requirements.txt"],
            "anomaly": ["anomaly_agent.py", "Dockerfile", "requirements.txt"],
            "synthetic": ["synthetic_agent.py", "Dockerfile", "requirements.txt"],
            "data-quality": ["quality_agent.py", "Dockerfile", "requirements.txt"],
            "security-privacy": ["security_privacy_agent.py", "Dockerfile", "requirements.txt"],
            "self-healing": ["self_healing_agent.py", "Dockerfile", "requirements.txt"],
        },
        "backend": {
            "core_files": ["Dockerfile", "requirements.txt"],
            "app": ["main.py", "config.py", "celery_app.py"],
            "legacy_agents": ["agents"],
        },
        "frontend": {
            "core_files": ["Dockerfile", "package.json"],
            "src": ["App.tsx", "main.tsx"],
            "public": ["index.html"],
        },
        "infrastructure": {
            "docker-compose.yml": True,
            "prometheus": ["prometheus.yml"],
            "grafana": ["provisioning", "dashboards"],
            "opensearch": ["mappings", "dashboards"],
            "observability": ["alertmanager", "prometheus", "grafana"],
            "infra": ["terraform", "k8s", "helm"],
        },
        "etl": {
            "core_files": ["Dockerfile", "requirements.txt"],
            "dags": ["predator_etl_dag.py"],
            "parsing": ["pandas-pipelines"],
            "transforms": ["transforms"],
        },
    }

    # Перевіряємо наявність та використання компонентів
    analysis_results = {
        "existing_components": {},
        "missing_components": {},
        "unused_components": {},
        "docker_services": {},
        "recommendations": [],
    }

    # Аналіз docker-compose.yml
    docker_compose_path = base_path / "docker-compose.yml"
    docker_services: Set[str] = set()

    if docker_compose_path.exists():
        try:
            import yaml  # type: ignore

            compose_data = yaml.safe_load(docker_compose_path.read_text())
            services_section = (
                compose_data.get("services", {}) if isinstance(compose_data, dict) else {}
            )
            if isinstance(services_section, dict):
                docker_services = set(services_section.keys())
                analysis_results["docker_services"] = sorted(docker_services)
            else:
                analysis_results["docker_services"] = []
        except Exception as e:
            # Fallback на простий текстовий парсинг, якщо PyYAML недоступний
            try:
                with open(docker_compose_path, "r", encoding="utf-8") as f:
                    inside_services = False
                    for raw_line in f:
                        line = raw_line.rstrip()
                        if line.strip().startswith("#"):
                            continue
                        if line.startswith("services:"):
                            inside_services = True
                            continue
                        if inside_services:
                            if line and not line.startswith(" "):
                                # Вийшли з блоку services
                                break
                            striped = line.strip()
                            if striped.endswith(":") and not striped.startswith("-"):
                                docker_services.add(striped.rstrip(":"))
                analysis_results["docker_services"] = sorted(docker_services)
            except Exception as fallback_error:
                analysis_results["docker_services"] = (
                    f"Error reading docker-compose.yml: {fallback_error or e}"
                )

    # Перевіряємо agents
    agents_path = base_path / "agents"
    if agents_path.exists():
        for agent_name, required_files in expected_components["agents"].items():
            agent_path = agents_path / agent_name
            component_key = f"agents/{agent_name}"
            analysis_results["existing_components"][component_key] = {
                "exists": agent_path.exists(),
                "files": [],
            }

            if agent_path.exists():
                existing_files = sorted(f.name for f in agent_path.iterdir() if f.is_file())
                analysis_results["existing_components"][component_key]["files"] = existing_files

                missing_files = [req for req in required_files if req not in existing_files]
                if not any(name.endswith("_agent.py") for name in existing_files):
                    missing_files.append("*.py (agent entry point)")
                if missing_files:
                    analysis_results["missing_components"][component_key] = missing_files
            else:
                analysis_results["missing_components"][component_key] = "Directory missing"

    # Перевіряємо backend/agents (legacy)
    backend_agents_path = base_path / "backend" / "agents"
    if backend_agents_path.exists():
        legacy_agents = [d.name for d in backend_agents_path.iterdir() if d.is_dir()]
        analysis_results["unused_components"]["backend/agents"] = {
            "legacy_agents": legacy_agents,
            "status": "Should be replaced by new agents structure",
        }

    # Перевіряємо основні компоненти
    main_components = {
        "backend": base_path / "backend",
        "frontend": base_path / "frontend",
        "etl": base_path / "etl",
        "prometheus": base_path / "prometheus",
        "grafana": base_path / "grafana",
        "opensearch": base_path / "opensearch",
        "observability": base_path / "observability",
        "infra": base_path / "infra",
    }

    for comp_name, comp_path in main_components.items():
        analysis_results["existing_components"][comp_name] = {
            "exists": comp_path.exists(),
            "size_mb": get_dir_size(comp_path) if comp_path.exists() else 0,
        }

    # Виявлення потенційних дубльованих конфігів
    duplicate_candidates = {
        "alertmanager.yml": [
            base_path / "prometheus/alertmanager.yml",
            base_path / "observability/alertmanager/alertmanager.yml",
        ],
        "prometheus.yml": [
            base_path / "prometheus/prometheus.yml",
            base_path / "observability/prometheus/prometheus.yml",
        ],
    }

    duplicates: Dict[str, List[str]] = {}
    for name, paths in duplicate_candidates.items():
        existing_paths = [str(path.relative_to(base_path)) for path in paths if path.exists()]
        if len(existing_paths) > 1:
            duplicates[name] = existing_paths

    if duplicates:
        analysis_results["duplicate_configs"] = duplicates

    # Генерація рекомендацій
    recommendations = []

    # Рекомендації щодо legacy agents
    if "backend/agents" in analysis_results["unused_components"]:
        recommendations.append(
            {
                "type": "cleanup",
                "priority": "high",
                "action": "Remove legacy backend/agents directory",
                "reason": "Replaced by new agents structure in ./agents/",
                "command": "rm -rf backend/agents/",
            }
        )

    # Рекомендації щодо відсутніх компонентів
    for comp_name, missing in analysis_results["missing_components"].items():
        if isinstance(missing, list):
            recommendations.append(
                {
                    "type": "missing",
                    "priority": "medium",
                    "action": f"Create missing files in {comp_name}",
                    "reason": f'Missing required files: {", ".join(missing)}',
                    "files": missing,
                }
            )

    # Рекомендації щодо Docker сервісів
    new_agent_services = {
        "chief-orchestrator",
        "model-router",
        "ingest-agent",
        "anomaly-agent",
        "synthetic-agent",
        "data-quality-agent",
        "security-privacy-agent",
        "self-healing-agent",
    }

    missing_services = new_agent_services - docker_services
    if missing_services:
        recommendations.append(
            {
                "type": "docker",
                "priority": "high",
                "action": "Add missing agent services to docker-compose.yml",
                "reason": "New agent services not defined in docker-compose",
                "services": list(missing_services),
            }
        )

    if duplicates:
        for name, locations in duplicates.items():
            recommendations.append(
                {
                    "type": "cleanup",
                    "priority": "medium",
                    "action": f"Consolidate duplicated {name} configurations",
                    "reason": f'Duplicate configurations found in: {", ".join(locations)}',
                    "files": locations,
                }
            )

    analysis_results["recommendations"] = recommendations

    return analysis_results


def get_dir_size(path: Path) -> float:
    """Обчислення розміру директорії в MB"""
    try:
        total_size = 0
        for f in path.rglob("*"):
            if f.is_file():
                total_size += f.stat().st_size
        return round(total_size / 1024 / 1024, 2)
    except:
        return 0


def print_analysis_report(analysis: Dict[str, Any]):
    """Виведення звіту аналізу"""

    print("🔍 PREDATOR11 COMPONENTS ANALYSIS REPORT")
    print("═" * 60)

    # Існуючі компоненти
    print("\n📋 EXISTING COMPONENTS:")
    print("-" * 30)
    for comp_name, info in analysis["existing_components"].items():
        status = "✅" if info["exists"] else "❌"
        size_info = f" ({info.get('size_mb', 0)} MB)" if "size_mb" in info else ""
        print(f"  {status} {comp_name}{size_info}")

        if "files" in info and info["files"]:
            print(f"      Files: {', '.join(info['files'][:5])}")
            if len(info["files"]) > 5:
                print(f"      ... and {len(info['files']) - 5} more")

    # Відсутні компоненти
    if analysis["missing_components"]:
        print(f"\n❌ MISSING COMPONENTS ({len(analysis['missing_components'])}):")
        print("-" * 30)
        for comp_name, missing in analysis["missing_components"].items():
            print(f"  🔸 {comp_name}: {missing}")

    # Невикористані компоненти
    if analysis["unused_components"]:
        print(f"\n🗑️ UNUSED COMPONENTS ({len(analysis['unused_components'])}):")
        print("-" * 30)
        for comp_name, info in analysis["unused_components"].items():
            print(f"  🔸 {comp_name}: {info}")

    # Docker сервіси
    print(f"\n🐳 DOCKER SERVICES ({len(analysis['docker_services'])}):")
    print("-" * 30)
    if isinstance(analysis["docker_services"], list):
        for service in sorted(analysis["docker_services"]):
            print(f"  🔹 {service}")
    else:
        print(f"  ❌ {analysis['docker_services']}")

    duplicate_configs = analysis.get("duplicate_configs", {})
    if duplicate_configs:
        print(f"\n⚠️ DUPLICATE CONFIGURATIONS ({len(duplicate_configs)}):")
        print("-" * 30)
        for name, locations in duplicate_configs.items():
            print(f"  🔸 {name}: {', '.join(locations)}")

    # Рекомендації
    if analysis["recommendations"]:
        print(f"\n💡 RECOMMENDATIONS ({len(analysis['recommendations'])}):")
        print("-" * 30)
        for i, rec in enumerate(analysis["recommendations"], 1):
            priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}
            icon = priority_icon.get(rec["priority"], "🔵")

            print(f"  {i}. {icon} [{rec['type'].upper()}] {rec['action']}")
            print(f"      Reason: {rec['reason']}")

            if "command" in rec:
                print(f"      Command: {rec['command']}")
            if "files" in rec:
                print(f"      Files: {', '.join(rec['files'])}")
            if "services" in rec:
                print(f"      Services: {', '.join(rec['services'])}")
            print()

    # Підсумок
    total_existing = len([c for c in analysis["existing_components"].values() if c["exists"]])
    total_missing = len(analysis["missing_components"])
    total_unused = len(analysis["unused_components"])

    print("📊 SUMMARY:")
    print("-" * 30)
    print(f"  ✅ Existing components: {total_existing}")
    print(f"  ❌ Missing components:  {total_missing}")
    print(f"  🗑️ Unused components:   {total_unused}")
    print(f"  💡 Recommendations:     {len(analysis['recommendations'])}")

    # Оцінка готовності
    if total_missing == 0 and total_unused == 0:
        print(f"\n🎉 PROJECT STATUS: READY FOR PRODUCTION!")
    elif total_missing <= 2 and total_unused <= 1:
        print(f"\n⚡ PROJECT STATUS: ALMOST READY (minor cleanup needed)")
    else:
        print(f"\n🔧 PROJECT STATUS: NEEDS ATTENTION (see recommendations)")


def main():
    """Головна функція"""
    try:
        print("Starting Predator11 components analysis...")
        analysis = analyze_project_structure()
        print_analysis_report(analysis)

        # Збереження результату в JSON
        output_file = Path(__file__).parent.parent / "components_analysis.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False, default=str)

        print(f"\n📄 Detailed results saved to: {output_file}")

    except Exception as e:
        print(f"❌ Error during analysis: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
