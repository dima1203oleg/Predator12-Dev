#!/usr/bin/env python3
"""
Validate that a requested ops action is allowed by .assistant/permissions.yml.

Usage: python3 scripts/validate_permissions.py <action> <env>
Exits non-zero if validation fails.
"""
import sys
from pathlib import Path

import yaml


def load_policy(path: Path):
    """Завантажує політику з YAML-файлу."""
    data = yaml.safe_load(path.read_text())
    return data


def main():
    """Основна функція перевірки дозволу дії."""
    if len(sys.argv) < 3:
        print("Usage: validate_permissions.py <action> <env>")
        sys.exit(2)
    action = sys.argv[1]
    env = sys.argv[2]
    p = Path(".assistant/permissions.yml")
    if not p.exists():
        print("permissions.yml not found")
        sys.exit(2)
    policy = load_policy(p)
    allowed = False
    for a in policy.get("allowed_actions", []):
        if a.get("id") == action:
            envs = a.get("environments") or []
            # if envs unspecified, allow
            if not envs or env in envs:
                allowed = True
            break
    if not allowed:
        print(f"Action '{action}' not allowed in env '{env}' by .assistant/permissions.yml")
        sys.exit(1)
    print("OK")


if __name__ == "__main__":
    main()
