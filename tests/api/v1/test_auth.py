from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.api.v1.schemas import user as user_schema
from app.services import user_service
from app.db.models import Agent
from app.core.security import get_password_hash

def test_login(client: TestClient, db_session: Session):
    # Create a test user in the test database
    password = "testpassword"
    # Create a dummy admin user for the purpose of creating the test user
    dummy_admin = Agent(id_agent=999, nom_agent="Dummy Admin", identifiant="dummy_admin", role="admin", mot_de_passe=get_password_hash("dummy_password"))
    db_session.add(dummy_admin)
    db_session.commit()

    user_service.create_user(
        db_session,
        user_schema.UserCreate(
            nom_agent="Test User",
            identifiant="testuser",
            role="agent",
            password=password,
            is_active=True,
        ),
        current_admin=dummy_admin
    )

    # Test successful login
    response = client.post(
        "/auth/login",
        json={"identifiant": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # Test failed login (wrong password)
    response = client.post(
        "/auth/login",
        json={"identifiant": "testuser", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

    # Test failed login (wrong username)
    response = client.post(
        "/auth/login",
        json={"identifiant": "wronguser", "password": "testpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"
