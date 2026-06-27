import asyncio
import os

import psycopg
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

os.environ.setdefault("POSTGRES_DB", "rigcheck_test")
os.environ.setdefault("POSTGRES_USER", "rigcheck")
os.environ.setdefault("POSTGRES_PASSWORD", "rigcheck_dev_password")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
os.environ.setdefault("COOKIE_SECURE", "false")

from app.database import Base, build_database_url, get_db
from app.main import app
from app.models.user import User, UserRole
from app.security import hash_password


def _ensure_test_database(db_name: str) -> None:
    conn = psycopg.connect(
        dbname="postgres",
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"],
        host=os.environ["POSTGRES_HOST"],
        port=int(os.environ["POSTGRES_PORT"]),
    )
    conn.autocommit = True
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            if cursor.fetchone() is None:
                cursor.execute(f'CREATE DATABASE "{db_name}"')
    finally:
        conn.close()


async def _seed_users(session_factory: async_sessionmaker) -> None:
    async with session_factory() as session:
        session.add_all(
            [
                User(
                    email="tech@example.com",
                    full_name="Tech User",
                    password_hash=hash_password("tech-pass-123"),
                    role=UserRole.technician,
                    is_active=True,
                ),
                User(
                    email="supervisor@example.com",
                    full_name="Supervisor User",
                    password_hash=hash_password("super-pass-123"),
                    role=UserRole.supervisor,
                    is_active=True,
                ),
                User(
                    email="admin@example.com",
                    full_name="Admin User",
                    password_hash=hash_password("admin-pass-123"),
                    role=UserRole.admin,
                    is_active=True,
                ),
                User(
                    email="inactive@example.com",
                    full_name="Inactive User",
                    password_hash=hash_password("inactive-pass-123"),
                    role=UserRole.technician,
                    is_active=False,
                ),
            ]
        )
        await session.commit()


async def _login(client: AsyncClient, email: str, password: str) -> None:
    response = await client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200


@pytest.fixture()
async def unauthenticated_client(monkeypatch):
    test_db_name = os.environ["POSTGRES_DB"]
    _ensure_test_database(test_db_name)

    test_engine = create_async_engine(build_database_url(test_db_name), echo=False)
    test_session_local = async_sessionmaker(bind=test_engine, expire_on_commit=False, autoflush=False, autocommit=False)

    async def init_db() -> None:
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    async def override_get_db():
        async with test_session_local() as session:
            yield session

    await init_db()
    await _seed_users(test_session_local)
    app.dependency_overrides[get_db] = override_get_db

    async def fake_check_database_connection() -> bool:
        return True

    monkeypatch.setattr("app.main.check_database_connection", fake_check_database_connection)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
async def client(unauthenticated_client: AsyncClient) -> AsyncClient:
    await _login(unauthenticated_client, "tech@example.com", "tech-pass-123")
    return unauthenticated_client


@pytest.fixture()
async def supervisor_client(unauthenticated_client: AsyncClient) -> AsyncClient:
    await _login(unauthenticated_client, "supervisor@example.com", "super-pass-123")
    return unauthenticated_client


@pytest.fixture()
async def admin_client(unauthenticated_client: AsyncClient) -> AsyncClient:
    await _login(unauthenticated_client, "admin@example.com", "admin-pass-123")
    return unauthenticated_client