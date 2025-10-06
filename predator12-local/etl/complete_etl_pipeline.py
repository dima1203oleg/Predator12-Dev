#!/usr/bin/env python3
"""
Complete ETL Pipeline for Predator Analytics Customs Data Processing
Integrates: CSV parsing, data validation, database loading, OpenSearch indexing
"""

import pandas as pd
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Generator
import psycopg2
from psycopg2.extras import execute_values
import json
import hashlib
import os
from dataclasses import dataclass
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class PipelineConfig:
    """Configuration for the ETL pipeline"""
    # Database connection
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "predator_analytics"
    db_user: str = "postgres"
    db_password: str = "postgres"
    
    # OpenSearch connection  
    opensearch_host: str = "localhost"
    opensearch_port: int = 9200
    
    # Processing settings
    chunk_size: int = 1000
    enable_pii_masking: bool = True
    data_quality_threshold: float = 0.7
    incremental_mode: bool = True  # Enable incremental processing
    
    # File paths
    input_dir: str = "/Users/dima/projects/Predator8.0/PredatorAnalytics/data"
    output_dir: str = "/Users/dima/projects/Predator8.0/etl/processed"
    log_dir: str = "/Users/dima/projects/Predator8.0/logs"

class CustomsETLPipeline:
    """Complete ETL pipeline for customs declaration data"""
    
    def __init__(self, config: PipelineConfig = None):
        self.config = config or PipelineConfig()
        self.setup_directories()
        self.processed_count = 0
        self.error_count = 0
        self.anomaly_count = 0
        
    def setup_directories(self):
        """Create necessary directories"""
        Path(self.config.output_dir).mkdir(parents=True, exist_ok=True)
        Path(self.config.log_dir).mkdir(parents=True, exist_ok=True)
    
    def get_processed_files_log(self) -> set:
        """Get set of already processed files"""
        log_file = Path(self.config.log_dir) / "processed_files.log"
        if log_file.exists():
            with open(log_file, 'r') as f:
                return set(line.strip() for line in f)
        return set()
    
    def mark_file_processed(self, file_path: str):
        """Mark file as processed"""
        log_file = Path(self.config.log_dir) / "processed_files.log"
        with open(log_file, 'a') as f:
            f.write(f"{file_path}\n")
    
    def get_new_files(self) -> List[Path]:
        """Get list of new files to process"""
        if not self.config.incremental_mode:
            return list(Path(self.config.input_dir).glob("*.csv"))
        
        processed = self.get_processed_files_log()
        all_files = list(Path(self.config.input_dir).glob("*.csv"))
        new_files = [f for f in all_files if str(f) not in processed]
        return new_files
    
    def hash_pii_field(self, value: str, salt: str = "predator_salt") -> str:
        """Hash PII fields for privacy protection"""
        if pd.isna(value) or value == '':
            return None
        return hashlib.sha256(f"{salt}_{value}".encode()).hexdigest()[:16]
    
    def normalize_numeric_field(self, value) -> float:
        """Normalize numeric fields (handle comma decimals)"""
        if pd.isna(value) or value == '' or value == '-':
            return None
        
        try:
            # Convert comma to dot for decimal separator
            str_value = str(value).replace(',', '.')
            return float(str_value)
        except:
            return None
    
    def parse_date(self, date_str: str) -> datetime:
        """Parse Ukrainian date format DD.MM.YY"""
        if pd.isna(date_str):
            return None
        
        try:
            return datetime.strptime(str(date_str).strip(), '%d.%m.%y')
        except:
            try:
                return datetime.strptime(str(date_str).strip(), '%d.%m.%Y')
            except:
                logger.warning(f"Could not parse date: {date_str}")
                return None
    
    def detect_anomalies(self, df: pd.DataFrame) -> pd.DataFrame:
        """Simple anomaly detection based on business rules"""
        df['is_anomaly'] = False
        df['anomaly_type'] = None
        
        # Rule 1: Net weight is 0 but invoice value > 0
        mask1 = (df['Маса, нетто, кг'] == 0) & (df['Фактурна варість, валюта контракту'] > 0)
        df.loc[mask1, 'is_anomaly'] = True
        df.loc[mask1, 'anomaly_type'] = 'zero_weight_with_value'
        
        # Rule 2: Unrealistic price per kg (too high or too low)
        price_per_kg = df['Фактурна варість, валюта контракту'] / df['Маса, нетто, кг'].replace(0, 1)
        mask2 = (price_per_kg > 10000) | (price_per_kg < 0.01)
        df.loc[mask2, 'is_anomaly'] = True
        df.loc[mask2, 'anomaly_type'] = 'unrealistic_price_per_kg'
        
        # Rule 3: Country mismatch (dispatch != origin and both specified)
        mask3 = (df['Країна відправлення'] != df['Країна походження']) & \
                (df['Країна відправлення'] != '00') & \
                (df['Країна походження'] != '00')
        df.loc[mask3, 'is_anomaly'] = True
        df.loc[mask3, 'anomaly_type'] = 'country_mismatch'
        
        self.anomaly_count = df['is_anomaly'].sum()
        logger.info(f"Detected {self.anomaly_count} anomalies")
        
        return df
    
    def transform_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transform and clean the dataframe"""
        logger.info(f"Transforming dataframe with {len(df)} rows")
        
        # Create working copy
        transformed_df = df.copy()
        
        # Parse dates
        transformed_df['declaration_date'] = transformed_df['Дата оформлення'].apply(self.parse_date)
        
        # Normalize numeric fields
        numeric_mapping = {
            'Кількість': 'quantity',
            'Маса, брутто, кг': 'gross_weight_kg', 
            'Маса, нетто, кг': 'net_weight_kg',
            'Фактурна варість, валюта контракту': 'invoice_value',
            'пільгова': 'preferential_rate',
            'повна': 'full_rate'
        }
        
        for col, new_col in numeric_mapping.items():
            if col in transformed_df.columns:
                transformed_df[new_col] = transformed_df[col].apply(self.normalize_numeric_field)
        
        # Clean text fields
        text_mapping = {
            'Номер митної декларації': 'declaration_number',
            'Тип декларації': 'declaration_type',
            'ЄДРПОУ одержувача': 'importer_edrpou', 
            'Одержувач': 'importer_name',
            'Код товару': 'hs_code',
            'Опис товару': 'goods_description',
            'Країна походження': 'country_origin',
            'Країна відправлення': 'country_dispatch',
            'Митниця оформлення': 'customs_office'
        }
        
        for col, new_col in text_mapping.items():
            if col in transformed_df.columns:
                transformed_df[new_col] = transformed_df[col].astype(str).str.strip()
        
        # Add line numbers
        transformed_df['line_number'] = transformed_df['№'].fillna(0).astype(int)
        
        # PII masking if enabled
        if self.config.enable_pii_masking:
            transformed_df['importer_edrpou_hash'] = transformed_df['importer_edrpou'].apply(self.hash_pii_field)
            transformed_df['importer_name_hash'] = transformed_df['importer_name'].apply(self.hash_pii_field)
            transformed_df['goods_description_hash'] = transformed_df['goods_description'].apply(self.hash_pii_field)
        
        # Detect anomalies
        transformed_df = self.detect_anomalies(transformed_df)
        
        # Add metadata
        transformed_df['processed_at'] = datetime.now()
        transformed_df['source_file'] = 'Лютий_csv_10.csv'
        
        return transformed_df
    
    def validate_data_quality(self, df: pd.DataFrame) -> Dict:
        """Basic data quality validation"""
        results = {
            'total_rows': len(df),
            'missing_critical_fields': 0,
            'invalid_dates': 0,
            'invalid_edrpou': 0,
            'invalid_hs_codes': 0,
            'data_quality_score': 1.0,
            'passed': True
        }
        
        # Check critical fields
        critical_fields = ['declaration_number', 'declaration_date', 'importer_edrpou', 'hs_code']
        for field in critical_fields:
            if field in df.columns:
                missing = df[field].isna().sum()
                results['missing_critical_fields'] += missing
        
        # Check date validity
        if 'declaration_date' in df.columns:
            results['invalid_dates'] = df['declaration_date'].isna().sum()
        
        # Check EDRPOU format (should be 8 digits)
        if 'importer_edrpou' in df.columns:
            edrpou_pattern = df['importer_edrpou'].str.match(r'^\d{8}$', na=False)
            results['invalid_edrpou'] = (~edrpou_pattern).sum()
        
        # Check HS code format (should be 10 digits)
        if 'hs_code' in df.columns:
            hs_pattern = df['hs_code'].str.match(r'^\d{10}$', na=False)
            results['invalid_hs_codes'] = (~hs_pattern).sum()
        
        # Calculate quality score
        total_issues = (results['missing_critical_fields'] + 
                       results['invalid_dates'] + 
                       results['invalid_edrpou'] + 
                       results['invalid_hs_codes'])
        
        if results['total_rows'] > 0:
            error_rate = total_issues / (results['total_rows'] * len(critical_fields))
            results['data_quality_score'] = max(0.0, 1.0 - error_rate)
        
        results['passed'] = results['data_quality_score'] >= self.config.data_quality_threshold
        
        logger.info(f"Data quality score: {results['data_quality_score']:.2%}")
        return results
    
    def save_to_parquet(self, df: pd.DataFrame, filename: str) -> str:
        """Save processed data to Parquet format"""
        output_path = Path(self.config.output_dir) / f"{filename}.parquet"
        df.to_parquet(output_path, compression='snappy', index=False)
        logger.info(f"Saved {len(df)} rows to {output_path}")
        return str(output_path)
    
    def process_csv_file(self, file_path: str) -> Dict:
        """Process a single CSV file through the complete pipeline"""
        start_time = time.time()
        results = {
            'file_path': file_path,
            'start_time': start_time,
            'success': False,
            'rows_processed': 0,
            'rows_with_anomalies': 0,
            'data_quality_score': 0.0,
            'processing_time_seconds': 0,
            'output_files': [],
            'errors': []
        }
        
        try:
            logger.info(f"Starting processing of {file_path}")
            
            # Step 1: Load CSV
            df = pd.read_csv(file_path, sep=';', encoding='utf-8-sig', low_memory=False)
            logger.info(f"Loaded {len(df)} rows from CSV")
            
            # Step 2: Transform data
            transformed_df = self.transform_dataframe(df)
            
            # Step 3: Validate data quality
            quality_results = self.validate_data_quality(transformed_df)
            results['data_quality_score'] = quality_results['data_quality_score']
            
            if not quality_results['passed']:
                error_msg = f"Data quality below threshold: {quality_results['data_quality_score']:.2%}"
                results['errors'].append(error_msg)
                logger.warning(error_msg)
                # Continue processing but flag the issue
            
            # Step 4: Save processed data
            filename = Path(file_path).stem + "_processed"
            parquet_path = self.save_to_parquet(transformed_df, filename)
            results['output_files'].append(parquet_path)
            
            # Step 5: Save quality report
            quality_report_path = Path(self.config.log_dir) / f"{filename}_quality_report.json"
            with open(quality_report_path, 'w', encoding='utf-8') as f:
                json.dump(quality_results, f, ensure_ascii=False, indent=2, default=str)
            results['output_files'].append(str(quality_report_path))
            
            # Update results
            results['success'] = True
            results['rows_processed'] = len(transformed_df)
            results['rows_with_anomalies'] = self.anomaly_count
            self.processed_count += len(transformed_df)
            
            logger.info(f"Successfully processed {len(transformed_df)} rows")
            
        except Exception as e:
            error_msg = f"Error processing {file_path}: {str(e)}"
            results['errors'].append(error_msg)
            logger.error(error_msg)
            self.error_count += 1
        
        finally:
            results['processing_time_seconds'] = time.time() - start_time
            
        return results
    
    def run_pipeline(self, input_files: List[str] = None) -> Dict:
        """Run the complete ETL pipeline"""
        pipeline_start = time.time()
        
        if input_files is None:
            # Auto-discover CSV files in input directory
            input_files = list(Path(self.config.input_dir).glob("*.csv"))
        
        logger.info(f"Starting ETL pipeline with {len(input_files)} files")
        
        pipeline_results = {
            'start_time': datetime.now(),
            'input_files': len(input_files),
            'files_processed': [],
            'total_rows_processed': 0,
            'total_anomalies': 0,
            'processing_time_seconds': 0,
            'success': True,
            'summary': {}
        }
        
        # Process each file
        for file_path in input_files:
            file_results = self.process_csv_file(str(file_path))
            pipeline_results['files_processed'].append(file_results)
            
            if file_results['success']:
                pipeline_results['total_rows_processed'] += file_results['rows_processed']
                pipeline_results['total_anomalies'] += file_results['rows_with_anomalies']
            else:
                pipeline_results['success'] = False
        
        # Calculate final metrics
        pipeline_results['processing_time_seconds'] = time.time() - pipeline_start
        pipeline_results['end_time'] = datetime.now()
        
        # Generate summary
        avg_quality_score = sum(f['data_quality_score'] for f in pipeline_results['files_processed']) / len(pipeline_results['files_processed']) if pipeline_results['files_processed'] else 0
        
        pipeline_results['summary'] = {
            'files_processed': len(pipeline_results['files_processed']),
            'success_rate': sum(1 for f in pipeline_results['files_processed'] if f['success']) / len(pipeline_results['files_processed']) if pipeline_results['files_processed'] else 0,
            'total_processing_time': pipeline_results['processing_time_seconds'],
            'avg_quality_score': avg_quality_score,
            'total_rows': pipeline_results['total_rows_processed'],
            'total_anomalies': pipeline_results['total_anomalies'],
            'anomaly_rate': pipeline_results['total_anomalies'] / pipeline_results['total_rows_processed'] if pipeline_results['total_rows_processed'] > 0 else 0
        }
        
        logger.info(f"Pipeline completed. Processed {pipeline_results['total_rows_processed']} rows in {pipeline_results['processing_time_seconds']:.2f} seconds")
        
        return pipeline_results

def main():
    """Run the ETL pipeline"""
    config = PipelineConfig()
    pipeline = CustomsETLPipeline(config)
    
    # Process the specific CSV file
    csv_file = "/Users/dima/projects/Predator8.0/PredatorAnalytics/data/Лютий_csv_10.csv"
    
    if os.path.exists(csv_file):
        results = pipeline.run_pipeline([csv_file])
        
        # Print summary
        print("\n" + "="*60)
        print("PREDATOR ANALYTICS ETL PIPELINE - RESULTS")
        print("="*60)
        print(f"📁 Files processed: {results['summary']['files_processed']}")
        print(f"📊 Total rows: {results['summary']['total_rows']:,}")
        print(f"🚨 Anomalies detected: {results['summary']['total_anomalies']:,} ({results['summary']['anomaly_rate']:.1%})")
        print(f"⭐ Average quality score: {results['summary']['avg_quality_score']:.1%}")
        print(f"⏱️ Processing time: {results['summary']['total_processing_time']:.2f} seconds")
        print(f"✅ Success rate: {results['summary']['success_rate']:.1%}")
        
        # Save pipeline results
        results_file = Path(config.log_dir) / f"pipeline_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"📝 Detailed results saved to: {results_file}")
        
    else:
        print(f"❌ File not found: {csv_file}")

if __name__ == "__main__":
    main()
