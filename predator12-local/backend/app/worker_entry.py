from __future__ import annotations

import os
from rq import Worker, Queue, Connection
import redis


def main() -> None:
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    conn = redis.from_url(redis_url)
    queues = [Queue("default", connection=conn)]
    with Connection(conn):
        worker = Worker(queues)
        worker.work()


if __name__ == "__main__":
    main()
