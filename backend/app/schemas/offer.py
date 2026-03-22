from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.db.models.enums import OfferStatus, RemoteFormat


class OfferBase(BaseModel):
    application_id: int
    salary: Decimal | None = None
    currency: str | None = Field(default=None, max_length=8)
    bonus: Decimal | None = None
    probation_months: int | None = None
    vacation_days: int | None = None
    remote_format: RemoteFormat | None = None
    schedule: str | None = Field(default=None, max_length=300)
    stack: str | None = None
    grade: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=300)
    relocation_support: bool | None = None
    insurance: bool | None = None
    additional_benefits: str | None = None
    notes: str | None = None
    offer_date: date | None = None
    deadline_date: date | None = None
    status: OfferStatus


class OfferCreate(OfferBase):
    pass


class OfferUpdate(BaseModel):
    application_id: int | None = None
    salary: Decimal | None = None
    currency: str | None = Field(default=None, max_length=8)
    bonus: Decimal | None = None
    probation_months: int | None = None
    vacation_days: int | None = None
    remote_format: RemoteFormat | None = None
    schedule: str | None = Field(default=None, max_length=300)
    stack: str | None = None
    grade: str | None = Field(default=None, max_length=120)
    location: str | None = Field(default=None, max_length=300)
    relocation_support: bool | None = None
    insurance: bool | None = None
    additional_benefits: str | None = None
    notes: str | None = None
    offer_date: date | None = None
    deadline_date: date | None = None
    status: OfferStatus | None = None


class OfferRead(OfferBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
