from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Vacancy


def list_for_user(db: Session, user_id: int) -> list[Vacancy]:
    return list(db.execute(select(Vacancy).where(Vacancy.user_id == user_id).order_by(Vacancy.created_at.desc())).scalars())


def get_for_user(db: Session, user_id: int, vacancy_id: int) -> Vacancy | None:
    v = db.get(Vacancy, vacancy_id)
    if v is None or v.user_id != user_id:
        return None
    return v


def create(db: Session, user_id: int, data: dict) -> Vacancy:
    v = Vacancy(user_id=user_id, **data)
    db.add(v)
    db.commit()
    db.refresh(v)
    return v


def update(db: Session, vacancy: Vacancy, data: dict) -> Vacancy:
    for k, val in data.items():
        setattr(vacancy, k, val)
    db.commit()
    db.refresh(vacancy)
    return vacancy


def delete(db: Session, vacancy: Vacancy) -> None:
    db.delete(vacancy)
    db.commit()
