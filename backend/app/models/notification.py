"""
Modelo ORM de Notificação.
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, String, Text, func

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: f"notif-{uuid.uuid4().hex[:12]}")
    role = Column(String(20), nullable=False)  # "admin" ou "customer"
    order_id = Column(String(36), nullable=True)
    type = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
