FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    docker.io \
    procps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional dependencies for agents
RUN pip install --no-cache-dir \
    qdrant-client==1.7.0 \
    kafka-python==2.0.2 \
    aioredis==2.0.1 \
    asyncpg==0.29.0 \
    docker==7.0.0 \
    psutil==5.9.6 \
    scikit-learn==1.3.2 \
    numpy==1.24.4 \
    prometheus-client==0.19.0 \
    requests==2.31.0

# Copy agents code
COPY . .

# Create non-root user
RUN useradd -r -u 1001 predator11 && \
    chown -R predator11:predator11 /app

USER predator11

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8001/health')" || exit 1

# Default command (can be overridden)
CMD ["python", "supervisor.py"]
