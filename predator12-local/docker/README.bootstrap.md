# Docker bootstrap image for gitops_sync

This folder contains a Dockerfile (`../Dockerfile.bootstrap`) to build a small bootstrap image that includes tools needed to run `scripts/gitops_sync.sh` in a controlled container.

Build locally:

```bash
# from repo root
docker build -f Dockerfile.bootstrap -t predator-bootstrap:local .
```

Run in DRY_RUN mode (recommended for testing):

```bash
docker run --rm -e DRY_RUN=1 -e IMAGE_TAG=bootstrap-test \
  -v $(pwd):/work -w /work predator-bootstrap:local
```

Notes about backups:
- The `gitops_sync.sh` script now writes structured backups into `.gitops_backups/<timestamp>/...` instead of leaving `.bak.*` files next to manifests.
- When running DRY_RUN locally you can inspect `.gitops_backups` inside the repo workspace to review prior versions.

Local DRY_RUN without Docker (convenience):

```bash
# from repo root
DRY_RUN=1 IMAGE_TAG=local-test ./scripts/gitops_sync.sh
```

Run with a host folder as manifests repo (DRY_RUN=0 will attempt push):

```bash
docker run --rm \
  -e DRY_RUN=1 -e IMAGE_TAG=release-001 \
  -e MANIFESTS_REPO=/manifests \
  -v /tmp/manifests:/manifests \
  -v $(pwd):/work -w /work predator-bootstrap:local
```

Notes:
- The image installs helm, yq and attempts to install argocd/gh/trivy/cosign when available.
- For real pushes you must provide `MANIFESTS_REMOTE` and `GH_TOKEN` via environment/CI secrets.
- This Dockerfile is intentionally minimal and uses best-effort installs for some CLIs; extend as needed for production.
