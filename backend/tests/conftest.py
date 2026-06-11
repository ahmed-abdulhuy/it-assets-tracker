import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.database import get_db, engine
from app.main import app


@pytest.fixture
def session():

    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(session):

    def get_test_session():
        return session

    app.dependency_overrides[
        get_db
    ] = get_test_session

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()