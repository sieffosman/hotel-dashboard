import os
import shutil
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session

from app.main import app
from app.database import get_session as get_session_dep

# Use an in-memory SQLite database for tests
test_engine = create_engine(
    "sqlite:///:memory:", connect_args={"check_same_thread": False}
)

# Create all tables before any tests run
def setup_module(module):
    SQLModel.metadata.create_all(test_engine)

# Drop all tables after tests complete
def teardown_module(module):
    SQLModel.metadata.drop_all(test_engine)

@pytest.fixture(name="session")
def session_fixture():
    """Create a new database session for a test."""
    with Session(test_engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session):
    """FastAPI test client using the in-memory DB."""
    # Override the dependency to use our test session
    def get_test_session():
        yield session

    app.dependency_overrides[get_session_dep] = get_test_session
    client = TestClient(app)
    yield client
    # Clean up overrides
    app.dependency_overrides.clear()
