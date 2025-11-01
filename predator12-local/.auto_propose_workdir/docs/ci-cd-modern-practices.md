# CI/CD інтеграція сучасних практик

## Автоматичне розгортання OPA/Kyverno, Crossplane, Litmus, KEDA

Додайте наступні кроки у ваш CI/CD pipeline (наприклад, GitHub Actions):

```yaml
- name: Deploy OPA
  run: |
    helm repo add stable https://charts.helm.sh/stable
    helm upgrade --install opa stable/opa --namespace opa --create-namespace
- name: Deploy Kyverno
  run: |
    helm repo add kyverno https://kyverno.github.io/kyverno/
    helm upgrade --install kyverno kyverno/kyverno -n kyverno --create-namespace
- name: Deploy Crossplane
  run: |
    helm repo add crossplane-stable https://charts.crossplane.io/stable
    helm upgrade --install crossplane crossplane-stable/crossplane --namespace crossplane-system --create-namespace
- name: Deploy Litmus
  run: |
    kubectl apply -f https://litmuschaos.github.io/litmus/litmus-operator-v3.0.0.yaml
- name: Deploy KEDA
  run: |
    helm repo add kedacore https://kedacore.github.io/charts
    helm upgrade --install keda kedacore/keda --namespace keda --create-namespace
```

## Автоматичне оновлення Knowledge Graph/документації

- Додавайте крок для генерації документації (наприклад, Docusaurus build) та оновлення knowledge graph після кожного мерджу у main/master.

[Детальніше у документації](../documentation/)
