# Enterprise Python Backend Service

A high-performance, industrial-standard Python backend built with **FastAPI**, **SQLAlchemy 2.0 (Async)**, **PostgreSQL 16**, **Redis 7**, **Pydantic v2**, and **Celery**.

## Architecture Highlights
- **Layered Clean Architecture**: Strict decoupling between HTTP controllers (`api/`), business domain logic (`services/`), data persistence (`repositories/`), and data definitions (`models/` & `schemas/`).
- **Cryptographic Security & Auth**:
  - Bcrypt password hashing with passlib.
  - Signed JWT Access Tokens (HS256).
  - High-entropy Refresh Tokens stored as SHA-256 hashes in PostgreSQL for single-use token rotation.
  - Redis token blacklisting for immediate session revocations.
  - Role-Based Access Control (`UserRole.SUPER_ADMIN`, `ADMIN`, `AGENT_OPERATOR`, `USER`).
- **AI Agent Scalability**:
  - Dedicated `Agent` and `AgentSession` models with JSONB capabilities.
  - Session history and token counting in PostgreSQL.
  - Extensible tool orchestration and background task worker support via Celery.
- **Database Migrations**: Alembic version-controlled schema migrations with async driver (`asyncpg`).
- **Containerization**: Multi-stage Dockerfile with non-root security user (`appuser`) and automated health checks.

## Quick Start
```bash
# Start all containers (PostgreSQL, Redis, Backend, Worker, Frontend)
docker compose up -d

# Run database migrations
docker compose exec backend alembic upgrade head

# Seed initial admin & agents
docker compose exec backend python -m app.scripts.seed_db

# Access Swagger interactive documentation
open http://localhost:8000/api/v1/docs
```
