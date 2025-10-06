# Dockerfile for Predator Analytics FastAPI Backend
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry for dependency management
RUN pip install poetry

# Copy dependency files
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-dev --no-interaction --no-ansi

# Copy the application code
COPY fastapi_app ./fastapi_app

# Expose the port for FastAPI
EXPOSE 8000

# Command to run the application with Uvicorn
CMD ["uvicorn", "fastapi_app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 