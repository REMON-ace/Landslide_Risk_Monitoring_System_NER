"""
FastAPI application entry point — NER Landslide Early Warning Platform.
"""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import risk, weather, roads, reports, alerts, dashboard, auth, sync

app = FastAPI(
    title="NER Landslide Early Warning Platform — API",
    description=(
        "AI-based landslide early warning and monitoring system for the "
        "North Eastern Region of India (pilot: East Khasi Hills, Meghalaya). "
        "Smart India Hackathon prototype."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — open for all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers under /api prefix
API_PREFIX = "/api"

app.include_router(risk.router, prefix=API_PREFIX, tags=["Risk & Prediction"])
app.include_router(weather.router, prefix=API_PREFIX, tags=["Weather & Sensors"])
app.include_router(roads.router, prefix=API_PREFIX, tags=["GIS / Infrastructure"])
app.include_router(reports.router, prefix=API_PREFIX, tags=["Field Reporting"])
app.include_router(alerts.router, prefix=API_PREFIX, tags=["Alerts & Notifications"])
app.include_router(dashboard.router, prefix=API_PREFIX, tags=["Dashboard"])
app.include_router(sync.router, prefix=API_PREFIX, tags=["Offline Sync"])
app.include_router(auth.router, prefix=API_PREFIX, tags=["Auth"])


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "NER Landslide Early Warning Platform",
        "status": "running",
        "docs": "/docs",
        "api_base": "/api",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
