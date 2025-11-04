# 🧠 DeepSeek Integration Guide

## Overview

DeepSeek AI provides cutting-edge language models with exceptional capabilities for reasoning, coding, and general conversation. This guide covers integrating DeepSeek models into your development workflow.

## Available Models

### DeepSeek-R1 (Reasoning Model)
- **Model ID**: `deepseek-reasoner`
- **Best For**: Complex reasoning, mathematics, logic problems, step-by-step analysis
- **Context Length**: 65,536 tokens
- **Cost**: $0.014 per 1K tokens
- **Use Cases**:
  - Mathematical problem solving
  - Complex algorithm design
  - System architecture decisions
  - Code optimization strategies

### DeepSeek-V3 (671B Parameters)
- **Model ID**: `deepseek-chat`
- **Best For**: General conversation, creative tasks, analysis
- **Context Length**: 65,536 tokens
- **Cost**: $0.014 per 1K tokens
- **Use Cases**:
  - Technical documentation
  - Code reviews
  - Project planning
  - General Q&A

### DeepSeek-Coder-V2
- **Model ID**: `deepseek-coder`
- **Best For**: Code generation, debugging, refactoring, auto-completion
- **Context Length**: 16,384 tokens
- **Cost**: $0.0012 per 1K tokens (10x cheaper!)
- **Use Cases**:
  - Code completion
  - Bug fixing
  - Code refactoring
  - Test generation

## Setup

### 1. Get API Key

1. Visit [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Configure Environment

Add to your `.env` file:

```bash
DEEPSEEK_API_KEY=sk-your-actual-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### 3. VS Code Extension

Install the DeepSeek VS Code extension:

```bash
code --install-extension wassimdev.wassimdev-vscode-deepseek
```

Configure in VS Code settings (`.vscode/settings.json`):

```json
{
  "deepseek.apiKey": "${env:DEEPSEEK_API_KEY}",
  "deepseek.model": "deepseek-coder-v2",
  "deepseek.baseURL": "https://api.deepseek.com",
  "deepseek.enableCodeCompletion": true,
  "deepseek.enableChat": true
}
```

## Usage

### Python Agent

```python
from agents.deepseek_agent import DeepSeekAgent, DeepSeekModel
import asyncio

async def example():
    agent = DeepSeekAgent()
    
    # Code completion
    result = await agent.code_completion(
        code="def calculate_fibonacci(n):",
        language="python",
        instruction="Implement with memoization"
    )
    
    # Complex reasoning
    result = await agent.reasoning(
        problem="Design a distributed caching system",
        context="High-traffic web application"
    )
    
    # General chat
    result = await agent.general_chat(
        prompt="Explain microservices architecture"
    )

asyncio.run(example())
```

### Continue.dev Integration

Configure in `.continue/config.json`:

```json
{
  "models": [
    {
      "title": "DeepSeek R1",
      "provider": "deepseek",
      "model": "deepseek-reasoner",
      "apiBase": "https://api.deepseek.com/v1",
      "apiKey": "${DEEPSEEK_API_KEY}",
      "contextLength": 65536
    }
  ]
}
```

Use with slash commands:
- `/deepseek` - Use DeepSeek R1 for reasoning
- Tab completion automatically uses DeepSeek Coder

## Cost Comparison

| Model | Provider | Cost (1K tokens) | Notes |
|-------|----------|------------------|-------|
| DeepSeek Coder | DeepSeek | $0.0012 | Best value for code |
| DeepSeek R1/V3 | DeepSeek | $0.014 | Premium reasoning |
| GPT-4o | OpenAI | $0.005 - $0.015 | Via GitHub Copilot |
| Gemini 2.5 Pro | Google | $0.00125 - $0.005 | Free tier available |
| Claude 3.5 | Anthropic | $0.003 - $0.015 | High quality |

**Cost Savings**: DeepSeek Coder is ~10x cheaper than GPT-4 for code tasks!

## Performance Benchmarks

### Code Generation
- **Speed**: ~50 tokens/sec
- **Quality**: Competitive with GPT-4o
- **Context**: Up to 16K tokens for Coder

### Reasoning Tasks
- **Accuracy**: Excellent for math/logic
- **Step-by-step**: Detailed explanations
- **Context**: 65K tokens for R1/V3

## Best Practices

### 1. Model Selection
- **Simple code completion**: Use DeepSeek Coder (cheapest)
- **Complex algorithms**: Use DeepSeek R1 (best reasoning)
- **General tasks**: Use DeepSeek V3 (balanced)

### 2. Temperature Settings
- **Code generation**: 0.2-0.3 (deterministic)
- **Creative tasks**: 0.7-0.9 (varied)
- **Reasoning**: 0.5-0.7 (balanced)

### 3. Context Management
- Keep prompts focused and clear
- Use system prompts for consistent behavior
- Leverage full context window for complex tasks

### 4. Error Handling
- Always check for API key configuration
- Implement retry logic for transient failures
- Monitor rate limits and quotas

## Fallback Strategy

Configure fallback chain in `agents/registry.yaml`:

```yaml
DeepSeekAgent:
  arbiter_model: deepseek/deepseek-r1
  fallback_chain:
    - google/gemini-2.5-pro
    - openai/gpt-4o
```

Automatic fallback occurs when:
- API rate limits hit
- Model unavailable
- Error responses

## Troubleshooting

### API Key Issues
```bash
# Verify key is set
echo $DEEPSEEK_API_KEY

# Test API connectivity
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY"
```

### VS Code Extension Not Working
1. Check settings: `Cmd/Ctrl + ,` → Search "deepseek"
2. Verify API key in environment
3. Restart VS Code
4. Check extension logs: Output → DeepSeek

### Import Errors
```bash
# Install required dependencies
pip install httpx
```

## Advanced Features

### Streaming Responses
```python
result = await agent.chat(
    model=DeepSeekModel.CODER,
    messages=[{"role": "user", "content": "Write a quicksort"}],
    stream=True
)
```

### Custom System Prompts
```python
result = await agent.general_chat(
    prompt="Review this code",
    system_prompt="You are a senior code reviewer focused on security"
)
```

### Batch Processing
```python
tasks = [
    agent.code_completion(code1, "python"),
    agent.code_completion(code2, "python"),
    agent.code_completion(code3, "python")
]
results = await asyncio.gather(*tasks)
```

## Resources

- **Official Site**: https://www.deepseek.com
- **API Documentation**: https://platform.deepseek.com/docs
- **Pricing**: https://platform.deepseek.com/pricing
- **GitHub**: https://github.com/deepseek-ai

## Support

For issues:
1. Check logs: `agents/deepseek_agent.py`
2. Review configuration: `.vscode/settings.json`
3. Test API: `python agents/deepseek_agent.py`
4. Open issue: GitHub repository
