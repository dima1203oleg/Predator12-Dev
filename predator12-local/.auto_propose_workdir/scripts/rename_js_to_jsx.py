#!/usr/bin/env python3
"""
Rename `.js` -> `.jsx` for components and update explicit imports.

Usage: run from repo root:
  python3 scripts/rename_js_to_jsx.py

This script:
 - Walks `frontend/src/components` and renames files ending with .js to .jsx using `git mv` when possible.
 - Scans the repository for import statements that explicitly reference `.js` and updates them to `.jsx`.
 - Stages and commits the changes with a clear message.

This is an automated, reversible change (keeps git history). Review the resulting branch and run the dev server.
"""
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPONENTS_DIR = ROOT / "frontend" / "src" / "components"


def git_mv(src: Path, dst: Path) -> bool:
    try:
        subprocess.run(["git", "mv", str(src), str(dst)], check=True)
        return True
    except subprocess.CalledProcessError:
        try:
            src.rename(dst)
            return True
        except Exception:
            return False


def find_js_files(base: Path):
    for p in base.rglob("*.js"):
        # skip node_modules (just in case) and other non-src
        if "node_modules" in p.parts:
            continue
        yield p


def update_imports(root: Path):
    # Replace occurrences like './Foo.js' or "../Bar.js" in repo files
    pattern = re.compile(r"(\.(?:\.\.|\.|/)?[\w\-/@]+)\.js(['\"])\b")
    changed_files = []
    for file in root.rglob("*"):
        if file.is_file() and file.suffix in {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}:
            try:
                text = file.read_text(encoding="utf-8")
            except Exception:
                continue
            new_text = pattern.sub(lambda m: f"{m.group(1)}.jsx{m.group(2)}", text)
            if new_text != text:
                file.write_text(new_text, encoding="utf-8")
                changed_files.append(file)
    return changed_files


def main():
    print(f"Repo root: {ROOT}")
    if not COMPONENTS_DIR.exists():
        print(f"Components dir not found: {COMPONENTS_DIR}")
        return 1

    renamed = []
    for js_file in find_js_files(COMPONENTS_DIR):
        jsx_file = js_file.with_suffix(".jsx")
        if jsx_file.exists():
            print(f"Skipping (target exists): {js_file} -> {jsx_file}")
            continue
        ok = git_mv(js_file, jsx_file)
        if ok:
            renamed.append((js_file, jsx_file))
            print(f"Renamed: {js_file} -> {jsx_file}")
        else:
            print(f"Failed to rename: {js_file}")

    print(f"Total renamed files: {len(renamed)}")

    print("Updating explicit .js imports across repo...")
    changed = update_imports(ROOT)
    print(f"Files with import updates: {len(changed)}")

    # Stage changes and commit
    try:
        subprocess.run(["git", "add", "-A"], check=True)
        msg = "chore: rename frontend components .js -> .jsx to allow JSX parsing (auto)"
        subprocess.run(["git", "commit", "-m", msg], check=True)
        print("Committed changes")
    except subprocess.CalledProcessError as e:
        print("Git commit failed or nothing to commit:", e)

    print("Done. Please run `npm run dev` in frontend/ to verify build.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
