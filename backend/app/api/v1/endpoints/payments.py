from datetime import datetime, timedelta, timezone
from decimal import Decimal
from urllib.parse import quote_plus
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.schemas.payment import (
    PaymentConfirmResponse,
    PaymentCreateRequest,
    PaymentMethod,
    PaymentResponse,
    PaymentStatus,
    PixPaymentData,
)

router = APIRouter()

_PAYMENT_STORE: dict[str, PaymentResponse] = {}


def _to_brl_cents(amount: Decimal) -> int:
    return int(amount * 100)


@router.get("/options")
def list_payment_options() -> dict[str, list[str]]:
    return {
        "gateways": ["pagseguro", "mercadopago", "stripe", "paypal"],
        "card_brands": ["visa", "mastercard", "elo", "amex", "hipercard"],
        "methods": ["card", "pix"],
    }


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreateRequest) -> PaymentResponse:
    if payload.method == PaymentMethod.CARD and payload.card is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dados do cartão são obrigatórios para pagamento em cartão.",
        )

    transaction_id = f"txn_{uuid4().hex[:18]}"

    if payload.method == PaymentMethod.PIX:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        pix_key = str(uuid4())
        amount_cents = _to_brl_cents(payload.amount)
        qr_code_text = (
            f"00020126330014BR.GOV.BCB.PIX0114{pix_key}"
            f"520400005303986540{payload.amount:.2f}5802BR5912COMPIA STORE"
            f"6009SAO PAULO62070503***6304{amount_cents:04d}"
        )
        qr_code_url = (
            "https://api.qrserver.com/v1/create-qr-code/"
            f"?size=280x280&data={quote_plus(qr_code_text)}"
        )
        response = PaymentResponse(
            transaction_id=transaction_id,
            status=PaymentStatus.PENDING,
            gateway=payload.gateway,
            method=payload.method,
            amount=payload.amount,
            currency=payload.currency,
            message="PIX gerado com sucesso. Aguardando confirmação do pagamento.",
            pix=PixPaymentData(
                pix_key=pix_key,
                qr_code_text=qr_code_text,
                qr_code_url=qr_code_url,
                expires_at=expires_at,
            ),
        )
        _PAYMENT_STORE[transaction_id] = response
        return response

    response = PaymentResponse(
        transaction_id=transaction_id,
        status=PaymentStatus.APPROVED,
        gateway=payload.gateway,
        method=payload.method,
        amount=payload.amount,
        currency=payload.currency,
        message="Pagamento com cartão aprovado.",
    )
    _PAYMENT_STORE[transaction_id] = response
    return response


@router.post("/{transaction_id}/confirm", response_model=PaymentConfirmResponse)
def confirm_pix_payment(transaction_id: str) -> PaymentConfirmResponse:
    payment = _PAYMENT_STORE.get(transaction_id)
    if payment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada.")

    if payment.method != PaymentMethod.PIX:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Somente pagamentos PIX podem ser confirmados por este endpoint.",
        )

    if payment.status == PaymentStatus.APPROVED:
        return PaymentConfirmResponse(
            transaction_id=transaction_id,
            status=PaymentStatus.APPROVED,
            message="Pagamento PIX já estava confirmado.",
        )

    payment.status = PaymentStatus.APPROVED
    payment.message = "Pagamento PIX confirmado com sucesso."
    _PAYMENT_STORE[transaction_id] = payment

    return PaymentConfirmResponse(
        transaction_id=transaction_id,
        status=PaymentStatus.APPROVED,
        message="Pagamento PIX confirmado com sucesso.",
    )
