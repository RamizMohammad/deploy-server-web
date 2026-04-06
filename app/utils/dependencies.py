from fastapi import Depends, HTTPException
from jose import jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.config import JWT_SECRET, JWT_ALGORITHM


def get_current_user(token: str, db: Session = Depends(get_db)):

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
    except:
        raise HTTPException(status_code=401, detail="invalid token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="user not found")

    return user