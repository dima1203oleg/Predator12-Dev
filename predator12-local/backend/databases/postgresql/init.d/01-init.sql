-- Create the keycloak database if it doesn't exist
CREATE DATABASE keycloak;

-- Connect to the keycloak database
\c keycloak

-- Create the keycloak user if it doesn't exist and grant privileges
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'predator_user') THEN
        CREATE USER predator_user WITH PASSWORD 'predator_password';
    END IF;
END
$$;

-- Grant privileges to the predator_user on the keycloak database
GRANT ALL PRIVILEGES ON DATABASE keycloak TO predator_user;

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables for the predator_analytics database
\c predator_analytics

-- Create tables for the application
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add more tables as needed for your application

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
