#!/usr/bin/env bash
set -euo pipefail

PROG_NAME="proxmox_provision.sh"
usage() {
  cat <<EOF
Usage: $PROG_NAME [--cluster-name NAME] [--nodes N] [--role k3s|rke2] [--template TEMPLATE] [--ssh-key-file PATH] [--dry-run] [--execute]

This script is a safe, non-destructive template to provision VMs on Proxmox VE using the HTTP API.
By default it runs in --dry-run mode and prints planned API payloads. To actually call the API, set
PROXMOX_API_TOKEN or PROXMOX_USER/PROXMOX_PASSWORD and pass --execute.

Environment variables (preferred):
  PROXMOX_HOST        e.g. https://proxmox.example:8006
  PROXMOX_API_TOKEN   preferred: 'user@pam!tokenid=..' style token
  or PROXMOX_USER & PROXMOX_PASSWORD

Examples:
  # dry-run (safe)
  ./scripts/provision/proxmox_provision.sh --cluster-name demo --nodes 3 --role k3s --dry-run

  # real execution (ensure credentials available)
  PROXMOX_API_TOKEN="..." ./scripts/provision/proxmox_provision.sh --cluster-name demo --nodes 3 --role rke2 --execute

EOF
}

CLUSTER_NAME="demo"
NODES=1
ROLE="k3s"
TEMPLATE="local:vztmpl/ubuntu-22.04-server-cloudimg" # example placeholder
SSH_KEY_FILE=""
DRY_RUN=1
EXECUTE=0

while (("$#")); do
  case "$1" in
    --cluster-name) CLUSTER_NAME="$2"; shift 2;;
    --nodes) NODES="$2"; shift 2;;
    --role) ROLE="$2"; shift 2;;
    --template) TEMPLATE="$2"; shift 2;;
    --ssh-key-file) SSH_KEY_FILE="$2"; shift 2;;
    --dry-run) DRY_RUN=1; shift;;
    --execute) EXECUTE=1; DRY_RUN=0; shift;;
    --help) usage; exit 0;;
    *) echo "Unknown arg: $1" >&2; usage; exit 4;;
  esac
done

echo "[provision] cluster=${CLUSTER_NAME} nodes=${NODES} role=${ROLE} template=${TEMPLATE} dry-run=${DRY_RUN} execute=${EXECUTE}" >&2

if [ -n "$SSH_KEY_FILE" ] && [ ! -f "$SSH_KEY_FILE" ]; then
  echo "[provision] error: ssh key file not found: $SSH_KEY_FILE" >&2; exit 4
fi

# Build a simple payload per node (this is a template; adapt storage, cpu, memory, networks)
generate_payload() {
  local idx=$1
  cat <<JSON
{
  "vmid": null,
  "name": "${CLUSTER_NAME}-${ROLE}-${idx}",
  "template": "${TEMPLATE}",
  "memory": 4096,
  "cores": 2,
  "net0": "virtio,bridge=vmbr0",
  "scsi0": "local-lvm:32",
  "sshkeys": "$( if [ -n "$SSH_KEY_FILE" ]; then sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/\\n/g' "$SSH_KEY_FILE"; fi )"
}
JSON
}

if [ "$DRY_RUN" = "1" ]; then
  echo "[provision] DRY RUN - no API calls will be performed" >&2
  for i in $(seq 1 $NODES); do
    echo "--- planned node #$i ---"
    generate_payload $i
  done
  exit 0
fi

# Execution path: require credentials
if [ -z "${PROXMOX_HOST:-}" ]; then
  echo "[provision] error: PROXMOX_HOST not set" >&2; exit 2
fi

if [ -z "${PROXMOX_API_TOKEN:-}" ] && { [ -z "${PROXMOX_USER:-}" ] || [ -z "${PROXMOX_PASSWORD:-}" ]; }; then
  echo "[provision] error: PROXMOX_API_TOKEN or PROXMOX_USER/PROXMOX_PASSWORD must be set to execute" >&2; exit 2
fi

PROXMOX_HOST_CLEAN="${PROXMOX_HOST%/}"

call_api() {
  local node_payload="$1"
  # Example: create VM via POST to /api2/json/nodes/{node}/qemu
  # This script does not assume a particular Proxmox cluster node name. In production you should
  # determine the target Proxmox node (physical host) and storage. This is a template only.

  if [ -n "${PROXMOX_API_TOKEN:-}" ]; then
    AUTH_HEADER=("Authorization: PVEAPIToken=${PROXMOX_API_TOKEN}")
  else
    # basic auth fallback (not recommended)
    AUTH_HEADER=("-u" "$PROXMOX_USER:$PROXMOX_PASSWORD")
  fi

  echo "[provision] would POST to ${PROXMOX_HOST_CLEAN}/api2/json/... with payload:" >&2
  echo "$node_payload"

  # NOTE: actual API URL and parameters depend on your Proxmox topology. For safety we show the payload
  # and perform a dry-run unless you adapt the endpoint here.

  # Example curl call (commented out by default):
  # curl -sS -X POST "${PROXMOX_HOST_CLEAN}/api2/json/nodes/<target-node>/qemu" \
  #   -H "Content-Type: application/json" \
  #   -H "${AUTH_HEADER}" \
  #   --data "$node_payload"

  # For template, return success code for now
  return 0
}

for i in $(seq 1 $NODES); do
  payload=$(generate_payload $i)
  call_api "$payload" || { echo "[provision] api call failed for node #$i" >&2; exit 3; }
done

echo "[provision] finished (template mode - adapt API endpoint to actually create VMs)" >&2
exit 0
#!/usr/bin/env bash
set -euo pipefail

# Proxmox provisioning helper (template)
# - This script is a safe, parametric template that uses Proxmox REST API to create VMs
# - Requires: PROXMOX_HOST, PROXMOX_USER, PROXMOX_PASSWORD or PROXMOX_API_TOKEN
# - Uses cloud-init ISO approach or cloud-init user-data injection depending on template
# - Supports selecting distro/template, cpu, memory, disks, network, ssh key, and role (k3s/rke2)
#
# IMPORTANT: This is a template and will not run successfully until you fill in the cluster-specific
# variables and ensure network/credentials are correct. It deliberately avoids destructive defaults.

PROG=$(basename "$0")
usage(){
  cat <<EOF
Usage: $PROG [--template TEMPLATE] --cluster-name NAME --nodes N --role {k3s|rke2} [--ssh-key-file FILE] [--dry-run]

Environment variables accepted (preferred):
  PROXMOX_HOST     Proxmox API host (https://proxmox.example:8006)
  PROXMOX_USER     proxmox user (e.g., root@pam)
  PROXMOX_PASSWORD proxmox password (or set PROXMOX_API_TOKEN)
  PROXMOX_API_TOKEN token in form "user@realm!tokenid=secrettoken" (optional)

This script is non-interactive and returns explicit exit codes:
  0 success (or dry-run ok)
  10 missing credentials
  11 invalid args
  20 http/api error
EOF
  exit 11
}

TEMPLATE="ubuntu-22-cloudinit"
CLUSTER_NAME=""
NODES=1
ROLE="k3s"
SSH_KEY_FILE=""
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case $1 in
    --template) TEMPLATE="$2"; shift 2;;
    --cluster-name) CLUSTER_NAME="$2"; shift 2;;
    --nodes) NODES="$2"; shift 2;;
    --role) ROLE="$2"; shift 2;;
    --ssh-key-file) SSH_KEY_FILE="$2"; shift 2;;
    --dry-run) DRY_RUN=1; shift 1;;
    -h|--help) usage;;
    *) echo "Unknown arg: $1" >&2; usage;;
  esac
done

if [[ -z "$CLUSTER_NAME" ]]; then
  echo "ERROR: --cluster-name is required" >&2
  usage
fi

# Credentials precedence: API token or user+password
if [[ -z "${PROXMOX_API_TOKEN:-}" ]]; then
  if [[ -z "${PROXMOX_HOST:-}" || -z "${PROXMOX_USER:-}" || -z "${PROXMOX_PASSWORD:-}" ]]; then
    echo "ERROR: Missing Proxmox credentials. Set PROXMOX_API_TOKEN or PROXMOX_HOST/PROXMOX_USER/PROXMOX_PASSWORD" >&2
    exit 10
  fi
fi

echo "Provisioning plan: cluster=${CLUSTER_NAME}, nodes=${NODES}, role=${ROLE}, template=${TEMPLATE}, dry-run=${DRY_RUN}"

if [[ $DRY_RUN -eq 1 ]]; then
  echo "DRY RUN: no calls to Proxmox API will be made. Exiting with success code."
  exit 0
fi

# Helper: call Proxmox API (very small wrapper). We use curl and expect PROXMOX_API_TOKEN or basic auth
pm_api_call(){
  local method="$1" urlpath="$2" data="${3:-}"
  if [[ -n "${PROXMOX_API_TOKEN:-}" ]]; then
    auth_header=( -H "Authorization: PVEAPIToken=${PROXMOX_API_TOKEN}" )
  else
    auth_header=( -u "${PROXMOX_USER}:${PROXMOX_PASSWORD}" )
  fi
  fullurl="${PROXMOX_HOST%/}/api2/json${urlpath}"
  if [[ -n "$data" ]]; then
    curl -fsS -X "$method" "${auth_header[@]}" -H 'Content-Type: application/json' -d "$data" "$fullurl"
  else
    curl -fsS -X "$method" "${auth_header[@]}" "$fullurl"
  fi
}

# NOTE: The following steps are intentionally minimal and must be adjusted to your Proxmox layout.
# 1) find node (proxmox host node name) — we'll pick the first available node from /nodes
node_name=$(pm_api_call GET "/nodes" | jq -r '.data[0].node' || true)
if [[ -z "$node_name" || "$node_name" == "null" ]]; then
  echo "ERROR: cannot determine Proxmox node. Inspect PROXMOX_HOST and credentials." >&2
  exit 20
fi

echo "Using Proxmox node: $node_name"

# 2) iterate and create VMs (cloud-init). This minimal template will create VM ids incrementally.
for i in $(seq 1 "$NODES"); do
  vmid_template="$(date +%s)$i"
  vmname="${CLUSTER_NAME}-${ROLE}-${i}"
  echo "Creating VM: $vmname (template: $TEMPLATE)"

  # Example payload (adjust to your template / storage). This is a placeholder.
  payload=$(jq -n --arg name "$vmname" --arg template "$TEMPLATE" '{name:$name, template:$template, cores:2, memory:2048}')

  # POST to /nodes/{node}/qemu (this is placeholder; actual API requires many params)
  resp=$(pm_api_call POST "/nodes/${node_name}/qemu" "$payload" 2>&1) || { echo "API error creating VM: $resp" >&2; exit 20; }
  echo "Created VM request: $resp"
  sleep 1
done

echo "Provisioning requests submitted. Manual verification or cloud-init steps may be required to finish cluster bootstrap."
exit 0
