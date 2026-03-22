from datetime import date, datetime

from pydantic import BaseModel, Field

from app.db.models.enums import ApplicationStatus


class ApplicationBase(BaseModel):
    vacancy_id: int
    status: ApplicationStatus
    source: str | None = Field(default=None, max_length=300)
    applied_date: date | None = None
    comment: str | None = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    vacancy_id: int | None = None
    status: ApplicationStatus | None = None
    source: str | None = Field(default=None, max_length=300)
    applied_date: date | None = None
    comment: str | None = None


class ApplicationRead(ApplicationBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
