from dagster import job

from ..ops.ingest_ops import (
    index_to_opensearch,
    load_to_postgres,
    read_chunk_and_write_parquet,
    validate_and_normalize,
)


@job
def ingest_job():
    parquet = read_chunk_and_write_parquet()
    validate_and_normalize(parquet)
    load_to_postgres(parquet)
    index_to_opensearch(parquet)
