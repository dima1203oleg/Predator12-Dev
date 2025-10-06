FROM python:3.11-slim

# Run as root initially for system operations
USER root

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r predator11 || true && useradd -r -g predator11 predator11 || true

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY synthetic_data_agent.py .

# Set ownership for non-root user
RUN chown -R predator11:predator11 /app

# Switch to non-root user
USER predator11

# Expose port
EXPOSE 9015

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9015/health || exit 1

# Run the application
CMD ["python", "synthetic_data_agent.py"]
