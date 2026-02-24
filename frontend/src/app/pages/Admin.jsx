import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingBag, Package, Users, Bell, Search, Plus, Edit, Trash2, ArrowLeft,
  ChevronDown, ChevronUp, Filter, MoveDown, MoveUp, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import {
  fetchOrders, apiUpdateOrderStatus,
  fetchNotifications, apiMarkNotificationsRead,
} from "../services/api";

const MENU_ITEMS = [
  { id: "products", icon: ShoppingBag, label: "Produtos" },
  { id: "orders", icon: Package, label: "Pedidos" },
  { id: "notifications", icon: Bell, label: "Notificações" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "processando", label: "Processando", color: "bg-yellow-100 text-yellow-700" },
  { value: "confirmado", label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  { value: "enviado", label: "Enviado", color: "bg-orange-100 text-orange-700" },
  { value: "concluido", label: "Concluído", color: "bg-green-100 text-green-700" },
  { value: "cancelado", label: "Cancelado", color: "bg-red-100 text-red-700" },
];

const PRODUCT_TYPES = [
  { value: "book", label: "Livro" },
  { value: "ebook", label: "E-book" },
  { value: "kit", label: "Kit" },
];

export function Admin() {
  const { isLoggedIn, isAdmin } = useAuth();
  const { products, createProduct, updateProduct, deleteProduct, categories } = useProducts();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("products");
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [sortField, setSortField] = useState("title");
  const [sortAsc, setSortAsc] = useState(true);
  const [productForm, setProductForm] = useState({
    title: "", author: "", price: "", originalPrice: "", description: "",
    image: "", category: "", type: "book", stock: "0",
    isNew: false, isBestSeller: false,
  });

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
    else if (!isAdmin) {
      toast.error("Acesso restrito a administradores.");
      navigate("/profile");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  useEffect(() => {
    if (activeTab === "orders") loadOrders();
    if (activeTab === "notifications") loadNotifications();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) { console.error(e); }
  };

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      await apiMarkNotificationsRead();
    } catch (e) { console.error(e); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await apiUpdateOrderStatus(orderId, status);
      toast.success("Status do pedido atualizado.");
      loadOrders();
    } catch (e) {
      toast.error(e.message || "Erro ao atualizar status.");
    }
  };

  const resetProductForm = () => {
    setProductForm({
      title: "", author: "", price: "", originalPrice: "", description: "",
      image: "", category: "", type: "book", stock: "0",
      isNew: false, isBestSeller: false,
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleOpenProductForm = (product) => {
    if (product) {
      setEditingProduct(product.id);
      setProductForm({
        title: product.title || "",
        author: product.author || "",
        price: String(product.price ?? ""),
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        description: product.description || "",
        image: product.image || "",
        category: product.category || "",
        type: product.type || "book",
        stock: String(product.stock ?? 0),
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: "", author: "", price: "", originalPrice: "", description: "",
        image: "", category: "", type: "book", stock: "0",
        isNew: false, isBestSeller: false,
      });
    }
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.author || !productForm.price || !productForm.category) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      if (editingProduct) {
        await updateProduct(editingProduct, productForm);
      } else {
        await createProduct(productForm);
      }
      resetProductForm();
    } catch {
      // error handled in context
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Tem certeza de que deseja excluir este produto?")) return;
    try {
      await deleteProduct(id);
    } catch {
      // error handled in context
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = products
    .filter((p) => {
      const term = searchTerm.toLowerCase();
      return !term || p.title?.toLowerCase().includes(term) || p.author?.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      const valA = a[sortField] ?? "";
      const valB = b[sortField] ?? "";
      if (typeof valA === "number" && typeof valB === "number") return sortAsc ? valA - valB : valB - valA;
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });

  if (!isAdmin) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#0A192F]">Painel Administrativo</h1>
          <button type="button" onClick={() => navigate("/profile")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A192F]">
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-60 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-24">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <item.icon size={18} /> {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1">

            {/* ─── PRODUCTS ─── */}
            {activeTab === "products" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold text-[#0A192F]">Produtos ({products.length})</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-48"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenProductForm(null)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow"
                    >
                      <Plus size={16} /> Novo Produto
                    </button>
                  </div>
                </div>

                {showProductForm && (
                  <form onSubmit={handleSaveProduct} className="mb-6 p-6 border border-purple-200 rounded-xl bg-purple-50/50 space-y-4">
                    <h3 className="font-bold text-[#0A192F]">{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Título *" value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} className="p-3 border rounded-lg text-sm" required />
                      <input type="text" placeholder="Autor *" value={productForm.author} onChange={(e) => setProductForm({ ...productForm, author: e.target.value })} className="p-3 border rounded-lg text-sm" required />
                      <input type="number" step="0.01" placeholder="Preço *" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="p-3 border rounded-lg text-sm" required />
                      <input type="number" step="0.01" placeholder="Preço anterior (opcional)" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} className="p-3 border rounded-lg text-sm" />
                      <input type="text" placeholder="Categoria *" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="p-3 border rounded-lg text-sm" required />
                      <select value={productForm.type} onChange={(e) => setProductForm({ ...productForm, type: e.target.value })} className="p-3 border rounded-lg text-sm">
                        {PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <input type="number" placeholder="Estoque" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="p-3 border rounded-lg text-sm" />
                      <input type="text" placeholder="URL da imagem" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="p-3 border rounded-lg text-sm" />
                    </div>
                    <textarea rows={3} placeholder="Descrição" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full p-3 border rounded-lg text-sm resize-none" />
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={productForm.isNew} onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })} className="rounded" /> Novo
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={productForm.isBestSeller} onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })} className="rounded" /> Best Seller
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 text-sm">
                        {editingProduct ? "Salvar alterações" : "Cadastrar"}
                      </button>
                      <button type="button" onClick={resetProductForm} className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-600 cursor-pointer select-none" onClick={() => toggleSort("title")}>
                          Produto {sortField === "title" && (sortAsc ? <MoveUp size={12} className="inline" /> : <MoveDown size={12} className="inline" />)}
                        </th>
                        <th className="p-3 text-left font-semibold text-gray-600">Tipo</th>
                        <th className="p-3 text-right font-semibold text-gray-600 cursor-pointer select-none" onClick={() => toggleSort("price")}>
                          Preço {sortField === "price" && (sortAsc ? <MoveUp size={12} className="inline" /> : <MoveDown size={12} className="inline" />)}
                        </th>
                        <th className="p-3 text-center font-semibold text-gray-600 cursor-pointer select-none" onClick={() => toggleSort("stock")}>
                          Estoque {sortField === "stock" && (sortAsc ? <MoveUp size={12} className="inline" /> : <MoveDown size={12} className="inline" />)}
                        </th>
                        <th className="p-3 text-center font-semibold text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((product) => (
                        <tr key={product.id} className="group hover:bg-gray-50/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-13 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <BookOpen size={16} className="m-auto text-gray-400 h-full" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[#0A192F] truncate">{product.title}</p>
                                <p className="text-xs text-gray-500">{product.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                              {product.type === "ebook" ? "E-book" : product.type === "kit" ? "Kit" : "Livro"}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold">R$ {(product.price ?? 0).toFixed(2).replace(".", ",")}</td>
                          <td className="p-3 text-center">
                            <span className={`font-bold ${product.stock <= 3 ? "text-red-500" : "text-green-600"}`}>{product.stock}</span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => handleOpenProductForm(product)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                              <button type="button" onClick={() => handleDeleteProduct(product.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Nenhum produto encontrado.</p>
                  )}
                </div>
              </div>
            )}

            {/* ─── ORDERS ─── */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-6">Pedidos ({orders.length})</h2>
                {orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:border-purple-200 transition">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                          <div>
                            <p className="font-bold text-[#0A192F] text-sm">{order.id}</p>
                            <p className="text-xs text-gray-500">
                              {order.customer?.name || order.customer_name || "—"} • {order.date ? new Date(order.date).toLocaleDateString("pt-BR") : "—"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#0A192F]">R$ {(order.total ?? 0).toFixed(2).replace(".", ",")}</span>
                            <select
                              value={(order.status || "processando").toLowerCase()}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className="text-xs border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {(order.items || []).length} {(order.items || []).length === 1 ? "item" : "itens"} • {order.deliveryMethod === "pickup" ? "Retirada" : order.deliveryMethod === "digital" ? "Digital" : "Envio"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── NOTIFICATIONS ─── */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-4 flex items-center gap-2">
                  <Bell size={18} /> Notificações do Admin
                </h2>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">Sem notificações.</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {notifications.map((n) => (
                      <li key={n.id} className={`border border-gray-100 rounded-lg px-4 py-3 ${n.read ? "bg-white" : "bg-purple-50"}`}>
                        <p className="text-gray-800">{n.message}</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString("pt-BR") : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
