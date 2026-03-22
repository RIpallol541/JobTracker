from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUserId
from app.db.session import get_db
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate
from app.services import note_service

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("", response_model=list[NoteRead])
def list_notes(user_id: CurrentUserId, db: Session = Depends(get_db)):
    return note_service.list_notes(db, user_id)


@router.get("/{note_id}", response_model=NoteRead)
def get_note(note_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return note_service.get_note(db, user_id, note_id)


@router.post("", response_model=NoteRead)
def create_note(body: NoteCreate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return note_service.create_note(db, user_id, body)


@router.put("/{note_id}", response_model=NoteRead)
def update_note(note_id: int, body: NoteUpdate, user_id: CurrentUserId, db: Session = Depends(get_db)):
    return note_service.update_note(db, user_id, note_id, body)


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: int, user_id: CurrentUserId, db: Session = Depends(get_db)):
    note_service.delete_note(db, user_id, note_id)
