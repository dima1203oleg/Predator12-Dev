#!/usr/bin/env python3
"""
🛠️ Container Healer for Predator11
- Очікує запуск Docker демона (до 10 хв)
- Піднімає весь стек (docker compose/up -d з визначенням команди)
- Визначає проблемні контейнери (Restarting/Created/Exited/unhealthy)
- Застосовує точкові перезапуски та збір логів
- Пише детальний звіт у logs/container_healer.log
- macOS: автозапуск Docker Desktop
- OpenSearch: автогенерація мінімального config/jvm.options при відсутності
- Поетапний підйом і очікування health для критичних сервісів
"""
import subprocess
import time
import logging
import os
from datetime import datetime
from pathlib import Path
import shutil
import sys
from typing import Optional, Tuple, List, Dict, Union

BASE = Path('/Users/dima/Documents/Predator11')
LOGS_DIR = BASE / 'logs'
LOGS_DIR.mkdir(parents=True, exist_ok=True)
HEAL_LOG = LOGS_DIR / 'container_healer.log'

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(HEAL_LOG, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
log = logging.getLogger('healer')

COMPOSE_FILES = ['docker-compose.yml']

PROBLEM_PATTERNS = ('Restarting', 'Created', 'Exited', 'unhealthy')

SERVICES_PRIORITY = [
    'db', 'redis', 'opensearch', 'qdrant', 'minio',
    'modelsdk', 'backend', 'worker', 'scheduler', 'agent-supervisor',
    'frontend', 'loki', 'tempo', 'prometheus', 'grafana'
]

COMPOSE_CMD = None  # буде визначено динамічно


def sh(cmd: str, cwd: Optional[Path] = None, timeout: Optional[int] = None) -> Tuple[int, str, str]:
    proc = subprocess.Popen(cmd, cwd=str(cwd) if cwd else None, shell=True,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        out, err = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        proc.kill()
        out, err = proc.communicate()
    return proc.returncode, out, err


def open_docker_desktop():
    """Спроба автозапуску Docker Desktop на macOS"""
    if sys.platform == 'darwin':
        log.info('Пробую запустити Docker Desktop...')
        sh('open -a "Docker Desktop"')


def wait_docker_ready(max_wait_sec=600, interval=5) -> bool:
    log.info('Очікую готовність Docker демона... (до %s сек)', max_wait_sec)
    open_docker_desktop()
    waited = 0
    while waited < max_wait_sec:
        code, _, _ = sh('docker info >/dev/null 2>&1 && echo OK || echo NO')
        code2, _, _ = sh('docker info >/dev/null 2>&1')
        if code2 == 0:
            log.info('Docker READY')
            return True
        time.sleep(interval)
        waited += interval
        log.info('Docker все ще STARTING... (%ss)', waited)
    log.error('Docker не став готовим за %s сек', max_wait_sec)
    return False


def detect_compose_cmd() -> str:
    """Визначає, чим користуватись: 'docker compose' чи 'docker-compose'"""
    # Пробуємо docker compose
    code, _, _ = sh('docker compose version >/dev/null 2>&1 && echo OK || echo NO')
    if code == 0:
        return 'docker compose'
    # Фолбек на docker-compose
    code2, _, _ = sh('docker-compose version >/dev/null 2>&1 && echo OK || echo NO')
    if code2 == 0:
        return 'docker-compose'
    # Якщо жодного немає — лог і raise
    log.error('Не знайдено ні "docker compose", ні "docker-compose" у PATH')
    raise RuntimeError('compose command not found')


def build_compose_files_arg() -> str:
    files = []
    for f in COMPOSE_FILES:
        if (BASE / f).exists():
            files.append(f'-f {f}')
    # Додаємо override, якщо існує
    if (BASE / 'docker-compose.override.yml').exists():
        files.append('-f docker-compose.override.yml')
    return ' '.join(files)


def compose_up_detached(services: Optional[List[str]] = None, timeout: int = 300) -> None:
    files_arg = build_compose_files_arg()
    svc_arg = '' if not services else ' ' + ' '.join(services)
    cmd = f'{COMPOSE_CMD} {files_arg} up -d{svc_arg}'
    code, out, err = sh(cmd, cwd=BASE, timeout=timeout)
    if code == 0:
        log.info('%s: OK', cmd)
    else:
        log.error('%s: FAIL\n%s\n%s', cmd, out, err)


def list_containers() -> List[Dict]:
    code, out, err = sh('docker ps -a --format "{{.Names}}|{{.Image}}|{{.Status}}"')
    if code != 0:
        log.error('Не вдається отримати список контейнерів: %s', err)
        return []
    items: List[Dict] = []
    for line in out.strip().splitlines():
        parts = line.split('|')
        if len(parts) != 3:
            continue
        items.append({'name': parts[0], 'image': parts[1], 'status': parts[2]})
    return items


def is_problem(status: str) -> bool:
    return any(p in status for p in PROBLEM_PATTERNS)


def inspect_health(name: str) -> str:
    """Повертає Health.Status або 'none' якщо немає healthcheck."""
    code, out, _ = sh(f'docker inspect --format "{{{{.State.Health.Status}}}}" {name}')
    if code != 0:
        return 'none'
    val = out.strip()
    return val if val else 'none'


def wait_services_healthy(names: List[str], timeout_sec: int = 180, interval: int = 5) -> None:
    start = time.time()
    pending = set(names)
    log.info('Очікую здоровʼя сервісів %s (до %ss)...', names, timeout_sec)
    while pending and (time.time() - start) < timeout_sec:
        done: List[str] = []
        for n in pending:
            status = inspect_health(n)
            # Якщо немає healthcheck — приймаємо Up як ОК
            code, psout, _ = sh(f'docker ps --filter name={n} --format "{{{{.Status}}}}"')
            psstat = psout.strip()
            if status == 'healthy' or (status == 'none' and psstat.startswith('Up')):
                log.info('%s healthy (%s / %s)', n, status, psstat)
                done.append(n)
            else:
                log.debug('%s still %s (%s)', n, status, psstat)
        for n in done:
            pending.discard(n)
        if pending:
            time.sleep(interval)
    if pending:
        log.warning('Не всі сервіси стали healthy вчасно: %s', list(pending))


def restart_service(name: str) -> None:
    log.info('Перезапуск %s ...', name)
    code, out, err = sh(f'docker restart {name}', timeout=60)
    if code == 0:
        log.info('Перезапущено %s', name)
    else:
        log.error('Не вдалося перезапустити %s: %s', name, err)


def collect_logs(name: str, lines=200) -> None:
    log_path = LOGS_DIR / f'{name}.log'
    code, out, err = sh(f'docker logs --tail {lines} {name}')
    with open(log_path, 'w', encoding='utf-8') as f:
        f.write(out or '')
        if err:
            f.write('\n[stderr]\n')
            f.write(err)
    log.info('Логи %s збережено у %s', name, log_path)


def ensure_opensearch_config():
    """Автогенерація мінімального config/jvm.options для OpenSearch, якщо відсутній."""
    cfg_dir = BASE / 'observability' / 'opensearch' / 'config'
    cfg_dir.mkdir(parents=True, exist_ok=True)
    jvm = cfg_dir / 'jvm.options'
    if not jvm.exists():
        jvm.write_text("""
-Xms512m
-Xmx512m
-XX:+UseG1GC
-XX:+AlwaysPreTouch
-XX:+HeapDumpOnOutOfMemoryError
""".strip()+"\n", encoding='utf-8')
        log.info('Створено мінімальний OpenSearch jvm.options у %s', jvm)


def heal_once() -> dict:
    report = {'problems': [], 'fixed': [], 'left': []}
    items = list_containers()
    if not items:
        return report
    # Встановлюємо пріоритет сортування
    priority_index = {svc: i for i, svc in enumerate(SERVICES_PRIORITY)}
    items_sorted = sorted(items, key=lambda x: priority_index.get(x['name'], 999))
    for it in items_sorted:
        name, status = it['name'], it['status']
        if is_problem(status):
            report['problems'].append((name, status))
            collect_logs(name)
            restart_service(name)
            time.sleep(3)
            # повторна перевірка
            items2 = list_containers()
            new_status = next((j['status'] for j in items2 if j['name'] == name), status)
            if not is_problem(new_status):
                report['fixed'].append((name, status + ' -> ' + new_status))
            else:
                report['left'].append((name, new_status))
    return report


def staged_bringup():
    """Поетапний підйом сервісів із очікуванням health."""
    global COMPOSE_CMD
    COMPOSE_CMD = detect_compose_cmd()

    # 0) Підготовка OpenSearch конфігів (уникнути NoSuchFileException)
    ensure_opensearch_config()

    # 1) Бази/кеш/сховища
    core: List[str] = ['db', 'redis', 'minio', 'qdrant', 'opensearch']
    compose_up_detached(core)
    wait_services_healthy(core, timeout_sec=240)

    # 2) Model SDK (за потреби контейнерний)
    compose_up_detached(['modelsdk'])
    time.sleep(10)

    # 3) Backend
    compose_up_detached(['backend'])
    wait_services_healthy(['predator11-backend-1'], timeout_sec=180)

    # 4) Worker/Scheduler/Supervisor
    compose_up_detached(['worker', 'scheduler', 'agent-supervisor'])
    time.sleep(10)

    # 5) Спостережуваність та фронтенд
    compose_up_detached(['prometheus', 'grafana', 'loki', 'tempo', 'frontend', 'opensearch-dashboards'])
    time.sleep(10)


def main():
    log.info('=== CONTAINER HEALER START ===')
    log.info('Time: %s', datetime.now().isoformat())

    if not wait_docker_ready():
        log.error('Перериваю: Docker не готовий')
        return

    # Поетапний підйом замість одного великого up -d
    try:
        staged_bringup()
    except Exception as e:
        log.error('Помилка staged_bringup: %s', e)

    # Хвиля лікування №1
    report = heal_once()
    log.info('Знайдено проблем: %s, Виправлено: %s, Залишилось: %s',
             len(report['problems']), len(report['fixed']), len(report['left']))

    # Хвиля лікування №2 через 20 сек
    time.sleep(20)
    report2 = heal_once()
    log.info('Повторна перевірка — Знайдено проблем: %s, Виправлено: %s, Залишилось: %s',
             len(report2['problems']), len(report2['fixed']), len(report2['left']))

    log.info('=== CONTAINER HEALER DONE ===')


if __name__ == '__main__':
    main()
