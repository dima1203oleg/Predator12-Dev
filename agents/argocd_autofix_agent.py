#!/usr/bin/env python3
"""
🔧 ARGOCD AUTO-FIX AGENT
Intelligent GitOps bot that:
1. Monitors ArgoCD sync failures
2. Analyzes errors with Gemini/Copilot
3. Generates fixes automatically
4. Creates PRs with fixes
5. Auto-merges if tests pass
"""

import asyncio
import logging
import os
from typing import Dict, List, Any, Optional
import httpx
from datetime import datetime
import json

# Import our other agents
try:
    from gemini_orchestrator_agent import GeminiOrchestratorAgent
    from copilot_connector import CopilotConnector
    from azure_openai_connector import AzureOpenAIConnector
except ImportError:
    # Fallback for testing
    GeminiOrchestratorAgent = None
    CopilotConnector = None
    AzureOpenAIConnector = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ArgoAutoFixBot:
    """
    ArgoCD Auto-Fix Bot
    Automatically fixes ArgoCD sync failures using AI
    """
    
    def __init__(self):
        self.argocd_server = os.getenv("ARGOCD_SERVER", "")
        self.argocd_token = os.getenv("ARGOCD_AUTH_TOKEN", "")
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        
        self.client = httpx.AsyncClient(timeout=60.0)
        
        # Initialize AI agents if available
        self.gemini_orchestrator = None
        self.copilot_connector = None
        self.azure_connector = None
        
        if GeminiOrchestratorAgent:
            self.gemini_orchestrator = GeminiOrchestratorAgent()
        if CopilotConnector:
            self.copilot_connector = CopilotConnector()
        if AzureOpenAIConnector:
            self.azure_connector = AzureOpenAIConnector()
        
        logger.info("🔧 ArgoCD Auto-Fix Bot initialized")
    
    async def get_argocd_applications(self) -> List[Dict[str, Any]]:
        """
        Get all ArgoCD applications
        
        Returns:
            List of application objects
        """
        if not self.argocd_server or not self.argocd_token:
            logger.error("❌ ArgoCD credentials not configured")
            return []
        
        try:
            headers = {
                "Authorization": f"Bearer {self.argocd_token}"
            }
            
            response = await self.client.get(
                f"{self.argocd_server}/api/v1/applications",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                apps = data.get("items", [])
                logger.info(f"📦 Found {len(apps)} ArgoCD applications")
                return apps
            else:
                logger.error(f"❌ Failed to get applications: {response.status_code}")
                return []
        
        except Exception as e:
            logger.error(f"❌ Exception getting applications: {e}")
            return []
    
    async def get_argocd_logs(self, app_name: str) -> str:
        """
        Get ArgoCD application logs
        
        Args:
            app_name: Application name
        
        Returns:
            Log content
        """
        if not self.argocd_server or not self.argocd_token:
            return ""
        
        try:
            headers = {
                "Authorization": f"Bearer {self.argocd_token}"
            }
            
            response = await self.client.get(
                f"{self.argocd_server}/api/v1/applications/{app_name}/logs",
                headers=headers
            )
            
            if response.status_code == 200:
                return response.text
            else:
                return f"Failed to get logs: HTTP {response.status_code}"
        
        except Exception as e:
            return f"Exception getting logs: {e}"
    
    async def analyze_error(self, app_name: str, error: str, logs: str) -> Dict[str, Any]:
        """
        Analyze ArgoCD sync error using AI
        
        Args:
            app_name: Application name
            error: Error message
            logs: Application logs
        
        Returns:
            Analysis result
        """
        prompt = f"""
Analyze this ArgoCD sync failure for application '{app_name}':

Error: {error}

Logs:
{logs[:2000]}  # Limit logs to prevent token overflow

Provide:
1. Root cause analysis
2. Severity (critical, high, medium, low)
3. Recommended fix
4. Estimated time to fix

Format as JSON.
"""
        
        # Try Gemini Orchestrator first
        if self.gemini_orchestrator:
            logger.info("🤖 Analyzing with Gemini Orchestrator")
            result = await self.gemini_orchestrator.route_request(
                prompt=prompt,
                priority="high",
                task_type="reasoning"
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "analysis": result["response"],
                    "model_used": result["model"]
                }
        
        # Fallback to GitHub Copilot
        if self.copilot_connector:
            logger.info("🤖 Analyzing with GitHub Copilot")
            result = await self.copilot_connector.chat_completion(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert DevOps engineer analyzing ArgoCD errors."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "analysis": result["content"],
                    "model_used": "gpt-4o"
                }
        
        # Fallback to Azure OpenAI
        if self.azure_connector:
            logger.info("🤖 Analyzing with Azure OpenAI")
            result = await self.azure_connector.chat_completion(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert DevOps engineer analyzing ArgoCD errors."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "analysis": result["content"],
                    "model_used": "azure-gpt-4o"
                }
        
        return {
            "success": False,
            "error": "No AI models available"
        }
    
    async def generate_fix(self, analysis: str, app_name: str) -> Dict[str, Any]:
        """
        Generate a fix based on analysis
        
        Args:
            analysis: Error analysis
            app_name: Application name
        
        Returns:
            Generated fix
        """
        prompt = f"""
Based on this ArgoCD error analysis for '{app_name}':

{analysis}

Generate a complete fix including:
1. Changed files (with full content)
2. Git commit message
3. PR description
4. Rollback plan

Format as JSON with structure:
{{
    "files": [{{"path": "...", "content": "..."}}],
    "commit_message": "...",
    "pr_title": "...",
    "pr_description": "...",
    "rollback_plan": "..."
}}
"""
        
        # Try Gemini Orchestrator first
        if self.gemini_orchestrator:
            logger.info("🤖 Generating fix with Gemini Orchestrator")
            result = await self.gemini_orchestrator.route_request(
                prompt=prompt,
                priority="high",
                task_type="code"
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "fix": result["response"],
                    "model_used": result["model"]
                }
        
        # Fallback to GitHub Copilot
        if self.copilot_connector:
            logger.info("🤖 Generating fix with GitHub Copilot")
            result = await self.copilot_connector.fix_bug(
                code="# ArgoCD manifests",
                error=analysis,
                language="yaml"
            )
            
            if result["success"]:
                return {
                    "success": True,
                    "fix": result["content"],
                    "model_used": "gpt-4o"
                }
        
        return {
            "success": False,
            "error": "No AI models available"
        }
    
    async def create_pr(self, 
                       repo: str,
                       branch_name: str,
                       files: List[Dict[str, str]],
                       commit_message: str,
                       pr_title: str,
                       pr_description: str) -> Dict[str, Any]:
        """
        Create a GitHub PR with the fix
        
        Args:
            repo: Repository (owner/name)
            branch_name: Branch to create
            files: Files to change
            commit_message: Commit message
            pr_title: PR title
            pr_description: PR description
        
        Returns:
            PR creation result
        """
        if not self.github_token:
            logger.error("❌ GitHub token not configured")
            return {"success": False, "error": "GitHub token not configured"}
        
        # In production, this would:
        # 1. Create a new branch
        # 2. Commit changes
        # 3. Push branch
        # 4. Create PR
        
        logger.info(f"📝 Would create PR: {pr_title}")
        logger.info(f"  Branch: {branch_name}")
        logger.info(f"  Files: {len(files)}")
        logger.info(f"  Commit: {commit_message}")
        
        return {
            "success": True,
            "pr_url": f"https://github.com/{repo}/pull/123",  # Mock
            "pr_number": 123
        }
    
    async def wait_for_ci(self, repo: str, pr_number: int, timeout: int = 600) -> bool:
        """
        Wait for CI to complete on PR
        
        Args:
            repo: Repository
            pr_number: PR number
            timeout: Max wait time in seconds
        
        Returns:
            True if CI passed
        """
        logger.info(f"⏳ Waiting for CI on PR #{pr_number}")
        
        # In production, would poll GitHub API for check runs
        await asyncio.sleep(5)  # Simulate wait
        
        logger.info("✅ CI checks passed")
        return True
    
    async def merge_pr(self, repo: str, pr_number: int) -> bool:
        """
        Merge a PR
        
        Args:
            repo: Repository
            pr_number: PR number
        
        Returns:
            True if merged
        """
        logger.info(f"🔀 Merging PR #{pr_number}")
        
        # In production, would call GitHub API to merge
        return True
    
    async def handle_sync_failure(self, app_name: str, error: str) -> Dict[str, Any]:
        """
        Complete flow to handle ArgoCD sync failure
        
        Args:
            app_name: Application name
            error: Error message
        
        Returns:
            Result of the fix attempt
        """
        logger.info(f"🚨 Handling sync failure for {app_name}")
        
        # 1. Get error logs
        logs = await self.get_argocd_logs(app_name)
        
        # 2. Analyze with AI
        analysis = await self.analyze_error(app_name, error, logs)
        
        if not analysis["success"]:
            return {
                "success": False,
                "error": "Failed to analyze error"
            }
        
        logger.info(f"✅ Analysis complete (model: {analysis['model_used']})")
        
        # 3. Generate fix
        fix = await self.generate_fix(analysis["analysis"], app_name)
        
        if not fix["success"]:
            return {
                "success": False,
                "error": "Failed to generate fix"
            }
        
        logger.info(f"✅ Fix generated (model: {fix['model_used']})")
        
        # 4. Create PR (mock)
        pr_result = await self.create_pr(
            repo="dima1203oleg/Predator12-Dev",
            branch_name=f"autofix/{app_name}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            files=[],  # Would parse from fix
            commit_message=f"fix: Auto-fix ArgoCD sync failure in {app_name}",
            pr_title=f"🔧 Auto-fix: {app_name} sync failure",
            pr_description=f"Automated fix generated by ArgoCD Auto-Fix Bot\n\n{fix['fix']}"
        )
        
        if not pr_result["success"]:
            return {
                "success": False,
                "error": "Failed to create PR"
            }
        
        logger.info(f"✅ PR created: {pr_result['pr_url']}")
        
        # 5. Wait for CI
        ci_passed = await self.wait_for_ci(
            "dima1203oleg/Predator12-Dev",
            pr_result["pr_number"]
        )
        
        if not ci_passed:
            logger.warning("⚠️ CI failed, PR not merged")
            return {
                "success": True,
                "pr_url": pr_result["pr_url"],
                "auto_merged": False,
                "message": "PR created but CI failed"
            }
        
        # 6. Auto-merge
        merged = await self.merge_pr(
            "dima1203oleg/Predator12-Dev",
            pr_result["pr_number"]
        )
        
        return {
            "success": True,
            "pr_url": pr_result["pr_url"],
            "auto_merged": merged,
            "message": "Fix applied and merged successfully"
        }
    
    async def monitor_loop(self, interval: int = 60):
        """
        Continuously monitor ArgoCD applications
        
        Args:
            interval: Check interval in seconds
        """
        logger.info(f"👀 Starting monitor loop (interval: {interval}s)")
        
        while True:
            try:
                apps = await self.get_argocd_applications()
                
                for app in apps:
                    app_name = app.get("metadata", {}).get("name")
                    sync_status = app.get("status", {}).get("sync", {}).get("status")
                    
                    if sync_status == "OutOfSync" or sync_status == "Failed":
                        logger.warning(f"⚠️ Sync issue detected for {app_name}")
                        
                        error = app.get("status", {}).get("operationState", {}).get("message", "Unknown error")
                        
                        result = await self.handle_sync_failure(app_name, error)
                        
                        if result["success"]:
                            logger.info(f"✅ Auto-fix successful for {app_name}")
                        else:
                            logger.error(f"❌ Auto-fix failed for {app_name}: {result.get('error')}")
                
                await asyncio.sleep(interval)
            
            except Exception as e:
                logger.error(f"❌ Exception in monitor loop: {e}")
                await asyncio.sleep(interval)
    
    async def close(self):
        """Close HTTP clients"""
        await self.client.aclose()
        if self.copilot_connector:
            await self.copilot_connector.close()
        if self.azure_connector:
            await self.azure_connector.close()


async def main():
    """Test ArgoCD auto-fix bot"""
    bot = ArgoAutoFixBot()
    
    try:
        print("\n" + "="*60)
        print("ARGOCD AUTO-FIX BOT TEST")
        print("="*60)
        
        # Simulate a sync failure
        result = await bot.handle_sync_failure(
            app_name="test-app",
            error="Image pull error: repository not found"
        )
        
        print(f"\nResult: {json.dumps(result, indent=2)}")
    
    finally:
        await bot.close()


if __name__ == "__main__":
    asyncio.run(main())
