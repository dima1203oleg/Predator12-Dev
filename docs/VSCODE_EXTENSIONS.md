# 🔌 VS Code Extensions Guide

## Overview

This guide covers the comprehensive VS Code extensions pack configured for ultimate development experience with AI coding assistants, code quality tools, and productivity enhancements.

## Installation

### Automatic Installation

Open the project in VS Code and you'll be prompted to install recommended extensions. Click "Install All" or use:

```bash
# Install all recommended extensions
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension continue.continue
# ... (VS Code will prompt for others)
```

### Manual Installation

Press `Cmd/Ctrl + Shift + P` → "Extensions: Show Recommended Extensions"

## AI Coding Assistants

### 🤖 GitHub Copilot
**Extension ID**: `github.copilot`

**Features**:
- Inline code suggestions
- Multi-line completions
- Context-aware recommendations

**Configuration** (`.vscode/settings.json`):
```json
{
  "github.copilot.enable": {
    "*": true,
    "python": true,
    "javascript": true
  },
  "github.copilot.advanced": {
    "length": 500,
    "temperature": 0.7,
    "inlineSuggestCount": 3
  }
}
```

**Keyboard Shortcuts**:
- `Tab`: Accept suggestion
- `Alt + ]`: Next suggestion
- `Alt + [`: Previous suggestion
- `Alt + \`: Trigger inline suggestion

### 💬 GitHub Copilot Chat
**Extension ID**: `github.copilot-chat`

**Features**:
- Natural language to code
- Code explanations
- Bug fixing assistance
- Test generation

**Usage**:
- `Cmd/Ctrl + I`: Open inline chat
- `Cmd/Ctrl + Shift + I`: Open chat panel
- Type `/explain` to explain code
- Type `/fix` to fix bugs
- Type `/tests` to generate tests

### 🧠 DeepSeek
**Extension ID**: `wassimdev.wassimdev-vscode-deepseek`

**Features**:
- Code completion with DeepSeek Coder
- Chat interface
- Code explanation
- Low-cost alternative to Copilot

**Configuration**:
```json
{
  "deepseek.apiKey": "${env:DEEPSEEK_API_KEY}",
  "deepseek.model": "deepseek-coder-v2",
  "deepseek.enableCodeCompletion": true
}
```

### ⚡ Continue.dev
**Extension ID**: `continue.continue`

**Features**:
- Autonomous coding agent
- Multi-model support (DeepSeek, Gemini, GPT-4)
- Code editing with context
- Terminal command execution

**Configuration**: `.continue/config.json`

**Slash Commands**:
- `/edit` - Edit code with AI
- `/deepseek` - Use DeepSeek model
- `/gemini` - Use Gemini model
- `/comment` - Add comments
- `/test` - Generate tests

### 🎯 Cline (Claude Dev)
**Extension ID**: `saoudrizwan.claude-dev`

**Features**:
- Autonomous development agent
- File creation and editing
- Command execution
- Project-wide changes

**Configuration**:
```json
{
  "cline.enableCommandExecution": "always",
  "cline.anthropicApiKey": "${env:ANTHROPIC_API_KEY}"
}
```

### 🦘 Roo-Coder
**Extension ID**: `rooveterinaryinc.roo-coder`

**Features**:
- AI pair programming
- Code generation
- Refactoring assistance

## Gemini Integrations

### ☁️ Google Cloud Code
**Extension ID**: `googlecloudtools.cloudcode`

**Features**:
- Gemini AI integration
- Cloud deployment
- Kubernetes support

### 🤖 Bito
**Extension ID**: `bito.bito`

**Features**:
- AI code review
- Documentation generation
- Performance optimization suggestions

## Code Quality

### 🐍 Python
**Extension ID**: `ms-python.python`

**Features**:
- IntelliSense
- Debugging
- Linting
- Testing

**Configuration**:
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.testing.pytestEnabled": true
}
```

### ⚡ Pylance
**Extension ID**: `ms-python.vscode-pylance`

**Features**:
- Fast Python language server
- Type checking
- Auto-imports

### 🎨 Black Formatter
**Extension ID**: `ms-python.black-formatter`

**Features**:
- Automatic Python formatting
- PEP 8 compliance

**Configuration**:
```json
{
  "python.formatting.provider": "black",
  "editor.formatOnSave": true
}
```

### 💅 Prettier
**Extension ID**: `esbenp.prettier-vscode`

**Features**:
- JavaScript/TypeScript formatting
- JSON/YAML/Markdown support

**Configuration**:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

### 🔍 ESLint
**Extension ID**: `dbaeumer.vscode-eslint`

**Features**:
- JavaScript linting
- Auto-fix on save

## DevOps

### 🐳 Docker
**Extension ID**: `ms-azuretools.vscode-docker`

**Features**:
- Dockerfile support
- Container management
- Image building

### ☸️ Kubernetes
**Extension ID**: `ms-kubernetes-tools.vscode-kubernetes-tools`

**Features**:
- Cluster management
- Resource visualization
- YAML validation

### 📝 YAML
**Extension ID**: `redhat.vscode-yaml`

**Features**:
- YAML validation
- Schema support
- Auto-completion

## Git & Collaboration

### 🎨 GitLens
**Extension ID**: `eamodio.gitlens`

**Features**:
- Git blame annotations
- Commit history
- File history
- Repository insights

**Usage**:
- Hover over code to see blame
- Click on blame to see commit details
- View file history in sidebar

### 🔀 GitHub Pull Requests
**Extension ID**: `github.vscode-pull-request-github`

**Features**:
- Create/review PRs
- Inline comments
- Merge from editor

### 📜 Git History
**Extension ID**: `donjayamanne.githistory`

**Features**:
- Visual commit history
- Branch comparisons
- File history visualization

## Productivity

### 📋 Todo Tree
**Extension ID**: `gruntfuggly.todo-tree`

**Features**:
- Track TODO comments
- Tree view of tasks
- Customizable tags

**Usage**:
- Add `// TODO: task` in code
- View in sidebar panel
- Click to navigate

### 🎯 Todo Highlight
**Extension ID**: `wayou.vscode-todo-highlight`

**Features**:
- Highlight TODO/FIXME comments
- Customizable colors

### 🎨 Material Icon Theme
**Extension ID**: `pkief.material-icon-theme`

**Features**:
- Beautiful file icons
- Language-specific icons
- Folder icons

**Activation**:
`Cmd/Ctrl + Shift + P` → "File Icon Theme" → "Material Icon Theme"

### 🌈 Material Theme
**Extension ID**: `zhuangtongfa.material-theme`

**Features**:
- Modern color schemes
- High contrast options
- Multiple variants

**Activation**:
`Cmd/Ctrl + Shift + P` → "Color Theme" → Choose Material Theme variant

## Keyboard Shortcuts

### AI Assistants
- `Tab`: Accept Copilot suggestion
- `Cmd/Ctrl + I`: Open Copilot inline chat
- `Cmd/Ctrl + Shift + I`: Open Continue.dev chat
- `Cmd/Ctrl + K`: Open Cline panel

### Code Navigation
- `Cmd/Ctrl + P`: Quick file open
- `Cmd/Ctrl + Shift + O`: Go to symbol
- `F12`: Go to definition
- `Alt + F12`: Peek definition

### Code Editing
- `Cmd/Ctrl + D`: Select next occurrence
- `Alt + Shift + F`: Format document
- `Cmd/Ctrl + /`: Toggle comment
- `Cmd/Ctrl + Shift + K`: Delete line

### Git
- `Cmd/Ctrl + Shift + G`: Open source control
- `Cmd/Ctrl + Shift + G G`: Stage all changes
- `Cmd/Ctrl + Enter`: Commit

## Troubleshooting

### Extension Not Working

1. **Check Installation**:
   ```bash
   code --list-extensions | grep extension-id
   ```

2. **Reload Window**:
   `Cmd/Ctrl + Shift + P` → "Reload Window"

3. **Check Logs**:
   `Cmd/Ctrl + Shift + P` → "Developer: Show Logs"

### API Key Issues

1. **Verify Environment Variables**:
   ```bash
   echo $DEEPSEEK_API_KEY
   echo $GEMINI_API_KEY
   echo $ANTHROPIC_API_KEY
   ```

2. **Update Settings**:
   - Check `.vscode/settings.json`
   - Verify `${env:VAR_NAME}` syntax
   - Restart VS Code after changes

### Performance Issues

1. **Disable Unused Extensions**:
   `Cmd/Ctrl + Shift + X` → Disable extensions you don't use

2. **Increase Memory**:
   Add to settings:
   ```json
   {
     "files.watcherExclude": {
       "**/.git/objects/**": true,
       "**/node_modules/**": true
     }
   }
   ```

## Best Practices

### 1. Extension Management
- Only enable extensions you actively use
- Use workspace recommendations for team consistency
- Keep extensions updated

### 2. Settings Sync
- Enable Settings Sync for consistency across machines
- `Cmd/Ctrl + Shift + P` → "Settings Sync: Turn On"

### 3. AI Assistant Usage
- Use Copilot for quick completions
- Use DeepSeek Coder for cost-effective coding
- Use Continue.dev for complex refactoring
- Use Cline for autonomous project changes

### 4. Code Quality
- Enable format on save
- Configure linters for your languages
- Use AI for code review before committing

## Customization

### Custom Keybindings

Edit `keybindings.json`:
```json
[
  {
    "key": "cmd+shift+a",
    "command": "continue.continueGUIView.focus"
  },
  {
    "key": "cmd+shift+d",
    "command": "deepseek.chat"
  }
]
```

### Custom Settings

Override in `.vscode/settings.json`:
```json
{
  "editor.fontSize": 14,
  "editor.lineHeight": 22,
  "terminal.integrated.fontSize": 13,
  "workbench.colorTheme": "Material Theme Ocean High Contrast"
}
```

## Resources

- **VS Code Marketplace**: https://marketplace.visualstudio.com
- **Extension API**: https://code.visualstudio.com/api
- **Keyboard Shortcuts**: `Cmd/Ctrl + K, Cmd/Ctrl + S`
- **Settings**: `Cmd/Ctrl + ,`

## Support

For issues:
1. Check extension documentation
2. Review output logs
3. Search VS Code issues: https://github.com/microsoft/vscode/issues
4. Ask in extension's GitHub repository
