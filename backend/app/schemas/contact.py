"""
Schemas Pydantic para formulário de Contato.
"""

from pydantic import BaseModel, EmailStr


class ContactForm(BaseModel):
    name: str
    last_name: str = ""
    email: EmailStr
    subject: str
    message: str


class ContactResponse(BaseModel):
    success: bool
    message: str
