from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.models.enums import ApplicationStatus


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = (UniqueConstraint("user_id", "vacancy_id", name="uq_application_user_vacancy"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vacancy_id: Mapped[int] = mapped_column(ForeignKey("vacancies.id", ondelete="CASCADE"), index=True)
    status: Mapped[ApplicationStatus] = mapped_column(Enum(ApplicationStatus, name="application_status"), nullable=False)
    source: Mapped[str | None] = mapped_column(String(300))
    applied_date: Mapped[date | None] = mapped_column(Date)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="applications")
    vacancy = relationship("Vacancy", back_populates="applications")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")
    offer = relationship("Offer", back_populates="application", uselist=False, cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="application", cascade="all, delete-orphan")
