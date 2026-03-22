from pydantic import BaseModel, Field

from app.db.models.enums import RemoteFormat


class ComparisonWeights(BaseModel):
    weight_salary: float = Field(default=0.35, ge=0, le=1)
    weight_bonus: float = Field(default=0.1, ge=0, le=1)
    weight_remote: float = Field(default=0.2, ge=0, le=1)
    weight_vacation: float = Field(default=0.1, ge=0, le=1)
    weight_insurance: float = Field(default=0.15, ge=0, le=1)
    weight_relocation: float = Field(default=0.1, ge=0, le=1)


class CriterionBreakdown(BaseModel):
    salary_score: float
    bonus_score: float
    remote_score: float
    vacation_score: float
    insurance_score: float
    relocation_score: float


class OfferScoreRow(BaseModel):
    offer_id: int
    company: str
    vacancy_title: str
    score: float
    breakdown: CriterionBreakdown


class OfferComparisonResponse(BaseModel):
    weights: ComparisonWeights
    rows: list[OfferScoreRow]


class CompareScoreRequest(BaseModel):
    weights: ComparisonWeights | None = None
