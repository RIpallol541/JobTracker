from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.repositories import application_repo, vacancy_repo
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.utils.exceptions import ConflictError, NotFoundError


def _ensure_vacancy_owned(db: Session, user_id: int, vacancy_id: int) -> None:
    if vacancy_repo.get_for_user(db, user_id, vacancy_id) is None:
        raise NotFoundError("Vacancy not found")


def list_applications(db: Session, user_id: int):
    return application_repo.list_for_user(db, user_id)


def get_application(db: Session, user_id: int, application_id: int):
    a = application_repo.get_for_user(db, user_id, application_id)
    if a is None:
        raise NotFoundError("Application not found")
    return a


def create_application(db: Session, user_id: int, body: ApplicationCreate):
    _ensure_vacancy_owned(db, user_id, body.vacancy_id)
    data = body.model_dump()
    try:
        return application_repo.create(db, user_id, data)
    except IntegrityError:
        raise ConflictError("Application for this vacancy already exists")


def update_application(db: Session, user_id: int, application_id: int, body: ApplicationUpdate):
    a = get_application(db, user_id, application_id)
    data = body.model_dump(exclude_unset=True)
    if data.get("vacancy_id") is None:
        data.pop("vacancy_id", None)
    if "vacancy_id" in data and data["vacancy_id"] is not None:
        _ensure_vacancy_owned(db, user_id, data["vacancy_id"])
    try:
        return application_repo.update(db, a, data)
    except IntegrityError:
        raise ConflictError("Application for this vacancy already exists")


def delete_application(db: Session, user_id: int, application_id: int) -> None:
    a = get_application(db, user_id, application_id)
    application_repo.delete(db, a)
