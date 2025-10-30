# Predator Autonomous Argo CD Cycle — VS Code extension (scaffold)

This folder contains a scaffold for a VS Code extension that will implement a fully autonomous Argo CD deploy → execute → verify cycle.

What is included:

- `package.json` — extension metadata and scripts
- `tsconfig.json` — TypeScript configuration
- `src/extension.ts` — activation entrypoint (registers `extension.autodeploy.toProd`)
- `src/argocdAutoDeployer.ts` — scaffold for full autonomous cycle
- `src/copilotAutoInterceptor.ts` — stub for Copilot auto-accept logic
- `.vscode/tasks.json` — simple task for running the extension output
- `argo-autoconfig.json` — example configuration

How to build (local developer):

1. cd into `extension` and install dependencies:

```bash
cd extension
npm install
npm run build
```

2. Run extension in the Extension Development Host via VS Code.

Notes:

- This is a scaffold — all Argo/GitHub/Prometheus interactions are placeholders and must be implemented securely.
- Do not enable full autonomous mode on production clusters until reviewed and audited.

# Predator Autodeploy (Argo) — extension scaffold

This folder contains a scaffold for a VS Code extension that implements a fully autonomous Argo CD deploy → execute → verify cycle. The code is intentionally a safe scaffold (dry-run behavior by default).

Important notes:

- This scaffold does not perform any destructive actions. To enable real actions, set environment variable `EXTENSION_ALLOW_RUN=1` and implement the real Argo/GitHub/Kubernetes integrations.
- Fully autonomous deployment is high-risk. Review security and governance policies before enabling auto-run in production.

Files:

- `package.json` — VS Code extension manifest (scaffold)
- `src/extension.ts` — entrypoint registering the command `extension.autodeploy.toProd`
- `src/argocdAutoDeployer.ts` — scaffolded deployer with dry-run behavior
- `src/copilotAutoInterceptor.ts` — stub for Copilot auto-accept; requires careful review
- `.vscode/tasks.json` — sample task
- `argo-autoconfig.json` — example configuration

How to build (local dev):

1. cd extension
2. npm install
3. npm run build
4. Launch Extension Development Host from VS Code

Security: do not store tokens in plaintext. Use VS Code SecretStorage or OS secret manager.

# Predator Autonomous Argo CD Deploy (VS Code extension scaffold)

This folder contains a minimal scaffold for the VS Code extension that automates deploy-and-execute flows using Argo CD and GitHub workflows.

What is included:

- `package.json` — extension metadata & dependencies
- `src/extension.ts` — activation entrypoint and basic wiring
- `src/argocdExecDeployer.ts` — high-level orchestrator (placeholders)
- `src/copilotExecInterceptor.ts` — small interceptor stub for Copilot suggestions
- `.vscode/tasks.json` — helper dev task
- `argo-exec-config.json` — example config file

Notes:

- This is a scaffold. The deployer contains placeholders and must be extended to securely call Argo CD API and GitHub API, manage tokens, and implement full workflows.
- For packaging, run `npm install` then `npm run build` in the `extension/` folder. Use `vsce` to package to a `.vsix`.
