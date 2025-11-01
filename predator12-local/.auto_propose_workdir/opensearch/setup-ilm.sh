#!/bin/bash
# OpenSearch ILM Policies Setup Script
# Part of Delta Revision 1.1 - Block A2: Performance OpenSearch

OPENSEARCH_URL="http://localhost:9200"
OPENSEARCH_USER="admin"
OPENSEARCH_PASS="admin"

echo "Setting up OpenSearch ILM policies and templates..."

# Events ILM Policy
echo "Creating events lifecycle policy..."
curl -X PUT "${OPENSEARCH_URL}/_plugins/_ism/policies/events_lifecycle" \
  -u "${OPENSEARCH_USER}:${OPENSEARCH_PASS}" \
  -H 'Content-Type: application/json' \
  -d '{
    "policy": {
      "description": "ILM policy for customs events indices",
      "default_state": "hot",
      "states": [
        {
          "name": "hot",
          "actions": [
            {
              "rollover": {
                "min_size": "10GB",
                "min_doc_count": 1000000,
                "min_index_age": "1d"
              }
            }
          ],
          "transitions": [
            {
              "state_name": "warm",
              "conditions": {
                "min_index_age": "1d"
              }
            }
          ]
        },
        {
          "name": "warm",
          "actions": [
            {
              "replica_count": {
                "number_of_replicas": 0
              }
            },
            {
              "force_merge": {
                "max_num_segments": 1
              }
            }
          ],
          "transitions": [
            {
              "state_name": "cold",
              "conditions": {
                "min_index_age": "7d"
              }
            }
          ]
        },
        {
          "name": "cold",
          "actions": [
            {
              "allocation": {
                "require": {
                  "box_type": "cold"
                }
              }
            }
          ],
          "transitions": [
            {
              "state_name": "delete",
              "conditions": {
                "min_index_age": "365d"
              }
            }
          ]
        },
        {
          "name": "delete",
          "actions": [
            {
              "delete": {}
            }
          ]
        }
      ],
      "ism_template": [
        {
          "index_patterns": ["events-*"],
          "priority": 100
        }
      ]
    }
  }'

echo "Creating metrics lifecycle policy..."
curl -X PUT "${OPENSEARCH_URL}/_plugins/_ism/policies/metrics_lifecycle" \
  -u "${OPENSEARCH_USER}:${OPENSEARCH_PASS}" \
  -H 'Content-Type: application/json' \
  -d '{
    "policy": {
      "description": "ILM policy for metrics indices - longer retention",
      "default_state": "hot",
      "states": [
        {
          "name": "hot",
          "actions": [
            {
              "rollover": {
                "min_size": "20GB",
                "min_doc_count": 5000000,
                "min_index_age": "3d"
              }
            }
          ],
          "transitions": [
            {
              "state_name": "warm",
              "conditions": {
                "min_index_age": "3d"
              }
            }
          ]
        },
        {
          "name": "warm",
          "actions": [
            {
              "replica_count": {
                "number_of_replicas": 0
              }
            },
            {
              "force_merge": {
                "max_num_segments": 1
              }
            }
          ],
          "transitions": [
            {
              "state_name": "cold",
              "conditions": {
                "min_index_age": "14d"
              }
            }
          ]
        },
        {
          "name": "cold",
          "actions": [
            {
              "allocation": {
                "require": {
                  "box_type": "cold"
                }
              }
            }
          ],
          "transitions": [
            {
              "state_name": "delete",
              "conditions": {
                "min_index_age": "730d"
              }
            }
          ]
        },
        {
          "name": "delete",
          "actions": [
            {
              "delete": {}
            }
          ]
        }
      ],
      "ism_template": [
        {
          "index_patterns": ["metrics-*"],
          "priority": 100
        }
      ]
    }
  }'

echo "Creating index templates..."
curl -X PUT "${OPENSEARCH_URL}/_index_template/events_template" \
  -u "${OPENSEARCH_USER}:${OPENSEARCH_PASS}" \
  -H 'Content-Type: application/json' \
  -d '{
    "index_patterns": ["events-*"],
    "template": {
      "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 1,
        "refresh_interval": "30s",
        "index.codec": "best_compression",
        "plugins.index_state_management.policy_id": "events_lifecycle",
        "plugins.index_state_management.rollover_alias": "events_write"
      },
      "mappings": {
        "properties": {
          "@timestamp": {"type": "date"},
          "event_type": {"type": "keyword"},
          "severity": {"type": "keyword"},
          "source": {"type": "keyword"},
          "user_id": {"type": "keyword"},
          "session_id": {"type": "keyword"},
          "location": {"type": "geo_point"},
          "customs_post": {"type": "keyword"},
          "declaration_id": {"type": "keyword"},
          "goods_code": {"type": "keyword"},
          "country_origin": {"type": "keyword"},
          "amount": {"type": "double"},
          "currency": {"type": "keyword"},
          "anomaly_score": {"type": "float"},
          "risk_level": {"type": "keyword"},
          "message": {"type": "text"},
          "pii_fields": {"type": "keyword"},
          "classification": {"type": "keyword"}
        }
      }
    },
    "priority": 100
  }'

echo "Creating initial indices and aliases..."
curl -X PUT "${OPENSEARCH_URL}/events-000001" \
  -u "${OPENSEARCH_USER}:${OPENSEARCH_PASS}" \
  -H 'Content-Type: application/json' \
  -d '{
    "aliases": {
      "events_write": {"is_write_index": true},
      "events_current": {}
    }
  }'

curl -X PUT "${OPENSEARCH_URL}/metrics-000001" \
  -u "${OPENSEARCH_USER}:${OPENSEARCH_PASS}" \
  -H 'Content-Type: application/json' \
  -d '{
    "aliases": {
      "metrics_write": {"is_write_index": true},
      "metrics_current": {}
    }
  }'

echo "Configuring cluster settings for performance..."
curl -X PUT "${OPENSEARCH_URL}/_cluster/settings" \
  -u "${OPENSEARCH_USER}:${OPENSEARCH_PASS}" \
  -H 'Content-Type: application/json' \
  -d '{
    "persistent": {
      "indices.queries.cache.size": "15%",
      "indices.requests.cache.size": "5%",
      "search.max_buckets": 65536,
      "thread_pool.search.size": 13,
      "thread_pool.search.queue_size": 1000
    }
  }'

echo "OpenSearch ILM setup completed!"
