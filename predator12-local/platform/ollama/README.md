# Ollama (offline LLM) — quick guide

## Purpose

Run local LLM inference (Llama 3 / Mistral) without external API calls. Ollama provides a small runtime to host local models and serve inference via HTTP/CLI.

## Install & run (example)

1. Install Ollama (follow vendor docs). On macOS with Homebrew:

```bash
brew install ollama
```

2. Pull a model (example):

```bash
ollama pull llama3-8b-instruct
```

3. Run Ollama daemon:

```bash
ollama serve --port 11434 &
```

4. Example call from `ai_swarm.py` via CLI:

```python
# rc, out, err = run('ollama run llama3-8b-instruct "Generate a pytest for module X"')
```

## Best practices

- Host Ollama on dedicated inference nodes (tuned CPU/GPU/RAM) when models are large.
- Limit model access by network policies and authentication (run behind internal API gateway).
- For high availability, run multiple Ollama instances and use a small router to load-balance requests.
  Ollama (offline LLM) — deployment notes
  =======================================

This file contains notes about running Ollama as a local LLM runtime for offline inference.

## Key points

- Ollama can host local models (Mistral, LLaMA variants) and expose an HTTP API for inference.
- Prefer dedicated inference nodes (multi‑CPU, sufficient RAM, and optional GPU) in the cluster.
- Model storage: mount fast NVMe or SSD volumes and keep models on persistent storage.

## Deployment options

1. Run Ollama as a Kubernetes Deployment on dedicated worker nodes with nodeSelector and resource requests.
2. Run Ollama on bare-metal VMs outside Kubernetes and expose an internal-only endpoint for agents.

Example k8s snippet (minimal):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ollama
  namespace: ai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ollama
  template:
    metadata:
      labels:
        app: ollama
    spec:
      containers:
        - name: ollama
          image: ollama/ollama:latest
          resources:
            requests:
              cpu: "2000m"
              memory: "8Gi"
          volumeMounts:
            - name: models
              mountPath: /models
      volumes:
        - name: models
          persistentVolumeClaim:
            claimName: ollama-models-pvc
```

## Security

- Restrict access to Ollama API via network policies and service meshes.
- Log and audit model usage; store prompts only if necessary and with retention policies.
