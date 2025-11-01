import os
import logging
import asyncio  # Added for sleep in demo

# Use aiohttp for async HTTP requests
import aiohttp

# Conditional import for kubernetes_asyncio
try:
    from kubernetes_asyncio import client as k8s_client, config as k8s_config
    KUBERNETES_ASYNCIO_AVAILABLE = True
except ImportError:
    KUBERNETES_ASYNCIO_AVAILABLE = False
    k8s_client = None  # Placeholder
    k8s_config = None  # Placeholder


async def restart_agent(agent_id, namespace=None):  # Changed to async def
    """Remediation: restart agent pod via Kubernetes API (async)."""
    if not KUBERNETES_ASYNCIO_AVAILABLE:
        logging.error(
            "kubernetes_asyncio library is not available. "
            "Cannot restart agent."
        )
        return

    try:
        # Load kube config (in-cluster or local)
        if os.getenv('KUBERNETES_SERVICE_HOST'):
            await k8s_config.load_incluster_config()  # Changed to await
        else:
            await k8s_config.load_kube_config()  # Changed to await

        # Use specific API clients as in auto_recovery_agent.py
        # For pod deletion, CoreV1Api is correct.
        # Ensure client is properly managed
        async with k8s_client.ApiClient() as api_client:
            v1 = k8s_client.CoreV1Api(api_client)
            # Find pod by label (assume label: agent_id)
            label_selector = f"agent_id={agent_id}"
            ns = namespace or os.getenv('AGENT_NAMESPACE', 'default')
            # Changed to await
            pods = await v1.list_namespaced_pod(
                namespace=ns, label_selector=label_selector
            )
            if not pods.items:
                logging.warning(
                    f"No pod found for agent {agent_id} in namespace {ns}"
                )
                return
            for pod in pods.items:
                pod_name = pod.metadata.name
                # Changed to await
                await v1.delete_namespaced_pod(name=pod_name, namespace=ns)
                logging.info(
                    f"Restarted pod {pod_name} for agent {agent_id} "
                    f"in namespace {ns}"
                )
    except Exception as e:
        logging.error(f"Error restarting pod for agent {agent_id}: {e}")


async def notify_alertmanager(agent_id, metric):  # Changed to async def
    """Send alert to Alertmanager or external system (async)."""
    alertmanager_url = os.getenv('ALERTMANAGER_URL')
    if not alertmanager_url:
        logging.warning("No ALERTMANAGER_URL set, skipping alert.")
        return
    alert = {
        "labels": {
            "alertname": "MASAnomaly",
            "agent": agent_id,
            "metric": metric
        },
        "annotations": {
            "summary": f"Anomaly detected for {agent_id} on {metric}"
        }
    }
    try:
        async with aiohttp.ClientSession() as session:  # Use aiohttp
            # Changed to async with
            async with session.post(
                f"{alertmanager_url}/api/v1/alerts", json=[alert]
            ) as response:
                # Raise an exception for HTTP errors
                response.raise_for_status()
                logging.info(
                    f"Alert sent for agent {agent_id} on {metric}. "
                    f"Status: {response.status}"
                )
    # More specific exception for aiohttp
    except aiohttp.ClientError as e:
        logging.error(f"Error sending alert via aiohttp: {e}")
    except Exception as e:
        logging.error(f"Generic error sending alert: {e}")


async def remediate(agent_id, metric):  # Changed to async def
    await restart_agent(agent_id)  # Changed to await
    await notify_alertmanager(agent_id, metric)  # Changed to await


async def main_demo():  # Renamed and made async for the demo loop
    # Example loop for demonstration
    # (in production, triggered by anomaly detector)
    while True:
        # This is a stub: in production, subscribe to anomaly events or
        # poll Prometheus
        # For demo, remediate agent-1 on cpu every 5 min
        logging.info("Running demo remediation cycle...")
        await remediate('agent-1', 'cpu')  # Changed to await
        await asyncio.sleep(300)  # Changed to asyncio.sleep


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)  # Basic logging for demo
    # Example loop for demonstration
    # (in production, triggered by anomaly detector)
    # To run the demo:
    asyncio.run(main_demo())  # Use asyncio.run for the demo
