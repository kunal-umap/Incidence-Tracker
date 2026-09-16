from datetime import datetime, timedelta, timezone
from typing import Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.exceptions import AuthenticationError, ConflictError
from app.core.redis import blacklist_token
from app.core.security import (
    create_access_token,
    generate_refresh_token_string,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.user import User, UserRole
from app.repositories.token_repository import token_repository
from app.repositories.user_repository import user_repository
from app.schemas.auth import RegisterRequest, TokenResponse
from app.schemas.user import UserRead


class AuthService:
    async def register(self, db: AsyncSession, register_data: RegisterRequest) -> User:
        """Register a new user after verifying unique email address."""
        existing_user = await user_repository.get_by_email(db, email=register_data.email)
        if existing_user:
            raise ConflictError(detail="An account with this email address already exists.")

        hashed_pw = get_password_hash(register_data.password)
        new_user = await user_repository.create(
            db,
            obj_in={
                "email": register_data.email.lower().strip(),
                "hashed_password": hashed_pw,
                "full_name": register_data.full_name or "",
                "role": UserRole.USER,
                "is_active": True,
                "is_verified": False,
            },
        )
        return new_user

    async def authenticate(
        self, db: AsyncSession, email: str, password: str
    ) -> User:
        """Validate email and password against stored bcrypt hash."""
        user = await user_repository.get_by_email(db, email=email)
        if not user:
            raise AuthenticationError(detail="Incorrect email or password.")
        if not verify_password(password, user.hashed_password):
            raise AuthenticationError(detail="Incorrect email or password.")
        if not user.is_active:
            raise AuthenticationError(detail="Account is currently inactive or suspended.")
        return user

    async def create_tokens_for_user(
        self, db: AsyncSession, user: User, device_info: str = "web"
    ) -> TokenResponse:
        """
        Generate a JWT access token and store a cryptographically hashed
        refresh token in PostgreSQL for strict rotation.
        """
        access_token = create_access_token(
            subject=str(user.id),
            role=user.role.value,
            extra_claims={"email": user.email, "name": user.full_name or ""},
        )

        raw_refresh_token = generate_refresh_token_string()
        token_hash = hash_token(raw_refresh_token)
        refresh_expires = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )

        await token_repository.create_token(
            db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=refresh_expires,
            device_info=device_info,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserRead.model_validate(user),
        )

    async def rotate_refresh_token(
        self, db: AsyncSession, raw_refresh_token: str, device_info: str = "web"
    ) -> TokenResponse:
        """
        Perform strict refresh token rotation:
        1. Find token by hash.
        2. Verify validity and expiration.
        3. Revoke existing token immediately.
        4. Issue fresh access token + new refresh token.
        """
        token_hash = hash_token(raw_refresh_token)
        stored_token = await token_repository.get_valid_token(db, token_hash=token_hash)
        if not stored_token:
            raise AuthenticationError(detail="Invalid, expired, or revoked refresh token.")

        # Revoke the used token to enforce single-use rotation
        await token_repository.revoke_token(db, token_hash=token_hash)

        # Retrieve user
        user = await user_repository.get(db, id=stored_token.user_id)
        if not user or not user.is_active:
            raise AuthenticationError(detail="User account is invalid or deactivated.")

        # Issue fresh pair
        return await self.create_tokens_for_user(db, user, device_info=device_info)

    async def logout(
        self, db: AsyncSession, raw_refresh_token: str, access_token_jti: str = ""
    ) -> None:
        """Revoke refresh token in database and blacklist access token in Redis."""
        token_hash = hash_token(raw_refresh_token)
        await token_repository.revoke_token(db, token_hash=token_hash)

        if access_token_jti:
            # Blacklist for the remaining lifetime of the access token
            await blacklist_token(
                access_token_jti, expires_in_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )


auth_service = AuthService()
