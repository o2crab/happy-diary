import datetime as dt
from collections.abc import Sequence
from statistics import mean
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as http
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_session
from app.models import Cycle, CycleStatus, Entry, utc_now
from app.schemas import (
    CycleComplete,
    CycleCreate,
    CycleDetail,
    CycleStats,
    CycleSummary,
    EntryRead,
    EntryUpsert,
)

router = APIRouter(prefix="/api/cycles", tags=["cycles"])

SessionDep = Annotated[Session, Depends(get_session)]

NOT_FOUND: dict[int | str, dict[str, Any]] = {404: {"description": "サイクルが見つからない"}}
CONFLICT: dict[int | str, dict[str, Any]] = {409: {"description": "サイクルは完了済み"}}


def _average(values: Sequence[int]) -> float | None:
    return float(mean(values)) if values else None


def _stats(entries: Sequence[Entry]) -> CycleStats:
    practiced = [entry.happiness for entry in entries if entry.practiced]
    not_practiced = [entry.happiness for entry in entries if not entry.practiced]
    return CycleStats(
        recorded_days=len(entries),
        practiced_days=len(practiced),
        avg_happiness_practiced=_average(practiced),
        avg_happiness_not_practiced=_average(not_practiced),
    )


def _detail(cycle: Cycle) -> CycleDetail:
    summary = CycleSummary.model_validate(cycle)
    return CycleDetail(
        **summary.model_dump(),
        learnings=cycle.learnings,
        entries=[EntryRead.model_validate(entry) for entry in cycle.entries],
        stats=_stats(cycle.entries),
    )


def _get_cycle(session: Session, cycle_id: int) -> Cycle:
    cycle = session.get(Cycle, cycle_id)
    if cycle is None:
        raise HTTPException(status_code=http.HTTP_404_NOT_FOUND, detail="サイクルが見つかりません")
    return cycle


def _ensure_active(cycle: Cycle) -> None:
    if cycle.status == "completed":
        raise HTTPException(status_code=http.HTTP_409_CONFLICT, detail="サイクルは完了済みです")


@router.get("", response_model=list[CycleSummary], operation_id="listCycles")
def list_cycles(session: SessionDep, status: CycleStatus | None = None) -> list[CycleSummary]:
    active = (
        select(Cycle)
        .where(Cycle.status == "active")
        .order_by(Cycle.start_date.desc(), Cycle.id.desc())
    )
    completed = (
        select(Cycle)
        .where(Cycle.status == "completed")
        .order_by(Cycle.completed_at.desc(), Cycle.id.desc())
    )
    queries = {"active": [active], "completed": [completed], None: [active, completed]}[status]
    return [
        CycleSummary.model_validate(cycle)
        for query in queries
        for cycle in session.scalars(query).all()
    ]


@router.post(
    "",
    response_model=CycleDetail,
    status_code=http.HTTP_201_CREATED,
    operation_id="createCycle",
)
def create_cycle(body: CycleCreate, session: SessionDep) -> CycleDetail:
    cycle = Cycle(
        hypothesis=body.hypothesis,
        method=body.method,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    session.add(cycle)
    session.commit()
    session.refresh(cycle)
    return _detail(cycle)


@router.get("/{cycle_id}", response_model=CycleDetail, operation_id="getCycle", responses=NOT_FOUND)
def get_cycle(cycle_id: int, session: SessionDep) -> CycleDetail:
    return _detail(_get_cycle(session, cycle_id))


@router.put(
    "/{cycle_id}/entries/{entry_date}",
    response_model=EntryRead,
    operation_id="upsertEntry",
    responses={**NOT_FOUND, **CONFLICT},
)
def upsert_entry(
    cycle_id: int, entry_date: dt.date, body: EntryUpsert, session: SessionDep
) -> EntryRead:
    cycle = _get_cycle(session, cycle_id)
    _ensure_active(cycle)
    if not cycle.start_date <= entry_date <= dt.date.today():
        raise HTTPException(
            status_code=http.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="記録できるのは開始日から今日までです",
        )

    entry = session.scalars(
        select(Entry).where(Entry.cycle_id == cycle.id, Entry.date == entry_date)
    ).one_or_none()
    if entry is None:
        entry = Entry(cycle_id=cycle.id, date=entry_date)
        session.add(entry)
    entry.practiced = body.practiced
    entry.happiness = body.happiness
    entry.note = body.note
    session.commit()
    session.refresh(entry)
    return EntryRead.model_validate(entry)


@router.post(
    "/{cycle_id}/complete",
    response_model=CycleDetail,
    operation_id="completeCycle",
    responses={**NOT_FOUND, **CONFLICT},
)
def complete_cycle(cycle_id: int, body: CycleComplete, session: SessionDep) -> CycleDetail:
    cycle = _get_cycle(session, cycle_id)
    _ensure_active(cycle)
    cycle.status = "completed"
    cycle.verdict = body.verdict
    cycle.learnings = body.learnings
    cycle.completed_at = utc_now()
    session.commit()
    session.refresh(cycle)
    return _detail(cycle)
