from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_decision_email(
    applicant_name: str,
    applicant_email: str,
    application_id: int,
    decision: str,
    remarks: str,
) -> None:
    if not settings.gmail_user or not settings.gmail_app_password:
        logger.warning("Email credentials not configured — skipping notification for app #%d", application_id)
        return

    to_email = "anshks1024@gmail.com"

    is_approved = decision == "approved"
    subject = (
        f"Policy Application #{application_id} — {'Approved ✓' if is_approved else 'Decision Update'}"
    )

    status_color = "#16a34a" if is_approved else "#dc2626"
    status_bg = "#f0fdf4" if is_approved else "#fef2f2"
    status_label = "APPROVED" if is_approved else "REJECTED"
    status_icon = "✓" if is_approved else "✕"

    remarks_block = (
        f"<tr><td style='padding:12px 24px;'>"
        f"<p style='margin:0;font-size:14px;color:#374151;'><strong>Remarks:</strong><br>"
        f"{remarks}</p></td></tr>"
        if remarks
        else ""
    )

    next_steps = (
        "Your policy will be issued and documents sent within 3–5 business days. "
        "Please ensure your premium payment is up to date."
        if is_approved
        else "You may contact our support team to understand this decision or to explore alternative products."
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:#1E3A5F;padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">InsureTrust</p>
            <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">Policy Onboarding Platform</p>
          </td>
        </tr>
        <!-- Status badge -->
        <tr>
          <td style="padding:32px 32px 16px;">
            <div style="background:{status_bg};border:2px solid {status_color};border-radius:8px;padding:16px 20px;display:inline-block;">
              <p style="margin:0;color:{status_color};font-size:20px;font-weight:700;">{status_icon} Application {status_label}</p>
              <p style="margin:4px 0 0;color:{status_color};font-size:13px;opacity:0.8;">Application #{application_id}</p>
            </div>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:8px 32px 16px;">
          <p style="margin:0;font-size:15px;color:#374151;">Dear <strong>{applicant_name}</strong>,</p>
          <p style="margin:12px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
            {"We are pleased to inform you that your life insurance application has been reviewed and approved by our underwriting team." if is_approved else "Thank you for submitting your application. After careful review, we are unable to approve it at this time."}
          </p>
        </td></tr>
        {remarks_block}
        <!-- Next steps -->
        <tr><td style="padding:0 32px 24px;">
          <div style="background:#f9fafb;border-left:4px solid #1E3A5F;padding:12px 16px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:13px;color:#374151;"><strong>Next Steps</strong></p>
            <p style="margin:6px 0 0;font-size:13px;color:#6b7280;line-height:1.6;">{next_steps}</p>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated message from InsureTrust. Please do not reply to this email.</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">© 2025 InsureTrust. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.gmail_user
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(settings.gmail_user, settings.gmail_app_password)
            smtp.sendmail(settings.gmail_user, to_email, msg.as_string())
        logger.info("Decision email sent to %s for app #%d", to_email, application_id)
    except Exception as exc:
        logger.error("Failed to send email for app #%d: %s", application_id, exc)
