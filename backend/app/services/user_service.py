import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ResourceNotFoundError
from app.models.user import User, UserRole
from app.repositories.user_repository import user_repository
from app.schemas.user import UserUpdate


class UserService:
    async def get_user_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> User:
        user = await user_repository.get(db, id=user_id)
        if not user:
            raise ResourceNotFoundError(resource="User", identifier=user_id)
        return user

    async def list_users(
        self, db: AsyncSession, skip: int = 0, limit: int = 50
    ) -> List[User]:
        return await user_repository.get_multi(db, skip=skip, limit=limit)

    async def update_profile(
        self, db: AsyncSession, user_id: uuid.UUID, update_data: UserUpdate
    ) -> User:
        user = await self.get_user_by_id(db, user_id)
        updated = await user_repository.update(db, db_obj=user, obj_in=update_data)
        return updated

    async def change_user_role(
        self, db: AsyncSession, user_id: uuid.UUID, new_role: UserRole
    ) -> User:
        user = await user_repository.update_role(db, user_id=user_id, role=new_role)
        if not user:
            raise ResourceNotFoundError(resource="User", identifier=user_id)
        return user


user_service = UserService()
