from __future__ import annotations

import asyncio
import getpass

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.security import hash_password


async def create_admin() -> None:
    email = input("Admin email: ").strip().lower()
    full_name = input("Admin full name: ").strip()
    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if not email or not full_name or not password:
        raise SystemExit("Email, name, and password are required")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters")
    if password != confirm_password:
        raise SystemExit("Passwords do not match")

    async with AsyncSessionLocal() as session:
        existing = await session.execute(select(User).where(User.email == email))
        if existing.scalar_one_or_none() is not None:
            raise SystemExit("A user with this email already exists")

        user = User(
            email=email,
            full_name=full_name,
            password_hash=hash_password(password),
            role=UserRole.admin,
            is_active=True,
        )
        session.add(user)
        await session.commit()

    print("Admin user created")


if __name__ == "__main__":
    if hasattr(asyncio, "SelectorEventLoop"):
        asyncio.run(create_admin(), loop_factory=asyncio.SelectorEventLoop)
    else:
        asyncio.run(create_admin())