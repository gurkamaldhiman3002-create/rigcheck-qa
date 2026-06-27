from __future__ import annotations

import os
from pathlib import Path
from typing import AsyncIterator
from urllib.parse import quote_plus, urlparse, urlunparse

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(ENV_PATH, override=False)


def _load_database_env() -> tuple[str, str, str, str, str] | None:
    if os.getenv("DATABASE_URL", "").strip():
        return None

    db_name = os.getenv("POSTGRES_DB", "rigcheck")
    username = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")

    missing = [
        name
        for name, value in {
            "POSTGRES_USER": username,
            "POSTGRES_PASSWORD": password,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required database environment variables: {', '.join(missing)}")

    return db_name, username, password, host, port


_database_env = _load_database_env()


def _normalize_database_url(raw_url: str) -> str:
    # Accept platform URLs like postgres:// and normalize for SQLAlchemy async psycopg.
    parsed = urlparse(raw_url)
    scheme = parsed.scheme.lower()
    if scheme in {"postgres", "postgresql"}:
        return urlunparse(("postgresql+psycopg", parsed.netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))
    if scheme == "postgresql+psycopg":
        return raw_url
    raise RuntimeError(
        "DATABASE_URL must use postgres://, postgresql://, or postgresql+psycopg://"
    )


def build_database_url(db_name: str | None = None, *, host: str | None = None, port: str | None = None) -> str:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if database_url:
        return _normalize_database_url(database_url)

    if _database_env is None:
        raise RuntimeError("DATABASE_URL is not set and local POSTGRES_* configuration is unavailable")

    db_name_env, db_user, db_password, db_host, db_port = _database_env

    resolved_db_name = db_name or db_name_env
    resolved_host = host or db_host
    resolved_port = port or db_port
    return (
        "postgresql+psycopg://"
        f"{quote_plus(db_user)}:{quote_plus(db_password)}@{resolved_host}:{resolved_port}/{resolved_db_name}"
    )


DATABASE_URL = build_database_url()


class Base(DeclarativeBase):
    pass


engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False, autocommit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session


async def check_database_connection() -> bool:
    async with engine.connect() as connection:
        result = await connection.execute(text("SELECT 1"))
        return result.scalar_one() == 1
