# Security

## Secrets scanning

- Рекомендується використовувати TruffleHog для пошуку секретів у репозиторії.
- Запуск:

```bash
pip install trufflehog
trufflehog filesystem .
```

## Інші рекомендації

- Використовуйте Vault для зберігання секретів (див. `security/vault/`).
- Використовуйте Falco для моніторингу безпеки (див. `security/falco/`).
- Використовуйте Istio для захисту мережі (див. `security/istio/`).
