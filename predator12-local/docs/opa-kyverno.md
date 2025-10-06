# OPA/Kyverno Policy-as-Code

## OPA (Open Policy Agent)

- Встановлення:
  ```bash
  helm repo add stable https://charts.helm.sh/stable
  helm install opa stable/opa --namespace opa --create-namespace
  ```
- Додайте policy у вигляді rego-файлів у репозиторій (приклад: deny privileged containers).

## Kyverno

- Встановлення:
  ```bash
  kubectl create namespace kyverno
  helm repo add kyverno https://kyverno.github.io/kyverno/
  helm install kyverno kyverno/kyverno -n kyverno
  ```
- Приклад policy (deny privileged containers):
  ```yaml
  apiVersion: kyverno.io/v1
  kind: ClusterPolicy
  metadata:
    name: deny-privileged
  spec:
    validationFailureAction: enforce
    rules:
      - name: validate-privileged
        match:
          resources:
            kinds:
              - Pod
        validate:
          message: "Privileged mode is not allowed."
          pattern:
            spec:
              containers:
                - =(securityContext):
                    =(privileged): false
  ```

[OPA docs](https://www.openpolicyagent.org/docs/latest/) | [Kyverno docs](https://kyverno.io/policies/)
