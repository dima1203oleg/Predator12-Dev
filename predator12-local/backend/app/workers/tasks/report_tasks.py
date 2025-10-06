"""
Report Generation Tasks for Celery Workers
Handles export and report generation using MinIO storage
"""

import os
import io
import json
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta
import pandas as pd
from celery import current_task

from ..celery_app import celery_app

# MinIO/S3 imports
try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

# Report generation imports
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    REPORT_LIBS_AVAILABLE = True
except ImportError:
    REPORT_LIBS_AVAILABLE = False

logger = logging.getLogger(__name__)

def get_minio_client():
    """Initialize MinIO/S3 client"""
    if not BOTO3_AVAILABLE:
        raise ImportError("boto3 not available for MinIO operations")
    
    return boto3.client(
        's3',
        endpoint_url=os.getenv('MINIO_URL', 'http://minio:9000'),
        aws_access_key_id=os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
        aws_secret_access_key=os.getenv('MINIO_SECRET_KEY', 'minioadmin'),
        region_name='us-east-1'
    )

@celery_app.task(bind=True, name='report_tasks.generate_csv_report')
def generate_csv_report(self, report_config: Dict[str, Any]) -> Dict[str, Any]:
    """Generate CSV report and upload to MinIO"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Initializing CSV report generation', 'progress': 10}
        )
        
        # Extract configuration
        report_type = report_config.get('type', 'data_export')
        dataset_id = report_config.get('dataset_id')
        filters = report_config.get('filters', {})
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Fetching data from database', 'progress': 30}
        )
        
        # Simulate data fetching and processing
        # In real implementation, this would query the database
        sample_data = {
            'id': range(1, 1001),
            'timestamp': [datetime.utcnow() - timedelta(hours=i) for i in range(1000)],
            'value': [i * 0.1 + (i % 10) for i in range(1000)],
            'category': [f'Category_{i % 5}' for i in range(1000)],
            'status': ['active' if i % 3 == 0 else 'inactive' for i in range(1000)]
        }
        
        df = pd.DataFrame(sample_data)
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Generating CSV file', 'progress': 60}
        )
        
        # Generate CSV
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_content = csv_buffer.getvalue()
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Uploading to MinIO', 'progress': 80}
        )
        
        # Upload to MinIO
        s3_client = get_minio_client()
        bucket_name = os.getenv('MINIO_REPORTS_BUCKET', 'reports')
        
        # Ensure bucket exists
        try:
            s3_client.head_bucket(Bucket=bucket_name)
        except ClientError:
            s3_client.create_bucket(Bucket=bucket_name)
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"{report_type}_{dataset_id}_{timestamp}.csv"
        
        # Upload file
        s3_client.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=csv_content.encode('utf-8'),
            ContentType='text/csv'
        )
        
        # Generate presigned URL (valid for 1 hour)
        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': filename},
            ExpiresIn=3600
        )
        
        result = {
            'report_type': report_type,
            'format': 'csv',
            'filename': filename,
            'download_url': download_url,
            'file_size': len(csv_content.encode('utf-8')),
            'records_count': len(df),
            'expires_at': (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'CSV report generated successfully', 'progress': 100}
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"CSV report generation failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise

@celery_app.task(bind=True, name='report_tasks.generate_pdf_report')
def generate_pdf_report(self, report_config: Dict[str, Any]) -> Dict[str, Any]:
    """Generate PDF report with charts and upload to MinIO"""
    try:
        if not REPORT_LIBS_AVAILABLE:
            raise ImportError("Report generation libraries not available")
            
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Initializing PDF report generation', 'progress': 10}
        )
        
        report_type = report_config.get('type', 'analytics_report')
        title = report_config.get('title', 'Predator11 Analytics Report')
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Generating charts and visualizations', 'progress': 40}
        )
        
        # Create sample chart
        plt.figure(figsize=(10, 6))
        x = range(1, 11)
        y = [i * 2 + (i % 3) for i in x]
        plt.plot(x, y, marker='o')
        plt.title('Sample Analytics Chart')
        plt.xlabel('Time Period')
        plt.ylabel('Value')
        plt.grid(True)
        
        # Save chart to buffer
        chart_buffer = io.BytesIO()
        plt.savefig(chart_buffer, format='png', dpi=300, bbox_inches='tight')
        chart_buffer.seek(0)
        plt.close()
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Creating PDF document', 'progress': 70}
        )
        
        # Create PDF
        pdf_buffer = io.BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=letter)
        width, height = letter
        
        # Add title
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, height - 100, title)
        
        # Add timestamp
        c.setFont("Helvetica", 10)
        c.drawString(100, height - 120, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        
        # Add some sample content
        c.setFont("Helvetica", 12)
        y_position = height - 160
        content_lines = [
            "Executive Summary:",
            "• Data processing completed successfully",
            "• 1,000 records analyzed",
            "• No critical issues detected",
            "• Performance metrics within acceptable ranges",
            "",
            "Key Findings:",
            "• Average response time: 245ms",
            "• Success rate: 99.2%",
            "• Data quality score: 8.7/10",
        ]
        
        for line in content_lines:
            c.drawString(100, y_position, line)
            y_position -= 20
        
        c.save()
        pdf_content = pdf_buffer.getvalue()
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Uploading PDF to MinIO', 'progress': 90}
        )
        
        # Upload to MinIO
        s3_client = get_minio_client()
        bucket_name = os.getenv('MINIO_REPORTS_BUCKET', 'reports')
        
        # Ensure bucket exists
        try:
            s3_client.head_bucket(Bucket=bucket_name)
        except ClientError:
            s3_client.create_bucket(Bucket=bucket_name)
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"{report_type}_{timestamp}.pdf"
        
        # Upload file
        s3_client.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=pdf_content,
            ContentType='application/pdf'
        )
        
        # Generate presigned URL (valid for 1 hour)
        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': filename},
            ExpiresIn=3600
        )
        
        result = {
            'report_type': report_type,
            'format': 'pdf',
            'filename': filename,
            'download_url': download_url,
            'file_size': len(pdf_content),
            'expires_at': (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'PDF report generated successfully', 'progress': 100}
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"PDF report generation failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise

@celery_app.task(bind=True, name='report_tasks.cleanup_old_reports')
def cleanup_old_reports(self, max_age_hours: int = 24) -> Dict[str, Any]:
    """Clean up old reports from MinIO storage"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Starting cleanup of old reports', 'progress': 10}
        )
        
        s3_client = get_minio_client()
        bucket_name = os.getenv('MINIO_REPORTS_BUCKET', 'reports')
        
        # List all objects in the bucket
        try:
            response = s3_client.list_objects_v2(Bucket=bucket_name)
        except ClientError:
            # Bucket doesn't exist
            return {
                'status': 'completed',
                'deleted_count': 0,
                'message': 'Reports bucket does not exist',
                'timestamp': datetime.utcnow().isoformat()
            }
        
        if 'Contents' not in response:
            return {
                'status': 'completed',
                'deleted_count': 0,
                'message': 'No reports found in bucket',
                'timestamp': datetime.utcnow().isoformat()
            }
        
        cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
        deleted_count = 0
        
        objects_to_delete = []
        for obj in response['Contents']:
            if obj['LastModified'].replace(tzinfo=None) < cutoff_time:
                objects_to_delete.append({'Key': obj['Key']})
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Deleting {len(objects_to_delete)} old reports', 'progress': 50}
        )
        
        # Delete objects in batches
        if objects_to_delete:
            s3_client.delete_objects(
                Bucket=bucket_name,
                Delete={'Objects': objects_to_delete}
            )
            deleted_count = len(objects_to_delete)
        
        result = {
            'status': 'completed',
            'deleted_count': deleted_count,
            'max_age_hours': max_age_hours,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'status': f'Cleanup completed, deleted {deleted_count} reports', 'progress': 100}
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"Report cleanup failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise

@celery_app.task(bind=True, name='report_tasks.generate_dashboard_export')
def generate_dashboard_export(self, dashboard_config: Dict[str, Any]) -> Dict[str, Any]:
    """Export dashboard as image or PDF"""
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Initializing dashboard export', 'progress': 10}
        )
        
        dashboard_id = dashboard_config.get('dashboard_id')
        export_format = dashboard_config.get('format', 'png')
        
        # This would integrate with Grafana API to export dashboards
        # For now, simulate the export
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Capturing dashboard screenshot', 'progress': 50}
        )
        
        # Simulate dashboard export
        if export_format == 'png':
            # Create a simple placeholder image
            plt.figure(figsize=(16, 10))
            plt.text(0.5, 0.5, f'Dashboard Export\n{dashboard_id}\n{datetime.utcnow()}', 
                    ha='center', va='center', fontsize=20)
            plt.axis('off')
            
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
            img_buffer.seek(0)
            content = img_buffer.getvalue()
            plt.close()
            
            content_type = 'image/png'
            file_extension = 'png'
        else:
            # For other formats, return error for now
            raise ValueError(f"Export format {export_format} not supported")
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Uploading dashboard export', 'progress': 80}
        )
        
        # Upload to MinIO
        s3_client = get_minio_client()
        bucket_name = os.getenv('MINIO_REPORTS_BUCKET', 'reports')
        
        # Ensure bucket exists
        try:
            s3_client.head_bucket(Bucket=bucket_name)
        except ClientError:
            s3_client.create_bucket(Bucket=bucket_name)
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"dashboard_{dashboard_id}_{timestamp}.{file_extension}"
        
        # Upload file
        s3_client.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=content,
            ContentType=content_type
        )
        
        # Generate presigned URL (valid for 1 hour)
        download_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': filename},
            ExpiresIn=3600
        )
        
        result = {
            'dashboard_id': dashboard_id,
            'format': export_format,
            'filename': filename,
            'download_url': download_url,
            'file_size': len(content),
            'expires_at': (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Dashboard export completed', 'progress': 100}
        )
        
        return result
        
    except Exception as exc:
        logger.error(f"Dashboard export failed: {exc}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(exc)}
        )
        raise
