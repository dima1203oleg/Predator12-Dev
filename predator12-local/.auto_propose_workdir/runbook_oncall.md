# Runbook — Autodeploy On-Call

Emergency steps

- Disable autopilot immediately:

```bash
sudo touch /var/run/autodeploy.disabled
```

- Re-enable:

```bash
sudo rm /var/run/autodeploy.disabled
```

- View last runs:

```bash
tail -n 200 manifests/.autodeploy/runs.log
```

- Force rollback via ArgoCD:

```bash
argocd app rollback predator-production --to-revision <rev>
```

- If ArgoCD unreachable — scale pods manually:

```bash
kubectl -n predator scale deployment predator --replicas=3
```

Contact and escalation

- SRE on-call: pager duty
- Engineering lead: slack #eng-alerts
