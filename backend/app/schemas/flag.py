from __future__ import annotations

from pydantic import BaseModel


class FlagResponse(BaseModel):
    id: int
    application_id: int
    section: str
    field_name: str
    issue: str
    severity: str
    is_resolved: bool

    model_config = {"from_attributes": True}
