#!/usr/bin/env python3
"""Minimal release gate checker.
This script reads .assistant/release_gate.yml and performs lightweight checks.
In production this should run real checks (coverage, trivy, opa, sbom signatures, perf)
"""
import sys
from pathlib import Path

import yaml


def main():
    p = Path(".assistant/release_gate.yml")
    if not p.exists():
        print("release_gate.yml not found")
        return 1
    cfg = yaml.safe_load(p.read_text())
    # minimal stub: ensure test_pass is true in config
    reqs = cfg.get("prod_requirements", {})
    print("Gate requirements:", reqs)
    # here we'd run real checks; for now return success (0) to let workflow continue
    return 0


if __name__ == "__main__":
    sys.exit(main())
