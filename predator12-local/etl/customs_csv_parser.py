#!/usr/bin/env python3
"""
Production-ready CSV parser for Ukrainian customs declarations
Handles: semicolon delimiters, comma decimals, chunking, data validation
"""

import pandas as pd
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Generator
import re
from datetime import datetime
from dataclasses import dataclass
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Optional imports with fallbacks
try:
    import polars as pl
    HAS_POLARS = True
except ImportError:
    HAS_POLARS = False
    logger.warning("Polars not available, using pandas only")

try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False
    logger.warning("NumPy not available, using pandas built-in functions")

@dataclass
class ParseConfig:
    """Configuration for CSV parsing"""
    chunk_size: int = 200_000
    sep: str = ';'
    encoding: str = 'utf-8-sig'
    decimal_comma: bool = True
    detect_dialect: bool = True
    max_errors_per_chunk: int = 100

class CustomsCSVParser:
    """High-performance parser for Ukrainian customs CSV files"""
    
    def __init__(self, config: ParseConfig = None):
        self.config = config or ParseConfig()
        self.column_mapping = self._get_column_mapping()
        self.numeric_columns = self._get_numeric_columns()
        
    def _get_column_mapping(self) -> Dict[str, str]:
        """Map Ukrainian column names to English database field names"""
        return {
            'Митниця оформлення': 'customs_office',
            'Тип декларації': 'declaration_type', 
            'Номер митної декларації': 'declaration_number',
            'Дата оформлення': 'declaration_date',
            'Відправник': 'exporter',
            'ЄДРПОУ одержувача': 'importer_edrpou',
            'Одержувач': 'importer_name',
            '№': 'line_number',
            'Код товару': 'hs_code',
            'Опис товару': 'goods_description',
            'Торгуюча країна': 'trading_country',
            'Країна відправлення': 'country_dispatch',
            'Країна походження': 'country_origin',
            'Умови поставки': 'incoterms',
            'Місце поставки': 'delivery_place',
            'Кількість': 'quantity',
            'Одиниця виміру': 'unit_code',
            'Маса, брутто, кг': 'gross_weight_kg',
            'Маса, нетто, кг': 'net_weight_kg',
            'Вага по митній декларації': 'customs_weight',
            'Фактурна варість, валюта контракту': 'invoice_value',
            'Особ.перем.': 'special_procedure',
            'Розрахункова фактурна вартість, дол. США / кг': 'calculated_invoice_value_usd_kg',
            'Вага.один.': 'weight_single',
            'Вага різн.': 'weight_diff',
            'Контракт': 'contract_type',
            'Торг.марк.': 'trademark',
            'Розрахункова митна вартість, нетто дол. США / кг': 'customs_value_net_usd_kg',
            'Розрахункова митна вартість, дол. США / дод. од.': 'customs_value_usd_additional_unit',
            'Розрахункова митна вартість,брутто дол. США / кг': 'customs_value_gross_usd_kg',
            'Мін.База Дол/кг.': 'min_base_usd_kg',
            'Різн.мін.база': 'min_base_diff',
            'КЗ Нетто Дол/кг.': 'net_customs_value_usd_kg',
            'Різн.КЗ Дол/кг': 'customs_value_diff_usd_kg',
            'пільгова': 'preferential_rate',
            'повна': 'full_rate'
        }
        
    def _get_numeric_columns(self) -> List[str]:
        """Columns that should be converted to numeric types"""
        return [
            'line_number', 'quantity', 'gross_weight_kg', 'net_weight_kg', 
            'customs_weight', 'invoice_value', 'calculated_invoice_value_usd_kg',
            'weight_single', 'weight_diff', 'customs_value_net_usd_kg',
            'customs_value_usd_additional_unit', 'customs_value_gross_usd_kg',
            'min_base_usd_kg', 'min_base_diff', 'net_customs_value_usd_kg',
            'customs_value_diff_usd_kg', 'preferential_rate', 'full_rate'
        ]
    
    def _normalize_decimal_separator(self, value: str) -> str:
        """Convert comma decimal separator to dot"""
        if pd.isna(value) or value == '' or value == '-':
            return None
        
        # Handle special cases
        value = str(value).strip()
        if value in ['-', '', '0', '0,00', '0.00']:
            return '0'
            
        # Replace comma with dot for decimal separator
        if ',' in value and '.' not in value:
            value = value.replace(',', '.')
        
        return value
    
    def _clean_numeric_column(self, series: pd.Series) -> pd.Series:
        """Clean and convert numeric column"""
        # Apply decimal normalization
        cleaned = series.astype(str).apply(self._normalize_decimal_separator)
        
        # Convert to numeric, setting errors to NaN
        return pd.to_numeric(cleaned, errors='coerce')
    
    def _validate_hs_code(self, hs_code: str) -> str:
        """Validate and normalize HS code"""
        if pd.isna(hs_code):
            return None
            
        # Remove non-digits
        hs_clean = re.sub(r'\D', '', str(hs_code))
        
        # Pad to 10 digits if needed
        if len(hs_clean) < 10:
            hs_clean = hs_clean.ljust(10, '0')
        
        return hs_clean[:10] if len(hs_clean) >= 10 else None
    
    def _normalize_country_code(self, country: str) -> str:
        """Normalize country codes"""
        if pd.isna(country) or country == '00' or country == '':
            return 'UNKNOWN'
        return str(country).strip().upper()
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date in DD.MM.YY format"""
        if pd.isna(date_str):
            return None
            
        try:
            # Handle DD.MM.YY format
            return datetime.strptime(str(date_str).strip(), '%d.%m.%y')
        except:
            try:
                # Try DD.MM.YYYY format
                return datetime.strptime(str(date_str).strip(), '%d.%m.%Y')
            except:
                logger.warning(f"Could not parse date: {date_str}")
                return None
    
    def _clean_text_field(self, text: str) -> str:
        """Clean text fields (remove extra quotes, normalize spaces)"""
        if pd.isna(text):
            return None
            
        text = str(text).strip()
        
        # Handle double quotes in quotes
        if text.startswith('"') and text.endswith('"'):
            text = text[1:-1]
            
        # Replace double double-quotes with single double-quotes
        text = text.replace('""', '"')
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def process_chunk(self, chunk_df: pd.DataFrame) -> pd.DataFrame:
        """Process a single chunk of data"""
        logger.info(f"Processing chunk with {len(chunk_df)} rows")
        
        # Rename columns
        chunk_df = chunk_df.rename(columns=self.column_mapping)
        
        # Clean numeric columns
        for col in self.numeric_columns:
            if col in chunk_df.columns:
                chunk_df[col] = self._clean_numeric_column(chunk_df[col])
        
        # Process specific columns
        if 'declaration_date' in chunk_df.columns:
            chunk_df['declaration_date'] = chunk_df['declaration_date'].apply(self._parse_date)
        
        if 'hs_code' in chunk_df.columns:
            chunk_df['hs_code'] = chunk_df['hs_code'].apply(self._validate_hs_code)
        
        if 'country_origin' in chunk_df.columns:
            chunk_df['country_origin'] = chunk_df['country_origin'].apply(self._normalize_country_code)
            
        if 'country_dispatch' in chunk_df.columns:
            chunk_df['country_dispatch'] = chunk_df['country_dispatch'].apply(self._normalize_country_code)
        
        # Clean text fields
        text_fields = ['goods_description', 'exporter', 'importer_name', 'trademark']
        for field in text_fields:
            if field in chunk_df.columns:
                chunk_df[field] = chunk_df[field].apply(self._clean_text_field)
        
        # Add processing metadata
        chunk_df['processed_at'] = datetime.now()
        chunk_df['source_file'] = getattr(self, 'current_file', 'unknown')
        
        return chunk_df
    
    def parse_file(self, file_path: str) -> Generator[pd.DataFrame, None, None]:
        """Parse CSV file in chunks"""
        self.current_file = Path(file_path).name
        logger.info(f"Starting to parse {file_path}")
        
        try:
            # Use polars for better performance if file is large
            file_size = Path(file_path).stat().st_size
            
            if file_size > 100_000_000:  # 100MB
                logger.info("Large file detected, using Polars")
                yield from self._parse_with_polars(file_path)
            else:
                logger.info("Using Pandas for parsing")
                yield from self._parse_with_pandas(file_path)
                
        except Exception as e:
            logger.error(f"Error parsing file {file_path}: {e}")
            raise
    
    def _parse_with_pandas(self, file_path: str) -> Generator[pd.DataFrame, None, None]:
        """Parse with pandas in chunks"""
        chunk_iter = pd.read_csv(
            file_path,
            sep=self.config.sep,
            encoding=self.config.encoding,
            chunksize=self.config.chunk_size,
            low_memory=False,
            na_values=['', '-', 'NULL', 'null', 'nan'],
            keep_default_na=True
        )
        
        for chunk_num, chunk_df in enumerate(chunk_iter):
            logger.info(f"Processing chunk {chunk_num + 1}")
            processed_chunk = self.process_chunk(chunk_df)
            yield processed_chunk
    
    def _parse_with_polars(self, file_path: str) -> Generator[pd.DataFrame, None, None]:
        """Parse with polars for large files"""
        # Read in batches using polars
        batch_size = self.config.chunk_size
        
        df = pl.read_csv(
            file_path,
            separator=self.config.sep,
            encoding=self.config.encoding,
            null_values=['', '-', 'NULL', 'null', 'nan']
        )
        
        total_rows = len(df)
        
        for i in range(0, total_rows, batch_size):
            end_idx = min(i + batch_size, total_rows)
            chunk_pl = df.slice(i, end_idx - i)
            
            # Convert to pandas for processing
            chunk_df = chunk_pl.to_pandas()
            
            logger.info(f"Processing rows {i} to {end_idx}")
            processed_chunk = self.process_chunk(chunk_df)
            yield processed_chunk

def main():
    """Test the parser with the customs file"""
    parser = CustomsCSVParser()
    file_path = "/Users/dima/projects/Predator8.0/PredatorAnalytics/data/Лютий_csv_10.csv"
    
    total_rows = 0
    errors = []
    
    try:
        for chunk_num, chunk in enumerate(parser.parse_file(file_path)):
            total_rows += len(chunk)
            logger.info(f"Chunk {chunk_num + 1}: {len(chunk)} rows processed")
            
            # Show sample of first chunk
            if chunk_num == 0:
                print("\nFirst 3 rows of processed data:")
                print(chunk.head(3).to_string())
                
                print(f"\nColumn data types:")
                print(chunk.dtypes)
                
                print(f"\nBasic statistics:")
                numeric_cols = chunk.select_dtypes(include=[np.number]).columns
                if len(numeric_cols) > 0:
                    print(chunk[numeric_cols].describe())
    
    except Exception as e:
        logger.error(f"Parsing failed: {e}")
        errors.append(str(e))
    
    logger.info(f"Total rows processed: {total_rows}")
    if errors:
        logger.error(f"Errors encountered: {errors}")

if __name__ == "__main__":
    main()
