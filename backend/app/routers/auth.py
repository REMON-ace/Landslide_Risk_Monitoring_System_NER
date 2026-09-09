"""
Auth router — login returns JWT.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.schemas import LoginIn, LoginOut
from app.models.models import User
from app.core.security import verify_password, create_access_token

router = APIRouter()


@router.post("/auth/login", response_model=LoginOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token(
        data={"sub": user.username, "role": user.role.value, "district": user.district}
    )
    return {"token": token, "role": user.role.value, "district": user.district}
