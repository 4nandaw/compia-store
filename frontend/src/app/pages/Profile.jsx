import { useState } from "react";
import { User, Package, Download, Settings, LogOut } from "lucide-react";

export function Profile() {
  const [activeTab, setActiveTab] = useState("orders");

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
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Package size={18} /> Meus Pedidos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("downloads")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'downloads' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Download size={18} /> Downloads
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#00C2FF]/10 text-[#00C2FF]' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Settings size={18} /> Configurações
                </button>
                <button type="button" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-4">
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
                <div className="space-y-4">
                  {[1, 2, 3].map((order) => (
                    <div key={order} className="border border-gray-100 rounded-lg p-4 hover:border-[#00C2FF]/30 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="font-bold text-[#0A192F]">Pedido #{1000 + order}</p>
                          <p className="text-sm text-gray-500">Realizado em {20 - order}/02/2026</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {order === 1 ? 'Em Processamento' : 'Entregue'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                         <p className="text-sm text-gray-600">Total: <span className="font-bold">R$ {Math.floor(Math.random() * 500) + 100},00</span></p>
                         <button type="button" className="text-sm text-[#00C2FF] font-medium hover:underline">Ver Detalhes</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "downloads" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-6">Meus E-books</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="border border-gray-100 rounded-lg p-4 flex gap-4">
                      <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#0A192F] text-sm">Mastering Blockchain</h3>
                        <p className="text-xs text-gray-500 mb-3">Imran Bashir</p>
                        <button type="button" className="flex items-center gap-2 px-3 py-1.5 bg-[#00C2FF] text-white text-xs font-bold rounded hover:bg-[#00C2FF]/90 transition-colors">
                          <Download size={14} /> Baixar PDF
                        </button>
                      </div>
                   </div>
                </div>
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
