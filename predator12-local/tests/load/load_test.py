"""
Load Testing Сценарії для Predator12
Використовує k6 або Locust для тестування з високим навантаженням
"""

import random
import time

from locust import HttpUser, TaskSet, between, events, task
from locust.contrib.fasthttp import FastHttpUser


class PredatorLoadTest(TaskSet):
    """Базові задачі для load тестування"""

    def on_start(self):
        """Встановити initial дані"""
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        self.agent_ids = []

    @task(10)
    def health_check(self):
        """Health endpoint - найпростіший"""
        self.client.get("/health", headers=self.headers)

    @task(5)
    def list_agents(self):
        """Отримати список агентів"""
        response = self.client.get(
            "/api/v1/agents",
            headers=self.headers,
        )
        if response.status_code == 200:
            try:
                agents = response.json()
                if isinstance(agents, list):
                    self.agent_ids = [a.get("id") for a in agents[:5]]
            except:
                pass

    @task(3)
    def get_agent_status(self):
        """Отримати статус конкретного агента"""
        if self.agent_ids:
            agent_id = random.choice(self.agent_ids)
            self.client.get(
                f"/api/v1/agents/{agent_id}/status",
                headers=self.headers,
                name="/api/v1/agents/[id]/status",
            )

    @task(2)
    def supervisor_status(self):
        """Отримати статус supervisor"""
        self.client.get(
            "/api/v1/supervisor/status",
            headers=self.headers,
        )

    @task(1)
    def get_metrics(self):
        """Отримати Prometheus metrics"""
        self.client.get("/metrics")


class PredatorUser(FastHttpUser):
    """Fast HTTP User для load тестування"""

    tasks = [PredatorLoadTest]
    wait_time = between(0.5, 3.0)  # Випадкова затримка 0.5-3 сек
    network_timeout = 10.0
    connection_timeout = 10.0


# Обробник подій для логування
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("\n" + "=" * 60)
    print("🚀 LOAD TEST STARTED")
    print("=" * 60)
    print(f"Target: {environment.host}")
    print(
        f"Users: {environment.runner.target_clients if hasattr(environment.runner, 'target_clients') else 'N/A'}"
    )
    print("=" * 60 + "\n")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("\n" + "=" * 60)
    print("🏁 LOAD TEST COMPLETED")
    print("=" * 60)

    # Вивести статистику
    for name, stats in environment.stats.entries.items():
        print(f"\n📊 {name}:")
        print(f"  Requests: {stats.num_requests}")
        print(f"  Failures: {stats.num_failures}")
        print(f"  Avg Response: {stats.avg_response_time:.2f}ms")
        print(f"  Max Response: {stats.max_response_time:.2f}ms")
        print(f"  Min Response: {stats.min_response_time:.2f}ms")

        if stats.num_requests > 0:
            failure_rate = (stats.num_failures / stats.num_requests) * 100
            print(f"  Failure Rate: {failure_rate:.2f}%")

    print("\n" + "=" * 60)


# K6 Test Script (JavaScript)
# Це можна запустити з k6 run load_test.js

K6_TEST_SCRIPT = """
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Метрики
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const successCount = new Counter('successes');

export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp-up до 20 користувачів
    { duration: '3m', target: 50 },   // Збільшити до 50
    { duration: '2m', target: 100 },  // До 100
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% запитів < 500ms
    'http_req_failed': ['rate<0.1'],     // < 10% помилок
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function() {
  group('Health & Status', function() {
    // Health check
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
      'health status is 200': (r) => r.status === 200,
    });
    responseTime.add(healthRes.timings.duration);
    if (healthRes.status !== 200) errorRate.add(1);
    else successCount.add(1);
  });

  group('Agents API', function() {
    // Get agents list
    const agentsRes = http.get(`${BASE_URL}/api/v1/agents`);
    check(agentsRes, {
      'agents status is 200': (r) => r.status === 200,
    });
    responseTime.add(agentsRes.timings.duration);
    if (agentsRes.status !== 200) errorRate.add(1);
    else successCount.add(1);
  });

  group('Supervisor', function() {
    // Get supervisor status
    const supRes = http.get(`${BASE_URL}/api/v1/supervisor/status`);
    check(supRes, {
      'supervisor status is 200': (r) => r.status === 200,
    });
    responseTime.add(supRes.timings.duration);
    if (supRes.status !== 200) errorRate.add(1);
    else successCount.add(1);
  });

  sleep(1);
}
"""


if __name__ == "__main__":
    print(
        """
    🚀 LOAD TESTING GUIDE

    Option 1: Locust (Python-based)
    ────────────────────────────────
    locust -f load_test.py -H http://localhost:8000 --users 50 --spawn-rate 10 --run-time 5m

    Option 2: K6 (JavaScript-based, більше modern)
    ───────────────────────────────────────────────
    k6 run load_test.js --vus 50 --duration 5m

    Option 3: Apache Benchmark (простий)
    ──────────────────────────────────────
    ab -n 10000 -c 100 http://localhost:8000/health

    Parameters:
    • -H / --host: Target host
    • -u / --users: Concurrent users
    • -r / --spawn-rate: Rate of spawning users
    • -t / --run-time: Duration
    • -c / -c: Concurrent connections
    • -n: Total number of requests

    Expected Results:
    • Response time: < 500ms (95th percentile)
    • Error rate: < 1%
    • Throughput: > 100 req/sec
    """
    )
