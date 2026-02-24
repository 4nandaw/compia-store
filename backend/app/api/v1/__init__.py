from fastapi import APIRouter

from app.core.config import get_settings
from app.api.v1.endpoints import payments

settings = get_settings()

api_router = APIRouter(prefix=settings.API_V1_PREFIX)

api_router.include_router(payments.router, prefix="/payments", tags=["payments"])

