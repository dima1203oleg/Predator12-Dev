# Automation helpers

This folder contains a minimal self-learning agent and helpers for the Autodeploy pipeline.

Files:

- `selfLearningAgent.py` — basic clustering/analysis of run logs (optional dependency on scikit-learn).

Usage:

1. Ensure `manifests/.autodeploy/runs.log` exists and contains JSON lines per run.
2. Run the agent periodically (cron, container): `python3 automation/selfLearningAgent.py`.

Notes:

- This is an experimental, rule-based starter. Replace with more robust pipelines when ready.
