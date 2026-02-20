import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { User, Package, Download, Settings, LogOut } from "lucide-react";

function getOrders() {
  try {
    return JSON.parse(localStorage.getItem("compia_orders") || "[]");
  } catch {
    return [];
  }
}

function getPurchasedEbooks() {
  const orders = getOrders();
  const ebooks = [];
  orders.forEach((order) => {
    (order.items || []).filter((i) => i.type === "ebook").forEach((item) => {
      for (let q = 0; q < (item.quantity || 1); q++) {
        ebooks.push({ ...item, orderId: order.id, orderDate: order.date });
      }
    });
  });
  return ebooks;
}

const VALID_TABS = ["orders", "downloads", "settings"];

export function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "orders"
  );

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const setActiveTabAndUrl = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "orders" ? {} : { tab });
  };

  const purchasedEbooks = activeTab === "downloads" ? getPurchasedEbooks() : [];

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
                <h2 className="font-bold text-[#0A192F]">Usuário Teste</h2>
                <p className="text-sm text-gray-500">usuario@compia.com</p>
              </div>
              
              <nav className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTabAndUrl("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Package size={18} /> Meus Pedidos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabAndUrl("downloads")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'downloads' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Download size={18} /> Downloads
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabAndUrl("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Settings size={18} /> Configurações
                </button>
                <Link
                  to="/admin"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors mt-4"
                >
                  <Settings size={18} /> Gestão de Produtos
                </Link>
                <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-2">
                  <LogOut size={18} /> Sair
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-6">Histórico de Pedidos</h2>
                {getOrders().length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-500">
                    Nenhum pedido realizado ainda. <Link to="/shop" className="text-[#00C2FF] hover:underline">Ver loja</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getOrders().slice().reverse().map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:border-[#00C2FF]/30 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-bold text-[#0A192F]">{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {order.date ? new Date(order.date).toLocaleDateString("pt-BR") : "—"}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            Confirmado
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                          <p className="text-sm text-gray-600">
                            Total: <span className="font-bold">R$ {(order.total ?? 0).toFixed(2).replace(".", ",")}</span>
                            {order.deliveryMethod === "pickup" && " (retirada no local)"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "downloads" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-2">Meus E-books</h2>
                <p className="text-sm text-gray-500 mb-6">Área restrita: e-books comprados ficam disponíveis aqui para download.</p>
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
             
            {activeTab === "settings" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-6">Meus Dados</h2>
                <form className="space-y-4 max-w-lg" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" defaultValue="Usuário" />
                    <input type="text" placeholder="Sobrenome" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" defaultValue="Teste" />
                  </div>
                  <input type="email" placeholder="E-mail" className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50" defaultValue="usuario@compia.com" disabled />
                  <input type="password" placeholder="Nova Senha" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" />
                  <input type="password" placeholder="Confirmar Nova Senha" className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]" />
                  <button type="submit" className="px-6 py-3 bg-[#0A192F] text-white font-bold rounded-lg hover:bg-[#0A192F]/90 transition-colors">
                    Salvar Alterações
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
