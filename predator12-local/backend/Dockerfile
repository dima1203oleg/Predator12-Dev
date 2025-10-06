# ============================================================================
#                    PREDATOR11 BACKEND PRODUCTION DOCKERFILE
#           Multi-stage build for optimized production container
# ============================================================================

# Build stage
FROM python:3.11-slim as builder

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt ./

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Create non-root user
RUN groupadd -r predator11 && useradd -r -g predator11 predator11

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set work directory
WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/logs /tmp /var/run && \
    chown -R predator11:predator11 /app /tmp /var/run

# Copy application code
COPY --chown=predator11:predator11 . .

# Remove unnecessary files
RUN find . -type f -name "*.pyc" -delete && \
    find . -type d -name "__pycache__" -delete && \
    rm -rf .git .pytest_cache .mypy_cache

# Switch to non-root user
USER predator11

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5001/healthz/readiness || exit 1

# Expose port
EXPOSE 5001

# Set environment variables
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=5001

# Start command
CMD ["/opt/venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5001", "--workers", "4"]
