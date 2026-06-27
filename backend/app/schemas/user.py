from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints

from app.models.user import UserRole

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    full_name: NonEmptyStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = UserRole.technician

    model_config = ConfigDict(extra="forbid")


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)
    role: UserRole | None = None

    model_config = ConfigDict(extra="forbid")


class UserStatusUpdate(BaseModel):
    is_active: bool

    model_config = ConfigDict(extra="forbid")