const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

function activate(context) {
    let disposable = vscode.commands.registerCommand('predator.autoApprove', function () {
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open.');
            return;
        }

        const scriptPath = path.join(workspaceFolder.uri.fsPath, 'scripts', 'auto_approve_and_commit.sh');

        const terminal = vscode.window.createTerminal('Auto Approve');
        terminal.show();
        terminal.sendText(`cd "${workspaceFolder.uri.fsPath}" && chmod +x "${scriptPath}" && "${scriptPath}"`);
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
