"""
Endpoints de Pedidos.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.notification import Notification
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.email_service import send_order_confirmation_email

router = APIRouter()


@router.get("")
def list_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Listar pedidos — admin vê todos, user vê apenas os seus."""
    if user.role == "admin":
        orders = db.query(Order).order_by(Order.date.desc()).all()
    else:
        orders = (
            db.query(Order)
            .filter(Order.user_email == user.email)
            .order_by(Order.date.desc())
            .all()
        )
    return [OrderResponse.model_validate(o).model_dump() for o in orders]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Criar novo pedido, enviar email de confirmação e notificações."""
    order = Order(
        user_email=user.email,
        subtotal=payload.subtotal,
        shipping_cost=payload.shipping_cost,
        total=payload.total,
        delivery_method=payload.delivery_method,
        shipping_info=payload.shipping_info,
        pickup_address=payload.pickup_address,
        customer_name=payload.customer.name,
        customer_email=payload.customer.email,
        payment_info=payload.payment,
        status="processando",
    )
    db.add(order)
    db.flush()  # preenche order.id

    for item in payload.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.id,
            title=item.title,
            author=item.author or "",
            type=item.type,
            price=item.price,
            quantity=item.quantity,
            image=item.image or "",
        )
        db.add(order_item)

    # Notificações
    notif_customer = Notification(
        role="customer",
        order_id=order.id,
        type="order_created",
        message=f"Seu pedido {order.id} foi recebido e está em processamento.",
    )
    notif_admin = Notification(
        role="admin",
        order_id=order.id,
        type="order_created",
        message=f"Novo pedido {order.id} realizado com total de R$ {order.total:,.2f}.".replace(",", "X").replace(".", ",").replace("X", "."),
    )
    db.add_all([notif_customer, notif_admin])
    db.commit()
    db.refresh(order)

    # Enviar email de confirmação (assíncrono simplificado)
    try:
        items_for_email = [
            {"title": i.title, "type": i.type, "price": i.price, "quantity": i.quantity}
            for i in payload.items
        ]
        send_order_confirmation_email(
            order_id=order.id,
            customer_name=payload.customer.name,
            customer_email=payload.customer.email,
            total=order.total,
            items=items_for_email,
        )
    except Exception as e:
        print(f"[orders] Aviso: falha ao enviar email de confirmação: {e}")

    return OrderResponse.model_validate(order).model_dump()


@router.patch("/{order_id}/status")
def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Alterar status de um pedido (apenas admin)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado.")

    order.status = payload.status
    
    # Mensagem de notificação baseada no status
    status_lower = payload.status.lower()
    messages = {
        "processando": f"Recebemos o pedido {order_id} e ele está em processamento.",
        "confirmado": f"O pedido {order_id} foi confirmado e será preparado para envio.",
        "enviado": f"Seu pedido {order_id} foi enviado. Em breve você receberá mais detalhes de rastreio.",
        "concluido": f"O pedido {order_id} foi concluído. Esperamos que você aproveite a leitura!",
        "cancelado": f"O pedido {order_id} foi cancelado. Se tiver qualquer dúvida, entre em contato com nosso suporte.",
    }
    message = messages.get(status_lower, f"O status do pedido {order_id} foi atualizado para {payload.status}.")

    notif = Notification(
        role="customer",
        order_id=order_id,
        type="order_status",
        message=message,
    )
    db.add(notif)
    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order).model_dump()


@router.patch("/{order_id}/cancel")
def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Cancelar pedido (cliente ou admin)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado.")

    # Verificar se o user pode cancelar
    if user.role != "admin" and order.user_email != user.email:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sem permissão para cancelar este pedido.")

    current_status = (order.status or "processando").lower()
    if current_status in ("enviado", "concluido", "cancelado"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este pedido não pode mais ser cancelado.",
        )

    order.status = "cancelado"

    # Notificação para admin
    notif = Notification(
        role="admin",
        order_id=order_id,
        type="order_cancelled",
        message=f"O cliente solicitou o cancelamento do pedido {order_id}.",
    )
    db.add(notif)
    db.commit()
    db.refresh(order)
    return OrderResponse.model_validate(order).model_dump()
