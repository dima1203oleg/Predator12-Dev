#!/bin/bash
# Vault bootstrap script (minimal example)
export VAULT_ADDR='http://127.0.0.1:8200'
vault operator init -key-shares=1 -key-threshold=1 > /tmp/vault_init.txt
vault operator unseal $(grep 'Unseal Key 1:' /tmp/vault_init.txt | awk '{print $NF}')
vault login $(grep 'Initial Root Token:' /tmp/vault_init.txt | awk '{print $NF}')
vault secrets enable -path=secret kv
vault policy write admin - <<EOF
path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF
