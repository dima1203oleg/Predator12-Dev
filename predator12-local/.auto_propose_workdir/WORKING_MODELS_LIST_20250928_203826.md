# 🎯 ПРАЦЮЮЧІ AI МОДЕЛІ

**Тестовано:** 2025-09-28T20:36:30.884128

## 📊 СТАТИСТИКА

- 🔢 Всього моделей: 58
- ✅ Працюючих: 23
- ❌ Не працюючих: 24
- 🚫 Недоступних: 11
- 🎯 Успішність: 39.7%

## ✅ СПИСОК ПРАЦЮЮЧИХ МОДЕЛЕЙ

```python
WORKING_MODELS = [
    "ai21-labs/ai21-jamba-1.5-large",
    "ai21-labs/ai21-jamba-1.5-mini",
    "cohere/cohere-command-a",
    "cohere/cohere-command-r-08-2024",
    "cohere/cohere-command-r-plus-08-2024",
    "core42/jais-30b-chat",
    "meta/llama-3.2-11b-vision-instruct",
    "meta/llama-3.2-90b-vision-instruct",
    "meta/llama-4-scout-17b-16e-instruct",
    "meta/meta-llama-3.1-405b-instruct",
    "meta/meta-llama-3.1-8b-instruct",
    "microsoft/phi-4-mini-reasoning",
    "microsoft/phi-4-reasoning",
    "mistral-ai/codestral-2501",
    "mistral-ai/ministral-3b",
    "mistral-ai/mistral-large-2411",
    "mistral-ai/mistral-medium-2505",
    "mistral-ai/mistral-nemo",
    "mistral-ai/mistral-small-2503",
    "openai/gpt-4.1-nano",
    "openai/gpt-4o",
    "openai/gpt-4o-mini",
    "openai/gpt-5-chat",
]
```

## ❌ НЕ ПРАЦЮЮЧІ МОДЕЛІ

- `cohere/cohere-embed-v3-english` - Model not found (404)
- `cohere/cohere-embed-v3-multilingual` - Model not found (404)
- `deepseek/deepseek-r1` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `deepseek/deepseek-r1-0528` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `deepseek/deepseek-v3-0324` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `meta/llama-3.3-70b-instruct` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `meta/llama-4-maverick-17b-128e-instruct-fp8` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `microsoft/mai-ds-r1` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `microsoft/phi-3-medium-128k-instruct` - Model not found (404)
- `microsoft/phi-3-medium-4k-instruct` - Model not found (404)
- `microsoft/phi-3-mini-128k-instruct` - Model not found (404)
- `microsoft/phi-3-mini-4k-instruct` - Model not found (404)
- `microsoft/phi-3-small-128k-instruct` - Model not found (404)
- `microsoft/phi-3-small-8k-instruct` - Model not found (404)
- `microsoft/phi-3.5-mini-instruct` - Model not found (404)
- `microsoft/phi-3.5-moe-instruct` - Model not found (404)
- `microsoft/phi-3.5-vision-instruct` - Model not found (404)
- `microsoft/phi-4` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `microsoft/phi-4-mini-instruct` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `microsoft/phi-4-multimodal-instruct` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `openai/gpt-4.1` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `openai/gpt-4.1-mini` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `openai/gpt-5` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/gpt-5-mini` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/gpt-5-nano` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/o1` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/o1-mini` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/o1-preview` - HTTP 400: {"error":{"message":"400 Model o1 is enabled only for api versions 2024-12-01-preview and later","ty
- `openai/o3` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/o3-mini` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/o4-mini` - HTTP 400: {"error":{"message":"400 Unsupported parameter: 'max_tokens' is not supported with this model. Use '
- `openai/text-embedding-3-large` - HTTP 400: {"error":{"message":"400 The chatCompletion operation does not work with the specified model, text-e
- `openai/text-embedding-3-small` - HTTP 400: {"error":{"message":"400 The chatCompletion operation does not work with the specified model, text-e
- `xai/grok-3` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim
- `xai/grok-3-mini` - HTTP 403: {"error":{"message":"403 Unable to proceed with model usage. This account has reached its budget lim

## 🔧 РЕКОМЕНДАЦІЇ

1. Використовувати тільки працюючі моделі в production
2. Оновити agent registry з реальними назвами моделей
3. Налаштувати fallback між працюючими моделями
