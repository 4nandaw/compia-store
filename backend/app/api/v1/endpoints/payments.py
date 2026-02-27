from datetime import datetime, timedelta, timezone
from decimal import Decimal
from urllib.parse import quote_plus
from uuid import uuid4
from sqlalchemy.orm import Session
from app.core.database import get_db

from fastapi import APIRouter, Depends, HTTPException, status, Request

from app.schemas.payment import (
    PaymentConfirmResponse,
    PaymentCreateRequest,
    PaymentMethod,
    PaymentResponse,
    PaymentStatus,
    PixPaymentData,
)

from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.audit_service import log_activity

router = APIRouter()

_PAYMENT_STORE: dict[str, PaymentResponse] = {}
_PIX_FIXED_KEY = "6841c4e9-5744-434c-81d0-821b48846b22"


def _format_emv_field(field_id: str, value: str) -> str:
    return f"{field_id}{len(value):02d}{value}"


def _calculate_crc16_ccitt(payload: str) -> str:
    crc = 0xFFFF
    polynomial = 0x1021

    for char in payload:
        crc ^= ord(char) << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ polynomial) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF

    return f"{crc:04X}"


def _build_pix_br_code(pix_key: str, merchant_name: str, merchant_city: str, amount: Decimal) -> str:
    merchant_account_info = (
        _format_emv_field("00", "BR.GOV.BCB.PIX")
        + _format_emv_field("01", pix_key)
    )

    payload = "".join(
        [
            _format_emv_field("00", "01"),
            _format_emv_field("01", "12"),
            _format_emv_field("26", merchant_account_info),
            _format_emv_field("52", "0000"),
            _format_emv_field("53", "986"),
            _format_emv_field("54", f"{amount:.2f}"),
            _format_emv_field("58", "BR"),
            _format_emv_field("59", merchant_name[:25]),
            _format_emv_field("60", merchant_city[:15]),
            _format_emv_field("62", _format_emv_field("05", "***")),
            "6304",
        ]
    )

    crc = _calculate_crc16_ccitt(payload)
    return f"{payload}{crc}"


@router.get("/options")
def list_payment_options() -> dict[str, list[str]]:
    return {
        "gateways": ["pagseguro", "mercadopago", "stripe", "paypal"],
        "card_brands": ["visa", "mastercard", "elo", "amex", "hipercard"],
        "methods": ["card", "pix"],
    }


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment( request: Request,
    payload: PaymentCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),) -> PaymentResponse:
    if payload.method == PaymentMethod.CARD and payload.card is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Dados do cartão são obrigatórios para pagamento em cartão.",
        )

    transaction_id = f"txn_{uuid4().hex[:18]}"

    if payload.method == PaymentMethod.PIX:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        pix_key = _PIX_FIXED_KEY
        qr_code_text = _build_pix_br_code(
            pix_key=pix_key,
            merchant_name="COMPIA STORE",
            merchant_city="SAO PAULO",
            amount=payload.amount,
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
        _PAYMENT_STORE[transaction_id] = {
            "payment": response,
            "owner_email": user.email,
        }

        log_activity(
            db=db,
            user_email=user.email,
            action="payment.create",
            entity="payment",
            entity_id=transaction_id,
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            meta={"method": "pix", "amount": float(payload.amount), "gateway": payload.gateway},
        )

        db.commit()

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

    log_activity(
        db=db,
        user_email=user.email,
        action="payment.create",
        entity="payment",
        entity_id=transaction_id,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        meta={"method": "card", "amount": float(payload.amount), "gateway": payload.gateway},
    )

    db.commit()

    _PAYMENT_STORE[transaction_id] = {
        "payment": response,
        "owner_email": user.email,
    }

    return response


@router.post("/{transaction_id}/confirm", response_model=PaymentConfirmResponse)
def confirm_pix_payment(
    request: Request,
    transaction_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaymentConfirmResponse:

    record = _PAYMENT_STORE.get(transaction_id)

    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transação não encontrada.",
        )

    payment = record["payment"]
    owner_email = record["owner_email"]

    if user.role not in ("admin", "seller") and user.email != owner_email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sem permissão para confirmar este pagamento.",
        )

    if payment.method != PaymentMethod.PIX:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Somente pagamentos PIX podem ser confirmados por este endpoint.",
        )

    if payment.pix and datetime.now(timezone.utc) > payment.pix.expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIX expirado.",
        )

    if payment.status == PaymentStatus.APPROVED:
        return PaymentConfirmResponse(
            transaction_id=transaction_id,
            status=PaymentStatus.APPROVED,
            message="Pagamento PIX já estava confirmado.",
        )

    payment.status = PaymentStatus.APPROVED
    payment.message = "Pagamento PIX confirmado com sucesso."

    _PAYMENT_STORE[transaction_id] = {
        "payment": payment,
        "owner_email": owner_email,
    }

    log_activity(
        db=db,
        user_email=user.email,
        action="payment.pix_confirm",
        entity="payment",
        entity_id=transaction_id,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    db.commit()

    return PaymentConfirmResponse(
        transaction_id=transaction_id,
        status=PaymentStatus.APPROVED,
        message="Pagamento PIX confirmado com sucesso.",
    )