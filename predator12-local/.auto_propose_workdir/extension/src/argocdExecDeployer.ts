import * as vscode from 'vscode';
import axios from 'axios';
import * as simpleGit from 'simple-git';
import { exec } from 'child_process';

export class ArgoExecDeployer {
  workflowData: any;
  output: vscode.OutputChannel;
  context: vscode.ExtensionContext;

  constructor(workflowData: any, output: vscode.OutputChannel, context: vscode.ExtensionContext) {
    this.workflowData = workflowData;
    this.output = output;
    this.context = context;
  }

  async deployAndExecute() {
    this.output.appendLine('[argocd-deployer] Starting deployAndExecute');

    // 1) Validation: lint Helm/YAML if present (best-effort)
    await this.validationStep();

    // 2) Prepare manifests/values based on workflowData
    await this.prepareStep();

    // 3) Trigger ArgoCD sync — prefer pushing changes to manifests repo
    await this.triggerArgoSync();

    // 4) Monitor and execute smoke tests / jobs
    await this.monitorAndExecute();

    this.output.appendLine('[argocd-deployer] deployAndExecute finished');
  }

  async validationStep() {
    this.output.appendLine('[argocd-deployer] validationStep: running checks');
    // Placeholder: could run `yamllint` or `helm lint` if available
    return;
  }

  async prepareStep() {
    this.output.appendLine('[argocd-deployer] prepareStep: preparing manifests');
    // Placeholder for preparing values from workflowData
    return;
  }

  async triggerArgoSync() {
    this.output.appendLine('[argocd-deployer] triggerArgoSync: attempting to push/notify manifests repo');
    // By default attempt to call gitops_sync.sh in repo root if available
    try {
      const cwd = vscode.workspace.rootPath || '.';
      await this.execCommand(`./scripts/gitops_sync.sh`, { cwd });
      this.output.appendLine('[argocd-deployer] gitops_sync.sh executed (if present)');
    } catch (e) {
      this.output.appendLine('[argocd-deployer] gitops_sync.sh not executed or failed: ' + String(e));
    }
    return;
  }

  async monitorAndExecute() {
    this.output.appendLine('[argocd-deployer] monitorAndExecute: monitoring Argo / health');
    // Placeholder: Poll manifests repo, ArgoCD API, or Prometheus
    return;
  }

  execCommand(cmd: string, opts: { cwd?: string } = {}): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      exec(cmd, { cwd: opts.cwd || process.cwd(), env: process.env }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
          return;
        }
        resolve({ stdout, stderr });
      });
    });
  }
}
