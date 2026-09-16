from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.common import APIResponse
from app.schemas.user import UserRead
from app.services.auth_service import auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=APIResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register_user(
    register_in: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new user account with email and hashed password.
    Enforces password length, email validity, and uniqueness.
    """
    user = await auth_service.register(db, register_data=register_in)
    return APIResponse[UserRead](
        success=True,
        message="User account created successfully",
        data=UserRead.model_validate(user),
    )


@router.post(
    "/login",
    response_model=APIResponse[TokenResponse],
    summary="Authenticate user and issue JWT token pair",
)
async def login(
    login_in: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate email and password.
    Returns:
    - `access_token`: Short-lived signed JWT for authorization headers.
    - `refresh_token`: Opaque high-entropy token stored hashed in PostgreSQL for rotation.
    """
    user = await auth_service.authenticate(
        db, email=login_in.email, password=login_in.password
    )
    device_info = request.headers.get("user-agent", "unknown")[:250]
    tokens = await auth_service.create_tokens_for_user(
        db, user=user, device_info=device_info
    )
    return APIResponse[TokenResponse](
        success=True,
        message="Authentication successful",
        data=tokens,
    )


@router.post(
    "/refresh",
    response_model=APIResponse[TokenResponse],
    summary="Rotate refresh token and issue new access token",
)
async def refresh_token(
    refresh_in: RefreshTokenRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange a valid refresh token for a new access token and a brand new refresh token.
    The previous refresh token is immediately invalidated in PostgreSQL (Token Rotation).
    """
    device_info = request.headers.get("user-agent", "unknown")[:250]
    new_tokens = await auth_service.rotate_refresh_token(
        db, raw_refresh_token=refresh_in.refresh_token, device_info=device_info
    )
    return APIResponse[TokenResponse](
        success=True,
        message="Token rotated successfully",
        data=new_tokens,
    )


@router.post(
    "/logout",
    response_model=APIResponse[None],
    summary="Revoke refresh token and blacklist access token",
)
async def logout(
    refresh_in: RefreshTokenRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Invalidate active session:
    - Marks the refresh token as revoked in the database.
    - Blacklists user tokens in Redis.
    """
    await auth_service.logout(db, raw_refresh_token=refresh_in.refresh_token)
    return APIResponse[None](
        success=True,
        message="Logged out successfully. Tokens revoked.",
        data=None,
    )


@router.get(
    "/me",
    response_model=APIResponse[UserRead],
    summary="Get current authenticated user profile",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Fetch the authenticated user's profile and permissions."""
    return APIResponse[UserRead](
        success=True,
        message="User profile retrieved",
        data=UserRead.model_validate(current_user),
    )
