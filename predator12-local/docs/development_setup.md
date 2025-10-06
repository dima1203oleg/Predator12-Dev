# Predator11 Development Environment

## Prerequisites
- Docker
- VS Code
- Dev Containers extension

## Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/yourorg/predator11.git
   cd predator11
   ```

2. **Open in VS Code**:
   ```bash
   code .
   ```

3. **Reopen in container**:
   - Click "Reopen in Container" when prompted
   - Or run command: `Dev Containers: Reopen in Container`

4. **Wait for setup**:
   - Python 3.11 installed
   - Dependencies loaded
   - VSCode extensions configured

## Key Tools

- **Python**: 3.11 with pip/pipenv
- **Linters**: Pylint, Flake8
- **Formatter**: Black
- **Debugger**: Python debugger

## Workflow Tips

```bash
# Run tests
pytest tests/

# Format code
black .

# Check linting
flake8 .
```

## Troubleshooting

**Issue**: Container won't start
- Verify Docker is running
- Check disk space

**Issue**: Missing dependencies
- Run: `pip install -r requirements-dev.txt`
- Restart container
