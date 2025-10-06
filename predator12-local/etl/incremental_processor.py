"""
Enhanced ETL Pipeline with:
- Incremental processing
- Data quality checks
- Error recovery
"""
from datetime import datetime
from typing import Dict, Any
import pandas as pd
from observability.metrics import REQUEST_COUNT

class IncrementalETL:
    """Smart ETL processor"""
    
    def __init__(self, last_run_path: str = "/tmp/last_etl_run"):
        self.last_run_path = last_run_path
        self.last_run_time = self._load_last_run()
    
    def _load_last_run(self) -> datetime:
        """Get last successful run time"""
        try:
            with open(self.last_run_path, 'r') as f:
                return datetime.fromisoformat(f.read().strip())
        except:
            return datetime.min  # First run
    
    async def process_incremental(self, extractor, transformer, loader):
        """Run incremental ETL pipeline"""
        try:
            # Extract new/changed data
            new_data = await extractor(self.last_run_time)
            
            # Transform with quality checks
            transformed = self._transform_with_quality(new_data)
            
            # Load
            await loader(transformed)
            
            # Update last run time
            self._update_last_run()
            
            REQUEST_COUNT.labels(status="success").inc()
            return True
            
        except Exception as e:
            REQUEST_COUNT.labels(status="error").inc()
            raise
    
    def _transform_with_quality(self, data: pd.DataFrame) -> pd.DataFrame:
        """Apply transformations and quality checks"""
        # Data cleaning
        data = data.dropna(subset=['required_field'])
        
        # Validation
        if (data['value'] < 0).any():
            raise ValueError("Negative values detected")
            
        # Standardization
        data['date'] = pd.to_datetime(data['date'])
        
        return data
    
    def _update_last_run(self):
        """Record successful run"""
        with open(self.last_run_path, 'w') as f:
            f.write(datetime.now().isoformat())
