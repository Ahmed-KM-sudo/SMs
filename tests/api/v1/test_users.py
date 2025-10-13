from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.api.v1.schemas import user as user_schema
from app.services import user_service
from app.db.models import Agent
from app.core.security import get_password_hash

def test_create_user(client: TestClient, admin_auth_headers: dict):
    response = client.post(
        "/admin/users",
        json={
            "nom_agent": "New Agent",
            "identifiant": "new_agent",
            "role": "agent",
            "password": "new_password",
            "is_active": True,
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 200


def test_create_duplicate_user(client: TestClient, admin_auth_headers: dict):
    # First user creation is implicit from the fixture
    response = client.post(
        "/admin/users",
        json={
            "nom_agent": "Admin Test User",
            "identifiant": "admin_test", # This user is created in the fixture
            "role": "admin",
            "password": "adminpassword",
            "is_active": True,
        },
        headers=admin_auth_headers,
    )
    assert response.status_code == 400


def test_read_users(client: TestClient, admin_auth_headers: dict):
    response = client.get("/admin/users", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_read_user(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # The admin user is created by the fixture, let's get its ID
    admin_user = user_service.get_user_by_username(db_session, "admin_test")

    response = client.get(f"/admin/users/{admin_user.id_agent}", headers=admin_auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["identifiant"] == "admin_test"


def test_read_nonexistent_user(client: TestClient, admin_auth_headers: dict):
    response = client.get("/admin/users/99999", headers=admin_auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_update_user(client: TestClient, db_session: Session, admin_auth_headers: dict):
    admin_user = user_service.get_user_by_username(db_session, "admin_test")

    response = client.put(
        f"/admin/users/{admin_user.id_agent}",
        json={"nom_agent": "Updated Admin Name"},
        headers=admin_auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nom_agent"] == "Updated Admin Name"


def test_delete_user(client: TestClient, db_session: Session, admin_auth_headers: dict):
    # Create a user to delete
    user_to_delete = user_service.create_user(
        db_session,
        user_schema.UserCreate(
            nom_agent="User To Delete",
            identifiant="deleteme",
            role="agent",
            password="password",
            is_active=True,
        ),
        current_admin=user_service.get_user_by_username(db_session, "admin_test"),
    )

    response = client.delete(f"/admin/users/{user_to_delete.id_agent}", headers=admin_auth_headers)
    assert response.status_code == 200
    deleted_user = user_service.get_user(db_session, user_to_delete.id_agent)
    assert deleted_user is None