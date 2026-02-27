"""
Endpoints de Notificações.
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services.audit_service import log_activity

router = APIRouter()

@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Listar notificações baseado na role do usuário."""
    
    notifications = (
        db.query(Notification)
        .filter(Notification.role == user.role)
        .order_by(Notification.created_at.desc())
        .all()
    )
    
    return [NotificationResponse.model_validate(n).model_dump() for n in notifications]


@router.patch("/read")
def mark_notifications_read(
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):

    updated = db.query(Notification).filter(
        Notification.role == user.role,
        Notification.read == False,
    ).update({"read": True})

    log_activity(
        db=db,
        user_email=user.email,
        action="notifications.mark_read",
        entity="notification",
        entity_id="all",
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        meta={"role": user.role, "count": int(updated)},
    )
    
    db.commit()
    return {"success": True, "message": "Notificações marcadas como lidas."}
