from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserId
from app.db.session import get_db
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationUpdate
from app.services import application_service

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[ApplicationRead])
def list_applications(user_id: CurrentUserId, db: Session = Depends(get_db)):
    return application_service.list_applications(db, user_id)


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(application_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return application_service.get_application(db, user_id, application_id)


@router.post("", response_model=ApplicationRead)
def create_application(body: ApplicationCreate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return application_service.create_application(db, user_id, body)


@router.put("/{application_id}", response_model=ApplicationRead)
def update_application(application_id: int, body: ApplicationUpdate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return application_service.update_application(db, user_id, application_id, body)


@router.delete("/{application_id}", status_code=204)
def delete_application(application_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    application_service.delete_application(db, user_id, application_id)
