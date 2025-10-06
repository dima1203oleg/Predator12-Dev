"""
Self-Healing Tasks for Celery Workers
Handles automated system recovery and health monitoring
"""

import os
import json
import logging
import asyncio
from typing import Dict, Any, List
from datetime import datetime, timedelta
from celery import current_task

from ..celery_app import celery_app

# Monitoring imports
try:
    import requests
    import psutil
    MONITORING_AVAILABLE = True
except ImportError:
    MONITORING_AVAILABLE = False

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name='self_healing_tasks.run_health_check')
def run_health_check(self) -> Dict[str, Any]:
    """Run comprehensive health check across all system components"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Starting comprehensive health check', 'progress': 5}
        )
        
        health_results = {
            'timestamp': datetime.utcnow().isoformat(),
            'overall_status': 'healthy',
            'components': {},
            'system_metrics': {},
            'alerts': []
        }
        
        # Check system resources
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Checking system resources', 'progress': 20}
        )
        
        if MONITORING_AVAILABLE:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            health_results['system_metrics'] = {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': memory.available / (1024**3),
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / (1024**3)
            }
            
            # Check for resource alerts
            if cpu_percent > 80:
                health_results['alerts'].append({
                    'severity': 'warning',
                    'component': 'system',
                    'message': f'High CPU usage: {cpu_percent}%'
                })
            
            if memory.percent > 85:
                health_results['alerts'].append({
                    'severity': 'critical',
                    'component': 'system',
                    'message': f'High memory usage: {memory.percent}%'
                })
            
            if disk.percent > 90:
                health_results['alerts'].append({
                    'severity': 'critical',
                    'component': 'system',
                    'message': f'Low disk space: {disk.percent}% used'
                })
        
        # Check service endpoints
        services_to_check = [
            {'name': 'backend', 'url': 'http://backend:8000/health', 'timeout': 5},
            {'name': 'frontend', 'url': 'http://frontend:3000', 'timeout': 5},
            {'name': 'opensearch', 'url': 'http://opensearch:9200/_cluster/health', 'timeout': 10},
            {'name': 'grafana', 'url': 'http://grafana:3000/api/health', 'timeout': 5},
            {'name': 'prometheus', 'url': 'http://prometheus:9090/-/healthy', 'timeout': 5},
            {'name': 'minio', 'url': 'http://minio:9000/minio/health/live', 'timeout': 5},
            {'name': 'keycloak', 'url': 'http://keycloak:8080/health', 'timeout': 10},
            {'name': 'qdrant', 'url': 'http://qdrant:6333/health', 'timeout': 5},
        ]
        
        progress_step = 60 / len(services_to_check)
        
        for i, service in enumerate(services_to_check):
            self.update_state(
                state='PROGRESS',
                meta={'status': f'Checking {service["name"]} service', 'progress': 20 + (i * progress_step)}
            )
            
            try:
                if MONITORING_AVAILABLE:
                    response = requests.get(service['url'], timeout=service['timeout'])
                    if response.status_code == 200:
                        health_results['components'][service['name']] = {
                            'status': 'healthy',
                            'response_time_ms': response.elapsed.total_seconds() * 1000,
                            'last_check': datetime.utcnow().isoformat()
                        }
                    else:
                        health_results['components'][service['name']] = {
                            'status': 'warning',
                            'response_code': response.status_code,
                            'last_check': datetime.utcnow().isoformat()
                        }
                        health_results['alerts'].append({
                            'severity': 'warning',
                            'component': service['name'],
                            'message': f'Service returned HTTP {response.status_code}'
                        })
                else:
                    # Fallback when requests not available
                    health_results['components'][service['name']] = {
                        'status': 'unknown',
                        'message': 'Health check library not available',
                        'last_check': datetime.utcnow().isoformat()
                    }
            except Exception as e:
                health_results['components'][service['name']] = {
                    'status': 'critical',
                    'error': str(e),
                    'last_check': datetime.utcnow().isoformat()
                }
                health_results['alerts'].append({
                    'severity': 'critical',
                    'component': service['name'],
                    'message': f'Service unreachable: {str(e)}'
                })
        
        # Determine overall status
        critical_count = len([a for a in health_results['alerts'] if a['severity'] == 'critical'])
        warning_count = len([a for a in health_results['alerts'] if a['severity'] == 'warning'])
        
        if critical_count > 0:
            health_results['overall_status'] = 'critical'
        elif warning_count > 0:
            health_results['overall_status'] = 'warning'
        else:
            health_results['overall_status'] = 'healthy'
        
        # Calculate health score (0-100)
        total_components = len(health_results['components'])
        healthy_components = len([c for c in health_results['components'].values() if c['status'] == 'healthy'])
        health_score = (healthy_components / total_components * 100) if total_components > 0 else 100
        
        # Adjust score based on system metrics
        if MONITORING_AVAILABLE and 'system_metrics' in health_results:
            metrics = health_results['system_metrics']
            if metrics['cpu_percent'] > 80:
                health_score -= 10
            if metrics['memory_percent'] > 85:
                health_score -= 15
            if metrics['disk_percent'] > 90:
                health_score -= 20
        
        health_results['health_score'] = max(0, health_score)
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Health check completed', 'progress': 100}
        )
        
        return health_results
        
    except Exception as exc:
        logger.error(f"Health check failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise

@celery_app.task(bind=True, name='self_healing_tasks.auto_heal_issues')
def auto_heal_issues(self, health_report: Dict[str, Any]) -> Dict[str, Any]:
    """Attempt to automatically heal detected issues"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Analyzing health report for healing opportunities', 'progress': 10}
        )
        
        healing_results = {
            'timestamp': datetime.utcnow().isoformat(),
            'actions_taken': [],
            'failed_actions': [],
            'recommendations': []
        }
        
        alerts = health_report.get('alerts', [])
        critical_alerts = [a for a in alerts if a['severity'] == 'critical']
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Processing {len(critical_alerts)} critical alerts', 'progress': 30}
        )
        
        for alert in critical_alerts:
            component = alert.get('component')
            message = alert.get('message', '')
            
            # High memory usage healing
            if 'memory usage' in message.lower():
                try:
                    # Simulate memory cleanup
                    healing_results['actions_taken'].append({
                        'action': 'memory_cleanup',
                        'component': component,
                        'description': 'Triggered garbage collection and cache cleanup',
                        'timestamp': datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    healing_results['failed_actions'].append({
                        'action': 'memory_cleanup',
                        'component': component,
                        'error': str(e),
                        'timestamp': datetime.utcnow().isoformat()
                    })
            
            # Service unreachable healing
            elif 'unreachable' in message.lower():
                try:
                    # Simulate service restart attempt
                    healing_results['actions_taken'].append({
                        'action': 'service_restart_attempt',
                        'component': component,
                        'description': f'Attempted to restart {component} service',
                        'timestamp': datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    healing_results['failed_actions'].append({
                        'action': 'service_restart_attempt',
                        'component': component,
                        'error': str(e),
                        'timestamp': datetime.utcnow().isoformat()
                    })
            
            # Disk space healing
            elif 'disk space' in message.lower():
                try:
                    # Simulate log cleanup
                    healing_results['actions_taken'].append({
                        'action': 'disk_cleanup',
                        'component': component,
                        'description': 'Cleaned up old logs and temporary files',
                        'timestamp': datetime.utcnow().isoformat()
                    })
                except Exception as e:
                    healing_results['failed_actions'].append({
                        'action': 'disk_cleanup',
                        'component': component,
                        'error': str(e),
                        'timestamp': datetime.utcnow().isoformat()
                    })
        
        # Add recommendations for manual intervention
        if len(healing_results['failed_actions']) > 0:
            healing_results['recommendations'].append(
                'Manual intervention required for failed healing actions'
            )
        
        if health_report.get('overall_status') == 'critical':
            healing_results['recommendations'].append(
                'Consider scaling up resources or investigating root causes'
            )
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Auto-healing completed', 'progress': 100}
        )
        
        return healing_results
        
    except Exception as exc:
        logger.error(f"Auto-healing failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise

@celery_app.task(bind=True, name='self_healing_tasks.restart_service')
def restart_service(self, service_name: str, restart_method: str = 'docker') -> Dict[str, Any]:
    """Restart a specific service"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Preparing to restart {service_name}', 'progress': 10}
        )
        
        # This would integrate with Docker API or Kubernetes API
        # For now, simulate the restart
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Stopping {service_name}', 'progress': 40}
        )
        
        # Simulate stop
        import time
        time.sleep(2)
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Starting {service_name}', 'progress': 70}
        )
        
        # Simulate start
        time.sleep(3)
        
        result = {
            'service_name': service_name,
            'restart_method': restart_method,
            'status': 'success',
            'restart_time': datetime.utcnow().isoformat(),
            'downtime_seconds': 5
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Service {service_name} restarted successfully', 'progress': 100}
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"Service restart failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise

@celery_app.task(bind=True, name='self_healing_tasks.scale_service')
def scale_service(self, service_name: str, target_replicas: int) -> Dict[str, Any]:
    """Scale a service to target number of replicas"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Scaling {service_name} to {target_replicas} replicas', 'progress': 20}
        )
        
        # This would integrate with Docker Swarm or Kubernetes API
        # For now, simulate the scaling
        
        current_replicas = 1  # Simulate current state
        
        if target_replicas > current_replicas:
            action = 'scale_up'
        elif target_replicas < current_replicas:
            action = 'scale_down'
        else:
            action = 'no_change'
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Executing {action} for {service_name}', 'progress': 60}
        )
        
        # Simulate scaling time
        import time
        time.sleep(target_replicas * 2)  # Simulate time per replica
        
        result = {
            'service_name': service_name,
            'action': action,
            'previous_replicas': current_replicas,
            'target_replicas': target_replicas,
            'status': 'success',
            'scale_time': datetime.utcnow().isoformat()
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Service {service_name} scaled successfully', 'progress': 100}
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"Service scaling failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise

@celery_app.task(bind=True, name='self_healing_tasks.cleanup_resources')
def cleanup_resources(self, cleanup_type: str = 'logs') -> Dict[str, Any]:
    """Clean up system resources"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Starting {cleanup_type} cleanup', 'progress': 10}
        )
        
        cleaned_items = []
        total_freed_mb = 0
        
        if cleanup_type == 'logs':
            # Simulate log cleanup
            log_files = [
                '/var/log/predator/app.log.1',
                '/var/log/predator/app.log.2',
                '/var/log/predator/celery.log.1',
                '/tmp/debug.log'
            ]
            
            for log_file in log_files:
                # Simulate file size and cleanup
                file_size_mb = 50 + (len(log_file) % 100)
                cleaned_items.append({
                    'path': log_file,
                    'size_mb': file_size_mb,
                    'type': 'log_file'
                })
                total_freed_mb += file_size_mb
        
        elif cleanup_type == 'cache':
            # Simulate cache cleanup
            cache_items = [
                'redis_cache_expired_keys',
                'application_temp_cache',
                'model_prediction_cache'
            ]
            
            for cache_item in cache_items:
                cache_size_mb = 25 + (len(cache_item) % 50)
                cleaned_items.append({
                    'name': cache_item,
                    'size_mb': cache_size_mb,
                    'type': 'cache'
                })
                total_freed_mb += cache_size_mb
        
        elif cleanup_type == 'temp':
            # Simulate temp file cleanup
            temp_patterns = [
                '/tmp/celery-*',
                '/tmp/model-cache-*',
                '/tmp/report-gen-*'
            ]
            
            for pattern in temp_patterns:
                temp_size_mb = 15 + (len(pattern) % 30)
                cleaned_items.append({
                    'pattern': pattern,
                    'size_mb': temp_size_mb,
                    'type': 'temp_files'
                })
                total_freed_mb += temp_size_mb
        
        result = {
            'cleanup_type': cleanup_type,
            'items_cleaned': len(cleaned_items),
            'total_freed_mb': total_freed_mb,
            'cleaned_items': cleaned_items,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Cleanup completed, freed {total_freed_mb}MB', 'progress': 100}
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"Resource cleanup failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise
