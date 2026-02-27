"""
Endpoints de Produtos (CRUD).
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.services.audit_service import log_activity

from app.core.database import get_db
from app.dependencies.auth import require_roles
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter()


@router.get("")
def list_products(db: Session = Depends(get_db)):
    """Lista todos os produtos."""
    products = db.query(Product).all()
    return [ProductResponse.model_validate(p).model_dump() for p in products]


@router.get("/{product_id}")
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Busca um produto por ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )
    return ProductResponse.model_validate(product).model_dump()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_product(
    request: Request,
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "editor")),
):
    """Cadastrar novo produto (apenas admin e editor)."""

    product = Product(
        title=payload.title,
        author=payload.author,
        price=payload.price,
        original_price=payload.original_price,
        description=payload.description,
        image=payload.image,
        category=payload.category,
        type=payload.type,
        stock=payload.stock,
        is_new=payload.is_new,
        is_best_seller=payload.is_best_seller,
    )

    db.add(product)
    db.flush()

    log_activity(
        db=db,
        user_email=user.email,
        action="product.create",
        entity="product",
        entity_id=product.id,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        meta={"title": product.title, "category": product.category},
    )

    db.commit()
    db.refresh(product)

    return ProductResponse.model_validate(product).model_dump()


@router.put("/{product_id}")
def update_product(
    request: Request,
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin", "editor")),
):
    """Atualizar produto existente (apenas admin e editor)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    log_activity(
        db,
        user_email=user.email,
        action="product.update",
        entity="product",
        entity_id=product.id,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        meta={"fields": list(update_data.keys())},
    )

    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product).model_dump()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    request: Request,
    product_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin")),
):
    """Excluir produto (apenas admin)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )
    
    product_id_to_log = product.id

    db.delete(product)

    log_activity(
        db,
        user_email=user.email,
        action="product.delete",
        entity="product",
        entity_id=product_id_to_log,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.commit()
