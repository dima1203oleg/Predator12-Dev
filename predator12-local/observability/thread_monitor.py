"""
Моніторинг та керування пулом потоків
"""
from concurrent.futures import ThreadPoolExecutor
from prometheus_client import Gauge
import time

# Метрики Prometheus
THREAD_ACTIVE = Gauge('thread_pool_active', 'Активні потоки')
THREAD_QUEUE = Gauge('thread_pool_queued', 'Запити в черзі')

class MonitoredThreadPool(ThreadPoolExecutor):
    """Пул потоків з моніторингом"""
    
    def __init__(self, max_workers=4):
        super().__init__(max_workers)
        self.last_update = time.time()
        
    def submit(self, fn, *args, **kwargs):
        # Оновлюємо метрики перед відправкою
        self._update_metrics()
        return super().submit(fn, *args, **kwargs)
    
    def _update_metrics(self):
        """Оновлення показників"""
        THREAD_ACTIVE.set(self._num_active_threads)
        THREAD_QUEUE.set(self._work_queue.qsize())
        
    @property
    def _num_active_threads(self):
        """Кількість активних потоків"""
        return sum(1 for thread in self._threads if thread.is_alive())

# Глобальний екземпляр
MONITORED_POOL = MonitoredThreadPool(max_workers=4)
