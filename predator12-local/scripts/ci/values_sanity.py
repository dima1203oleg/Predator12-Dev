#!/usr/bin/env python3
"""
Helm values sanity checker for Predator12.
Validates values.yaml for common misconfigurations.
"""

import sys
import yaml
from typing import Dict, List, Any
from pathlib import Path

class ValuesValidator:
    def __init__(self, values_path: str):
        self.values_path = Path(values_path)
        self.errors: List[str] = []
        self.warnings: List[str] = []
    
    def load_values(self) -> Dict[str, Any]:
        """Load values.yaml"""
        try:
            with open(self.values_path) as f:
                return yaml.safe_load(f)
        except Exception as e:
            self.errors.append(f"Failed to load values.yaml: {e}")
            return {}
    
    def validate(self) -> bool:
        """Run all validations."""
        values = self.load_values()
        if not values:
            return False
        
        self.check_replicas(values)
        self.check_resources(values)
        self.check_features(values)
        self.check_security(values)
        self.check_observability(values)
        
        return len(self.errors) == 0
    
    def check_replicas(self, values: Dict):
        """Check replica counts."""
        features = values.get('features', {})
        autoscale = features.get('autoscale', {})
        
        if autoscale.get('enabled'):
            min_replicas = autoscale.get('minReplicas', 1)
            max_replicas = autoscale.get('maxReplicas', 5)
            
            if min_replicas < 1:
                self.errors.append("minReplicas must be >= 1")
            
            if max_replicas < min_replicas:
                self.errors.append("maxReplicas must be >= minReplicas")
            
            if max_replicas > 20:
                self.warnings.append(
                    f"maxReplicas={max_replicas} is very high. "
                    "Consider cost implications."
                )
    
    def check_resources(self, values: Dict):
        """Check resource limits."""
        resources = values.get('resources', {})
        
        if not resources:
            self.warnings.append("No resource limits defined")
            return
        
        limits = resources.get('limits', {})
        requests = resources.get('requests', {})
        
        if limits.get('memory'):
            mem = limits['memory']
            if isinstance(mem, str) and 'Gi' in mem:
                gb = int(mem.replace('Gi', ''))
                if gb > 16:
                    self.warnings.append(
                        f"Memory limit {mem} is very high"
                    )
        
        # Check CPU limits
        if limits.get('cpu'):
            cpu = limits['cpu']
            if isinstance(cpu, (int, float)) and cpu > 8:
                self.warnings.append(
                    f"CPU limit {cpu} cores is very high"
                )
    
    def check_features(self, values: Dict):
        """Check feature flags."""
        features = values.get('features', {})
        
        # Dangerous features in production
        dangerous = ['edge', 'federation']
        for feature in dangerous:
            if features.get(feature, {}).get('enabled'):
                self.warnings.append(
                    f"Feature '{feature}' enabled - "
                    "ensure proper testing before production"
                )
        
        # Self-healing requires Prometheus
        if features.get('selfHealing', {}).get('enabled'):
            obs = values.get('observability', {})
            if not obs.get('prometheus', {}).get('enabled'):
                self.errors.append(
                    "selfHealing requires observability.prometheus.enabled=true"
                )
    
    def check_security(self, values: Dict):
        """Check security settings."""
        security = values.get('security', {})
        
        if not security.get('vault', {}).get('enabled'):
            self.warnings.append(
                "Vault is disabled - secrets management may be insecure"
            )
        
        if not security.get('rbac', {}).get('enabled'):
            self.errors.append(
                "RBAC must be enabled for production"
            )
        
        if not security.get('networkPolicy', {}).get('enabled'):
            self.warnings.append(
                "NetworkPolicy is disabled - no network segmentation"
            )
    
    def check_observability(self, values: Dict):
        """Check observability settings."""
        obs = values.get('observability', {})
        
        if not obs.get('otel', {}).get('enabled'):
            self.warnings.append(
                "OpenTelemetry is disabled - no distributed tracing"
            )
        
        if not obs.get('prometheus', {}).get('enabled'):
            self.warnings.append(
                "Prometheus is disabled - no metrics collection"
            )
    
    def report(self):
        """Print validation report."""
        print("\n" + "="*70)
        print("Helm Values Sanity Check")
        print("="*70 + "\n")
        
        if self.errors:
            print("❌ ERRORS:")
            for err in self.errors:
                print(f"  • {err}")
            print()
        
        if self.warnings:
            print("⚠️  WARNINGS:")
            for warn in self.warnings:
                print(f"  • {warn}")
            print()
        
        if not self.errors and not self.warnings:
            print("✅ All checks passed!")
        
        print("="*70 + "\n")

def main():
    if len(sys.argv) < 2:
        print("Usage: python values_sanity.py <values.yaml>")
        sys.exit(1)
    
    validator = ValuesValidator(sys.argv[1])
    success = validator.validate()
    validator.report()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
