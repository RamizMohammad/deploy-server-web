import requests
from app.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET


def exchange_code_for_token(code: str):
    response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={"Accept": "application/json"},
        data={
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code,
        },
    )

    data = response.json()
    print("Token response:", data)  # debug

    return data.get("access_token")