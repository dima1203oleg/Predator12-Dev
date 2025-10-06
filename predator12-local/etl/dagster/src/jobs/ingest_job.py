from dagster import job
from ..ops.ingest_ops import read_chunk_and_write_parquet, validate_and_normalize, load_to_postgres, index_to_opensearch

@job
def ingest_job():
    parquet = read_chunk_and_write_parquet()
    validate_and_normalize(parquet)
    load_to_postgres(parquet)
    index_to_opensearch(parquet)
