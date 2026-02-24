"""
Schemas Pydantic para Pedidos.
"""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class OrderItemInput(BaseModel):
    id: str
    title: str
    author: Optional[str] = ""
    type: str
    price: float
    quantity: int
    image: Optional[str] = ""


class OrderCustomerInput(BaseModel):
    name: str
    email: str


class OrderCreate(BaseModel):
    items: list[OrderItemInput]
    subtotal: float
    shipping_cost: float = 0
    total: float
    delivery_method: str = "shipping"
    shipping_info: Optional[dict[str, Any]] = None
    pickup_address: Optional[str] = None
    customer: OrderCustomerInput
    payment: Optional[dict[str, Any]] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: str
    title: str
    author: Optional[str] = ""
    type: str
    price: float
    quantity: int
    image: Optional[str] = ""

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    date: Optional[datetime] = None
    items: list[OrderItemResponse]
    subtotal: float
    shipping_cost: float
    total: float
    delivery_method: str
    shipping_info: Optional[dict[str, Any]] = None
    pickup_address: Optional[str] = None
    customer_name: str
    customer_email: str
    payment_info: Optional[dict[str, Any]] = None
    status: str

    model_config = {"from_attributes": True}

    def model_dump(self, **kwargs):
        """Serializa com nomes que o frontend espera."""
        data = super().model_dump(**kwargs)
        data["shippingCost"] = data.pop("shipping_cost", 0)
        data["deliveryMethod"] = data.pop("delivery_method", "shipping")
        data["shippingInfo"] = data.pop("shipping_info", None)
        data["pickupAddress"] = data.pop("pickup_address", None)
        # Reconstruir "customer" como objeto aninhado
        data["customer"] = {
            "name": data.pop("customer_name", ""),
            "email": data.pop("customer_email", ""),
        }
        data["payment"] = data.pop("payment_info", None)
        return data


class OrderStatusUpdate(BaseModel):
    status: str
