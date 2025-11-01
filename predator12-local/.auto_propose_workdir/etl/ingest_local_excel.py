import os
import sys
import argparse
from datetime import datetime
from typing import List

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from minio import Minio
from sqlalchemy import create_engine


def ensure_minio_bucket(client: Minio, bucket: str) -> None:
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    # Standardize column names
    df = df.copy()
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]

    # Best-effort conversions
    for col in df.columns:
        # Try parse datetimes for columns that look like dates
        if any(k in col for k in ("date", "dt", "time")):
            try:
                df[col] = pd.to_datetime(df[col], errors="ignore")
            except Exception:
                pass
        # Try numeric for columns that look numeric
        if any(k in col for k in ("amount", "price", "sum", "qty", "count")):
            try:
                df[col] = pd.to_numeric(df[col], errors="coerce")
            except Exception:
                pass
        # Normalize typical text columns
        if any(k in col for k in ("name", "company", "title")):
            try:
                df[col] = df[col].astype(str).str.strip()
            except Exception:
                pass
    return df


def dataframe_to_parquet_chunks(df: pd.DataFrame, rows_per_chunk: int = 50000) -> List[str]:
    paths: List[str] = []
    if len(df) == 0:
        return paths
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    for i in range(0, len(df), rows_per_chunk):
        chunk = df.iloc[i : i + rows_per_chunk].copy()
        # Coerce object columns to strings to avoid Arrow conversion errors
        obj_cols = chunk.select_dtypes(include=["object"]).columns
        for c in obj_cols:
            try:
                chunk[c] = chunk[c].astype(str)
            except Exception:
                chunk[c] = chunk[c].astype("string").fillna("").astype(str)
        # Replace NaN in string columns with empty strings
        chunk[obj_cols] = chunk[obj_cols].fillna("")
        table = pa.Table.from_pandas(chunk, preserve_index=False)
        path = f"/tmp/excel_chunk_{i//rows_per_chunk}_{ts}.parquet"
        pq.write_table(table, path)
        paths.append(path)
    return paths


def upload_chunks_to_minio(client: Minio, bucket: str, paths: List[str]) -> List[str]:
    remote_paths: List[str] = []
    for p in paths:
        remote = f"processed/{os.path.basename(p)}"
        client.fput_object(bucket, remote, p)
        remote_paths.append(remote)
    return remote_paths


def load_to_postgres(df: pd.DataFrame, conn_str: str, table: str = "declarations") -> None:
    engine = create_engine(conn_str)
    # Create or append
    df.to_sql(table, engine, if_exists="append", index=False, method="multi", chunksize=5000)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--path", required=True, help="Path to local Excel file")
    parser.add_argument("--bucket", default="data")
    parser.add_argument("--table", default="declarations")
    args = parser.parse_args()

    excel_path = args.path
    if not os.path.isfile(excel_path):
        print(f"❌ File not found: {excel_path}")
        sys.exit(1)

    # Env/config
    minio_endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    minio_access = os.getenv("MINIO_ACCESS_KEY", "predator_minio")
    minio_secret = os.getenv("MINIO_SECRET_KEY", "predator_minio_password")
    pg_conn = os.getenv(
        "POSTGRES_CONN",
        "postgresql+psycopg2://predator_user:predator_password@localhost:5432/predator_analytics",
    )

    print("📥 Reading Excel...")
    df = pd.read_excel(excel_path, engine="openpyxl")
    print(f"✅ Loaded rows: {len(df)}; columns: {list(df.columns)}")

    print("🔧 Normalizing...")
    df = normalize_dataframe(df)

    print("💾 Writing parquet chunks...")
    local_chunks = dataframe_to_parquet_chunks(df)
    print(f"✅ Written {len(local_chunks)} parquet chunks to /tmp")

    print("☁️  Uploading to MinIO...")
    minio = Minio(minio_endpoint, access_key=minio_access, secret_key=minio_secret, secure=False)
    ensure_minio_bucket(minio, args.bucket)
    remote_keys = upload_chunks_to_minio(minio, args.bucket, local_chunks)
    print(f"✅ Uploaded {len(remote_keys)} objects to bucket '{args.bucket}'")

    print("🗃️  Loading into PostgreSQL...")
    load_to_postgres(df, pg_conn, table=args.table)
    print("✅ PostgreSQL load completed → table:", args.table)

    # Cleanup local tmp chunks
    for p in local_chunks:
        try:
            os.remove(p)
        except Exception:
            pass

    print("🎉 Ingestion finished successfully.")


if __name__ == "__main__":
    main()
