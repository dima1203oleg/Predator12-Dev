#!/bin/bash

# ============================================================================
#                    PREDATOR11 MASTER CONTROL SCRIPT
#           Central command interface for all Predator11 operations
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print colored output
print_header() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════════════════════╗
║                           🚀 PREDATOR11 CONTROL CENTER                      ║
║                      Production-Ready Multi-Agent System                    ║
╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
}

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

print_section() {
    echo -e "${CYAN}
═══════════════════════════════════════════════════════════════════════════════
                                 $1
═══════════════════════════════════════════════════════════════════════════════${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_section "CHECKING PREREQUISITES"

    local failed=0

    # Check Docker
    if command -v docker &> /dev/null; then
        print_success "Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    else
        print_error "Docker is not installed or not in PATH"
        ((failed++))
    fi

    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose: $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1)"
    else
        print_error "Docker Compose is not installed or not in PATH"
        ((failed++))
    fi

    # Check Kubernetes tools (optional for production)
    if command -v kubectl &> /dev/null; then
        print_success "kubectl: $(kubectl version --client --short 2>/dev/null | cut -d' ' -f3)"
    else
        print_warning "kubectl not found (required for production deployment)"
    fi

    if command -v helm &> /dev/null; then
        print_success "Helm: $(helm version --short 2>/dev/null | cut -d' ' -f1)"
    else
        print_warning "Helm not found (required for production deployment)"
    fi

    # Check Git
    if command -v git &> /dev/null; then
        print_success "Git: $(git --version | cut -d' ' -f3)"
    else
        print_error "Git is not installed"
        ((failed++))
    fi

    if [[ $failed -gt 0 ]]; then
        print_error "Prerequisites check failed. Please install missing tools."
        exit 1
    else
        print_success "All prerequisites satisfied!"
    fi
}

# Function to show system status
show_status() {
    print_section "SYSTEM STATUS"

    # Check if development environment is running
    if docker-compose ps 2>/dev/null | grep -q "Up"; then
        print_success "Development environment: RUNNING"
        docker-compose ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}" 2>/dev/null || true
    else
        print_status "Development environment: STOPPED"
    fi

    # Check if production deployment exists
    if command -v kubectl &> /dev/null && kubectl get namespace predator11 &>/dev/null; then
        print_success "Production deployment: DETECTED"
        echo "Pods status:"
        kubectl get pods -n predator11 2>/dev/null || true
    else
        print_status "Production deployment: NOT DETECTED"
    fi

    echo
}

# Function to run development setup
dev_setup() {
    print_section "DEVELOPMENT SETUP"

    if [[ -x "$SCRIPT_DIR/dev-setup.sh" ]]; then
        "$SCRIPT_DIR/dev-setup.sh" setup
    else
        print_error "dev-setup.sh not found or not executable"
        exit 1
    fi
}

# Function to run production deployment
prod_deploy() {
    print_section "PRODUCTION DEPLOYMENT"

    if [[ -x "$SCRIPT_DIR/deploy-production.sh" ]]; then
        "$SCRIPT_DIR/deploy-production.sh"
    else
        print_error "deploy-production.sh not found or not executable"
        exit 1
    fi
}

# Function to run security audit
security_audit() {
    print_section "SECURITY AUDIT"

    if [[ -x "$SCRIPT_DIR/security-audit.sh" ]]; then
        "$SCRIPT_DIR/security-audit.sh"
    else
        print_error "security-audit.sh not found or not executable"
        exit 1
    fi
}

# Function to run backup
backup() {
    print_section "DISASTER RECOVERY BACKUP"

    if [[ -x "$SCRIPT_DIR/disaster-recovery.sh" ]]; then
        "$SCRIPT_DIR/disaster-recovery.sh" backup
    else
        print_error "disaster-recovery.sh not found or not executable"
        exit 1
    fi
}

# Function to run load testing
load_test() {
    print_section "LOAD TESTING"

    if [[ -x "$SCRIPT_DIR/load-testing.sh" ]]; then
        "$SCRIPT_DIR/load-testing.sh" all
    else
        print_error "load-testing.sh not found or not executable"
        exit 1
    fi
}

# Function to run health monitoring
health_monitor() {
    print_section "HEALTH MONITORING"

    if [[ -x "$SCRIPT_DIR/health-monitor.sh" ]]; then
        "$SCRIPT_DIR/health-monitor.sh" monitor
    else
        print_error "health-monitor.sh not found or not executable"
        exit 1
    fi
}

# Function to show help
show_help() {
    cat << EOF
🚀 PREDATOR11 CONTROL CENTER

Usage: $0 [COMMAND]

COMMANDS:
  check        - Check prerequisites and system status
  dev          - Setup and start development environment
  prod         - Deploy to production (requires kubectl & helm)
  security     - Run comprehensive security audit
  backup       - Create full system backup
  test         - Run load testing suite
  monitor      - Start health monitoring
  status       - Show current system status
  help         - Show this help message

DEVELOPMENT WORKFLOW:
  $0 check     # Check prerequisites
  $0 dev       # Setup local development
  $0 security  # Run security audit
  $0 test      # Test performance

PRODUCTION WORKFLOW:
  $0 check     # Check prerequisites
  $0 security  # Security audit
  $0 prod      # Deploy to production
  $0 backup    # Create backup
  $0 monitor   # Start monitoring

MAKEFILE SHORTCUTS:
  make dev-start       # Start development
  make deploy          # Deploy production
  make security-audit  # Security check
  make health-check    # Health monitoring
  make backup-full     # Full backup

For detailed documentation, see:
  - PRODUCTION_DEPLOYMENT_GUIDE.md
  - PRODUCTION_READINESS_REPORT.md

EOF
}

# Function to run interactive mode
interactive_mode() {
    print_header

    while true; do
        echo
        echo -e "${CYAN}Select an action:${NC}"
        echo "1) Check Prerequisites & Status"
        echo "2) Development Setup"
        echo "3) Production Deployment"
        echo "4) Security Audit"
        echo "5) Backup System"
        echo "6) Load Testing"
        echo "7) Health Monitoring"
        echo "8) Exit"
        echo
        read -p "Enter your choice (1-8): " choice

        case $choice in
            1)
                check_prerequisites
                show_status
                ;;
            2)
                dev_setup
                ;;
            3)
                prod_deploy
                ;;
            4)
                security_audit
                ;;
            5)
                backup
                ;;
            6)
                load_test
                ;;
            7)
                health_monitor
                ;;
            8)
                print_success "Goodbye! 🚀"
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-8."
                ;;
        esac

        echo
        read -p "Press Enter to continue..."
    done
}

# Main function
main() {
    case "${1:-interactive}" in
        "check")
            print_header
            check_prerequisites
            show_status
            ;;
        "dev")
            print_header
            check_prerequisites
            dev_setup
            ;;
        "prod")
            print_header
            check_prerequisites
            prod_deploy
            ;;
        "security")
            print_header
            security_audit
            ;;
        "backup")
            print_header
            backup
            ;;
        "test")
            print_header
            load_test
            ;;
        "monitor")
            print_header
            health_monitor
            ;;
        "status")
            print_header
            show_status
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        "interactive"|"")
            interactive_mode
            ;;
        *)
            print_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Change to project root directory
cd "$PROJECT_ROOT"

# Run main function
main "$@"
