import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { User, Package, Download, Settings, LogOut, Bell } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
  fetchOrders,
  apiCancelOrder,
  fetchNotifications,
  apiMarkNotificationsRead,
} from "../services/api";

const VALID_TABS = ["orders", "downloads", "notifications", "settings"];

export function Profile() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "orders"
  );
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else if (isAdmin) {
      navigate("/admin");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Carregar pedidos
  useEffect(() => {
    if (isLoggedIn) {
      loadOrders();
    }
  }, [isLoggedIn]);

  // Carregar notificações quando a aba é selecionada
  useEffect(() => {
    if (activeTab === "notifications" && isLoggedIn) {
      loadNotifications();
    }
  }, [activeTab, isLoggedIn]);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      console.error("Erro ao carregar pedidos:", e);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      await apiMarkNotificationsRead();
    } catch (e) {
      console.error("Erro ao carregar notificações:", e);
    }
  };

  const setActiveTabAndUrl = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "orders" ? {} : { tab });
  };

  const getPurchasedEbooks = () => {
    const ebooks = [];
    orders.forEach((order) => {
      (order.items || []).filter((i) => i.type === "ebook").forEach((item) => {
        for (let q = 0; q < (item.quantity || 1); q++) {
          ebooks.push({ ...item, orderId: order.id, orderDate: order.date });
        }
      });
    });
    return ebooks;
  };

  const purchasedEbooks = activeTab === "downloads" ? getPurchasedEbooks() : [];

  const handleCancelOrder = async (orderId) => {
    try {
      await apiCancelOrder(orderId);
      toast.success("Pedido cancelado com sucesso.");
      loadOrders();
    } catch (e) {
      toast.error(e.message || "Erro ao cancelar pedido.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isLoggedIn || isAdmin) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#0A192F] mb-8">Minha Conta</h1>

        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-gray-400">
                  <User size={32} />
                </div>
                <h2 className="font-bold text-[#0A192F]">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {isAdmin && (
                  <span className="mt-2 px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-700 rounded-full">
                    Admin
                  </span>
                )}
              </div>

              <nav className="p-2 space-y-1">
                {!isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTabAndUrl("orders")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "orders" ? "bg-[#00C2FF]/10 text-[#00C2FF]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <Package size={18} /> Meus Pedidos
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabAndUrl("downloads")}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "downloads" ? "bg-[#00C2FF]/10 text-[#00C2FF]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      <Download size={18} /> Downloads
                    </button>
                  </>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTabAndUrl("admin")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "admin" ? "bg-[#00C2FF]/10 text-[#00C2FF]" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <Settings size={18} /> Painel Administrativo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTabAndUrl("notifications")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Bell size={18} /> Notificações
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabAndUrl("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Settings size={18} /> Configurações
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2"
                >
                  <LogOut size={18} /> Sair
                </button>
              </nav>
            </div>
          </aside>

            {/* Content */}
            <div className="flex-1">
            {!isAdmin && activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-6">Histórico de Pedidos</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-500">
                    Nenhum pedido realizado ainda. <Link to="/shop" className="text-[#00C2FF] hover:underline">Ver loja</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:border-[#00C2FF]/30 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-bold text-[#0A192F]">{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {order.date ? new Date(order.date).toLocaleDateString("pt-BR") : "—"}
                            </p>
                          </div>
                          {(() => {
                            const rawStatus = (order.status || "processando").toLowerCase();
                            const label = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
                            let colorClasses = "px-3 py-1 rounded-full text-xs font-bold ";
                            if (rawStatus === "cancelado") colorClasses += "bg-red-100 text-red-700";
                            else if (rawStatus === "concluido") colorClasses += "bg-green-100 text-green-700";
                            else if (rawStatus === "enviado") colorClasses += "bg-orange-100 text-orange-700";
                            else if (rawStatus === "confirmado") colorClasses += "bg-blue-100 text-blue-700";
                            else if (rawStatus === "processando") colorClasses += "bg-yellow-100 text-yellow-700";
                            else colorClasses += "bg-gray-100 text-gray-600";
                            return <span className={colorClasses}>{label}</span>;
                          })()}
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                          <p className="text-sm text-gray-600">
                            Total: <span className="font-bold">R$ {(order.total ?? 0).toFixed(2).replace(".", ",")}</span>
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                              className="text-sm text-[#00C2FF] font-medium hover:underline"
                            >
                              {expandedOrderId === order.id ? "Ocultar detalhes" : "Ver detalhes"}
                            </button>
                          </div>
                        </div>
                        {expandedOrderId === order.id && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm">
                            <div>
                              <p className="font-semibold text-[#0A192F] mb-2">Itens do pedido</p>
                              <ul className="space-y-2">
                                {(order.items || []).map((item, idx) => (
                                  <li key={item.id || idx} className="flex justify-between text-gray-700">
                                    <span className="truncate max-w-[60%]">
                                      {item.title}{" "}
                                      <span className="text-xs text-gray-500">
                                        ({item.type === "ebook" ? "E-book" : item.type === "kit" ? "Kit" : "Livro"})
                                      </span>
                                      {" x"}{item.quantity}
                                    </span>
                                    <span className="font-medium">
                                      R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                              <div>
                                <p>Subtotal</p>
                                <p className="font-semibold text-[#0A192F]">
                                  R$ {(order.subtotal ?? 0).toFixed(2).replace(".", ",")}
                                </p>
                              </div>
                              <div>
                                <p>Frete</p>
                                <p className="font-semibold text-[#0A192F]">
                                  {order.deliveryMethod === "pickup" || order.deliveryMethod === "digital"
                                    ? "—"
                                    : (order.shippingCost ?? 0) === 0
                                      ? "Grátis"
                                      : `R$ ${(order.shippingCost ?? 0).toFixed(2).replace(".", ",")}`}
                                </p>
                              </div>
                              <div>
                                <p>Forma de entrega</p>
                                <p className="font-semibold text-[#0A192F]">
                                  {order.deliveryMethod === "pickup"
                                    ? "Retirada no local"
                                    : order.deliveryMethod === "digital"
                                      ? "Entrega digital"
                                      : "Envio (Correios)"}
                                </p>
                              </div>
                              {order.shippingInfo?.days > 0 && order.deliveryMethod !== "pickup" && (
                                <div>
                                  <p>Prazo estimado</p>
                                  <p className="font-semibold text-[#0A192F]">
                                    {order.shippingInfo.days}{" "}
                                    {order.shippingInfo.days === 1 ? "dia útil" : "dias úteis"}
                                  </p>
                                </div>
                              )}
                            </div>
                            {order.deliveryMethod === "pickup" && order.pickupAddress && (
                              <div className="text-xs text-gray-600">
                                <p className="font-semibold text-[#0A192F] mb-1">Endereço para retirada</p>
                                <p>{order.pickupAddress}</p>
                              </div>
                            )}
                            <div className="flex justify-end pt-2">
                              {(() => {
                                const status = (order.status || "confirmado").toLowerCase();
                                const canCancel = ["confirmado", "processando"].includes(status);
                                return (
                                  canCancel && (
                                    <button
                                      type="button"
                                      onClick={() => setPendingCancelOrderId(order.id)}
                                      className="text-xs text-red-500 font-medium hover:underline"
                                    >
                                      Cancelar pedido
                                    </button>
                                  )
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal de confirmação de cancelamento */}
            {pendingCancelOrderId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold text-[#0A192F] mb-2">Cancelar pedido</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Tem certeza de que deseja cancelar o pedido{" "}
                    <span className="font-semibold">{pendingCancelOrderId}</span>? Esta ação não
                    pode ser desfeita.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setPendingCancelOrderId(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Manter pedido
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCancelOrder(pendingCancelOrderId);
                        setPendingCancelOrderId(null);
                      }}
                      className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      Confirmar cancelamento
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isAdmin && activeTab === "downloads" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-2">Meus E-books</h2>
                <p className="text-sm text-gray-500 mb-6">E-books comprados ficam disponíveis aqui para download.</p>
                {purchasedEbooks.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                    <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum e-book comprado ainda.</p>
                    <Link to="/shop" className="mt-3 inline-block text-[#00C2FF] font-medium hover:underline">Ver catálogo</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchasedEbooks.map((item, index) => (
                      <div key={`${item.id}-${item.orderId}-${index}`} className="border border-gray-100 rounded-lg p-4 flex gap-4">
                        <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#0A192F] text-sm">{item.title}</h3>
                          <p className="text-xs text-gray-500 mb-3">{item.author || "—"}</p>
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#00C2FF] text-white text-xs font-bold rounded hover:bg-[#00C2FF]/90 transition-colors w-fit"
                          >
                            <Download size={14} /> Baixar PDF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-4 flex items-center gap-2">
                  <Bell size={18} /> Notificações
                </h2>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Você ainda não possui notificações de pedidos.
                  </p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`border border-gray-100 rounded-lg px-4 py-3 flex items-start justify-between gap-3 ${n.read ? "bg-white" : "bg-[#00C2FF]/5"
                          }`}
                      >
                        <div>
                          <p className="text-gray-800">{n.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {n.createdAt
                              ? new Date(n.createdAt).toLocaleString("pt-BR")
                              : ""}
                          </p>
                        </div>
                        {n.orderId && (
                          <Link
                            to="/profile?tab=orders"
                            className="text-[11px] text-[#00C2FF] hover:underline font-medium whitespace-nowrap"
                          >
                            Ver pedido
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-6">Meus Dados</h2>
                <form className="space-y-4 max-w-lg" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" defaultValue={user?.name?.split(" ")[0] || ""} />
                    <input type="text" placeholder="Sobrenome" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" defaultValue={user?.name?.split(" ").slice(1).join(" ") || ""} />
                  </div>
                  <input type="email" placeholder="E-mail" className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50" defaultValue={user?.email || ""} disabled />
                  <input type="password" placeholder="Nova Senha" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" />
                  <input type="password" placeholder="Confirmar Nova Senha" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" />
                  <button type="submit" className="px-6 py-3 bg-[#0A192F] text-white font-bold rounded-lg hover:bg-[#0A192F]/90 transition-colors">
                    Salvar Alterações
                  </button>
                </form>
              </div>
            )}

            {isAdmin && activeTab === "admin" && (
              <div className="mt-0">
                <Admin />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
