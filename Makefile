CN=cn
CFG=$(HOME)/.continue/config-smart.yaml

.PHONY: ai-ping ai-summary ai-test ai-refactor ai-commit ai-lint ai-fix

ai-ping:
	$(CN) --config $(CFG) -p "ping"

ai-summary:
	$(CN) --config $(CFG) -p "@README.md підсумуй 5 тез українською"

ai-test:
	$(CN) --config $(CFG) -p "Створи файл backend/tests/test_health.py з простим pytest для /health"

ai-refactor:
	@if [ -z "$$FILE" ]; then echo "Вкажіть: make ai-refactor FILE=backend/services/calc.py"; exit 1; fi
	$(CN) --config $(CFG) -p "Перепиши $$FILE з type hints і докстрінгами"

ai-commit:
	@echo "$$(git diff) створи короткий conventional commit українською" | $(CN) --config $(CFG) -p > commit-message.txt && echo "✅ commit-message.txt створено"

ai-lint:
	ruff . || flake8 . || true

ai-fix:
	black . || true
