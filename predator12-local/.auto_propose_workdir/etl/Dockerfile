FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    AIRFLOW_HOME=/opt/airflow \
    AIRFLOW__CORE__DAGS_FOLDER=/opt/airflow/dags \
    AIRFLOW__CORE__PLUGINS_FOLDER=/opt/airflow/plugins \
    AIRFLOW__CORE__EXECUTOR=CeleryExecutor

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create airflow user
RUN useradd --create-home --shell /bin/bash airflow

# Set up directories
RUN mkdir -p /opt/airflow/dags /opt/airflow/logs /opt/airflow/plugins && \
    chown -R airflow:airflow /opt/airflow

# Install Airflow and dependencies
RUN pip install --no-cache-dir \
    apache-airflow[celery,postgres,redis]==2.8.0 \
    celery \
    psycopg2-binary \
    redis

# Copy DAGs
COPY etl/dags/ /opt/airflow/dags/

# Copy requirements and install custom dependencies
COPY etl/requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Switch to airflow user
USER airflow

WORKDIR /opt/airflow

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD airflow db check || exit 1

EXPOSE 8080

# Default command (can be overridden)
CMD ["airflow", "webserver"]
