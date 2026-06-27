import pytest


async def _create_build(client, serial_number: str) -> str:
    response = await client.post(
        "/api/builds",
        json={
            "serial_number": serial_number,
            "manufacturer": "Corsair",
            "model_name": "Vengeance",
            "cpu": "Ryzen 7 7800X3D",
            "gpu": "RTX 4070",
            "ram_gb": 32,
            "storage_gb": 1000,
            "inspection_status": "pending",
            "inspector_name": "QA Bot",
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


@pytest.mark.asyncio
async def test_login_success_and_me(unauthenticated_client):
    login_response = await unauthenticated_client.post(
        "/api/auth/login",
        json={"email": "tech@example.com", "password": "tech-pass-123"},
    )
    assert login_response.status_code == 200

    me_response = await unauthenticated_client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["user"]["email"] == "tech@example.com"
    assert me_response.json()["user"]["role"] == "technician"


@pytest.mark.asyncio
async def test_login_invalid_credentials(unauthenticated_client):
    response = await unauthenticated_client.post(
        "/api/auth/login",
        json={"email": "tech@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_rejects_inactive_user(unauthenticated_client):
    response = await unauthenticated_client.post(
        "/api/auth/login",
        json={"email": "inactive@example.com", "password": "inactive-pass-123"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_unauthenticated_request_is_rejected(unauthenticated_client):
    response = await unauthenticated_client.get("/api/builds")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_technician_cannot_delete_build(client):
    build_id = await _create_build(client, "AUTH-TECH-001")
    delete_response = await client.delete(f"/api/builds/{build_id}")
    assert delete_response.status_code == 403


@pytest.mark.asyncio
async def test_supervisor_can_delete_build(supervisor_client):
    build_id = await _create_build(supervisor_client, "AUTH-SUP-001")
    delete_response = await supervisor_client.delete(f"/api/builds/{build_id}")
    assert delete_response.status_code == 204


@pytest.mark.asyncio
async def test_admin_can_create_and_list_users(admin_client):
    create_response = await admin_client.post(
        "/api/users",
        json={
            "email": "new-tech@example.com",
            "full_name": "New Tech",
            "password": "new-tech-pass",
            "role": "technician",
        },
    )
    assert create_response.status_code == 201
    assert create_response.json()["email"] == "new-tech@example.com"

    list_response = await admin_client.get("/api/users")
    assert list_response.status_code == 200
    emails = [user["email"] for user in list_response.json()]
    assert "new-tech@example.com" in emails


@pytest.mark.asyncio
async def test_logout_clears_session(unauthenticated_client):
    login_response = await unauthenticated_client.post(
        "/api/auth/login",
        json={"email": "tech@example.com", "password": "tech-pass-123"},
    )
    assert login_response.status_code == 200

    logout_response = await unauthenticated_client.post("/api/auth/logout")
    assert logout_response.status_code == 200

    me_response = await unauthenticated_client.get("/api/auth/me")
    assert me_response.status_code == 401