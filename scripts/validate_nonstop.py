#!/usr/bin/env python3
"""
Validate Non-Stop Predator configuration and environment.
This script validates that all required environment variables, configurations,
and dependencies are properly set for the non-stop operation mode.
"""

import os
import sys
import yaml
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any

# Exit codes
EXIT_SUCCESS = 0
EXIT_CONFIG_ERROR = 1
EXIT_ENV_ERROR = 2
EXIT_DEPENDENCY_ERROR = 3

class NonStopValidator:
    """Validator for Non-Stop Predator configuration."""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.repo_root = Path(__file__).parent.parent
        
    def log_error(self, message: str):
        """Log an error message."""
        self.errors.append(f"ERROR: {message}")
        print(f"❌ {message}", file=sys.stderr)
        
    def log_warning(self, message: str):
        """Log a warning message."""
        self.warnings.append(f"WARNING: {message}")
        print(f"⚠️  {message}")
        
    def log_success(self, message: str):
        """Log a success message."""
        print(f"✅ {message}")
        
    def validate_environment_variables(self) -> bool:
        """Validate required environment variables."""
        required_vars = [
            "GITHUB_TOKEN",
            "GITHUB_REPOSITORY",
            "GITHUB_WORKSPACE",
        ]
        
        optional_vars = [
            "VAULT_ADDR",
            "ARGO_AUTH_TOKEN",
            "MANIFESTS_REPO",
            "REGISTRY_HOST",
        ]
        
        all_valid = True
        
        for var in required_vars:
            if not os.getenv(var):
                self.log_error(f"Required environment variable {var} is not set")
                all_valid = False
            else:
                self.log_success(f"Required environment variable {var} is set")
                
        for var in optional_vars:
            if not os.getenv(var):
                self.log_warning(f"Optional environment variable {var} is not set")
            else:
                self.log_success(f"Optional environment variable {var} is set")
                
        return all_valid
        
    def validate_file_structure(self) -> bool:
        """Validate required file structure."""
        required_files = [
            "scripts/opsctl",
            ".github/workflows/nonstop.yml",
        ]
        
        optional_files = [
            "helm/Chart.yaml",
            "Dockerfile",
            "requirements.txt",
            "package.json",
        ]
        
        all_valid = True
        
        for file_path in required_files:
            full_path = self.repo_root / file_path
            if not full_path.exists():
                self.log_error(f"Required file {file_path} does not exist")
                all_valid = False
            else:
                self.log_success(f"Required file {file_path} exists")
                
        for file_path in optional_files:
            full_path = self.repo_root / file_path
            if not full_path.exists():
                self.log_warning(f"Optional file {file_path} does not exist")
            else:
                self.log_success(f"Optional file {file_path} exists")
                
        return all_valid
        
    def validate_docker_setup(self) -> bool:
        """Validate Docker configuration."""
        try:
            # Check if Docker is available
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                self.log_success(f"Docker is available: {result.stdout.strip()}")
                return True
            else:
                self.log_warning("Docker is not available in this environment")
                return True  # Not critical for validation
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.log_warning("Docker command not found or timed out")
            return True  # Not critical for validation
            
    def validate_git_setup(self) -> bool:
        """Validate Git configuration."""
        try:
            # Check if we're in a git repository
            result = subprocess.run(
                ["git", "rev-parse", "--git-dir"],
                capture_output=True,
                text=True,
                timeout=10,
                cwd=self.repo_root
            )
            if result.returncode == 0:
                self.log_success("Git repository detected")
                
                # Check for submodules
                gitmodules_path = self.repo_root / ".gitmodules"
                if gitmodules_path.exists():
                    self.log_success("Git submodules configuration found")
                    
                    # Try to validate submodule status
                    try:
                        submodule_result = subprocess.run(
                            ["git", "submodule", "status"],
                            capture_output=True,
                            text=True,
                            timeout=10,
                            cwd=self.repo_root
                        )
                        if submodule_result.returncode == 0:
                            self.log_success("Git submodules status OK")
                        else:
                            self.log_warning(f"Git submodules issue: {submodule_result.stderr}")
                    except subprocess.TimeoutExpired:
                        self.log_warning("Git submodule status check timed out")
                        
                return True
            else:
                self.log_error("Not in a Git repository")
                return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.log_error("Git command not found or timed out")
            return False
            
    def validate_python_environment(self) -> bool:
        """Validate Python environment."""
        try:
            # Check Python version
            python_version = sys.version_info
            if python_version >= (3, 8):
                self.log_success(f"Python version OK: {python_version.major}.{python_version.minor}.{python_version.micro}")
            else:
                self.log_error(f"Python version too old: {python_version.major}.{python_version.minor}.{python_version.micro}. Required: 3.8+")
                return False
                
            # Check for required Python packages
            required_packages = ["yaml", "requests"]
            
            for package in required_packages:
                try:
                    __import__(package)
                    self.log_success(f"Python package {package} is available")
                except ImportError:
                    self.log_warning(f"Python package {package} is not available")
                    
            return True
        except Exception as e:
            self.log_error(f"Python environment validation failed: {e}")
            return False
            
    def validate_workflow_config(self) -> bool:
        """Validate GitHub Actions workflow configuration."""
        workflow_path = self.repo_root / ".github/workflows/nonstop.yml"
        
        if not workflow_path.exists():
            self.log_error("Non-stop workflow file does not exist")
            return False
            
        try:
            with open(workflow_path, 'r') as f:
                workflow_config = yaml.safe_load(f)
                
            # Basic validation
            if not workflow_config.get('jobs'):
                self.log_error("Workflow has no jobs defined")
                return False
                
            required_jobs = ['guardrails', 'ci', 'cd']
            for job in required_jobs:
                if job not in workflow_config['jobs']:
                    self.log_warning(f"Expected job '{job}' not found in workflow")
                else:
                    self.log_success(f"Workflow job '{job}' found")
                    
            self.log_success("Workflow configuration validation passed")
            return True
            
        except yaml.YAMLError as e:
            self.log_error(f"Invalid YAML in workflow file: {e}")
            return False
        except Exception as e:
            self.log_error(f"Error reading workflow file: {e}")
            return False
            
    def run_validation(self) -> int:
        """Run all validations and return exit code."""
        print("🔍 Starting Non-Stop Predator validation...")
        print("=" * 50)
        
        validations = [
            ("Environment Variables", self.validate_environment_variables),
            ("File Structure", self.validate_file_structure),
            ("Git Setup", self.validate_git_setup),
            ("Python Environment", self.validate_python_environment),
            ("Docker Setup", self.validate_docker_setup),
            ("Workflow Configuration", self.validate_workflow_config),
        ]
        
        all_passed = True
        
        for name, validation_func in validations:
            print(f"\n📋 Validating {name}...")
            if not validation_func():
                all_passed = False
                
        print("\n" + "=" * 50)
        
        if self.errors:
            print(f"❌ Validation failed with {len(self.errors)} errors:")
            for error in self.errors:
                print(f"  {error}")
            return EXIT_CONFIG_ERROR
            
        if self.warnings:
            print(f"⚠️  Validation passed with {len(self.warnings)} warnings:")
            for warning in self.warnings:
                print(f"  {warning}")
                
        print("✅ Non-Stop Predator validation completed successfully!")
        return EXIT_SUCCESS

def main():
    """Main entry point."""
    validator = NonStopValidator()
    exit_code = validator.run_validation()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()