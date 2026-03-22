from functools import lru_cache
from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Загрузка настроек из переменных окружения и опционально из .env (локальная разработка)."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    database_url: str = Field(
        default="postgresql+psycopg://jobtrack:jobtrack@localhost:5432/jobtrack",
        validation_alias="DATABASE_URL",
    )
    jwt_secret: str = Field(validation_alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost,http://127.0.0.1,http://localhost:80,http://127.0.0.1:80",
        validation_alias="CORS_ORIGINS",
    )
    run_seed: bool = Field(default=False, validation_alias="RUN_SEED")
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")

    @field_validator("run_seed", mode="before")
    @classmethod
    def parse_bool(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if v is None:
            return False
        if isinstance(v, str):
            return v.strip().lower() in ("1", "true", "yes", "on")
        return bool(v)


@lru_cache
def get_settings() -> Settings:
    return Settings()
