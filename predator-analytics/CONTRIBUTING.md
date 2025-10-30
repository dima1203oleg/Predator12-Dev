# Contributing to Predator Analytics

Дякуємо за інтерес до внеску в Predator Analytics! 🎉

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Testing](#testing)
5. [Pull Request Process](#pull-request-process)
6. [Community Guidelines](#community-guidelines)

---

## Getting Started

### Prerequisites

- Docker Desktop 4.0+
- Git
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/your-org/predator-analytics.git
cd predator-analytics

# Start development environment
make dev

# Or manually
docker-compose up -d
```

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Test Your Changes

```bash
# Run all tests
make test

# Backend tests
make test-backend

# Frontend tests
make test-frontend

# Linting
make lint
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new AI agent for data processing"
```

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(agents): add ModelTrainerAgent for ML training
fix(frontend): resolve 3D avatar rendering issue
docs(readme): update installation instructions
```

---

## Code Standards

### Backend (Python)

```python
# Use type hints
def process_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process input data and return results.

    Args:
        data: Input data dictionary

    Returns:
        Processed data dictionary
    """
    pass

# Follow PEP 8
# Use black for formatting
# Use flake8 for linting
```

**Tools:**
```bash
black backend/
flake8 backend/
mypy backend/
```

### Frontend (TypeScript)

```typescript
// Use TypeScript strict mode
// Define interfaces for props
interface AIAvatarProps {
  isListening: boolean;
  isProcessing: boolean;
}

// Use functional components with hooks
export function AIAvatar({ isListening, isProcessing }: AIAvatarProps) {
  // Component logic
}

// Follow ESLint rules
```

**Tools:**
```bash
npm run lint
npm run format
```

### Documentation

- Write clear, concise comments
- Update README for new features
- Add JSDoc/docstrings for functions
- Include examples in documentation

---

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v --cov
```

**Test Structure:**
```python
def test_arbiter_agent_delegation():
    """Test that Arbiter correctly delegates tasks"""
    arbiter = ArbiterAgent()
    result = await arbiter.execute({
        "task_type": "analyze_dataset",
        "data": {...}
    })
    assert result["success"] is True
```

### Frontend Tests

```bash
cd frontend
npm run test
```

**Test Structure:**
```typescript
describe('AIAvatar', () => {
  it('should render 3D avatar', () => {
    render(<AIAvatar isListening={false} isProcessing={false} />);
    // Assertions
  });
});
```

### Integration Tests

```bash
# Start services
make dev

# Run integration tests
./scripts/test-all.sh
```

---

## Pull Request Process

### 1. Update Your Branch

```bash
git fetch origin
git rebase origin/main
```

### 2. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

- Go to GitHub repository
- Click "New Pull Request"
- Fill out PR template
- Link related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] All tests pass
```

### 4. Code Review

- Address reviewer comments
- Make requested changes
- Push updates to same branch

### 5. Merge

Once approved:
- Squash and merge (preferred)
- Rebase and merge
- Create merge commit

---

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

### Communication

- **GitHub Issues**: Bug reports, feature requests
- **Pull Requests**: Code contributions
- **Discussions**: Questions, ideas, general chat

### Getting Help

- Read documentation first
- Search existing issues
- Ask clear, specific questions
- Provide context and examples

---

## Project Structure

```
predator-analytics/
├── backend/           # FastAPI application
├── frontend/          # Next.js application
├── helm/             # Kubernetes Helm charts
├── terraform/        # Infrastructure as Code
├── monitoring/       # Observability configs
└── docs/            # Additional documentation
```

---

## Development Tips

### Hot Reload

**Backend:**
```bash
# FastAPI auto-reloads on file changes
docker-compose logs -f backend
```

**Frontend:**
```bash
# Next.js hot reloads automatically
docker-compose logs -f frontend
```

### Debugging

**Backend:**
```python
# Add breakpoint
import pdb; pdb.set_trace()
```

**Frontend:**
```typescript
// Use browser DevTools
console.log('Debug info:', data);
```

### Database Migrations

```bash
# Create migration
docker-compose exec backend alembic revision --autogenerate -m "Add new column"

# Apply migration
docker-compose exec backend alembic upgrade head
```

---

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Creating a Release

1. Update version in `package.json` and `__version__.py`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag -a v1.0.0 -m "Release v1.0.0"`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release

---

## Additional Resources

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [QUICKSTART_UK.md](QUICKSTART_UK.md) - Quick start guide
- [API Documentation](http://localhost:8000/api/docs)

---

## Questions?

Feel free to:
- Open an issue
- Start a discussion
- Reach out to maintainers

---

**Thank you for contributing to Predator Analytics! 🚀🇺🇦**
