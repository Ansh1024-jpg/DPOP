from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.correction_history import CorrectionHistory
    from app.models.flag import Flag


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    applicant_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="submitted")
    pdf_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    extracted_data: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    ai_risk_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    policy_manager_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    escalation_reason: Mapped[str | None] = mapped_column(String(200), nullable=True)
    escalation_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    manager_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    final_decision: Mapped[str | None] = mapped_column(String(20), nullable=True)
    decision_remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    flags: Mapped[list[Flag]] = relationship(
        "Flag", back_populates="application", cascade="all, delete-orphan"
    )
    corrections: Mapped[list[CorrectionHistory]] = relationship(
        "CorrectionHistory", back_populates="application", cascade="all, delete-orphan"
    )
