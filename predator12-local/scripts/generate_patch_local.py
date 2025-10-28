#!/usr/bin/env python3
"""
Local helper to create a conservative suggested.patch file.

This script finds a target file (defaults to `docs/auto-improvement-plan.md`),
creates a minor suggested change (a timestamped note), and writes a unified
diff to `suggested.patch` in the repository root. It's safe and non-destructive
— it does not modify the working tree.
"""
from __future__ import annotations

import argparse
import difflib
from pathlib import Path
from datetime import datetime


def make_suggestion(original: str) -> str:
    note = f"\n\n<!-- auto-suggestion: {datetime.utcnow().isoformat()}Z -->\n"
    return original + note


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", default="docs/auto-improvement-plan.md")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    target_path = repo_root / args.target

    if not target_path.exists():
        print(f"Target file {target_path} not found. Creating a minimal suggestion file.")
        original = """# Auto Improvement Plan\n\n(placeholder)\n"""
    else:
        original = target_path.read_text(encoding="utf-8")

    suggested = make_suggestion(original)

    # Create unified diff
    orig_lines = original.splitlines(keepends=True)
    sug_lines = suggested.splitlines(keepends=True)

    diff = difflib.unified_diff(orig_lines, sug_lines, fromfile=str(target_path), tofile=str(target_path), lineterm="")
    patch_text = "\n".join(list(diff))

    patch_file = repo_root / "suggested.patch"
    patch_file.write_text(patch_text, encoding="utf-8")

    print(f"Wrote suggested patch to {patch_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
