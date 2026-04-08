from jose import jwt
from datetime import datetime, timedelta
from app.models.user import User
from app.config import JWT_SECRET, JWT_ALGORITHM


def create_user(db, email):
    user = User(email=email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def generate_tokens(db, user):
    payload = {
        "user_id": user.id,
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    access_token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return access_token, None
