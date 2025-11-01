import os
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess
import time
from datetime import datetime

STATUS_FILE = os.getenv("ETL_STATUS_FILE", "etl_status.json")
LOGS_DIR = "logs"
os.makedirs(LOGS_DIR, exist_ok=True)

def load_status():
    if not os.path.exists(STATUS_FILE):
        return []
    with open(STATUS_FILE, "r") as f:
        return json.load(f)

def save_status(status):
    with open(STATUS_FILE, "w") as f:
        json.dump(status, f, indent=2)

def update_job(filename, **kwargs):
    status = load_status()
    for job in status:
        if job['filename'] == filename and job['status'] in ('pending', 'running'):
            job.update(kwargs)
            break
    else:
        # New job
        job = {'filename': filename, 'status': kwargs.get('status', 'pending')}
        job.update(kwargs)
        status.append(job)
    save_status(status)

class CSVHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(".csv"):
            filename = os.path.basename(event.src_path)
            print(f"[Watcher] Новий CSV-файл виявлено: {event.src_path}")
            update_job(filename, status='pending', started=None, finished=None, rows=None, error=None)
            log_path = os.path.join(LOGS_DIR, f"etl_{filename}.log")
            with open(log_path, "w") as logf:
                try:
                    update_job(filename, status='running', started=datetime.now().isoformat())
                    print("[Watcher] Запуск імпорту CSV у PostgreSQL...")
                    r1 = subprocess.run(["python3", "scripts/csv_to_db.py"], capture_output=True, text=True)
                    logf.write("[csv_to_db.py stdout]\n" + r1.stdout + "\n[csv_to_db.py stderr]\n" + r1.stderr)
                    if r1.returncode != 0:
                        raise Exception(f"csv_to_db.py failed: {r1.stderr}")
                    print("[Watcher] Імпорт завершено.")

                    print("[Watcher] Запуск генерації embedding-ів у Qdrant...")
                    r2 = subprocess.run(["python3", "scripts/postgres_to_qdrant.py"], capture_output=True, text=True)
                    logf.write("\n[postgres_to_qdrant.py stdout]\n" + r2.stdout + "\n[postgres_to_qdrant.py stderr]\n" + r2.stderr)
                    if r2.returncode != 0:
                        raise Exception(f"postgres_to_qdrant.py failed: {r2.stderr}")
                    print("[Watcher] Генерація завершена.")
                    update_job(filename, status='done', finished=datetime.now().isoformat(), error=None)
                except Exception as e:
                    print(f"[Watcher] Помилка при виконанні ETL: {e}")
                    update_job(filename, status='error', finished=datetime.now().isoformat(), error=str(e))

watch_path = "./data"
observer = Observer()
observer.schedule(CSVHandler(), path=watch_path, recursive=False)

print(f"[Watcher] Запуск моніторингу директорії: {watch_path}")
observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
