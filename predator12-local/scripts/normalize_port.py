#!/usr/bin/env python3
"""
Normalize frontend dev port across repository
Replaces http://localhost:3000 -> http://localhost:5173 in non-whitelisted files.
Prints changed files and counts.
"""
import fnmatch
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WHITELIST_PATTERNS = [
    "infra/**",
    "observability/**",
    "grafana/**",
    "helm/**",
    "mcp-registry/**",
    ".github/workflows/**",
    "**/realm-export.json",
    "**/keycloak/**",
    "**/*.ipynb",
    "**/*.crt",
    "**/*.pem",
    "**/values*.yaml",
    "**/.env.production",
    "**/prod.env",
    "docker-compose*.yml",
    "docker-compose.prod.yml",
]

SEARCH = "http://localhost:3000"
REPLACE = "http://localhost:5173"


def matches_whitelist(path: Path) -> bool:
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    for p in WHITELIST_PATTERNS:
        if fnmatch.fnmatch(rel, p):
            return True
    # additional heuristics: skip files that clearly mention Grafana or are in docker-compose or infra
    if (
        "/observability/" in rel
        or "/infra/" in rel
        or "/mcp-registry/" in rel
        or rel.startswith("grafana")
    ):
        return True
    if "grafana" in rel and (rel.endswith(".yml") or "grafana" in rel):
        return True
    return False


def is_binary(path: Path) -> bool:
    try:
        with open(path, "rb") as f:
            chunk = f.read(1024)
            if b"\0" in chunk:
                return True
    except Exception:
        return True
    return False


def main():
    changed = {}
    total_replacements = 0
    for path in ROOT.rglob("*"):
        if path.is_dir():
            continue
        # skip large directories
        if any(part in ("node_modules", ".venv", "venv", "backend/venv") for part in path.parts):
            continue
        # skip binary files
        if is_binary(path):
            continue
        if matches_whitelist(path):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            # skip unreadable files
            continue
        if SEARCH in text:
            new_text = text.replace(SEARCH, REPLACE)
            path.write_text(new_text, encoding="utf-8")
            count = text.count(SEARCH)
            changed[str(path.relative_to(ROOT))] = count
            total_replacements += count
    # print summary
    print("Normalization complete")
    print("Changed files:")
    for f, c in changed.items():
        print(f" - {f}: {c} replacements")
    print(f"Total replacements: {total_replacements}")


if __name__ == "__main__":
    main()
