#!/bin/bash

# 🚀 Predator Analytics - Helm Migration Script
# Автоматичний перехід з Docker Compose на Kubernetes + Helm

set -euo pipefail

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Логування
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Конфігурація
NAMESPACE="predator-analytics"
RELEASE_NAME="predator"
HELM_CHART_PATH="./helm/predator-analytics"
KUBERNETES_CONTEXT="default"
BACKUP_DIR="./backup/$(date +%Y%m%d_%H%M%S)"

# Функції

check_prerequisites() {
    log "Перевірка передумов..."
    
    # Перевірка kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl не встановлено"
        exit 1
    fi
    
    # Перевірка helm
    if ! command -v helm &> /dev/null; then
        error "Helm не встановлено"
        exit 1
    fi
    
    # Перевірка доступу до кластера
    if ! kubectl cluster-info &> /dev/null; then
        error "Немає доступу до Kubernetes кластера"
        exit 1
    fi
    
    success "Всі передумови виконані"
}

backup_current_state() {
    log "Створення резервної копії поточного стану..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup Docker Compose
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$BACKUP_DIR/"
    fi
    
    if [ -f "docker-compose.dashboard.yml" ]; then
        cp docker-compose.dashboard.yml "$BACKUP_DIR/"
    fi
    
    # Backup env files
    if [ -f ".env" ]; then
        cp .env "$BACKUP_DIR/"
    fi
    
    if [ -f ".env.production" ]; then
        cp .env.production "$BACKUP_DIR/"
    fi
    
    # Backup database if running
    if docker-compose ps | grep -q postgres; then
        log "Створення backup бази даних..."
        docker-compose exec -T postgres pg_dump -U predator predator > "$BACKUP_DIR/database_backup.sql"
    fi
    
    success "Резервна копія створена в $BACKUP_DIR"
}

prepare_namespace() {
    log "Підготовка namespace $NAMESPACE..."
    
    # Створення namespace
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Мітки для namespace
    kubectl label namespace "$NAMESPACE" name="$NAMESPACE" --overwrite
    kubectl label namespace "$NAMESPACE" app="predator-analytics" --overwrite
    
    success "Namespace $NAMESPACE готовий"
}

setup_secrets() {
    log "Налаштування секретів..."
    
    # PostgreSQL секрет
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    kubectl create secret generic "$RELEASE_NAME-postgresql" \
        --from-literal=postgres-password="$POSTGRES_PASSWORD" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Redis секрет
    REDIS_PASSWORD=$(openssl rand -base64 32)
    kubectl create secret generic "$RELEASE_NAME-redis" \
        --from-literal=redis-password="$REDIS_PASSWORD" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # TLS секрет для ingress (якщо потрібен)
    if [ ! -z "${TLS_CERT:-}" ] && [ ! -z "${TLS_KEY:-}" ]; then
        kubectl create secret tls "$RELEASE_NAME-tls" \
            --cert="$TLS_CERT" \
            --key="$TLS_KEY" \
            --namespace="$NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -
    fi
    
    success "Секрети налаштовані"
}

build_and_push_images() {
    log "Збірка та push Docker images..."
    
    # Отримання registry з параметрів або використання за замовчуванням
    REGISTRY=${DOCKER_REGISTRY:-"localhost:5000"}
    
    # Frontend
    log "Збірка frontend image..."
    docker build -t "$REGISTRY/predator-analytics/frontend:1.0.0" \
        --build-arg NODE_ENV=production \
        --build-arg REACT_APP_VOICE_ENABLED=true \
        --build-arg REACT_APP_MODELS_COUNT=58 \
        --build-arg REACT_APP_AI_FEEDBACK_LEVELS=4 \
        ./frontend
    
    # Backend
    log "Збірка backend image..."
    docker build -t "$REGISTRY/predator-analytics/backend:1.0.0" \
        --build-arg MODELS_ENABLED=58_free_models \
        --build-arg AI_FEEDBACK_LEVELS=4 \
        --build-arg ADAPTIVE_ROUTING=true \
        ./backend
    
    # Push images (якщо не localhost registry)
    if [[ "$REGISTRY" != "localhost:5000" ]]; then
        docker push "$REGISTRY/predator-analytics/frontend:1.0.0"
        docker push "$REGISTRY/predator-analytics/backend:1.0.0"
    fi
    
    success "Images готові"
}

install_dependencies() {
    log "Встановлення Helm dependencies..."
    
    # Додавання репозиторіїв
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo add opensearch https://opensearch-project.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Встановлення dependencies
    helm dependency update "$HELM_CHART_PATH"
    
    success "Dependencies встановлені"
}

deploy_application() {
    log "Розгортання Predator Analytics..."
    
    # Створення values файлу з кастомними налаштуваннями
    cat > /tmp/custom-values.yaml << EOF
global:
  imageRegistry: "${DOCKER_REGISTRY:-localhost:5000}"

voiceAssistant:
  enabled: true
  speechRecognition:
    enabled: true
    language: "uk-UA"
  textToSpeech:
    enabled: true

agents:
  multiLevelFeedback:
    enabled: true
    levels: 4
    thresholds: [0.9, 0.75, 0.6, 0.4]
    adaptiveRouting: true
    performanceTracking: true

modelRegistry:
  freeModels:
    reasoning: 12
    code: 10
    quick: 8
    embed: 8
    vision: 6
    gen: 4

ingress:
  enabled: true
  hosts:
    - host: predator-analytics.local
      paths:
        - path: /
          pathType: Prefix
          service:
            name: predator-frontend
            port: 80

monitoring:
  enabled: true
  grafana:
    enabled: true
  prometheus:
    enabled: true
EOF

    # Розгортання
    helm upgrade --install "$RELEASE_NAME" "$HELM_CHART_PATH" \
        --namespace "$NAMESPACE" \
        --values /tmp/custom-values.yaml \
        --timeout 10m \
        --wait
    
    success "Predator Analytics розгорнуто!"
}

verify_deployment() {
    log "Перевірка розгортання..."
    
    # Перевірка подів
    kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/instance=$RELEASE_NAME"
    
    # Перевірка сервісів
    kubectl get svc -n "$NAMESPACE" -l "app.kubernetes.io/instance=$RELEASE_NAME"
    
    # Перевірка ingress
    kubectl get ingress -n "$NAMESPACE"
    
    # Перевірка готовності
    kubectl wait --for=condition=ready pod -l "app.kubernetes.io/instance=$RELEASE_NAME" -n "$NAMESPACE" --timeout=300s
    
    success "Розгортання успішне!"
}

setup_monitoring() {
    log "Налаштування моніторингу..."
    
    # Дочекатися готовності Grafana
    kubectl wait --for=condition=ready pod -l "app.kubernetes.io/name=grafana" -n "$NAMESPACE" --timeout=300s
    
    # Отримання паролю Grafana
    GRAFANA_PASSWORD=$(kubectl get secret "$RELEASE_NAME-grafana" -n "$NAMESPACE" -o jsonpath="{.data.admin-password}" | base64 --decode)
    
    # Port-forward для доступу до Grafana
    log "Grafana доступна через port-forward на порту 3000"
    log "Користувач: admin, Пароль: $GRAFANA_PASSWORD"
    
    success "Моніторинг налаштовано"
}

cleanup_old_deployment() {
    log "Очищення старого Docker Compose розгортання..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down -v || true
    fi
    
    if [ -f "docker-compose.dashboard.yml" ]; then
        docker-compose -f docker-compose.dashboard.yml down -v || true
    fi
    
    success "Старе розгортання очищено"
}

show_access_info() {
    log "Інформація про доступ:"
    
    # Frontend URL
    echo "🌐 Frontend: http://predator-analytics.local"
    echo "📊 Grafana: http://predator-analytics.local/grafana"
    echo "🔍 Prometheus: http://predator-analytics.local/prometheus"
    
    # Port-forward команди
    echo ""
    echo "🔧 Port-forward команди:"
    echo "kubectl port-forward svc/$RELEASE_NAME-frontend 8080:80 -n $NAMESPACE"
    echo "kubectl port-forward svc/$RELEASE_NAME-grafana 3000:80 -n $NAMESPACE"
    echo "kubectl port-forward svc/$RELEASE_NAME-prometheus 9090:80 -n $NAMESPACE"
    
    # Логи
    echo ""
    echo "📋 Команди для перегляду логів:"
    echo "kubectl logs -f deployment/$RELEASE_NAME-backend -n $NAMESPACE"
    echo "kubectl logs -f deployment/$RELEASE_NAME-frontend -n $NAMESPACE"
    echo "kubectl logs -f deployment/$RELEASE_NAME-agents-reasoning -n $NAMESPACE"
}

# Головна функція
main() {
    log "🚀 Початок міграції Predator Analytics на Kubernetes"
    
    # Перевірка параметрів
    while [[ $# -gt 0 ]]; do
        case $1 in
            --registry)
                DOCKER_REGISTRY="$2"
                shift 2
                ;;
            --namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-cleanup)
                SKIP_CLEANUP=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                echo "Використання: $0 [OPTIONS]"
                echo "OPTIONS:"
                echo "  --registry REGISTRY    Docker registry (за замовчуванням: localhost:5000)"
                echo "  --namespace NAMESPACE  Kubernetes namespace (за замовчуванням: predator-analytics)"
                echo "  --skip-backup         Пропустити створення backup"
                echo "  --skip-cleanup        Пропустити очищення старого розгортання"
                echo "  --dry-run             Тільки показати що буде зроблено"
                echo "  -h, --help            Показати цю довідку"
                exit 0
                ;;
            *)
                error "Невідомий параметр: $1"
                exit 1
                ;;
        esac
    done
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        log "🧪 Dry-run режим - показую що буде зроблено:"
        echo "1. Перевірка передумов"
        echo "2. Створення backup (якщо не --skip-backup)"
        echo "3. Підготовка namespace: $NAMESPACE"
        echo "4. Налаштування секретів"
        echo "5. Збірка images для registry: ${DOCKER_REGISTRY:-localhost:5000}"
        echo "6. Встановлення Helm dependencies"
        echo "7. Розгортання Predator Analytics"
        echo "8. Перевірка розгортання"
        echo "9. Налаштування моніторингу"
        echo "10. Очищення старого розгортання (якщо не --skip-cleanup)"
        echo "11. Показ інформації про доступ"
        exit 0
    fi
    
    # Виконання кроків
    check_prerequisites
    
    if [[ "${SKIP_BACKUP:-false}" != "true" ]]; then
        backup_current_state
    fi
    
    prepare_namespace
    setup_secrets
    build_and_push_images
    install_dependencies
    deploy_application
    verify_deployment
    setup_monitoring
    
    if [[ "${SKIP_CLEANUP:-false}" != "true" ]]; then
        cleanup_old_deployment
    fi
    
    show_access_info
    
    success "🎉 Міграція на Kubernetes завершена успішно!"
    success "Predator Analytics працює з 58 безкоштовними моделями та багаторівневим фідбеком"
    
    # Автоматичний запуск port-forward для frontend
    log "Запускаю port-forward для frontend на порту 5090..."
    kubectl port-forward svc/$RELEASE_NAME-frontend 5090:80 -n $NAMESPACE > /dev/null 2>&1 &
    success "Frontend доступний на http://localhost:5090"
}

# Перехоплення сигналів для graceful shutdown
trap 'error "Перервано користувачем"; exit 1' INT TERM

# Запуск
main "$@"
