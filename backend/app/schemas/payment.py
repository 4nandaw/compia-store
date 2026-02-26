from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class PaymentGateway(str, Enum):
    PAGSEGURO = "pagseguro"
    MERCADO_PAGO = "mercadopago"
    STRIPE = "stripe"
    PAYPAL = "paypal"


class PaymentMethod(str, Enum):
    CARD = "card"
    PIX = "pix"


class CardBrand(str, Enum):
    VISA = "visa"
    MASTERCARD = "mastercard"
    ELO = "elo"
    AMEX = "amex"
    HIPERCARD = "hipercard"


class PaymentStatus(str, Enum):
    APPROVED = "approved"
    PENDING = "pending"
    REJECTED = "rejected"


class CartItemInput(BaseModel):
    id: str
    title: str
    quantity: int = Field(..., ge=1)
    unit_price: Decimal = Field(..., gt=0)


class CustomerInput(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr


class CardPaymentInput(BaseModel):
    holder_name: str = Field(..., min_length=2)
    number: str = Field(..., min_length=13, max_length=19)
    expiry: str = Field(..., min_length=4, max_length=5)
    cvv: str = Field(..., min_length=3, max_length=4)
    brand: CardBrand

    @field_validator("number")
    @classmethod
    def card_number_digits_only(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) < 13 or len(digits) > 19:
            raise ValueError("Número de cartão inválido")
        return digits

    @field_validator("cvv")
    @classmethod
    def cvv_digits_only(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("CVV deve conter apenas números")
        return value


class PaymentCreateRequest(BaseModel):
    order_id: Optional[str] = None
    gateway: PaymentGateway
    method: PaymentMethod
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default="BRL", min_length=3, max_length=3)
    items: list[CartItemInput]
    customer: CustomerInput
    card: Optional[CardPaymentInput] = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class PixPaymentData(BaseModel):
    pix_key: str
    qr_code_text: str
    qr_code_url: str
    expires_at: datetime

    @field_validator("pix_key")
    @classmethod
    def validate_random_pix_key(cls, value: str) -> str:
        try:
            parsed = UUID(value)
        except ValueError as exc:
            raise ValueError("Chave PIX aleatória inválida") from exc
        return str(parsed)


class PaymentResponse(BaseModel):
    transaction_id: str
    status: PaymentStatus
    gateway: PaymentGateway
    method: PaymentMethod
    amount: Decimal
    currency: str
    message: str
    pix: Optional[PixPaymentData] = None


class PaymentConfirmResponse(BaseModel):
    transaction_id: str
    status: PaymentStatus
    message: str
