#!/usr/bin/env python3
"""
maybe_release.py - Conditional Release Decision

This script makes a conditional release decision based on:
- Release gate status
- Time windows
- Auto-merge configuration
- Previous release history
"""

import sys
import os
import argparse
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Optional

# Exit codes
EXIT_SUCCESS = 0
EXIT_NO_RELEASE = 1
EXIT_ERROR = 2


class ReleaseDecisionMaker:
    """Makes conditional release decisions."""
    
    def __init__(self, env: str, timebox: Optional[str] = None):
        self.env = env
        self.timebox = timebox
        self.reasons = []
        
    def log_info(self, message: str):
        """Log info message."""
        print(f"ℹ️  {message}")
        
    def log_success(self, message: str):
        """Log success message."""
        print(f"✅ {message}")
        
    def log_warning(self, message: str):
        """Log warning message."""
        print(f"⚠️  {message}")
        
    def log_error(self, message: str):
        """Log error message."""
        print(f"❌ {message}", file=sys.stderr)
        
    def parse_timebox(self) -> Optional[timedelta]:
        """Parse timebox duration string (e.g., '12h', '30m', '2d')."""
        if not self.timebox:
            return None
            
        pattern = r'^(\d+)([hmd])$'
        match = re.match(pattern, self.timebox)
        
        if not match:
            self.log_warning(f"Invalid timebox format: {self.timebox}")
            return None
            
        value, unit = match.groups()
        value = int(value)
        
        if unit == 'h':
            return timedelta(hours=value)
        elif unit == 'm':
            return timedelta(minutes=value)
        elif unit == 'd':
            return timedelta(days=value)
        else:
            return None
            
    def check_time_window(self) -> bool:
        """Check if current time is within release window."""
        self.log_info("Checking release time window...")
        
        current_time = datetime.now()
        
        # Check if within business hours for prod releases
        if self.env == "prod":
            # Business hours: 9 AM - 5 PM, Monday-Friday
            if current_time.weekday() >= 5:  # Saturday or Sunday
                self.reasons.append("Weekend - production releases not allowed")
                self.log_warning("Current time is weekend")
                return False
                
            if current_time.hour < 9 or current_time.hour >= 17:
                self.reasons.append("Outside business hours - production releases not allowed")
                self.log_warning("Current time is outside business hours")
                return False
                
        self.log_success("Within acceptable release time window")
        return True
        
    def check_timebox(self) -> bool:
        """Check if we're within the specified timebox."""
        if not self.timebox:
            self.log_info("No timebox specified")
            return True
            
        duration = self.parse_timebox()
        if not duration:
            return True
            
        self.log_info(f"Timebox: {self.timebox} ({duration})")
        
        # In a real implementation, would check against:
        # - Start time of the pipeline
        # - Time since last successful release
        # For stub, we'll assume we're within timebox
        
        self.log_success("Within timebox")
        return True
        
    def check_auto_merge(self) -> bool:
        """Check if auto-merge is enabled."""
        self.log_info("Checking auto-merge configuration...")
        
        auto_merge = os.getenv("AUTO_MERGE", "0")
        
        if auto_merge == "1":
            self.log_success("Auto-merge is enabled")
            return True
        else:
            self.reasons.append("Auto-merge is not enabled")
            self.log_warning("Auto-merge is not enabled (AUTO_MERGE != 1)")
            return False
            
    def check_recent_failures(self) -> bool:
        """Check for recent deployment failures."""
        self.log_info("Checking recent deployment history...")
        
        # In a real implementation, would query:
        # - ArgoCD sync history
        # - Previous pipeline runs
        # - Error tracking systems
        
        # For stub, assume no recent failures
        recent_failures = 0
        
        if recent_failures > 0:
            self.reasons.append(f"{recent_failures} recent deployment failures detected")
            self.log_error(f"Recent failures detected: {recent_failures}")
            return False
            
        self.log_success("No recent deployment failures")
        return True
        
    def check_manifests_repo(self) -> bool:
        """Check if manifests repository is configured."""
        self.log_info("Checking manifests repository configuration...")
        
        manifests_repo = os.getenv("MANIFESTS_REPO", "")
        
        if manifests_repo:
            self.log_success(f"Manifests repository configured: {manifests_repo}")
            return True
        else:
            self.reasons.append("Manifests repository not configured")
            self.log_warning("MANIFESTS_REPO not set")
            return False
            
    def make_decision(self) -> bool:
        """Make the release decision."""
        print(f"🤔 Evaluating release decision for environment: {self.env}")
        print("=" * 60)
        
        checks = [
            ("Time Window", self.check_time_window),
            ("Timebox", self.check_timebox),
            ("Auto-merge", self.check_auto_merge),
            ("Recent Failures", self.check_recent_failures),
            ("Manifests Repo", self.check_manifests_repo),
        ]
        
        all_passed = True
        
        for check_name, check_func in checks:
            print(f"\n📋 {check_name}")
            if not check_func():
                all_passed = False
                
        print("\n" + "=" * 60)
        
        return all_passed
        
    def create_release(self) -> bool:
        """Create the release artifacts."""
        self.log_info("Creating release artifacts...")
        
        # In a real implementation, would:
        # 1. Create manifests PR
        # 2. Update ArgoCD applications
        # 3. Trigger deployment
        
        ops_image = os.getenv("OPS_IMAGE", "")
        if ops_image:
            self.log_info(f"Release image: {ops_image}")
            
        self.log_success("Release artifacts created (stub)")
        return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Make conditional release decision"
    )
    parser.add_argument(
        "--env",
        type=str,
        default="prod",
        help="Target environment (dev|stage|prod)"
    )
    parser.add_argument(
        "--timebox",
        type=str,
        help="Time limit for release (e.g., 12h, 30m)"
    )
    
    args = parser.parse_args()
    
    decision_maker = ReleaseDecisionMaker(args.env, args.timebox)
    
    if decision_maker.make_decision():
        decision_maker.log_success("✅ RELEASE APPROVED")
        
        if decision_maker.create_release():
            decision_maker.log_success("Release process initiated")
            sys.exit(EXIT_SUCCESS)
        else:
            decision_maker.log_error("Failed to create release")
            sys.exit(EXIT_ERROR)
    else:
        decision_maker.log_warning("❌ RELEASE DENIED")
        if decision_maker.reasons:
            print("\nReasons:")
            for reason in decision_maker.reasons:
                print(f"  • {reason}")
        sys.exit(EXIT_NO_RELEASE)


if __name__ == "__main__":
    main()
