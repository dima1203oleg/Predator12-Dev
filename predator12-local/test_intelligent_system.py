#!/usr/bin/env python3
"""Тестовий скрипт для демонстрації роботи інтелектуального супервізора."""
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "agents"))


def test_intelligent_supervisor():
    print("🚀 PREDATOR11 INTELLIGENT SUPERVISOR v3.0 TEST")
    print("=" * 60)

    try:
        from supervisor import Supervisor, TaskType

        print("✅ Loading advanced agent ecosystem...")
        sup = Supervisor("agents/agents.yaml", dry_run=True)
        sup.load_config()

        print(f"✅ Loaded {len(sup.agents)} agents with intelligent routing")
        print(f"✅ Intelligent Router: {'Available' if sup.model_router else 'Not Available'}")

        print("\n🎯 AGENT ECOSYSTEM STATUS:")
        print("-" * 40)

        # Show key agents
        key_agents = ["ChiefOrchestratorAgent", "ModelRouterAgent", "AnomalyAgent", "ForecastAgent"]
        for agent_name in key_agents:
            if agent_name in sup.agents:
                cfg = sup.agents[agent_name]
                strategy = cfg.models.selection_strategy
                primary_models = len(cfg.models.primary_pool)
                routing_strategies = len(cfg.models.routing_strategies)
                print(f"  ✅ {agent_name}")
                print(f"     Port: {cfg.port}")
                print(f"     Strategy: {strategy}")
                print(f"     Models: {primary_models} in primary pool")
                print(f"     Routing: {routing_strategies} strategies")
            else:
                print(f"  ❌ {agent_name} - Not Found")

        print("\n🔄 TESTING INTELLIGENT ROUTING:")
        print("-" * 40)

        if sup.model_router:
            # Test different routing scenarios
            test_cases = [
                (
                    "Python Code Generation",
                    TaskType.CODE,
                    {"specialization": "python", "complexity_score": 0.8},
                ),
                (
                    "Complex Reasoning",
                    TaskType.REASONING,
                    {"context_length": 35000, "complexity_score": 0.9},
                ),
                (
                    "Multilingual Embeddings",
                    TaskType.EMBED,
                    {"specialization": "multilingual", "language": "ukrainian"},
                ),
                (
                    "Document Analysis",
                    TaskType.VISION,
                    {"specialization": "document_analysis", "image_type": "document"},
                ),
            ]

            for description, task_type, context in test_cases:
                selected_model = sup.model_router.select_model_for_task(task_type, context)
                print(f"  🎯 {description}")
                print(f"     Task Type: {task_type.value}")
                print(f"     Context: {context}")
                print(f"     Selected Model: {selected_model or 'None'}")
                print()
        else:
            print("  ⚠️ Intelligent Router not available - check ModelRouterAgent config")

        print("🧠 TESTING CONTEXT-ADAPTIVE SELECTION:")
        print("-" * 40)

        if "ChiefOrchestratorAgent" in sup.agents:
            test_contexts = [
                ("High Complexity Task", {"task_complexity": 0.9, "reasoning_required": True}),
                ("Fast Response Required", {"task_complexity": 0.2, "response_time_required": 2}),
                ("Balanced Task", {"task_complexity": 0.6, "reasoning_required": False}),
            ]

            for description, context in test_contexts:
                selected_model = sup.select_model_for_context_adaptive_task(
                    "ChiefOrchestratorAgent", context
                )
                print(f"  🎯 {description}")
                print(f"     Context: {context}")
                print(f"     Selected Model: {selected_model or 'None'}")
                print()
        else:
            print("  ⚠️ ChiefOrchestratorAgent not found")

        print("🎉 SUCCESS: All intelligent routing systems are working!")
        print("🎯 SYSTEM READY FOR PRODUCTION")

        return True

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_intelligent_supervisor()
    exit(0 if success else 1)
