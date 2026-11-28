from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", extra="ignore")

    app_env: str = "development"
    database_url: str = "sqlite:///./data/app.db"
    static_dir: Path | None = None
    app_timezone: str = "Asia/Tokyo"
