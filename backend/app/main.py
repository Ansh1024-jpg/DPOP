from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import app.models  # noqa: F401 — registers all ORM models before create_all
from app.database import Base, SessionLocal, engine
from app.routers.applications import router as applications_router
from app.routers.auth import router as auth_router
from app.routers.decisions import router as decisions_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def _seed_users() -> None:
    from app.models.user import User

    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add_all([
                User(
                    username="applicant",
                    password="pass123",
                    role="applicant",
                    full_name="Rahul Sharma",
                    email="applicant@insure.com",
                ),
                User(
                    username="pm_user",
                    password="pass123",
                    role="policy_manager",
                    full_name="Ananya Iyer",
                    email="pm@insure.com",
                ),
                User(
                    username="manager",
                    password="pass123",
                    role="manager",
                    full_name="Vikram Singh",
                    email="manager@insure.com",
                ),
            ])
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    Base.metadata.create_all(bind=engine)
    _seed_users()
    yield


app = FastAPI(title="Policy Onboarding Platform API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(applications_router, prefix="/api/applications", tags=["applications"])
app.include_router(decisions_router, prefix="/api/applications", tags=["decisions"])
