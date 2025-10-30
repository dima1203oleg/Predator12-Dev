#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Setting up Predator12 development environment..."

echo "1) Creating and activating virtualenv (optional)..."
if [ -z "${VIRTUAL_ENV-}" ]; then
  python3 -m venv .venv
  echo "Created virtualenv at .venv. Activate with: source .venv/bin/activate"
else
  echo "Virtualenv already active"
fi

echo "2) Installing backend Python dependencies (if requirements file exists)"
if [ -f "$ROOT_DIR/backend/requirements.txt" ]; then
  . ${VIRTUAL_ENV:-.venv}/bin/activate || true
  pip install --upgrade pip
  pip install -r "$ROOT_DIR/backend/requirements.txt" || true
fi

echo "3) Installing frontend dependencies (if present)"
if [ -f "$ROOT_DIR/frontend/package.json" ]; then
  (cd "$ROOT_DIR/frontend" && npm ci)
fi

echo "4) Install pre-commit hooks"
pip install pre-commit || true
pre-commit install || true

echo "5) Make helper scripts executable"
chmod +x "$ROOT_DIR/scripts/auto_propose.sh" || true

echo "Setup complete. Recommended next steps:"
echo "  - Activate the virtualenv: source .venv/bin/activate"
echo "  - Run pre-commit once: pre-commit run --all-files"
echo "  - Run tests: pytest"
