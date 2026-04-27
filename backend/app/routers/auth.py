from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import LoginRequest, UserResponse

router = APIRouter()


@router.post("/login", response_model=UserResponse)
async def login(body: LoginRequest, db: Session = Depends(get_db)) -> UserResponse:
    user = db.query(User).filter(User.username == body.username).first()
    if not user or user.password != body.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return UserResponse(
        user_id=user.id,
        username=user.username,
        role=user.role,
        full_name=user.full_name,
    )


@router.post("/logout")
async def logout() -> dict[str, str]:
    return {"message": "logged out"}
