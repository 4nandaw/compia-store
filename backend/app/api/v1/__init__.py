from fastapi import APIRouter

from app.core.config import get_settings
from app.api.v1.endpoints import auth, products, orders, notifications, contact, payments

settings = get_settings()

api_router = APIRouter(prefix=settings.API_V1_PREFIX)

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(contact.router, prefix="/contact", tags=["contact"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
