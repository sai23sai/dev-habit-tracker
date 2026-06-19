"""Pure functions for computing streaks, completion rates, and heatmap data.

All functions operate on plain Python datatypes so they're easy to test and
reuse. Date math is done on naive `date` objects (we only care about calendar
days, so timezone details are irrelevant here).
"""
from __future__ import annotations

from datetime import date, datetime, timedelta


def _to_date(value: datetime | date) -> date:
    return value.date() if isinstance(value, datetime) else value


def logged_day_set(logged_at_values) -> set[date]:
    """Collapse a list of logged_at datetimes/dates into a set of calendar days."""
    return {_to_date(v) for v in logged_at_values}


def current_streak(logged_days: set[date], today: date | None = None) -> int:
    """Consecutive days with a log, counting back from today.

    Today is counted if present. If today has no log yet we still allow the
    streak to be "alive" from yesterday — i.e. we start counting from yesterday
    in that case. If neither today nor yesterday has a log, the streak is 0.
    """
    today = today or date.today()
    if not logged_days:
        return 0

    cursor = today
    if today not in logged_days:
        # Give the user the rest of the day: a streak ending yesterday counts.
        yesterday = today - timedelta(days=1)
        if yesterday not in logged_days:
            return 0
        cursor = yesterday

    streak = 0
    while cursor in logged_days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def longest_streak(logged_days: set[date]) -> int:
    """Longest run of consecutive logged days, anywhere in history."""
    if not logged_days:
        return 0

    best = 1
    run = 1
    for prev, cur in _pairwise_sorted(logged_days):
        if cur - prev == timedelta(days=1):
            run += 1
            best = max(best, run)
        else:
            run = 1
    return best


def _pairwise_sorted(days: set[date]):
    sorted_days = sorted(days)
    for i in range(1, len(sorted_days)):
        yield sorted_days[i - 1], sorted_days[i]


def completion_rate(logged_days: set[date], days: int = 30, today: date | None = None) -> float:
    """Fraction of the last `days` calendar days that have a log (0.0 - 1.0)."""
    if days <= 0:
        return 0.0
    today = today or date.today()
    window = {today - timedelta(days=i) for i in range(days)}
    if not window:
        return 0.0
    return len(logged_days & window) / len(window)


def heatmap_counts(
    logged_at_values,
    days: int = 365,
    today: date | None = None,
) -> dict[str, int]:
    """Map each day in the trailing `days` window to its log count.

    Returns a dict keyed by ISO date strings ("YYYY-MM-DD"). Days with zero logs
    are included with a value of 0 so the frontend grid renders continuously.
    """
    today = today or date.today()
    start = today - timedelta(days=days - 1)

    counts: dict[str, date] = {}
    result: dict[str, int] = {}
    cursor = start
    while cursor <= today:
        key = cursor.isoformat()
        result[key] = 0
        cursor += timedelta(days=1)

    for v in logged_at_values:
        d = _to_date(v)
        if start <= d <= today:
            result[d.isoformat()] = result.get(d.isoformat(), 0) + 1

    return result


def last_n_days(n: int, today: date | None = None) -> list[date]:
    """Return a list of the last `n` days, oldest first."""
    today = today or date.today()
    return [today - timedelta(days=n - 1 - i) for i in range(n)]
