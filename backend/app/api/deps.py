import uuid
from typing import Callable, List, Optional
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import (
    AuthenticationError,
    PermissionDeniedError,
    RateLimitExceededError,
)
from app.core.redis import check_rate_limit, is_token_blacklisted
from app.core.security import decode_access_token
from app.models.user import User, UserRole
from app.repositories.user_repository import user_repository

# OAuth2 scheme extracting token from Authorization header: "Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency that decodes the JWT access token, checks the Redis blacklist,
    and loads the active User record from PostgreSQL.
    """
    try:
        payload = decode_access_token(token)
    except Exception as exc:
        raise AuthenticationError(detail=f"Invalid token: {str(exc)}")

    user_id_str: Optional[str] = payload.get("sub")
    if not user_id_str:
        raise AuthenticationError(detail="Token payload missing subject identifier")

    # Check if token JTI or hash is blacklisted in Redis
    token_jti = payload.get("jti") or token[-16:]
    if await is_token_blacklisted(token_jti):
        raise AuthenticationError(detail="Token has been revoked. Please log in again.")

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise AuthenticationError(detail="Malformed user identifier in token")

    user = await user_repository.get(db, id=user_uuid)
    if not user:
        raise AuthenticationError(detail="User belonging to this token no longer exists.")
    if not user.is_active:
        raise AuthenticationError(detail="Inactive user account.")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensures current user is active."""
    if not current_user.is_active:
        raise AuthenticationError(detail="Inactive user")
    return current_user


def require_roles(allowed_roles: List[UserRole]) -> Callable:
    """
    Role-Based Access Control (RBAC) dependency factory.
    Example: Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedError(
                detail=f"Role '{current_user.role.value}' is not authorized to access this resource."
            )
        return current_user

    return role_checker


async def apply_rate_limit(
    request: Request,
    current_user: Optional[User] = None,
) -> None:
    """
    Rate limiting dependency using client IP or authenticated user ID.
    Enforces sliding window threshold via Redis.
    """
    client_key = str(current_user.id) if current_user else request.client.host
    allowed = await check_rate_limit(
        key=client_key,
        limit=settings.RATE_LIMIT_PER_MINUTE,
        window_seconds=60,
    )
    if not allowed:
        raise RateLimitExceededError()
