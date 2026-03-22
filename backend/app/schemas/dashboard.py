from datetime import datetime

from pydantic import BaseModel

from app.schemas.interview import InterviewRead
from app.schemas.note import NoteRead
from app.schemas.offer import OfferRead


class ConversionRates(BaseModel):
    applications_to_interviews: float
    interviews_to_offers: float
    applications_to_offers: float


class DashboardSummary(BaseModel):
    vacancies_count: int
    applications_count: int
    interviews_count: int
    offers_count: int
    rejections_count: int
    conversion: ConversionRates
    upcoming_interviews: list[InterviewRead]
    active_offers: list[OfferRead]
    recent_notes: list[NoteRead]
