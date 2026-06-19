"""API route handlers."""
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import stats as stats_lib
from .database import get_db
from .models import Habit, HabitLog
from .schemas import (
    HabitCreate,
    HabitLogCreate,
    HabitLogOut,
    HabitOut,
    HabitStats,
    OverallStats,
)

router = APIRouter(prefix="/api", tags=["habits"])


@router.post("/habits", response_model=HabitOut, status_code=201)
def create_habit(payload: HabitCreate, db: Session = Depends(get_db)):
    habit = Habit(name=payload.name, target_frequency=payload.target_frequency)
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit


@router.get("/habits", response_model=list[HabitOut])
def list_habits(db: Session = Depends(get_db)):
    return db.scalars(select(Habit).order_by(Habit.created_at)).all()


@router.delete("/habits/{habit_id}", status_code=204)
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()


@router.post("/habits/{habit_id}/log", response_model=HabitLogOut, status_code=201)
def log_habit(
    habit_id: int,
    payload: HabitLogCreate,
    db: Session = Depends(get_db),
):
    habit = db.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    logged_at = payload.logged_at or datetime.utcnow()
    log = HabitLog(habit_id=habit_id, logged_at=logged_at, note=payload.note)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def _habit_logged_days(db: Session, habit_id: int) -> set[date]:
    """Return the set of calendar days that have at least one log for a habit."""
    rows = db.scalars(select(HabitLog.logged_at).where(HabitLog.habit_id == habit_id)).all()
    return stats_lib.logged_day_set(rows)


@router.get("/stats", response_model=OverallStats)
def get_stats(db: Session = Depends(get_db)):
    today = date.today()
    habits = db.scalars(select(Habit).order_by(Habit.id)).all()

    # All logged_at timestamps across the whole DB, for the overall heatmap.
    all_logged: list[datetime] = db.scalars(select(HabitLog.logged_at)).all()

    per_habit: list[HabitStats] = []
    for habit in habits:
        days = _habit_logged_days(db, habit.id)
        per_habit.append(
            HabitStats(
                habit_id=habit.id,
                habit_name=habit.name,
                current_streak=stats_lib.current_streak(days, today),
                longest_streak=stats_lib.longest_streak(days),
                completion_rate_30d=stats_lib.completion_rate(days, 30, today),
                heatmap=stats_lib.heatmap_counts([lg.logged_at for lg in habit.logs], 365, today),
            )
        )

    # Overall streak: treat a day as "done" if at least one habit was logged.
    overall_days = stats_lib.logged_day_set(all_logged)
    overall_completion = (
        stats_lib.completion_rate(overall_days, 30, today) if habits else 0.0
    )

    return OverallStats(
        habit_count=len(habits),
        total_logs=len(all_logged),
        current_streak=stats_lib.current_streak(overall_days, today),
        longest_streak=stats_lib.longest_streak(overall_days),
        completion_rate_30d=overall_completion,
        heatmap=stats_lib.heatmap_counts(all_logged, 365, today),
        habits=per_habit,
    )
