"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import FRONTEND_ORIGIN
from .database import Base, engine
from .routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup. SQLite + single user -> no migration tooling.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Habit Tracker API",
    version="1.0.0",
    description="REST API for tracking developer habits.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["meta"])
def root():
    return {"status": "ok", "service": "habit-tracker-api"}
