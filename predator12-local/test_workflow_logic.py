#!/usr/bin/env python3
"""Test script for workflow logic validation."""

import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "backend/app/fastapi_app"))

from routes_agents import WorkflowRequest, _validate_workflow_dependencies


def test_workflow_dependencies():
    """Test workflow dependency validation."""
    print("🧪 Testing workflow dependencies...")

    # Valid workflows
    valid_cases = [
        ["ingest"],
        ["ingest", "data_quality"],
        ["ingest", "data_quality", "anomaly"],
        ["ingest", "data_quality", "synthetic"],
        ["security_privacy"],
        ["self_healing"],
    ]

    # Invalid workflows
    invalid_cases = [
        ["anomaly"],  # Missing ingest
        ["data_quality"],  # Missing ingest
        ["synthetic"],  # Missing data_quality
        ["anomaly", "data_quality"],  # Missing ingest
    ]

    print("✅ Testing valid workflows:")
    for case in valid_cases:
        result = _validate_workflow_dependencies(case)
        print(f"  {case} -> {result}")
        assert result == True, f"Expected True for {case}"

    print("❌ Testing invalid workflows:")
    for case in invalid_cases:
        result = _validate_workflow_dependencies(case)
        print(f"  {case} -> {result}")
        assert result == False, f"Expected False for {case}"

    print("✅ All dependency tests passed!")


def test_workflow_request_validation():
    """Test WorkflowRequest validation."""
    print("\n🧪 Testing WorkflowRequest validation...")

    # Valid requests
    try:
        req1 = WorkflowRequest(dataset_id="test123", analyses=["ingest", "data_quality"])
        print("✅ Valid request created successfully")
    except Exception as e:
        print(f"❌ Unexpected error for valid request: {e}")
        return False

    # Invalid requests
    try:
        req2 = WorkflowRequest(dataset_id="test123", analyses=["invalid_analysis"])
        print("❌ Should have failed for invalid analysis")
        return False
    except ValueError as e:
        print(f"✅ Correctly caught invalid analysis: {e}")
    except Exception as e:
        print(f"❌ Unexpected error type: {e}")
        return False

    print("✅ All validation tests passed!")
    return True


def main():
    """Run all tests."""
    print("🚀 Starting workflow logic tests...\n")

    try:
        test_workflow_dependencies()
        test_workflow_request_validation()
        print("\n🎉 All tests passed! Workflow logic is correct.")
        return 0
    except Exception as e:
        print(f"\n💥 Test failed: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
