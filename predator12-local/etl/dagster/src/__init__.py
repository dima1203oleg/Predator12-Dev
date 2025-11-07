from dagster import Definitions

from .jobs.ingest_job import ingest_job
from .resources.connections import os_resource, pg_resource
from .sensors.minio_sensor import minio_sensor

all_jobs = [ingest_job]
all_sensors = [minio_sensor]
all_resources = {"postgres": pg_resource, "opensearch": os_resource}

defs = Definitions(jobs=all_jobs, sensors=all_sensors, resources=all_resources)
