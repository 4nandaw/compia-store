import uuid
from sqlalchemy import Column, DateTime, String, JSON, func
from app.core.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_email = Column(String(255), nullable=True)  
    action = Column(String(100), nullable=False)     
    entity = Column(String(50), nullable=True)      
    entity_id = Column(String(50), nullable=True)   
    ip = Column(String(60), nullable=True)
    user_agent = Column(String(255), nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)