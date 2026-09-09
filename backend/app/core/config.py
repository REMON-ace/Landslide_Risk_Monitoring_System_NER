from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@localhost:5432/landslide_db"
    jwt_secret_key: str = "dev-secret-key-change-in-production-abc123xyz"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 480
    upload_dir: str = "uploads"
    base_url: str = "http://localhost:8000"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_from_number: str = ""
    app_env: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
