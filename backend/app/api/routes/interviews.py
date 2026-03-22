from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserId
from app.db.session import get_db
from app.schemas.interview import InterviewCreate, InterviewRead, InterviewUpdate
from app.services import interview_service

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.get("", response_model=list[InterviewRead])
def list_interviews(user_id: CurrentUserId, db: Session = Depends(get_db)):
    return interview_service.list_interviews(db, user_id)


@router.get("/{interview_id}", response_model=InterviewRead)
def get_interview(interview_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return interview_service.get_interview(db, user_id, interview_id)


@router.post("", response_model=InterviewRead)
def create_interview(body: InterviewCreate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return interview_service.create_interview(db, user_id, body)


@router.put("/{interview_id}", response_model=InterviewRead)
def update_interview(interview_id: int, body: InterviewUpdate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return interview_service.update_interview(db, user_id, interview_id, body)


@router.delete("/{interview_id}", status_code=204)
def delete_interview(interview_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    interview_service.delete_interview(db, user_id, interview_id)
