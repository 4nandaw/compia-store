from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    *,
    user_email: str | None,
    action: str,
    entity: str | None = None,
    entity_id: str | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
    meta: dict | None = None,
) -> None:
    db.add(ActivityLog(
        user_email=user_email,
        action=action,
        entity=entity,
        entity_id=entity_id,
        ip=ip,
        user_agent=user_agent,
        meta=meta,
    ))