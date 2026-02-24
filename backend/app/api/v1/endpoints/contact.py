"""
Endpoint de Contato.
"""

from fastapi import APIRouter

from app.schemas.contact import ContactForm, ContactResponse
from app.services.email_service import send_contact_email

router = APIRouter()


@router.post("", response_model=ContactResponse)
def submit_contact(payload: ContactForm):
    """Recebe formulário de contato e envia email via Resend."""
    success = send_contact_email(payload)

    if success:
        return ContactResponse(
            success=True,
            message="Mensagem enviada com sucesso! Responderemos em breve.",
        )

    return ContactResponse(
        success=False,
        message="Não foi possível enviar a mensagem no momento. Tente novamente mais tarde.",
    )
