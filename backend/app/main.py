from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import text
from starlette.exceptions import HTTPException
from starlette.responses import Response
from starlette.types import Scope

from app.config import Settings
from app.db import build_engine, init_db
from app.routers import cycles  # モデルも読み込まれ、create_all の対象になる


class HealthResponse(BaseModel):
    status: Literal["ok"]


class SPAStaticFiles(StaticFiles):
    """/api 以外の見つからないパスに index.html を返し、画面側のルーティングに任せる。"""

    async def get_response(self, path: str, scope: Scope) -> Response:
        try:
            return await super().get_response(path, scope)
        except HTTPException as exc:
            if exc.status_code != 404 or path == "api" or path.startswith("api/"):
                raise
            return await super().get_response("index.html", scope)


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved_settings = settings or Settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
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

    app.include_router(cycles.router)

    if resolved_settings.static_dir:
        app.mount(
            "/", SPAStaticFiles(directory=resolved_settings.static_dir, html=True), name="web"
        )

    return app


app = create_app()
