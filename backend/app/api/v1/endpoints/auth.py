"""
Endpoints de autenticação.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.services.audit_service import log_activity
from app.models.user import User
from app.schemas.user import UserLogin, UserRegister, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    request: Request,
    payload: UserRegister,
    db: Session = Depends(get_db)):
    """Registrar novo usuário (role 'user')."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe uma conta com este e-mail.",
        )

    user = User(
        email=payload.email,
        password=payload.password,
        name=payload.name,
        role="user",
    )

    db.add(user)
    db.flush()

    log_activity(
        db=db,
        user_email=user.email,
        action="auth.register",
        entity="user",
        entity_id=user.email,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=UserResponse)
def login(
    request: Request,
    payload: UserLogin, 
    db: Session = Depends(get_db)):
    """Login por email + senha (simplificado)."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or user.password != payload.password:

        log_activity(
            db=db,
            user_email=payload.email,
            action="auth.login_failed",
            entity="user",
            entity_id=payload.email,
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        db.commit()
    
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )
    
    log_activity(
        db=db,
        user_email=user.email,
        action="auth.login",
        entity="user",
        entity_id=user.email,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    db.commit()

    return user


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    """Retorna o usuário logado baseado no header X-User-Email."""
    return user
