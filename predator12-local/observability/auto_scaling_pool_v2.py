"""
Оптимізований пул потоків з автоскейлінгом та Prometheus
"""
from concurrent.futures import ThreadPoolExecutor
from prometheus_client import Gauge
from threading import Event, Thread
import time
import math

# Метрики Prometheus
THREAD_POOL_SIZE = Gauge('thread_pool_current_size', 'Поточна кількість потоків')
THREAD_POOL_LOAD = Gauge('thread_pool_current_load', 'Навантаження пулу (0-1)')
THREAD_ACTIVE = Gauge('thread_pool_active', 'Активні потоки')
THREAD_QUEUE = Gauge('thread_pool_queued', 'Запити в черзі')

class AutoScalingPool(ThreadPoolExecutor):
    """Пул потоків з автоматичним масштабуванням"""
    
    def __init__(self, min_workers=2, max_workers=10):
        super().__init__(max_workers=max_workers)
        self.min_workers = min_workers
        self.max_workers = max_workers
        self.scaling_event = Event()
        self.scaling_thread = Thread(target=self._adjust_pool_size, daemon=True)
        self.scaling_thread.start()
    
    def _adjust_pool_size(self):
        """Коригування кількості потоків"""
        while not self.scaling_event.is_set():
            time.sleep(5)
            load = self._calculate_load()
            
            # Оновлення метрик
            self._update_prometheus_metrics(load)
            
            # Розрахунок нового розміру
            new_size = math.ceil(self.max_workers * load)
            new_size = max(self.min_workers, min(self.max_workers, new_size))
            
            if new_size != self._max_workers:
                self._max_workers = new_size
                print(f"Оновлено розмір пулу: {new_size} потоків")
    
    def _calculate_load(self):
        """Розрахунок навантаження"""
        active = self._num_active_threads
        queue_size = self._work_queue.qsize()
        return min(1.0, (active + queue_size) / self.max_workers)
    
    def _update_prometheus_metrics(self, load):
        """Експорт метрик"""
        THREAD_POOL_SIZE.set(self._max_workers)
        THREAD_POOL_LOAD.set(load)
        THREAD_ACTIVE.set(self._num_active_threads)
        THREAD_QUEUE.set(self._work_queue.qsize())
    
    def shutdown(self):
        """Коректне завершення"""
        self.scaling_event.set()
        super().shutdown()

# Глобальний екземпляр
AUTO_SCALING_POOL = AutoScalingPool(min_workers=2, max_workers=10)
