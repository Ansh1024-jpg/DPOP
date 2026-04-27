#!/usr/bin/env python3
"""Run once to create the database tables and seed test users."""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Allow running as `python seed.py` from the backend/ directory
sys.path.insert(0, str(Path(__file__).parent))

import app.models  # noqa: F401 — ensure all models are registered
from app.database import Base, SessionLocal, engine
from app.models.user import User
from app.services.pdf_service import (
    generate_clean_application_pdf,
    generate_high_risk_profile_pdf,
    generate_logical_errors_pdf,
    generate_missing_fields_pdf,
)

TEST_PDF_DIR = "test_pdfs"

SEED_USERS = [
    {
        "username": "applicant1",
        "password": "pass123",
        "role": "applicant",
        "full_name": "Rajesh Kumar",
        "email": "rajesh@example.com",
    },
    {
        "username": "applicant2",
        "password": "pass123",
        "role": "applicant",
        "full_name": "Priya Sharma",
        "email": "priya@example.com",
    },
    {
        "username": "applicant3",
        "password": "pass123",
        "role": "applicant",
        "full_name": "Amit Verma",
        "email": "amit@example.com",
    },
    {
        "username": "pmanager1",
        "password": "pmpass123",
        "role": "policy_manager",
        "full_name": "Sunita Rao",
        "email": "sunita@example.com",
    },
    {
        "username": "manager1",
        "password": "mgpass123",
        "role": "manager",
        "full_name": "Vikram Mehta",
        "email": "vikram@example.com",
    },
]


def _generate_test_pdfs() -> None:
    os.makedirs(TEST_PDF_DIR, exist_ok=True)
    specs = [
        (generate_clean_application_pdf, "clean_application.pdf"),
        (generate_missing_fields_pdf, "missing_fields.pdf"),
        (generate_logical_errors_pdf, "logical_errors.pdf"),
        (generate_high_risk_profile_pdf, "high_risk_profile.pdf"),
    ]
    for fn, filename in specs:
        path = os.path.join(TEST_PDF_DIR, filename)
        fn(path)
        print(f"  Generated: {path}")


def main() -> None:
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        created = 0
        for data in SEED_USERS:
            exists = db.query(User).filter(User.username == data["username"]).first()
            if not exists:
                db.add(User(**data))
                created += 1

        db.commit()
        print(f"Seeded {created} new user(s). ({len(SEED_USERS) - created} already existed.)")
    finally:
        db.close()

    print("Generating test PDFs...")
    _generate_test_pdfs()
    print("Done. Run: uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    main()
