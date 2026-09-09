from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

db_url = settings.database_url
try:
    if "postgresql" in db_url:
        engine = create_engine(db_url, pool_pre_ping=True)
        with engine.connect() as conn:
            pass
    else:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
except Exception:
    engine = create_engine("sqlite:///./landslide.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
