import * as vscode from 'vscode';
import { ArgoAutoDeployer } from './argocdAutoDeployer';
import * as yaml from 'js-yaml';

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel('Predator Autodeploy');
  output.appendLine('Predator Autodeploy extension activated');

  const disposable = vscode.commands.registerCommand('extension.autodeploy.toProd', async () => {
    output.appendLine('Autonomous Argo CD cycle started');
    try {
      // try to read workflow if exists
      let workflowData: any = {};
      try {
        const uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0].uri || vscode.Uri.file('.'), '.github/workflows/prod.yml');
        const raw = await vscode.workspace.fs.readFile(uri);
        workflowData = yaml.load(Buffer.from(raw).toString('utf8'));
        output.appendLine('Loaded workflow data');
      } catch (err) {
        output.appendLine('No prod workflow found or unable to read, proceeding with defaults');
      }

      const deployer = new ArgoAutoDeployer(workflowData, output);
      const result = await deployer.runFullAutonomousCycle();
      if (result.verified) {
        output.appendLine('Production verified autonomously — tagging');
        // tagging could be implemented by deployer
      } else {
        output.appendLine('Verification failed — rollback executed');
      }
    } catch (e: any) {
      output.appendLine('Autodeploy failed: ' + (e && e.message ? e.message : String(e)));
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
import * as vscode from 'vscode';
import { ArgoAutoDeployer } from './argocdAutoDeployer';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const channel = vscode.window.createOutputChannel('Predator Autodeploy');
  context.subscriptions.push(channel);

  const disposable = vscode.commands.registerCommand('extension.autodeploy.toProd', async () => {
    channel.appendLine('[autodeploy] Activation received — starting autonomous Argo CD cycle (scaffold/dry-run mode).');

    // Load config if present
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const root = workspaceFolders && workspaceFolders[0] ? workspaceFolders[0].uri.fsPath : process.cwd();
    const wfPath = path.join(root, '.github', 'workflows', 'prod.yml');

    let workflowData: any = {};
    try {
      if (fs.existsSync(wfPath)) {
        const raw = fs.readFileSync(wfPath, 'utf8');
        workflowData = yaml.load(raw) || {};
        channel.appendLine('[autodeploy] Loaded workflow data from .github/workflows/prod.yml');
      } else {
        channel.appendLine('[autodeploy] Warning: workflow file not found — proceeding with defaults');
      }
    } catch (err: any) {
      channel.appendLine('[autodeploy] Failed to parse workflow file: ' + String(err));
    }

    const deployer = new ArgoAutoDeployer(workflowData, { output: channel, rootPath: root });

    // Run background cycle — default is DRY_RUN unless EXTENSION_ALLOW_RUN=1
    deployer.runFullAutonomousCycle().then((res) => {
      channel.appendLine(`[autodeploy] cycle finished: verified=${res.verified}`);
      if (res.verified) {
        channel.appendLine('[autodeploy] Production verified. (scaffold did not create real tags)');
      } else {
        channel.appendLine('[autodeploy] Production NOT verified — rollback simulated.');
      }
    }).catch((e) => {
      channel.appendLine('[autodeploy] Error during cycle: ' + String(e));
    });

    vscode.window.showInformationMessage('Autonomous Argo CD cycle initiated (scaffold/dry-run).');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  // cleanup if required
}
import * as vscode from 'vscode';
import { ArgoExecDeployer } from './argocdExecDeployer';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.autodeploy.toProd', async () => {
    const output = vscode.window.createOutputChannel('Predator Autodeploy');
    output.show(true);
    output.appendLine('[autodeploy] Starting autonomous Argo CD deploy & execute');

    // load workflow file if exists
    let workflowData: any = null;
    try {
      const uri = vscode.Uri.file(`${vscode.workspace.rootPath}/.github/workflows/prod.yml`);
      const bytes = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(bytes).toString('utf8');
      const yaml = require('js-yaml');
      workflowData = yaml.load(text);
      output.appendLine('[autodeploy] Loaded workflow prod.yml');
    } catch (e) {
      output.appendLine('[autodeploy] workflow prod.yml not found or could not be loaded - continuing with defaults');
    }

    const deployer = new ArgoExecDeployer(workflowData, output, context);

    // run in background without blocking the UI
    deployer.deployAndExecute().catch(err => {
      output.appendLine('[autodeploy] Error: ' + String(err));
    });

    vscode.window.showInformationMessage('Autonomous Argo CD deploy initiated. See Output: Predator Autodeploy');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
