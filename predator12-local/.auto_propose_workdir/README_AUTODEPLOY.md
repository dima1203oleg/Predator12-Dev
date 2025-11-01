# Predator Autodeploy — Quickstart

This README describes how to run the Autodeploy pipeline locally and what artifacts are provided in this repository.

Minimum requirements (local):

- Git
- Docker
- Helm
- kubectl
- kind (or k3d)
- node (>=16) and npm

Quick local dev steps:

1. Create a kind cluster:

```bash
kind create cluster --name predator-autodeploy
```

2. Bootstrap automation infra (install ArgoCD, Prometheus):

```bash
./scripts/autodeploy.setup.sh
```

3. Start verify service (inside `extension/`):

```bash
cd extension
npm install
npm run start:verify
```

4. Run a local dry-run:

```bash
RUN_ID=local-1 DRY_RUN=1 MANIFESTS_REPO=/tmp/manifests ./scripts/render_and_sync.sh
RUN_ID=local-1 DRY_RUN=1 MANIFESTS_REPO=/tmp/manifests ./scripts/gitops_sync.sh
./scripts/gitops_sync_dry_tests.sh
```

5. To test autopatch sandbox flow (example):

```bash
AUTO_PATCH_FILE=./automation/example.patch ./scripts/auto_apply_patch.sh
```

Notes:

- Configure secrets in GitHub for scheduled/autodeploy workflows: `AUTODEPLOY_ENDPOINT`, `AUTODEPLOY_TOKEN`, `GH_TOKEN`, `ARGO_AUTH_TOKEN`.
- Dependabot is enabled to open PRs for dependency bumps.
