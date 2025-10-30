#!/usr/bin/env python3
"""
Safe helper to add GitHub Actions secrets to a repository using the GitHub CLI (gh).

Usage:
  - Interactive: run without args, script will prompt for values.
  - Non-interactive: provide secrets as env vars or pass --secrets-file PATH (.env style).

This script will NOT print secret values. It calls `gh secret set NAME --body VALUE --repo OWNER/REPO`.

Requirements:
  - GitHub CLI (gh) installed and authenticated (gh auth login).
  - The current user must have admin/write permissions for the target repo.

Security:
  - Do NOT commit any secret values into the repo. Use this helper locally or in a secure CI runner.
"""
from __future__ import annotations

import argparse
import os
import shlex
import subprocess
import sys
from typing import Dict, Optional

DEFAULT_REPO_HINT = "auto-detected from git remote or specify with --repo"


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=False, text=True, capture_output=True)


def detect_repo() -> Optional[str]:
    # Try to read remote origin URL and parse owner/repo
    p = run(["git", "config", "--get", "remote.origin.url"])
    if p.returncode != 0:
        return None
    url = p.stdout.strip()
    # support git@github.com:owner/repo.git and https://github.com/owner/repo.git
    if url.startswith("git@"):
        # git@github.com:owner/repo.git
        try:
            _, path = url.split(":", 1)
            owner_repo = path.replace(".git", "").strip()
            return owner_repo
        except Exception:
            return None
    if url.startswith("https://") or url.startswith("http://"):
        parts = url.split("/")
        if len(parts) >= 2:
            owner = parts[-2]
            repo = parts[-1].replace(".git", "")
            return f"{owner}/{repo}"
    return None


def gh_available() -> bool:
    p = run(["gh", "--version"])
    return p.returncode == 0


def set_secret(repo: str, name: str, value: str) -> bool:
    # Using gh secret set --body
    cmd = ["gh", "secret", "set", name, "--body", value, "--repo", repo]
    p = run(cmd)
    if p.returncode != 0:
        print(f"[ERROR] Failed to set secret {name} in {repo}: {p.stderr.strip()}")
        return False
    print(f"[OK] Set secret {name} in {repo}")
    return True


def load_env_file(path: str) -> Dict[str, str]:
    out: Dict[str, str] = {}
    with open(path, "r", encoding="utf-8") as f:
        for raw in f:
            s = raw.strip()
            if not s or s.startswith("#"):
                continue
            if "=" not in s:
                continue
            k, v = s.split("=", 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def gather_values(args: argparse.Namespace) -> Dict[str, str]:
    keys = [
        "MANIFESTS_REPO",
        "GH_TOKEN",
        "REGISTRY_USERNAME",
        "REGISTRY_PASSWORD",
        "ARGOCD_SERVER",
        "ARGOCD_TOKEN",
    ]
    vals: Dict[str, str] = {}
    # 1) from secrets file
    if args.secrets_file:
        if os.path.exists(args.secrets_file):
            vals.update(load_env_file(args.secrets_file))
        else:
            print(f"Secrets file not found: {args.secrets_file}")
    # 2) from env
    for k in keys:
        if k in vals:
            continue
        if os.environ.get(k):
            vals[k] = os.environ.get(k)  # type: ignore
    # 3) from command line flags
    for k in keys:
        v = getattr(args, k.lower(), None)
        if v:
            vals[k] = v
    # 4) interactive prompt for missing required tokens (GH_TOKEN & MANIFESTS_REPO recommended)
    for k in keys:
        if k not in vals and not args.non_interactive:
            try:
                prompt = f"Enter value for {k} (leave empty to skip): "
                v = input(prompt)
            except KeyboardInterrupt:
                print("\nAborted by user")
                sys.exit(1)
            if v:
                vals[k] = v
    return vals


def main() -> None:
    parser = argparse.ArgumentParser(description="Add GitHub Actions secrets to a repo via gh CLI")
    parser.add_argument(
        "--repo",
        help=f"target repository (owner/repo). If not provided, script will try to detect. {DEFAULT_REPO_HINT}",
    )
    parser.add_argument("--secrets-file", help="path to .env style file containing secrets")
    parser.add_argument(
        "--non-interactive", action="store_true", help="do not prompt; only use env/flags/file"
    )
    # allow passing single secrets via flags (optional)
    parser.add_argument("--manifests-repo")
    parser.add_argument("--gh-token")
    parser.add_argument("--registry-username")
    parser.add_argument("--registry-password")
    parser.add_argument("--argocd-server")
    parser.add_argument("--argocd-token")
    args = parser.parse_args()

    if not gh_available():
        print(
            "GitHub CLI (gh) is not available or not on PATH. Install and authenticate with 'gh auth login'."
        )
        sys.exit(2)

    repo = args.repo
    if not repo:
        repo = detect_repo()
        if not repo:
            print("Could not auto-detect repository. Pass --repo owner/repo.")
            sys.exit(2)
        print(f"Detected repo: {repo}")

    values = gather_values(args)

    # Only set secrets that are present in values
    if not values:
        print("No secrets provided; nothing to set.")
        return

    # Map local keys to secret names we want to set
    mapping = {
        "MANIFESTS_REPO": "MANIFESTS_REPO",
        "GH_TOKEN": "GH_TOKEN",
        "REGISTRY_USERNAME": "REGISTRY_USERNAME",
        "REGISTRY_PASSWORD": "REGISTRY_PASSWORD",
        "ARGOCD_SERVER": "ARGOCD_SERVER",
        "ARGOCD_TOKEN": "ARGOCD_TOKEN",
    }

    failures = 0
    for k, secret_name in mapping.items():
        if k in values and values[k]:
            ok = set_secret(repo, secret_name, values[k])
            if not ok:
                failures += 1

    if failures:
        print(f"Completed with {failures} failures.")
        sys.exit(3)
    print("All provided secrets were set successfully.")


if __name__ == "__main__":
    main()
