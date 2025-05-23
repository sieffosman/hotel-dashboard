from sqlmodel import create_engine, Session

# SQLite URL — this creates hotel.db in backend/
SQLITE_URL = "sqlite:///./hotel.db"

# SQLModel engine
engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
)


# Dependency for FastAPI routes
def get_session():
    with Session(engine) as session:
        yield session
