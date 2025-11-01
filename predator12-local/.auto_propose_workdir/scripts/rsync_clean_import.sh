#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/rsync_clean_import.sh \
#   /path/to/AAPredator8.0 \
#   /path/to/codespaces-models \
#   /path/to/Predator11
# It will copy needed sources into Predator11/ while excluding caches and heavy artifacts.

SRC1="${1:?Source AAPredator8.0 path required}"
SRC2="${2:?Source codespaces-models path required}"
DEST="${3:?Destination repo root (Predator11) required}"

mkdir -p "$DEST"

rsync -av --progress \
  --exclude '.git/' \
  --exclude '.venv/' \
  --exclude 'node_modules/' \
  --exclude '__pycache__/' \
  --exclude '.pytest_cache/' \
  --exclude '*.pyc' \
  --exclude '*.pyo' \
  --exclude '*.ipynb_checkpoints/' \
  --exclude '*.log' \
  --exclude '*.sqlite' \
  --exclude '*.parquet' \
  --exclude '*.zip' \
  --exclude '*.tar*' \
  --exclude 'dist/' \
  --exclude 'build/' \
  --exclude '.DS_Store' \
  "$SRC1"/ "$DEST"/

rsync -av --progress \
  --exclude '.git/' \
  --exclude '.venv/' \
  --exclude 'node_modules/' \
  --exclude '__pycache__/' \
  --exclude '.pytest_cache/' \
  --exclude '*.pyc' \
  --exclude '*.pyo' \
  --exclude '*.ipynb_checkpoints/' \
  --exclude '*.log' \
  --exclude '*.zip' \
  --exclude '*.tar*' \
  --exclude '.DS_Store' \
  "$SRC2"/ "$DEST"/

echo "Import completed. Please review changes and remove any redundant duplicates."
