#!/usr/bin/env python3
"""
Agent Registry Validator
Ensures all agents are properly registered and configured
"""

import sys
import yaml
from pathlib import Path
from typing import Dict, Any, List


class AgentRegistryValidator:
    """Validates agent registry configuration"""

    REQUIRED_FIELDS = ['name', 'type', 'enabled', 'model', 'config']
    VALID_TYPES = [
        'self-healing', 'optimize', 'modernize', 'security',
        'compliance', 'cost', 'performance', 'data-quality'
    ]

    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def validate(self, filepath: Path) -> bool:
        """Validate the agent registry file"""
        try:
            with open(filepath, 'r') as f:
                data = yaml.safe_load(f)

            if not data or 'agents' not in data:
                self.errors.append("No 'agents' key found in registry")
                return False

            agents = data['agents']
            if not isinstance(agents, list):
                self.errors.append("'agents' must be a list")
                return False

            # Track agent names for duplicates
            agent_names = set()

            for idx, agent in enumerate(agents):
                self._validate_agent(agent, idx, agent_names)

            # Check for minimum agent count
            if len(agents) < 26:
                self.warnings.append(
                    f"Expected at least 26 agents, found {len(agents)}"
                )

            return len(self.errors) == 0

        except yaml.YAMLError as e:
            self.errors.append(f"Invalid YAML: {e}")
            return False
        except Exception as e:
            self.errors.append(f"Error reading file: {e}")
            return False

    def _validate_agent(self, agent: Dict[Any, Any], idx: int, seen_names: set):
        """Validate a single agent configuration"""
        prefix = f"Agent [{idx}]"

        # Check required fields
        for field in self.REQUIRED_FIELDS:
            if field not in agent:
                self.errors.append(f"{prefix}: Missing required field '{field}'")

        # Validate name
        name = agent.get('name')
        if name:
            if name in seen_names:
                self.errors.append(f"{prefix}: Duplicate agent name '{name}'")
            seen_names.add(name)
        else:
            self.errors.append(f"{prefix}: Agent name is empty")

        # Validate type
        agent_type = agent.get('type')
        if agent_type and agent_type not in self.VALID_TYPES:
            self.warnings.append(
                f"{prefix} ({name}): Unknown type '{agent_type}'"
            )

        # Validate model
        model = agent.get('model')
        if model and not isinstance(model, str):
            self.errors.append(f"{prefix} ({name}): 'model' must be a string")

        # Validate config
        config = agent.get('config')
        if config and not isinstance(config, dict):
            self.errors.append(f"{prefix} ({name}): 'config' must be a dictionary")

        # Check if enabled is boolean
        enabled = agent.get('enabled')
        if enabled is not None and not isinstance(enabled, bool):
            self.errors.append(f"{prefix} ({name}): 'enabled' must be boolean")

    def print_results(self):
        """Print validation results"""
        if self.errors:
            print("❌ ERRORS:")
            for error in self.errors:
                print(f"  {error}")
        if self.warnings:
            print("⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"  {warning}")
        if not self.errors and not self.warnings:
            print("✅ Agent registry validation passed")


def main():
    """Main entry point"""
    registry_file = Path('agents/registry.yaml')

    if len(sys.argv) > 1:
        registry_file = Path(sys.argv[1])

    if not registry_file.exists():
        print(f"❌ Registry file not found: {registry_file}")
        sys.exit(1)

    validator = AgentRegistryValidator()
    if not validator.validate(registry_file):
        validator.print_results()
        sys.exit(1)

    validator.print_results()


if __name__ == "__main__":
    main()
