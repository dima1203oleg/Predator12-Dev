# Proxmox provisioning (template)

Ця тека містить шаблони та інструкції для провізіонінгу віртуальних машин у Proxmox VE як основу для розгортання кластерів K3s (dev/edge) і RKE2 (prod).

## Файли

- `../../scripts/provision/proxmox_provision.sh` — безпечний шаблонний скрипт для створення VM через Proxmox API. За замовчуванням він працює у `--dry-run` і лише виводить payload для кожного вузла.

## Швидкий старт (dry-run)

1. Зробіть скрипт виконуваним, якщо ще не виконували:

```bash
chmod +x scripts/provision/proxmox_provision.sh
```

2. Запустіть dry-run (нічого не створюється):

```bash
./scripts/provision/proxmox_provision.sh --cluster-name demo --nodes 3 --role k3s --dry-run
```

## Реальне виконання

1. Встановіть креденшіали (рекомендовано: `PROXMOX_API_TOKEN`):

```bash
export PROXMOX_HOST="https://proxmox.example:8006"
export PROXMOX_API_TOKEN="user@pam!tokid=..."
```

2. Запустіть з `--execute`:

```bash
PROXMOX_API_TOKEN="..." ./scripts/provision/proxmox_provision.sh --cluster-name demo --nodes 3 --role rke2 --execute
```

## Примітки

- Скрипт — шаблон. Вам потрібно адаптувати endpoint API (цільовий Proxmox node), storage, мережеві налаштування і cloud-init userdata для вашої інфраструктури.
- Для повної автоматизації рекомендується: зберігати Proxmox токени у Vault і використовувати їх у CI (Tekton Tasks) через монтований token.
- Перед тим, як запускати у production, перевірте payload і логіку створення VM на тестовому Proxmox оточенні.
  Proxmox + K3s/RKE2 provisioning — overview
  =========================================

This directory contains guidance and helpers for provisioning Kubernetes clusters on Proxmox VE.

## Goals

- Allow quick creation of dev/test clusters using K3s.
- Allow secure creation of production clusters using RKE2.
- Provide a template script that can be adapted to your Proxmox environment.

## Files

- `../../scripts/provision/proxmox_provision.sh` — template script that uses the Proxmox API to create VMs with cloud-init and returns explicit exit codes. Edit and adapt to your environment.

## High-level flow

1. Prepare Proxmox templates (cloud-init enabled images) or use an existing template that supports cloud-init.
2. Ensure an SSH key is available and authorized for the VMs.
3. Export/define the following env vars before running the script:
   - `PROXMOX_HOST` (e.g., https://proxmox.example:8006)
   - `PROXMOX_USER` (e.g., root@pam)
   - `PROXMOX_PASSWORD` or `PROXMOX_API_TOKEN`
4. Run a dry-run first:

```bash
PROXMOX_HOST="https://pve.example:8006" \
PROXMOX_API_TOKEN="user@pam!tokid=..." \
./scripts/provision/proxmox_provision.sh --cluster-name test1 --nodes 3 --role k3s --dry-run
```

5. If dry-run output looks good, run for real (be careful):

```bash
PROXMOX_HOST="https://pve.example:8006" \
PROXMOX_API_TOKEN="user@pam!tokid=..." \
./scripts/provision/proxmox_provision.sh --cluster-name test1 --nodes 3 --role k3s
```

## Bootstrap K3s / RKE2

- After VMs are created, you must bootstrap the cluster. Options:
  - Use cloud-init user-data to run a small bootstrap script that installs k3s (or rke2) and joins the cluster.
  - Use a controller machine and run `k3sup`, `rke2` installer, or an SSH-based script to configure control plane and join workers.

## Security notes

- The script is a template: do not store PROXMOX_PASSWORD in plain text in repo; use Vault or CI secrets.
- For production, prefer `PROXMOX_API_TOKEN` with restricted scope.

## Next steps (recommended)

1. Create a Tekton Task wrapper to call the script for IaC-driven provisioning (requires secure storage of Proxmox credentials).
2. Add cloud-init templates for K3s and RKE2 that include a minimal bootstrap to join the cluster and install necessary agents (SealedSecrets controller, Vault Agent Injector, metrics pipelines).
3. Add a runbook for rollback and node lifecycle management.
