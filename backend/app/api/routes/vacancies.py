from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserId
from app.db.session import get_db
from app.schemas.vacancy import VacancyCreate, VacancyRead, VacancyUpdate
from app.services import vacancy_service

router = APIRouter(prefix="/vacancies", tags=["vacancies"])


@router.get("", response_model=list[VacancyRead])
def list_vacancies(user_id: CurrentUserId, db: Session = Depends(get_db)):
    return vacancy_service.list_vacancies(db, user_id)


@router.get("/{vacancy_id}", response_model=VacancyRead)
def get_vacancy(vacancy_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return vacancy_service.get_vacancy(db, user_id, vacancy_id)


@router.post("", response_model=VacancyRead)
def create_vacancy(body: VacancyCreate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return vacancy_service.create_vacancy(db, user_id, body)


@router.put("/{vacancy_id}", response_model=VacancyRead)
def update_vacancy(vacancy_id: int, body: VacancyUpdate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return vacancy_service.update_vacancy(db, user_id, vacancy_id, body)


@router.delete("/{vacancy_id}", status_code=204)
def delete_vacancy(vacancy_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    vacancy_service.delete_vacancy(db, user_id, vacancy_id)
