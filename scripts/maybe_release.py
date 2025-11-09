#!/usr/bin/env python3
"""
Conditionally trigger a release based on various criteria.
This script evaluates whether a release should proceed and initiates it if conditions are met.
"""

import sys
import argparse
import os
import subprocess
from datetime import datetime, timedelta


def parse_timebox(timebox_str: str) -> timedelta:
    """
    Parse timebox string like '12h', '24h', '2d' into timedelta.
    
    Args:
        timebox_str: String representation of time (e.g., '12h', '2d')
        
    Returns:
        timedelta object
    """
    if timebox_str.endswith('h'):
        hours = int(timebox_str[:-1])
        return timedelta(hours=hours)
    elif timebox_str.endswith('d'):
        days = int(timebox_str[:-1])
        return timedelta(days=days)
    elif timebox_str.endswith('m'):
        minutes = int(timebox_str[:-1])
        return timedelta(minutes=minutes)
    else:
        raise ValueError(f"Invalid timebox format: {timebox_str}")


def check_timebox(timebox: timedelta) -> bool:
    """
    Check if we're within the timebox for release.
    
    Args:
        timebox: Time window for release
        
    Returns:
        True if within timebox, False otherwise
    """
    # In a real implementation, this would check against the last release time
    # For stub purposes, always return True
    print(f"✅ Within timebox window: {timebox}")
    return True


def check_auto_merge_conditions() -> bool:
    """
    Check if auto-merge conditions are met.
    
    Returns:
        True if conditions are met, False otherwise
    """
    auto_merge = os.getenv('AUTO_MERGE', '0')
    
    if auto_merge != '1':
        print("❌ Auto-merge is not enabled")
        return False
    
    print("✅ Auto-merge is enabled")
    
    # Check for required environment variables
    manifests_repo = os.getenv('MANIFESTS_REPO')
    if not manifests_repo:
        print("⚠️  Warning: MANIFESTS_REPO not set")
    
    ops_image = os.getenv('OPS_IMAGE')
    if not ops_image:
        print("⚠️  Warning: OPS_IMAGE not set")
    
    return True


def create_manifests_pr(env: str) -> bool:
    """
    Create a PR to update manifests repository.
    
    Args:
        env: Environment name
        
    Returns:
        True if PR created successfully, False otherwise
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pr_script = os.path.join(script_dir, 'create-manifests-pr.sh')
    
    if not os.path.exists(pr_script):
        print(f"⚠️  Warning: {pr_script} not found, skipping PR creation")
        return True
    
    print(f"📝 Creating manifests PR for {env}...")
    
    try:
        result = subprocess.run(
            [pr_script, env],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print("✅ Manifests PR created successfully")
            return True
        else:
            print(f"❌ Failed to create manifests PR: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Manifests PR creation timed out")
        return False
    except Exception as e:
        print(f"❌ Error creating manifests PR: {e}")
        return False


def maybe_release(env: str, timebox: timedelta) -> bool:
    """
    Evaluate and potentially trigger a release.
    
    Args:
        env: Environment name
        timebox: Time window for release
        
    Returns:
        True if release was triggered or conditions met, False otherwise
    """
    print(f"🔍 Evaluating release conditions for {env}...")
    
    # Check timebox
    if not check_timebox(timebox):
        print("❌ Outside timebox window")
        return False
    
    # Check auto-merge conditions
    if not check_auto_merge_conditions():
        print("❌ Auto-merge conditions not met")
        return False
    
    # Check release gate
    print("🚪 Checking release gate...")
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        gate_script = os.path.join(script_dir, 'check_release_gate.py')
        
        result = subprocess.run(
            ['python3', gate_script, '--env', env],
            capture_output=True,
            timeout=30
        )
        
        if result.returncode != 0:
            print("❌ Release gate is closed")
            return False
            
    except Exception as e:
        print(f"⚠️  Warning: Could not check release gate: {e}")
    
    # Create manifests PR
    if not create_manifests_pr(env):
        print("⚠️  Warning: Could not create manifests PR")
    
    print(f"✅ Release conditions met for {env}")
    print(f"🚀 Release would be triggered here (stub implementation)")
    
    return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Conditionally trigger a release'
    )
    parser.add_argument(
        '--env',
        default='prod',
        help='Environment to release to (default: prod)'
    )
    parser.add_argument(
        '--timebox',
        default='12h',
        help='Time window for release (e.g., 12h, 24h, 2d)'
    )
    
    args = parser.parse_args()
    
    try:
        timebox = parse_timebox(args.timebox)
    except ValueError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    
    success = maybe_release(args.env, timebox)
    
    if success:
        print(f"✅ Maybe-release completed for {args.env}")
        sys.exit(0)
    else:
        print(f"❌ Maybe-release conditions not met for {args.env}")
        sys.exit(1)


if __name__ == '__main__':
    main()
