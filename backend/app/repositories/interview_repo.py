from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Interview


def list_for_user(db: Session, user_id: int) -> list[Interview]:
    return list(
        db.execute(select(Interview).where(Interview.user_id == user_id).order_by(Interview.scheduled_at.asc())).scalars()
    )


def get_for_user(db: Session, user_id: int, interview_id: int) -> Interview | None:
    i = db.get(Interview, interview_id)
    if i is None or i.user_id != user_id:
        return None
    return i


def create(db: Session, user_id: int, data: dict) -> Interview:
    i = Interview(user_id=user_id, **data)
    db.add(i)
    db.commit()
    db.refresh(i)
    return i


def update(db: Session, interview: Interview, data: dict) -> Interview:
    for k, val in data.items():
        setattr(interview, k, val)
    db.commit()
    db.refresh(interview)
    return interview


def delete(db: Session, interview: Interview) -> None:
    db.delete(interview)
    db.commit()
