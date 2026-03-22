from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class NoteBase(BaseModel):
    title: str = Field(max_length=500)
    text: str | None = None
    vacancy_id: int | None = None
    application_id: int | None = None
    interview_id: int | None = None

    @model_validator(mode="after")
    def check_single_scope(self):
        scopes = [self.vacancy_id, self.application_id, self.interview_id]
        set_count = sum(1 for s in scopes if s is not None)
        if set_count > 1:
            raise ValueError("Only one of vacancy_id, application_id, interview_id may be set")
        return self


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    text: str | None = None
    vacancy_id: int | None = None
    application_id: int | None = None
    interview_id: int | None = None

    @model_validator(mode="after")
    def check_single_scope(self):
        if self.vacancy_id is None and self.application_id is None and self.interview_id is None:
            return self
        scopes = [self.vacancy_id, self.application_id, self.interview_id]
        set_count = sum(1 for s in scopes if s is not None)
        if set_count > 1:
            raise ValueError("Only one of vacancy_id, application_id, interview_id may be set")
        return self


class NoteRead(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
