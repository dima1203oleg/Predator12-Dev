# AutoTrain Loop (LLM/ML)

AutoTrain Loop — автоматичне перенавчання моделей на нових даних.

## Приклад workflow для CI/CD

```yaml
name: AutoTrain Loop
on:
  schedule:
    - cron: '0 2 * * 0' # щотижня
jobs:
  retrain:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install requirements
        run: |
          pip install -r ai-llm/requirements.txt
      - name: Run retrain script
        run: |
          python ai-llm/scripts/auto_train.py
```

> Створіть скрипт ai-llm/scripts/auto_train.py для автоматичного перенавчання моделей (наприклад, через MLflow, Ollama, LoRA).
