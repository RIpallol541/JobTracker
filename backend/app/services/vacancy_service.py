from sqlalchemy.orm import Session

from app.repositories import vacancy_repo
from app.schemas.vacancy import VacancyCreate, VacancyUpdate
from app.utils.exceptions import NotFoundError


def list_vacancies(db: Session, user_id: int):
    return vacancy_repo.list_for_user(db, user_id)


def get_vacancy(db: Session, user_id: int, vacancy_id: int):
    v = vacancy_repo.get_for_user(db, user_id, vacancy_id)
    if v is None:
        raise NotFoundError("Vacancy not found")
    return v


def create_vacancy(db: Session, user_id: int, body: VacancyCreate):
    data = body.model_dump()
    return vacancy_repo.create(db, user_id, data)


def update_vacancy(db: Session, user_id: int, vacancy_id: int, body: VacancyUpdate):
    v = get_vacancy(db, user_id, vacancy_id)
    data = body.model_dump(exclude_unset=True)
    return vacancy_repo.update(db, v, data)


def delete_vacancy(db: Session, user_id: int, vacancy_id: int) -> None:
    v = get_vacancy(db, user_id, vacancy_id)
    vacancy_repo.delete(db, v)
