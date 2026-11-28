import datetime as dt
from typing import Literal

from sqlalchemy import DateTime, Dialect, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from app.db import Base

CycleStatus = Literal["active", "completed"]
Verdict = Literal["supported", "not_supported", "inconclusive"]


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.UTC)


class UTCDateTime(TypeDecorator[dt.datetime]):
    """UTC で保存し、読み出し時にタイムゾーン付きの UTC に戻す(SQLite は tz を保持しないため)。"""

    impl = DateTime
    cache_ok = True

    def process_bind_param(self, value: dt.datetime | None, dialect: Dialect) -> dt.datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            raise ValueError("naive datetime is not allowed")
        return value.astimezone(dt.UTC).replace(tzinfo=None)

    def process_result_value(
        self, value: dt.datetime | None, dialect: Dialect
    ) -> dt.datetime | None:
        if value is None:
            return None
        return value.replace(tzinfo=dt.UTC)


class Cycle(Base):
    __tablename__ = "cycles"

    id: Mapped[int] = mapped_column(primary_key=True)
    hypothesis: Mapped[str] = mapped_column(String(200))
    method: Mapped[str] = mapped_column(String(1000))
    start_date: Mapped[dt.date]
    end_date: Mapped[dt.date]
    status: Mapped[CycleStatus] = mapped_column(String(20), default="active")
    verdict: Mapped[Verdict | None] = mapped_column(String(20), default=None)
    learnings: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[dt.datetime] = mapped_column(UTCDateTime, default=utc_now)
    completed_at: Mapped[dt.datetime | None] = mapped_column(UTCDateTime, default=None)

    entries: Mapped[list["Entry"]] = relationship(
        back_populates="cycle",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Entry.date",
    )


class Entry(Base):
    __tablename__ = "entries"
    __table_args__ = (UniqueConstraint("cycle_id", "date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    cycle_id: Mapped[int] = mapped_column(ForeignKey("cycles.id", ondelete="CASCADE"), index=True)
    date: Mapped[dt.date]
    practiced: Mapped[bool]
    happiness: Mapped[int]
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[dt.datetime] = mapped_column(UTCDateTime, default=utc_now)
    updated_at: Mapped[dt.datetime] = mapped_column(UTCDateTime, default=utc_now, onupdate=utc_now)

    cycle: Mapped[Cycle] = relationship(back_populates="entries")
