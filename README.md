Dev Habit Tracker

A habit tracker for developers. Track daily and weekly habits, build streaks, and see a year of activity on a GitHub-style contribution heatmap.

No auth. Single user. Backend is Python + FastAPI, frontend is React + Vite + Tailwind CSS.

---

## ✨ Features

- REST API for creating habits, logging activity, and pulling aggregated stats
- SQLite + SQLAlchemy ORM with no extra configuration
- Stats engine: current streak 🔥, longest streak 🏆, 30-day completion rate, and a full year of daily heatmap counts
- GitHub-style heatmap rendered as a 53×7 CSS-grid contribution graph (overall and per-habit)
- Dashboard with stat cards, a sidebar habit list with a one-click "Log today" button, and a modal to create habits (daily, weekly, or custom frequency)
- Dark mode toggle persisted in `localStorage`, with OS preference as the default

---

## 📁 Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, lifespan
│   │   ├── routes.py        # API endpoints (/habits, /habits/{id}/log, /stats)
│   │   ├── models.py        # SQLAlchemy models: Habit, HabitLog
│   │   ├── schemas.py       # Pydantic request/response models
│   │   ├── stats.py         # Streak / completion / heatmap algorithms
│   │   ├── database.py      # Engine, session, Base
│   │   └── config.py        # Env-driven configuration
│   ├── tests/
│   │   └── test_stats.py    # Unit tests for the stats helpers
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Dashboard layout + state
│   │   ├── api.js           # fetch-based API client
│   │   ├── useDarkMode.js   # Theme hook (localStorage-backed)
│   │   └── components/
│   │       ├── Heatmap.jsx        # 53×7 contribution grid
│   │       ├── Sidebar.jsx        # Habit list + "Log today"
│   │       ├── CreateHabitModal.jsx
│   │       └── StatCard.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick start (Docker)

Both services in one command:

```bash
docker compose up --build
```

Then open **http://localhost:5173**. The API runs at **http://localhost:8000**.

---

## 🛠️ Local development

Run the two services directly to get hot-reload on both ends.

### Prerequisites
- Python 3.11+ (3.12 recommended)
- Node 18+ and npm

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API starts on http://localhost:8000. Interactive docs are at `/docs` (Swagger UI). The SQLite database (`habits.db`) is created automatically on first run.

Run the stats unit tests:

```bash
pytest
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on http://localhost:5173 and talks to the backend at http://localhost:8000. Override the API URL with `VITE_API_URL` (see `.env.example`).

Production build:

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

---

## 📡 API reference

All routes are prefixed with `/api`.

| Method | Path                  | Body                                   | Description                          |
|--------|-----------------------|----------------------------------------|--------------------------------------|
| POST   | `/api/habits`         | `{ name, target_frequency }`           | Create a habit                       |
| GET    | `/api/habits`         | —                                      | List all habits                      |
| DELETE | `/api/habits/{id}`    | —                                      | Delete a habit and its logs          |
| POST   | `/api/habits/{id}/log`| `{ note?, logged_at? }`                | Log an occurrence (defaults to now)  |
| GET    | `/api/stats`          | —                                      | Aggregated stats + per-habit stats   |

### `GET /api/stats` example response

```json
{
  "habit_count": 2,
  "total_logs": 5,
  "current_streak": 5,
  "longest_streak": 5,
  "completion_rate_30d": 0.17,
  "heatmap": { "2026-06-15": 1, "2026-06-16": 1, "...": 0 },
  "habits": [
    {
      "habit_id": 1,
      "habit_name": "Read papers",
      "current_streak": 5,
      "longest_streak": 5,
      "completion_rate_30d": 0.17,
      "heatmap": { "2026-06-15": 1 }
    }
  ]
}
```

The top-level `heatmap` aggregates log counts across all habits for the past 365 days. Days with zero logs are included with value `0`. Each entry in `habits[]` carries the same fields for a single habit.

---

## 🔌 Configuration

The backend reads these environment variables (all optional):

| Variable           | Default                              | Purpose                          |
|--------------------|--------------------------------------|----------------------------------|
| `DATABASE_URL`     | `sqlite:///./habits.db`              | SQLAlchemy database URL          |
| `FRONTEND_ORIGIN`  | `http://localhost:5173`              | Origin allowed by CORS           |

The frontend reads:

| Variable        | Default                  | Purpose                       |
|-----------------|--------------------------|-------------------------------|
| `VITE_API_URL`  | `http://localhost:8000`  | Base URL for the backend API  |

---

## 🧠 How stats are computed

- **Current streak:** consecutive days with at least one log, counting back from today. Today does not need to be logged yet (the streak stays alive if yesterday was logged), but a two-day gap resets it to 0.
- **Longest streak:** the longest run of consecutive logged days in history.
- **Completion rate (30d):** the fraction of the last 30 days that had at least one log.
- **Heatmap:** `{ "YYYY-MM-DD": count }` over the trailing 365 days.

These live in `backend/app/stats.py` and are covered by unit tests in `backend/tests/test_stats.py`.

---

## 📝 Tech stack

**Backend:** Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite  
**Frontend:** React 18, Vite 5, Tailwind CSS 3  
**Tooling:** Docker, docker-compose
