from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.http.sensors.http import HttpSensor
import pandas as pd
import logging

logger = logging.getLogger(__name__)

# Параметри DAG
default_args = {
    'owner': 'predator-analytics',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'predator_etl_pipeline',
    default_args=default_args,
    description='Predator Analytics ETL Pipeline',
    schedule_interval=timedelta(hours=6),  # Кожні 6 годин
    catchup=False,
    tags=['predator', 'etl', 'analytics']
)

def extract_customs_data(**context):
    """Витягування митних даних"""
    try:
        logger.info("Starting customs data extraction")
        
        # Підключення до PostgreSQL
        pg_hook = PostgresHook(postgres_conn_id='predator_postgres')
        
        # SQL запит для витягування даних
        sql = """
        SELECT 
            id,
            doc_id,
            ts,
            hs_code,
            amount,
            qty,
            country,
            company_name,
            edrpou,
            created_at
        FROM stg_customs 
        WHERE created_at >= NOW() - INTERVAL '6 hours'
        """
        
        # Виконання запиту
        df = pg_hook.get_pandas_df(sql)
        
        # Збереження в тимчасовий файл
        output_path = f"/tmp/customs_data_{context['ds']}.csv"
        df.to_csv(output_path, index=False)
        
        logger.info(f"Extracted {len(df)} customs records to {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"Customs data extraction failed: {str(e)}")
        raise

def transform_customs_data(**context):
    """Трансформація митних даних"""
    try:
        # Отримання шляху з попереднього завдання
        ti = context['ti']
        input_path = ti.xcom_pull(task_ids='extract_customs_data')
        
        logger.info(f"Starting data transformation from {input_path}")
        
        # Завантаження даних
        df = pd.read_csv(input_path)
        
        # Трансформація даних
        # 1. Очистка пропущених значень
        df = df.dropna(subset=['doc_id', 'hs_code', 'amount'])
        
        # 2. Стандартизація країн
        country_mapping = {
            'USA': 'United States',
            'UK': 'United Kingdom',
            'DE': 'Germany',
            'PL': 'Poland'
        }
        df['country'] = df['country'].replace(country_mapping)
        
        # 3. Валідація ЄДРПОУ (має бути 8 цифр)
        df = df[df['edrpou'].str.match(r'^\d{8}$', na=False)]
        
        # 4. Категоризація за сумами
        df['amount_category'] = pd.cut(
            df['amount'], 
            bins=[0, 1000, 10000, 100000, float('inf')],
            labels=['small', 'medium', 'large', 'very_large']
        )
        
        # 5. Додавання часових ознак
        df['ts'] = pd.to_datetime(df['ts'])
        df['year'] = df['ts'].dt.year
        df['month'] = df['ts'].dt.month
        df['day_of_week'] = df['ts'].dt.dayofweek
        
        # Збереження трансформованих даних
        output_path = f"/tmp/customs_transformed_{context['ds']}.csv"
        df.to_csv(output_path, index=False)
        
        logger.info(f"Transformed data saved to {output_path}, {len(df)} records")
        return output_path
        
    except Exception as e:
        logger.error(f"Data transformation failed: {str(e)}")
        raise

def load_to_opensearch(**context):
    """Завантаження даних в OpenSearch"""
    try:
        # Отримання шляху з попереднього завдання
        ti = context['ti']
        input_path = ti.xcom_pull(task_ids='transform_customs_data')
        
        logger.info(f"Loading data to OpenSearch from {input_path}")
        
        # Тут буде виклик до IndexerAgent або пряме завантаження
        df = pd.read_csv(input_path)
        
        # Виклик API для індексації
        import requests
        
        response = requests.post(
            'http://backend:5001/api/v1/supervisor/command',
            json={
                'command': 'upload_dataset',
                'parameters': {
                    'file_path': input_path,
                    'metadata': {
                        'source': 'customs_etl',
                        'date': context['ds'],
                        'record_count': len(df)
                    }
                }
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            logger.info(f"Successfully indexed {len(df)} records to OpenSearch")
        else:
            raise Exception(f"OpenSearch indexing failed: {response.text}")
        
    except Exception as e:
        logger.error(f"OpenSearch loading failed: {str(e)}")
        raise

def trigger_anomaly_detection(**context):
    """Запуск детекції аномалій"""
    try:
        logger.info("Triggering anomaly detection")
        
        # Виклик AnomalyAgent через API
        import requests
        
        response = requests.post(
            'http://backend:5001/api/v1/supervisor/command',
            json={
                'command': 'analyze_anomalies',
                'parameters': {
                    'dataset_id': f"customs_{context['ds'].replace('-', '_')}",
                    'config': {
                        'algorithm': 'isolation_forest',
                        'threshold': 0.1,
                        'features': ['amount', 'qty']
                    }
                }
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Anomaly detection started: {result.get('analysis_id')}")
        else:
            raise Exception(f"Anomaly detection failed: {response.text}")
        
    except Exception as e:
        logger.error(f"Anomaly detection trigger failed: {str(e)}")
        raise

# Визначення завдань
extract_task = PythonOperator(
    task_id='extract_customs_data',
    python_callable=extract_customs_data,
    dag=dag
)

transform_task = PythonOperator(
    task_id='transform_customs_data',
    python_callable=transform_customs_data,
    dag=dag
)

load_task = PythonOperator(
    task_id='load_to_opensearch',
    python_callable=load_to_opensearch,
    dag=dag
)

anomaly_task = PythonOperator(
    task_id='trigger_anomaly_detection',
    python_callable=trigger_anomaly_detection,
    dag=dag
)

# Перевірка доступності системи
health_check = HttpSensor(
    task_id='check_system_health',
    http_conn_id='predator_backend',
    endpoint='health',
    timeout=20,
    poke_interval=30,
    dag=dag
)

# Встановлення залежностей
health_check >> extract_task >> transform_task >> load_task >> anomaly_task
