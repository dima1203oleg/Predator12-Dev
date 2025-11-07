# HashiCorp Vault integration (overview)

Цей файл містить рекомендації та шаблони для інтеграції Vault як центрального сховища секретів для Tekton, ArgoCD та local tooling.

## Основні ідеї

- Зберігайте всі чутливі секрети (registry creds, proxmox tokens, argocd tokens, ssh keys) у Vault.
- Tekton отримує секрети через Vault Agent/CSI або short‑lived tokens (використовуйте Vault Kubernetes auth).
- CI runner (GitHub Actions) або локальні скрипти можуть отримувати тимчасові токени через Vault OIDC/Role для доступу до секретів.

## Пропонований flow

1. Створіть KV в Vault: `secret/data/predator12/ci/credentials` з ключами: `dockerconfigjson`, `proxmox_token`, `argocd_token`, `git_ssh_key`.
2. Налаштуйте Kubernetes auth: створіть роль, яка дозволяє Tekton SA отримувати конкретні секрети.
3. Використовуйте Vault Agent injector або CSI driver у Tekton Tasks, щоб монтовані секрети були доступні у runtime.
4. Для offline локальних викликів (ai_swarm) можна використовувати Vault CLI із short‑lived token (політика read для конкретного path).

## Security notes

- Не зберігайте master/root токени у CI. Використовуйте approle/OIDC або Kubernetes auth.
- Обмежте політики до мінімально необхідних шляхів (least privilege).
- Логи: ніколи не друкуйте секретів у CI logs; використовуйте redaction або secure logging.

Example policies and snippets are provided in `platform/vault/examples/` (create when ready).
HashiCorp Vault — integration notes
=================================

This directory contains notes and examples for integrating HashiCorp Vault into Tekton pipelines and cluster bootstrapping.

## Principles

- Do not store plain secrets in the repo. Use Vault to emit short‑lived credentials to CI/pipelines.
- Use Vault Agent Injector or CSI provider for in-cluster injection.
- Tekton can authenticate to Vault via Kubernetes service account + JWT (Kubernetes auth method) or via static token (CI env) — prefer Kubernetes auth for in-cluster tasks.

## Example approaches

1. Tekton + Vault Agent sidecar (in-pod):
   - Use Vault Agent Injector annotations on the Pod to mount secrets or to generate env vars from Vault paths.
   - Pros: secrets not written to disk in repo; cons: requires cluster-level controller and proper RBAC.

2. Tekton Task using Vault CLI (CI runner):
   - Store `VAULT_ADDR` and an auth method secret in CI (GitHub Actions secret or Vault token via OIDC) and pass to Task via Kubernetes secret.
   - Example Task snippet is provided in `tekton-vault-example.yaml`.

## Security notes

- Use least-privilege Vault policies scoped to the path the pipeline needs.
- Prefer dynamic credentials issuance (databases, cloud provider) and short TTL.
- For provisioning steps (Proxmox API tokens), use Vault to store tokens and inject into Tekton step securely.
