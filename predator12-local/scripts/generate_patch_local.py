#!/usr/bin/env python3
# Auto-improvement suggestions (2025-11-02T14:45:27.412660Z):
# # - Avoid bare except clauses, be more specific
# - Found TODO/FIXME comments that should be addressed
# Auto-improvement suggestions (2025-11-02T14:48:22.796095Z):
# # - Avoid bare except clauses, be more specific
# - Found TODO/FIXME comments that should be addressed
# Auto-improvement suggestions (2025-11-02T23:12:49.367882Z):
# # - Avoid bare except clauses, be more specific
# - Found TODO/FIXME comments that should be addressed
# Auto-improvement suggestions (2025-11-03T04:52:12.410076Z):
# # - Avoid bare except clauses, be more specific
# - Found TODO/FIXME comments that should be addressed
"""
AI-powered patch generator for Predator 12.

This script uses AI tools (Aider, Continue, etc.) to analyze code and generate
meaningful patches for improvements, bug fixes, and optimizations.
"""
from __future__ import annotations

import argparse
import datetime
import os
import subprocess
from pathlib import Path
from typing import List, Optional


def run_command(cmd: List[str], cwd: Optional[Path] = None) -> tuple[int, str, str]:
    """Run command and return (returncode, stdout, stderr)"""
    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
        env={**os.environ, "PYTHONPATH": str(Path(__file__).parent.parent)},
    )
    return result.returncode, result.stdout, result.stderr


def find_target_files(repo_root: Path, max_files: int = 5) -> List[Path]:
    """Find files that could benefit from improvements"""
    # Priority files that are likely to need improvements
    priority_patterns = [
        "backend/app/agents/**/*.py",  # Agent implementations
        "backend/app/**/*.py",  # Backend code
        "frontend/src/**/*.ts",  # Frontend code
        "scripts/**/*.py",  # Scripts
        "agents/**/*.py",  # Agent code
    ]

    candidates = []
    for pattern in priority_patterns:
        for path in repo_root.glob(pattern):
            if path.is_file() and not path.name.startswith("__"):
                candidates.append(path)

    # Sort by modification time (recently modified files first)
    candidates.sort(key=lambda p: p.stat().st_mtime, reverse=True)

    return candidates[:max_files]


def generate_patch_with_aider(target_files: List[Path], repo_root: Path) -> bool:
    """Generate patch using Aider AI assistant"""
    if not target_files:
        print("No target files found for analysis")
        return False

    # For now, use a simpler approach that doesn't require external APIs
    print("Using local code analysis instead of Aider")
    return generate_basic_improvements(target_files, repo_root)


def generate_basic_improvements(target_files: List[Path], repo_root: Path) -> bool:
    """Generate basic code improvements without external APIs"""
    improvements_made = False

    for file_path in target_files:
        try:
            content = file_path.read_text(encoding="utf-8")
            original_content = content

            # Basic improvements
            # 1. Add missing docstrings to functions
            import re

            # Find functions without docstrings
            func_pattern = r'def (\w+)\([^)]*\):(?:\s*\n\s*""".*?""")?'
            re.findall(func_pattern, content, re.MULTILINE | re.DOTALL)

            # 2. Check for common issues
            issues = []

            # Check for print statements (should use logging)
            if "print(" in content and "import logging" not in content:
                issues.append("Consider using logging instead of print statements")

            # Check for bare except clauses
            if "except:" in content or "except Exception:" in content:
                issues.append("Avoid bare except clauses, be more specific")

            # Check for TODO comments
            if "TODO" in content or "FIXME" in content:
                issues.append("Found TODO/FIXME comments that should be addressed")

            # If we found issues, add a comment to the file
            if issues:
                timestamp = datetime.datetime.utcnow().isoformat() + "Z"
                improvement_comment = f"""
# Auto-improvement suggestions ({timestamp}):
# {chr(10).join(f'# - {issue}' for issue in issues)}
"""

                # Add at the top of the file after imports
                lines = content.split("\n")
                insert_pos = 0

                # Find where imports end
                for i, line in enumerate(lines):
                    if line.startswith("import ") or line.startswith("from "):
                        continue
                    elif line.strip() == "" or line.startswith("#"):
                        continue
                    else:
                        insert_pos = i
                        break

                lines.insert(insert_pos, improvement_comment.strip())
                content = "\n".join(lines)
                improvements_made = True

            # Write back if changed
            if content != original_content:
                file_path.write_text(content, encoding="utf-8")
                print(f"Added improvements to {file_path.relative_to(repo_root)}")

        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue

    return improvements_made


def generate_patch_with_continue(target_files: List[Path], repo_root: Path) -> bool:
    """Generate patch using Continue.dev if available"""
    # This would require Continue CLI or VS Code extension
    # For now, fall back to basic analysis
    print("Continue.dev integration not implemented yet")
    return generate_basic_improvements(target_files, repo_root)


def generate_basic_patch(repo_root: Path) -> bool:
    """Generate a basic patch with timestamp (fallback)"""
    target_file = repo_root / "docs" / "auto-improvement-plan.md"

    if not target_file.exists():
        print(f"Target file {target_file} not found")
        return False

    # Read current content
    content = target_file.read_text(encoding="utf-8")

    # Add a timestamped note
    import datetime

    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    note = f"<!-- auto-suggestion: {timestamp} -->\n"
    new_content = note + content

    # Write back
    target_file.write_text(new_content, encoding="utf-8")

    print(f"Added timestamp to {target_file}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="AI-powered patch generator")
    parser.add_argument("--target", help="Specific target file or directory")
    parser.add_argument("--max-files", type=int, default=3, help="Maximum files to analyze")
    parser.add_argument(
        "--method",
        choices=["aider", "continue", "basic"],
        default="aider",
        help="Generation method to use",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    repo_root = script_dir.parent

    # Find target files
    if args.target:
        target_path = Path(args.target)
        if not target_path.is_absolute():
            target_path = repo_root / target_path

        if target_path.is_file():
            target_files = [target_path]
        elif target_path.is_dir():
            target_files = list(target_path.glob("**/*.py"))[: args.max_files]
        else:
            print(f"Target {args.target} not found")
            return 1
    else:
        target_files = find_target_files(repo_root, args.max_files)

    print(f"Found {len(target_files)} target files for analysis:")
    for file_path in target_files:
        print(f"  - {file_path.relative_to(repo_root)}")

    # Generate patch based on method
    success = False

    if args.method == "aider":
        success = generate_patch_with_aider(target_files, repo_root)
        if not success:
            print("Falling back to basic method")
            success = generate_basic_patch(repo_root)

    elif args.method == "continue":
        success = generate_patch_with_continue(target_files, repo_root)
        if not success:
            success = generate_basic_patch(repo_root)

    else:  # basic
        success = generate_basic_patch(repo_root)

    if success:
        # Create unified diff - check if file exists in git
        try:
            returncode, stdout, stderr = run_command(
                ["git", "ls-files", "--error-unmatch", "docs/auto-improvement-plan.md"], repo_root
            )

            if returncode == 0:
                # File exists in git, use normal diff
                returncode, stdout, stderr = run_command(
                    ["git", "diff", "docs/auto-improvement-plan.md"], repo_root
                )
            else:
                # File doesn't exist in git, create new file diff
                returncode, stdout, stderr = run_command(
                    [
                        "git",
                        "diff",
                        "--no-index",
                        "--",
                        "/dev/null",
                        "docs/auto-improvement-plan.md",
                    ],
                    repo_root,
                )

            if returncode in (0, 1):  # 0 = no diff, 1 = diff exists
                patch_content = stdout
                if patch_content.strip():
                    patch_file = repo_root / "suggested.patch"
                    patch_file.write_text(patch_content, encoding="utf-8")
                    print(f"Generated patch saved to {patch_file}")
                    return 0
                else:
                    print("No changes detected")
                    return 1
            else:
                print(f"Git diff failed: {stderr}")
                return 1

        except Exception as e:
            print(f"Error creating patch: {e}")
            return 1
    else:
        print("Failed to generate any changes")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
