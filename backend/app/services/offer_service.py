from sqlalchemy.orm import Session

from app.repositories import application_repo, offer_repo
from app.schemas.offer import OfferCreate, OfferUpdate
from app.utils.exceptions import ConflictError, NotFoundError


def _ensure_application_owned(db: Session, user_id: int, application_id: int) -> None:
    if application_repo.get_for_user(db, user_id, application_id) is None:
        raise NotFoundError("Application not found")


def list_offers(db: Session, user_id: int):
    return offer_repo.list_for_user(db, user_id)


def get_offer(db: Session, user_id: int, offer_id: int):
    o = offer_repo.get_for_user(db, user_id, offer_id)
    if o is None:
        raise NotFoundError("Offer not found")
    return o


def create_offer(db: Session, user_id: int, body: OfferCreate):
    _ensure_application_owned(db, user_id, body.application_id)
    if offer_repo.get_by_application_id(db, user_id, body.application_id):
        raise ConflictError("This application already has an offer")
    data = body.model_dump()
    return offer_repo.create(db, user_id, data)


def update_offer(db: Session, user_id: int, offer_id: int, body: OfferUpdate):
    o = get_offer(db, user_id, offer_id)
    data = body.model_dump(exclude_unset=True)
    if data.get("application_id") is None:
        data.pop("application_id", None)
    if "application_id" in data and data["application_id"] is not None:
        _ensure_application_owned(db, user_id, data["application_id"])
        other = offer_repo.get_by_application_id(db, user_id, data["application_id"])
        if other is not None and other.id != o.id:
            raise ConflictError("This application already has an offer")
    return offer_repo.update(db, o, data)


def delete_offer(db: Session, user_id: int, offer_id: int) -> None:
    o = get_offer(db, user_id, offer_id)
    offer_repo.delete(db, o)
