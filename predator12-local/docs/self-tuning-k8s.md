# Self-tuning Kubernetes (VPA/HPA + ML)

## VPA (Vertical Pod Autoscaler)
```bash
kubectl apply -f https://github.com/kubernetes/autoscaler/releases/latest/download/vertical-pod-autoscaler.yaml
```

## HPA (Horizontal Pod Autoscaler)
- Вже вбудований у Kubernetes, можна активувати autoscaling у Helm values.

## ML-based Autoscaling
- Використовуйте [KEDA](https://keda.sh/) для autoscaling на основі кастомних метрик.
- Для ML-автоскейлінгу — інтегруйте Prometheus Adapter + Grafana ML anomaly detection для автоматичного масштабування на основі аномалій.

[Документація VPA](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler) | [KEDA](https://keda.sh/docs/)
