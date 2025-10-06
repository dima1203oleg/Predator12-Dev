#!/usr/bin/env python3
"""
Data import and indexing script for Predator Analytics
Imports sample data and creates indexes in PostgreSQL, OpenSearch, and Qdrant
"""
import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import Dict, List

import asyncpg
import numpy as np
from opensearchpy import OpenSearch
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataImporter:
    def __init__(self):
        self.pg_conn = None
        self.opensearch_client = None
        self.qdrant_client = None
        
    async def connect_databases(self):
        """Connect to all databases"""
        try:
            # PostgreSQL connection
            self.pg_conn = await asyncpg.connect(
                host=os.getenv('POSTGRES_HOST', 'localhost'),
                port=os.getenv('POSTGRES_PORT', 5432),
                user=os.getenv('POSTGRES_USER', 'predator_user'),
                password=os.getenv('POSTGRES_PASSWORD', 'predator_pass123'),
                database=os.getenv('POSTGRES_DB', 'predator_nexus')
            )
            logger.info("Connected to PostgreSQL")
            
            # OpenSearch connection
            self.opensearch_client = OpenSearch([
                {
                    'host': os.getenv('OPENSEARCH_HOST', 'localhost'),
                    'port': os.getenv('OPENSEARCH_PORT', 9200)
                }
            ])
            logger.info("Connected to OpenSearch")
            
            # Qdrant connection
            self.qdrant_client = QdrantClient(
                host=os.getenv('QDRANT_HOST', 'localhost'),
                port=os.getenv('QDRANT_PORT', 6333)
            )
            logger.info("Connected to Qdrant")
            
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise

    async def create_postgresql_schema(self):
        """Create PostgreSQL tables and indexes"""
        schema_sql = """
        -- Companies table
        CREATE TABLE IF NOT EXISTS companies (
            id SERIAL PRIMARY KEY,
            edrpou VARCHAR(10) UNIQUE NOT NULL,
            name VARCHAR(500) NOT NULL,
            legal_form VARCHAR(100),
            status VARCHAR(50),
            registration_date DATE,
            address TEXT,
            activity_code VARCHAR(10),
            activity_description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Financial reports table
        CREATE TABLE IF NOT EXISTS financial_reports (
            id SERIAL PRIMARY KEY,
            company_id INTEGER REFERENCES companies(id),
            report_year INTEGER NOT NULL,
            report_type VARCHAR(50),
            revenue DECIMAL(15,2),
            profit DECIMAL(15,2),
            assets DECIMAL(15,2),
            liabilities DECIMAL(15,2),
            employees_count INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Analytics results table
        CREATE TABLE IF NOT EXISTS analytics_results (
            id SERIAL PRIMARY KEY,
            company_id INTEGER REFERENCES companies(id),
            analysis_type VARCHAR(100) NOT NULL,
            result_data JSONB,
            confidence_score DECIMAL(3,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            agent_id VARCHAR(100)
        );
        
        -- Anomalies table
        CREATE TABLE IF NOT EXISTS anomalies (
            id SERIAL PRIMARY KEY,
            company_id INTEGER REFERENCES companies(id),
            anomaly_type VARCHAR(100) NOT NULL,
            severity VARCHAR(20) DEFAULT 'medium',
            description TEXT,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved BOOLEAN DEFAULT FALSE,
            metadata JSONB
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_companies_edrpou ON companies(edrpou);
        CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING GIN(to_tsvector('english', name));
        CREATE INDEX IF NOT EXISTS idx_financial_reports_company_year ON financial_reports(company_id, report_year);
        CREATE INDEX IF NOT EXISTS idx_analytics_results_company_type ON analytics_results(company_id, analysis_type);
        CREATE INDEX IF NOT EXISTS idx_anomalies_company_type ON anomalies(company_id, anomaly_type);
        CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity);
        """
        
        await self.pg_conn.execute(schema_sql)
        logger.info("PostgreSQL schema created")

    def generate_sample_data(self, num_companies: int = 1000) -> Dict[str, List[Dict]]:
        """Generate sample data for testing"""
        logger.info(f"Generating {num_companies} sample companies")
        
        companies = []
        financial_reports = []
        anomalies = []
        
        # Generate companies
        for i in range(num_companies):
            company = {
                'edrpou': f"{12345000 + i:08d}",
                'name': f"Test Company {i+1} LLC",
                'legal_form': np.random.choice(['LLC', 'JSC', 'PE', 'NGO']),
                'status': np.random.choice(['active', 'suspended', 'liquidated'], p=[0.8, 0.15, 0.05]),
                'registration_date': datetime.now() - timedelta(days=np.random.randint(30, 3650)),
                'address': f"Test Address {i+1}, Test City, Ukraine",
                'activity_code': f"{np.random.randint(10, 99)}.{np.random.randint(10, 99)}",
                'activity_description': f"Sample business activity description {i+1}"
            }
            companies.append(company)
            
            # Generate financial reports (2-5 years per company)
            years_count = np.random.randint(2, 6)
            for year in range(2024 - years_count, 2024):
                revenue = np.random.exponential(1000000)  # Exponential distribution
                profit = revenue * np.random.normal(0.1, 0.05)  # 10% profit margin +/- 5%
                assets = revenue * np.random.normal(1.5, 0.3)
                
                financial_reports.append({
                    'company_id': i + 1,
                    'report_year': year,
                    'report_type': 'annual',
                    'revenue': round(revenue, 2),
                    'profit': round(profit, 2),
                    'assets': round(assets, 2),
                    'liabilities': round(assets * np.random.uniform(0.3, 0.7), 2),
                    'employees_count': max(1, int(np.random.poisson(20)))
                })
            
            # Generate some anomalies (10% of companies)
            if np.random.random() < 0.1:
                anomalies.append({
                    'company_id': i + 1,
                    'anomaly_type': np.random.choice(['financial_irregularity', 'unusual_activity', 'data_inconsistency']),
                    'severity': np.random.choice(['low', 'medium', 'high'], p=[0.5, 0.3, 0.2]),
                    'description': f"Detected anomaly in company {company['name']}",
                    'detected_at': datetime.now() - timedelta(days=np.random.randint(1, 30)),
                    'resolved': np.random.choice([True, False], p=[0.7, 0.3]),
                    'metadata': {'auto_detected': True, 'confidence': np.random.uniform(0.6, 0.95)}
                })
        
        return {
            'companies': companies,
            'financial_reports': financial_reports,
            'anomalies': anomalies
        }

    async def import_postgresql_data(self, data: Dict[str, List[Dict]]):
        """Import data into PostgreSQL"""
        logger.info("Importing data into PostgreSQL")
        
        # Import companies
        companies_data = [
            (c['edrpou'], c['name'], c['legal_form'], c['status'], 
             c['registration_date'], c['address'], c['activity_code'], c['activity_description'])
            for c in data['companies']
        ]
        
        await self.pg_conn.executemany(
            """INSERT INTO companies (edrpou, name, legal_form, status, registration_date, 
                                    address, activity_code, activity_description) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
            companies_data
        )
        logger.info(f"Imported {len(companies_data)} companies")
        
        # Import financial reports
        reports_data = [
            (r['company_id'], r['report_year'], r['report_type'], 
             r['revenue'], r['profit'], r['assets'], r['liabilities'], r['employees_count'])
            for r in data['financial_reports']
        ]
        
        await self.pg_conn.executemany(
            """INSERT INTO financial_reports (company_id, report_year, report_type, 
                                            revenue, profit, assets, liabilities, employees_count)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)""",
            reports_data
        )
        logger.info(f"Imported {len(reports_data)} financial reports")
        
        # Import anomalies
        if data['anomalies']:
            anomalies_data = [
                (a['company_id'], a['anomaly_type'], a['severity'], 
                 a['description'], a['detected_at'], a['resolved'], a['metadata'])
                for a in data['anomalies']
            ]
            
            await self.pg_conn.executemany(
                """INSERT INTO anomalies (company_id, anomaly_type, severity, 
                                       description, detected_at, resolved, metadata)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                anomalies_data
            )
            logger.info(f"Imported {len(anomalies_data)} anomalies")

    def create_opensearch_indexes(self, data: Dict[str, List[Dict]]):
        """Create OpenSearch indexes and import data"""
        logger.info("Creating OpenSearch indexes")
        
        # Create companies index
        companies_mapping = {
            "mappings": {
                "properties": {
                    "edrpou": {"type": "keyword"},
                    "name": {"type": "text", "analyzer": "standard"},
                    "legal_form": {"type": "keyword"},
                    "status": {"type": "keyword"},
                    "registration_date": {"type": "date"},
                    "address": {"type": "text"},
                    "activity_code": {"type": "keyword"},
                    "activity_description": {"type": "text"},
                    "created_at": {"type": "date"}
                }
            }
        }
        
        if not self.opensearch_client.indices.exists(index="companies"):
            self.opensearch_client.indices.create(index="companies", body=companies_mapping)
        
        # Index companies
        for i, company in enumerate(data['companies']):
            doc = {
                **company,
                'id': i + 1,
                'registration_date': company['registration_date'].isoformat(),
                'created_at': datetime.now().isoformat()
            }
            self.opensearch_client.index(index="companies", id=i + 1, body=doc)
        
        logger.info(f"Indexed {len(data['companies'])} companies in OpenSearch")

    def create_qdrant_collection(self, data: Dict[str, List[Dict]]):
        """Create Qdrant collection and import vectors"""
        logger.info("Creating Qdrant collection")
        
        collection_name = "company_embeddings"
        
        # Create collection
        try:
            self.qdrant_client.delete_collection(collection_name)
        except Exception:
            pass  # Collection might not exist
            
        self.qdrant_client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )
        
        # Generate embeddings (mock data for demo)
        points = []
        for i, company in enumerate(data['companies']):
            # Generate random embeddings (in production, use real embedding models)
            embedding = np.random.normal(0, 1, 384).tolist()
            
            point = PointStruct(
                id=i + 1,
                vector=embedding,
                payload={
                    'edrpou': company['edrpou'],
                    'name': company['name'],
                    'activity_description': company['activity_description']
                }
            )
            points.append(point)
        
        self.qdrant_client.upsert(
            collection_name=collection_name,
            points=points
        )
        
        logger.info(f"Created {len(points)} embeddings in Qdrant")

    async def close_connections(self):
        """Close database connections"""
        if self.pg_conn:
            await self.pg_conn.close()
        logger.info("Closed database connections")

    async def run_import(self, num_companies: int = 1000):
        """Run complete data import process"""
        try:
            await self.connect_databases()
            await self.create_postgresql_schema()
            
            data = self.generate_sample_data(num_companies)
            
            await self.import_postgresql_data(data)
            self.create_opensearch_indexes(data)
            self.create_qdrant_collection(data)
            
            logger.info("Data import completed successfully!")
            
        except Exception as e:
            logger.error(f"Import failed: {e}")
            raise
        finally:
            await self.close_connections()

async def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Import sample data into Predator Analytics")
    parser.add_argument('--companies', type=int, default=1000, help='Number of companies to generate')
    args = parser.parse_args()
    
    importer = DataImporter()
    await importer.run_import(args.companies)

if __name__ == "__main__":
    asyncio.run(main())
