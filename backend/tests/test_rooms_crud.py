import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session

from app.main import app
from app.database import get_session as get_session_dep

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
)


@pytest.fixture(scope="module")
def client():
    """
    TestClient that uses a fresh in-memory DB, with tables created before any requests
    and dropped after all tests in this module.
    """
    SQLModel.metadata.create_all(test_engine)

    def get_test_session():
        with Session(test_engine) as session:
            yield session

    app.dependency_overrides[get_session_dep] = get_test_session

    with TestClient(app) as c:
        yield c

    SQLModel.metadata.drop_all(test_engine)
    app.dependency_overrides.clear()


def test_get_empty_rooms_list(client):
    response = client.get("/rooms/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_and_get_room(client):
    payload = {
        "name": "Test Room",
        "description": "A test description",
        "capacity": 1,
        "image_url": "",
        "facilities_count": 0,
    }
    create_resp = client.post("/rooms/", json=payload)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["name"] == payload["name"]
    assert "id" in created
    room_id = created["id"]

    get_resp = client.get(f"/rooms/{room_id}")
    assert get_resp.status_code == 200
    fetched = get_resp.json()
    assert fetched["id"] == room_id
    assert fetched["description"] == payload["description"]


def test_delete_room(client):
    payload = {
        "name": "Delete Room",
        "description": "To be deleted",
        "capacity": 2,
        "image_url": "",
        "facilities_count": 0,
    }
    create_resp = client.post("/rooms/", json=payload)
    room_id = create_resp.json()["id"]

    del_resp = client.delete(f"/rooms/{room_id}")
    assert del_resp.status_code == 204

    get_resp = client.get(f"/rooms/{room_id}")
    assert get_resp.status_code == 404
