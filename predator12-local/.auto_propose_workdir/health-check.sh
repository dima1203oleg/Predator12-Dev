#!/usr/bin/env bash

# ==============================================
# Health Check Script for Predator12 Local Dev
# ==============================================

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Predator12 Health Check                    ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}\n"

# 1. Python version
echo -e "${YELLOW}[1/8] Checking Python version...${NC}"
python_version=$(python3.11 --version 2>&1 || echo "NOT FOUND")
if [[ "$python_version" == *"3.11"* ]]; then
    echo -e "${GREEN}✓ Python 3.11 found: $python_version${NC}\n"
else
    echo -e "${RED}✗ Python 3.11 NOT FOUND${NC}\n"
fi

# 2. Virtual environment
echo -e "${YELLOW}[2/8] Checking virtual environment...${NC}"
if [ -d "venv" ]; then
    echo -e "${GREEN}✓ venv/ directory exists${NC}"
    if [ -f "venv/bin/activate" ]; then
        echo -e "${GREEN}✓ Virtual environment is ready${NC}\n"
    else
        echo -e "${RED}✗ venv/bin/activate not found${NC}\n"
    fi
else
    echo -e "${RED}✗ venv/ directory not found${NC}\n"
fi

# 3. Ports check
echo -e "${YELLOW}[3/8] Checking ports availability...${NC}"
for port in 8000 3000 9200 6379; do
    if lsof -iTCP:$port -sTCP:LISTEN -n -P > /dev/null 2>&1; then
        echo -e "${RED}✗ Port $port is BUSY${NC}"
    else
        echo -e "${GREEN}✓ Port $port is FREE${NC}"
    fi
done
# Special check for Postgres (should be busy)
if lsof -iTCP:5432 -sTCP:LISTEN -n -P > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Port 5432 (Postgres) is ACTIVE${NC}\n"
else
    echo -e "${RED}✗ Port 5432 (Postgres) is NOT RUNNING${NC}\n"
fi

# 4. Database connection (if venv exists)
echo -e "${YELLOW}[4/8] Checking database connectivity...${NC}"
if [ -f "venv/bin/python" ]; then
    db_check=$(venv/bin/python -c "
import os
import sys
try:
    import psycopg
    print('psycopg3:OK')
except ImportError:
    print('psycopg3:MISSING')
" 2>&1)
    if [[ "$db_check" == *"OK"* ]]; then
        echo -e "${GREEN}✓ psycopg3 is installed${NC}\n"
    else
        echo -e "${RED}✗ psycopg3 not installed${NC}\n"
    fi
else
    echo -e "${YELLOW}⊘ Skipping (venv not activated)${NC}\n"
fi

# 5. Key Python imports
echo -e "${YELLOW}[5/8] Testing key Python imports...${NC}"
if [ -f "venv/bin/python" ]; then
    venv/bin/python -c "
import sys
errors = []

try:
    import fastapi
    print('✓ FastAPI:', fastapi.__version__)
except ImportError as e:
    errors.append('FastAPI')

try:
    import pydantic
    print('✓ Pydantic:', pydantic.__version__)
except ImportError:
    errors.append('Pydantic')

try:
    import sqlalchemy
    print('✓ SQLAlchemy:', sqlalchemy.__version__)
except ImportError:
    errors.append('SQLAlchemy')

try:
    import numpy
    print('✓ NumPy:', numpy.__version__)
except ImportError:
    errors.append('NumPy')

try:
    import pandas
    print('✓ Pandas:', pandas.__version__)
except ImportError:
    errors.append('Pandas')

try:
    import httpx
    print('✓ httpx:', httpx.__version__)
except ImportError:
    errors.append('httpx')

try:
    import telethon
    print('✓ Telethon:', telethon.__version__)
except ImportError:
    errors.append('Telethon')

if errors:
    print(f'\n✗ Missing packages: {', '.join(errors)}', file=sys.stderr)
    sys.exit(1)
" 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ All key packages imported successfully${NC}\n"
    else
        echo -e "${RED}✗ Some packages failed to import${NC}\n"
    fi
else
    echo -e "${YELLOW}⊘ Skipping (venv not found)${NC}\n"
fi

# 6. Frontend dependencies
echo -e "${YELLOW}[6/8] Checking frontend dependencies...${NC}"
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓ frontend/node_modules exists${NC}"
    if [ -f "frontend/package.json" ]; then
        echo -e "${GREEN}✓ frontend/package.json found${NC}\n"
    fi
else
    echo -e "${RED}✗ frontend/node_modules not found (run: cd frontend && npm install)${NC}\n"
fi

# 7. Alembic migrations
echo -e "${YELLOW}[7/8] Checking Alembic migrations...${NC}"
if [ -d "backend/alembic/versions" ]; then
    migration_count=$(ls -1 backend/alembic/versions/*.py 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ Found $migration_count migration(s)${NC}\n"
else
    echo -e "${RED}✗ backend/alembic/versions not found${NC}\n"
fi

# 8. Environment files
echo -e "${YELLOW}[8/8] Checking environment configuration...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    if grep -q "DATABASE_URL" .env 2>/dev/null; then
        echo -e "${GREEN}✓ DATABASE_URL configured${NC}"
    else
        echo -e "${YELLOW}⚠ DATABASE_URL not found in .env${NC}"
    fi
else
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "${YELLOW}  → Copy .env.example to .env and configure${NC}"
fi
echo ""

# Final summary
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Health Check Complete!                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Run migration: ${YELLOW}./migrate-to-python311.sh${NC}"
echo -e "  2. Initialize DB: ${YELLOW}./scripts/init_local_db.sh${NC}"
echo -e "  3. Run migrations: ${YELLOW}cd backend && alembic upgrade head${NC}"
echo -e "  4. Start backend: ${YELLOW}cd backend && uvicorn app.main:app --reload --port 8000${NC}"
echo -e "  5. Start frontend: ${YELLOW}cd frontend && npm run dev${NC}\n"
