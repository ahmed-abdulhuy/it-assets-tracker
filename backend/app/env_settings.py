from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    PGAdMIN_EMAIL: str
    PGAdMIN_PASSWORD: str
    POSTGRES_HOST:str
    POSTGRES_PORT:str


ENV_VARS = Settings()
