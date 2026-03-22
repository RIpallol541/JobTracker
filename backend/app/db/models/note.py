from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vacancy_id: Mapped[int | None] = mapped_column(ForeignKey("vacancies.id", ondelete="CASCADE"), index=True)
    application_id: Mapped[int | None] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), index=True)
    interview_id: Mapped[int | None] = mapped_column(ForeignKey("interviews.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    text: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="notes")
    vacancy = relationship("Vacancy", back_populates="notes")
    application = relationship("Application", back_populates="notes")
    interview = relationship("Interview", back_populates="notes_rel")
