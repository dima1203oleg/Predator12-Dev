"""
Оптимізовані маршрути для агентів з паралельною обробкою
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

# Глобальний пул потоків
THREAD_POOL = ThreadPoolExecutor(max_workers=4)


async def run_in_threadpool(func, *args):
    """Виконує CPU-bound операції в окремому потоці"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(THREAD_POOL, partial(func, *args))


@router.get("/agents/{agent_id}/complex-report")
async def get_complex_report(agent_id: str):
    """Генерація звіту з використанням паралелізму"""
    # Обробка даних у окремому потоці
    report_data = await run_in_threadpool(
        generate_complex_report, agent_id  # CPU-intensive функція
    )
    return report_data
