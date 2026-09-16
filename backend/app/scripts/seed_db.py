import asyncio
import uuid
from loguru import logger
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.agent import Agent, AgentStatus
from app.models.user import User, UserRole


async def seed_data():
    logger.info("Initializing database seed routine...")
    async with AsyncSessionLocal() as session:
        # Check if Superadmin exists
        result = await session.execute(
            select(User).where(User.email == "admin@enterprise.ai")
        )
        admin = result.scalars().first()

        if not admin:
            logger.info("Creating default Super Admin: admin@enterprise.ai")
            admin = User(
                id=uuid.uuid4(),
                email="admin@enterprise.ai",
                hashed_password=get_password_hash("AdminSecretPassword123!"),
                full_name="Chief System Administrator",
                role=UserRole.SUPER_ADMIN,
                is_active=True,
                is_verified=True,
            )
            session.add(admin)
            await session.commit()
            await session.refresh(admin)
            logger.info(f"Super Admin created with ID: {admin.id}")
        else:
            logger.info("Super Admin already exists. Skipping.")

        # Check if Sample Developer/Operator exists
        result = await session.execute(
            select(User).where(User.email == "developer@enterprise.ai")
        )
        dev = result.scalars().first()

        if not dev:
            logger.info("Creating default Agent Operator: developer@enterprise.ai")
            dev = User(
                id=uuid.uuid4(),
                email="developer@enterprise.ai",
                hashed_password=get_password_hash("DevPassword123!"),
                full_name="Lead AI Engineer",
                role=UserRole.AGENT_OPERATOR,
                is_active=True,
                is_verified=True,
            )
            session.add(dev)
            await session.commit()
            await session.refresh(dev)

        # Check if default AI Agent exists
        result = await session.execute(
            select(Agent).where(Agent.name == "Omni Research Assistant")
        )
        agent = result.scalars().first()

        if not agent:
            logger.info("Creating default autonomous AI Agent...")
            agent = Agent(
                id=uuid.uuid4(),
                creator_id=admin.id,
                name="Omni Research Assistant",
                description="General-purpose enterprise research agent with web retrieval and analytical capabilities.",
                system_prompt="You are Omni, an enterprise AI assistant with tool-calling capabilities. Always output concise, verifiable reasoning.",
                model_name="gemini-2.5-flash",
                config={"tools": ["web_search", "python_repl", "document_retrieval"], "temperature": 0.2},
                status=AgentStatus.ACTIVE,
                rate_limit_per_minute=60,
            )
            session.add(agent)
            await session.commit()
            logger.info("Default AI Agent provisioned.")

    logger.info("Database seeding finished successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
