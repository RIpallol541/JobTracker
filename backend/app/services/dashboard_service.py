from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Application, ApplicationStatus, Interview, Note, Offer, OfferStatus, Vacancy
from app.schemas.dashboard import ConversionRates, DashboardSummary
from app.schemas.interview import InterviewRead
from app.schemas.note import NoteRead
from app.schemas.offer import OfferRead


def build_summary(db: Session, user_id: int) -> DashboardSummary:
    vacancies_count = db.execute(select(func.count()).select_from(Vacancy).where(Vacancy.user_id == user_id)).scalar() or 0
    applications_count = (
        db.execute(select(func.count()).select_from(Application).where(Application.user_id == user_id)).scalar() or 0
    )
    interviews_count = db.execute(select(func.count()).select_from(Interview).where(Interview.user_id == user_id)).scalar() or 0
    offers_count = db.execute(select(func.count()).select_from(Offer).where(Offer.user_id == user_id)).scalar() or 0
    rejections_count = (
        db.execute(
            select(func.count())
            .select_from(Application)
            .where(Application.user_id == user_id, Application.status == ApplicationStatus.rejected)
        ).scalar()
        or 0
    )

    now = datetime.now(timezone.utc)
    upcoming = list(
        db.execute(
            select(Interview)
            .where(Interview.user_id == user_id, Interview.scheduled_at >= now)
            .order_by(Interview.scheduled_at.asc())
            .limit(5)
        ).scalars()
    )

    active_offers = list(
        db.execute(
            select(Offer)
            .where(Offer.user_id == user_id, Offer.status == OfferStatus.active)
            .order_by(Offer.created_at.desc())
            .limit(5)
        ).scalars()
    )

    recent_notes = list(
        db.execute(select(Note).where(Note.user_id == user_id).order_by(Note.updated_at.desc()).limit(5)).scalars()
    )

    apps = applications_count or 0
    ints = interviews_count or 0
    offs = offers_count or 0

    def safe_div(a: float, b: float) -> float:
        if b == 0:
            return 0.0
        return round(a / b, 4)

    conversion = ConversionRates(
        applications_to_interviews=safe_div(ints, apps),
        interviews_to_offers=safe_div(offs, ints) if ints else 0.0,
        applications_to_offers=safe_div(offs, apps),
    )

    return DashboardSummary(
        vacancies_count=int(vacancies_count),
        applications_count=int(applications_count),
        interviews_count=int(interviews_count),
        offers_count=int(offers_count),
        rejections_count=int(rejections_count),
        conversion=conversion,
        upcoming_interviews=[InterviewRead.model_validate(x) for x in upcoming],
        active_offers=[OfferRead.model_validate(x) for x in active_offers],
        recent_notes=[NoteRead.model_validate(x) for x in recent_notes],
    )
