from collections.abc import Iterator
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.routers.cycles import get_today, local_today

TODAY = date(2026, 1, 15)


@pytest.fixture
def client(tmp_path: Path) -> Iterator[TestClient]:
    settings = Settings(database_url=f"sqlite:///{tmp_path / 'test.db'}")
    app = create_app(settings)
    app.dependency_overrides[get_today] = lambda: TODAY
    with TestClient(app) as test_client:
        yield test_client


def days_ago(days: int) -> str:
    return (TODAY - timedelta(days=days)).isoformat()


def cycle_payload(**overrides: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "hypothesis": "ダミー仮説",
        "method": "ダミーの検証方法",
        "start_date": days_ago(3),
        "end_date": days_ago(-10),
    }
    payload.update(overrides)
    return payload


def create_cycle(client: TestClient, **overrides: Any) -> int:
    response = client.post("/api/cycles", json=cycle_payload(**overrides))
    assert response.status_code == 201
    cycle_id: int = response.json()["id"]
    return cycle_id


def entry_payload(**overrides: Any) -> dict[str, Any]:
    payload: dict[str, Any] = {"practiced": True, "happiness": 4, "note": "ダミーメモ"}
    payload.update(overrides)
    return payload


def test_cycle_lifecycle(client: TestClient) -> None:
    response = client.post("/api/cycles", json=cycle_payload())
    assert response.status_code == 201
    created = response.json()
    cycle_id = created["id"]
    assert created["status"] == "active"
    assert created["verdict"] is None
    assert created["entries"] == []
    assert created["stats"] == {
        "recorded_days": 0,
        "practiced_days": 0,
        "avg_happiness_practiced": None,
        "avg_happiness_not_practiced": None,
    }

    listed = client.get("/api/cycles", params={"status": "active"}).json()
    assert [cycle["id"] for cycle in listed] == [cycle_id]
    assert client.get("/api/cycles", params={"status": "completed"}).json() == []

    url = f"/api/cycles/{cycle_id}/entries"
    first = client.put(f"{url}/{days_ago(0)}", json=entry_payload(happiness=2))
    assert first.status_code == 200
    overwritten = client.put(f"{url}/{days_ago(0)}", json=entry_payload(happiness=5))
    assert overwritten.json() == {
        "date": days_ago(0),
        "practiced": True,
        "happiness": 5,
        "note": "ダミーメモ",
    }
    client.put(f"{url}/{days_ago(1)}", json=entry_payload(practiced=False, happiness=2))
    client.put(f"{url}/{days_ago(3)}", json=entry_payload(practiced=False, happiness=3, note=""))

    detail = client.get(f"/api/cycles/{cycle_id}").json()
    assert [entry["date"] for entry in detail["entries"]] == [days_ago(3), days_ago(1), days_ago(0)]
    assert detail["stats"] == {
        "recorded_days": 3,
        "practiced_days": 1,
        "avg_happiness_practiced": 5.0,
        "avg_happiness_not_practiced": 2.5,
    }

    completed = client.post(
        f"/api/cycles/{cycle_id}/complete",
        json={"verdict": "supported", "learnings": "ダミーのわかったこと"},
    )
    assert completed.status_code == 200
    body = completed.json()
    assert body["status"] == "completed"
    assert body["verdict"] == "supported"
    assert body["learnings"] == "ダミーのわかったこと"
    assert body["completed_at"] is not None

    assert client.get("/api/cycles", params={"status": "active"}).json() == []
    completed_list = client.get("/api/cycles", params={"status": "completed"}).json()
    assert [cycle["id"] for cycle in completed_list] == [cycle_id]

    after = client.put(f"{url}/{days_ago(0)}", json=entry_payload())
    assert after.status_code == 409
    again = client.post(
        f"/api/cycles/{cycle_id}/complete",
        json={"verdict": "inconclusive", "learnings": "ダミー"},
    )
    assert again.status_code == 409


def test_list_orders_active_by_start_date_and_completed_by_completion(client: TestClient) -> None:
    older = create_cycle(client, start_date=days_ago(10))
    newer = create_cycle(client, start_date=days_ago(1))
    first_done = create_cycle(client)
    second_done = create_cycle(client)
    for cycle_id in (first_done, second_done):
        response = client.post(
            f"/api/cycles/{cycle_id}/complete",
            json={"verdict": "not_supported", "learnings": "ダミー"},
        )
        assert response.status_code == 200

    active = client.get("/api/cycles", params={"status": "active"}).json()
    assert [cycle["id"] for cycle in active] == [newer, older]
    completed = client.get("/api/cycles", params={"status": "completed"}).json()
    assert [cycle["id"] for cycle in completed] == [second_done, first_done]
    everything = client.get("/api/cycles").json()
    assert [cycle["id"] for cycle in everything] == [newer, older, second_done, first_done]


@pytest.mark.parametrize(
    "overrides",
    [
        {"hypothesis": ""},
        {"hypothesis": "   "},
        {"hypothesis": "あ" * 201},
        {"method": ""},
        {"start_date": days_ago(0), "end_date": days_ago(1)},
    ],
)
def test_create_cycle_rejects_invalid_input(client: TestClient, overrides: dict[str, Any]) -> None:
    response = client.post("/api/cycles", json=cycle_payload(**overrides))
    assert response.status_code == 422


@pytest.mark.parametrize(
    "overrides",
    [{"happiness": 0}, {"happiness": 6}, {"note": "あ" * 2001}],
)
def test_upsert_entry_rejects_invalid_input(client: TestClient, overrides: dict[str, Any]) -> None:
    cycle_id = create_cycle(client)
    response = client.put(
        f"/api/cycles/{cycle_id}/entries/{days_ago(0)}", json=entry_payload(**overrides)
    )
    assert response.status_code == 422


@pytest.mark.parametrize("entry_date", [days_ago(4), days_ago(-1)])
def test_upsert_entry_rejects_date_out_of_range(client: TestClient, entry_date: str) -> None:
    cycle_id = create_cycle(client, start_date=days_ago(3))
    response = client.put(f"/api/cycles/{cycle_id}/entries/{entry_date}", json=entry_payload())
    assert response.status_code == 422


def test_complete_rejects_invalid_input(client: TestClient) -> None:
    cycle_id = create_cycle(client)
    url = f"/api/cycles/{cycle_id}/complete"
    assert client.post(url, json={"verdict": "maybe", "learnings": "ダミー"}).status_code == 422
    assert client.post(url, json={"verdict": "supported", "learnings": ""}).status_code == 422


def test_missing_cycle_returns_404(client: TestClient) -> None:
    assert client.get("/api/cycles/999").status_code == 404
    entry = client.put(f"/api/cycles/999/entries/{days_ago(0)}", json=entry_payload())
    assert entry.status_code == 404
    complete = client.post(
        "/api/cycles/999/complete", json={"verdict": "supported", "learnings": "ダミー"}
    )
    assert complete.status_code == 404


@pytest.mark.parametrize(
    ("now", "expected"),
    [
        (datetime(2026, 1, 1, 14, 59, tzinfo=UTC), date(2026, 1, 1)),
        (datetime(2026, 1, 1, 15, 0, tzinfo=UTC), date(2026, 1, 2)),
    ],
)
def test_local_today_uses_timezone_boundary(now: datetime, expected: date) -> None:
    # 日本時間の 0 時(UTC 15 時)で日付が変わる
    assert local_today("Asia/Tokyo", now) == expected


def test_upsert_entry_follows_injected_today(tmp_path: Path) -> None:
    settings = Settings(database_url=f"sqlite:///{tmp_path / 'test.db'}")
    app = create_app(settings)
    today = {"value": date(2026, 1, 1)}
    app.dependency_overrides[get_today] = lambda: today["value"]

    with TestClient(app) as client:
        cycle_id = create_cycle(client, start_date="2026-01-01", end_date="2026-01-10")
        url = f"/api/cycles/{cycle_id}/entries"
        assert client.put(f"{url}/2026-01-02", json=entry_payload()).status_code == 422
        today["value"] = date(2026, 1, 2)
        assert client.put(f"{url}/2026-01-02", json=entry_payload()).status_code == 200


@pytest.mark.parametrize(
    ("timezone", "expected"), [("Pacific/Kiritimati", 200), ("Etc/GMT+12", 422)]
)
def test_upsert_entry_uses_app_timezone(tmp_path: Path, timezone: str, expected: int) -> None:
    # UTC+14 の今日は、UTC-12 ではいつもまだ未来の日付になる
    kiritimati_today = local_today("Pacific/Kiritimati").isoformat()
    settings = Settings(database_url=f"sqlite:///{tmp_path / 'test.db'}", app_timezone=timezone)

    with TestClient(create_app(settings)) as client:
        cycle_id = create_cycle(client, start_date=kiritimati_today, end_date=kiritimati_today)
        response = client.put(
            f"/api/cycles/{cycle_id}/entries/{kiritimati_today}", json=entry_payload()
        )

    assert response.status_code == expected
