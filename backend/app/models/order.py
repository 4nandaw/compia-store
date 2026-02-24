"""
Modelos ORM de Pedido e Item do Pedido.
"""

import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False)
    product_id = Column(String(36), nullable=False)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=True, default="")
    type = Column(String(20), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    image = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: f"order-{uuid.uuid4().hex[:12]}")
    user_email = Column(String(255), nullable=True)
    date = Column(DateTime, server_default=func.now())
    subtotal = Column(Float, nullable=False)
    shipping_cost = Column(Float, default=0)
    total = Column(Float, nullable=False)
    delivery_method = Column(String(20), default="shipping")
    shipping_info = Column(JSON, nullable=True)
    pickup_address = Column(String(500), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    payment_info = Column(JSON, nullable=True)
    status = Column(String(20), default="processando")

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
