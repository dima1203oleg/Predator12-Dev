#!/usr/bin/env python3
"""
AI-powered patch generator for Predator 12.

This script uses AI tools (Aider, Continue, etc.) to analyze code and generate
meaningful patches for improvements, bug fixes, and optimizations.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
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

    # Create a prompt for Aider
    prompt = """You are an expert code reviewer and AI assistant. Analyze the following files and suggest meaningful improvements:

Requirements:
1. Focus on code quality, performance, security, and maintainability
2. Look for potential bugs, inefficiencies, or missing error handling
3. Suggest concrete code changes with explanations
4. Keep changes focused and incremental
5. Ensure changes are backwards compatible

Files to analyze:
"""

    for i, file_path in enumerate(target_files, 1):
        rel_path = file_path.relative_to(repo_root)
        prompt += f"{i}. {rel_path}\n"

    prompt += "\nPlease analyze these files and suggest specific improvements. Focus on the most impactful changes first."

    # Create a temporary prompt file
    prompt_file = repo_root / "aider_prompt.txt"
    prompt_file.write_text(prompt, encoding="utf-8")

    try:
        # Run Aider with the prompt
        cmd = [
            sys.executable,
            "-m",
            "aider",
            "--message-file",
            str(prompt_file),
            "--yes",  # Auto-approve changes
            "--no-git",  # Don't use git integration
            "--dark-mode",  # Better for automation
        ]

        # Add target files
        for file_path in target_files:
            cmd.append(str(file_path))

        print(f"Running Aider with {len(target_files)} target files...")
        returncode, stdout, stderr = run_command(cmd, repo_root)

        if returncode == 0:
            print("Aider completed successfully")
            return True
        else:
            print(f"Aider failed with return code {returncode}")
            print(f"Stderr: {stderr}")
            return False

    finally:
        # Clean up prompt file
        if prompt_file.exists():
            prompt_file.unlink()


def generate_patch_with_continue(target_files: List[Path], repo_root: Path) -> bool:
    """Generate patch using Continue.dev if available"""
    # This would require Continue CLI or VS Code extension
    # For now, fall back to basic analysis
    print("Continue.dev integration not implemented yet")
    return False


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
