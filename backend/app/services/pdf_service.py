from __future__ import annotations

from reportlab.lib import colors  # type: ignore[import]
from reportlab.lib.pagesizes import A4  # type: ignore[import]
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # type: ignore[import]
from reportlab.lib.units import cm  # type: ignore[import]
from reportlab.platypus import (  # type: ignore[import]
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
)


def _base_doc(output_path: str) -> SimpleDocTemplate:
    return SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )


def _styles() -> dict:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "DocTitle",
            parent=base["Title"],
            fontSize=18,
            spaceAfter=6,
            textColor=colors.HexColor("#1E3A5F"),
        ),
        "section": ParagraphStyle(
            "SectionHead",
            parent=base["Heading2"],
            fontSize=13,
            spaceBefore=14,
            spaceAfter=6,
            textColor=colors.HexColor("#1E3A5F"),
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontSize=10,
            spaceAfter=4,
        ),
        "label": ParagraphStyle(
            "Label",
            parent=base["Normal"],
            fontSize=9,
            textColor=colors.HexColor("#6B7280"),
        ),
    }


def _section_table(rows: list[tuple[str, str]], styles: dict) -> Table:
    data = [
        [Paragraph(label, styles["label"]), Paragraph(value, styles["body"])]
        for label, value in rows
    ]
    tbl = Table(data, colWidths=[5.5 * cm, 11 * cm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F9FAFB")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    return tbl


def generate_clean_application_pdf(output_path: str) -> None:
    doc = _base_doc(output_path)
    s = _styles()
    story = [
        Paragraph("InsureTrust — Life Insurance Application", s["title"]),
        Paragraph("Application Form · Clean Submission", s["body"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E5E7EB")),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 1: Personal Information", s["section"]),
        _section_table([
            ("Full Name", "Arjun Mehta"),
            ("Date of Birth", "1985-04-12"),
            ("PAN Number", "ABCPM1234Z"),
            ("Address", "15 Residency Road, Koramangala, Bangalore, Karnataka 560034"),
            ("Phone", "+91 98456 78901"),
            ("Email", "arjun.mehta@gmail.com"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 2: Occupation Details", s["section"]),
        _section_table([
            ("Occupation", "Senior Financial Analyst"),
            ("Employer Name", "Prestige Capital Partners"),
            ("Annual Income (₹)", "1,800,000"),
            ("Employment Type", "Salaried"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 3: Health Information", s["section"]),
        _section_table([
            ("Pre-existing Conditions", "None"),
            ("Smoker", "No"),
            ("Height (cm)", "175"),
            ("Weight (kg)", "72"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 4: Insurance Coverage", s["section"]),
        _section_table([
            ("Coverage Amount (₹)", "8,000,000"),
            ("Policy Term (years)", "25"),
            ("Premium Payment Mode", "Annual"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 5: Nominee Details", s["section"]),
        _section_table([
            ("Nominee Name", "Kavya Mehta"),
            ("Nominee Relation", "Spouse"),
            ("Nominee Date of Birth", "1987-09-22"),
        ], s),
    ]
    doc.build(story)


def generate_missing_fields_pdf(output_path: str) -> None:
    doc = _base_doc(output_path)
    s = _styles()
    story = [
        Paragraph("InsureTrust — Life Insurance Application", s["title"]),
        Paragraph("Application Form · Incomplete Submission", s["body"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E5E7EB")),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 1: Personal Information", s["section"]),
        _section_table([
            ("Full Name", "Sneha Patil"),
            ("Date of Birth", ""),
            ("PAN Number", ""),
            ("Address", "C-12 Shivaji Nagar, Pune"),
            ("Phone", ""),
            ("Email", "sneha.patilgmail"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 2: Occupation Details", s["section"]),
        _section_table([
            ("Occupation", "Teacher"),
            ("Employer Name", ""),
            ("Annual Income (₹)", ""),
            ("Employment Type", ""),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 3: Health Information", s["section"]),
        _section_table([
            ("Pre-existing Conditions", ""),
            ("Smoker", ""),
            ("Height (cm)", ""),
            ("Weight (kg)", ""),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 4: Insurance Coverage", s["section"]),
        _section_table([
            ("Coverage Amount (₹)", "500000"),
            ("Policy Term (years)", "3"),
            ("Premium Payment Mode", ""),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 5: Nominee Details", s["section"]),
        _section_table([
            ("Nominee Name", ""),
            ("Nominee Relation", ""),
            ("Nominee Date of Birth", ""),
        ], s),
    ]
    doc.build(story)


def generate_logical_errors_pdf(output_path: str) -> None:
    doc = _base_doc(output_path)
    s = _styles()
    story = [
        Paragraph("InsureTrust — Life Insurance Application", s["title"]),
        Paragraph("Application Form · Logical Errors", s["body"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E5E7EB")),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 1: Personal Information", s["section"]),
        _section_table([
            ("Full Name", "Vikram Singh"),
            ("Date of Birth", "1960-02-14"),
            ("PAN Number", "ABCDE12345"),
            ("Address", "Plot 7, Sector 22, Noida, UP"),
            ("Phone", "99123"),
            ("Email", "vikram.singh@"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 2: Occupation Details", s["section"]),
        _section_table([
            ("Occupation", "Retired"),
            ("Employer Name", "N/A"),
            ("Annual Income (₹)", "240000"),
            ("Employment Type", "Retired"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 3: Health Information", s["section"]),
        _section_table([
            ("Pre-existing Conditions", "Hypertension"),
            ("Smoker", "Yes"),
            ("Height (cm)", "168"),
            ("Weight (kg)", "85"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 4: Insurance Coverage", s["section"]),
        _section_table([
            ("Coverage Amount (₹)", "5000000"),
            ("Policy Term (years)", "40"),
            ("Premium Payment Mode", "Annual"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 5: Nominee Details", s["section"]),
        _section_table([
            ("Nominee Name", "Meena Singh"),
            ("Nominee Relation", "Spouse"),
            ("Nominee Date of Birth", "1962-11-30"),
        ], s),
    ]
    doc.build(story)


def generate_high_risk_profile_pdf(output_path: str) -> None:
    doc = _base_doc(output_path)
    s = _styles()
    story = [
        Paragraph("InsureTrust — Life Insurance Application", s["title"]),
        Paragraph("Application Form · High Risk Profile", s["body"]),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E5E7EB")),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 1: Personal Information", s["section"]),
        _section_table([
            ("Full Name", "Deepak Verma"),
            ("Date of Birth", "1979-11-05"),
            ("PAN Number", "DKPVR5678X"),
            ("Address", "12A Industrial Estate, Surat, Gujarat 395010"),
            ("Phone", "+91 90001 23456"),
            ("Email", "deepak.verma@business.in"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 2: Occupation Details", s["section"]),
        _section_table([
            ("Occupation", "Entrepreneur"),
            ("Employer Name", "Verma Chemicals Ltd."),
            ("Annual Income (₹)", "600000"),
            ("Employment Type", "Business"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 3: Health Information", s["section"]),
        _section_table([
            ("Pre-existing Conditions", "Type 2 Diabetes, Hypertension"),
            ("Smoker", "Yes"),
            ("Height (cm)", "165"),
            ("Weight (kg)", "96"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 4: Insurance Coverage", s["section"]),
        _section_table([
            ("Coverage Amount (₹)", "15,000,000"),
            ("Policy Term (years)", "20"),
            ("Premium Payment Mode", "Annual"),
        ], s),
        Spacer(1, 0.3 * cm),
        Paragraph("Section 5: Nominee Details", s["section"]),
        _section_table([
            ("Nominee Name", "Sunita Verma"),
            ("Nominee Relation", "Spouse"),
            ("Nominee Date of Birth", "1981-06-18"),
        ], s),
    ]
    doc.build(story)
