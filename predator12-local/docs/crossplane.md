# Crossplane (Self-healing Infrastructure)

Crossplane — Kubernetes-native control plane для керування інфраструктурою через CRD.

## Встановлення
```bash
kubectl create namespace crossplane-system
helm repo add crossplane-stable https://charts.crossplane.io/stable
helm install crossplane --namespace crossplane-system crossplane-stable/crossplane
```

## Приклад ресурсу (S3 Bucket)
```yaml
apiVersion: s3.aws.crossplane.io/v1beta1
kind: Bucket
metadata:
  name: example-bucket
spec:
  forProvider:
    locationConstraint: us-west-2
  providerConfigRef:
    name: example
```

[Документація Crossplane](https://docs.crossplane.io/)
