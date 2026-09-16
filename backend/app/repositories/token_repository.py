import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.refresh_token import RefreshToken


class TokenRepository:
    async def create_token(
        self,
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at: datetime,
        device_info: str = "web"
    ) -> RefreshToken:
        token_obj = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            device_info=device_info,
            revoked=False,
        )
        db.add(token_obj)
        await db.flush()
        await db.refresh(token_obj)
        return token_obj

    async def get_valid_token(
        self, db: AsyncSession, *, token_hash: str
    ) -> Optional[RefreshToken]:
        now = datetime.now(timezone.utc)
        query = select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked.is_(False),
            RefreshToken.expires_at > now,
        )
        result = await db.execute(query)
        return result.scalars().first()

    async def revoke_token(self, db: AsyncSession, *, token_hash: str) -> bool:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.token_hash == token_hash)
            .values(revoked=True)
        )
        result = await db.execute(stmt)
        await db.flush()
        return result.rowcount > 0

    async def revoke_all_for_user(self, db: AsyncSession, *, user_id: uuid.UUID) -> int:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.user_id == user_id, RefreshToken.revoked.is_(False))
            .values(revoked=True)
        )
        result = await db.execute(stmt)
        await db.flush()
        return result.rowcount


token_repository = TokenRepository()
