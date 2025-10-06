from dagster import Definitions, job, op, resource, sensor, repository, ScheduleDefinition
from dagster_duckdb import DuckDBResource
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from minio import Minio
import requests

# Resources
@resource
def minio_client():
    return Minio("minio:9000", access_key="minio", secret_key="minio123", secure=False)

@resource
def duckdb_resource():
    return DuckDBResource(database=":memory:")

# Ops
@op
def ingest_excel(context, minio: Minio, duckdb: DuckDBResource, file_path: str):
    # Download from MinIO
    minio.fget_object("data", file_path, "/tmp/data.xlsx")
    df = pd.read_excel("/tmp/data.xlsx", engine="openpyxl")
    # Chunk processing
    chunks = [df[i:i+10000] for i in range(0, len(df), 10000)]
    for i, chunk in enumerate(chunks):
        table = pa.Table.from_pandas(chunk)
        pq.write_table(table, f"/tmp/chunk_{i}.parquet")
        minio.fput_object("processed", f"chunk_{i}.parquet", f"/tmp/chunk_{i}.parquet")
    return [f"chunk_{i}.parquet" for i in range(len(chunks))]

@op
def validate_data(context, duckdb: DuckDBResource, chunks: list):
    for chunk in chunks:
        # Load into DuckDB for validation
        duckdb.execute(f"CREATE TABLE temp AS SELECT * FROM read_parquet('/tmp/{chunk}')")
        # Run validations
        result = duckdb.execute("SELECT COUNT(*) FROM temp WHERE id IS NULL").fetchone()
        if result[0] > 0:
            raise ValueError(f"Validation failed for {chunk}")
    return chunks

@op
def normalize_data(context, duckdb: DuckDBResource, chunks: list):
    normalized_chunks = []
    for chunk in chunks:
        duckdb.execute(f"""
            CREATE TABLE normalized AS
            SELECT 
                LOWER(TRIM(company_name)) as company_name,
                CAST(price AS DECIMAL) as price,
                DATE(date_field) as date_field
            FROM read_parquet('/tmp/{chunk}')
        """)
        # Export back to Parquet
        duckdb.execute("COPY normalized TO '/tmp/normalized.parquet' (FORMAT PARQUET)")
        normalized_chunks.append("normalized.parquet")
    return normalized_chunks

@op
def index_to_opensearch(context, chunks: list):
    for chunk in chunks:
        # Bulk index to OpenSearch
        df = pd.read_parquet(f"/tmp/{chunk}")
        bulk_data = []
        for _, row in df.iterrows():
            bulk_data.append({"index": {"_index": "declarations", "_id": row['id']}})
            bulk_data.append(row.to_dict())
        requests.post("http://opensearch:9200/_bulk", json=bulk_data, headers={"Content-Type": "application/json"})
    return "indexed"

# Job
@job(resource_defs={"minio": minio_client, "duckdb": duckdb_resource})
def customs_etl_job():
    chunks = ingest_excel("data/customs.xlsx")
    validated = validate_data(chunks)
    normalized = normalize_data(validated)
    index_to_opensearch(normalized)

# Sensor for MinIO events
@sensor(job=customs_etl_job)
def minio_file_sensor(context):
    # Poll MinIO for new files
    client = Minio("minio:9000", access_key="minio", secret_key="minio123", secure=False)
    objects = client.list_objects("data", prefix="customs_")
    for obj in objects:
        if obj.last_modified > context.last_run_key:
            yield RunRequest(run_key=str(obj.last_modified), run_config={"ops": {"ingest_excel": {"config": {"file_path": obj.object_name}}}})

# Schedule
customs_etl_schedule = ScheduleDefinition(job=customs_etl_job, cron_schedule="0 2 * * *")

# Definitions
defs = Definitions(
    jobs=[customs_etl_job],
    sensors=[minio_file_sensor],
    schedules=[customs_etl_schedule],
    resources={"minio": minio_client, "duckdb": duckdb_resource}
)
