#!/usr/bin/env python3
import argparse
import time
import yaml
from dataclasses import dataclass
from typing import Dict, List

"""
NEXUS_SUPERVISOR — Main agent orchestrator
- Loads agent registry (models) and policies (limits, priorities)
- Accepts simple commands (status, start_self_improve, stop_self_improve, shutdown)
- Emits heartbeats and prints decisions (dry-run by default)

Extend this supervisor to spawn worker agents (threads/processes) and to integrate
with Prometheus (pushgateway) / message bus (Kafka/Redis) if needed.
"""

@dataclass
class AgentConfig:
    name: str
    primary: str
    fallbacks: List[str]
    embedding: str | None

@dataclass
class AgentPolicy:
    priority: str
    rate_limit_per_minute: int
    cost_weight: float

class Supervisor:
    def __init__(self, registry_path: str, policies_path: str, dry_run: bool = True):
        self.registry_path = registry_path
        self.policies_path = policies_path
        self.dry_run = dry_run
        self.registry: Dict[str, AgentConfig] = {}
        self.policies: Dict[str, AgentPolicy] = {}
        self.self_improve_enabled = True

    def load(self):
        with open(self.registry_path, 'r') as f:
            raw = yaml.safe_load(f) or {}
        for agent, cfg in raw.items():
            self.registry[agent] = AgentConfig(
                name=agent,
                primary=cfg.get('primary'),
                fallbacks=list(cfg.get('fallbacks') or []),
                embedding=cfg.get('embedding'),
            )
        with open(self.policies_path, 'r') as f:
            pol = yaml.safe_load(f) or {}
        defaults = pol.get('defaults', {})
        for agent, cfg in pol.items():
            if agent == 'defaults':
                continue
            self.policies[agent] = AgentPolicy(
                priority=cfg.get('priority', defaults.get('priority', 'medium')),
                rate_limit_per_minute=int(cfg.get('rate_limit_per_minute', defaults.get('rate_limit_per_minute', 30))),
                cost_weight=float(cfg.get('cost_weight', defaults.get('cost_weight', 1.0))),
            )

    def status(self):
        print('[SUP] Agents loaded:', len(self.registry))
        for name, cfg in self.registry.items():
            pol = self.policies.get(name)
            print(f" - {name}: primary={cfg.primary} fallbacks={cfg.fallbacks} embedding={cfg.embedding} policy={pol}")
        print(f"[SUP] Self-improvement: {'ON' if self.self_improve_enabled else 'OFF'}")

    def start_self_improve(self):
        self.self_improve_enabled = True
        print('[SUP] Self-improvement enabled')

    def stop_self_improve(self):
        self.self_improve_enabled = False
        print('[SUP] Self-improvement disabled')

    def shutdown(self):
        print('[SUP] Shutdown requested')
        # Insert graceful shutdown behaviour here

    def run_loop(self):
        print('[SUP] Orchestrator loop starting (Ctrl+C to exit)')
        try:
            hb = 0
            while True:
                hb += 1
                # Decide routing policy adjustments here, read metrics from Prometheus, logs from Loki, etc.
                if self.dry_run:
                    print(f"[SUP][HB#{hb}] tick: {len(self.registry)} agents monitored; self_improve={self.self_improve_enabled}")
                time.sleep(5)
        except KeyboardInterrupt:
            print('\n[SUP] Interrupted by user')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--registry', default='agents/registry.yaml')
    ap.add_argument('--policies', default='agents/policies.yaml')
    ap.add_argument('--dry-run', action='store_true', help='Do not spawn real agents, print decisions only')
    ap.add_argument('--cmd', default='status', choices=['status','start_self_improve','stop_self_improve','run','shutdown'])
    args = ap.parse_args()

    sup = Supervisor(args.registry, args.policies, dry_run=args.dry_run)
    sup.load()

    if args.cmd == 'status':
        sup.status()
    elif args.cmd == 'start_self_improve':
        sup.start_self_improve()
    elif args.cmd == 'stop_self_improve':
        sup.stop_self_improve()
    elif args.cmd == 'shutdown':
        sup.shutdown()
    elif args.cmd == 'run':
        sup.status()
        sup.run_loop()

if __name__ == '__main__':
    main()
