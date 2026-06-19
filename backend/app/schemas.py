"""Pydantic request/response schemas."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ---------- Habit ----------
class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    target_frequency: str = Field("daily")


class HabitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    target_frequency: str
    created_at: datetime


# ---------- HabitLog ----------
class HabitLogCreate(BaseModel):
    note: str | None = None
    # Optional explicit timestamp; defaults to now() on the server.
    logged_at: datetime | None = None


class HabitLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    habit_id: int
    logged_at: datetime
    note: str | None


# ---------- Stats ----------
class HabitStats(BaseModel):
    """Per-habit stats (single habit selected in the dashboard)."""
    habit_id: int
    habit_name: str
    current_streak: int
    longest_streak: int
    completion_rate_30d: float  # 0.0 - 1.0
    heatmap: dict[str, int]  # "YYYY-MM-DD" -> count


class OverallStats(BaseModel):
    """Aggregate /stats payload returned by the API."""
    habit_count: int
    total_logs: int
    current_streak: int  # days all habits were logged
    longest_streak: int
    completion_rate_30d: float  # fraction of habit-days completed in last 30 days
    heatmap: dict[str, int]  # daily log counts across all habits, past year
    habits: list[HabitStats]
