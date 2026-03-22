from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.models.enums import OfferStatus, RemoteFormat


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), unique=True)
    salary: Mapped[float | None] = mapped_column(Numeric(14, 2))
    currency: Mapped[str | None] = mapped_column(String(8))
    bonus: Mapped[float | None] = mapped_column(Numeric(14, 2))
    probation_months: Mapped[int | None] = mapped_column(Integer)
    vacation_days: Mapped[int | None] = mapped_column(Integer)
    remote_format: Mapped[RemoteFormat | None] = mapped_column(Enum(RemoteFormat, name="remote_format"))
    schedule: Mapped[str | None] = mapped_column(String(300))
    stack: Mapped[str | None] = mapped_column(Text)
    grade: Mapped[str | None] = mapped_column(String(120))
    location: Mapped[str | None] = mapped_column(String(300))
    relocation_support: Mapped[bool | None] = mapped_column(Boolean)
    insurance: Mapped[bool | None] = mapped_column(Boolean)
    additional_benefits: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    offer_date: Mapped[date | None] = mapped_column(Date)
    deadline_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[OfferStatus] = mapped_column(Enum(OfferStatus, name="offer_status"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="offers")
    application = relationship("Application", back_populates="offer")
