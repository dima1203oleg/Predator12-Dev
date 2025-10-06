# Velero (Backup)

Velero — це інструмент для резервного копіювання та відновлення кластерів Kubernetes.

## Встановлення

```bash
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm install velero vmware-tanzu/velero --namespace velero --create-namespace \
  --set configuration.provider=aws \
  --set configuration.backupStorageLocation.name=default \
  --set configuration.backupStorageLocation.bucket=<YOUR_BUCKET> \
  --set configuration.backupStorageLocation.config.region=<YOUR_REGION>
```

[Офіційна документація](https://velero.io/docs/)
