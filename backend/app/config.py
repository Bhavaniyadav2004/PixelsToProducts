import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env", override=True)


def _db_url() -> str:
    url = os.getenv("DATABASE_URL") or f"sqlite:///{(BASE_DIR / 'streetpulse.db').as_posix()}"
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


class Settings:
    DATABASE_URL = _db_url()
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me-streetpulse-0123456789")
    JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))

    CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

    AI_API_KEY = os.getenv("AI_API_KEY", "")
    AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
    AI_BASE_URL = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")

    GROUPING_RADIUS_METERS = float(os.getenv("GROUPING_RADIUS_METERS", "50"))
    RECURRING_THRESHOLD = int(os.getenv("RECURRING_THRESHOLD", "2"))
    MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "50"))

    CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]
    PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000").rstrip("/")
    UPLOAD_DIR = Path("/tmp/streetpulse-uploads") if os.getenv("VERCEL") else BASE_DIR / "uploads"
    AUTO_INIT_DB = os.getenv("AUTO_INIT_DB", "false" if os.getenv("VERCEL") else "true").lower() == "true"
    AUTO_SEED = os.getenv("AUTO_SEED", "false" if os.getenv("VERCEL") else "true").lower() == "true"

    @property
    def cloudinary_enabled(self) -> bool:
        return bool(self.CLOUDINARY_CLOUD_NAME and self.CLOUDINARY_API_KEY and self.CLOUDINARY_API_SECRET)


settings = Settings()
