from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Application


def list_for_user(db: Session, user_id: int) -> list[Application]:
    return list(
        db.execute(select(Application).where(Application.user_id == user_id).order_by(Application.updated_at.desc())).scalars()
    )


def get_for_user(db: Session, user_id: int, application_id: int) -> Application | None:
    a = db.get(Application, application_id)
    if a is None or a.user_id != user_id:
        return None
    return a


def create(db: Session, user_id: int, data: dict) -> Application:
    a = Application(user_id=user_id, **data)
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


def update(db: Session, application: Application, data: dict) -> Application:
    for k, val in data.items():
        setattr(application, k, val)
    db.commit()
    db.refresh(application)
    return application


def delete(db: Session, application: Application) -> None:
    db.delete(application)
    db.commit()
