import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Set environment variables for testing BEFORE loading the app
os.environ['DATABASE_URL'] = "sqlite:///:memory:"
os.environ['JWT_SECRET_KEY'] = "testsecret"
os.environ['TWILIO_ACCOUNT_SID'] = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
os.environ['TWILIO_AUTH_TOKEN'] = "testtoken"
os.environ['TWILIO_PHONE_NUMBER'] = "+15005550006"
os.environ['BASE_URL'] = "http://testserver"
os.environ['CELERY_BROKER_URL'] = "redis://localhost:6379/0"
os.environ['CELERY_RESULT_BACKEND'] = "redis://localhost:6379/0"

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.services import user_service
from app.api.v1.schemas import user as user_schema
from app.db.models import Agent
from app.core.security import get_password_hash

engine = create_engine(
    os.environ['DATABASE_URL'],
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Create a new database session for each test.
    """
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    Create a new TestClient for each test.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]


@pytest.fixture(scope="function")
def admin_auth_headers(client: TestClient, db_session: Session):
    """
    Create an admin user for the test module and return auth headers.
    """
    # Create a dummy admin user for the purpose of creating the test admin user
    dummy_admin = Agent(id_agent=999, nom_agent="Dummy Admin", identifiant="dummy_admin", role="admin", mot_de_passe=get_password_hash("dummy_password"))
    db_session.add(dummy_admin)
    db_session.commit()

    admin_user = user_service.create_user(
        db_session,
        user_schema.UserCreate(
            nom_agent="Admin Test User",
            identifiant="admin_test",
            role="admin",
            password="adminpassword",
            is_active=True,
        ),
        current_admin=dummy_admin
    )

    response = client.post(
        "/auth/login",
        json={"identifiant": "admin_test", "password": "adminpassword"},
    )
    tokens = response.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers
