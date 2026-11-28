import datetime as dt
from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

from app.models import CycleStatus, Verdict

Hypothesis = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
Method = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]
Learnings = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=2000)]
Note = Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)]


class CycleCreate(BaseModel):
    hypothesis: Hypothesis
    method: Method
    start_date: dt.date
    end_date: dt.date

    @model_validator(mode="after")
    def check_period(self) -> Self:
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class EntryUpsert(BaseModel):
    practiced: bool
    happiness: int = Field(ge=1, le=5)
    note: Note = ""


class CycleComplete(BaseModel):
    verdict: Verdict
    learnings: Learnings


class EntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: dt.date
    practiced: bool
    happiness: int
    note: str


class CycleStats(BaseModel):
    recorded_days: int
    practiced_days: int
    avg_happiness_practiced: float | None
    avg_happiness_not_practiced: float | None


class CycleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    hypothesis: str
    method: str
    start_date: dt.date
    end_date: dt.date
    status: CycleStatus
    verdict: Verdict | None
    created_at: dt.datetime
    completed_at: dt.datetime | None


class CycleDetail(CycleSummary):
    learnings: str | None
    entries: list[EntryRead]
    stats: CycleStats
