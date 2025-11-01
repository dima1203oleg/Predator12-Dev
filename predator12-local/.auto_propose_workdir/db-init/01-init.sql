-- Ініціалізація баз даних для Predator11
-- Цей скрипт виконується при першому запуску PostgreSQL

-- Створення бази даних для Keycloak
CREATE DATABASE keycloak;

-- Створення користувача для Keycloak (якщо потрібен окремий)
-- CREATE USER keycloak_user WITH PASSWORD 'secure_keycloak_db_password';
-- GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;

-- Створення розширень для основної бази
\c predator11;

-- Додання розширення для векторних операцій (pgvector)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Створення розширення для повнотекстового пошуку
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Створення розширення для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Логування успішної ініціалізації
SELECT 'Database initialization completed successfully' as status;
