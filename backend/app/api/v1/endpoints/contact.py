"""
Endpoint de Contato.
"""

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.schemas.contact import ContactForm, ContactResponse
from app.services.email_service import send_contact_email
from app.services.audit_service import log_activity
from app.core.database import get_db

router = APIRouter()


@router.post("", response_model=ContactResponse)
def submit_contact(request: Request,payload: ContactForm,db: Session = Depends(get_db)):
    """Recebe formulário de contato e envia email via Resend."""
    success = send_contact_email(payload)

    log_activity(
        db=db,
        user_email=payload.email, 
        action="contact.submit" if success else "contact.submit_failed",
        entity="contact",
        entity_id=payload.email,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    db.commit()

    if success:
        return ContactResponse(
            success=True,
            message="Mensagem enviada com sucesso! Responderemos em breve.",
        )

    return ContactResponse(
        success=False,
        message="Não foi possível enviar a mensagem no momento. Tente novamente mais tarde.",
    )
