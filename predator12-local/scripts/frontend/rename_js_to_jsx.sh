#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../../" && pwd)"
cd "$repo_root"

branch="auto/fix-jsx-extensions-$(date +%s)"
echo "Creating branch: $branch"
git checkout -b "$branch"

echo "Searching for .js files under frontend/src/components..."
mapfile -t files < <(find frontend/src/components -type f -name '*.js')
if [ ${#files[@]} -eq 0 ]; then
  echo "No .js files found under frontend/src/components. Exiting."
  exit 0
fi

echo "Found ${#files[@]} files. Renaming..."
for f in "${files[@]}"; do
  new="${f%.js}.jsx"
  echo "git mv '$f' '$new'"
  git mv "$f" "$new"
done

echo "Updating import/export references that explicitly include .js -> .jsx"
# Use a Python script to safely update tracked text files
python3 - <<'PY'
import re
from pathlib import Path

root = Path('.').resolve()
binary_exts = {'.png','.jpg','.jpeg','.svg','.ico','.map','.ttf','.woff','.woff2','.pdf','.bin','.wasm'}

for path in root.rglob('*'):
    if not path.is_file():
        continue
    if path.suffix.lower() in binary_exts:
        continue
    # only modify files tracked by git to avoid node_modules, etc.
    try:
        # skip files in node_modules or .git
        if 'node_modules' in path.parts or '.git' in path.parts:
            continue
        text = path.read_text(encoding='utf-8')
    except Exception:
        continue
    new = text.replace(".js'", ".jsx'").replace('.js"', '.jsx"')
    if new != text:
        path.write_text(new, encoding='utf-8')
        print('Updated imports in', path)
PY

echo "Staging changes and committing"
git add -A
git commit -m "chore(frontend): rename components .js -> .jsx and update explicit import references (auto)"

echo "Done. Branch: $branch"
echo "Run 'git show --name-only HEAD' to inspect the commit."

exit 0
