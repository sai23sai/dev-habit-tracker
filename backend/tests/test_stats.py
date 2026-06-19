"""Tests for the pure stats helpers."""
from datetime import date, timedelta

from app.stats import completion_rate, current_streak, heatmap_counts, longest_streak


def _days_from(base: date, offsets: list[int]) -> set[date]:
    return {base - timedelta(days=o) for o in offsets}


def test_current_streak_counts_back_from_today():
    today = date(2026, 6, 19)
    days = _days_from(today, [0, 1, 2, 3])  # today + 3 before
    assert current_streak(days, today) == 4


def test_current_streak_allows_today_missing():
    """If today is empty but yesterday is logged, streak still alive."""
    today = date(2026, 6, 19)
    days = _days_from(today, [1, 2, 3])
    assert current_streak(days, today) == 3


def test_current_streak_broken_when_gap():
    today = date(2026, 6, 19)
    # Logged 5 and 4 days ago only — both outside today+yesterday window.
    days = _days_from(today, [4, 5])
    assert current_streak(days, today) == 0


def test_longest_streak_finds_best_run():
    today = date(2026, 6, 19)
    # Run of 2, gap, run of 4
    days = _days_from(today, [10, 9, 3, 2, 1, 0])
    assert longest_streak(days) == 4


def test_completion_rate_over_window():
    today = date(2026, 6, 19)
    days = _days_from(today, [0, 1, 2])  # 3 of last 30
    assert completion_rate(days, 30, today) == round(3 / 30, 10)


def test_heatmap_includes_zero_days_and_counts():
    today = date(2026, 6, 19)
    # 3-day window for readability
    hm = heatmap_counts([today, today, today - timedelta(days=1)], days=3, today=today)
    assert set(hm) == {(today - timedelta(days=2)).isoformat(),
                       (today - timedelta(days=1)).isoformat(),
                       today.isoformat()}
    assert hm[today.isoformat()] == 2
    assert hm[(today - timedelta(days=1)).isoformat()] == 1
    assert hm[(today - timedelta(days=2)).isoformat()] == 0
