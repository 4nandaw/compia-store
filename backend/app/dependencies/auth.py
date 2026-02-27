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


def require_roles(*allowed_roles: str):
    def guard(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sem permissão para acessar este recurso.",
            )
        return user
    return guard