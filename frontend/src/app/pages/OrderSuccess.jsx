import { Link, useLocation } from "react-router";
import { CheckCircle, Truck, MapPin, Download } from "lucide-react";

const STORE_PICKUP_ADDRESS = "Av. Paulista, 1000 - São Paulo, SP. Seg a Sex, 9h às 18h.";

export function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-[#0A192F] mb-4">Pedido não encontrado</h1>
        <p className="text-gray-600 mb-6">Você pode acessar seus pedidos e downloads no seu perfil.</p>
        <Link to="/profile" className="px-6 py-3 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90">
          Ir para o Perfil
        </Link>
      </div>
    );
  }

  const hasPhysical = order.items.some((i) => i.type !== "ebook");
  const hasDigital = order.items.some((i) => i.type === "ebook");
  const isPickup = order.deliveryMethod === "pickup";

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#0A192F] mb-2">Pedido confirmado!</h1>
          <p className="text-gray-600 mb-8">
            Número do pedido: <strong>{order.id}</strong>
          </p>

          <div className="space-y-6 text-left">
            {hasPhysical && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h2 className="font-bold text-[#0A192F] mb-3 flex items-center gap-2">
                  {isPickup ? <MapPin size={20} /> : <Truck size={20} />}
                  {isPickup ? "Retirada no local" : "Envio por Correios"}
                </h2>
                {isPickup ? (
                  <p className="text-gray-600 text-sm">
                    Compareça no endereço da loja para retirar seus itens. Horário: Seg a Sex, 9h às 18h.
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">
                    O frete foi calculado via Correios (PAC). Você receberá um e-mail com o código de rastreio assim que o pedido for despachado.
                    {order.shippingInfo?.days > 0 && (
                      <span className="block mt-2">
                        Prazo estimado: {order.shippingInfo.days} {order.shippingInfo.days === 1 ? "dia útil" : "dias úteis"}.
                      </span>
                    )}
                  </p>
                )}
                {order.pickupAddress && (
                  <p className="mt-3 text-sm text-gray-700 font-medium flex items-center gap-2">
                    <MapPin size={16} /> {order.pickupAddress}
                  </p>
                )}
              </div>
            )}

            {hasDigital && (
              <div className="bg-[#00C2FF]/5 rounded-xl p-5 border border-[#00C2FF]/20">
                <h2 className="font-bold text-[#0A192F] mb-3 flex items-center gap-2">
                  <Download size={20} /> E-books – entrega automática
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Seus e-books já estão disponíveis na área restrita. Acesse a aba <strong>Downloads</strong> no seu perfil para baixar. Um link de acesso também foi enviado para o seu e-mail.
                </p>
                <Link
                  to="/profile?tab=downloads"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C2FF] text-white text-sm font-bold rounded-lg hover:bg-[#00C2FF]/90"
                >
                  <Download size={16} /> Ir para Downloads
                </Link>
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="px-6 py-3 bg-[#0A192F] text-white font-bold rounded-lg hover:bg-[#0A192F]/90"
            >
              Continuar comprando
            </Link>
            <Link
              to="/profile"
              className="px-6 py-3 border border-gray-300 text-[#0A192F] font-bold rounded-lg hover:bg-gray-50"
            >
              Ver meu perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
