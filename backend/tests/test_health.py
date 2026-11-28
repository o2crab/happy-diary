from pathlib import Path

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def test_health_creates_database_and_returns_ok(tmp_path: Path) -> None:
    database_path = tmp_path / "nested" / "test.db"
    settings = Settings(database_url=f"sqlite:///{database_path}")

    with TestClient(create_app(settings)) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert database_path.exists()


def test_static_files_do_not_hide_api(tmp_path: Path) -> None:
    static_dir = tmp_path / "static"
    static_dir.mkdir()
    (static_dir / "index.html").write_text("<h1>web</h1>", encoding="utf-8")
    settings = Settings(database_url=f"sqlite:///{tmp_path / 'test.db'}", static_dir=static_dir)

    with TestClient(create_app(settings)) as client:
        page = client.get("/")
        health = client.get("/api/health")

    assert page.text == "<h1>web</h1>"
    assert health.json() == {"status": "ok"}


def test_spa_fallback_serves_index_but_keeps_api_404(tmp_path: Path) -> None:
    static_dir = tmp_path / "static"
    static_dir.mkdir()
    (static_dir / "index.html").write_text("<h1>web</h1>", encoding="utf-8")
    settings = Settings(database_url=f"sqlite:///{tmp_path / 'test.db'}", static_dir=static_dir)

    with TestClient(create_app(settings)) as client:
        page = client.get("/cycles/1")
        api = client.get("/api/unknown")

    assert page.status_code == 200
    assert page.text == "<h1>web</h1>"
    assert api.status_code == 404


def test_spa_fallback_keeps_404_for_missing_static_files(tmp_path: Path) -> None:
    static_dir = tmp_path / "static"
    static_dir.mkdir()
    (static_dir / "index.html").write_text("<h1>web</h1>", encoding="utf-8")
    settings = Settings(database_url=f"sqlite:///{tmp_path / 'test.db'}", static_dir=static_dir)

    with TestClient(create_app(settings)) as client:
        missing = client.get("/assets/missing.js")

    assert missing.status_code == 404
