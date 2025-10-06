#!/usr/bin/env python3
"""
OpenSearch setup script for Predator Analytics Platform.
This script creates indices, index templates, and dashboards in OpenSearch.
"""

import os
import json
import requests
from typing import Dict, Any, Optional
from pathlib import Path

# Configuration
OPENSEARCH_URL = os.getenv('OPENSEARCH_URL', 'http://localhost:9200')
OPENSEARCH_USER = os.getenv('OPENSEARCH_USER', 'admin')
OPENSEARCH_PASSWORD = os.getenv('OPENSEARCH_PASSWORD', 'admin')
VERIFY_SSL = os.getenv('OPENSEARCH_VERIFY_SSL', 'false').lower() == 'true'

# Paths
BASE_DIR = Path(__file__).parent.parent
TEMPLATES_DIR = BASE_DIR / 'opensearch' / 'index_templates'
DASHBOARDS_DIR = BASE_DIR / 'opensearch' / 'dashboards_exports'

class OpenSearchClient:
    """A simple OpenSearch client for setup operations."""
    
    def __init__(self, base_url: str, username: str, password: str, verify_ssl: bool = False):
        self.base_url = base_url.rstrip('/')
        self.auth = (username, password) if username and password else None
        self.verify = verify_ssl
        self.session = requests.Session()
        self.session.verify = verify_ssl
        if self.auth:
            self.session.auth = self.auth
    
    def request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make an HTTP request to the OpenSearch API."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            if response.text:
                return response.json()
            return {}
        except requests.exceptions.RequestException as e:
            print(f"Error making request to {url}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.status_code} - {e.response.text}")
            raise
    
    def get(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make a GET request."""
        return self.request('GET', endpoint, **kwargs)
    
    def put(self, endpoint: str, json_data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Make a PUT request."""
        return self.request('PUT', endpoint, json=json_data, **kwargs)
    
    def post(self, endpoint: str, json_data: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Make a POST request."""
        return self.request('POST', endpoint, json=json_data, **kwargs)
    
    def delete(self, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make a DELETE request."""
        return self.request('DELETE', endpoint, **kwargs)
    
    def create_index_template(self, name: str, template: Dict[str, Any]) -> bool:
        """Create or update an index template."""
        try:
            self.put(f"_index_template/{name}", template)
            print(f"✅ Created index template: {name}")
            return True
        except Exception as e:
            print(f"❌ Failed to create index template {name}: {e}")
            return False
    
    def create_index(self, name: str, settings: Optional[Dict[str, Any]] = None) -> bool:
        """Create an index with optional settings."""
        try:
            self.put(name, settings or {})
            print(f"✅ Created index: {name}")
            return True
        except Exception as e:
            print(f"❌ Failed to create index {name}: {e}")
            return False
    
    def create_data_stream(self, name: str) -> bool:
        """Create a data stream."""
        try:
            self.put(f"_data_stream/{name}", {})
            print(f"✅ Created data stream: {name}")
            return True
        except Exception as e:
            print(f"❌ Failed to create data stream {name}: {e}")
            return False
    
    def create_component_template(self, name: str, template: Dict[str, Any]) -> bool:
        """Create or update a component template."""
        try:
            self.put(f"_component_template/{name}", template)
            print(f"✅ Created component template: {name}")
            return True
        except Exception as e:
            print(f"❌ Failed to create component template {name}: {e}")
            return False
    
    def create_ism_policy(self, name: str, policy: Dict[str, Any]) -> bool:
        """Create or update an ISM policy."""
        try:
            self.put(f"_plugins/_ism/policies/{name}", policy)
            print(f"✅ Created ISM policy: {name}")
            return True
        except Exception as e:
            print(f"❌ Failed to create ISM policy {name}: {e}")
            return False
    
    def import_dashboards(self, dashboard_file: Path) -> bool:
        """Import dashboards from a JSON file."""
        try:
            with open(dashboard_file, 'r', encoding='utf-8') as f:
                dashboards = json.load(f)
                
            for dashboard in dashboards.get('objects', []):
                if dashboard.get('type') == 'dashboard':
                    dashboard_id = dashboard.get('_id')
                    try:
                        # Delete existing dashboard if it exists
                        self.delete(f"_dashboards/api/saved_objects/dashboard/{dashboard_id}")
                        # Create new dashboard
                        self.post(
                            f"_dashboards/api/saved_objects/dashboard/{dashboard_id}",
                            dashboard
                        )
                        print(f"✅ Imported dashboard: {dashboard.get('attributes', {}).get('title')}")
                    except Exception as e:
                        print(f"⚠️ Failed to import dashboard {dashboard_id}: {e}")
            
            return True
        except Exception as e:
            print(f"❌ Failed to import dashboards from {dashboard_file}: {e}")
            return False

def load_json_file(file_path: Path) -> Dict[str, Any]:
    """Load a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Failed to load JSON file {file_path}: {e}")
        return {}

def setup_opensearch():
    """Set up OpenSearch with indices, templates, and dashboards."""
    print("🚀 Setting up OpenSearch...")
    
    # Initialize client
    client = OpenSearchClient(OPENSEARCH_URL, OPENSEARCH_USER, OPENSEARCH_PASSWORD, VERIFY_SSL)
    
    # Check connection
    try:
        health = client.get('_cluster/health')
        print(f"🔍 Connected to OpenSearch cluster: {health.get('cluster_name')} (status: {health.get('status')})")
    except Exception as e:
        print(f"❌ Failed to connect to OpenSearch at {OPENSEARCH_URL}: {e}")
        return False
    
    # Create component templates
    print("\n🔄 Creating component templates...")
    for template_file in TEMPLATES_DIR.glob('component_*.json'):
        template_name = template_file.stem.replace('component_', '')
        template = load_json_file(template_file)
        if template:
            client.create_component_template(template_name, template)
    
    # Create index templates
    print("\n🔄 Creating index templates...")
    for template_file in TEMPLATES_DIR.glob('template_*.json'):
        template_name = template_file.stem.replace('template_', '')
        template = load_json_file(template_file)
        if template:
            client.create_index_template(template_name, template)
    
    # Create ISM policies
    print("\n🔄 Creating ISM policies...")
    for policy_file in (TEMPLATES_DIR / 'ism_policies').glob('*.json'):
        policy_name = policy_file.stem
        policy = load_json_file(policy_file)
        if policy:
            client.create_ism_policy(policy_name, policy)
    
    # Create indices
    print("\n🔄 Creating indices...")
    indices = [
        'logs-predator-*',
        'metrics-predator-*',
        'traces-predator-*',
        'predator-audit-*',
        'predator-metrics-*',
        'predator-logs-*'
    ]
    
    for index in indices:
        client.create_index(index)
    
    # Create data streams
    print("\n🔄 Creating data streams...")
    data_streams = [
        'logs-predator-default',
        'metrics-predator-default',
        'traces-predator-default'
    ]
    
    for stream in data_streams:
        client.create_data_stream(stream)
    
    # Import dashboards
    print("\n🔄 Importing dashboards...")
    for dashboard_file in DASHBOARDS_DIR.glob('*.ndjson'):
        client.import_dashboards(dashboard_file)
    
    print("\n✅ OpenSearch setup completed successfully!")
    return True

if __name__ == "__main__":
    setup_opensearch()
