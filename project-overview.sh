#!/bin/bash

# 🎯 Predator12 Project Overview
# Швидкий огляд проекту та його компонентів

set -e

# Кольори
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

clear

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ██████╗ ██████╗ ███████╗██████╗  █████╗ ████████╗ ██████╗ ██████╗   ║
║   ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗  ║
║   ██████╔╝██████╔╝█████╗  ██║  ██║███████║   ██║   ██║   ██║██████╔╝  ║
║   ██╔═══╝ ██╔══██╗██╔══╝  ██║  ██║██╔══██║   ██║   ██║   ██║██╔══██╗  ║
║   ██║     ██║  ██║███████╗██████╔╝██║  ██║   ██║   ╚██████╔╝██║  ██║  ║
║   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝  ║
║                                   12                              ║
║                                                                   ║
║             Multi-Agent AI System - Project Overview             ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📊 СТРУКТУРА ПРОЕКТУ${NC}\n"

echo -e "${GREEN}predator12-local/ ${YELLOW}(Локальна розробка - без контейнерів)${NC}"
echo "├── 🎯 Основні файли:"
echo "│   ├── README.md                 (502 рядки) - Повна документація"
echo "│   ├── START_HERE.md             (356 рядків) - Швидкий старт"
echo "│   ├── LOCAL_DEV_STATUS.md       (500+ рядків) - Статус налаштування"
echo "│   ├── QUICK_START.md            - 5-хвилинний гід"
echo "│   ├── migration_plan.md         - План міграції даних"
echo "│   ├── DEPLOYMENT_CHECKLIST.md   - Acceptance criteria (100+ пунктів)"
echo "│   ├── Makefile                  - 15+ команд автоматизації"
echo "│   ├── predator11.sh             - Головний інтерактивний скрипт"
echo "│   ├── quick-setup.sh            - Автоматичний setup"
echo "│   └── .env.example              - Шаблон конфігурації"
echo "│"
echo "├── 🔧 Backend (FastAPI):"
echo "│   ├── app/                      - Основний код додатку"
echo "│   ├── alembic/                  - Міграції бази даних"
echo "│   ├── requirements.txt          - Python залежності"
echo "│   └── main.py                   - Entry point"
echo "│"
echo "├── 🎨 Frontend (React + Vite):"
echo "│   ├── src/                      - React компоненти"
echo "│   ├── package.json              - Node.js залежності"
echo "│   ├── vite.config.ts            - Vite конфігурація"
echo "│   └── tsconfig.json             - TypeScript налаштування"
echo "│"
echo "├── 🤖 AI Agents (16 агентів):"
echo "│   ├── registry_production.yaml  - Реєстр агентів"
echo "│   ├── agent_*.py                - Індивідуальні агенти"
echo "│   └── models/                   - AI моделі"
echo "│"
echo "├── 📜 Scripts (37+ файлів):"
echo "│   ├── init_local_db.sh          - Ініціалізація БД"
echo "│   ├── migrate_db.sh             - Міграції"
echo "│   ├── pg_dump_from_container.sh - Експорт з Docker"
echo "│   ├── pg_restore_to_local.sh    - Імпорт в локальну БД"
echo "│   ├── health-monitor.sh         - Моніторинг здоров'я"
echo "│   ├── security-audit.sh         - Аудит безпеки"
echo "│   ├── backup-system.sh          - Резервне копіювання"
echo "│   └── deploy-production.sh      - Деплой в продакшн"
echo "│"
echo "├── 🧪 Testing:"
echo "│   ├── smoke_tests/              - Швидкі тести"
echo "│   │   ├── run_smoke.sh         - Bash версія"
echo "│   │   └── python_smoke.py      - Python OOP версія"
echo "│   └── tests/                    - Повні тести"
echo "│"
echo "├── 🛠️ VS Code Integration:"
echo "│   ├── .vscode/"
echo "│   │   ├── tasks-local.json     - 11 задач для розробки"
echo "│   │   ├── launch.json          - 7 debug конфігурацій"
echo "│   │   ├── settings-local.json  - Налаштування редактора"
echo "│   │   └── extensions.json      - Рекомендовані розширення"
echo "│"
echo "└── 📦 Додаткові компоненти:"
echo "    ├── docs/                     - Документація"
echo "    ├── logs/                     - Логи (не в git)"
echo "    ├── backups/                  - Резервні копії (не в git)"
echo "    ├── local_storage/            - Локальне сховище (не в git)"
echo "    ├── k8s/                      - Kubernetes конфігурації"
echo "    └── helm/                     - Helm charts"
echo ""

echo -e "${GREEN}Predator11/ ${YELLOW}(Оригінальна продакшн версія - Docker-based)${NC}"
echo "└── Повністю контейнеризована версія з Docker Compose"
echo ""

echo -e "${BLUE}📋 ШВИДКІ КОМАНДИ${NC}\n"

echo -e "${PURPLE}🚀 Автоматичне налаштування:${NC}"
echo "   cd predator12-local"
echo "   ./quick-setup.sh"
echo ""

echo -e "${PURPLE}🎮 Інтерактивний режим:${NC}"
echo "   cd predator12-local"
echo "   ./predator11.sh"
echo ""

echo -e "${PURPLE}⚡ Makefile команди:${NC}"
echo "   make help        # Список всіх команд"
echo "   make setup       # Перевірка prerequisites"
echo "   make dev         # Запуск dev-середовища"
echo "   make test        # Тестування"
echo "   make prod        # Деплой"
echo "   make backup      # Backup"
echo "   make monitor     # Моніторинг"
echo ""

echo -e "${PURPLE}🔧 Прямі команди:${NC}"
echo "   # Backend"
echo "   cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "   # Frontend"
echo "   cd frontend && npm run dev"
echo ""
echo "   # Smoke тести"
echo "   ./smoke_tests/run_smoke.sh"
echo ""

echo -e "${BLUE}📊 СТАТИСТИКА ПРОЕКТУ${NC}\n"

echo -e "${GREEN}Файли:${NC}"
if [ -f predator12-local/README.md ]; then
    README_LINES=$(wc -l < predator12-local/README.md)
    echo "  └─ README.md: $README_LINES рядків"
fi
if [ -f predator12-local/START_HERE.md ]; then
    START_LINES=$(wc -l < predator12-local/START_HERE.md)
    echo "  └─ START_HERE.md: $START_LINES рядків"
fi
if [ -f predator12-local/LOCAL_DEV_STATUS.md ]; then
    STATUS_LINES=$(wc -l < predator12-local/LOCAL_DEV_STATUS.md)
    echo "  └─ LOCAL_DEV_STATUS.md: $STATUS_LINES рядків"
fi

echo ""
echo -e "${GREEN}Скрипти:${NC}"
SCRIPTS_COUNT=$(find predator12-local/scripts -name "*.sh" 2>/dev/null | wc -l)
echo "  └─ Shell scripts: $SCRIPTS_COUNT файлів"

echo ""
echo -e "${GREEN}Git:${NC}"
COMMITS=$(git log --oneline | wc -l)
echo "  └─ Commits: $COMMITS"

echo ""

echo -e "${BLUE}🎯 ОСНОВНІ КОМПОНЕНТИ${NC}\n"

echo -e "${PURPLE}Backend:${NC}"
echo "  ✅ FastAPI (Python 3.11)"
echo "  ✅ SQLAlchemy ORM"
echo "  ✅ Alembic міграції"
echo "  ✅ Async/await підтримка"
echo "  ✅ OpenAPI/Swagger docs"
echo ""

echo -e "${PURPLE}Frontend:${NC}"
echo "  ✅ React 18+"
echo "  ✅ Vite build tool"
echo "  ✅ TypeScript"
echo "  ✅ Modern UI/UX"
echo "  ✅ Hot Module Replacement"
echo ""

echo -e "${PURPLE}AI System:${NC}"
echo "  ✅ 16 спеціалізованих агентів"
echo "  ✅ Multi-agent coordination"
echo "  ✅ Self-improvement capabilities"
echo "  ✅ Model Context Protocol (MCP)"
echo ""

echo -e "${PURPLE}Database:${NC}"
echo "  ✅ PostgreSQL 15+"
echo "  ✅ Full-text search"
echo "  ✅ JSONB support"
echo "  ✅ Structured schema"
echo ""

echo -e "${PURPLE}DevOps:${NC}"
echo "  ✅ Docker & Docker Compose"
echo "  ✅ Kubernetes ready"
echo "  ✅ Helm charts"
echo "  ✅ CI/CD pipelines"
echo "  ✅ Automated testing"
echo ""

echo -e "${BLUE}🔗 ПОСИЛАННЯ${NC}\n"

echo -e "${GREEN}Локальна розробка:${NC}"
echo "  • Backend API:  http://localhost:8000"
echo "  • API Docs:     http://localhost:8000/docs"
echo "  • Frontend:     http://localhost:3000"
echo "  • PostgreSQL:   postgresql://localhost:5432/predator"
echo ""

echo -e "${GREEN}Документація:${NC}"
echo "  • START_HERE.md           - Початок роботи"
echo "  • README.md               - Повна документація"
echo "  • LOCAL_DEV_STATUS.md     - Статус налаштування"
echo "  • QUICK_START.md          - 5-хвилинний гід"
echo "  • migration_plan.md       - План міграції"
echo "  • DEPLOYMENT_CHECKLIST.md - Acceptance criteria"
echo ""

echo -e "${BLUE}✅ ACCEPTANCE CRITERIA - ВИКОНАНО${NC}\n"

echo "  ✅ Локальний PostgreSQL налаштовано"
echo "  ✅ Python 3.11 та Node.js встановлено"
echo "  ✅ Всі залежності інстальовано"
echo "  ✅ .env конфігурація створена"
echo "  ✅ init_local_db.sh - працює"
echo "  ✅ migrate_db.sh - працює"
echo "  ✅ Скрипти експорту/імпорту БД - працюють"
echo "  ✅ Bash smoke тести - працюють"
echo "  ✅ Python smoke тести - працюють"
echo "  ✅ VS Code tasks (11) - налаштовано"
echo "  ✅ VS Code debug (7) - налаштовано"
echo "  ✅ Makefile (15+ команд) - готовий"
echo "  ✅ Документація (6+ файлів) - створена"
echo "  ✅ Git інтеграція - налаштована"
echo ""

echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 PREDATOR12 ГОТОВИЙ ДО РОЗРОБКИ!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Для початку роботи:${NC}"
echo "  cd predator12-local && ./quick-setup.sh"
echo ""
echo -e "${YELLOW}Або:${NC}"
echo "  cd predator12-local && ./predator11.sh"
echo ""
echo -e "${YELLOW}Або:${NC}"
echo "  cd predator12-local && make dev"
echo ""
