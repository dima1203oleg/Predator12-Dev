"""
Пулі потоків з авто-скейлінгом та метриками Prometheus
"""
from prometheus_client import Gauge
from threading import Event
import time
import math

# Метрики Prometheus
THREAD_POOL_SIZE = Gauge('thread_pool_current_size', 'Поточна кількість потоків')
THREAD_POOL_LOAD = Gauge('thread_pool_current_load', 'Навантаження пулу (0-1)')

class AutoScalingPool:
    """[Попередній код класу...]"""
    
    def _adjust_pool_size(self):
        while not self.scaling_event.is_set():
            time.sleep(5)
            load = self._calculate_load()
            
            # Оновлюємо метрики
            THREAD_POOL_LOAD.set(load)
            THREAD_POOL_SIZE.set(self._max_workers)
            
            # [Попередня логіка скейлінгу...]
