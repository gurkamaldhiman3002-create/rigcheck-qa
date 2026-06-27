from __future__ import annotations

import os
from pathlib import Path
from typing import AsyncIterator
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase


PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(ENV_PATH, override=False)


def _load_database_env() -> tuple[str, str, str, str, str]:
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


DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT = _load_database_env()


def build_database_url(db_name: str | None = None, *, host: str | None = None, port: str | None = None) -> str:
    resolved_db_name = db_name or DB_NAME
    resolved_host = host or DB_HOST
    resolved_port = port or DB_PORT
    return (
        "postgresql+psycopg://"
        f"{quote_plus(DB_USER)}:{quote_plus(DB_PASSWORD)}@{resolved_host}:{resolved_port}/{resolved_db_name}"
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
