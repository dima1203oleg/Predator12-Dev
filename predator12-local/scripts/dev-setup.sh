#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting Dev Container setup..."

# --- Python Dependencies ---
echo "Installing Python dependencies..."
# Assuming requirements.txt exists for backend dependencies
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
elif [ -f "pyproject.toml" ]; then
    # If using Poetry or similar, adjust command accordingly
    # For simplicity, assuming pip and requirements.txt for now
    echo "pyproject.toml found, but assuming requirements.txt for pip installation."
    # If Poetry is preferred, uncomment and adapt:
    # pip install poetry
    # poetry install
else
    echo "No requirements.txt or pyproject.toml found. Skipping Python dependency installation."
fi

# --- Node.js Dependencies ---
echo "Installing Node.js dependencies..."
# Assuming package.json exists for frontend dependencies
if [ -f "frontend/package.json" ]; then
    cd frontend
    npm ci # Use npm ci for cleaner installs in CI/container environments
    cd ..
elif [ -f "package.json" ]; then
    # If package.json is at the root for a monorepo setup
    npm ci
else
    echo "No package.json found in frontend or root. Skipping Node.js dependency installation."
fi

# --- Database Setup (Example for PostgreSQL) ---
# This part might be handled by docker-compose.yml or a separate migration script.
# If migrations need to be run here, adapt accordingly.
echo "Setting up database (if applicable)..."
# Example: Running Alembic migrations for SQLAlchemy
# if [ -d "backend/alembic" ]; then
#     echo "Running database migrations..."
#     cd backend
#     alembic upgrade head
#     cd ..
# fi

# --- Start Local Services (if not managed by docker-compose) ---
# The devcontainer.json forwards ports for these services,
# but they might need to be explicitly started if not using docker-compose up.
# For now, we assume docker-compose will handle this when the container is launched.

# --- Ollama ---
echo "Ensuring Ollama is running..."
# Ollama server should be started automatically or via a command.
# The Dockerfile already pulls the mistral model.
# We can check if the server is accessible.
if ! curl --fail http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Ollama server not running or accessible. Please ensure it starts automatically or manually start it."
    # You might add a command here to start ollama if it's not auto-starting
    # e.g., ollama serve &
fi

# --- Redis ---
echo "Ensuring Redis is running..."
# Redis is typically started via docker-compose. If not, you might need:
# redis-server --daemonize yes

# --- Qdrant ---
echo "Ensuring Qdrant is running..."
# Qdrant is typically started via docker-compose.

echo "Dev Container setup complete."
echo "You can now open the project in VS Code and start developing."
