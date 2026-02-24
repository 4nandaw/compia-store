"""
Schemas Pydantic para Produto.
"""

from typing import Optional

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    title: str
    author: str
    price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    description: str = ""
    image: str = ""
    category: str
    type: str  # book, ebook, kit
    stock: int = Field(0, ge=0)
    is_new: bool = False
    is_best_seller: bool = False


class ProductUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    stock: Optional[int] = None
    is_new: Optional[bool] = None
    is_best_seller: Optional[bool] = None


class ProductResponse(BaseModel):
    id: str
    title: str
    author: str
    price: float
    original_price: Optional[float] = None
    rating: float
    reviews_count: int
    image: Optional[str] = None
    category: str
    type: str
    is_best_seller: bool
    is_new: bool
    stock: int
    description: Optional[str] = None

    model_config = {"from_attributes": True}

    # Aliases para compatibilidade com o frontend (camelCase)
    @property
    def originalPrice(self) -> Optional[float]:
        return self.original_price

    @property
    def reviewsCount(self) -> int:
        return self.reviews_count

    @property
    def isBestSeller(self) -> bool:
        return self.is_best_seller

    @property
    def isNew(self) -> bool:
        return self.is_new

    def model_dump(self, **kwargs):
        """Serializa com chaves camelCase que o frontend espera."""
        data = super().model_dump(**kwargs)
        data["originalPrice"] = data.pop("original_price", None)
        data["reviewsCount"] = data.pop("reviews_count", 0)
        data["isBestSeller"] = data.pop("is_best_seller", False)
        data["isNew"] = data.pop("is_new", False)
        return data
