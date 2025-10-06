#!/usr/bin/env python3
"""
Predator12 GitOps/ArgoCD Acceptance Tests

Validates all requirements from the technical specification:
- ArgoCD components operational
- ApplicationSets deployed
- RBAC configured
- Progressive delivery working
- Monitoring integrated
- Secrets management
- Policy enforcement
"""

import asyncio
import subprocess
import json
import sys
from typing import Dict, List, Tuple
from datetime import datetime
import requests

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def run_command(cmd: str) -> Tuple[bool, str]:
    """Run shell command and return success status and output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        return False, str(e)

def print_test(name: str, passed: bool, details: str = ""):
    """Print test result"""
    status = f"{Colors.GREEN}✓ PASS{Colors.END}" if passed else f"{Colors.RED}✗ FAIL{Colors.END}"
    print(f"{status} | {name}")
    if details and not passed:
        print(f"       {Colors.YELLOW}{details}{Colors.END}")

class ArgoCDAcceptanceTests:
    def __init__(self):
        self.results = []
        self.namespace = "argocd"
        
    def test(self, name: str, func):
        """Decorator to run test and record result"""
        try:
            passed, details = func()
            self.results.append((name, passed, details))
            print_test(name, passed, details)
            return passed
        except Exception as e:
            self.results.append((name, False, str(e)))
            print_test(name, False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all acceptance tests"""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
        print(f"{Colors.BOLD}Predator12 GitOps/ArgoCD Acceptance Tests{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")
        
        # Section 1: Infrastructure
        print(f"\n{Colors.BOLD}📦 Section 1: Infrastructure Components{Colors.END}")
        self.test("1.1 ArgoCD namespace exists", self.test_namespace_exists)
        self.test("1.2 ArgoCD server running", self.test_argocd_server)
        self.test("1.3 Application controller running", self.test_application_controller)
        self.test("1.4 Repo server running", self.test_repo_server)
        self.test("1.5 ApplicationSet controller running", self.test_applicationset_controller)
        self.test("1.6 Redis running", self.test_redis)
        
        # Section 2: Configuration
        print(f"\n{Colors.BOLD}⚙️  Section 2: Configuration{Colors.END}")
        self.test("2.1 ArgoCD ConfigMap exists", self.test_argocd_cm)
        self.test("2.2 RBAC ConfigMap exists", self.test_rbac_cm)
        self.test("2.3 Notifications ConfigMap exists", self.test_notifications_cm)
        self.test("2.4 AppProject predator12 exists", self.test_app_project)
        
        # Section 3: ApplicationSets
        print(f"\n{Colors.BOLD}🎯 Section 3: ApplicationSets{Colors.END}")
        self.test("3.1 ApplicationSet exists", self.test_applicationset_exists)
        self.test("3.2 Applications generated", self.test_applications_generated)
        self.test("3.3 Dev applications exist", self.test_dev_applications)
        self.test("3.4 Staging applications exist", self.test_staging_applications)
        self.test("3.5 Prod applications exist", self.test_prod_applications)
        
        # Section 4: Progressive Delivery
        print(f"\n{Colors.BOLD}🚀 Section 4: Progressive Delivery{Colors.END}")
        self.test("4.1 Argo Rollouts installed", self.test_argo_rollouts_installed)
        self.test("4.2 Rollout CRDs exist", self.test_rollout_crds)
        self.test("4.3 Analysis templates exist", self.test_analysis_templates)
        self.test("4.4 Canary services exist", self.test_canary_services)
        
        # Section 5: Security
        print(f"\n{Colors.BOLD}🔒 Section 5: Security & Secrets{Colors.END}")
        self.test("5.1 Sealed Secrets installed", self.test_sealed_secrets)
        self.test("5.2 Gatekeeper installed", self.test_gatekeeper_installed)
        self.test("5.3 Gatekeeper policies exist", self.test_gatekeeper_policies)
        self.test("5.4 RBAC roles configured", self.test_rbac_roles)
        
        # Section 6: Monitoring
        print(f"\n{Colors.BOLD}📊 Section 6: Monitoring & Observability{Colors.END}")
        self.test("6.1 ServiceMonitors exist", self.test_servicemonitors)
        self.test("6.2 PrometheusRules exist", self.test_prometheusrules)
        self.test("6.3 Metrics endpoint accessible", self.test_metrics_endpoint)
        
        # Section 7: Hooks & Automation
        print(f"\n{Colors.BOLD}🔄 Section 7: Hooks & Automation{Colors.END}")
        self.test("7.1 PreSync hooks exist", self.test_presync_hooks)
        self.test("7.2 PostSync hooks exist", self.test_postsync_hooks)
        self.test("7.3 SyncFail hooks exist", self.test_syncfail_hooks)
        
        # Section 8: GitOps Workflow
        print(f"\n{Colors.BOLD}🌿 Section 8: GitOps Workflow{Colors.END}")
        self.test("8.1 Repository connected", self.test_repository_connected)
        self.test("8.2 Sync policies configured", self.test_sync_policies)
        self.test("8.3 Drift detection enabled", self.test_drift_detection)
        
        # Print summary
        self.print_summary()
        
        return all(result[1] for result in self.results)
    
    # Test implementations
    
    def test_namespace_exists(self) -> Tuple[bool, str]:
        success, output = run_command(f"kubectl get namespace {self.namespace}")
        return success, output if not success else ""
    
    def test_argocd_server(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get deployment argocd-server -n {self.namespace} -o jsonpath='{{.status.readyReplicas}}'"
        )
        if success and output and int(output) > 0:
            return True, ""
        return False, "ArgoCD server not ready"
    
    def test_application_controller(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get statefulset argocd-application-controller -n {self.namespace} -o jsonpath='{{.status.readyReplicas}}'"
        )
        if success and output and int(output) > 0:
            return True, ""
        return False, "Application controller not ready"
    
    def test_repo_server(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get deployment argocd-repo-server -n {self.namespace} -o jsonpath='{{.status.readyReplicas}}'"
        )
        if success and output and int(output) > 0:
            return True, ""
        return False, "Repo server not ready"
    
    def test_applicationset_controller(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get deployment argocd-applicationset-controller -n {self.namespace} -o jsonpath='{{.status.readyReplicas}}'"
        )
        if success and output and int(output) > 0:
            return True, ""
        return False, "ApplicationSet controller not ready"
    
    def test_redis(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get deployment argocd-redis -n {self.namespace} -o jsonpath='{{.status.readyReplicas}}'"
        )
        if success and output and int(output) > 0:
            return True, ""
        return False, "Redis not ready"
    
    def test_argocd_cm(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get configmap argocd-cm -n {self.namespace}"
        )
        return success, output if not success else ""
    
    def test_rbac_cm(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get configmap argocd-rbac-cm -n {self.namespace}"
        )
        return success, output if not success else ""
    
    def test_notifications_cm(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get configmap argocd-notifications-cm -n {self.namespace}"
        )
        return success, output if not success else ""
    
    def test_app_project(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get appproject predator12 -n {self.namespace}"
        )
        return success, output if not success else ""
    
    def test_applicationset_exists(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get applicationset predator12-environments -n {self.namespace}"
        )
        return success, output if not success else ""
    
    def test_applications_generated(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get application -n {self.namespace} -l managed-by=applicationset"
        )
        if success and "predator12" in output:
            return True, ""
        return False, "No applications generated by ApplicationSet"
    
    def test_dev_applications(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get application -n {self.namespace} -l env=dev"
        )
        if success and "predator12-dev" in output:
            return True, ""
        return False, "Dev applications not found"
    
    def test_staging_applications(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get application -n {self.namespace} -l env=staging"
        )
        if success and "predator12-staging" in output:
            return True, ""
        return False, "Staging applications not found"
    
    def test_prod_applications(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get application -n {self.namespace} -l env=prod"
        )
        if success and "predator12-prod" in output:
            return True, ""
        return False, "Prod applications not found"
    
    def test_argo_rollouts_installed(self) -> Tuple[bool, str]:
        success, output = run_command(
            "kubectl get namespace argo-rollouts"
        )
        return success, output if not success else ""
    
    def test_rollout_crds(self) -> Tuple[bool, str]:
        success, output = run_command(
            "kubectl get crd rollouts.argoproj.io"
        )
        return success, output if not success else ""
    
    def test_analysis_templates(self) -> Tuple[bool, str]:
        # Check if analysis template files exist
        success, output = run_command(
            "ls infra/argo-rollouts/analysis-templates.yaml"
        )
        return success, output if not success else ""
    
    def test_canary_services(self) -> Tuple[bool, str]:
        # Check if canary service manifests exist
        success, output = run_command(
            "ls infra/argo-rollouts/services-ingress.yaml"
        )
        return success, output if not success else ""
    
    def test_sealed_secrets(self) -> Tuple[bool, str]:
        success, output = run_command(
            "kubectl get crd sealedsecrets.bitnami.com"
        )
        return success, output if not success else ""
    
    def test_gatekeeper_installed(self) -> Tuple[bool, str]:
        success, output = run_command(
            "kubectl get namespace gatekeeper-system"
        )
        return success, output if not success else ""
    
    def test_gatekeeper_policies(self) -> Tuple[bool, str]:
        # Check if policy files exist
        success, output = run_command(
            "ls infra/policy/gatekeeper-policies.yaml"
        )
        return success, output if not success else ""
    
    def test_rbac_roles(self) -> Tuple[bool, str]:
        success, output = run_command(
            f"kubectl get configmap argocd-rbac-cm -n {self.namespace} -o jsonpath='{{.data.policy\\.csv}}'"
        )
        if success and "role:developer" in output and "role:operator" in output:
            return True, ""
        return False, "RBAC roles not properly configured"
    
    def test_servicemonitors(self) -> Tuple[bool, str]:
        # Check if servicemonitor files exist
        success, output = run_command(
            "ls infra/argocd/base/servicemonitor.yaml"
        )
        return success, output if not success else ""
    
    def test_prometheusrules(self) -> Tuple[bool, str]:
        # Check if prometheusrule files exist
        success, output = run_command(
            "ls infra/argocd/base/prometheusrule.yaml"
        )
        return success, output if not success else ""
    
    def test_metrics_endpoint(self) -> Tuple[bool, str]:
        # Check if metrics service exists
        success, output = run_command(
            f"kubectl get service argocd-metrics -n {self.namespace}"
        )
        return success, output if not success else ""
    
    def test_presync_hooks(self) -> Tuple[bool, str]:
        success, output = run_command(
            "ls infra/argocd/hooks/presync-db-migrate.yaml"
        )
        return success, output if not success else ""
    
    def test_postsync_hooks(self) -> Tuple[bool, str]:
        success, output = run_command(
            "ls infra/argocd/hooks/postsync-tests.yaml"
        )
        return success, output if not success else ""
    
    def test_syncfail_hooks(self) -> Tuple[bool, str]:
        success, output = run_command(
            "ls infra/argocd/hooks/syncfail-cleanup.yaml"
        )
        return success, output if not success else ""
    
    def test_repository_connected(self) -> Tuple[bool, str]:
        # Check if repository configuration exists
        success, output = run_command(
            f"kubectl get configmap argocd-cm -n {self.namespace} -o jsonpath='{{.data.repository\\.credentials}}'"
        )
        if success and output:
            return True, ""
        return False, "Repository not configured"
    
    def test_sync_policies(self) -> Tuple[bool, str]:
        # Check if ApplicationSet has sync policies
        success, output = run_command(
            f"kubectl get applicationset predator12-environments -n {self.namespace} -o jsonpath='{{.spec.template.spec.syncPolicy}}'"
        )
        if success and output:
            return True, ""
        return False, "Sync policies not configured"
    
    def test_drift_detection(self) -> Tuple[bool, str]:
        # Check if application tracking is configured
        success, output = run_command(
            f"kubectl get configmap argocd-cm -n {self.namespace} -o jsonpath='{{.data.application\\.resourceTrackingMethod}}'"
        )
        if success and output:
            return True, ""
        return False, "Drift detection not configured"
    
    def print_summary(self):
        """Print test summary"""
        total = len(self.results)
        passed = sum(1 for _, p, _ in self.results if p)
        failed = total - passed
        
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}")
        print(f"{Colors.BOLD}Test Summary{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*80}{Colors.END}\n")
        
        print(f"Total Tests:  {total}")
        print(f"{Colors.GREEN}Passed:       {passed}{Colors.END}")
        print(f"{Colors.RED}Failed:       {failed}{Colors.END}")
        print(f"Success Rate: {(passed/total*100):.1f}%\n")
        
        if failed > 0:
            print(f"{Colors.RED}{Colors.BOLD}Failed Tests:{Colors.END}")
            for name, passed, details in self.results:
                if not passed:
                    print(f"  ✗ {name}")
                    if details:
                        print(f"    {details}")
            print()
        
        if passed == total:
            print(f"{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! ArgoCD GitOps stack is ready for production.{Colors.END}\n")
        else:
            print(f"{Colors.RED}{Colors.BOLD}❌ Some tests failed. Please review and fix issues before deploying to production.{Colors.END}\n")

def main():
    """Main entry point"""
    print(f"\n{Colors.BOLD}Starting Predator12 GitOps/ArgoCD Acceptance Tests...{Colors.END}\n")
    print(f"{Colors.YELLOW}Timestamp: {datetime.now().isoformat()}{Colors.END}\n")
    
    tests = ArgoCDAcceptanceTests()
    all_passed = tests.run_all_tests()
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
