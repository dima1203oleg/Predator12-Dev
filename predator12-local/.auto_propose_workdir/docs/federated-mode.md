# Federated Mode (Government/Enterprise)

Federated Mode — розгортання ізольованих інстансів Predator Analytics для різних організацій/регіонів з можливістю синхронізації знань.

## Основні підходи
- Кожен інстанс має власну інфраструктуру (Kubernetes, бази даних, AI-моделі).
- Синхронізація knowledge graph, моделей, аналітики через захищені канали (VPN, Zero Trust).
- Можливість централізованого оновлення моделей через secure pull/push.

## Інструкція для розгортання
1. Розгорніть Predator Analytics у кожному регіоні/організації (Helm, Terraform, ArgoCD).
2. Налаштуйте secure sync (VPN, WireGuard, Zero Trust overlay).
3. Використовуйте knowledge_graph.json для обміну знаннями (можна через MinIO/S3, API, або git).
4. Для централізованого оновлення моделей використовуйте MLflow registry або DVC.

[Детальніше — у документації](../documentation/)
