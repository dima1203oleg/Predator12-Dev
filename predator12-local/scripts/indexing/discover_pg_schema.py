#!/usr/bin/env python3
"""
Скрипт для автоматичного виявлення схеми PostgreSQL
Аналізує структуру таблиць та генерує конфігурацію для індексації
"""

import asyncio
import logging
from typing import Dict, Any, List
import os
import json
from datetime import datetime
from pathlib import Path

try:
    import asyncpg
except ImportError:
    asyncpg = None

try:
    import yaml
except ImportError:
    yaml = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PostgreSQLSchemaDiscovery:
    """Клас для виявлення схеми PostgreSQL"""
    
    def __init__(self):
        self.connection_params = {
            'host': os.getenv('POSTGRES_HOST', 'localhost'),
            'port': int(os.getenv('POSTGRES_PORT', 5432)),
            'database': os.getenv('POSTGRES_DB', 'predator11'),
            'user': os.getenv('POSTGRES_USER', 'postgres'),
            'password': os.getenv('POSTGRES_PASSWORD', 'postgres')
        }
        
        # Поля, які можуть містити PII
        self.potential_pii_fields = {
            'company_name', 'company', 'name', 'full_name', 'first_name', 'last_name',
            'edrpou', 'inn', 'tax_id', 'passport', 'phone', 'email', 'address',
            'street', 'city', 'postal_code', 'zip_code', 'credit_card', 'ssn'
        }
        
        # Мапінг типів PostgreSQL до OpenSearch
        self.type_mapping = {
            'integer': 'integer',
            'bigint': 'long',
            'smallint': 'short',
            'numeric': 'double',
            'decimal': 'double',
            'real': 'float',
            'double precision': 'double',
            'money': 'double',
            'text': 'text',
            'character varying': 'text',
            'character': 'keyword',
            'varchar': 'text',
            'char': 'keyword',
            'boolean': 'boolean',
            'date': 'date',
            'timestamp': 'date',
            'timestamp with time zone': 'date',
            'timestamp without time zone': 'date',
            'time': 'date',
            'json': 'object',
            'jsonb': 'object',
            'uuid': 'keyword',
            'inet': 'ip',
            'cidr': 'ip'
        }

    async def connect(self):
        """Створює з'єднання з PostgreSQL"""
        if not asyncpg:
            raise ImportError("asyncpg is not installed. Run: pip install asyncpg")
            
        return await asyncpg.connect(**self.connection_params)

    async def get_all_tables(self, conn) -> List[Dict[str, Any]]:
        """Отримує список всіх таблиць"""
        query = """
        SELECT 
            schemaname,
            tablename,
            tableowner
        FROM pg_tables 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        ORDER BY schemaname, tablename;
        """
        
        rows = await conn.fetch(query)
        return [dict(row) for row in rows]

    async def get_table_structure(self, conn, 
                                schema: str, table: str) -> Dict[str, Any]:
        """Отримує структуру таблиці"""
        
        # Отримуємо інформацію про колонки
        columns_query = """
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position;
        """
        
        columns = await conn.fetch(columns_query, schema, table)
        
        # Отримуємо інформацію про індекси
        indexes_query = """
        SELECT 
            i.relname AS index_name,
            a.attname AS column_name,
            ix.indisunique AS is_unique,
            ix.indisprimary AS is_primary
        FROM pg_class t
        JOIN pg_index ix ON t.oid = ix.indrelid
        JOIN pg_class i ON i.oid = ix.indexrelid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
        WHERE t.relname = $1 AND t.relnamespace = (
            SELECT oid FROM pg_namespace WHERE nspname = $2
        )
        ORDER BY i.relname, a.attnum;
        """
        
        indexes = await conn.fetch(indexes_query, table, schema)
        
        # Отримуємо кількість записів
        count_query = f'SELECT COUNT(*) FROM "{schema}"."{table}"'
        try:
            row_count = await conn.fetchval(count_query)
        except Exception:
            row_count = 0
        
        return {
            'schema': schema,
            'table': table,
            'columns': [dict(col) for col in columns],
            'indexes': [dict(idx) for idx in indexes],
            'row_count': row_count
        }

    def detect_pii_fields(self, columns: List[Dict[str, Any]]) -> List[str]:
        """Виявляє поля, які можуть містити PII"""
        pii_fields = []
        
        for col in columns:
            col_name = col['column_name'].lower()
            
            # Перевіряємо точні збіги
            if col_name in self.potential_pii_fields:
                pii_fields.append(col['column_name'])
                continue
            
            # Перевіряємо часткові збіги
            for pii_pattern in self.potential_pii_fields:
                if pii_pattern in col_name:
                    pii_fields.append(col['column_name'])
                    break
                    
        return pii_fields

    def generate_opensearch_mapping(self, columns: List[Dict[str, Any]], 
                                  include_pii: bool = True) -> Dict[str, Any]:
        """Генерує мапінг для OpenSearch"""
        properties = {}
        
        for col in columns:
            col_name = col['column_name']
            data_type = col['data_type'].lower()
            
            # Пропускаємо PII поля для безпечного індексу
            if not include_pii and col_name.lower() in [f.lower() for f in self.detect_pii_fields(columns)]:
                # Додаємо маскований варіант
                masked_name = f"{col_name}_mask"
                properties[masked_name] = {'type': 'keyword'}
                continue
            
            # Визначаємо тип OpenSearch
            if data_type in self.type_mapping:
                os_type = self.type_mapping[data_type]
            else:
                # За замовчуванням текст для невідомих типів
                os_type = 'text'
            
            # Додаємо спеціальні налаштування для text полів
            if os_type == 'text':
                properties[col_name] = {
                    'type': 'text',
                    'fields': {
                        'keyword': {
                            'type': 'keyword',
                            'ignore_above': 256
                        }
                    }
                }
            else:
                properties[col_name] = {'type': os_type}
        
        # Додаємо службові поля
        properties['indexed_at'] = {'type': 'date'}
        
        return {
            'properties': properties
        }

    def generate_indexing_config(self, table_info: Dict[str, Any]) -> Dict[str, Any]:
        """Генерує конфігурацію для індексації таблиці"""
        schema = table_info['schema']
        table = table_info['table']
        columns = table_info['columns']
        
        pii_fields = self.detect_pii_fields(columns)
        
        # Визначаємо розмір батчу на основі кількості записів
        row_count = table_info['row_count']
        if row_count > 1000000:
            batch_size = 5000
        elif row_count > 100000:
            batch_size = 2000
        else:
            batch_size = 1000
        
        table_name = f"{schema}_{table}" if schema != 'public' else table
        
        return {
            'safe_index': f"{table_name}_safe",
            'restricted_index': f"{table_name}_restricted",
            'pii_fields': pii_fields,
            'batch_size': batch_size,
            'source_table': f'"{schema}"."{table}"',
            'row_count': row_count
        }

    async def discover_all_schemas(self) -> Dict[str, Any]:
        """Виявляє схеми всіх таблиць"""
        conn = await self.connect()
        
        try:
            tables = await self.get_all_tables(conn)
            logger.info(f"Found {len(tables)} tables")
            
            discovery_result = {
                'discovered_at': datetime.now().isoformat(),
                'connection_info': {
                    'host': self.connection_params['host'],
                    'port': self.connection_params['port'],
                    'database': self.connection_params['database']
                },
                'tables': {},
                'mappings': {},
                'indexing_config': {
                    'postgres': self.connection_params.copy(),
                    'tables': {}
                }
            }
            
            # Видаляємо пароль з результату
            discovery_result['indexing_config']['postgres']['password'] = '${POSTGRES_PASSWORD}'
            
            for table_info in tables:
                schema = table_info['schemaname']
                table = table_info['tablename']
                
                logger.info(f"Analyzing table: {schema}.{table}")
                
                try:
                    structure = await self.get_table_structure(conn, schema, table)
                    
                    table_key = f"{schema}_{table}" if schema != 'public' else table
                    
                    # Зберігаємо структуру таблиці
                    discovery_result['tables'][table_key] = structure
                    
                    # Генерируем маппинги
                    discovery_result['mappings'][f"{table_key}_safe"] = \
                        self.generate_opensearch_mapping(structure['columns'], include_pii=False)
                    
                    discovery_result['mappings'][f"{table_key}_restricted"] = \
                        self.generate_opensearch_mapping(structure['columns'], include_pii=True)
                    
                    # Генеруєм конфігурацію індексації
                    discovery_result['indexing_config']['tables'][structure['source_table']] = \
                        self.generate_indexing_config(structure)
                        
                except Exception as e:
                    logger.error(f"Failed to analyze table {schema}.{table}: {e}")
            
            return discovery_result
            
        finally:
            await conn.close()

    async def save_discovery_results(self, results: Dict[str, Any], 
                                   output_dir: str = "opensearch"):
        """Зберігає результати виявлення"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Зберігаємо повний звіт
        full_report_path = output_path / "schema_discovery_report.json"
        with open(full_report_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        
        logger.info(f"Saved full report to: {full_report_path}")
        
        # Зберігаємо конфігурацію індексації
        if yaml:
            indexing_config_path = output_path / "indexing_config.yaml"
            with open(indexing_config_path, 'w', encoding='utf-8') as f:
                yaml.dump(results['indexing_config'], f, 
                         default_flow_style=False, allow_unicode=True)
            
            logger.info(f"Saved indexing config to: {indexing_config_path}")
        
        # Зберігаємо маппінги окремо
        mappings_dir = output_path / "mappings"
        mappings_dir.mkdir(exist_ok=True)
        
        for mapping_name, mapping in results['mappings'].items():
            mapping_path = mappings_dir / f"{mapping_name}.json"
            with open(mapping_path, 'w', encoding='utf-8') as f:
                json.dump(mapping, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(results['mappings'])} mappings to: {mappings_dir}")

async def main():
    """Головна функція"""
    import argparse

    
    parser = argparse.ArgumentParser(description='Discover PostgreSQL schema')
    parser.add_argument('--output-dir', default='opensearch',
                       help='Output directory for results')
    parser.add_argument('--table', help='Analyze specific table only')
    
    args = parser.parse_args()
    
    discovery = PostgreSQLSchemaDiscovery()
    
    logger.info("Starting PostgreSQL schema discovery...")
    results = await discovery.discover_all_schemas()
    
    # Виводимо підсумкову статистику
    logger.info("Discovery completed!")
    logger.info(f"Found {len(results['tables'])} tables")
    logger.info(f"Generated {len(results['mappings'])} mappings")
    
    # Виводимо інформацію про PII поля
    total_pii_fields = 0
    for table_config in results['indexing_config']['tables'].values():
        total_pii_fields += len(table_config.get('pii_fields', []))
    
    logger.info(f"Detected {total_pii_fields} potential PII fields across all tables")
    
    # Зберігаємо результати
    await discovery.save_discovery_results(results, args.output_dir)
    
    logger.info("Schema discovery completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
