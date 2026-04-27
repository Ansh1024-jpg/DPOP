from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.schemas.flag import FlagResponse


class ApplicationResponse(BaseModel):
    id: int
    applicant_id: int
    applicant_name: str = ""
    status: str
    risk_level: str | None = None
    ai_summary: str | None = None
    escalation_reason: str | None = None
    escalation_remarks: str | None = None
    final_decision: str | None = None
    decision_remarks: str | None = None
    submitted_at: datetime | None = None
    updated_at: datetime | None = None
    policy_manager_id: int | None = None
    manager_id: int | None = None
    # Personal
    full_name: str | None = None
    date_of_birth: str | None = None
    pan_number: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    # Occupation
    occupation: str | None = None
    employer_name: str | None = None
    annual_income: float | None = None
    employment_type: str | None = None
    # Health
    pre_existing_conditions: str | None = None
    smoker: bool | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    # Insurance
    coverage_amount: float | None = None
    policy_term: int | None = None
    premium_payment_mode: str | None = None
    # Nominee
    nominee_name: str | None = None
    nominee_relation: str | None = None
    nominee_dob: str | None = None
    document_path: str | None = None
    flags: list[FlagResponse] = []


class ApplicationSummary(BaseModel):
    id: int
    applicant_id: int
    applicant_name: str
    status: str
    risk_level: str | None
    submitted_at: datetime | None


class CorrectionsRequest(BaseModel):
    # Personal
    full_name: str | None = None
    date_of_birth: str | None = None
    pan_number: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    # Occupation
    occupation: str | None = None
    employer_name: str | None = None
    annual_income: float | None = None
    employment_type: str | None = None
    # Health
    pre_existing_conditions: str | None = None
    smoker: bool | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    # Insurance
    coverage_amount: float | None = None
    policy_term: int | None = None
    premium_payment_mode: str | None = None
    # Nominee
    nominee_name: str | None = None
    nominee_relation: str | None = None
    nominee_dob: str | None = None


class ApproveRequest(BaseModel):
    remarks: str | None = None


class RejectRequest(BaseModel):
    remarks: str


class EscalateRequest(BaseModel):
    escalation_reason: str
    escalation_remarks: str
