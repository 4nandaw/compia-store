"""
Dependencies de autenticação simplificada.
"""

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User


def get_current_user(
    x_user_email: str = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """
    Busca o usuário pelo email passado no header X-User-Email.
    Autenticação simplificada — sem JWT.
    """
    if not x_user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Header X-User-Email obrigatório.",
        )
    user = db.query(User).filter(User.email == x_user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado.",
        )
    return user


def require_admin(
    user: User = Depends(get_current_user),
) -> User:
    """Verifica se o usuário tem role 'admin'."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores.",
        )
    return user
