# Автоматична генерація документації та knowledge graph

## Docusaurus автогенерація

1. Додайте у CI/CD pipeline крок для генерації документації:
```yaml
- name: Build Docusaurus docs
  run: |
    cd documentation/docusaurus
    npm install
    npm run build
```
2. Для автопублікації на GitHub Pages або інший хостинг використовуйте офіційний Docusaurus GitHub Action.

## Knowledge Graph автогенерація

- Використовуйте Sourcegraph Cody або власний скрипт на базі OpenAI/HuggingFace embeddings для побудови knowledge graph по коду.
- Додавайте крок у CI/CD для оновлення knowledge graph після кожного мерджу:
```yaml
- name: Update Knowledge Graph
  run: |
    python scripts/generate_knowledge_graph.py
```

[Документація Docusaurus](https://docusaurus.io/docs/deployment) | [Sourcegraph Cody](https://sourcegraph.com/cody)
