from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserId
from app.db.session import get_db
from app.schemas.comparison import CompareScoreRequest, OfferComparisonResponse
from app.schemas.offer import OfferCreate, OfferRead, OfferUpdate
from app.services import offer_comparison_service, offer_service

router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("/compare", response_model=OfferComparisonResponse)
def compare_offers(user_id: CurrentUserId, db: Session = Depends(get_db)):
    return offer_comparison_service.compare_offers(db, user_id)


@router.post("/compare-score", response_model=OfferComparisonResponse)
def compare_score(body: CompareScoreRequest, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return offer_comparison_service.compare_offers(db, user_id, body.weights)


@router.get("", response_model=list[OfferRead])
def list_offers(user_id: CurrentUserId, db: Session = Depends(get_db)):
    return offer_service.list_offers(db, user_id)


@router.get("/{offer_id}", response_model=OfferRead)
def get_offer(offer_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return offer_service.get_offer(db, user_id, offer_id)


@router.post("", response_model=OfferRead)
def create_offer(body: OfferCreate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return offer_service.create_offer(db, user_id, body)


@router.put("/{offer_id}", response_model=OfferRead)
def update_offer(offer_id: int, body: OfferUpdate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return offer_service.update_offer(db, user_id, offer_id, body)


@router.delete("/{offer_id}", status_code=204)
def delete_offer(offer_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    offer_service.delete_offer(db, user_id, offer_id)
