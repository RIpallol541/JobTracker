from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserId
from app.db.session import get_db
from app.schemas.dashboard import DashboardSummary
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def summary(user_id: CurrentUserId, db: Session = Depends(get_db)):
    return dashboard_service.build_summary(db, user_id)
