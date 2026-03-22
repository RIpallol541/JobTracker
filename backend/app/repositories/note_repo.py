from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Note


def list_for_user(db: Session, user_id: int) -> list[Note]:
    return list(db.execute(select(Note).where(Note.user_id == user_id).order_by(Note.updated_at.desc())).scalars())


def get_for_user(db: Session, user_id: int, note_id: int) -> Note | None:
    n = db.get(Note, note_id)
    if n is None or n.user_id != user_id:
        return None
    return n


def create(db: Session, user_id: int, data: dict) -> Note:
    n = Note(user_id=user_id, **data)
    db.add(n)
    db.commit()
    db.refresh(n)
    return n


def update(db: Session, note: Note, data: dict) -> Note:
    for k, val in data.items():
        setattr(note, k, val)
    db.commit()
    db.refresh(note)
    return note


def delete(db: Session, note: Note) -> None:
    db.delete(note)
    db.commit()
