from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from .config import settings
from .database import Base, SessionLocal, engine
from .models import User
from .routers import auth, dashboards, incidents, media, repairs, reports, verification


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    if settings.AUTO_SEED:
        with SessionLocal() as db:
            if db.scalars(select(User).limit(1)).first() is None:
                from .seed import seed
                seed(db)
            else:
                from .seed import refresh_demo_images
                refresh_demo_images(db)
    yield


app = FastAPI(title="StreetPulse API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

for r in (auth, media, reports, incidents, verification, repairs, dashboards):
    app.include_router(r.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "cloudinary": settings.cloudinary_enabled, "ai": settings.cloudinary_enabled}
