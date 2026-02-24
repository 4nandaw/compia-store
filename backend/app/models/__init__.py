"""
Modelos de dados (ORM SQLAlchemy) da aplicação.

Importar todos os modelos aqui para que Base.metadata.create_all() funcione.
"""

from app.models.user import User
from app.models.product import Product
from app.models.order import Order, OrderItem
from app.models.notification import Notification

__all__ = ["User", "Product", "Order", "OrderItem", "Notification"]
