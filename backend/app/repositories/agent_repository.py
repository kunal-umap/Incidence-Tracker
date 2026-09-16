import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent import Agent, AgentSession, AgentStatus
from app.repositories.base import BaseRepository
from app.schemas.agent import AgentCreate, AgentUpdate


class AgentRepository(BaseRepository[Agent, AgentCreate, AgentUpdate]):
    def __init__(self):
        super().__init__(Agent)

    async def get_by_creator(
        self, db: AsyncSession, *, creator_id: uuid.UUID
    ) -> List[Agent]:
        query = select(Agent).where(Agent.creator_id == creator_id).order_by(Agent.created_at.desc())
        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_active_agent(
        self, db: AsyncSession, *, agent_id: uuid.UUID
    ) -> Optional[Agent]:
        query = select(Agent).where(
            Agent.id == agent_id,
            Agent.status == AgentStatus.ACTIVE,
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def create_session(
        self,
        db: AsyncSession,
        *,
        agent_id: uuid.UUID,
        user_id: uuid.UUID,
        session_title: str = "Agent Interaction",
    ) -> AgentSession:
        session = AgentSession(
            agent_id=agent_id,
            user_id=user_id,
            session_title=session_title,
            messages=[],
            token_count=0,
        )
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session

    async def get_session(
        self, db: AsyncSession, *, session_id: uuid.UUID
    ) -> Optional[AgentSession]:
        query = select(AgentSession).where(AgentSession.id == session_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def append_message_to_session(
        self,
        db: AsyncSession,
        *,
        session: AgentSession,
        message: dict,
        tokens_added: int = 0
    ) -> AgentSession:
        # Clone messages list to trigger SQLAlchemy JSON mutation detection
        current = list(session.messages)
        current.append(message)
        session.messages = current
        session.token_count += tokens_added
        db.add(session)
        await db.flush()
        await db.refresh(session)
        return session


agent_repository = AgentRepository()
