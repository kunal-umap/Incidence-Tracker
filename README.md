# Enterprise Python Auth & Scalable AI Agent Platform

Production-ready, highly organized, microservices-ready full-stack architecture built according to modern industrial software engineering standards.

---

## 🏛 System Architecture & Folder Layout

```text
├── docker-compose.yml             # Orchestrates PostgreSQL, Redis, FastAPI Backend, Celery Worker, Frontend
├── Makefile                       # Developer shortcuts (make up, make migrate, make seed, make test)
├── .env.example                   # Complete configuration reference
│
├── backend/                       # Python FastAPI Backend Microservice
│   ├── Dockerfile                 # Multi-stage Dockerfile (dev + hardened non-root production)
│   ├── requirements.txt           # Production dependencies pinned
│   ├── alembic.ini                # Migration configuration
│   ├── alembic/                   # Async PostgreSQL schema migrations
│   │   └── versions/
│   │       └── 2026_01_01_0001_initial_schema.py
│   ├── app/
│   │   ├── main.py                # Application factory, lifespan, CORS, middleware, routers
│   │   ├── worker.py              # Celery task worker for background AI Agent operations
│   │   ├── core/                  # Core infrastructure, security & database engine
│   │   │   ├── config.py          # Pydantic v2 BaseSettings typed environment config
│   │   │   ├── security.py        # Bcrypt password hashing, JWT encoding, token rotation
│   │   │   ├── database.py        # Async SQLAlchemy 2.0 engine & session dependency
│   │   │   ├── redis.py           # Async Redis client, token blacklisting & rate limiter
│   │   │   └── exceptions.py      # Structured exception hierarchy
│   │   ├── models/                # SQLAlchemy 2.0 ORM entities (DeclarativeBase, UUIDs, JSONB)
│   │   │   ├── user.py            # User entity with RBAC (SUPER_ADMIN, ADMIN, OPERATOR, USER)
│   │   │   ├── refresh_token.py   # Refresh token storage with SHA-256 rotation
│   │   │   ├── agent.py           # Extensible AI Agent entity & session conversation store
│   │   │   └── audit_log.py       # Security audit logging
│   │   ├── schemas/               # Pydantic v2 data transfer objects & validation
│   │   │   ├── auth.py            # Login, Register, TokenResponse, Rotation schemas
│   │   │   ├── user.py            # UserRead, UserCreate, UserUpdate
│   │   │   └── agent.py           # Agent registration, Execution prompt, ToolCall schemas
│   │   ├── repositories/          # Data Access Object (DAO) / Repository Pattern
│   │   │   ├── base.py            # Generic Async CRUD BaseRepository
│   │   │   ├── user_repository.py # Specialized user queries
│   │   │   ├── token_repository.py# Token verification & batch revocation
│   │   │   └── agent_repository.py# Agent and session tracking queries
│   │   ├── services/              # Pure business logic layer (independent of HTTP)
│   │   │   ├── auth_service.py    # Authentication, password verification, token lifecycle
│   │   │   ├── user_service.py    # User profile & role elevation
│   │   │   └── agent_service.py   # AI Agent orchestrator & tool execution engine
│   │   ├── api/                   # HTTP Controller Routing
│   │   │   ├── deps.py            # FastAPI dependencies (get_current_user, require_roles, rate_limiter)
│   │   │   └── v1/
│   │   │       ├── api_router.py  # Aggregated v1 route index
│   │   │       └── endpoints/
│   │   │           ├── auth.py    # /register, /login, /refresh, /logout, /me
│   │   │           ├── users.py   # /users CRUD and role updates
│   │   │           ├── agents.py  # /agents execution, prompt testing, tool logs
│   │   │           └── health.py  # /health/live, /health/ready, /health/metrics
│   │   └── scripts/
│   │       └── seed_db.py         # Seeds initial Superadmin and sample AI Agent
│   └── tests/                     # Asynchronous Pytest suite
│       ├── conftest.py
│       └── test_auth.py
│
└── frontend/                      # Containerized Web Frontend (React 19, TypeScript, Tailwind)
    ├── Dockerfile                 # Multi-stage Vite dev & Nginx production container
    ├── nginx.conf                 # Production reverse proxy to backend:8000
    └── package.json
```

---

## 🚀 Running with Docker Compose

```bash
# 1. Clone & create environment file
cp .env.example .env

# 2. Boot all containers in the background
docker compose up -d

# 3. Apply database migrations to PostgreSQL
docker compose exec backend alembic upgrade head

# 4. Seed initial Administrator and AI Agent
docker compose exec backend python -m app.scripts.seed_db
```

Default seeded credentials:
- **Admin**: `admin@enterprise.ai` / `AdminSecretPassword123!`
- **Operator**: `developer@enterprise.ai` / `DevPassword123!`

---

## 🔐 Security & Auth Highlights
1. **Bcrypt Hashing**: Multi-round key derivation for user credentials.
2. **Short-Lived Access Tokens**: Signed JWTs expiring in 30 minutes, carrying role and subject claims.
3. **Rotational Refresh Tokens**: High-entropy 64-byte tokens stored as SHA-256 hashes in PostgreSQL. When rotated, old tokens are invalidated immediately.
4. **Token Blacklisting**: Revoked tokens are cached in Redis to prevent reuse.
5. **Rate Limiting**: Sliding window per-IP or per-user rate limiting using Redis.
