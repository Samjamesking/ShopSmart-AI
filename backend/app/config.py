from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "ShopSmart AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "shopsmart_super_secret_jwt_key_2026_antigravity")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite by default for instant zero-dependency launch; easily overridden with PostgreSQL URI
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shopsmart.db")
    
    # Optional Live AI Keys
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)

    class Config:
        case_sensitive = True
        env_file = Path(__file__).resolve().parents[2] / ".env"

settings = Settings()
