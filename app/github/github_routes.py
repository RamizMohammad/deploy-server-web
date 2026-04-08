from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import requests

from app.config import FRONTEND_URL, GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI
from app.database import get_db
from app.github.github_service import exchange_code_for_token
from app.models.user import User
from app.services.auth_service import create_user, generate_tokens
from app.utils.auth_middleware import get_current_user

router = APIRouter(prefix="/auth/github", tags=["GitHub"])


@router.get("/connect")
def connect_github():
    github_url = f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=repo"
    if GITHUB_REDIRECT_URI:
        github_url = f"{github_url}&redirect_uri={GITHUB_REDIRECT_URI}"
    return RedirectResponse(github_url)


@router.get("/callback")
def github_callback(code: str, db: Session = Depends(get_db)):
    try:
        github_token = exchange_code_for_token(code)

        if not github_token:
            return {"error": "Failed to get GitHub token"}

        user_res = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {github_token}"},
            timeout=15,
        )

        user_data = user_res.json()

        if "login" not in user_data:
            return {"error": "GitHub auth failed", "data": user_data}

        email = user_data.get("email") or f"{user_data['login']}@github.com"
        user = db.query(User).filter(User.email == email).first()

        if not user:
            user = create_user(db, email)

        user.github_token = github_token
        db.commit()

        access_token, _ = generate_tokens(db, user)
        return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?token={access_token}")
    except Exception as exc:
        return {"error": str(exc)}


@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    return {"email": user.email}


@router.get("/repos")
def get_repos(user: User = Depends(get_current_user)):
    if not user.github_token:
        return {"error": "GitHub not connected"}

    repos = requests.get(
        "https://api.github.com/user/repos",
        headers={"Authorization": f"Bearer {user.github_token}"},
        timeout=15,
    ).json()

    return [
        {
            "id": str(repo["id"]),
            "name": repo["name"],
            "fullName": repo["full_name"],
            "defaultBranch": repo["default_branch"],
            "language": repo["language"],
            "updatedAt": repo["updated_at"],
            "isPrivate": repo["private"],
            "htmlUrl": repo["html_url"],
        }
        for repo in repos
    ]
