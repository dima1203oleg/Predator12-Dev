CI/CD and GitOps runbook (preview)

Overview
--------
This repository contains scaffolding to run tests, build images, update a separate manifests repository and let Argo CD sync to clusters.

What was added
- GitHub Actions workflow: `.github/workflows/ci-cd.yml` — runs tests and builds image (placeholder push step).
- Kubernetes manifests (kustomize): `k8s/base/*` and overlays `k8s/overlays/{dev,prod}`.
- Argo CD Application template: `platform/argocd/app-predator12.yaml` (points to external manifests repo).
- Helper scripts: `scripts/deploy/prepare_manifests.sh` and `scripts/deploy/auto_bump_and_pr.sh`.

How to run locally (dry-run)
1. Run tests (already configured):

```bash
source venv/bin/activate
pytest backend/tests/
```

2. Build image locally and prepare manifests (example):

```bash
docker build -t myregistry/predator12:local .
./scripts/deploy/prepare_manifests.sh myregistry/predator12:local
```

3. Create PR to manifests repo (requires `MANIFESTS_REPO` env var and `gh`):

```bash
export MANIFESTS_REPO=git@github.com:yourorg/manifests-repo.git
./scripts/deploy/auto_bump_and_pr.sh myregistry/predator12:local
```

Notes & next steps
- You must provide real registry and manifests repo credentials to enable full automation.
- For production deploy, configure Argo CD to point at `manifests-repo` and enable automated sync/rollback.
- Consider replacing placeholders with Kaniko or buildx action for registry with credentials.
You must provide real registry and manifests repo credentials to enable full automation.

Argo Rollouts / health gates
- The `k8s/overlays/prod/rollout.yaml` is included as an Argo Rollout (canary) example. It references an `AnalysisTemplate` which expects a Prometheus provider. To enable automatic canary analysis and rollback you must:
	- Deploy Prometheus in the target cluster and ensure Argo Rollouts has access to it.
	- Configure the `analysis-template.yaml` provider address or use a cluster-level Prometheus service discovery.
	- Install the `argo-rollouts` controller in the cluster.

Secrets & signed releases
- The current pipeline uses placeholder env vars/secrets. For production automation supply:
	- `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` (or use `docker/login-action` with GitHub Packages token)
	- `MANIFESTS_REPO` and `GH_TOKEN` (or `DEPLOYMENT_TOKEN`) so CI can push manifests and create PRs.
	- `DEPLOYMENT_TOKEN` should be a machine account with minimal rights to the manifests repository.

Next recommended steps (I can implement automatically if you authorize):
1. Replace CI placeholders with Kaniko or `docker/build-push-action` secrets and enable image signing (cosign).
2. Wire GH Secrets and test a full push -> manifests PR -> ArgoCD sync flow in a staging cluster.
3. Add a Tekton pipeline alternative if you prefer cluster‑native CI.
