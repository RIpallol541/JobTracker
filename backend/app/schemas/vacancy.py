from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models.enums import WorkFormat


class VacancyBase(BaseModel):
    title: str = Field(max_length=500)
    company: str = Field(max_length=300)
    link: str | None = Field(default=None, max_length=2000)
    description: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str | None = Field(default=None, max_length=8)
    location: str | None = Field(default=None, max_length=300)
    work_format: WorkFormat


class VacancyCreate(VacancyBase):
    pass


class VacancyUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    company: str | None = Field(default=None, max_length=300)
    link: str | None = Field(default=None, max_length=2000)
    description: str | None = None
    salary_min: int | None = None
    salary_max: int | None = None
    currency: str | None = Field(default=None, max_length=8)
    location: str | None = Field(default=None, max_length=300)
    work_format: WorkFormat | None = None


class VacancyRead(VacancyBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
