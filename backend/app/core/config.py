"""Core configuration for the FastAPI backend."""
import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Student Performance Predictor API"
    app_version: str = "1.0.0"
    debug: bool = True

    # Database
    database_url: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Paths
    model_path: str = str(Path(__file__).parent.parent.parent / "ml" / "model.joblib")
    data_path: str = str(Path(__file__).parent.parent.parent / "data" / "student_data.csv")

    # ML
    random_state: int = 42
    test_size: float = 0.2

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
