from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, UserStatusUpdate, UserUpdate
from app.security import hash_password, require_roles

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> UserOut:
    user = User(
        email=payload.email.lower().strip(),
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists") from exc

    await db.refresh(user)
    return UserOut.model_validate(user)


@router.get("", response_model=list[UserOut])
async def list_users_endpoint(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> list[UserOut]:
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [UserOut.model_validate(user) for user in result.scalars().all()]


@router.patch("/{user_id}", response_model=UserOut)
async def update_user_endpoint(
    user_id: UUID,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> UserOut:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        user.email = update_data["email"].lower().strip()
    if "full_name" in update_data and update_data["full_name"]:
        user.full_name = update_data["full_name"].strip()
    if "password" in update_data and update_data["password"]:
        user.password_hash = hash_password(update_data["password"])
    if "role" in update_data and update_data["role"]:
        user.role = update_data["role"]

    db.add(user)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists") from exc

    await db.refresh(user)
    return UserOut.model_validate(user)


@router.patch("/{user_id}/status", response_model=UserOut)
async def update_user_status_endpoint(
    user_id: UUID,
    payload: UserStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_roles(UserRole.admin)),
) -> UserOut:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = payload.is_active
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)