"""initial schema

Revision ID: 001_initial
Revises:
Create Date: 2025-03-22

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE work_format AS ENUM ('remote', 'hybrid', 'office')")
    op.execute(
        "CREATE TYPE application_status AS ENUM "
        "('saved', 'applied', 'hr_interview', 'tech_interview', 'test_task', "
        "'final_interview', 'offer', 'rejected', 'accepted')"
    )
    op.execute("CREATE TYPE interview_format AS ENUM ('online', 'offline', 'phone')")
    op.execute("CREATE TYPE offer_status AS ENUM ('active', 'accepted', 'declined', 'expired')")
    op.execute("CREATE TYPE remote_format AS ENUM ('remote', 'hybrid', 'office')")

    work_format = postgresql.ENUM("remote", "hybrid", "office", name="work_format", create_type=False)
    application_status = postgresql.ENUM(
        "saved",
        "applied",
        "hr_interview",
        "tech_interview",
        "test_task",
        "final_interview",
        "offer",
        "rejected",
        "accepted",
        name="application_status",
        create_type=False,
    )
    interview_format = postgresql.ENUM("online", "offline", "phone", name="interview_format", create_type=False)
    offer_status = postgresql.ENUM("active", "accepted", "declined", "expired", name="offer_status", create_type=False)
    remote_format = postgresql.ENUM("remote", "hybrid", "office", name="remote_format", create_type=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "vacancies",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("company", sa.String(length=300), nullable=False),
        sa.Column("link", sa.String(length=2000), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("salary_min", sa.Integer(), nullable=True),
        sa.Column("salary_max", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(length=8), nullable=True),
        sa.Column("location", sa.String(length=300), nullable=True),
        sa.Column("work_format", work_format, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vacancies_user_id"), "vacancies", ["user_id"], unique=False)

    op.create_table(
        "applications",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vacancy_id", sa.Integer(), nullable=False),
        sa.Column("status", application_status, nullable=False),
        sa.Column("source", sa.String(length=300), nullable=True),
        sa.Column("applied_date", sa.Date(), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vacancy_id"], ["vacancies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "vacancy_id", name="uq_application_user_vacancy"),
    )
    op.create_index(op.f("ix_applications_user_id"), "applications", ["user_id"], unique=False)
    op.create_index(op.f("ix_applications_vacancy_id"), "applications", ["vacancy_id"], unique=False)

    op.create_table(
        "interviews",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("application_id", sa.Integer(), nullable=False),
        sa.Column("stage", sa.String(length=200), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("format", interview_format, nullable=False),
        sa.Column("interviewer_name", sa.String(length=300), nullable=True),
        sa.Column("result", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_interviews_user_id"), "interviews", ["user_id"], unique=False)
    op.create_index(op.f("ix_interviews_application_id"), "interviews", ["application_id"], unique=False)

    op.create_table(
        "offers",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("application_id", sa.Integer(), nullable=False),
        sa.Column("salary", sa.Numeric(14, 2), nullable=True),
        sa.Column("currency", sa.String(length=8), nullable=True),
        sa.Column("bonus", sa.Numeric(14, 2), nullable=True),
        sa.Column("probation_months", sa.Integer(), nullable=True),
        sa.Column("vacation_days", sa.Integer(), nullable=True),
        sa.Column("remote_format", remote_format, nullable=True),
        sa.Column("schedule", sa.String(length=300), nullable=True),
        sa.Column("stack", sa.Text(), nullable=True),
        sa.Column("grade", sa.String(length=120), nullable=True),
        sa.Column("location", sa.String(length=300), nullable=True),
        sa.Column("relocation_support", sa.Boolean(), nullable=True),
        sa.Column("insurance", sa.Boolean(), nullable=True),
        sa.Column("additional_benefits", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("offer_date", sa.Date(), nullable=True),
        sa.Column("deadline_date", sa.Date(), nullable=True),
        sa.Column("status", offer_status, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("application_id"),
    )
    op.create_index(op.f("ix_offers_user_id"), "offers", ["user_id"], unique=False)

    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vacancy_id", sa.Integer(), nullable=True),
        sa.Column("application_id", sa.Integer(), nullable=True),
        sa.Column("interview_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["interview_id"], ["interviews.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vacancy_id"], ["vacancies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notes_user_id"), "notes", ["user_id"], unique=False)
    op.create_index(op.f("ix_notes_vacancy_id"), "notes", ["vacancy_id"], unique=False)
    op.create_index(op.f("ix_notes_application_id"), "notes", ["application_id"], unique=False)
    op.create_index(op.f("ix_notes_interview_id"), "notes", ["interview_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notes_interview_id"), table_name="notes")
    op.drop_index(op.f("ix_notes_application_id"), table_name="notes")
    op.drop_index(op.f("ix_notes_vacancy_id"), table_name="notes")
    op.drop_index(op.f("ix_notes_user_id"), table_name="notes")
    op.drop_table("notes")
    op.drop_index(op.f("ix_offers_user_id"), table_name="offers")
    op.drop_table("offers")
    op.drop_index(op.f("ix_interviews_application_id"), table_name="interviews")
    op.drop_index(op.f("ix_interviews_user_id"), table_name="interviews")
    op.drop_table("interviews")
    op.drop_index(op.f("ix_applications_vacancy_id"), table_name="applications")
    op.drop_index(op.f("ix_applications_user_id"), table_name="applications")
    op.drop_table("applications")
    op.drop_index(op.f("ix_vacancies_user_id"), table_name="vacancies")
    op.drop_table("vacancies")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS remote_format")
    op.execute("DROP TYPE IF EXISTS offer_status")
    op.execute("DROP TYPE IF EXISTS interview_format")
    op.execute("DROP TYPE IF EXISTS application_status")
    op.execute("DROP TYPE IF EXISTS work_format")
