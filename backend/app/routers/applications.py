from __future__ import annotations

import json
import os
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.application import Application
from app.models.flag import Flag
from app.models.user import User
from app.schemas.application import (
    ApplicationResponse,
    ApplicationSummary,
    CorrectionsRequest,
)
from app.schemas.flag import FlagResponse
from app.services import ai_service

router = APIRouter()

UPLOAD_DIR = "uploads"

FIELD_KEY_MAP: dict[str, str] = {
    "full_name": "personal.full_name",
    "date_of_birth": "personal.date_of_birth",
    "pan_number": "personal.pan_number",
    "address": "personal.address",
    "phone": "personal.phone",
    "email": "personal.email",
    "occupation": "occupation.occupation",
    "employer_name": "occupation.employer_name",
    "annual_income": "occupation.annual_income",
    "employment_type": "occupation.employment_type",
    "pre_existing_conditions": "health.pre_existing_conditions",
    "smoker": "health.smoker",
    "height_cm": "health.height_cm",
    "weight_kg": "health.weight_kg",
    "coverage_amount": "insurance.coverage_amount",
    "policy_term": "insurance.policy_term",
    "premium_payment_mode": "insurance.premium_payment_mode",
    "nominee_name": "nominee.nominee_name",
    "nominee_relation": "nominee.nominee_relation",
    "nominee_dob": "nominee.nominee_dob",
}


def _get_field(extracted: dict[str, Any], section: str, field: str) -> Any:
    """Try dot-notation key first, fall back to flat key for backward compatibility."""
    dotted = f"{section}.{field}"
    if dotted in extracted:
        return extracted[dotted]
    return extracted.get(field)


def _build_response(app: Application, applicant_name: str) -> ApplicationResponse:
    extracted: dict[str, Any] = json.loads(app.extracted_data) if app.extracted_data else {}

    def g(section: str, field: str) -> Any:
        return _get_field(extracted, section, field)

    return ApplicationResponse(
        id=app.id,
        applicant_id=app.applicant_id,
        applicant_name=applicant_name,
        status=app.status,
        risk_level=app.ai_risk_level,
        ai_summary=app.ai_summary,
        escalation_reason=app.escalation_reason,
        escalation_remarks=app.escalation_remarks,
        final_decision=app.final_decision,
        decision_remarks=app.decision_remarks,
        submitted_at=app.submitted_at,
        updated_at=app.updated_at,
        policy_manager_id=app.policy_manager_id,
        manager_id=app.manager_id,
        full_name=g("personal", "full_name"),
        date_of_birth=g("personal", "date_of_birth"),
        pan_number=g("personal", "pan_number"),
        address=g("personal", "address"),
        phone=g("personal", "phone"),
        email=g("personal", "email"),
        occupation=g("occupation", "occupation"),
        employer_name=g("occupation", "employer_name"),
        annual_income=g("occupation", "annual_income"),
        employment_type=g("occupation", "employment_type"),
        pre_existing_conditions=g("health", "pre_existing_conditions"),
        smoker=g("health", "smoker"),
        height_cm=g("health", "height_cm"),
        weight_kg=g("health", "weight_kg"),
        coverage_amount=g("insurance", "coverage_amount"),
        policy_term=g("insurance", "policy_term"),
        premium_payment_mode=g("insurance", "premium_payment_mode"),
        nominee_name=g("nominee", "nominee_name"),
        nominee_relation=g("nominee", "nominee_relation"),
        nominee_dob=g("nominee", "nominee_dob"),
        document_path=app.pdf_path,
        flags=[FlagResponse.model_validate(f) for f in app.flags],
    )


@router.post("/upload", response_model=ApplicationResponse)
async def upload_application(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role != "applicant":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only applicants can upload"
        )

    existing = (
        db.query(Application)
        .filter(Application.applicant_id == user_id)
        .filter(Application.status.notin_(["approved", "rejected"]))
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Active application #{existing.id} already exists",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "document")[1] or ".pdf"
    filename = f"{user_id}_{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    contents = await file.read()
    with open(filepath, "wb") as fh:
        fh.write(contents)

    extracted = ai_service.extract_fields(contents)
    flags_data = ai_service.validate_fields(extracted)
    summary_data = ai_service.generate_summary(extracted, flags_data)

    app_record = Application(
        applicant_id=user_id,
        status="flagged",
        pdf_path=filepath,
        extracted_data=json.dumps(extracted),
        ai_summary=json.dumps(summary_data),
        ai_risk_level=summary_data["risk_level"],
        updated_at=datetime.utcnow(),
    )
    db.add(app_record)
    db.flush()

    for flag_dict in flags_data:
        db.add(Flag(application_id=app_record.id, **flag_dict))

    db.commit()
    db.refresh(app_record)
    return _build_response(app_record, user.full_name)


@router.get("/mine", response_model=ApplicationResponse)
async def get_my_application(
    user_id: int,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    app_record = (
        db.query(Application)
        .filter(Application.applicant_id == user_id)
        .order_by(Application.id.desc())
        .first()
    )
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No application found")

    return _build_response(app_record, user.full_name)


@router.get("/mine/history", response_model=list[ApplicationSummary])
async def get_my_application_history(
    user_id: int,
    db: Session = Depends(get_db),
) -> list[ApplicationSummary]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.role != "applicant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    apps = (
        db.query(Application)
        .filter(Application.applicant_id == user_id)
        .order_by(Application.id.desc())
        .all()
    )
    return [
        ApplicationSummary(
            id=app.id,
            applicant_id=app.applicant_id,
            applicant_name=user.full_name,
            status=app.status,
            risk_level=app.ai_risk_level,
            submitted_at=app.submitted_at,
        )
        for app in apps
    ]


@router.get("", response_model=list[ApplicationSummary])
async def list_applications(
    user_id: int,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
) -> list[ApplicationSummary]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role not in ("policy_manager", "manager"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    query = db.query(Application, User.full_name).join(
        User, User.id == Application.applicant_id
    )

    if status_filter:
        query = query.filter(Application.status == status_filter)
    elif user.role == "manager":
        query = query.filter(Application.status == "escalated")
    else:
        query = query.filter(
            Application.status.in_(["pending_review", "flagged", "corrections_made"])
        )

    rows = query.order_by(Application.id.desc()).all()
    return [
        ApplicationSummary(
            id=app.id,
            applicant_id=app.applicant_id,
            applicant_name=name,
            status=app.status,
            risk_level=app.ai_risk_level,
            submitted_at=app.submitted_at,
        )
        for app, name in rows
    ]


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: int,
    user_id: int,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if user.role == "applicant" and app_record.applicant_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    applicant = db.query(User).filter(User.id == app_record.applicant_id).first()
    return _build_response(app_record, applicant.full_name if applicant else "Unknown")


@router.get("/{app_id}/pdf", response_class=FileResponse)
async def get_application_pdf(
    app_id: int,
    user_id: int,
    db: Session = Depends(get_db),
) -> FileResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if user.role == "applicant" and app_record.applicant_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not app_record.pdf_path or not os.path.isfile(app_record.pdf_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF not found")

    return FileResponse(
        app_record.pdf_path,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"},
    )


@router.patch("/{app_id}/correct", response_model=ApplicationResponse)
async def correct_application(
    app_id: int,
    user_id: int,
    body: CorrectionsRequest,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "applicant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app_record.applicant_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if app_record.status not in ("flagged", "corrections_made"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application cannot be corrected in its current state",
        )

    existing: dict[str, Any] = (
        json.loads(app_record.extracted_data) if app_record.extracted_data else {}
    )
    updates = {
        FIELD_KEY_MAP.get(k, k): v
        for k, v in body.model_dump().items()
        if v is not None
    }
    merged = {**existing, **updates}

    new_flags = ai_service.validate_fields(merged)
    summary_data = ai_service.generate_summary(merged, new_flags)

    for flag in app_record.flags:
        db.delete(flag)
    db.flush()

    for flag_dict in new_flags:
        db.add(Flag(application_id=app_record.id, **flag_dict))

    app_record.extracted_data = json.dumps(merged)
    app_record.ai_summary = json.dumps(summary_data)
    app_record.ai_risk_level = summary_data["risk_level"]
    app_record.status = "corrections_made"
    app_record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(app_record)
    return _build_response(app_record, user.full_name)


@router.delete("/{app_id}", status_code=status.HTTP_200_OK)
async def delete_application(
    app_id: int,
    user_id: int,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "applicant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app_record.applicant_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if app_record.pdf_path and os.path.isfile(app_record.pdf_path):
        os.remove(app_record.pdf_path)

    for flag in app_record.flags:
        db.delete(flag)
    db.delete(app_record)
    db.commit()
    return {"detail": "Application deleted"}


@router.post("/{app_id}/submit", response_model=ApplicationResponse)
async def submit_application(
    app_id: int,
    user_id: int,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "applicant":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app_record.applicant_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    if app_record.status not in ("flagged", "corrections_made"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application cannot be submitted in its current state",
        )

    unresolved = [f for f in app_record.flags if not f.is_resolved]
    if unresolved:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{len(unresolved)} flag(s) must be resolved before submitting",
        )

    app_record.status = "pending_review"
    app_record.submitted_at = datetime.utcnow()
    app_record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(app_record)
    return _build_response(app_record, user.full_name)
