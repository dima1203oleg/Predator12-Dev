#!/bin/bash

# Predator Analytics System Backup Script
# Creates comprehensive backups of all system components

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="predator_backup_$TIMESTAMP"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory: $BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
    cd "$BACKUP_DIR/$BACKUP_NAME"
}

# Backup PostgreSQL database
backup_postgres() {
    log_info "Backing up PostgreSQL database..."
    
    if command -v kubectl &> /dev/null; then
        # Kubernetes deployment
        kubectl exec deployment/postgres -- pg_dumpall -U predator_user > postgres_backup.sql
        
        # Also backup individual database with custom format
        kubectl exec deployment/postgres -- pg_dump -U predator_user -Fc predator_nexus > predator_nexus.pgdump
    else
        # Docker deployment
        docker exec predator_postgres pg_dumpall -U predator_user > postgres_backup.sql
        docker exec predator_postgres pg_dump -U predator_user -Fc predator_nexus > predator_nexus.pgdump
    fi
    
    log_info "PostgreSQL backup completed ✅"
}

# Backup Redis data
backup_redis() {
    log_info "Backing up Redis data..."
    
    if command -v kubectl &> /dev/null; then
        # Kubernetes deployment
        kubectl exec deployment/redis -- redis-cli --rdb redis_backup.rdb
        kubectl cp deployment/redis:/data/redis_backup.rdb ./redis_backup.rdb
    else
        # Docker deployment
        docker exec predator_redis redis-cli --rdb /data/redis_backup.rdb
        docker cp predator_redis:/data/redis_backup.rdb ./redis_backup.rdb
    fi
    
    log_info "Redis backup completed ✅"
}

# Backup OpenSearch indices
backup_opensearch() {
    log_info "Backing up OpenSearch indices..."
    
    # Create snapshot repository if it doesn't exist
    curl -X PUT "opensearch-node:9200/_snapshot/backup_repo" -H 'Content-Type: application/json' -d'
    {
        "type": "fs",
        "settings": {
            "location": "/usr/share/opensearch/backup",
            "compress": true
        }
    }' 2>/dev/null || true
    
    # Create snapshot
    curl -X PUT "opensearch-node:9200/_snapshot/backup_repo/snapshot_$TIMESTAMP" -H 'Content-Type: application/json' -d'
    {
        "indices": "*",
        "ignore_unavailable": true,
        "include_global_state": false
    }'
    
    # Wait for completion and download
    sleep 30
    if command -v kubectl &> /dev/null; then
        kubectl exec deployment/opensearch-node -- tar -czf /tmp/opensearch_backup.tar.gz -C /usr/share/opensearch/backup .
        kubectl cp deployment/opensearch-node:/tmp/opensearch_backup.tar.gz ./opensearch_backup.tar.gz
    else
        docker exec opensearch-node tar -czf /tmp/opensearch_backup.tar.gz -C /usr/share/opensearch/backup .
        docker cp opensearch-node:/tmp/opensearch_backup.tar.gz ./opensearch_backup.tar.gz
    fi
    
    log_info "OpenSearch backup completed ✅"
}

# Backup MLflow artifacts
backup_mlflow() {
    log_info "Backing up MLflow artifacts..."
    
    if command -v kubectl &> /dev/null; then
        kubectl exec deployment/mlflow -- tar -czf /tmp/mlflow_backup.tar.gz -C /mlflow .
        kubectl cp deployment/mlflow:/tmp/mlflow_backup.tar.gz ./mlflow_backup.tar.gz
    else
        docker exec mlflow tar -czf /tmp/mlflow_backup.tar.gz -C /mlflow .
        docker cp mlflow:/tmp/mlflow_backup.tar.gz ./mlflow_backup.tar.gz
    fi
    
    log_info "MLflow backup completed ✅"
}

# Backup Qdrant collections
backup_qdrant() {
    log_info "Backing up Qdrant collections..."
    
    # Get list of collections
    collections=$(curl -s "http://qdrant:6333/collections" | jq -r '.result.collections[].name' 2>/dev/null || echo "")
    
    if [ -n "$collections" ]; then
        mkdir -p qdrant_backup
        for collection in $collections; do
            log_info "Backing up Qdrant collection: $collection"
            curl -s "http://qdrant:6333/collections/$collection/snapshots" -X POST > "qdrant_backup/${collection}_snapshot.json"
        done
        
        # Copy snapshot files
        if command -v kubectl &> /dev/null; then
            kubectl exec deployment/qdrant -- tar -czf /tmp/qdrant_backup.tar.gz -C /qdrant/storage .
            kubectl cp deployment/qdrant:/tmp/qdrant_backup.tar.gz ./qdrant_backup.tar.gz
        else
            docker exec qdrant tar -czf /tmp/qdrant_backup.tar.gz -C /qdrant/storage .
            docker cp qdrant:/tmp/qdrant_backup.tar.gz ./qdrant_backup.tar.gz
        fi
    fi
    
    log_info "Qdrant backup completed ✅"
}

# Backup application configurations
backup_configs() {
    log_info "Backing up application configurations..."
    
    mkdir -p configs
    
    if command -v kubectl &> /dev/null; then
        # Kubernetes configs
        kubectl get configmaps -o yaml > configs/configmaps.yaml
        kubectl get secrets -o yaml > configs/secrets.yaml
        kubectl get deployments -o yaml > configs/deployments.yaml
        kubectl get services -o yaml > configs/services.yaml
        kubectl get ingresses -o yaml > configs/ingresses.yaml
    else
        # Docker configs
        cp -r ../docker-compose.yml configs/ 2>/dev/null || true
        cp -r ../.env configs/ 2>/dev/null || true
    fi
    
    log_info "Configuration backup completed ✅"
}

# Backup monitoring data
backup_monitoring() {
    log_info "Backing up monitoring data..."
    
    # Prometheus data (lightweight export)
    curl -s "http://prometheus:9090/api/v1/label/__name__/values" > prometheus_metrics.json 2>/dev/null || true
    
    # Grafana dashboards
    mkdir -p grafana_dashboards
    if command -v kubectl &> /dev/null; then
        kubectl exec deployment/grafana -- find /var/lib/grafana/dashboards -name "*.json" -exec cp {} /tmp/ \; 2>/dev/null || true
        kubectl cp deployment/grafana:/tmp/ ./grafana_dashboards/ 2>/dev/null || true
    else
        docker cp grafana:/var/lib/grafana/dashboards ./grafana_dashboards 2>/dev/null || true
    fi
    
    log_info "Monitoring backup completed ✅"
}

# Create backup manifest
create_manifest() {
    log_info "Creating backup manifest..."
    
    cat > backup_manifest.json <<EOF
{
    "backup_name": "$BACKUP_NAME",
    "timestamp": "$TIMESTAMP",
    "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "1.0",
    "components": {
        "postgresql": {
            "files": ["postgres_backup.sql", "predator_nexus.pgdump"],
            "size": "$(du -sh postgres_backup.sql 2>/dev/null | cut -f1 || echo 'N/A')"
        },
        "redis": {
            "files": ["redis_backup.rdb"],
            "size": "$(du -sh redis_backup.rdb 2>/dev/null | cut -f1 || echo 'N/A')"
        },
        "opensearch": {
            "files": ["opensearch_backup.tar.gz"],
            "size": "$(du -sh opensearch_backup.tar.gz 2>/dev/null | cut -f1 || echo 'N/A')"
        },
        "mlflow": {
            "files": ["mlflow_backup.tar.gz"],
            "size": "$(du -sh mlflow_backup.tar.gz 2>/dev/null | cut -f1 || echo 'N/A')"
        },
        "qdrant": {
            "files": ["qdrant_backup.tar.gz"],
            "size": "$(du -sh qdrant_backup.tar.gz 2>/dev/null | cut -f1 || echo 'N/A')"
        },
        "configs": {
            "files": ["configs/"],
            "size": "$(du -sh configs/ 2>/dev/null | cut -f1 || echo 'N/A')"
        }
    },
    "total_size": "$(du -sh . | cut -f1)",
    "checksum": "$(find . -type f -exec sha256sum {} \; | sha256sum | cut -d' ' -f1)"
}
EOF

    log_info "Backup manifest created ✅"
}

# Compress backup
compress_backup() {
    log_info "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME/"
    
    # Calculate final size and checksum
    FINAL_SIZE=$(du -sh "${BACKUP_NAME}.tar.gz" | cut -f1)
    FINAL_CHECKSUM=$(sha256sum "${BACKUP_NAME}.tar.gz" | cut -d' ' -f1)
    
    log_info "Backup compressed: ${BACKUP_NAME}.tar.gz ($FINAL_SIZE)"
    log_info "Checksum: $FINAL_CHECKSUM"
    
    # Update manifest with final info
    echo "$FINAL_CHECKSUM" > "${BACKUP_NAME}.tar.gz.sha256"
}

# Clean old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -name "predator_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "predator_backup_*.tar.gz.sha256" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -type d -name "predator_backup_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true
    
    log_info "Old backups cleaned up ✅"
}

# Send backup notification
send_notification() {
    local status=$1
    local message=$2
    
    # Webhook notification
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"🔄 Predator Analytics Backup\",
                \"attachments\": [{
                    \"color\": \"$([ "$status" = "success" ] && echo "good" || echo "danger")\",
                    \"fields\": [
                        {\"title\": \"Status\", \"value\": \"$status\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"$TIMESTAMP\", \"short\": true},
                        {\"title\": \"Message\", \"value\": \"$message\", \"short\": false}
                    ]
                }]
            }" 2>/dev/null || true
    fi
    
    # Email notification (if configured)
    if [ -n "$EMAIL_TO" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "Predator Analytics Backup - $status" "$EMAIL_TO" 2>/dev/null || true
    fi
}

# Main backup function
run_backup() {
    log_info "🔄 Starting Predator Analytics backup ($TIMESTAMP)"
    
    local start_time=$(date +%s)
    
    create_backup_dir
    
    # Run backup components
    backup_postgres || log_warn "PostgreSQL backup failed"
    backup_redis || log_warn "Redis backup failed"
    backup_opensearch || log_warn "OpenSearch backup failed"
    backup_mlflow || log_warn "MLflow backup failed"
    backup_qdrant || log_warn "Qdrant backup failed"
    backup_configs || log_warn "Config backup failed"
    backup_monitoring || log_warn "Monitoring backup failed"
    
    create_manifest
    compress_backup
    cleanup_old_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log_info "✅ Backup completed in ${duration}s"
    log_info "📦 Backup file: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    send_notification "success" "Backup completed successfully in ${duration}s. File: ${BACKUP_NAME}.tar.gz"
}

# Restore function
restore_backup() {
    local backup_file=$1
    
    if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log_info "🔄 Starting restore from: $backup_file"
    
    # Verify checksum
    if [ -f "${backup_file}.sha256" ]; then
        log_info "Verifying backup checksum..."
        if ! sha256sum -c "${backup_file}.sha256"; then
            log_error "Checksum verification failed!"
            exit 1
        fi
        log_info "Checksum verified ✅"
    fi
    
    # Extract backup
    local restore_dir="/tmp/restore_$(date +%s)"
    mkdir -p "$restore_dir"
    tar -xzf "$backup_file" -C "$restore_dir"
    
    cd "$restore_dir"/predator_backup_*/
    
    # Restore PostgreSQL
    if [ -f "postgres_backup.sql" ]; then
        log_info "Restoring PostgreSQL..."
        if command -v kubectl &> /dev/null; then
            kubectl exec -i deployment/postgres -- psql -U predator_user < postgres_backup.sql
        else
            docker exec -i predator_postgres psql -U predator_user < postgres_backup.sql
        fi
        log_info "PostgreSQL restored ✅"
    fi
    
    # Restore Redis
    if [ -f "redis_backup.rdb" ]; then
        log_info "Restoring Redis..."
        if command -v kubectl &> /dev/null; then
            kubectl cp redis_backup.rdb deployment/redis:/data/dump.rdb
            kubectl exec deployment/redis -- redis-cli DEBUG RELOAD
        else
            docker cp redis_backup.rdb predator_redis:/data/dump.rdb
            docker exec predator_redis redis-cli DEBUG RELOAD
        fi
        log_info "Redis restored ✅"
    fi
    
    # Add more restore operations as needed...
    
    log_info "✅ Restore completed"
    
    # Cleanup
    rm -rf "$restore_dir"
}

# Main script logic
case "${1:-backup}" in
    "backup")
        run_backup
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "list")
        log_info "Available backups:"
        find "$BACKUP_DIR" -name "predator_backup_*.tar.gz" -printf "%f %TY-%Tm-%Td %TH:%TM\n" | sort -r
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 [backup|restore <file>|list|cleanup]"
        exit 1
        ;;
esac
