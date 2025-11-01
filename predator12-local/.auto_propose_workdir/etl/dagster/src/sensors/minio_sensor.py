from dagster import sensor, DefaultSensorStatus, SensorEvaluationContext, RunRequest
import os

# Placeholder sensor that could watch a folder or webhook integration

def _file_exists(path: str) -> bool:
    return os.path.exists(path)

@sensor(job_name="ingest_job", default_status=DefaultSensorStatus.STOPPED)
def minio_sensor(context: SensorEvaluationContext):
    watch_path = os.getenv("SOURCE_FILE", "/data/customs_registry_feb.csv")
    if _file_exists(watch_path):
        yield RunRequest(run_key=f"ingest-{os.path.basename(watch_path)}", run_config={})
