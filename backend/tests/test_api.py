import asyncio
import os

import psycopg
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

if os.name == "nt":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

os.environ.setdefault("POSTGRES_DB", "rigcheck_test")
os.environ.setdefault("POSTGRES_USER", os.getenv("POSTGRES_USER", "rigcheck"))
os.environ.setdefault("POSTGRES_PASSWORD", os.getenv("POSTGRES_PASSWORD", "rigcheck_dev_password"))
os.environ.setdefault("POSTGRES_HOST", os.getenv("POSTGRES_HOST", "localhost"))
os.environ.setdefault("POSTGRES_PORT", os.getenv("POSTGRES_PORT", "5432"))

from app.database import Base, build_database_url, get_db
from app.main import app


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


@pytest.fixture()
async def client(monkeypatch):
    test_db_name = os.environ["POSTGRES_DB"]
    _ensure_test_database(test_db_name)

    test_engine = create_async_engine(build_database_url(test_db_name), echo=False)
    TestSessionLocal = async_sessionmaker(bind=test_engine, expire_on_commit=False, autoflush=False, autocommit=False)

    async def init_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def reset_db():
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)

    async def override_get_db():
        async with TestSessionLocal() as session:
            yield session

    await init_db()
    app.dependency_overrides[get_db] = override_get_db

    async def fake_check_database_connection() -> bool:
        return True

    monkeypatch.setattr("app.main.check_database_connection", fake_check_database_connection)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client

    app.dependency_overrides.clear()
    await reset_db()


@pytest.mark.anyio
async def test_health_endpoint(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.anyio
async def test_create_build(client):
    response = await client.post(
        "/api/builds",
        json={
            "serial_number": "SN-001",
            "asset_tag": "ASSET-001",
            "manufacturer": "Corsair",
            "model_name": "Titan X",
            "cpu": "Ryzen 7 7800X3D",
            "gpu": "RTX 4080",
            "ram_gb": 32,
            "storage_gb": 2000,
            "operating_system": "Windows 11",
            "inspection_status": "pending",
            "inspector_name": "Alex",
            "notes": "Initial inspection",
        },
    )
    assert response.status_code == 201
    payload = response.json()
    assert payload["serial_number"] == "SN-001"
    assert payload["inspection_status"] == "pending"


@pytest.mark.anyio
async def test_reject_duplicate_serial_number(client):
    first_response = await client.post(
        "/api/builds",
        json={
            "serial_number": "SN-DUP",
            "manufacturer": "MSI",
            "model_name": "Aegis",
            "cpu": "Intel i7",
            "gpu": "RTX 4070",
            "ram_gb": 16,
            "storage_gb": 1000,
            "inspection_status": "pending",
            "inspector_name": "Dana",
        },
    )
    assert first_response.status_code == 201

    duplicate_response = await client.post(
        "/api/builds",
        json={
            "serial_number": "SN-DUP",
            "manufacturer": "NZXT",
            "model_name": "H1",
            "cpu": "Intel i5",
            "gpu": "RTX 4060",
            "ram_gb": 32,
            "storage_gb": 2000,
            "inspection_status": "pending",
            "inspector_name": "Taylor",
        },
    )
    assert duplicate_response.status_code == 409


@pytest.mark.anyio
async def test_list_and_retrieve_build(client):
    create_response = await client.post(
        "/api/builds",
        json={
            "serial_number": "SN-002",
            "manufacturer": "Dell",
            "model_name": "Alienware",
            "cpu": "Intel i9",
            "gpu": "RTX 4090",
            "ram_gb": 64,
            "storage_gb": 4000,
            "inspection_status": "passed",
            "inspector_name": "Sam",
        },
    )
    build_id = create_response.json()["id"]

    list_response = await client.get("/api/builds")
    assert list_response.status_code == 200
    assert list_response.json()["items"][0]["serial_number"] == "SN-002"

    detail_response = await client.get(f"/api/builds/{build_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["serial_number"] == "SN-002"


@pytest.mark.anyio
async def test_update_build(client):
    create_response = await client.post(
        "/api/builds",
        json={
            "serial_number": "SN-003",
            "manufacturer": "HP",
            "model_name": "Omen",
            "cpu": "Ryzen 5",
            "gpu": "RX 7700 XT",
            "ram_gb": 16,
            "storage_gb": 1000,
            "inspection_status": "pending",
            "inspector_name": "Jamie",
        },
    )
    update_response = await client.patch(
        f"/api/builds/{create_response.json()['id']}",
        json={"inspection_status": "failed", "notes": "Needs rework"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["inspection_status"] == "failed"


@pytest.mark.anyio
async def test_create_defect_and_dashboard_summary(client):
    build_response = await client.post(
        "/api/builds",
        json={
            "serial_number": "SN-004",
            "manufacturer": "Lenovo",
            "model_name": "Legion",
            "cpu": "Intel i7",
            "gpu": "RTX 4070 Ti",
            "ram_gb": 32,
            "storage_gb": 2000,
            "inspection_status": "failed",
            "inspector_name": "Casey",
        },
    )
    build_id = build_response.json()["id"]

    defect_response = await client.post(
        f"/api/builds/{build_id}/defects",
        json={
            "defect_category": "gpu",
            "severity": "high",
            "description": "Artifacting observed",
            "status": "open",
        },
    )
    assert defect_response.status_code == 201

    summary_response = await client.get("/api/dashboard/summary")
    assert summary_response.status_code == 200
    assert summary_response.json()["total_builds"] == 1
    assert summary_response.json()["open_defects"] == 1
    assert summary_response.json()["failed_inspections"] == 1
