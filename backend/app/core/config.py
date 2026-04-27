from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./policy_onboarding.db"
    gemini_api_key: str = Field(default="")
    gmail_user: str = Field(default="")
    gmail_app_password: str = Field(default="")
    notification_email: str = Field(default="")
    secret_key: str = Field(default="dev_secret_key")

    model_config = {"env_file": ".env"}


settings = Settings()
