# Keycloak OIDC integration (overview)

Use Keycloak as identity provider for Kubernetes (OIDC) and for developers (SSO).

## High level

- Deploy Keycloak in a secure namespace or use an external managed instance.
- Create a realm `predator12` and clients for:
  - `kubernetes` (OIDC client) — used by kube-apiserver for authentication mapping.
  - `ci` (for CI OIDC flows if needed).

## Kubernetes OIDC config (apiserver flags)

Add to kube-apiserver:

--oidc-issuer-url=https://keycloak.example/auth/realms/predator12
--oidc-client-id=kubernetes
--oidc-username-claim=preferred_username
--oidc-groups-claim=groups

## RBAC mapping

Create Roles/RoleBindings mapping Keycloak groups to Kubernetes roles. Example:

kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
name: devs-binding
namespace: predator-stage
subjects:

- kind: Group
  name: developers
  roleRef:
  kind: Role
  name: developer-role
  apiGroup: rbac.authorization.k8s.io

## Notes

- Use short‑lived tokens and enforce MFA in Keycloak for operator accounts.
- Integrate Keycloak with GitHub SSO if desired for convenience.
  Keycloak — OIDC and Kubernetes API integration notes
  ===============================================

This file explains how to integrate Keycloak as an OIDC provider for Kubernetes and to use Keycloak for RBAC-driven access.

1. Kubernetes API OIDC config (kube-apiserver)
   - kube-apiserver flags:
     --oidc-issuer-url=https://keycloak.example/auth/realms/<realm>
     --oidc-client-id=kubernetes
     --oidc-username-claim=preferred_username
     --oidc-groups-claim=groups

   - Create a Keycloak client `kubernetes` with the issuer set to realm and enable `Service Accounts` or public as appropriate.

2. Keycloak realm & clients
   - Create realm `predator`.
   - Create client `kubernetes` (openid) and configure redirect URIs as needed for login flows.
   - Use groups/roles mapping to claims that will be used by Kubernetes RBAC.

3. RBAC mapping example
   - Create ClusterRole and ClusterRoleBinding that reference subjects by group claim, e.g.:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: dev-team-binding
subjects:
  - kind: Group
    apiGroup: rbac.authorization.k8s.io
    name: developers
roleRef:
  kind: ClusterRole
  name: edit
  apiGroup: rbac.authorization.k8s.io
```

4. CI / agent authentication
   - For Tekton and other controllers, prefer Kubernetes service accounts mapped to Keycloak groups via an admin process, or use Vault-stored service credentials.

## Security notes

- Protect Keycloak admin credentials and enable TLS. Use OIDC tokens with short TTLs.
- When enabling Keycloak, plan for RBAC audits and group lifecycle.
