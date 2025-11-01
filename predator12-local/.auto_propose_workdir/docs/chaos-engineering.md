# Chaos Engineering (Litmus)

Litmus — платформа для chaos engineering у Kubernetes.

## Встановлення
```bash
kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v3.0.0.yaml
```

## Приклад експерименту (pod-delete)
```yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: pod-delete
  namespace: default
spec:
  appinfo:
    appns: default
    applabel: 'app=your-app'
    appkind: deployment
  experiments:
    - name: pod-delete
```

[Документація Litmus](https://docs.litmuschaos.io/)
