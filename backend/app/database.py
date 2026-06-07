from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine
from app.env_settings import ENV_VARS


def get_database_url():
    return (
        f"postgresql+psycopg2://"
        f"{ENV_VARS.POSTGRES_USER}:"
        f"{ENV_VARS.POSTGRES_PASSWORD}@"
        f"{ENV_VARS.POSTGRES_HOST}:"
        f"{ENV_VARS.POSTGRES_PORT}/"
        f"{ENV_VARS.POSTGRES_DB}"
    )


DATABASE_URL = get_database_url()

# Create an database engine
print("Creating engine with DATABASE_URL:", DATABASE_URL)
engine = create_engine(DATABASE_URL, echo=True)
print("Engine created successfully.", engine)

SessionLocal = sessionmaker(engine, autocommit=False, autoflush=False)


def get_db():
    """Dependency to get database session"""
    with SessionLocal() as session:
        yield session
