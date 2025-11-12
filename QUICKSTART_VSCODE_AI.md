# 🚀 Quick Start: VS Code AI Extensions + DeepSeek

## 1-Minute Setup

### Install Extensions
Open VS Code in this repository and click "Install All" when prompted, or:
```bash
code .
```

### Configure API Keys
Copy `.env.example` to `.env` and add your keys:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

Required keys:
- `DEEPSEEK_API_KEY` - Get from [platform.deepseek.com](https://platform.deepseek.com)
- `GEMINI_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com)
- `GITHUB_TOKEN` - Your GitHub personal access token (for GitHub Models API)
- `ANTHROPIC_API_KEY` - Get from [Anthropic](https://console.anthropic.com)

**Note**: `GITHUB_TOKEN` provides access to GitHub Models API (models.github.ai) which includes GPT-4o, GPT-4o-mini, and other models. This is separate from direct OpenAI API access.

### Reload VS Code
Press `Cmd/Ctrl + Shift + P` → "Reload Window"

## Using the AI Tools

### 🤖 GitHub Copilot
- `Tab` - Accept suggestion
- `Cmd/Ctrl + I` - Open inline chat
- Type naturally: "create a fibonacci function"

### 🧠 DeepSeek (Cheapest for Code!)
- Install extension: `wassimdev.wassimdev-vscode-deepseek`
- Auto-completes as you type
- 10x cheaper than GPT-4 for code tasks

### ⚡ Continue.dev (Autonomous Agent)
- `Cmd/Ctrl + Shift + I` - Open chat
- `/edit` - Edit code with AI
- `/deepseek` - Use DeepSeek model
- `/gemini` - Use Gemini model

### 🎯 Cline (Claude Dev)
- Autonomous development agent
- Creates and edits files
- Runs terminal commands

## Test DeepSeek Agent

```bash
python3 agents/deepseek_agent.py
```

## Debug AI Agents

Press `F5` and select:
- "🤖 DeepSeek Agent" - Test DeepSeek integration
- "🌟 Gemini Orchestrator" - Test Gemini
- "🚀 Full AI Stack" - Run both

## Model Selection Guide

| Task | Best Model | Cost | Why |
|------|------------|------|-----|
| Code completion | DeepSeek Coder | $0.0012/1K | 10x cheaper, fast |
| Complex algorithms | DeepSeek R1 | $0.014/1K | Best reasoning |
| General coding | GitHub Copilot | Free* | GitHub integration |
| Creative tasks | Gemini 2.5 Pro | $0.00125/1K | Free tier, quality |

*Requires Copilot subscription

## Keyboard Shortcuts

### Essential
- `Tab` - Accept AI suggestion
- `Cmd/Ctrl + I` - AI inline chat
- `Cmd/Ctrl + Shift + I` - Open Continue.dev
- `Alt + ]` / `Alt + [` - Next/previous suggestion

### Code
- `Alt + Shift + F` - Format document
- `Cmd/Ctrl + /` - Toggle comment
- `F12` - Go to definition

### Git
- `Cmd/Ctrl + Shift + G` - Open source control

## Cost Comparison

```
DeepSeek Coder:  $0.0012 per 1K tokens ⭐ CHEAPEST
Gemini 2.5 Pro:  $0.00125 per 1K tokens
GPT-4o Mini:     $0.005 per 1K tokens
DeepSeek R1/V3:  $0.014 per 1K tokens
GPT-4o:          $0.015 per 1K tokens
```

**Example**: Generate 10K tokens of code
- DeepSeek Coder: $0.012
- Gemini: $0.0125
- GPT-4o: $0.15 (12x more expensive!)

## Troubleshooting

### Extensions not working?
```bash
# Reload VS Code
Cmd/Ctrl + Shift + P → "Reload Window"

# Check extension logs
Cmd/Ctrl + Shift + U → Select extension
```

### API keys not working?
```bash
# Verify keys are set
echo $DEEPSEEK_API_KEY
echo $GEMINI_API_KEY

# Restart VS Code after setting .env
```

### DeepSeek agent import errors?
```bash
pip install httpx pyyaml
```

## Next Steps

1. **Read Full Docs**:
   - [DeepSeek Integration Guide](docs/DEEPSEEK_INTEGRATION.md)
   - [VS Code Extensions Guide](docs/VSCODE_EXTENSIONS.md)

2. **Configure Models**:
   - Edit `.continue/config.json` for custom models
   - Edit `agents/registry.yaml` for agent configuration

3. **Run AI Code Review**:
   - Open a PR to trigger `.github/workflows/ai-code-review.yml`

## Tips

💡 Use DeepSeek Coder for daily coding (cheapest)
💡 Use DeepSeek R1 for complex algorithms
💡 Use Continue.dev for refactoring entire files
💡 Use Cline for autonomous multi-file changes
💡 Enable format-on-save for consistent code style

## Support

- **DeepSeek**: https://platform.deepseek.com/docs
- **Continue.dev**: https://continue.dev/docs
- **GitHub Copilot**: https://docs.github.com/copilot

---

Made with ❤️ for ultimate AI-powered development
