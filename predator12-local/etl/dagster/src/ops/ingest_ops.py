from dagster import op, Out, In, Nothing
import duckdb as ddb
import pandas as pd
import os
from elasticsearch import Elasticsearch, helpers

@op(out={"parquet_path": Out(str)})
def read_chunk_and_write_parquet(context):
    source_path = os.getenv("SOURCE_FILE", "/data/customs_registry_feb.csv")
    chunk_size = int(os.getenv("CHUNK_SIZE", "200000"))
    parquet_dir = os.getenv("PARQUET_DIR", "/data/parquet")
    os.makedirs(parquet_dir, exist_ok=True)

    context.log.info(f"Reading {source_path} with chunk_size={chunk_size}")
    con = ddb.connect()
    df = con.execute(f"SELECT * FROM read_csv_auto('{source_path}')").df()
    # In real flow: iterative chunks; here simplified
    parquet_path = os.path.join(parquet_dir, "batch.parquet")
    df.to_parquet(parquet_path, index=False)
    return parquet_path

@op(ins={"parquet_path": In(str)}, out={"rowcount": Out(int)})
def validate_and_normalize(context, parquet_path: str):
    df = pd.read_parquet(parquet_path)
    # Minimal normalization example
    if "id" not in df.columns:
        df["id"] = pd.util.hash_pandas_object(df).astype("int64")
    if "description" in df.columns:
        df["description"] = df["description"].fillna("").str.strip().str[:2048]
    df.to_parquet(parquet_path, index=False)
    return len(df)

@op(ins={"parquet_path": In(str)}, out={"loaded": Out(int)})
def load_to_postgres(context, parquet_path: str):
    import psycopg2
    import pyarrow.parquet as pq

    pg_dsn = os.getenv("PG_DSN", "postgresql://user:pass@postgres:5432/predator")
    table = os.getenv("PG_TABLE", "customs.declarations")

    table_reader = pq.ParquetFile(parquet_path)
    total = 0
    with psycopg2.connect(pg_dsn) as conn:
        with conn.cursor() as cur:
            for batch in table_reader.iter_batches():
                df = batch.to_pandas()
                # Simplified COPY via execute_values
                from psycopg2.extras import execute_values
                cols = list(df.columns)
                values = [tuple(x) for x in df.to_numpy()]
                execute_values(cur,
                               f"INSERT INTO {table} ({','.join(cols)}) VALUES %s ON CONFLICT DO NOTHING",
                               values,
                               page_size=10000)
                total += len(df)
        conn.commit()
    context.log.info(f"Loaded {total} rows into {table}")
    return total

@op(ins={"parquet_path": In(str)}, out={"indexed": Out(int)})
def index_to_opensearch(context, parquet_path: str):
    es_url = os.getenv("OS_URL", "http://opensearch:9200")
    index = os.getenv("OS_INDEX", "declarations")

    es = Elasticsearch(es_url, verify_certs=False)
    df = pd.read_parquet(parquet_path)

    actions = (
        {
            "_op_type": "index",
            "_index": index,
            "_id": str(row.get("id")),
            "_source": row.to_dict(),
        }
        for _, row in df.iterrows()
    )

    helpers.bulk(es, actions, chunk_size=1000, request_timeout=120)
    return len(df)
