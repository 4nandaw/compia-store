"""
Endpoints de Produtos (CRUD).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_admin
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
    payload: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Cadastrar novo produto (apenas admin)."""
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
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product).model_dump()


@router.put("/{product_id}")
def update_product(
    product_id: str,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Atualizar produto existente (apenas admin)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product).model_dump()


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Excluir produto (apenas admin)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado.",
        )
    db.delete(product)
    db.commit()
