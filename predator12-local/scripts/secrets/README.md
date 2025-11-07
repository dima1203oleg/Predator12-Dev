# Add GitHub Actions secrets (helper)

This folder contains a small helper to add GitHub Actions secrets to a repository using the GitHub CLI (`gh`).

Files:

- `add_github_secrets.py` — Python helper. Prompts interactively or reads from environment / .env file and calls `gh secret set` for each provided value.
- `add_github_secrets.sh` — convenience shell wrapper for zsh/bash that calls the Python helper and supports reading a `.secrets.env` file.

How to use (recommended, local):

1. Install and authenticate GitHub CLI:

```bash
gh auth login
```

2. Create a `.secrets.env` file locally (do NOT commit it). Example:

```env
MANIFESTS_REPO=git@github.com:org/manifests.git
GH_TOKEN=ghp_...
REGISTRY_USERNAME=myuser
REGISTRY_PASSWORD=mypassword
ARGOCD_SERVER=https://argocd.example.com
ARGOCD_TOKEN=...
```

3. Run the wrapper (it will detect the current repo from git remote by default):

```bash
./scripts/secrets/add_github_secrets.sh
```

Or run non-interactive with an explicit repo:

```bash
./scripts/secrets/add_github_secrets.sh --repo myorg/myrepo
```

Security notes:

- Never commit `.secrets.env` into source control.
- Prefer creating secrets directly in GitHub Settings when possible.
- This script requires the user running it to have permission to set secrets in the target repo.
