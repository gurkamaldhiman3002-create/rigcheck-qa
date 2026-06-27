from __future__ import annotations

import asyncio
import os

from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.security import hash_password


def _is_enabled() -> bool:
    return os.getenv("BOOTSTRAP_ADMIN_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


async def run_bootstrap_admin() -> None:
    if not _is_enabled():
        return

    email = _required_env("BOOTSTRAP_ADMIN_EMAIL").lower()
    full_name = _required_env("BOOTSTRAP_ADMIN_NAME")
    password = _required_env("BOOTSTRAP_ADMIN_PASSWORD")

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user is None:
            user = User(
                email=email,
                full_name=full_name,
                password_hash=hash_password(password),
                role=UserRole.admin,
                is_active=True,
            )
            session.add(user)
        else:
            user.full_name = full_name
            user.password_hash = hash_password(password)
            user.role = UserRole.admin
            user.is_active = True
            session.add(user)

        await session.commit()

    print("ADMIN_BOOTSTRAP_OK")


def main() -> None:
    if hasattr(asyncio, "SelectorEventLoop"):
        asyncio.run(run_bootstrap_admin(), loop_factory=asyncio.SelectorEventLoop)
    else:
        asyncio.run(run_bootstrap_admin())


if __name__ == "__main__":
    main()
