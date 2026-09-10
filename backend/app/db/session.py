from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

db_url = settings.database_url
if db_url.startswith("postgresql"):
    # Do not open a network connection during import/startup.  A blocked or
    # temporarily unavailable database previously prevented Uvicorn from
    # becoming ready, leaving browser requests pending forever.  The driver
    # applies this bounded timeout when a request actually needs a connection.
    engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 10})
else:
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
