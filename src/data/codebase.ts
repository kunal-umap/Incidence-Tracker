import { CodeFile } from '../types';

export const CODE_FILES: CodeFile[] = [
  {
    path: 'docker-compose.yml',
    name: 'docker-compose.yml',
    category: 'docker',
    language: 'yaml',
    description: 'Multi-service orchestration: PostgreSQL 16, Redis 7, Python Backend, Celery Worker, Frontend.',
    content: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: enterprise_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-appuser}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-supersecretpassword123!}
      POSTGRES_DB: \${POSTGRES_DB:-enterprise_db}
    ports:
      - "\${POSTGRES_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init_db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-appuser} -d \${POSTGRES_DB:-enterprise_db}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: enterprise_redis
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "256mb"]
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql+asyncpg://appuser:supersecretpassword123!@postgres:5432/enterprise_db
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=\${SECRET_KEY}
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: python -m app.worker
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:`
  },
  {
    path: 'backend/app/core/security.py',
    name: 'security.py',
    category: 'core',
    language: 'python',
    description: 'Bcrypt password hashing, JWT Access Token creation with claims, and SHA-256 token hashing.',
    content: `import hashlib, secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], role: str, extra_claims: Optional[Dict[str, Any]] = None) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "iat": now,
        "type": "access",
    }
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def generate_refresh_token_string() -> str:
    """Generates high-entropy 64-char opaque token string."""
    return secrets.token_urlsafe(48)

def hash_token(token: str) -> str:
    """Hashes opaque refresh token before writing to PostgreSQL."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()`
  },
  {
    path: 'backend/app/models/user.py',
    name: 'user.py',
    category: 'models',
    language: 'python',
    description: 'SQLAlchemy 2.0 User model with Role-Based Access Control (RBAC) and relationships.',
    content: `import enum
from typing import List, TYPE_CHECKING
from sqlalchemy import Boolean, Enum, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    AGENT_OPERATOR = "AGENT_OPERATOR"
    USER = "USER"

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True, default="")
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum", create_type=False),
        default=UserRole.USER,
        nullable=False,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    agents: Mapped[List["Agent"]] = relationship("Agent", back_populates="creator", cascade="all, delete-orphan")`
  },
  {
    path: 'backend/app/models/agent.py',
    name: 'agent.py',
    category: 'models',
    language: 'python',
    description: 'AI Agent & AgentSession models designed for extensible tool orchestration and conversations.',
    content: `import enum, uuid
from typing import Any, Dict, List
from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class AgentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"

class Agent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "agents"

    creator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(500), nullable=True, default="")
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False, default="gemini-2.5-flash")
    config: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    status: Mapped[AgentStatus] = mapped_column(Enum(AgentStatus, name="agent_status_enum", create_type=False), default=AgentStatus.ACTIVE)
    rate_limit_per_minute: Mapped[int] = mapped_column(Integer, default=60)

    creator = relationship("User", back_populates="agents")
    sessions: Mapped[List["AgentSession"]] = relationship("AgentSession", back_populates="agent", cascade="all, delete-orphan")

class AgentSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "agent_sessions"

    agent_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_title: Mapped[str] = mapped_column(String(255), default="New Session")
    messages: Mapped[List[Dict[str, Any]]] = mapped_column(JSONB, default=list)
    token_count: Mapped[int] = mapped_column(Integer, default=0)

    agent = relationship("Agent", back_populates="sessions")`
  },
  {
    path: 'backend/app/services/auth_service.py',
    name: 'auth_service.py',
    category: 'services',
    language: 'python',
    description: 'Clean Architecture service for registration, authentication, and single-use refresh token rotation.',
    content: `class AuthService:
    async def register(self, db: AsyncSession, register_data: RegisterRequest) -> User:
        existing_user = await user_repository.get_by_email(db, email=register_data.email)
        if existing_user:
            raise ConflictError(detail="An account with this email address already exists.")

        hashed_pw = get_password_hash(register_data.password)
        return await user_repository.create(db, obj_in={
            "email": register_data.email.lower().strip(),
            "hashed_password": hashed_pw,
            "full_name": register_data.full_name or "",
            "role": UserRole.USER,
        })

    async def rotate_refresh_token(self, db: AsyncSession, raw_refresh_token: str, device_info: str = "web") -> TokenResponse:
        token_hash = hash_token(raw_refresh_token)
        stored_token = await token_repository.get_valid_token(db, token_hash=token_hash)
        if not stored_token:
            raise AuthenticationError(detail="Invalid or revoked refresh token.")

        # Immediate revocation for single-use guarantee
        await token_repository.revoke_token(db, token_hash=token_hash)
        user = await user_repository.get(db, id=stored_token.user_id)
        return await self.create_tokens_for_user(db, user, device_info=device_info)`
  },
  {
    path: 'backend/app/api/deps.py',
    name: 'deps.py',
    category: 'api',
    language: 'python',
    description: 'FastAPI dependency injection for JWT validation, Redis token blacklisting, and RBAC guards.',
    content: `oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    user_id_str = payload.get("sub")
    token_jti = payload.get("jti") or token[-16:]

    if await is_token_blacklisted(token_jti):
        raise AuthenticationError("Token has been revoked.")

    user = await user_repository.get(db, id=uuid.UUID(user_id_str))
    if not user or not user.is_active:
        raise AuthenticationError("Inactive or non-existent user.")
    return user

def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedError(f"Role '{current_user.role}' unauthorized.")
        return current_user
    return role_checker`
  },
  {
    path: 'backend/alembic/versions/2026_01_01_0001_initial_schema.py',
    name: '0001_initial_schema.py',
    category: 'migrations',
    language: 'python',
    description: 'Alembic version migration creating UUID tables, JSONB columns, foreign keys, and indexes.',
    content: `def upgrade() -> None:
    # 1. Enums
    user_role_enum = postgresql.ENUM("SUPER_ADMIN", "ADMIN", "AGENT_OPERATOR", "USER", name="user_role_enum")
    user_role_enum.create(op.get_bind(), checkfirst=True)

    # 2. Users Table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("SUPER_ADMIN", "ADMIN", "AGENT_OPERATOR", "USER", name="user_role_enum"), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)`
  },
  {
    path: 'backend/tests/test_auth.py',
    name: 'test_auth.py',
    category: 'tests',
    language: 'python',
    description: 'Asynchronous integration test covering registration, login, profile query, and token rotation.',
    content: `@pytest.mark.asyncio
async def test_user_registration_and_login_flow(client: AsyncClient):
    # Register
    reg_resp = await client.post("/api/v1/auth/register", json={
        "email": "tester@enterprise.ai",
        "password": "StrongPassword123!",
    })
    assert reg_resp.status_code == 201

    # Login
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "tester@enterprise.ai",
        "password": "StrongPassword123!",
    })
    assert login_resp.status_code == 200
    tokens = login_resp.json()["data"]

    # Rotate Token
    refresh_resp = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": tokens["refresh_token"]
    })
    assert refresh_resp.status_code == 200`
  }
];
