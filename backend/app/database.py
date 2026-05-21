from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine
from app.env_settings import ENV_VARS


DATABASE_URL = (
    f"postgresql+psycopg2://{ENV_VARS.POSTGRES_USER}:{ENV_VARS.POSTGRES_PASSWORD}"
    f"@{ENV_VARS.POSTGRES_HOST}:{ENV_VARS.POSTGRES_PORT}"
    f"/{ENV_VARS.POSTGRES_DB}" 
)

# Create an database engine
print("Creating engine with DATABASE_URL:", DATABASE_URL)
engine = create_engine(DATABASE_URL, echo=True)
print("Engine created successfully.", engine)

SessionLocal = sessionmaker(engine, autocommit=False, autoflush=False)

# Initialize database tables based on SQLModel definitions
def initDB():
    SQLModel.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


def getDB():
    """Dependency to get database session"""
    with SessionLocal() as session:
        yield session
