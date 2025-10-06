"""
Data Quality Metrics for ETL Monitoring
"""
from prometheus_client import Counter, Gauge, Histogram
from typing import Dict, Any

# Metrics
DQ_RECORDS_PROCESSED = Counter(
    'dq_records_processed_total',
    'Total records processed',
    ['source', 'status']
)

DQ_VALIDATION_ERRORS = Counter(
    'dq_validation_errors_total',
    'Data validation failures',
    ['type', 'severity']
)

DQ_FIELD_COMPLETENESS = Gauge(
    'dq_field_completeness_ratio',
    'Field completeness percentage',
    ['field']
)

DQ_PROCESSING_TIME = Histogram(
    'dq_processing_time_seconds',
    'ETL processing time distribution',
    ['stage'],
    buckets=(0.1, 0.5, 1, 5, 10, 30)
)

class DataQualityTracker:
    """Track and report data quality metrics"""
    
    def __init__(self, source: str):
        self.source = source
    
    def record_processed(self, count: int, status: str = 'success'):
        """Count processed records"""
        DQ_RECORDS_PROCESSED.labels(
            source=self.source,
            status=status
        ).inc(count)
    
    def record_validation_error(self, error_type: str, severity: str = 'warning'):
        """Log validation issues"""
        DQ_VALIDATION_ERRORS.labels(
            type=error_type,
            severity=severity
        ).inc()
    
    def measure_completeness(self, field: str, present: int, total: int):
        """Track field completeness"""
        DQ_FIELD_COMPLETENESS.labels(
            field=field
        ).set(present / total)
    
    def time_stage(self, stage: str):
        """Context manager for timing stages"""
        return DQ_PROCESSING_TIME.labels(stage=stage).time()
