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
from datetime import datetime
from pathlib import Path


def make_suggestion(original: str) -> str:
    note = f"<!-- auto-suggestion: {datetime.utcnow().isoformat()}Z -->\n"
    return note + original


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", default="docs/auto-improvement-plan.md")
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent

    # If we're in a workdir (has .git), use relative path from there
    # Otherwise use repo_root
    if Path(".git").exists():
        target_path = Path(args.target)
    else:
        target_path = repo_root / args.target

    if not target_path.exists():
        print(f"Target file {target_path} not found. Creating a minimal suggestion file.")
        original = """# Auto Improvement Plan\n\n(placeholder)\n"""
    else:
        original = target_path.read_text(encoding="utf-8")

    suggested = make_suggestion(original)

    # Create unified diff
    orig_lines = original.splitlines()
    sug_lines = suggested.splitlines()

    relative_path = args.target
    diff = list(
        difflib.unified_diff(
            orig_lines,
            sug_lines,
            fromfile=f"a/{relative_path}",
            tofile=f"b/{relative_path}",
            lineterm="",
        )
    )

    if not diff:
        print("No changes detected; suggested.patch not written.")
        return 0

    patch_text = "\n".join(diff) + "\n"

    patch_file = Path("suggested.patch")
    patch_file.write_text(patch_text, encoding="utf-8")

    print(f"Wrote suggested patch to {patch_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
