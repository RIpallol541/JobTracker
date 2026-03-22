from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories import user_repo
from app.schemas.auth import LoginRequest, RegisterRequest
from app.utils.exceptions import ConflictError, UnauthorizedError


def register(db: Session, body: RegisterRequest) -> str:
    if user_repo.get_by_email(db, body.email):
        raise ConflictError("Email already registered")
    user = user_repo.create(db, body.email, hash_password(body.password))
    return create_access_token(subject=user.id)


def login(db: Session, body: LoginRequest) -> str:
    user = user_repo.get_by_email(db, body.email)
    if user is None or not verify_password(body.password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")
    return create_access_token(subject=user.id)
