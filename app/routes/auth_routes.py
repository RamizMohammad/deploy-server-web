from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth_schema import SignupRequest, LoginRequest
from app.services.auth_service import create_user, authenticate_user, generate_tokens
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):

    try:
        user = create_user(db, data.email, data.password)
        return {"message": "user created", "user_id": user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")

    access_token, refresh_token = generate_tokens(db, user)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }


@router.get("/me")
def get_me(user = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email
    }