"""
Auth router — login returns JWT, registration with residency proof, and verification endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from typing import Optional
from sqlalchemy.orm import Session
import os, shutil
from datetime import datetime

from app.db.session import get_db
from app.schemas.schemas import LoginIn, LoginOut, UserRegisterIn, UserRegisterOut
from app.models.models import User, UserRoleEnum
from app.core.security import verify_password, create_access_token, hash_password

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
        data={"sub": user.username, "role": user.role.value, "district": user.district, "is_verified": user.is_verified}
    )
    return {"token": token, "role": user.role.value, "district": user.district, "is_verified": user.is_verified}


@router.post("/auth/register", response_model=UserRegisterOut)
def register(
    username: str = Form(...),
    password: str = Form(...),
    district: Optional[str] = Form(None),
    proof: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    upload_dir = os.path.join("uploads", "residency_proofs")
    os.makedirs(upload_dir, exist_ok=True)
    file_ext = os.path.splitext(proof.filename)[1]
    filename = f"{username}_{int(datetime.utcnow().timestamp())}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(proof.file, f)
    
    web_proof_path = f"/uploads/residency_proofs/{filename}"

    hashed = hash_password(password)
    new_user = User(
        username=username,
        hashed_password=hashed,
        district=district,
        proof_path=web_proof_path,
        is_verified=False,
        role=UserRoleEnum.citizen,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"user_id": new_user.id, "is_verified": new_user.is_verified}


@router.get("/auth/pending-users")
def get_pending_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_verified == False).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "district": u.district,
            "proof_path": u.proof_path,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/auth/verify-user/{user_id}")
def verify_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    db.commit()
    return {"status": "success", "message": f"User {user.username} verified successfully."}
