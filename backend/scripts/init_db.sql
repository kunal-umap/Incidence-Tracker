-- PostgreSQL Initialization Script
-- Automatically executed on container startup by docker-entrypoint-initdb.d

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create Enum types if not existing
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN', 'AGENT_OPERATOR', 'USER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE agent_status_enum AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
