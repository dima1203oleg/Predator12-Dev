from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
import pandas as pd
import pyarrow.parquet as pq
import pyarrow as pa
import os
import tempfile
import logging
from etl.validators.validators import validate_df

CHUNK_SIZE = int(os.getenv('INGEST_CHUNK_SIZE', '10000'))
DATA_PATH = os.getenv('INGEST_DATA_PATH', '/data/import/Лютий_10.xlsx')
PARQUET_DIR = os.getenv('PARQUET_DIR', '/data/parquet/')
PARQUET_BASENAME = os.getenv('PARQUET_BASENAME', 'Лютий_10.parquet')
PARQUET_PATH = os.path.join(PARQUET_DIR, PARQUET_BASENAME)
BACKUP_DIR = os.getenv('BACKUP_DIR', '/data/backups')

# 1. Chunked ingest Excel/CSV → Parquet
def ingest():
    os.makedirs(PARQUET_DIR, exist_ok=True)
    ext = os.path.splitext(DATA_PATH)[1].lower()
    if ext in ['.xlsx', '.xls']:
        try:
            reader = pd.read_excel(DATA_PATH, dtype=str, chunksize=CHUNK_SIZE, engine='openpyxl')
        except Exception:
            # Fallback: read whole file if chunks not supported
            df = pd.read_excel(DATA_PATH, dtype=str)
            reader = [df]
    elif ext == '.csv':
        reader = pd.read_csv(DATA_PATH, dtype=str, chunksize=CHUNK_SIZE, sep=None, engine='python')
    else:
        raise ValueError(f'Unsupported file extension: {ext}')

    for i, chunk in enumerate(reader):
        table = pa.Table.from_pandas(chunk)
        out = PARQUET_PATH if i == 0 else PARQUET_PATH.replace('.parquet', f'_{i}.parquet')
        pq.write_table(table, out)

# 2. Validation (pandera)
def validate():
    for file in os.listdir(PARQUET_DIR):
        if file.endswith('.parquet'):
            df = pd.read_parquet(os.path.join(PARQUET_DIR, file))
            validate_df(df)

# 3. Normalization (currencies, codes, date)
def normalize():
    for file in os.listdir(PARQUET_DIR):
        if file.endswith('.parquet'):
            p = os.path.join(PARQUET_DIR, file)
            df = pd.read_parquet(p)
            if 'ЄДРПОУ одержувача' in df.columns:
                df['ЄДРПОУ одержувача'] = df['ЄДРПОУ одержувача'].astype(str).str.replace(r'\D', '', regex=True).str.zfill(8)
            if 'Дата оформлення' in df.columns:
                df['Дата оформлення'] = pd.to_datetime(df['Дата оформлення'], errors='coerce').dt.strftime('%Y-%m-%d')
            df.to_parquet(p, index=False)

# 4. COPY to partitioned Postgres
def load():
    db_url = os.getenv('DB_URL')  # e.g. postgresql://user:pass@host:5432/db
    if not db_url:
        logging.warning('DB_URL is not set; skipping load step')
        return
    try:
        import sqlalchemy as sa
        engine = sa.create_engine(db_url)
        with engine.begin() as conn:
            conn.exec_driver_sql('''
            CREATE TABLE IF NOT EXISTS customs_registry (
                "Номер митної декларації" TEXT,
                "ЄДРПОУ одержувача" TEXT,
                "Код товару" TEXT,
                "Опис товару" TEXT,
                "Торгуюча країна" TEXT,
                "Країна походження" TEXT,
                "Дата оформлення" DATE
            );
            ''')
            for file in os.listdir(PARQUET_DIR):
                if file.endswith('.parquet'):
                    df = pd.read_parquet(os.path.join(PARQUET_DIR, file))
                    cols = [c for c in [
                        'Номер митної декларації','ЄДРПОУ одержувача','Код товару','Опис товару',
                        'Торгуюча країна','Країна походження','Дата оформлення'
                    ] if c in df.columns]
                    if not cols:
                        continue
                    df[cols].to_sql('customs_registry', conn, if_exists='append', index=False, method='multi', chunksize=2000)
    except Exception as e:
        logging.error(f'Load error: {e}')
        os.makedirs(BACKUP_DIR, exist_ok=True)
        for file in os.listdir(PARQUET_DIR):
            if file.endswith('.parquet'):
                pd.read_parquet(os.path.join(PARQUET_DIR, file)).to_csv(os.path.join(BACKUP_DIR, f'{file}.csv'), index=False)

# 5. Index to OpenSearch
def index_to_opensearch():
    os_url = os.getenv('OPENSEARCH_URL', 'http://opensearch:9200')
    index = os.getenv('OS_INDEX', 'customs_registry')
    try:
        from opensearchpy import OpenSearch, helpers
        client = OpenSearch(os_url)
        if not client.indices.exists(index=index):
            client.indices.create(index=index)
        actions = []
        for file in os.listdir(PARQUET_DIR):
            if file.endswith('.parquet'):
                df = pd.read_parquet(os.path.join(PARQUET_DIR, file))
                for _, row in df.head(1000).iterrows():
                    actions.append({
                        "_index": index,
                        "_source": row.dropna().to_dict()
                    })
        if actions:
            helpers.bulk(client, actions)
    except Exception as e:
        logging.error(f'OpenSearch indexing error: {e}')

# 6. Notify Kafka/UI
def notify():
    payload = {"event": "ingest_completed", "file": os.path.basename(DATA_PATH)}
    try:
        from confluent_kafka import Producer
        producer = Producer({'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP','kafka:9092')})
        producer.produce('etl.events', value=str(payload))
        producer.flush()
    except Exception as e:
        logging.warning(f'Kafka notify failed, fallback to log: {e} | payload={payload}')


default_args = {"start_date": datetime(2023, 1, 1)}
with DAG("import_declarations", schedule_interval=None, catchup=False, default_args=default_args) as dag:
    t1 = PythonOperator(task_id="ingest", python_callable=ingest)
    t2 = PythonOperator(task_id="validate", python_callable=validate)
    t3 = PythonOperator(task_id="normalize", python_callable=normalize)
    t4 = PythonOperator(task_id="load", python_callable=load)
    t5 = PythonOperator(task_id="index_to_opensearch", python_callable=index_to_opensearch)
    t6 = PythonOperator(task_id="notify", python_callable=notify)
    t1 >> t2 >> t3 >> t4 >> t5 >> t6
