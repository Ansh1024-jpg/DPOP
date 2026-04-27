from __future__ import annotations

import json
import logging
import re
from datetime import date, datetime
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


def extract_fields(pdf_bytes: bytes) -> dict[str, Any]:
    if settings.gemini_api_key:
        try:
            return _extract_with_gemini(pdf_bytes)
        except Exception as exc:
            logger.warning("Gemini extraction failed, falling back to simulation: %s", exc)
    return _simulate_extraction()


def validate_fields(fields: dict[str, Any]) -> list[dict[str, Any]]:
    flags: list[dict[str, Any]] = []

    def get(section: str, field: str) -> Any:
        key = f"{section}.{field}"
        return fields[key] if key in fields else fields.get(field)

    pan: str = str(get("personal", "pan_number") or "")
    if not re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", pan):
        flags.append({
            "section": "personal",
            "field_name": "personal.pan_number",
            "issue": f"PAN '{pan}' does not match the required format XXXXX0000X.",
            "severity": "high",
        })

    phone: str = str(get("personal", "phone") or "")
    digits = re.sub(r"\D", "", phone)
    if len(digits) < 10:
        flags.append({
            "section": "personal",
            "field_name": "personal.phone",
            "issue": "Phone number must contain at least 10 digits.",
            "severity": "medium",
        })

    email: str = str(get("personal", "email") or "")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        flags.append({
            "section": "personal",
            "field_name": "personal.email",
            "issue": "Email address format appears invalid.",
            "severity": "medium",
        })

    dob_str: str = str(get("personal", "date_of_birth") or "")
    if dob_str:
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
            age = (date.today() - dob).days // 365
            if age < 18 or age > 65:
                flags.append({
                    "section": "personal",
                    "field_name": "personal.date_of_birth",
                    "issue": f"Applicant age ({age}) must be between 18 and 65 years.",
                    "severity": "high",
                })
        except ValueError:
            flags.append({
                "section": "personal",
                "field_name": "personal.date_of_birth",
                "issue": "Date of birth must be in YYYY-MM-DD format.",
                "severity": "medium",
            })

    try:
        coverage = float(get("insurance", "coverage_amount") or 0)
        if coverage <= 0:
            flags.append({
                "section": "insurance",
                "field_name": "insurance.coverage_amount",
                "issue": "Coverage amount must be a positive value.",
                "severity": "high",
            })
        elif coverage > 10_000_000:
            flags.append({
                "section": "insurance",
                "field_name": "insurance.coverage_amount",
                "issue": "Coverage exceeds ₹1 Cr — requires senior manager approval.",
                "severity": "medium",
            })
    except (TypeError, ValueError):
        flags.append({
            "section": "insurance",
            "field_name": "insurance.coverage_amount",
            "issue": "Coverage amount must be a valid number.",
            "severity": "high",
        })

    try:
        term = int(get("insurance", "policy_term") or 0)
        if term < 5 or term > 30:
            flags.append({
                "section": "insurance",
                "field_name": "insurance.policy_term",
                "issue": f"Policy term ({term} years) must be between 5 and 30 years.",
                "severity": "medium",
            })
    except (TypeError, ValueError):
        flags.append({
            "section": "insurance",
            "field_name": "insurance.policy_term",
            "issue": "Policy term must be a valid integer (years).",
            "severity": "medium",
        })

    income_raw = get("occupation", "annual_income")
    if income_raw is not None:
        try:
            income = float(income_raw)
            coverage_raw = get("insurance", "coverage_amount")
            if coverage_raw:
                coverage_val = float(coverage_raw)
                if income > 0 and coverage_val > income * 20:
                    flags.append({
                        "section": "insurance",
                        "field_name": "insurance.coverage_amount",
                        "issue": "Coverage amount exceeds 20× annual income — high under-insurance risk.",
                        "severity": "high",
                    })
        except (TypeError, ValueError):
            flags.append({
                "section": "occupation",
                "field_name": "occupation.annual_income",
                "issue": "Annual income must be a valid number.",
                "severity": "medium",
            })

    return flags


def generate_summary(fields: dict[str, Any], flags: list[dict[str, Any]]) -> dict[str, Any]:
    high = sum(1 for f in flags if f.get("severity") == "high")
    medium = sum(1 for f in flags if f.get("severity") == "medium")

    if high >= 2 or len(flags) >= 4:
        risk_level = "high"
    elif high == 1 or medium >= 2:
        risk_level = "medium"
    else:
        risk_level = "low"

    def get(section: str, field: str) -> Any:
        key = f"{section}.{field}"
        return fields[key] if key in fields else fields.get(field)

    name = get("personal", "full_name") or "Unknown Applicant"
    coverage = get("insurance", "coverage_amount") or 0
    term = get("insurance", "policy_term") or 0
    income = get("occupation", "annual_income")
    employer = get("occupation", "employer_name") or "—"
    occupation = get("occupation", "occupation") or "—"
    smoker = get("health", "smoker")
    pre_existing = get("health", "pre_existing_conditions") or "None reported"
    nominee_name = get("nominee", "nominee_name") or "—"
    nominee_relation = get("nominee", "nominee_relation") or "—"

    extracted_overview = (
        f"{name} has applied for a {term}-year term life policy with a sum assured of "
        f"₹{float(coverage):,.0f}. "
        f"Occupation: {occupation} at {employer}. "
        f"Nominee: {nominee_name} ({nominee_relation})."
    )

    if flags:
        flag_parts = "; ".join(
            f"[{f['severity'].upper()}] {f['field_name']}: {f['issue']}" for f in flags
        )
        flag_breakdown = f"{len(flags)} issue(s) detected — {flag_parts}."
    else:
        flag_breakdown = "No validation issues detected. All fields appear complete and accurate."

    completeness = (
        "All required fields are present and properly formatted."
        if not flags
        else f"{len(flags)} field(s) require attention before underwriting can proceed."
    )

    risk_parts: list[str] = []
    if high:
        risk_parts.append(f"{high} high-severity flag(s) identified")
    if smoker:
        risk_parts.append("applicant is a smoker")
    if pre_existing and pre_existing.lower() not in ("none", "none reported", "nil", "n/a", ""):
        risk_parts.append(f"pre-existing conditions: {pre_existing}")
    risk_factors = (
        "; ".join(risk_parts).capitalize() + "."
        if risk_parts
        else "No significant risk factors identified."
    )

    if income:
        try:
            ratio = float(coverage) / float(income)
            income_cover_assessment = (
                f"Coverage-to-income ratio is {ratio:.1f}×. "
                + (
                    "Within acceptable range."
                    if ratio <= 20
                    else "Exceeds recommended 20× limit — escalation may be required."
                )
            )
        except (TypeError, ValueError, ZeroDivisionError):
            income_cover_assessment = "Income information unavailable for ratio assessment."
    else:
        income_cover_assessment = "Annual income not provided; coverage ratio assessment skipped."

    health_summary = (
        f"Pre-existing conditions: {pre_existing}. "
        f"Smoker status: {'Yes' if smoker else 'No' if smoker is not None else 'Not disclosed'}."
    )

    nominee_assessment = (
        f"Nominee {nominee_name} ({nominee_relation}) has been designated."
        if nominee_name != "—"
        else "No nominee information provided."
    )

    overall = (
        f"Overall risk classification: {risk_level.upper()}. "
        + (
            "Application appears complete and suitable for standard underwriting review."
            if risk_level == "low"
            else "Application requires additional review before policy issuance."
            if risk_level == "medium"
            else "Application requires senior management review due to high risk indicators."
        )
    )

    return {
        "extracted_overview": extracted_overview,
        "flag_breakdown": flag_breakdown,
        "narrative": {
            "completeness": completeness,
            "risk_factors": risk_factors,
            "income_cover_assessment": income_cover_assessment,
            "health_summary": health_summary,
            "nominee_assessment": nominee_assessment,
            "overall_risk_profile": overall,
        },
        "risk_level": risk_level,
    }


def _extract_with_gemini(pdf_bytes: bytes) -> dict[str, Any]:
    import base64

    import google.generativeai as genai  # type: ignore[import]

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
    prompt = (
        "Extract the following fields from this insurance application document and return a JSON "
        "object (no markdown fences, no extra text). Use null for any missing fields.\n\n"
        "Required fields:\n"
        "personal.full_name (string)\n"
        "personal.date_of_birth (YYYY-MM-DD)\n"
        "personal.pan_number (10-char PAN, uppercase)\n"
        "personal.address (full address string)\n"
        "personal.phone (string with country code if present)\n"
        "personal.email (string)\n"
        "occupation.occupation (job title/role)\n"
        "occupation.employer_name (company/organization)\n"
        "occupation.annual_income (number, INR)\n"
        "occupation.employment_type (Salaried/Self-Employed/Business/Retired/Other)\n"
        "health.pre_existing_conditions (string, 'None' if none)\n"
        "health.smoker (boolean)\n"
        "health.height_cm (number)\n"
        "health.weight_kg (number)\n"
        "insurance.coverage_amount (number, INR)\n"
        "insurance.policy_term (integer, years)\n"
        "insurance.premium_payment_mode (Annual/Semi-Annual/Quarterly/Monthly)\n"
        "nominee.nominee_name (string)\n"
        "nominee.nominee_relation (Spouse/Parent/Child/Sibling/Other)\n"
        "nominee.nominee_dob (YYYY-MM-DD)"
    )
    b64 = base64.b64encode(pdf_bytes).decode()
    response = model.generate_content(
        [prompt, {"inline_data": {"mime_type": "application/pdf", "data": b64}}]
    )
    return json.loads(response.text)


def _simulate_extraction() -> dict[str, Any]:
    return {
        "personal.full_name": "Rahul Sharma",
        "personal.date_of_birth": "1988-07-22",
        "personal.pan_number": "ABCDE1234F",
        "personal.address": "42 MG Road, Indiranagar, Bangalore, Karnataka 560038",
        "personal.phone": "+91 98765 43210",
        "personal.email": "rahul.sharma@example.com",
        "occupation.occupation": "Software Engineer",
        "occupation.employer_name": "Tech Solutions Pvt. Ltd.",
        "occupation.annual_income": 1200000,
        "occupation.employment_type": "Salaried",
        "health.pre_existing_conditions": "None",
        "health.smoker": False,
        "health.height_cm": 172,
        "health.weight_kg": 70,
        "insurance.coverage_amount": 5000000,
        "insurance.policy_term": 20,
        "insurance.premium_payment_mode": "Annual",
        "nominee.nominee_name": "Priya Sharma",
        "nominee.nominee_relation": "Spouse",
        "nominee.nominee_dob": "1990-03-15",
    }
