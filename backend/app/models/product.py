"""
Modelo ORM do Produto.
"""

import uuid

from sqlalchemy import Boolean, Column, Float, Integer, String, Text

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    rating = Column(Float, default=0)
    reviews_count = Column(Integer, default=0)
    image = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # book, ebook, kit
    is_best_seller = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    stock = Column(Integer, default=0)
    description = Column(Text, nullable=True)
