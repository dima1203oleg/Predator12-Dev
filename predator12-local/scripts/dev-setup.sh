    echo "  • Frontend:                 http://localhost:3000"
    echo "  • Backend API:              http://localhost:8000"
    echo "  • API Documentation:        http://localhost:8000/docs"
    echo "  • OpenSearch Dashboards:    http://localhost:5601"
    echo "  • Grafana:                  http://localhost:3001"
    echo
    echo "🛠️  Development Tools:"
    echo "  • Adminer (Database):       http://localhost:8080"
    echo "  • MailHog (Email Testing):  http://localhost:8025"
    echo "  • Redis Commander:          http://localhost:8081"
    echo
    echo "📊 Monitoring:"
    echo "  • Prometheus:               http://localhost:9090"
    echo "  • Grafana:                  http://localhost:3001"
    echo
    if command -v k3d &> /dev/null && k3d cluster list | grep -q "$PROJECT_NAME-dev"; then
        echo "☸️  Kubernetes (k3d):"
        echo "  • Cluster:                  $PROJECT_NAME-dev"
        echo "  • Ingress:                  http://localhost:8000"
        echo "  • Dashboard:                kubectl proxy"
        echo
    fi
    echo "📝 Logs:"
    echo "  • View logs:                docker-compose logs -f [service]"
    echo "  • Backend logs:             docker-compose logs -f backend"
    echo "  • Frontend logs:            docker-compose logs -f frontend"
    echo
    echo "🔧 Useful Commands:"
    echo "  • Stop services:            docker-compose down"
    echo "  • Restart services:         docker-compose restart"
    echo "  • View status:              docker-compose ps"
    echo "  • Shell access:             docker-compose exec [service] /bin/bash"
    echo
}

# Function to run health checks
health_check() {
    print_status "Running health checks..."

    local failed=0

    # Check backend health
    if curl -f http://localhost:8000/healthz/readiness &> /dev/null; then
        print_success "✓ Backend API is healthy"
    else
        print_error "✗ Backend API is not responding"
        failed=1
    fi

    # Check frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_success "✓ Frontend is healthy"
    else
        print_error "✗ Frontend is not responding"
        failed=1
    fi

    # Check database
    if docker-compose exec -T db pg_isready -U predator11 &> /dev/null; then
        print_success "✓ Database is healthy"
    else
        print_error "✗ Database is not responding"
        failed=1
    fi

    if [[ $failed -eq 0 ]]; then
        print_success "All health checks passed!"
    else
        print_error "Some services are not healthy. Check the logs."
        return 1
    fi
}

# Main function
main() {
    case "${1:-setup}" in
        "setup")
            print_status "Setting up Predator11 development environment..."

            # Check prerequisites
            check_command "docker"
            check_command "docker-compose"
            check_command "curl"

            setup_env
            create_dev_compose
            install_dev_dependencies
            start_services
            show_services_info
            ;;
        "start")
            start_services
            show_services_info
            ;;
        "stop")
            print_status "Stopping development services..."
            docker-compose -f "$COMPOSE_FILE" -f "$COMPOSE_DEV_FILE" down
            print_success "Services stopped"
            ;;
        "restart")
            print_status "Restarting development services..."
            docker-compose -f "$COMPOSE_FILE" -f "$COMPOSE_DEV_FILE" restart
            print_success "Services restarted"
            ;;
        "logs")
            docker-compose -f "$COMPOSE_FILE" -f "$COMPOSE_DEV_FILE" logs -f "${2:-}"
            ;;
        "health")
            health_check
            ;;
        "k3d")
            check_command "k3d"
            check_command "kubectl"
            setup_k3d
            ;;
        "clean")
            print_warning "This will remove all containers, volumes, and networks"
            read -p "Are you sure? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose -f "$COMPOSE_FILE" -f "$COMPOSE_DEV_FILE" down -v --remove-orphans
                docker system prune -f
                print_success "Environment cleaned"
            fi
            ;;
        *)
            echo "Usage: $0 {setup|start|stop|restart|logs [service]|health|k3d|clean}"
            echo
            echo "Commands:"
            echo "  setup     - Initial setup of development environment"
            echo "  start     - Start all services"
            echo "  stop      - Stop all services"
            echo "  restart   - Restart all services"
            echo "  logs      - View logs (optionally for specific service)"
            echo "  health    - Run health checks"
            echo "  k3d       - Setup local Kubernetes cluster"
            echo "  clean     - Clean up containers and volumes"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
#!/bin/bash

# ============================================================================
#                    PREDATOR11 LOCAL DEVELOPMENT SETUP
#           Script for setting up local development environment
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="predator11"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_DEV_FILE="docker-compose.dev.yml"
ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed or not in PATH"
        echo "Please install $1 and try again."
        exit 1
    fi
}

# Function to generate random password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to setup environment file
setup_env() {
    print_status "Setting up environment configuration..."

    if [[ ! -f "$ENV_FILE" ]]; then
        if [[ -f "$ENV_EXAMPLE" ]]; then
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            print_status "Copied $ENV_EXAMPLE to $ENV_FILE"
        else
            print_status "Creating new $ENV_FILE"
            cat > "$ENV_FILE" <<EOF
# Predator11 Local Development Environment
# Generated on $(date)

# ================== APPLICATION ==================
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=$(generate_password 64)
JWT_SECRET=$(generate_password 32)

# ================== DATABASE ==================
POSTGRES_DB=predator11_dev
POSTGRES_USER=predator11
POSTGRES_PASSWORD=$(generate_password 16)
DATABASE_URL=postgresql://predator11:$(generate_password 16)@db:5432/predator11_dev

# ================== REDIS ==================
REDIS_PASSWORD=$(generate_password 16)
REDIS_URL=redis://:$(generate_password 16)@redis:6379

# ================== OPENSEARCH ==================
OPENSEARCH_INITIAL_ADMIN_PASSWORD=$(generate_password 16)
OPENSEARCH_URL=https://admin:$(generate_password 16)@opensearch:9200

# ================== MINIO ==================
MINIO_ROOT_USER=predator11
MINIO_ROOT_PASSWORD=$(generate_password 16)
MINIO_URL=http://minio:9000

# ================== MONITORING ==================
GRAFANA_ADMIN_PASSWORD=$(generate_password 16)
LOKI_URL=http://loki:3100
TEMPO_URL=http://tempo:3200

# ================== EXTERNAL APIS (Development) ==================
# Stripe (Test Keys)
STRIPE_PUBLIC_KEY=pk_test_placeholder
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Twilio (Test Credentials)
TWILIO_ACCOUNT_SID=ACplaceholder
TWILIO_AUTH_TOKEN=placeholder
TWILIO_FROM_NUMBER=+1234567890

# SMTP (Development)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@predator11.local

# Google Maps (Development Key)
GOOGLE_MAPS_API_KEY=placeholder

# ================== AGENTS ==================
MODEL_SDK_BASE_URL=http://modelsdk:8080
MODEL_SDK_KEY=$(generate_password 32)
QDRANT_URL=http://qdrant:6333

# ================== KAFKA ==================
KAFKA_BROKERS=kafka:9092

# ================== PORTS ==================
BACKEND_PORT=8000
FRONTEND_PORT=3000
GRAFANA_PORT=3001
OPENSEARCH_DASHBOARDS_PORT=5601
MAILHOG_PORT=8025
EOF
        fi

        print_success "Environment file created: $ENV_FILE"
        print_warning "Please review and update the environment variables as needed"
    else
        print_warning "Environment file already exists: $ENV_FILE"
    fi
}

# Function to create development docker-compose override
create_dev_compose() {
    print_status "Creating development Docker Compose override..."

    cat > "$COMPOSE_DEV_FILE" <<EOF
version: '3.8'

# Development overrides for Predator11
services:
  backend:
    volumes:
      - ./backend:/app
      - ./logs:/app/logs
    environment:
      - DEBUG=true
      - RELOAD=true
    command: ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5001", "--reload"]

  frontend:
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    environment:
      - CHOKIDAR_USEPOLLING=true
      - REACT_APP_API_URL=http://localhost:8000
    command: ["npm", "start"]

  # Development tools
  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "\${MAILHOG_PORT:-8025}:8025"
      - "1025:1025"
    networks:
      - predator11

  adminer:
    image: adminer:latest
    ports:
      - "8080:8080"
    environment:
      - ADMINER_DEFAULT_SERVER=db
    networks:
      - predator11
    depends_on:
      - db

  # Redis Commander
  redis-commander:
    image: rediscommander/redis-commander:latest
    environment:
      - REDIS_HOST=redis
      - REDIS_PASSWORD=\${REDIS_PASSWORD}
    ports:
      - "8081:8081"
    networks:
      - predator11
    depends_on:
      - redis

networks:
  predator11:
    external: true
EOF

    print_success "Development Docker Compose override created: $COMPOSE_DEV_FILE"
}

# Function to setup local Kubernetes with k3d
setup_k3d() {
    print_status "Setting up local Kubernetes cluster with k3d..."

    # Check if k3d cluster already exists
    if k3d cluster list | grep -q "$PROJECT_NAME-dev"; then
        print_warning "k3d cluster '$PROJECT_NAME-dev' already exists"
        return 0
    fi

    # Create k3d cluster
    k3d cluster create $PROJECT_NAME-dev \
        --agents 2 \
        --port "8000:80@loadbalancer" \
        --port "8443:443@loadbalancer" \
        --k3s-arg "--disable=traefik@server:*" \
        --volume "./k8s:/k8s@server:*" \
        --wait

    # Install NGINX Ingress
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

    # Wait for ingress controller
    kubectl wait --namespace ingress-nginx \
        --for=condition=ready pod \
        --selector=app.kubernetes.io/component=controller \
        --timeout=300s

    print_success "k3d cluster created: $PROJECT_NAME-dev"
}

# Function to install development dependencies
install_dev_dependencies() {
    print_status "Installing development dependencies..."

    # Python dependencies
    if [[ -f "requirements-dev.txt" ]]; then
        print_status "Installing Python development dependencies..."
        python -m venv .venv
        source .venv/bin/activate
        pip install -r requirements-dev.txt
    fi

    # Node.js dependencies
    if [[ -d "frontend" && -f "frontend/package.json" ]]; then
        print_status "Installing Node.js dependencies..."
        cd frontend
        npm install
        cd ..
    fi

    print_success "Development dependencies installed"
}

# Function to start services
start_services() {
    print_status "Starting Predator11 development services..."

    # Create network if it doesn't exist
    docker network create predator11 2>/dev/null || true

    # Start services with development overrides
    docker-compose -f "$COMPOSE_FILE" -f "$COMPOSE_DEV_FILE" up -d

    print_status "Waiting for services to be ready..."
    sleep 10

    # Wait for database to be ready
    print_status "Waiting for database..."
    until docker-compose exec -T db pg_isready -U predator11; do
        sleep 2
    done

    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec backend python -m alembic upgrade head

    print_success "Development services started successfully!"
}

# Function to show service information
show_services_info() {
    echo
    print_success "Predator11 Development Environment Ready!"
    echo
    echo "🌐 Web Services:"
