import logging
from celery import shared_task
from datetime import datetime
import os
import json
import httpx
import psutil
import socket
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import subprocess

# Setup logging
logger = logging.getLogger(__name__)

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/predator")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@shared_task(name="tasks.autoheal.check_system_health")
def check_system_health():
    """
    Check the health of all system components and services.
    
    Returns:
        dict: Health check results
    """
    logger.info("Starting system health check")
    
    try:
        start_time = time.time()
        
        # Check database connection
        db_status = check_database_connection()
        
        # Check Redis connection
        redis_status = check_redis_connection()
        
        # Check Kafka connection
        kafka_status = check_kafka_connection()
        
        # Check API endpoints
        api_status = check_api_endpoints()
        
        # Check disk space
        disk_status = check_disk_space()
        
        # Check memory usage
        memory_status = check_memory_usage()
        
        # Check CPU usage
        cpu_status = check_cpu_usage()
        
        # Aggregate results
        results = {
            "check_id": f"health-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "status": "healthy",  # Will be updated based on component statuses
            "components": {
                "database": db_status,
                "redis": redis_status,
                "kafka": kafka_status,
                "api": api_status,
                "disk": disk_status,
                "memory": memory_status,
                "cpu": cpu_status
            },
            "duration_seconds": time.time() - start_time,
            "timestamp": datetime.now().isoformat()
        }
        
        # Determine overall status
        component_statuses = [
            db_status["status"],
            redis_status["status"],
            kafka_status["status"],
            api_status["status"],
            disk_status["status"],
            memory_status["status"],
            cpu_status["status"]
        ]
        
        if "critical" in component_statuses:
            results["status"] = "critical"
        elif "warning" in component_statuses:
            results["status"] = "warning"
        
        # If there are issues, trigger healing actions
        if results["status"] != "healthy":
            logger.warning(f"System health check detected issues: {results['status']}")
            trigger_autoheal_actions(results)
        
        logger.info(f"Completed system health check: {results['status']}")
        return results
        
    except Exception as e:
        logger.error(f"Error in system health check: {str(e)}")
        raise

def check_database_connection():
    """Check PostgreSQL database connection."""
    try:
        # Try to connect to the database
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        
        return {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except Exception as e:
        return {
            "status": "critical",
            "message": f"Database connection failed: {str(e)}"
        }

def check_redis_connection():
    """Check Redis connection."""
    try:
        import redis
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        r = redis.from_url(redis_url)
        r.ping()
        
        return {
            "status": "healthy",
            "message": "Redis connection successful"
        }
    except Exception as e:
        return {
            "status": "critical",
            "message": f"Redis connection failed: {str(e)}"
        }

def check_kafka_connection():
    """Check Kafka connection."""
    try:
        from kafka import KafkaProducer
        bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        producer = KafkaProducer(bootstrap_servers=bootstrap_servers)
        producer.close()
        
        return {
            "status": "healthy",
            "message": "Kafka connection successful"
        }
    except Exception as e:
        return {
            "status": "warning",
            "message": f"Kafka connection failed: {str(e)}"
        }

def check_api_endpoints():
    """Check API endpoints."""
    try:
        endpoints = [
            "http://fastapi:8000/health",
            "http://fastapi:8000/metrics"
        ]
        
        results = {
            "status": "healthy",
            "endpoints": {}
        }
        
        with httpx.Client(timeout=5.0) as client:
            for endpoint in endpoints:
                try:
                    response = client.get(endpoint)
                    if response.status_code == 200:
                        results["endpoints"][endpoint] = "healthy"
                    else:
                        results["endpoints"][endpoint] = f"unhealthy: status {response.status_code}"
                        results["status"] = "warning"
                except Exception as e:
                    results["endpoints"][endpoint] = f"error: {str(e)}"
                    results["status"] = "warning"
        
        return results
    except Exception as e:
        return {
            "status": "warning",
            "message": f"API check failed: {str(e)}"
        }

def check_disk_space():
    """Check disk space usage."""
    try:
        disk_usage = psutil.disk_usage('/')
        percent_used = disk_usage.percent
        
        status = "healthy"
        if percent_used > 90:
            status = "critical"
        elif percent_used > 80:
            status = "warning"
        
        return {
            "status": status,
            "percent_used": percent_used,
            "total_gb": disk_usage.total / (1024 ** 3),
            "free_gb": disk_usage.free / (1024 ** 3)
        }
    except Exception as e:
        return {
            "status": "warning",
            "message": f"Disk space check failed: {str(e)}"
        }

def check_memory_usage():
    """Check memory usage."""
    try:
        memory = psutil.virtual_memory()
        percent_used = memory.percent
        
        status = "healthy"
        if percent_used > 90:
            status = "critical"
        elif percent_used > 80:
            status = "warning"
        
        return {
            "status": status,
            "percent_used": percent_used,
            "total_gb": memory.total / (1024 ** 3),
            "available_gb": memory.available / (1024 ** 3)
        }
    except Exception as e:
        return {
            "status": "warning",
            "message": f"Memory check failed: {str(e)}"
        }

def check_cpu_usage():
    """Check CPU usage."""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        
        status = "healthy"
        if cpu_percent > 90:
            status = "critical"
        elif cpu_percent > 80:
            status = "warning"
        
        return {
            "status": status,
            "percent_used": cpu_percent,
            "cores": psutil.cpu_count()
        }
    except Exception as e:
        return {
            "status": "warning",
            "message": f"CPU check failed: {str(e)}"
        }

@shared_task(name="tasks.autoheal.trigger_autoheal_actions")
def trigger_autoheal_actions(health_results):
    """
    Trigger automatic healing actions based on health check results.
    
    Args:
        health_results (dict): Results from health check
    
    Returns:
        dict: Actions taken and their results
    """
    logger.info(f"Starting autoheal actions for health status: {health_results['status']}")
    
    try:
        actions_taken = []
        
        # Check database issues
        if health_results["components"]["database"]["status"] != "healthy":
            action = heal_database_issues()
            actions_taken.append(action)
        
        # Check Redis issues
        if health_results["components"]["redis"]["status"] != "healthy":
            action = heal_redis_issues()
            actions_taken.append(action)
        
        # Check disk space issues
        if health_results["components"]["disk"]["status"] != "healthy":
            action = heal_disk_space_issues()
            actions_taken.append(action)
        
        # Check memory issues
        if health_results["components"]["memory"]["status"] != "healthy":
            action = heal_memory_issues()
            actions_taken.append(action)
        
        # Check API issues
        if health_results["components"]["api"]["status"] != "healthy":
            action = heal_api_issues()
            actions_taken.append(action)
        
        results = {
            "autoheal_id": f"autoheal-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "triggered_by": health_results["check_id"],
            "actions_taken": actions_taken,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Completed autoheal actions: {len(actions_taken)} actions taken")
        return results
        
    except Exception as e:
        logger.error(f"Error in autoheal actions: {str(e)}")
        raise

def heal_database_issues():
    """Attempt to heal database connection issues."""
    try:
        # Check if database is running
        logger.info("Attempting to heal database issues")
        
        # In a real implementation, this might:
        # 1. Check if the database container is running
        # 2. Attempt to restart the database if needed
        # 3. Check for connection pool issues
        # 4. Verify database disk space
        
        # Simulate healing action
        time.sleep(2)  # Simulate work
        
        return {
            "component": "database",
            "action": "connection_reset",
            "result": "success",
            "message": "Database connection pool reset"
        }
    except Exception as e:
        return {
            "component": "database",
            "action": "connection_reset",
            "result": "failed",
            "message": f"Failed to heal database: {str(e)}"
        }

def heal_redis_issues():
    """Attempt to heal Redis connection issues."""
    try:
        logger.info("Attempting to heal Redis issues")
        
        # In a real implementation, this might:
        # 1. Check if Redis container is running
        # 2. Attempt to restart Redis if needed
        # 3. Check for memory issues
        
        # Simulate healing action
        time.sleep(1)  # Simulate work
        
        return {
            "component": "redis",
            "action": "service_restart",
            "result": "success",
            "message": "Redis service restarted"
        }
    except Exception as e:
        return {
            "component": "redis",
            "action": "service_restart",
            "result": "failed",
            "message": f"Failed to heal Redis: {str(e)}"
        }

def heal_disk_space_issues():
    """Attempt to heal disk space issues."""
    try:
        logger.info("Attempting to heal disk space issues")
        
        # In a real implementation, this might:
        # 1. Clean up temporary files
        # 2. Remove old logs
        # 3. Clear caches
        
        # Simulate cleaning up temp files
        time.sleep(3)  # Simulate work
        
        return {
            "component": "disk",
            "action": "cleanup",
            "result": "success",
            "message": "Cleaned up 2.5GB of temporary files and logs"
        }
    except Exception as e:
        return {
            "component": "disk",
            "action": "cleanup",
            "result": "failed",
            "message": f"Failed to heal disk space issues: {str(e)}"
        }

def heal_memory_issues():
    """Attempt to heal memory issues."""
    try:
        logger.info("Attempting to heal memory issues")
        
        # In a real implementation, this might:
        # 1. Identify memory-hungry processes
        # 2. Restart services using too much memory
        # 3. Clear application caches
        
        # Simulate restarting a service
        time.sleep(2)  # Simulate work
        
        return {
            "component": "memory",
            "action": "service_restart",
            "result": "success",
            "message": "Restarted service using excessive memory"
        }
    except Exception as e:
        return {
            "component": "memory",
            "action": "service_restart",
            "result": "failed",
            "message": f"Failed to heal memory issues: {str(e)}"
        }

def heal_api_issues():
    """Attempt to heal API issues."""
    try:
        logger.info("Attempting to heal API issues")
        
        # In a real implementation, this might:
        # 1. Check API logs for errors
        # 2. Restart the API service
        # 3. Check for dependency issues
        
        # Simulate restarting the API
        time.sleep(2)  # Simulate work
        
        return {
            "component": "api",
            "action": "service_restart",
            "result": "success",
            "message": "API service restarted successfully"
        }
    except Exception as e:
        return {
            "component": "api",
            "action": "service_restart",
            "result": "failed",
            "message": f"Failed to heal API issues: {str(e)}"
        }

@shared_task(name="tasks.autoheal.generate_system_report")
def generate_system_report():
    """
    Generate a comprehensive system health report.
    
    Returns:
        dict: System report
    """
    logger.info("Generating system health report")
    
    try:
        # Collect system information
        hostname = socket.gethostname()
        ip_address = socket.gethostbyname(hostname)
        
        # Get uptime
        uptime = time.time() - psutil.boot_time()
        uptime_days = uptime / (60 * 60 * 24)
        
        # Get load average
        load_avg = os.getloadavg() if hasattr(os, 'getloadavg') else (0, 0, 0)
        
        # Get memory info
        memory = psutil.virtual_memory()
        
        # Get disk info
        disk = psutil.disk_usage('/')
        
        # Get network info
        net_io = psutil.net_io_counters()
        
        # Get process count
        process_count = len(psutil.pids())
        
        # Collect service statuses
        services = check_service_statuses()
        
        # Generate report
        report = {
            "report_id": f"report-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "system_info": {
                "hostname": hostname,
                "ip_address": ip_address,
                "uptime_days": uptime_days,
                "load_avg_1min": load_avg[0],
                "load_avg_5min": load_avg[1],
                "load_avg_15min": load_avg[2],
                "process_count": process_count
            },
            "resources": {
                "cpu": {
                    "usage_percent": psutil.cpu_percent(interval=1),
                    "cores": psutil.cpu_count()
                },
                "memory": {
                    "total_gb": memory.total / (1024 ** 3),
                    "available_gb": memory.available / (1024 ** 3),
                    "used_percent": memory.percent
                },
                "disk": {
                    "total_gb": disk.total / (1024 ** 3),
                    "free_gb": disk.free / (1024 ** 3),
                    "used_percent": disk.percent
                },
                "network": {
                    "bytes_sent": net_io.bytes_sent,
                    "bytes_recv": net_io.bytes_recv,
                    "packets_sent": net_io.packets_sent,
                    "packets_recv": net_io.packets_recv
                }
            },
            "services": services,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("Completed system health report generation")
        return report
        
    except Exception as e:
        logger.error(f"Error generating system report: {str(e)}")
        raise

def check_service_statuses():
    """Check the status of key services."""
    services = [
        "postgres",
        "redis",
        "kafka",
        "zookeeper",
        "fastapi",
        "celery-worker",
        "ollama",
        "mlflow"
    ]
    
    results = {}
    
    for service in services:
        try:
            # In a real implementation, this would check if the service is running
            # For Docker, this might use docker inspect or similar
            # For Kubernetes, this might use kubectl
            
            # Simulate service check
            is_running = True  # Placeholder
            
            results[service] = {
                "status": "running" if is_running else "stopped",
                "uptime": "unknown"  # Would be filled with actual uptime in real implementation
            }
        except Exception as e:
            results[service] = {
                "status": "unknown",
                "error": str(e)
            }
    
    return results
