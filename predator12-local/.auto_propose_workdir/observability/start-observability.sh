#!/bin/bash

# Create necessary directories
mkdir -p prometheus-data
mkdir -p grafana-data
mkdir -p alertmanager-data
mkdir -p loki-data

# Set permissions
chmod -R 777 prometheus-data
chmod -R 777 grafana-data
chmod -R 777 alertmanager-data
chmod -R 777 loki-data

# Start services
echo "Starting observability stack..."
docker-compose up -d

echo "Waiting for services to start..."
sleep 10

echo "Services started:"
echo "- Grafana: http://localhost:3000 (admin/admin)"
echo "- Prometheus: http://localhost:9090"
echo "- Alertmanager: http://localhost:9093"
echo "- cAdvisor: http://localhost:8082"
echo "- Loki: http://localhost:3100"
