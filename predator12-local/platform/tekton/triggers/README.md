Tekton Triggers — quick deploy and required secrets
===============================================

Ці файли створюють мінімальний набір ресурсів для запуску Tekton EventListener у кластері та забезпечують повністю автоматичний pipeline: push → build → scan → manifest update → auto-merge → ArgoCD sync.

Файли в цій теці:

- `sa.yaml` — Namespace `tekton-pipelines`, ServiceAccount `tekton-triggers-sa`, Role і RoleBinding.
- `pvc.yaml` — PersistentVolumeClaim `tekton-workspace-pvc` для shared workspace.
- Інші Tekton ресурси (EventListener, TriggerTemplate, TriggerBinding, Tasks, Pipeline) вже присутні в `platform/tekton/`.

Що потрібно зробити у кластері (швидка інструкція)
------------------------------------------------
1. Застосувати ресурси у кластері з привілейованого облікового запису адміністратора:

```bash
kubectl apply -f platform/tekton/triggers/sa.yaml
kubectl apply -f platform/tekton/triggers/pvc.yaml
kubectl apply -f platform/tekton/triggers/eventlistener.yaml
kubectl apply -f platform/tekton/triggers/triggertemplate.yaml
kubectl apply -f platform/tekton/triggers/triggerbinding.yaml
```

2. Переконайтесь, що Tekton Pipelines і Tekton Triggers встановлені у кластері і працюють.

3. Налаштуйте ingress або port-forward до `EventListener` сервісу, щоб GitHub webhook міг надсилати події.

4. У GitHub репозиторії Source Repo додайте Webhook, що вказує на EventListener URL (POST):

   - Content type: `application/json`
   - Events: `Push` (і/або Pull request)

Необхідні GitHub Secrets / CI Secrets (створіть у репозиторії/організації)
-------------------------------------------------------------------
- `ARGO_AUTH_TOKEN` — токен для Argo CD (використовується для non-interactive argocd CLI у workflow/opsctl).
- `MANIFESTS_REPO` — SSH/git URL або HTTPS URL до Manifests Repo (те, куди pipeline пушить оновлення).
- `REGISTRY_HOST` — адреса реєстру образів (registry.example.com).
- `REGISTRY_USERNAME` / `REGISTRY_PASSWORD` або `DOCKER_CONFIG_JSON` — для push з Kaniko (запакуйте dockerconfigjson у secret)
- `GIT_SSH_KEY` — приватний SSH ключ, якщо pipeline пушить у manifests через SSH (альтернативно використайте GitHub App).
- `VAULT_ADDR` / `VAULT_ROLE` — якщо використовуєте HashiCorp Vault для секретів у pipeline.

Рекомендований CI flow для повної автоматизації
---------------------------------------------
1. Push у Source Repo → GitHub webhook → Tekton EventListener
2. Tekton Pipeline: clone → build (kaniko) → trivy scan → sbom → manifest-update → create-manifests-pr (auto-merge)
3. GitHub Actions workflow (nonstop) або Tekton pipeline може викликати `./scripts/opsctl maybe-release` з `AUTO_MERGE=1` і `MANIFESTS_REPO` заданим.
4. Argo CD синхронізує Manifests Repo і deploy'ить оновлення у потрібне середовище.

Тестовий dry-run (локальний)
----------------------------
Перед тим як включати AUTO_MERGE у продакшн, перевірте dry-run:

```bash
export OPS_GIT_URL="git@github.com:org/service-repo.git"
export OPS_IMAGE="registry.example.com/service:ci-$(git rev-parse --short HEAD)"
export KUBECONFIG="$HOME/.kube/config"
export DRY_RUN=1
./scripts/opsctl build-test-scan

# запустити maybe-release у dry-run
AUTO_MERGE=0 MANIFESTS_REPO="git@github.com:org/manifests-repo.git" OPS_IMAGE="$OPS_IMAGE" ./scripts/opsctl maybe-release --env prod --timebox 1h
```

Після всіх цих кроків pipeline буде виконуватися без вашого участі (auto-merge + auto-deploy) — за умови що секрети і права налаштовані.

Примітка про безпеку
---------------------
Ви дали інструкцію про повну автоматизацію без зупинок. Це виконано у конфігураціях: `AUTO_MERGE=1` дозволяє прямий push/merge у Manifests Repo і запускає `argocd app sync`.

Хоча ви віддаєте перевагу швидкості та автоматизації, рекомендую мати:
- snapshot/backup strategy (Velero),
- збереження SBOM і звітів (MinIO/S3),
- механізм emergency rollback доступний операторам (kubectl/argocd rollback) — навіть якщо система не запитує дозволу перед деплоєм.
