SealedSecrets — pattern and example
=================================

Use Bitnami SealedSecrets to store encrypted Kubernetes Secret manifests in Git safely.

Pattern
-------
1. Install SealedSecrets controller in the cluster (it creates a private key only available in-cluster).
2. Locally, encrypt secrets with `kubeseal --controller-name sealed-secrets --controller-namespace kube-system` producing a `SealedSecret` YAML.
3. Commit `SealedSecret` to the manifests repo. Argo CD will apply it; controller will decrypt and create a real Secret in the cluster.

Example (local encrypt):

```bash
kubectl create secret generic db-creds --from-literal=username=admin --from-literal=password='s3cr3t' --dry-run=client -o yaml > db-secret.yaml
kubeseal --format yaml < db-secret.yaml > sealed-db-secret.yaml
git add sealed-db-secret.yaml && git commit -m "add sealed secret for db" && git push
```

Security notes
--------------
- Protect access to the SealedSecrets controller key (it's stored in the cluster). The repo can be public-safe for SealedSecrets.
- Rotate keys periodically; have a key-backup/restore plan.
