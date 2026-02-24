"""
Serviço de envio de emails com Resend.
"""

import resend

from app.core.config import get_settings
from app.schemas.contact import ContactForm

settings = get_settings()


def _init_resend():
    """Configura a API key do Resend."""
    resend.api_key = settings.RESEND_API_KEY


def send_contact_email(form: ContactForm):
    """Envia email quando alguém preenche o formulário de contato."""
    _init_resend()

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0A192F 0%, #112240 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #00C2FF; margin: 0; font-size: 24px;">📬 Nova Mensagem de Contato</h1>
            <p style="color: #8892b0; margin: 8px 0 0; font-size: 14px;">COMPIA Store — Formulário de Contato</p>
        </div>
        <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600; width: 100px;">Nome</td>
                    <td style="padding: 8px 12px; color: #0A192F; font-size: 14px;">{form.name} {form.last_name}</td>
                </tr>
                <tr style="background: #f1f5f9;">
                    <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">Email</td>
                    <td style="padding: 8px 12px; color: #0A192F; font-size: 14px;">{form.email}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 12px; color: #64748b; font-size: 13px; font-weight: 600;">Assunto</td>
                    <td style="padding: 8px 12px; color: #0A192F; font-size: 14px;">{form.subject}</td>
                </tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; font-weight: 600; margin: 0 0 8px;">Mensagem:</p>
                <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">{form.message}</p>
            </div>
        </div>
        <div style="padding: 16px 24px; background: #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">COMPIA Store — Editora de Inteligência Artificial</p>
        </div>
    </div>
    """

    try:
        r = resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [settings.STORE_CONTACT_EMAIL],
            "subject": f"[COMPIA Contato] {form.subject} — {form.name} {form.last_name}",
            "html": html,
        })
        print(f"[email] ✓ Email de contato enviado: {r}")
        return True
    except Exception as e:
        print(f"[email] ✗ Erro ao enviar email de contato: {e}")
        return False


def send_order_confirmation_email(order_id: str, customer_name: str, customer_email: str, total: float, items: list):
    """Envia email de confirmação de compra para o cliente."""
    _init_resend()

    # Gerar linhas HTML dos itens
    items_html = ""
    for item in items:
        qty = item.get("quantity", 1)
        price = item.get("price", 0)
        subtotal = qty * price
        type_label = {"ebook": "E-book", "kit": "Kit"}.get(item.get("type", "book"), "Livro")
        items_html += f"""
        <tr>
            <td style="padding: 8px 12px; color: #334155; font-size: 13px; border-bottom: 1px solid #f1f5f9;">
                {item.get('title', '')} <span style="color: #94a3b8;">({type_label})</span>
            </td>
            <td style="padding: 8px 12px; color: #334155; font-size: 13px; text-align: center; border-bottom: 1px solid #f1f5f9;">{qty}</td>
            <td style="padding: 8px 12px; color: #334155; font-size: 13px; text-align: right; border-bottom: 1px solid #f1f5f9;">R$ {subtotal:,.2f}</td>
        </tr>
        """

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0A192F 0%, #112240 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #00C2FF; margin: 0; font-size: 24px;">✅ Pedido Confirmado!</h1>
            <p style="color: #8892b0; margin: 8px 0 0; font-size: 14px;">Obrigado por comprar na COMPIA Store</p>
        </div>
        <div style="padding: 24px;">
            <p style="color: #334155; font-size: 15px; margin: 0 0 16px;">
                Olá <strong>{customer_name}</strong>, seu pedido <strong style="color: #00C2FF;">{order_id}</strong> foi recebido com sucesso!
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <thead>
                    <tr style="background: #0A192F;">
                        <th style="padding: 10px 12px; color: #00C2FF; font-size: 12px; text-align: left;">Produto</th>
                        <th style="padding: 10px 12px; color: #00C2FF; font-size: 12px; text-align: center;">Qtd.</th>
                        <th style="padding: 10px 12px; color: #00C2FF; font-size: 12px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>
            <div style="background: #0A192F; border-radius: 8px; padding: 16px; text-align: center;">
                <p style="color: #8892b0; font-size: 13px; margin: 0;">Total do pedido</p>
                <p style="color: #00C2FF; font-size: 24px; font-weight: bold; margin: 4px 0 0;">R$ {total:,.2f}</p>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 16px 0 0; line-height: 1.5;">
                Acompanhe o status do seu pedido em <strong>Minha Conta → Meus Pedidos</strong>.
            </p>
        </div>
        <div style="padding: 16px 24px; background: #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">COMPIA Store — Editora de Inteligência Artificial</p>
        </div>
    </div>
    """

    try:
        r = resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": [customer_email],
            "subject": f"COMPIA Store — Confirmação do Pedido {order_id}",
            "html": html,
        })
        print(f"[email] ✓ Confirmação de pedido enviada para {customer_email}: {r}")
        return True
    except Exception as e:
        print(f"[email] ✗ Erro ao enviar confirmação de pedido: {e}")
        return False
