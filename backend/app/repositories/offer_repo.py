from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.models import Application, Offer


def list_for_user(db: Session, user_id: int) -> list[Offer]:
    return list(
        db.execute(
            select(Offer)
            .where(Offer.user_id == user_id)
            .options(joinedload(Offer.application).joinedload(Application.vacancy))
            .order_by(Offer.created_at.desc())
        )
        .unique()
        .scalars()
    )


def list_for_user_ordered_by_id(db: Session, user_id: int) -> list[Offer]:
    return list(
        db.execute(
            select(Offer)
            .where(Offer.user_id == user_id)
            .options(joinedload(Offer.application).joinedload(Application.vacancy))
            .order_by(Offer.id.asc())
        )
        .unique()
        .scalars()
    )


def get_for_user(db: Session, user_id: int, offer_id: int) -> Offer | None:
    o = db.get(Offer, offer_id)
    if o is None or o.user_id != user_id:
        return None
    return o


def get_by_application_id(db: Session, user_id: int, application_id: int) -> Offer | None:
    return db.execute(select(Offer).where(Offer.user_id == user_id, Offer.application_id == application_id)).scalar_one_or_none()


def create(db: Session, user_id: int, data: dict) -> Offer:
    o = Offer(user_id=user_id, **data)
    db.add(o)
    db.commit()
    db.refresh(o)
    return o


def update(db: Session, offer: Offer, data: dict) -> Offer:
    for k, val in data.items():
        setattr(offer, k, val)
    db.commit()
    db.refresh(offer)
    return offer


def delete(db: Session, offer: Offer) -> None:
    db.delete(offer)
    db.commit()
