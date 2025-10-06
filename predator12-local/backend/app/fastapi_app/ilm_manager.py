#!/usr/bin/env python3
"""
Information Lifecycle Management (ILM) for Predator Analytics
Implements automated data archival, sharding, and caching policies.
Part of Delta Revision 1.1 - Block A2
"""

import logging
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

import aiohttp

logger = logging.getLogger(__name__)


class DataTier(Enum):
    """Data storage tiers"""

    HOT = "hot"  # SSD, frequent access
    WARM = "warm"  # Standard storage, occasional access
    COLD = "cold"  # Archival storage, rare access
    FROZEN = "frozen"  # Deep archive, very rare access


@dataclass
class ILMPolicy:
    """ILM policy configuration"""

    name: str
    hot_phase_days: int = 7
    warm_phase_days: int = 30
    cold_phase_days: int = 365
    delete_after_days: Optional[int] = None
    replica_count: Dict[str, int] = None
    shard_size: str = "50GB"
    force_merge_segments: int = 1


class OpenSearchILMManager:
    """OpenSearch Index Lifecycle Management"""

    def __init__(self, opensearch_url: str = "http://localhost:9200"):
        self.opensearch_url = opensearch_url.rstrip("/")
        self.session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def create_ilm_policy(self, policy: ILMPolicy) -> bool:
        """Create ILM policy in OpenSearch"""
        if not self.session:
            logger.error("Session not initialized")
            return False

        policy_config = {
            "policy": {
                "description": f"ILM policy for {policy.name}",
                "default_state": "hot",
                "states": [
                    {
                        "name": "hot",
                        "actions": [
                            {
                                "rollover": {
                                    "min_size": policy.shard_size,
                                    "min_doc_count": 100000,
                                    "min_index_age": f"{policy.hot_phase_days}d",
                                }
                            }
                        ],
                        "transitions": [
                            {
                                "state_name": "warm",
                                "conditions": {"min_index_age": f"{policy.hot_phase_days}d"},
                            }
                        ],
                    },
                    {
                        "name": "warm",
                        "actions": [
                            {
                                "replica_count": {
                                    "number_of_replicas": policy.replica_count.get("warm", 0)
                                }
                            },
                            {"force_merge": {"max_num_segments": policy.force_merge_segments}},
                        ],
                        "transitions": [
                            {
                                "state_name": "cold",
                                "conditions": {"min_index_age": f"{policy.warm_phase_days}d"},
                            }
                        ],
                    },
                    {
                        "name": "cold",
                        "actions": [{"replica_count": {"number_of_replicas": 0}}],
                        "transitions": [],
                    },
                ],
                "ism_template": [{"index_patterns": [f"{policy.name}-*"], "priority": 100}],
            }
        }

        # Add delete phase if specified
        if policy.delete_after_days:
            delete_transition = {
                "state_name": "delete",
                "conditions": {"min_index_age": f"{policy.delete_after_days}d"},
            }
            policy_config["policy"]["states"][-1]["transitions"].append(delete_transition)

            delete_state = {"name": "delete", "actions": [{"delete": {}}], "transitions": []}
            policy_config["policy"]["states"].append(delete_state)

        try:
            url = f"{self.opensearch_url}/_plugins/_ism/policies/{policy.name}"
            async with self.session.put(url, json=policy_config) as response:
                if response.status in [200, 201]:
                    logger.info(f"Created ILM policy: {policy.name}")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"Failed to create ILM policy {policy.name}: {error}")
                    return False
        except Exception as e:
            logger.error(f"Error creating ILM policy {policy.name}: {e}")
            return False

    async def create_index_template(
        self, template_name: str, index_pattern: str, policy_name: str
    ) -> bool:
        """Create index template with ILM policy"""
        template_config = {
            "index_patterns": [index_pattern],
            "template": {
                "settings": {
                    "plugins.index_state_management.policy_id": policy_name,
                    "plugins.index_state_management.rollover_alias": f"{template_name}_write",
                    "number_of_shards": 1,
                    "number_of_replicas": 1,
                    "refresh_interval": "30s",
                    "index.codec": "best_compression",
                },
                "mappings": {
                    "properties": {
                        "@timestamp": {"type": "date"},
                        "event_type": {"type": "keyword"},
                        "severity": {"type": "keyword"},
                        "source": {"type": "keyword"},
                        "message": {"type": "text"},
                        "location": {"type": "geo_point"},
                        "user_id": {"type": "keyword"},
                        "session_id": {"type": "keyword"},
                        "metadata": {"type": "object", "enabled": False},
                    }
                },
            },
            "priority": 100,
            "version": 1,
        }

        try:
            url = f"{self.opensearch_url}/_index_template/{template_name}"
            async with self.session.put(url, json=template_config) as response:
                if response.status in [200, 201]:
                    logger.info(f"Created index template: {template_name}")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"Failed to create index template {template_name}: {error}")
                    return False
        except Exception as e:
            logger.error(f"Error creating index template {template_name}: {e}")
            return False

    async def setup_alias_routing(self, alias_name: str, write_index: str) -> bool:
        """Setup alias for write operations with routing"""
        alias_config = {
            "actions": [
                {"add": {"index": write_index, "alias": alias_name, "is_write_index": True}}
            ]
        }

        try:
            url = f"{self.opensearch_url}/_aliases"
            async with self.session.post(url, json=alias_config) as response:
                if response.status == 200:
                    logger.info(f"Setup alias routing: {alias_name} -> {write_index}")
                    return True
                else:
                    error = await response.text()
                    logger.error(f"Failed to setup alias {alias_name}: {error}")
                    return False
        except Exception as e:
            logger.error(f"Error setting up alias {alias_name}: {e}")
            return False

    async def get_index_status(self, index_pattern: str) -> List[Dict[str, Any]]:
        """Get status of indices matching pattern"""
        try:
            url = f"{self.opensearch_url}/_cat/indices/{index_pattern}?format=json&h=index,status,health,pri,rep,docs.count,store.size,creation.date.string"
            async with self.session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Failed to get index status: {response.status}")
                    return []
        except Exception as e:
            logger.error(f"Error getting index status: {e}")
            return []


class MinIORetentionManager:
    """MinIO bucket lifecycle management"""

    def __init__(
        self, minio_endpoint: str = "localhost:9000", access_key: str = "", secret_key: str = ""
    ):
        self.minio_endpoint = minio_endpoint
        self.access_key = access_key
        self.secret_key = secret_key

    def create_lifecycle_policy(self, bucket_name: str, rules: List[Dict[str, Any]]) -> str:
        """Create MinIO lifecycle policy XML"""
        lifecycle_xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
        lifecycle_xml += "<LifecycleConfiguration>\n"

        for i, rule in enumerate(rules):
            lifecycle_xml += "  <Rule>\n"
            lifecycle_xml += f"    <ID>rule-{i+1}</ID>\n"
            lifecycle_xml += "    <Status>Enabled</Status>\n"

            if rule.get("prefix"):
                lifecycle_xml += f'    <Filter><Prefix>{rule["prefix"]}</Prefix></Filter>\n'
            else:
                lifecycle_xml += "    <Filter></Filter>\n"

            # Transition rules
            if rule.get("transition_days"):
                lifecycle_xml += "    <Transition>\n"
                lifecycle_xml += f'      <Days>{rule["transition_days"]}</Days>\n'
                lifecycle_xml += f'      <StorageClass>{rule.get("storage_class", "STANDARD_IA")}</StorageClass>\n'
                lifecycle_xml += "    </Transition>\n"

            # Expiration rule
            if rule.get("expiration_days"):
                lifecycle_xml += "    <Expiration>\n"
                lifecycle_xml += f'      <Days>{rule["expiration_days"]}</Days>\n'
                lifecycle_xml += "    </Expiration>\n"

            # Cleanup incomplete multipart uploads
            lifecycle_xml += "    <AbortIncompleteMultipartUpload>\n"
            lifecycle_xml += "      <DaysAfterInitiation>7</DaysAfterInitiation>\n"
            lifecycle_xml += "    </AbortIncompleteMultipartUpload>\n"

            lifecycle_xml += "  </Rule>\n"

        lifecycle_xml += "</LifecycleConfiguration>\n"
        return lifecycle_xml


class CacheManager:
    """Redis and OpenSearch cache management"""

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.cache_policies = {
            "hot_data": {"ttl": 3600, "max_memory": "1GB"},  # 1 hour
            "warm_data": {"ttl": 86400, "max_memory": "2GB"},  # 1 day
            "analytics": {"ttl": 7200, "max_memory": "500MB"},  # 2 hours
            "user_session": {"ttl": 1800, "max_memory": "100MB"},  # 30 minutes
        }

    def get_cache_key(self, namespace: str, identifier: str) -> str:
        """Generate cache key with namespace"""
        return f"predator:{namespace}:{identifier}"

    async def setup_redis_policies(self) -> bool:
        """Setup Redis memory and eviction policies"""
        try:
            import redis.asyncio as redis

            r = redis.from_url(self.redis_url)

            # Set memory policies
            await r.config_set("maxmemory", "4GB")
            await r.config_set("maxmemory-policy", "allkeys-lru")

            # Setup keyspace notifications for expiration events
            await r.config_set("notify-keyspace-events", "Ex")

            logger.info("Redis cache policies configured")
            await r.close()
            return True

        except Exception as e:
            logger.error(f"Failed to setup Redis policies: {e}")
            return False

    def create_aggregation_job(
        self, index_pattern: str, aggregation_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create pre-aggregation job configuration"""
        job_config = {
            "job_id": f"agg_{index_pattern}_{datetime.utcnow().strftime('%Y%m%d')}",
            "source": {
                "index": index_pattern,
                "query": aggregation_config.get("query", {"match_all": {}}),
            },
            "dest": {"index": f"{index_pattern}_aggregated", "version_type": "external"},
            "frequency": aggregation_config.get("frequency", "1h"),
            "page_size": 1000,
            "aggregations": aggregation_config.get("aggregations", {}),
            "metrics": [
                {"name": "doc_count", "type": "value_count"},
                {"name": "avg_response_time", "type": "avg", "field": "response_time"},
            ],
        }

        return job_config


class ILMOrchestrator:
    """Main ILM orchestrator for all storage systems"""

    def __init__(self):
        self.opensearch_manager = None
        self.minio_manager = MinIORetentionManager()
        self.cache_manager = CacheManager()

        # Default policies
        self.default_policies = {
            "events": ILMPolicy(
                name="events",
                hot_phase_days=1,
                warm_phase_days=7,
                cold_phase_days=30,
                delete_after_days=365,
                replica_count={"hot": 1, "warm": 0, "cold": 0},
                shard_size="10GB",
            ),
            "metrics": ILMPolicy(
                name="metrics",
                hot_phase_days=3,
                warm_phase_days=14,
                cold_phase_days=90,
                delete_after_days=730,
                replica_count={"hot": 1, "warm": 0, "cold": 0},
                shard_size="20GB",
            ),
            "logs": ILMPolicy(
                name="logs",
                hot_phase_days=7,
                warm_phase_days=30,
                cold_phase_days=365,
                delete_after_days=2555,  # 7 years
                replica_count={"hot": 1, "warm": 0, "cold": 0},
                shard_size="50GB",
            ),
        }

    async def initialize_ilm_system(self) -> bool:
        """Initialize complete ILM system"""
        success = True

        try:
            # Setup OpenSearch ILM
            async with OpenSearchILMManager() as os_manager:
                self.opensearch_manager = os_manager

                # Create ILM policies
                for policy_name, policy in self.default_policies.items():
                    if not await os_manager.create_ilm_policy(policy):
                        success = False

                # Create index templates
                templates = [
                    ("events_template", "events-*", "events"),
                    ("metrics_template", "metrics-*", "metrics"),
                    ("logs_template", "logs-*", "logs"),
                ]

                for template_name, pattern, policy in templates:
                    if not await os_manager.create_index_template(template_name, pattern, policy):
                        success = False

                # Setup write aliases
                aliases = [
                    ("events_write", "events-000001"),
                    ("metrics_write", "metrics-000001"),
                    ("logs_write", "logs-000001"),
                ]

                for alias, index in aliases:
                    if not await os_manager.setup_alias_routing(alias, index):
                        success = False

            # Setup MinIO lifecycle policies
            minio_rules = [
                {
                    "prefix": "hot/",
                    "transition_days": 30,
                    "storage_class": "STANDARD_IA",
                    "expiration_days": 365,
                },
                {
                    "prefix": "warm/",
                    "transition_days": 90,
                    "storage_class": "GLACIER",
                    "expiration_days": 2555,
                },
                {"prefix": "temp/", "expiration_days": 7},
            ]

            lifecycle_xml = self.minio_manager.create_lifecycle_policy("predator-data", minio_rules)
            logger.info("MinIO lifecycle policy created")

            # Setup Redis cache policies
            if not await self.cache_manager.setup_redis_policies():
                success = False

            if success:
                logger.info("ILM system initialized successfully")
            else:
                logger.warning("ILM system initialized with some failures")

        except Exception as e:
            logger.error(f"Failed to initialize ILM system: {e}")
            success = False

        return success

    async def run_maintenance_job(self) -> Dict[str, Any]:
        """Run periodic ILM maintenance"""
        results = {
            "timestamp": datetime.utcnow().isoformat(),
            "opensearch_indices": [],
            "cache_stats": {},
            "cleanup_actions": [],
        }

        try:
            # Check OpenSearch index status
            async with OpenSearchILMManager() as os_manager:
                for policy_name in self.default_policies.keys():
                    indices = await os_manager.get_index_status(f"{policy_name}-*")
                    results["opensearch_indices"].extend(indices)

            # Cache maintenance would go here
            results["cache_stats"] = {
                "redis_memory_used": "N/A",
                "evicted_keys": 0,
                "expired_keys": 0,
            }

            logger.info(
                f"ILM maintenance completed: {len(results['opensearch_indices'])} indices checked"
            )

        except Exception as e:
            logger.error(f"ILM maintenance failed: {e}")
            results["error"] = str(e)

        return results


# Global ILM orchestrator instance
ilm_orchestrator = ILMOrchestrator()

# Export main components
__all__ = [
    "DataTier",
    "ILMPolicy",
    "OpenSearchILMManager",
    "MinIORetentionManager",
    "CacheManager",
    "ILMOrchestrator",
    "ilm_orchestrator",
]
