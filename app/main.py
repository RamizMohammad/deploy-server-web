from fastapi import FastAPI
from app.routes import auth_routes
from app.database import engine, Base

# 🔥 IMPORTANT: import models so SQLAlchemy knows them
from app.models import user, refresh_token

app = FastAPI(title="DeployX Auth Service")


# 🔥 CREATE TABLES ON STARTUP
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_routes.router, prefix="/auth")


@app.get("/health")
def health():
    return {"status": "ok"}