import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from minio import Minio
import duckdb
import os
import hashlib
from datetime import datetime

def calculate_checksum(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def ingest_excel_to_parquet(minio_client: Minio, bucket: str, file_key: str, chunk_size: int = 10000):
    # Download file
    local_path = f"/tmp/{file_key}"
    minio_client.fget_object(bucket, file_key, local_path)
    
    checksum = calculate_checksum(local_path)
    
    # Read Excel in chunks
    reader = pd.read_excel(local_path, engine="openpyxl", chunksize=chunk_size)
    chunk_paths = []
    
    for i, chunk in enumerate(reader):
        # Validate chunk
        if chunk.empty:
            continue
        
        # Normalize
        chunk['company_name'] = chunk['company_name'].str.lower().str.strip()
        chunk['price'] = pd.to_numeric(chunk['price'], errors='coerce')
        chunk['date'] = pd.to_datetime(chunk['date'], errors='coerce')
        
        # Convert to Parquet
        table = pa.Table.from_pandas(chunk)
        chunk_path = f"/tmp/chunk_{i}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.parquet"
        pq.write_table(table, chunk_path)
        
        # Upload to MinIO
        minio_client.fput_object(bucket, f"processed/{os.path.basename(chunk_path)}", chunk_path)
        chunk_paths.append(chunk_path)
        
        os.remove(chunk_path)  # Clean up
    
    os.remove(local_path)
    
    # Create manifest
    manifest = {
        "source_file": file_key,
        "checksum": checksum,
        "chunks": len(chunk_paths),
        "processed_at": datetime.now().isoformat(),
        "chunk_size": chunk_size
    }
    
    with open("/tmp/manifest.json", "w") as f:
        import json
        json.dump(manifest, f)
    
    minio_client.fput_object(bucket, f"manifests/{file_key}.json", "/tmp/manifest.json")
    
    return chunk_paths

def load_parquet_to_postgres(chunk_paths: list, conn_string: str):
    import psycopg2
    
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    
    for chunk_path in chunk_paths:
        # Use DuckDB for fast COPY prep
        duckdb.sql(f"COPY (SELECT * FROM read_parquet('{chunk_path}')) TO '/tmp/data.csv' (HEADER, DELIMITER ',')")
        
        with open('/tmp/data.csv', 'r') as f:
            cur.copy_expert("COPY declarations FROM STDIN WITH CSV HEADER", f)
        
        conn.commit()
        os.remove(chunk_path)
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    minio_client = Minio("minio:9000", access_key=os.getenv("MINIO_ACCESS_KEY"), secret_key=os.getenv("MINIO_SECRET_KEY"), secure=False)
    file_key = os.getenv("FILE_KEY", "data.xlsx")
    bucket = "data"
    
    chunks = ingest_excel_to_parquet(minio_client, bucket, file_key)
    
    if chunks:
        load_parquet_to_postgres(chunks, os.getenv("POSTGRES_CONN"))
