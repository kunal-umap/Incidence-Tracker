import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.repositories.base import BaseRepository
from app.schemas.user import UserCreate, UserUpdate


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        query = select(User).where(User.email == email.lower().strip())
        result = await db.execute(query)
        return result.scalars().first()

    async def update_role(
        self, db: AsyncSession, *, user_id: uuid.UUID, role: UserRole
    ) -> Optional[User]:
        user = await self.get(db, user_id)
        if user:
            user.role = role
            db.add(user)
            await db.flush()
            await db.refresh(user)
        return user


user_repository = UserRepository()
