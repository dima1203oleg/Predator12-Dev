-- Create additional databases for Keycloak and other services
CREATE DATABASE keycloak;
CREATE DATABASE mlflow;
CREATE DATABASE airflow;

-- Create dedicated users with appropriate permissions
CREATE USER keycloak_user WITH PASSWORD 'keycloak_secure_pass_2024';
CREATE USER mlflow_user WITH PASSWORD 'mlflow_secure_pass_2024';
CREATE USER airflow_user WITH PASSWORD 'airflow_secure_pass_2024';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;
GRANT ALL PRIVILEGES ON DATABASE mlflow TO mlflow_user;
GRANT ALL PRIVILEGES ON DATABASE airflow TO airflow_user;

-- Create extensions for vector operations if needed
\c predator11;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_name ON agent_tasks(agent_name);
CREATE INDEX IF NOT EXISTS idx_status ON agent_tasks(status);

-- Create initial admin user (will be updated by application)
INSERT INTO users (username, email, is_active, is_superuser, created_at) 
VALUES ('admin', 'admin@predator11.local', true, true, NOW())
ON CONFLICT (username) DO NOTHING;

COMMIT;
