"""Application configuration."""
import os
from pathlib import Path

# SQLite database file lives alongside the app. Override via env var if needed.
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'habits.db'}")

# Frontend origin allowed by CORS.
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
