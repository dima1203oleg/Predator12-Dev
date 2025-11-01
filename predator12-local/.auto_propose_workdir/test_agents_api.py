#!/usr/bin/env python3
"""
Test script for Agents API endpoints
"""

import asyncio
import json
from typing import Any, Dict

import httpx

BASE_URL = "http://localhost:8000/agents"


class AgentsAPITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)

    async def test_agent_status(self) -> Dict[str, Any]:
        """Test GET /agents/status"""
        print("🔍 Testing agent status endpoint...")
        try:
            response = await self.client.get(f"{self.base_url}/status")
            if response.status_code == 200:
                data = response.json()
                print(
                    f"✅ Agent status: {data['summary']['healthy']}/{data['summary']['total']} healthy"
                )
                return {"status": "success", "data": data}
            else:
                print(f"❌ Status check failed: {response.status_code}")
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            print(f"❌ Status check error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_available_analyses(self) -> Dict[str, Any]:
        """Test GET /agents/analyses"""
        print("📋 Testing available analyses endpoint...")
        try:
            response = await self.client.get(f"{self.base_url}/analyses")
            if response.status_code == 200:
                data = response.json()
                analyses_count = len(data["available_analyses"])
                print(f"✅ Available analyses: {analyses_count} types")
                print(f"   Dependencies: {len(data['dependencies'])} rules")
                return {"status": "success", "data": data}
            else:
                print(f"❌ Analyses check failed: {response.status_code}")
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            print(f"❌ Analyses check error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_workflow_execution(self) -> Dict[str, Any]:
        """Test POST /agents/execute"""
        print("🚀 Testing workflow execution...")

        # Test valid workflow
        valid_payload = {
            "dataset_id": "test_dataset_123",
            "analyses": ["ingest", "data_quality"],
            "params": {"ingest": {"source_type": "csv"}, "data_quality": {"threshold": 0.8}},
        }

        try:
            response = await self.client.post(f"{self.base_url}/execute", json=valid_payload)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Workflow executed: {data['task_id']}")
                print(f"   Status: {data['status']}")
                return {"status": "success", "data": data}
            else:
                print(f"❌ Workflow execution failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            print(f"❌ Workflow execution error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_invalid_workflow(self) -> Dict[str, Any]:
        """Test workflow with invalid dependencies"""
        print("⚠️  Testing invalid workflow (should fail)...")

        # Test invalid workflow - anomaly without ingest
        invalid_payload = {
            "dataset_id": "test_dataset_456",
            "analyses": ["anomaly"],  # Missing required 'ingest'
            "params": {},
        }

        try:
            response = await self.client.post(f"{self.base_url}/execute", json=invalid_payload)
            if response.status_code == 400:
                print("✅ Invalid workflow correctly rejected")
                return {"status": "success", "message": "Validation working"}
            else:
                print(f"❌ Invalid workflow should have been rejected: {response.status_code}")
                return {"status": "error", "message": "Validation not working"}
        except Exception as e:
            print(f"❌ Invalid workflow test error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_simulation(self) -> Dict[str, Any]:
        """Test POST /agents/simulate"""
        print("🎭 Testing agent simulation...")
        try:
            response = await self.client.post(f"{self.base_url}/simulate")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Simulation completed: {data['agents_simulated']} agents")
                print(f"   Simulation ID: {data['simulation_id']}")
                return {"status": "success", "data": data}
            else:
                print(f"❌ Simulation failed: {response.status_code}")
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            print(f"❌ Simulation error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_workflow_status(self, task_id: str = "test_task_123") -> Dict[str, Any]:
        """Test GET /agents/workflows/{task_id}"""
        print(f"📊 Testing workflow status for {task_id}...")
        try:
            response = await self.client.get(f"{self.base_url}/workflows/{task_id}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Workflow status: {data['status']} ({data['progress']}%)")
                return {"status": "success", "data": data}
            else:
                print(f"❌ Workflow status failed: {response.status_code}")
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            print(f"❌ Workflow status error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_workflow_list(self) -> Dict[str, Any]:
        """Test GET /agents/workflows"""
        print("📝 Testing workflow list...")
        try:
            response = await self.client.get(f"{self.base_url}/workflows?limit=5&offset=0")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Workflow list: {len(data['workflows'])} workflows")
                print(f"   Total: {data['total']}")
                return {"status": "success", "data": data}
            else:
                print(f"❌ Workflow list failed: {response.status_code}")
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            print(f"❌ Workflow list error: {e}")
            return {"status": "error", "error": str(e)}

    async def test_workflow_cancellation(self, task_id: str = "test_task_456") -> Dict[str, Any]:
        """Test DELETE /agents/workflows/{task_id}"""
        print(f"🛑 Testing workflow cancellation for {task_id}...")
        try:
            response = await self.client.delete(f"{self.base_url}/workflows/{task_id}")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Workflow cancelled: {data['status']}")
                return {"status": "success", "data": data}
            else:
                print(f"❌ Workflow cancellation failed: {response.status_code}")
                return {"status": "error", "code": response.status_code}
        except Exception as e:
            print(f"❌ Workflow cancellation error: {e}")
            return {"status": "error", "error": str(e)}

    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all API tests"""
        print("🧪 Starting Agents API comprehensive tests...\n")

        results = {}

        # Test all endpoints
        results["agent_status"] = await self.test_agent_status()
        results["available_analyses"] = await self.test_available_analyses()
        results["workflow_execution"] = await self.test_workflow_execution()
        results["invalid_workflow"] = await self.test_invalid_workflow()
        results["simulation"] = await self.test_simulation()
        results["workflow_status"] = await self.test_workflow_status()
        results["workflow_list"] = await self.test_workflow_list()
        results["workflow_cancellation"] = await self.test_workflow_cancellation()

        # Summary
        successful_tests = sum(1 for r in results.values() if r.get("status") == "success")
        total_tests = len(results)

        print(f"\n📊 Test Summary:")
        print(f"   ✅ Successful: {successful_tests}/{total_tests}")
        print(f"   ❌ Failed: {total_tests - successful_tests}/{total_tests}")

        if successful_tests == total_tests:
            print("🎉 All tests passed! Agents API is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the output above for details.")

        return {
            "summary": {
                "total_tests": total_tests,
                "successful": successful_tests,
                "failed": total_tests - successful_tests,
                "success_rate": successful_tests / total_tests,
            },
            "results": results,
        }

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


async def main():
    """Main test function"""
    tester = AgentsAPITester()
    try:
        results = await tester.run_all_tests()

        # Save results to file
        with open("agents_api_test_results.json", "w") as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Test results saved to agents_api_test_results.json")

        return 0 if results["summary"]["success_rate"] == 1.0 else 1

    except Exception as e:
        print(f"💥 Test suite failed: {e}")
        return 1
    finally:
        await tester.close()


if __name__ == "__main__":
    exit(asyncio.run(main()))
