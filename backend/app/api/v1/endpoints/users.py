import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.user import User, UserRole
from app.schemas.common import APIResponse
from app.schemas.user import UserRead, UserUpdate
from app.services.user_service import user_service

router = APIRouter()


@router.get(
    "/",
    response_model=APIResponse[List[UserRead]],
    summary="List all users (Admin & Super Admin only)",
)
async def list_users(
    skip: int = 0,
    limit: int = 50,
    current_admin: User = Depends(require_roles([UserRole.ADMIN, UserRole.SUPER_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all users across the organization. Protected by RBAC."""
    users = await user_service.list_users(db, skip=skip, limit=limit)
    return APIResponse[List[UserRead]](
        success=True,
        message=f"Retrieved {len(users)} users",
        data=[UserRead.model_validate(u) for u in users],
    )


@router.get(
    "/{user_id}",
    response_model=APIResponse[UserRead],
    summary="Get user by UUID",
)
async def get_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve user details by ID."""
    user = await user_service.get_user_by_id(db, user_id=user_id)
    return APIResponse[UserRead](
        success=True,
        message="User found",
        data=UserRead.model_validate(user),
    )


@router.patch(
    "/{user_id}/role",
    response_model=APIResponse[UserRead],
    summary="Assign user role (Super Admin only)",
)
async def update_user_role(
    user_id: uuid.UUID,
    new_role: UserRole,
    current_admin: User = Depends(require_roles([UserRole.SUPER_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Elevate or modify user permission role. Restricted to Super Admin."""
    updated_user = await user_service.change_user_role(db, user_id=user_id, new_role=new_role)
    return APIResponse[UserRead](
        success=True,
        message=f"User role updated to {new_role.value}",
        data=UserRead.model_validate(updated_user),
    )
