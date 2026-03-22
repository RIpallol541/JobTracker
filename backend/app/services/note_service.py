from sqlalchemy.orm import Session

from app.repositories import application_repo, interview_repo, note_repo, vacancy_repo
from app.schemas.note import NoteCreate, NoteUpdate
from app.utils.exceptions import NotFoundError


def _validate_scope(db: Session, user_id: int, vacancy_id: int | None, application_id: int | None, interview_id: int | None) -> None:
    if vacancy_id is not None and vacancy_repo.get_for_user(db, user_id, vacancy_id) is None:
        raise NotFoundError("Vacancy not found")
    if application_id is not None and application_repo.get_for_user(db, user_id, application_id) is None:
        raise NotFoundError("Application not found")
    if interview_id is not None and interview_repo.get_for_user(db, user_id, interview_id) is None:
        raise NotFoundError("Interview not found")


def list_notes(db: Session, user_id: int):
    return note_repo.list_for_user(db, user_id)


def get_note(db: Session, user_id: int, note_id: int):
    n = note_repo.get_for_user(db, user_id, note_id)
    if n is None:
        raise NotFoundError("Note not found")
    return n


def create_note(db: Session, user_id: int, body: NoteCreate):
    _validate_scope(db, user_id, body.vacancy_id, body.application_id, body.interview_id)
    data = body.model_dump()
    return note_repo.create(db, user_id, data)


def update_note(db: Session, user_id: int, note_id: int, body: NoteUpdate):
    n = get_note(db, user_id, note_id)
    data = body.model_dump(exclude_unset=True)
    vac = data.get("vacancy_id", n.vacancy_id)
    app = data.get("application_id", n.application_id)
    inv = data.get("interview_id", n.interview_id)
    if "vacancy_id" in data or "application_id" in data or "interview_id" in data:
        _validate_scope(db, user_id, vac, app, inv)
    return note_repo.update(db, n, data)


def delete_note(db: Session, user_id: int, note_id: int) -> None:
    n = get_note(db, user_id, note_id)
    note_repo.delete(db, n)
