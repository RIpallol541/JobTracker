from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserId
from app.db.session import get_db
from app.repositories import user_repo
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    token = auth_service.register(db, body)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    token = auth_service.login(db, body)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserPublic)
def me(user_id: CurrentUserId, db: Session = Depends(get_db)):
    user = user_repo.get_by_id(db, user_id)
    assert user is not None
    return UserPublic.model_validate(user)
