from sqlalchemy.orm import Session
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token, create_refresh_token
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS


def create_user(db: Session, email: str, password: str):

    # 🔴 Prevent duplicate users
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise Exception("User already exists")

    user = User(
        email=email,
        password_hash=hash_password(password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, email: str, password: str):

    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(password, user.password_hash):
        return None

    return user


def generate_tokens(db: Session, user):

    data = {
        "user_id": str(user.id),
        "email": user.email
    }

    access_token = create_access_token(data, ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token = create_refresh_token(data, REFRESH_TOKEN_EXPIRE_DAYS)

    # store refresh token in DB
    db_token = RefreshToken(
        user_id=user.id,
        token=refresh_token
    )

    db.add(db_token)
    db.commit()

    return access_token, refresh_token