from sqlalchemy.orm import Session

from app.repositories import application_repo, interview_repo
from app.schemas.interview import InterviewCreate, InterviewUpdate
from app.utils.exceptions import NotFoundError


def _ensure_application_owned(db: Session, user_id: int, application_id: int) -> None:
    if application_repo.get_for_user(db, user_id, application_id) is None:
        raise NotFoundError("Application not found")


def list_interviews(db: Session, user_id: int):
    return interview_repo.list_for_user(db, user_id)


def get_interview(db: Session, user_id: int, interview_id: int):
    i = interview_repo.get_for_user(db, user_id, interview_id)
    if i is None:
        raise NotFoundError("Interview not found")
    return i


def create_interview(db: Session, user_id: int, body: InterviewCreate):
    _ensure_application_owned(db, user_id, body.application_id)
    data = body.model_dump()
    return interview_repo.create(db, user_id, data)


def update_interview(db: Session, user_id: int, interview_id: int, body: InterviewUpdate):
    i = get_interview(db, user_id, interview_id)
    data = body.model_dump(exclude_unset=True)
    if data.get("application_id") is None:
        data.pop("application_id", None)
    if "application_id" in data and data["application_id"] is not None:
        _ensure_application_owned(db, user_id, data["application_id"])
    return interview_repo.update(db, i, data)


def delete_interview(db: Session, user_id: int, interview_id: int) -> None:
    i = get_interview(db, user_id, interview_id)
    interview_repo.delete(db, i)
