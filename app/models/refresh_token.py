import uuid
from sqlalchemy import Column, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class RefreshToken(Base):

    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    token = Column(Text, nullable=False)

    expires_at = Column(DateTime)

    created_at = Column(DateTime(timezone=True), server_default=func.now())