from decimal import Decimal

from sqlalchemy.orm import Session

from app.db.models.enums import RemoteFormat
from app.repositories import offer_repo
from app.schemas.comparison import ComparisonWeights, CriterionBreakdown, OfferComparisonResponse, OfferScoreRow


def _normalize(values: list[float]) -> list[float]:
    if not values:
        return []
    min_v = min(values)
    max_v = max(values)
    if max_v == min_v:
        return [1.0 for _ in values]
    return [(v - min_v) / (max_v - min_v) for v in values]


def _remote_score(rf: RemoteFormat | None) -> float:
    if rf is None:
        return 0.0
    if rf == RemoteFormat.remote:
        return 1.0
    if rf == RemoteFormat.hybrid:
        return 0.5
    return 0.0


def _bonus_score(bonus: Decimal | None) -> float:
    if bonus is None:
        return 0.0
    return 1.0 if bonus > 0 else 0.0


def _insurance_score(insurance: bool | None) -> float:
    return 1.0 if insurance else 0.0


def _relocation_score(reloc: bool | None) -> float:
    return 1.0 if reloc else 0.0


def compare_offers(db: Session, user_id: int, weights: ComparisonWeights | None = None) -> OfferComparisonResponse:
    w = weights or ComparisonWeights()
    offers = offer_repo.list_for_user_ordered_by_id(db, user_id)
    if not offers:
        return OfferComparisonResponse(weights=w, rows=[])

    salaries: list[float] = []
    for o in offers:
        s = o.salary
        salaries.append(float(s) if s is not None else 0.0)

    vacations: list[float] = []
    for o in offers:
        vd = o.vacation_days
        vacations.append(float(vd) if vd is not None else 0.0)

    salary_norm = _normalize(salaries)
    vacation_norm = _normalize(vacations)

    rows: list[OfferScoreRow] = []
    for idx, o in enumerate(offers):
        app = o.application
        vacancy = app.vacancy if app is not None else None
        company = vacancy.company if vacancy is not None else ""
        title = vacancy.title if vacancy is not None else ""

        salary_score = salary_norm[idx]
        bonus_score = _bonus_score(o.bonus)
        remote_score = _remote_score(o.remote_format)
        vacation_score = vacation_norm[idx]
        insurance_score = _insurance_score(o.insurance)
        relocation_score = _relocation_score(o.relocation_support)

        total = (
            salary_score * w.weight_salary
            + bonus_score * w.weight_bonus
            + remote_score * w.weight_remote
            + vacation_score * w.weight_vacation
            + insurance_score * w.weight_insurance
            + relocation_score * w.weight_relocation
        )

        breakdown = CriterionBreakdown(
            salary_score=salary_score,
            bonus_score=bonus_score,
            remote_score=remote_score,
            vacation_score=vacation_score,
            insurance_score=insurance_score,
            relocation_score=relocation_score,
        )
        rows.append(
            OfferScoreRow(
                offer_id=o.id,
                company=company,
                vacancy_title=title,
                score=round(total, 6),
                breakdown=breakdown,
            )
        )

    return OfferComparisonResponse(weights=w, rows=rows)
