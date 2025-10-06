#!/usr/bin/env python3
"""
Скрипт для індексації даних з PostgreSQL до OpenSearch
Включає маскування PII та створення безпечних/обмежених індексів
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, Any
import hashlib
import os
from pathlib import Path

try:
    import asyncpg
except ImportError:
    asyncpg = None

try:
    from opensearchpy import AsyncOpenSearch
except ImportError:
    AsyncOpenSearch = None

try:
    import yaml
except ImportError:
    yaml = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PostgresToOpenSearchIndexer:
    """Індексатор даних з PostgreSQL до OpenSearch"""
    
    def __init__(self, config_path: str = None):
        self.config = self.load_config(config_path)
        self.pg_pool = None
        self.opensearch_client = None
        self.pii_pepper = os.getenv('PII_PEPPER', 'predator11_salt_2024')
        
    def load_config(self, config_path: str = None) -> Dict[str, Any]:
        """Завантажує конфігурацію"""
        if config_path and Path(config_path).exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        
        # Дефолтна конфігурація
        return {
            'postgres': {
                'host': os.getenv('POSTGRES_HOST', 'localhost'),
                'port': int(os.getenv('POSTGRES_PORT', 5432)),
                'database': os.getenv('POSTGRES_DB', 'predator11'),
                'user': os.getenv('POSTGRES_USER', 'postgres'),
                'password': os.getenv('POSTGRES_PASSWORD', 'postgres')
            },
            'opensearch': {
                'hosts': [os.getenv('OPENSEARCH_URL', 'http://localhost:9200')],
                'use_ssl': os.getenv('OPENSEARCH_SSL', 'false').lower() == 'true',
                'verify_certs': os.getenv('OPENSEARCH_VERIFY_CERTS', 'false').lower() == 'true'
            },
            'tables': {
                'stg_customs': {
                    'safe_index': 'customs_safe',
                    'restricted_index': 'customs_restricted',
                    'pii_fields': ['company_name', 'edrpou'],
                    'batch_size': 1000
                }
            },
            'mappings': {
                'customs_safe': {
                    'properties': {
                        'doc_id': {'type': 'keyword'},
                        'ts': {'type': 'date'},
                        'hs_code': {'type': 'keyword'},
                        'amount': {'type': 'double'},
                        'qty': {'type': 'double'},
                        'country': {'type': 'keyword'},
                        'company_mask': {'type': 'keyword'},
                        'edrpou_mask': {'type': 'keyword'},
                        'indexed_at': {'type': 'date'}
                    }
                },
                'customs_restricted': {
                    'properties': {
                        'doc_id': {'type': 'keyword'},
                        'ts': {'type': 'date'},
                        'hs_code': {'type': 'keyword'},
                        'amount': {'type': 'double'},
                        'qty': {'type': 'double'},
                        'country': {'type': 'keyword'},
                        'company_name': {'type': 'text'},
                        'edrpou': {'type': 'keyword'},
                        'indexed_at': {'type': 'date'}
                    }
                }
            }
        }

    async def initialize(self):
        """Ініціалізує з'єднання"""
        # Підключення до PostgreSQL
        self.pg_pool = await asyncpg.create_pool(
            host=self.config['postgres']['host'],
            port=self.config['postgres']['port'],
            database=self.config['postgres']['database'],
            user=self.config['postgres']['user'],
            password=self.config['postgres']['password'],
            min_size=2,
            max_size=10
        )
        
        # Підключення до OpenSearch
        self.opensearch_client = AsyncOpenSearch(
            hosts=self.config['opensearch']['hosts'],
            use_ssl=self.config['opensearch']['use_ssl'],
            verify_certs=self.config['opensearch']['verify_certs']
        )
        
        logger.info("Initialized connections to PostgreSQL and OpenSearch")

    def mask_pii(self, value: str, field_name: str) -> str:
        """Маскує PII дані"""
        if not value:
            return None
            
        # Використовуємо SHA1 з "сіллю" для створення консистентної маски
        combined = f"{value}_{field_name}_{self.pii_pepper}"
        hash_obj = hashlib.sha1(combined.encode('utf-8'))
        return hash_obj.hexdigest()[:8]

    async def create_indices_and_aliases(self):
        """Створює індекси та аліаси"""
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        
        for table_name, table_config in self.config['tables'].items():
            safe_index = f"{table_config['safe_index']}_{timestamp}"
            restricted_index = f"{table_config['restricted_index']}_{timestamp}"
            
            # Створюємо індекси
            for index_name, mapping_name in [
                (safe_index, table_config['safe_index']),
                (restricted_index, table_config['restricted_index'])
            ]:
                mapping = self.config['mappings'][mapping_name]
                
                await self.opensearch_client.indices.create(
                    index=index_name,
                    body={
                        'mappings': mapping,
                        'settings': {
                            'number_of_shards': 1,
                            'number_of_replicas': 0,
                            'refresh_interval': '30s'
                        }
                    }
                )
                
                logger.info(f"Created index: {index_name}")

            # Створюємо аліаси
            safe_alias = f"{table_config['safe_index']}_current"
            restricted_alias = f"{table_config['restricted_index']}_current"
            
            # Видаляємо старі аліаси якщо існують
            try:
                await self.opensearch_client.indices.delete_alias(
                    index="*", name=[safe_alias, restricted_alias]
                )
            except Exception:
                pass  # Аліаси можуть не існувати

            # Створюємо нові аліаси
            await self.opensearch_client.indices.put_alias(
                index=safe_index, name=safe_alias
            )
            await self.opensearch_client.indices.put_alias(
                index=restricted_index, name=restricted_alias
            )
            
            logger.info(f"Created aliases: {safe_alias}, {restricted_alias}")

    async def index_table_data(self, table_name: str):
        """Індексує дані з таблиці"""
        table_config = self.config['tables'][table_name]
        pii_fields = table_config.get('pii_fields', [])
        batch_size = table_config.get('batch_size', 1000)
        
        safe_alias = f"{table_config['safe_index']}_current"
        restricted_alias = f"{table_config['restricted_index']}_current"
        
        async with self.pg_pool.acquire() as conn:
            # Отримуємо загальну кількість записів
            total_rows = await conn.fetchval(f"SELECT COUNT(*) FROM {table_name}")
            logger.info(f"Total rows in {table_name}: {total_rows}")
            
            # Обробляємо батчами
            offset = 0
            processed = 0
            
            while offset < total_rows:
                # Отримуємо батч даних
                rows = await conn.fetch(
                    f"SELECT * FROM {table_name} ORDER BY doc_id LIMIT $1 OFFSET $2",
                    batch_size, offset
                )
                
                if not rows:
                    break
                
                # Підготовлюємо документи для індексації
                safe_docs = []
                restricted_docs = []
                
                for row in rows:
                    row_dict = dict(row)
                    row_dict['indexed_at'] = datetime.now(timezone.utc).isoformat()
                    
                    # Створюємо безпечний документ (з маскуванням PII)
                    safe_doc = row_dict.copy()
                    for field in pii_fields:
                        if field in safe_doc and safe_doc[field]:
                            masked_field = f"{field}_mask"
                            safe_doc[masked_field] = self.mask_pii(safe_doc[field], field)
                            del safe_doc[field]  # Видаляємо оригінальне поле
                    
                    safe_docs.append({
                        '_index': safe_alias,
                        '_id': row_dict['doc_id'],
                        '_source': safe_doc
                    })
                    
                    # Створюємо обмежений документ (з повними даними)
                    restricted_docs.append({
                        '_index': restricted_alias,
                        '_id': row_dict['doc_id'],
                        '_source': row_dict
                    })
                
                # Виконуємо bulk індексацію
                if safe_docs:
                    await self.opensearch_client.bulk(body=safe_docs)
                    await self.opensearch_client.bulk(body=restricted_docs)
                
                processed += len(rows)
                offset += batch_size
                
                logger.info(f"Processed {processed}/{total_rows} rows from {table_name}")
            
            logger.info(f"Completed indexing {table_name}: {processed} documents")

    async def cleanup_old_indices(self, keep_last: int = 3):
        """Очищає старі індекси, залишаючи останні N версій"""
        indices_info = await self.opensearch_client.indices.get(index="*")
        
        for table_name, table_config in self.config['tables'].items():
            for index_type in ['safe_index', 'restricted_index']:
                prefix = table_config[index_type]
                
                # Знаходимо всі індекси з цим префіксом
                matching_indices = []
                for index_name in indices_info:
                    if index_name.startswith(f"{prefix}_"):
                        matching_indices.append(index_name)
                
                # Сортуємо за датою створення (за назвою)
                matching_indices.sort(reverse=True)
                
                # Видаляємо старі індекси
                to_delete = matching_indices[keep_last:]
                for index_name in to_delete:
                    try:
                        await self.opensearch_client.indices.delete(index=index_name)
                        logger.info(f"Deleted old index: {index_name}")
                    except Exception as e:
                        logger.warning(f"Failed to delete index {index_name}: {e}")

    async def run_full_indexing(self):
        """Запускає повну індексацію"""
        try:
            await self.initialize()
            
            # Створюємо нові індекси та аліаси
            await self.create_indices_and_aliases()
            
            # Індексуємо дані з кожної таблиці
            for table_name in self.config['tables']:
                await self.index_table_data(table_name)
            
            # Очищуємо старі індекси
            await self.cleanup_old_indices()
            
            logger.info("Full indexing completed successfully")
            
        except Exception as e:
            logger.error(f"Indexing failed: {e}")
            raise
        finally:
            if self.pg_pool:
                await self.pg_pool.close()
            if self.opensearch_client:
                await self.opensearch_client.close()

async def main():
    """Головна функція"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Index PostgreSQL data to OpenSearch')
    parser.add_argument('--config', help='Configuration file path')
    parser.add_argument('--table', help='Specific table to index')
    parser.add_argument('--cleanup-only', action='store_true', 
                       help='Only cleanup old indices')
    
    args = parser.parse_args()
    
    indexer = PostgresToOpenSearchIndexer(args.config)
    
    if args.cleanup_only:
        await indexer.initialize()
        await indexer.cleanup_old_indices()
    else:
        await indexer.run_full_indexing()

if __name__ == "__main__":
    asyncio.run(main())
