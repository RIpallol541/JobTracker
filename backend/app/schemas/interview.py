from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models.enums import InterviewFormat


class InterviewBase(BaseModel):
    application_id: int
    stage: str = Field(max_length=200)
    scheduled_at: datetime
    format: InterviewFormat
    interviewer_name: str | None = Field(default=None, max_length=300)
    result: str | None = None
    notes: str | None = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    application_id: int | None = None
    stage: str | None = Field(default=None, max_length=200)
    scheduled_at: datetime | None = None
    format: InterviewFormat | None = None
    interviewer_name: str | None = Field(default=None, max_length=300)
    result: str | None = None
    notes: str | None = None


class InterviewRead(InterviewBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
