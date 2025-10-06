#!/usr/bin/env python3
"""
Database initialization script for Predator Analytics Platform.
This script creates the database schema and populates it with sample data.
"""

import os
import sys
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random
import string
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('init_db.log')
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database configuration
DB_CONFIG = {
    'dbname': os.getenv('POSTGRES_DB', 'predator_analytics'),
    'user': os.getenv('POSTGRES_USER', 'predator_user'),
    'password': os.getenv('POSTGRES_PASSWORD', 'predator_password'),
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', '5433')
}

class Database:
    """A simple database wrapper for PostgreSQL operations."""
    
    def __init__(self, config: Dict[str, str]):
        self.config = config
        self.conn = None
    
    def connect(self) -> bool:
        """Connect to the PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(**self.config)
            self.conn.autocommit = False
            logger.info("✅ Connected to PostgreSQL database")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to database: {e}")
            return False
    
    def disconnect(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            logger.info("✅ Disconnected from database")
    
    def execute(self, query: str, params: tuple = None) -> bool:
        """Execute a single SQL query."""
        try:
            with self.conn.cursor() as cur:
                cur.execute(query, params or ())
            self.conn.commit()
            return True
        except Exception as e:
            self.conn.rollback()
            logger.error(f"❌ Failed to execute query: {e}")
            logger.error(f"Query: {query}")
            if params:
                logger.error(f"Params: {params}")
            return False
    
    def execute_many(self, query: str, params_list: List[tuple]) -> bool:
        """Execute a query multiple times with different parameters."""
        try:
            with self.conn.cursor() as cur:
                execute_batch(cur, query, params_list)
            self.conn.commit()
            return True
        except Exception as e:
            self.conn.rollback()
            logger.error(f"❌ Failed to execute batch query: {e}")
            logger.error(f"Query: {query}")
            return False
    
    def fetch_all(self, query: str, params: tuple = None) -> List[tuple]:
        """Fetch all rows from a query."""
        try:
            with self.conn.cursor() as cur:
                cur.execute(query, params or ())
                return cur.fetchall()
        except Exception as e:
            logger.error(f"❌ Failed to fetch data: {e}")
            return []
    
    def table_exists(self, table_name: str) -> bool:
        """Check if a table exists in the database."""
        query = """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = %s
        );
        """
        result = self.fetch_one(query, (table_name,))
        return result[0] if result else False
    
    def fetch_one(self, query: str, params: tuple = None) -> Optional[tuple]:
        """Fetch a single row from a query."""
        try:
            with self.conn.cursor() as cur:
                cur.execute(query, params or ())
                return cur.fetchone()
        except Exception as e:
            logger.error(f"❌ Failed to fetch one row: {e}")
            return None

def create_schema(db: Database) -> bool:
    """Create the database schema."""
    logger.info("🔄 Creating database schema...")
    
    # Enable UUID extension
    if not db.execute("CREATE EXTENSION IF NOT EXISTS "uuid-ossp""):
        return False
    
    # Create tables
    schema_queries = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            is_superuser BOOLEAN DEFAULT false,
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS user_roles (
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, role_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS permissions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS role_permissions (
            role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
            permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (role_id, permission_id)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(50) NOT NULL,
            resource_type VARCHAR(50) NOT NULL,
            resource_id VARCHAR(100),
            previous_values JSONB,
            new_values JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
        """,
        """
        CREATE TABLE IF NOT EXISTS api_keys (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(100) NOT NULL,
            key_hash VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE,
            last_used_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
        CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
        """
    ]
    
    for query in schema_queries:
        if not db.execute(query):
            return False
    
    logger.info("✅ Database schema created successfully")
    return True

def create_default_roles_and_permissions(db: Database) -> bool:
    """Create default roles and permissions."""
    logger.info("🔄 Creating default roles and permissions...")
    
    # Default permissions
    permissions = [
        ("user:read", "Read user information"),
        ("user:write", "Create or update users"),
        ("user:delete", "Delete users"),
        ("role:read", "Read roles"),
        ("role:write", "Create or update roles"),
        ("role:delete", "Delete roles"),
        ("audit:read", "View audit logs"),
        ("api_key:manage", "Manage API keys"),
        ("settings:read", "Read application settings"),
        ("settings:write", "Update application settings")
    ]
    
    # Insert permissions
    permission_ids = {}
    for name, description in permissions:
        # Check if permission exists
        existing = db.fetch_one(
            "SELECT id FROM permissions WHERE name = %s", 
            (name,)
        )
        
        if not existing:
            if not db.execute(
                """
                INSERT INTO permissions (name, description)
                VALUES (%s, %s)
                RETURNING id
                """,
                (name, description)
            ):
                return False
            
            # Get the new permission ID
            result = db.fetch_one("SELECT id FROM permissions WHERE name = %s", (name,))
            if not result:
                logger.error(f"❌ Failed to get ID for permission: {name}")
                return False
            
            permission_id = result[0]
            permission_ids[name] = permission_id
            logger.info(f"✅ Created permission: {name}")
        else:
            permission_ids[name] = existing[0]
    
    # Default roles
    roles = [
        ("admin", "Administrator with full access", [
            "user:read", "user:write", "user:delete",
            "role:read", "role:write", "role:delete",
            "audit:read", "api_key:manage",
            "settings:read", "settings:write"
        ]),
        ("user", "Regular user with basic access", [
            "user:read", "api_key:manage"
        ]),
        ("auditor", "Auditor with read-only access", [
            "user:read", "role:read", "audit:read", "settings:read"
        ])
    ]
    
    # Insert roles and role-permission mappings
    role_ids = {}
    for name, description, perm_names in roles:
        # Check if role exists
        existing = db.fetch_one(
            "SELECT id FROM roles WHERE name = %s", 
            (name,)
        )
        
        if not existing:
            if not db.execute(
                """
                INSERT INTO roles (name, description)
                VALUES (%s, %s)
                RETURNING id
                """,
                (name, description)
            ):
                return False
            
            # Get the new role ID
            result = db.fetch_one("SELECT id FROM roles WHERE name = %s", (name,))
            if not result:
                logger.error(f"❌ Failed to get ID for role: {name}")
                return False
            
            role_id = result[0]
            role_ids[name] = role_id
            logger.info(f"✅ Created role: {name}")
        else:
            role_id = existing[0]
            role_ids[name] = role_id
            
            # Update role description if needed
            db.execute(
                "UPDATE roles SET description = %s, updated_at = NOW() WHERE id = %s",
                (description, role_id)
            )
        
        # Assign permissions to role
        for perm_name in perm_names:
            perm_id = permission_ids.get(perm_name)
            if not perm_id:
                logger.warning(f"⚠️ Permission not found: {perm_name}")
                continue
            
            # Check if the role-permission mapping already exists
            exists = db.fetch_one(
                """
                SELECT 1 FROM role_permissions 
                WHERE role_id = %s AND permission_id = %s
                """,
                (role_id, perm_id)
            )
            
            if not exists:
                if not db.execute(
                    """
                    INSERT INTO role_permissions (role_id, permission_id)
                    VALUES (%s, %s)
                    """,
                    (role_id, perm_id)
                ):
                    return False
                
                logger.info(f"✅ Assigned permission '{perm_name}' to role '{name}'")
    
    logger.info("✅ Default roles and permissions created successfully")
    return True

def create_admin_user(db: Database) -> bool:
    """Create an admin user if one doesn't exist."""
    logger.info("🔄 Creating admin user...")
    
    # Check if admin user already exists
    admin_exists = db.fetch_one(
        "SELECT 1 FROM users WHERE username = %s",
        ("admin",)
    )
    
    if admin_exists:
        logger.info("ℹ️ Admin user already exists")
        return True
    
    # Get admin role ID
    admin_role = db.fetch_one(
        "SELECT id FROM roles WHERE name = %s",
        ("admin",)
    )
    
    if not admin_role:
        logger.error("❌ Admin role not found")
        return False
    
    admin_role_id = admin_role[0]
    
    # Create admin user
    # In a real application, you should hash the password properly
    # This is just for demonstration purposes
    password_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # 'secret'
    
    if not db.execute(
        """
        INSERT INTO users (username, email, password_hash, is_superuser, first_name, last_name)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        ("admin", "admin@predator.ai", password_hash, True, "Admin", "User")
    ):
        return False
    
    # Get the new user ID
    admin_user = db.fetch_one(
        "SELECT id FROM users WHERE username = %s",
        ("admin",)
    )
    
    if not admin_user:
        logger.error("❌ Failed to get ID for admin user")
        return False
    
    admin_user_id = admin_user[0]
    
    # Assign admin role to admin user
    if not db.execute(
        """
        INSERT INTO user_roles (user_id, role_id)
        VALUES (%s, %s)
        """,
        (admin_user_id, admin_role_id)
    ):
        return False
    
    logger.info("✅ Admin user created successfully")
    logger.info("   Username: admin")
    logger.info("   Password: secret")
    logger.warning("⚠️  Please change the default password immediately after first login!")
    return True

def generate_sample_data(db: Database, num_users: int = 10) -> bool:
    """Generate sample data for testing."""
    logger.info(f"🔄 Generating {num_users} sample users...")
    
    # Get user role ID
    user_role = db.fetch_one(
        "SELECT id FROM roles WHERE name = %s",
        ("user",)
    )
    
    if not user_role:
        logger.error("❌ User role not found")
        return False
    
    user_role_id = user_role[0]
    
    # Generate sample users
    first_names = ["John", "Jane", "Michael", "Emily", "David", "Sarah", "Robert", "Lisa", "William", "Emma"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson"]
    domains = ["example.com", "test.com", "demo.org", "predator.ai"]
    
    users = []
    user_roles = []
    
    for i in range(1, num_users + 1):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        username = f"{first_name.lower()}.{last_name.lower()}"
        email = f"{first_name.lower()}.{last_name.lower()}@{random.choice(domains)}"
        password_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"  # 'secret'
        
        users.append((
            f"user{i}",
            f"user{i}@example.com",
            password_hash,
            first_name,
            last_name,
            random.choice([True, False]),  # is_active
            False,  # is_superuser
            datetime.utcnow() - timedelta(days=random.randint(1, 365)),
            datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            datetime.utcnow() - timedelta(days=random.randint(1, 30))
        ))
    
    # Insert users
    user_ids = []
    for user in users:
        if not db.execute(
            """
            INSERT INTO users (
                username, email, password_hash, first_name, last_name, 
                is_active, is_superuser, last_login, created_at, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            user
        ):
            return False
        
        # Get the new user ID
        result = db.fetch_one(
            "SELECT id FROM users WHERE username = %s",
            (user[0],)  # username is the first element
        )
        
        if not result:
            logger.error(f"❌ Failed to get ID for user: {user[0]}")
            return False
        
        user_ids.append(result[0])
    
    # Assign user role to all sample users
    user_roles = [(user_id, user_role_id) for user_id in user_ids]
    
    if not db.execute_many(
        """
        INSERT INTO user_roles (user_id, role_id)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
        """,
        user_roles
    ):
        return False
    
    logger.info(f"✅ Generated {num_users} sample users")
    
    # Generate sample audit logs
    logger.info("🔄 Generating sample audit logs...")
    
    actions = ["login", "logout", "create", "update", "delete", "view"]
    resource_types = ["user", "role", "permission", "api_key", "setting"]
    
    audit_logs = []
    
    for i in range(100):  # Generate 100 sample audit logs
        user_id = random.choice(user_ids + [None])  # Some logs might be system-generated
        action = random.choice(actions)
        resource_type = random.choice(resource_types)
        resource_id = str(random.randint(1, 1000))
        
        # Generate random IP address
        ip_address = f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"
        
        # Generate random user agent
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
        ]
        user_agent = random.choice(user_agents)
        
        # Generate timestamps within the last 30 days
        created_at = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        # Generate some random data for previous and new values
        if random.choice([True, False]):  # 50% chance to have previous/new values
            previous_values = {
                "field1": f"old_value_{random.randint(1, 100)}",
                "field2": random.choice([True, False]),
                "count": random.randint(1, 100)
            }
            new_values = {
                "field1": f"new_value_{random.randint(1, 100)}",
                "field2": not previous_values["field2"],
                "count": previous_values["count"] + random.randint(1, 10)
            }
        else:
            previous_values = None
            new_values = None
        
        audit_logs.append((
            user_id,
            action,
            resource_type,
            resource_id,
            json.dumps(previous_values) if previous_values else None,
            json.dumps(new_values) if new_values else None,
            ip_address,
            user_agent,
            created_at
        ))
    
    # Insert audit logs
    if not db.execute_many(
        """
        INSERT INTO audit_logs (
            user_id, action, resource_type, resource_id,
            previous_values, new_values, ip_address, user_agent, created_at
        )
        VALUES (%s, %s, %s, %s, %s::jsonb, %s::jsonb, %s::inet, %s, %s)
        """,
        audit_logs
    ):
        return False
    
    logger.info("✅ Generated sample audit logs")
    return True

def main():
    """Main function to initialize the database."""
    logger.info("🚀 Starting database initialization...")
    
    # Initialize database connection
    db = Database(DB_CONFIG)
    if not db.connect():
        sys.exit(1)
    
    try:
        # Create schema
        if not create_schema(db):
            logger.error("❌ Failed to create database schema")
            sys.exit(1)
        
        # Create default roles and permissions
        if not create_default_roles_and_permissions(db):
            logger.error("❌ Failed to create default roles and permissions")
            sys.exit(1)
        
        # Create admin user
        if not create_admin_user(db):
            logger.error("❌ Failed to create admin user")
            sys.exit(1)
        
        # Generate sample data (optional)
        if len(sys.argv) > 1 and sys.argv[1] == "--sample-data":
            if not generate_sample_data(db, num_users=10):
                logger.error("❌ Failed to generate sample data")
                sys.exit(1)
        
        logger.info("✨ Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ An error occurred: {e}", exc_info=True)
        sys.exit(1)
    
    finally:
        db.disconnect()

if __name__ == "__main__":
    main()
