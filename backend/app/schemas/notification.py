"""
Schemas Pydantic para Notificações.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    role: str
    order_id: Optional[str] = None
    type: str
    message: str
    read: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    def model_dump(self, **kwargs):
        data = super().model_dump(**kwargs)
        data["orderId"] = data.pop("order_id", None)
        data["createdAt"] = data.pop("created_at", None)
        if data["createdAt"]:
            data["createdAt"] = data["createdAt"].isoformat()
        return data
