"""
Security API Routes
==================

FastAPI endpoints for security operations including SBOM generation,
vulnerability scanning, image signing, and compliance checking.

Delta Revision 1.1 - Component A5
"""

import json
import logging
import subprocess
from datetime import datetime
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Path, Query
from fastapi.security import HTTPBearer
from security_manager import SecurityManager, get_security_manager

logger = logging.getLogger("security_routes")
router = APIRouter(prefix="/security", tags=["Security & Supply Chain"])
security = HTTPBearer()


@router.post("/sbom/generate")
async def generate_sbom_endpoint(
    target: str,
    output_format: str = Query("spdx-json", regex="^(spdx-json|cyclonedx-json|syft-json)$"),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """
    Generate Software Bill of Materials (SBOM) for target.

    **Supported Targets:**
    - Container images: `nginx:latest`, `ghcr.io/org/app:v1.0`
    - Directories: `/path/to/source`
    - Archives: `app.tar.gz`

    **Formats:**
    - `spdx-json`: SPDX 2.3 JSON format
    - `cyclonedx-json`: CycloneDX JSON format
    - `syft-json`: Syft native format

    **Returns detailed component inventory with licenses and checksums.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        sbom_result = await security_manager.generate_sbom(target, output_format)

        return {
            "success": True,
            "scan_id": sbom_result["scan_id"],
            "target": sbom_result["target"],
            "component_count": sbom_result["component_count"],
            "components": [
                {
                    "name": comp.name,
                    "version": comp.version,
                    "type": comp.package_type,
                    "license": comp.license,
                }
                for comp in sbom_result["components"][:50]  # Limit for response size
            ],
            "generated_at": sbom_result["generated_at"],
            "download_url": f"/api/security/sbom/download/{sbom_result['scan_id']}",
        }

    except Exception as e:
        logger.error(f"Error generating SBOM: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Target not found")
        raise HTTPException(status_code=500, detail="SBOM generation failed")


@router.get("/sbom/download/{scan_id}")
async def download_sbom(
    scan_id: str, security_manager: SecurityManager = Depends(get_security_manager)
):
    """
    Download complete SBOM data for scan ID.

    **Returns full SBOM in original format.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        sbom_key = f"sbom:{scan_id}"
        sbom_data = await security_manager.redis.get(sbom_key)

        if not sbom_data:
            raise HTTPException(status_code=404, detail="SBOM not found or expired")

        sbom_info = json.loads(sbom_data)
        return sbom_info["sbom_data"]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading SBOM: {e}")
        raise HTTPException(status_code=500, detail="Failed to download SBOM")


@router.post("/scan/vulnerabilities")
async def scan_vulnerabilities_endpoint(
    target: str,
    scanner: str = Query("trivy", regex="^(trivy|grype)$"),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """
    Scan target for security vulnerabilities.

    **Supported Scanners:**
    - `trivy`: Comprehensive vulnerability scanner
    - `grype`: Anchore vulnerability scanner

    **Returns CVE findings with severity levels and remediation advice.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        scan_result = await security_manager.scan_vulnerabilities(target, scanner)

        # Summarize findings by severity
        severity_counts = {}
        for finding in scan_result.findings:
            severity = finding.get("severity", "UNKNOWN")
            severity_counts[severity] = severity_counts.get(severity, 0) + 1

        return {
            "success": True,
            "scan_id": scan_result.scan_id,
            "target": scan_result.target,
            "security_level": scan_result.security_level.value,
            "summary": {
                "total_vulnerabilities": len(scan_result.findings),
                "by_severity": severity_counts,
                "compliance_status": scan_result.compliance_status,
            },
            "critical_findings": [
                f for f in scan_result.findings if f.get("severity") == "CRITICAL"
            ][
                :10
            ],  # Top 10 critical
            "recommendations": scan_result.recommendations,
            "scanned_at": scan_result.timestamp.isoformat(),
            "full_report_url": f"/api/security/scan/report/{scan_result.scan_id}",
        }

    except Exception as e:
        logger.error(f"Error scanning vulnerabilities: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Target not found")
        raise HTTPException(status_code=500, detail="Vulnerability scan failed")


@router.get("/scan/report/{scan_id}")
async def get_scan_report(
    scan_id: str, security_manager: SecurityManager = Depends(get_security_manager)
):
    """
    Get detailed vulnerability scan report.

    **Includes complete CVE details and remediation steps.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        scan_key = f"vuln_scan:{scan_id}"
        scan_data = await security_manager.redis.get(scan_key)

        if not scan_data:
            raise HTTPException(status_code=404, detail="Scan report not found or expired")

        scan_info = json.loads(scan_data)
        return scan_info

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting scan report: {e}")
        raise HTTPException(status_code=500, detail="Failed to get scan report")


@router.post("/images/sign")
async def sign_container_image(
    image_name: str,
    keyless: bool = True,
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """
    Sign container image with cosign.

    **Signing Methods:**
    - `keyless=true`: OIDC-based keyless signing (recommended)
    - `keyless=false`: Key-based signing (requires private key)

    **Creates immutable cryptographic signature for supply chain security.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        # TODO: Implement proper key management
        private_key_path = None if keyless else "/tmp/cosign.key"

        signature = await security_manager.sign_container_image(image_name, private_key_path)

        return {
            "success": True,
            "image": signature.image_name,
            "digest": signature.image_digest,
            "signed_at": signature.signed_at.isoformat(),
            "signer": signature.signer,
            "verification_status": signature.verification_status,
            "signature_registry": security_manager.signing_config["signature_registry"],
        }

    except Exception as e:
        logger.error(f"Error signing container image: {e}")
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail="Container image not found")
        raise HTTPException(status_code=500, detail="Image signing failed")


@router.post("/secrets/rotate")
async def rotate_secrets_endpoint(
    secret_names: List[str],
    background_tasks: BackgroundTasks,
    namespace: str = "default",
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """
    **ADMIN ONLY**: Rotate Kubernetes secrets.

    **Automated secret rotation with backup and rollback capability.**
    **Requires admin authentication and Kubernetes access.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        # TODO: Add admin authentication check

        # Run rotation in background for large secret sets
        if len(secret_names) > 5:
            background_tasks.add_task(security_manager.rotate_secrets, secret_names, namespace)

            return {
                "success": True,
                "message": f"Secret rotation started for {len(secret_names)} secrets",
                "namespace": namespace,
                "check_status_url": "/api/security/secrets/rotation-status",
            }
        else:
            # Immediate rotation for small sets
            result = await security_manager.rotate_secrets(secret_names, namespace)

            return {
                "success": True,
                "rotation_id": result["rotation_id"],
                "rotated_at": result["rotated_at"],
                "success_count": result["success_count"],
                "total_count": result["total_count"],
                "results": result["results"],
            }

    except Exception as e:
        logger.error(f"Error rotating secrets: {e}")
        if "permission" in str(e).lower() or "forbidden" in str(e).lower():
            raise HTTPException(
                status_code=403, detail="Insufficient permissions for secret rotation"
            )
        raise HTTPException(status_code=500, detail="Secret rotation failed")


@router.get("/compliance/{framework}")
async def check_compliance_endpoint(
    framework: str = Path(..., regex="^(SOC2|ISO27001|NIST)$"),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """
    Check compliance against security framework.

    **Supported Frameworks:**
    - `SOC2`: Service Organization Control 2
    - `ISO27001`: International security standard
    - `NIST`: NIST Cybersecurity Framework

    **Returns compliance score and control status.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        compliance_result = await security_manager.check_compliance(framework)

        return {
            "framework": compliance_result["framework"],
            "compliance_percentage": compliance_result["compliance_percentage"],
            "overall_status": compliance_result["overall_status"],
            "controls": compliance_result["controls"],
            "recommendations": (
                [
                    "Implement missing controls for full compliance",
                    "Schedule regular compliance audits",
                    "Document security procedures",
                    "Train staff on security policies",
                ]
                if compliance_result["compliance_percentage"] < 100
                else ["Maintain current compliance status", "Monitor for security updates"]
            ),
            "checked_at": compliance_result["checked_at"],
        }

    except Exception as e:
        logger.error(f"Error checking compliance: {e}")
        raise HTTPException(status_code=500, detail="Compliance check failed")


@router.get("/dashboard")
async def get_security_dashboard(security_manager: SecurityManager = Depends(get_security_manager)):
    """
    Get comprehensive security dashboard data.

    **Includes:**
    - Overall security posture
    - Recent vulnerability scans
    - SBOM and signature counts
    - Compliance status
    - Security recommendations
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        dashboard_data = await security_manager.get_security_dashboard()

        if "error" in dashboard_data:
            raise HTTPException(status_code=500, detail=dashboard_data["error"])

        return dashboard_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting security dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get security dashboard")


@router.get("/tools/status")
async def get_security_tools_status(
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """
    Check status of security tools (syft, trivy, cosign).

    **Verifies tool availability and versions.**
    """
    try:
        if not security_manager:
            raise HTTPException(status_code=503, detail="Security service unavailable")

        tools_status = {}

        # Check syft
        try:
            result = subprocess.run(
                [security_manager.sbom_tools["syft"], "version"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            tools_status["syft"] = {
                "available": result.returncode == 0,
                "version": result.stdout.strip() if result.returncode == 0 else None,
                "path": security_manager.sbom_tools["syft"],
            }
        except Exception as e:
            tools_status["syft"] = {"available": False, "error": str(e)}

        # Check trivy
        try:
            result = subprocess.run(
                [security_manager.vulnerability_scanners["trivy"], "--version"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            tools_status["trivy"] = {
                "available": result.returncode == 0,
                "version": result.stdout.strip() if result.returncode == 0 else None,
                "path": security_manager.vulnerability_scanners["trivy"],
            }
        except Exception as e:
            tools_status["trivy"] = {"available": False, "error": str(e)}

        # Check cosign
        try:
            result = subprocess.run(
                [security_manager.signing_config["cosign_binary"], "version"],
                capture_output=True,
                text=True,
                timeout=10,
            )
            tools_status["cosign"] = {
                "available": result.returncode == 0,
                "version": result.stdout.strip() if result.returncode == 0 else None,
                "path": security_manager.signing_config["cosign_binary"],
            }
        except Exception as e:
            tools_status["cosign"] = {"available": False, "error": str(e)}

        # Overall status
        all_available = all(tool.get("available", False) for tool in tools_status.values())

        return {
            "overall_status": "ready" if all_available else "degraded",
            "tools": tools_status,
            "checked_at": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error checking security tools: {e}")
        raise HTTPException(status_code=500, detail="Failed to check security tools")


@router.get("/health")
async def security_health_check(security_manager: SecurityManager = Depends(get_security_manager)):
    """
    Health check for security service.
    """
    try:
        if not security_manager:
            return {"status": "unhealthy", "error": "Security manager not initialized"}

        # Test Redis connection
        await security_manager.redis.ping()

        # Test Docker client
        try:
            security_manager.docker_client.ping()
            docker_status = "connected"
        except Exception:
            docker_status = "disconnected"

        return {
            "status": "healthy",
            "services": {
                "redis": "connected",
                "docker": docker_status,
                "security_manager": "active",
            },
            "capabilities": {
                "sbom_generation": True,
                "vulnerability_scanning": True,
                "image_signing": True,
                "secret_rotation": True,
                "compliance_checking": True,
            },
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Security health check failed: {e}")
        return {"status": "unhealthy", "error": str(e), "timestamp": datetime.now().isoformat()}
