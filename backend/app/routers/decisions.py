from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.application import Application
from app.models.user import User
from app.routers.applications import _build_response
from app.schemas.application import ApproveRequest, EscalateRequest, ApplicationResponse, RejectRequest
from app.services.email_service import send_decision_email

router = APIRouter()


@router.post("/{app_id}/approve", response_model=ApplicationResponse)
async def approve_application(
    app_id: int,
    user_id: int,
    body: ApproveRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role not in ("policy_manager", "manager"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if user.role == "policy_manager":
        if app_record.status not in ("pending_review", "corrections_made"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Application not ready for review"
            )
        app_record.policy_manager_id = user_id
    else:
        if app_record.status != "escalated":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Only escalated applications can be approved by manager"
            )
        app_record.manager_id = user_id

    app_record.status = "approved"
    app_record.final_decision = "approved"
    app_record.decision_remarks = body.remarks
    app_record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(app_record)

    applicant = db.query(User).filter(User.id == app_record.applicant_id).first()
    if applicant:
        background_tasks.add_task(
            send_decision_email,
            applicant_name=applicant.full_name,
            applicant_email=applicant.email or "",
            application_id=app_record.id,
            decision="approved",
            remarks=body.remarks or "",
        )
    return _build_response(app_record, applicant.full_name if applicant else "Unknown")


@router.post("/{app_id}/reject", response_model=ApplicationResponse)
async def reject_application(
    app_id: int,
    user_id: int,
    body: RejectRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role not in ("policy_manager", "manager"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if user.role == "policy_manager":
        app_record.policy_manager_id = user_id
    else:
        app_record.manager_id = user_id

    app_record.status = "rejected"
    app_record.final_decision = "rejected"
    app_record.decision_remarks = body.remarks
    app_record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(app_record)

    applicant = db.query(User).filter(User.id == app_record.applicant_id).first()
    if applicant:
        background_tasks.add_task(
            send_decision_email,
            applicant_name=applicant.full_name,
            applicant_email=applicant.email or "",
            application_id=app_record.id,
            decision="rejected",
            remarks=body.remarks,
        )
    return _build_response(app_record, applicant.full_name if applicant else "Unknown")


@router.post("/{app_id}/escalate", response_model=ApplicationResponse)
async def escalate_application(
    app_id: int,
    user_id: int,
    body: EscalateRequest,
    db: Session = Depends(get_db),
) -> ApplicationResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != "policy_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only policy managers can escalate"
        )

    app_record = db.query(Application).filter(Application.id == app_id).first()
    if not app_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if app_record.status not in ("pending_review", "corrections_made"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Application not ready for escalation"
        )

    app_record.status = "escalated"
    app_record.policy_manager_id = user_id
    app_record.escalation_reason = body.escalation_reason
    app_record.escalation_remarks = body.escalation_remarks
    app_record.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(app_record)

    applicant = db.query(User).filter(User.id == app_record.applicant_id).first()
    return _build_response(app_record, applicant.full_name if applicant else "Unknown")
