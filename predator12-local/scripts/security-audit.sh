#!/bin/bash

# ============================================================================
#                    PREDATOR11 SECURITY AUDIT SCRIPT
#           Comprehensive security check for production deployment
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="predator11"
SECURITY_NAMESPACE="predator11-security"
MONITORING_NAMESPACE="predator11-monitoring"
REPORT_FILE="security-audit-$(date +%Y%m%d-%H%M%S).txt"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

# Function to log results
log_result() {
    echo "$1" >> "$REPORT_FILE"
}

# Initialize report
init_report() {
    cat > "$REPORT_FILE" <<EOF
# Predator11 Security Audit Report
Generated: $(date)
Cluster: $(kubectl config current-context)

## Summary
EOF
}

# Check if namespace exists
check_namespace() {
    local ns=$1
    if kubectl get namespace "$ns" &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Check Pod Security Standards
check_pod_security_standards() {
    print_status "Checking Pod Security Standards..."

    if check_namespace "$NAMESPACE"; then
        local enforce_label=$(kubectl get namespace "$NAMESPACE" -o jsonpath='{.metadata.labels.pod-security\.kubernetes\.io/enforce}' 2>/dev/null || echo "")

        if [[ "$enforce_label" == "restricted" ]]; then
            print_success "Pod Security Standards enforced at 'restricted' level"
            log_result "✅ Pod Security Standards: restricted"
        else
            print_error "Pod Security Standards not enforced or not set to 'restricted'"
            log_result "❌ Pod Security Standards: $enforce_label"
        fi
    else
        print_error "Namespace $NAMESPACE not found"
        log_result "❌ Namespace $NAMESPACE not found"
    fi
}

# Check Network Policies
check_network_policies() {
    print_status "Checking Network Policies..."

    local policies=$(kubectl get networkpolicies -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)

    if [[ $policies -gt 0 ]]; then
        print_success "Network Policies configured ($policies policies found)"
        log_result "✅ Network Policies: $policies policies"

        # Check specific policies
        local required_policies=("predator11-backend-netpol" "predator11-frontend-netpol" "predator11-database-netpol")
        for policy in "${required_policies[@]}"; do
            if kubectl get networkpolicy "$policy" -n "$NAMESPACE" &>/dev/null; then
                print_success "Required Network Policy '$policy' exists"
                log_result "✅ Network Policy: $policy"
            else
                print_error "Required Network Policy '$policy' missing"
                log_result "❌ Network Policy: $policy missing"
            fi
        done
    else
        print_error "No Network Policies configured"
        log_result "❌ Network Policies: none configured"
    fi
}

# Check RBAC
check_rbac() {
    print_status "Checking RBAC configuration..."

    # Check ServiceAccount
    if kubectl get serviceaccount predator11 -n "$NAMESPACE" &>/dev/null; then
        print_success "ServiceAccount 'predator11' exists"
        log_result "✅ ServiceAccount: predator11"

        # Check if ServiceAccount automounts tokens
        local automount=$(kubectl get serviceaccount predator11 -n "$NAMESPACE" -o jsonpath='{.automountServiceAccountToken}' 2>/dev/null || echo "true")
        if [[ "$automount" == "false" ]]; then
            print_success "ServiceAccount token automounting disabled"
            log_result "✅ ServiceAccount automount: disabled"
        else
            print_warning "ServiceAccount token automounting enabled"
            log_result "⚠️ ServiceAccount automount: enabled"
        fi
    else
        print_error "ServiceAccount 'predator11' not found"
        log_result "❌ ServiceAccount: predator11 not found"
    fi

    # Check Roles and RoleBindings
    local roles=$(kubectl get roles -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)
    local rolebindings=$(kubectl get rolebindings -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)

    if [[ $roles -gt 0 && $rolebindings -gt 0 ]]; then
        print_success "RBAC configured with $roles roles and $rolebindings role bindings"
        log_result "✅ RBAC: $roles roles, $rolebindings bindings"
    else
        print_error "RBAC not properly configured"
        log_result "❌ RBAC: insufficient configuration"
    fi
}

# Check container security
check_container_security() {
    print_status "Checking container security configurations..."

    local deployments=$(kubectl get deployments -n "$NAMESPACE" -o name)

    for deployment in $deployments; do
        local dep_name=$(basename "$deployment")
        print_status "Checking deployment: $dep_name"

        # Check if running as non-root
        local run_as_non_root=$(kubectl get "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.securityContext.runAsNonRoot}' 2>/dev/null || echo "false")
        if [[ "$run_as_non_root" == "true" ]]; then
            print_success "$dep_name: Running as non-root user"
            log_result "✅ $dep_name: non-root user"
        else
            print_error "$dep_name: May be running as root"
            log_result "❌ $dep_name: may run as root"
        fi

        # Check read-only root filesystem
        local containers=$(kubectl get "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[*].name}')
        for container in $containers; do
            local readonly_fs=$(kubectl get "$deployment" -n "$NAMESPACE" -o jsonpath="{.spec.template.spec.containers[?(@.name=='$container')].securityContext.readOnlyRootFilesystem}" 2>/dev/null || echo "false")
            if [[ "$readonly_fs" == "true" ]]; then
                print_success "$dep_name/$container: Read-only root filesystem"
                log_result "✅ $dep_name/$container: read-only filesystem"
            else
                print_warning "$dep_name/$container: Root filesystem is writable"
                log_result "⚠️ $dep_name/$container: writable filesystem"
            fi

            # Check privilege escalation
            local allow_privilege_escalation=$(kubectl get "$deployment" -n "$NAMESPACE" -o jsonpath="{.spec.template.spec.containers[?(@.name=='$container')].securityContext.allowPrivilegeEscalation}" 2>/dev/null || echo "true")
            if [[ "$allow_privilege_escalation" == "false" ]]; then
                print_success "$dep_name/$container: Privilege escalation disabled"
                log_result "✅ $dep_name/$container: no privilege escalation"
            else
                print_error "$dep_name/$container: Privilege escalation allowed"
                log_result "❌ $dep_name/$container: privilege escalation allowed"
            fi
        done
    done
}

# Check TLS certificates
check_tls_certificates() {
    print_status "Checking TLS certificates..."

    local certificates=$(kubectl get certificates -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)

    if [[ $certificates -gt 0 ]]; then
        print_success "TLS certificates configured ($certificates certificates)"
        log_result "✅ TLS certificates: $certificates configured"

        # Check certificate status
        while IFS= read -r cert; do
            local cert_name=$(echo "$cert" | awk '{print $1}')
            local ready=$(echo "$cert" | awk '{print $2}')

            if [[ "$ready" == "True" ]]; then
                print_success "Certificate '$cert_name' is ready"
                log_result "✅ Certificate: $cert_name ready"
            else
                print_error "Certificate '$cert_name' is not ready"
                log_result "❌ Certificate: $cert_name not ready"
            fi
        done < <(kubectl get certificates -n "$NAMESPACE" --no-headers 2>/dev/null)
    else
        print_error "No TLS certificates configured"
        log_result "❌ TLS certificates: none configured"
    fi
}

# Check Vault security
check_vault_security() {
    print_status "Checking Vault security..."

    if check_namespace "$SECURITY_NAMESPACE"; then
        if kubectl get pods -n "$SECURITY_NAMESPACE" -l app.kubernetes.io/name=vault --no-headers 2>/dev/null | grep -q Running; then
            print_success "Vault pods are running"
            log_result "✅ Vault: pods running"

            # Check Vault seal status (if accessible)
            local vault_pod=$(kubectl get pods -n "$SECURITY_NAMESPACE" -l app.kubernetes.io/name=vault -o name | head -1)
            if [[ -n "$vault_pod" ]]; then
                local seal_status=$(kubectl exec -n "$SECURITY_NAMESPACE" "$vault_pod" -- vault status -format=json 2>/dev/null | jq -r '.sealed' 2>/dev/null || echo "unknown")

                if [[ "$seal_status" == "false" ]]; then
                    print_success "Vault is unsealed"
                    log_result "✅ Vault: unsealed"
                elif [[ "$seal_status" == "true" ]]; then
                    print_error "Vault is sealed"
                    log_result "❌ Vault: sealed"
                else
                    print_warning "Vault seal status unknown"
                    log_result "⚠️ Vault: status unknown"
                fi
            fi
        else
            print_error "Vault pods not running"
            log_result "❌ Vault: pods not running"
        fi
    else
        print_error "Security namespace not found"
        log_result "❌ Security namespace: not found"
    fi
}

# Check secrets management
check_secrets_management() {
    print_status "Checking secrets management..."

    local secrets=$(kubectl get secrets -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)

    if [[ $secrets -gt 0 ]]; then
        print_success "Secrets configured ($secrets secrets)"
        log_result "✅ Secrets: $secrets configured"

        # Check for hardcoded secrets (basic check)
        local suspicious_secrets=0
        while IFS= read -r secret; do
            local secret_name=$(echo "$secret" | awk '{print $1}')
            if [[ "$secret_name" =~ (password|key|token) ]]; then
                print_warning "Potentially hardcoded secret: $secret_name"
                ((suspicious_secrets++))
            fi
        done < <(kubectl get secrets -n "$NAMESPACE" --no-headers 2>/dev/null)

        if [[ $suspicious_secrets -gt 0 ]]; then
            log_result "⚠️ Suspicious secrets: $suspicious_secrets found"
        else
            log_result "✅ No suspicious secrets found"
        fi
    else
        print_warning "No secrets configured"
        log_result "⚠️ Secrets: none configured"
    fi
}

# Check monitoring and alerting
check_monitoring() {
    print_status "Checking monitoring and alerting..."

    if check_namespace "$MONITORING_NAMESPACE"; then
        # Check Prometheus
        if kubectl get pods -n "$MONITORING_NAMESPACE" -l app.kubernetes.io/name=prometheus --no-headers 2>/dev/null | grep -q Running; then
            print_success "Prometheus is running"
            log_result "✅ Prometheus: running"
        else
            print_error "Prometheus not running"
            log_result "❌ Prometheus: not running"
        fi

        # Check Grafana
        if kubectl get pods -n "$MONITORING_NAMESPACE" -l app.kubernetes.io/name=grafana --no-headers 2>/dev/null | grep -q Running; then
            print_success "Grafana is running"
            log_result "✅ Grafana: running"
        else
            print_error "Grafana not running"
            log_result "❌ Grafana: not running"
        fi

        # Check AlertManager
        if kubectl get pods -n "$MONITORING_NAMESPACE" -l app.kubernetes.io/name=alertmanager --no-headers 2>/dev/null | grep -q Running; then
            print_success "AlertManager is running"
            log_result "✅ AlertManager: running"
        else
            print_warning "AlertManager not running"
            log_result "⚠️ AlertManager: not running"
        fi
    else
        print_error "Monitoring namespace not found"
        log_result "❌ Monitoring namespace: not found"
    fi
}

# Check resource limits
check_resource_limits() {
    print_status "Checking resource limits..."

    local deployments=$(kubectl get deployments -n "$NAMESPACE" -o name)
    local deployments_without_limits=0

    for deployment in $deployments; do
        local dep_name=$(basename "$deployment")
        local containers=$(kubectl get "$deployment" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[*].name}')

        for container in $containers; do
            local cpu_limit=$(kubectl get "$deployment" -n "$NAMESPACE" -o jsonpath="{.spec.template.spec.containers[?(@.name=='$container')].resources.limits.cpu}" 2>/dev/null)
            local memory_limit=$(kubectl get "$deployment" -n "$NAMESPACE" -o jsonpath="{.spec.template.spec.containers[?(@.name=='$container')].resources.limits.memory}" 2>/dev/null)

            if [[ -n "$cpu_limit" && -n "$memory_limit" ]]; then
                print_success "$dep_name/$container: Resource limits configured"
                log_result "✅ $dep_name/$container: resource limits set"
            else
                print_warning "$dep_name/$container: Missing resource limits"
                log_result "⚠️ $dep_name/$container: no resource limits"
                ((deployments_without_limits++))
            fi
        done
    done

    if [[ $deployments_without_limits -eq 0 ]]; then
        print_success "All containers have resource limits"
        log_result "✅ Resource limits: all containers configured"
    else
        print_warning "$deployments_without_limits containers without resource limits"
        log_result "⚠️ Resource limits: $deployments_without_limits containers missing limits"
    fi
}

# Check ingress security
check_ingress_security() {
    print_status "Checking Ingress security..."

    local ingresses=$(kubectl get ingress -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l)

    if [[ $ingresses -gt 0 ]]; then
        print_success "Ingress configured ($ingresses ingresses)"
        log_result "✅ Ingress: $ingresses configured"

        # Check TLS configuration
        while IFS= read -r ingress; do
            local ing_name=$(echo "$ingress" | awk '{print $1}')
            local tls_hosts=$(kubectl get ingress "$ing_name" -n "$NAMESPACE" -o jsonpath='{.spec.tls[*].hosts[*]}' 2>/dev/null)

            if [[ -n "$tls_hosts" ]]; then
                print_success "Ingress '$ing_name': TLS configured for hosts: $tls_hosts"
                log_result "✅ Ingress $ing_name: TLS configured"
            else
                print_error "Ingress '$ing_name': No TLS configuration"
                log_result "❌ Ingress $ing_name: no TLS"
            fi
        done < <(kubectl get ingress -n "$NAMESPACE" --no-headers 2>/dev/null)
    else
        print_warning "No Ingress configured"
        log_result "⚠️ Ingress: none configured"
    fi
}

# Generate final report
generate_final_report() {
    cat >> "$REPORT_FILE" <<EOF

## Detailed Results

### Test Results Summary
- ✅ Passed: $PASSED
- ⚠️ Warnings: $WARNINGS
- ❌ Failed: $FAILED

### Recommendations

EOF

    if [[ $FAILED -gt 0 ]]; then
        cat >> "$REPORT_FILE" <<EOF
#### Critical Issues (Must Fix)
- Review all failed security checks
- Implement missing security controls
- Ensure Pod Security Standards are enforced
- Configure Network Policies for all components
- Fix container security configurations

EOF
    fi

    if [[ $WARNINGS -gt 0 ]]; then
        cat >> "$REPORT_FILE" <<EOF
#### Security Improvements (Recommended)
- Review all warnings and consider implementing fixes
- Set resource limits for all containers
- Consider enabling additional security features
- Review secrets management practices

EOF
    fi

    cat >> "$REPORT_FILE" <<EOF
#### General Recommendations
- Regularly update all components
- Monitor security alerts and advisories
- Conduct periodic security audits
- Implement automated security scanning
- Keep documentation up to date

### Next Steps
1. Address all critical issues immediately
2. Plan remediation for warnings
3. Implement continuous security monitoring
4. Schedule regular security reviews

Report generated: $(date)
EOF

    print_status "Security audit report saved to: $REPORT_FILE"
}

# Main audit function
main() {
    print_status "Starting Predator11 Security Audit..."
    init_report

    echo "Starting security audit..." >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    check_pod_security_standards
    check_network_policies
    check_rbac
    check_container_security
    check_tls_certificates
    check_vault_security
    check_secrets_management
    check_monitoring
    check_resource_limits
    check_ingress_security

    generate_final_report

    echo
    print_status "Security Audit Summary:"
    print_success "Passed: $PASSED"
    print_warning "Warnings: $WARNINGS"
    print_error "Failed: $FAILED"

    if [[ $FAILED -eq 0 ]]; then
        print_success "Security audit completed with no critical issues!"
        exit 0
    else
        print_error "Security audit found critical issues that need attention!"
        exit 1
    fi
}

# Run main function
main "$@"
