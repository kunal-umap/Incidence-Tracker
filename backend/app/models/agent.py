import enum
import uuid
from typing import Any, Dict, List, TYPE_CHECKING
from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class AgentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    ARCHIVED = "ARCHIVED"


class Agent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Extensible AI Agent Entity.
    Supports autonomous AI agent registration, prompt schemas, tool bindings,
    and scoped access control owned by an authenticated user.
    """
    __tablename__ = "agents"

    creator_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        index=True,
    )
    description: Mapped[str] = mapped_column(
        String(500),
        nullable=True,
        default="",
    )
    system_prompt: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="You are a specialized enterprise AI Agent assistant.",
    )
    model_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="gemini-2.5-flash",
    )
    # Store tools configuration, memory settings, plugins as JSONB
    config: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )
    status: Mapped[AgentStatus] = mapped_column(
        Enum(AgentStatus, name="agent_status_enum", create_type=False),
        default=AgentStatus.ACTIVE,
        nullable=False,
    )
    rate_limit_per_minute: Mapped[int] = mapped_column(
        Integer,
        default=60,
        nullable=False,
    )

    # Relationships
    creator: Mapped["User"] = relationship("User", back_populates="agents")
    sessions: Mapped[List["AgentSession"]] = relationship(
        "AgentSession",
        back_populates="agent",
        cascade="all, delete-orphan",
    )


class AgentSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Execution session / conversation history for an AI agent run.
    Maintains message logs, tool invocations, and token usage metrics.
    """
    __tablename__ = "agent_sessions"

    agent_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    session_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        default="New Session",
    )
    messages: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    token_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # Relationships
    agent: Mapped["Agent"] = relationship("Agent", back_populates="sessions")
