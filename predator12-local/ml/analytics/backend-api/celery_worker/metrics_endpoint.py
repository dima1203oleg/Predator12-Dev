from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi import FastAPI, Response

app = FastAPI(title="Celery Metrics Endpoint")


@app.get("/metrics")
async def metrics():
    """
    Endpoint to expose Prometheus metrics for Celery workers.
    """
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("metrics_endpoint:app", host="0.0.0.0", port=5555, workers=1) 