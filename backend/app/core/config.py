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

    sms_enabled: bool = False       ##here before make this true to sending sms on number 
    sms_demo_recipient: str = ""

    app_env: str = "development"
    # Production must fail visibly if the trained model is unavailable.
    # Enable the empirical fallback only for an explicitly configured dev/demo run.
    allow_empirical_fallback: bool = False
    model_version: str = "unversioned"
    google_oauth_client_id: str = ""
    # JSON content of a Firebase service-account key. Keep it backend-only.
    firebase_service_account_json: str = ""

    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # Google Gemini API Key for AI Hazard Classification, Vision Analysis & Chat Assistant
    gemini_api_key: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
