from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import text

from app.config import Settings
from app.db import build_engine, init_db


class HealthResponse(BaseModel):
    status: Literal["ok"]


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        engine = build_engine(resolved_settings.database_url)
        init_db(engine)
        app.state.engine = engine
        yield
        engine.dispose()

    app = FastAPI(title="Happiness Spiral API", lifespan=lifespan)

    @app.get("/api/health", response_model=HealthResponse, operation_id="getHealth")
    def get_health(request: Request) -> HealthResponse:
        with request.app.state.engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return HealthResponse(status="ok")

    if resolved_settings.static_dir:
        app.mount("/", StaticFiles(directory=resolved_settings.static_dir, html=True), name="web")

    return app


app = create_app()
