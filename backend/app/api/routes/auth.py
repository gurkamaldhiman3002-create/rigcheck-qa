from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.auth import AuthMeResponse, LoginRequest
from app.schemas.user import UserOut
from app.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    AUTH_COOKIE_NAME,
    COOKIE_SECURE,
    create_access_token,
    get_current_user,
    get_user_by_email,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", status_code=status.HTTP_200_OK)
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    user = await get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive")

    token = create_access_token(user.id)
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return {"message": "Login successful"}


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response) -> dict[str, str]:
    response.delete_cookie(key=AUTH_COOKIE_NAME, path="/")
    return {"message": "Logout successful"}


@router.get("/me", response_model=AuthMeResponse)
async def me(current_user: User = Depends(get_current_user)) -> AuthMeResponse:
    return AuthMeResponse(user=UserOut.model_validate(current_user))