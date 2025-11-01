# 🚀 ZERO-CONFIG QUICKSTART GUIDE

**⏱️ Time to First Run: 5 minutes**

This guide gets you from zero to running Predator12 with full debugging, AI agents, and GitOps in minutes.

---

## 📋 Prerequisites Check

```bash
# Run this one-liner to check everything:
make check

# Or manually verify:
python3.11 --version  # Should be 3.11+
node --version        # Should be 22+
docker --version      # Should be 20+
kubectl version       # Optional, for K8s deployment
helm version          # Optional, for Helm charts
```

---

## 🎯 Quick Start (Zero Config)

### Option 1: VS Code F5 (Recommended)

**Fastest way - just press F5!**

1. **Open in VS Code**
   ```bash
   cd /Users/dima/Documents/Predator12/predator12-local
   code .
   ```

2. **Press F5**
   - Select: **"🚀 Full Stack Debug (F5)"**
   - That's it! Backend + Frontend + Dev environment starts automatically

3. **Access Services**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Agent Dashboard: http://localhost:8080

### Option 2: Command Line

```bash
# One command to rule them all:
make dev

# Or step-by-step:
docker compose -f docker-compose.dev.yml up -d  # Start services
cd backend && uvicorn main:app --reload &       # Start backend
cd frontend && npm run dev &                     # Start frontend
python agents/supervisor.py &                    # Start AI agents
```

### Option 3: DevContainer (Remote Development)

1. Open in VS Code
2. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
3. Select: **"Dev Containers: Reopen in Container"**
4. Wait for container to build (first time only)
5. Press F5 to start debugging

---

## 🔧 What Gets Started

### Development Services (Docker Compose)
- ✅ PostgreSQL 16 (port 5432)
- ✅ Redis 7 (port 6379)
- ✅ OpenSearch 2.11 (port 9200)
- ✅ Vault (port 8200)
- ✅ Prometheus (port 9090)
- ✅ Grafana (port 3000)
- ✅ Jaeger (port 16686)
- ✅ MailHog (port 8025)

### Application Services
- ✅ FastAPI Backend (port 8000)
- ✅ React Frontend (port 3000)
- ✅ AI Agent Supervisor (background)
- ✅ Agent Web Dashboard (port 8080)

---

## 🐛 Debugging

### Backend (Python)
- Set breakpoints in VS Code
- Press F5 → Select **"🐍 Python: FastAPI Backend Debug"**
- Breakpoints will hit automatically

### Frontend (Node.js)
- Set breakpoints in `.tsx`/`.jsx` files
- Press F5 → Select **"🌐 Node: Frontend Debug"**
- Or use browser DevTools

### Full Stack
- Press F5 → Select **"🚀 Full Stack Debug (F5)"**
- Debug both backend and frontend simultaneously

### AI Agents
- Press F5 → Select **"🤖 Python: Agent Debug"**
- Monitor in real-time at http://localhost:8080

---

## 🧪 Running Tests

```bash
# All tests
make test

# Backend only
pytest backend/tests/ -v

# Frontend only
cd frontend && npm test

# With coverage
pytest backend/tests/ --cov=backend --cov-report=html

# Smoke tests
pytest smoke_tests/ -v
```

**In VS Code:**
- Press F5 → Select **"🧪 Python: Run Tests"**

---

## 🚀 GitOps Deployment

### Setup (One Time)

```bash
# Install ArgoCD (if not already)
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Configure ArgoCD
make argocd-setup

# Create applications
kubectl apply -k infra/argocd/base
```

### Deploy

**Option 1: Git Push (Automatic)**
```bash
git add .
git commit -m "feat: my awesome feature"
git push
# ArgoCD auto-syncs in ~3 minutes
```

**Option 2: Manual Sync**
```bash
argocd app sync predator12-backend --prune
argocd app sync predator12-frontend --prune
argocd app sync predator12-agents --prune
```

**Option 3: GitHub Actions**
- Push to `main` branch triggers CI/CD
- Automatic build → test → deploy pipeline

---

## 🤖 AI Agents

### Start Agents

```bash
# All agents via supervisor
python agents/supervisor.py

# Or via VS Code: F5 → "🤖 Python: Agent Debug"
```

### Agent Dashboard
- Open: http://localhost:8080
- View all 30+ agents in real-time
- Monitor self-healing, optimization, modernization

### Key Agents
- **Self-Healing**: Detects and fixes issues automatically
- **Optimize**: Analyzes performance and suggests improvements
- **Modernize**: Refactors code to best practices
- **Security**: Scans for vulnerabilities
- **Cost**: Optimizes cloud costs

---

## 📊 Monitoring

### Access Dashboards
```bash
# Grafana (metrics visualization)
open http://localhost:3000
# Default: admin / admin

# Prometheus (metrics storage)
open http://localhost:9090

# Jaeger (distributed tracing)
open http://localhost:16686

# Agent Dashboard
open http://localhost:8080
```

### VS Code Tasks
- `Cmd+Shift+P` → **Tasks: Run Task**
- Select: **"📊 Monitoring: Open Grafana"** (or Prometheus/Jaeger)

---

## 🛠️ Common Tasks

### Database Migrations
```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "add user table"

# Apply migrations
alembic upgrade head
```

**VS Code:**
- Tasks → **"🐍 Backend: Create Migration"**
- Tasks → **"🐍 Backend: Run Migrations"**

### Code Quality
```bash
# Format code
black backend/ && isort backend/

# Lint
flake8 backend/
pylint backend/

# Type check
mypy backend/

# Run pre-commit
pre-commit run --all-files
```

**VS Code:**
- Tasks → **"🎨 Backend: Format Code"**
- Tasks → **"✅ Pre-commit: Run All"**

### Security Scan
```bash
# Python security
bandit -r backend/ agents/ -ll

# Dependencies
pip-audit -r requirements.txt

# Secrets scan
gitleaks detect --source . -v
```

**VS Code:**
- Tasks → **"🔒 Security: Run Bandit"**

---

## 🔄 Hot Reload

**Backend (Python)**
- ✅ Automatic with `--reload` flag
- Just save `.py` files and see changes instantly

**Frontend (React)**
- ✅ Automatic with Vite
- Save `.tsx`/`.jsx` files and see changes in browser

**Agent Configuration**
- ✅ Edit `agents/registry.yaml`
- Supervisor auto-reloads changed agents

---

## 📝 Environment Variables

```bash
# Copy example
cp .env.example .env

# Edit as needed
vim .env

# Key variables:
# - DATABASE_URL
# - REDIS_URL
# - OPENAI_API_KEY (for AI agents)
# - VAULT_TOKEN (for secrets)
```

---

## 🐳 Docker Management

```bash
# Start dev environment
docker compose -f docker-compose.dev.yml up -d

# Stop
docker compose -f docker-compose.dev.yml down

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Restart service
docker compose -f docker-compose.dev.yml restart postgres

# Clean up
docker compose -f docker-compose.dev.yml down -v
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -ti:8000
# Kill it
kill -9 $(lsof -ti:8000)
```

### Database Connection Error
```bash
# Check if postgres is running
docker compose -f docker-compose.dev.yml ps postgres

# Restart postgres
docker compose -f docker-compose.dev.yml restart postgres

# Check logs
docker compose -f docker-compose.dev.yml logs postgres
```

### Frontend Won't Start
```bash
# Clean install
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Can't Connect to Services
```bash
# Check all services
docker compose -f docker-compose.dev.yml ps

# Restart everything
docker compose -f docker-compose.dev.yml restart
```

---

## 📚 Next Steps

1. **Read the Docs**
   - [INDEX.md](INDEX.md) - Full documentation index
   - [AI_STACK_SUMMARY.md](docs/AI_STACK_SUMMARY.md) - AI agents overview
   - [GITOPS_ARGO_HELM.md](GITOPS_ARGO_HELM.md) - GitOps workflow
   - [VSCODE_COMPLETE_REPORT.md](VSCODE_COMPLETE_REPORT.md) - VS Code guide

2. **Explore Features**
   - Try debugging with breakpoints
   - Create a migration
   - Run the test suite
   - Deploy with ArgoCD

3. **Customize**
   - Edit agent configurations
   - Add new endpoints
   - Create custom dashboards
   - Configure monitoring

---

## ✅ Verification

Run this to verify everything works:

```bash
# Health check
make health-check

# Or manual:
curl http://localhost:8000/health     # Backend
curl http://localhost:3000            # Frontend
curl http://localhost:9200/_cluster/health  # OpenSearch
redis-cli ping                        # Redis
```

---

## 🎯 Summary

**To start developing:**
1. Open in VS Code: `code .`
2. Press **F5**
3. Select **"🚀 Full Stack Debug (F5)"**
4. Done! 🎉

**That's it! You're ready to code.**

For more details, see [INDEX.md](INDEX.md) for complete documentation.
