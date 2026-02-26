import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ShoppingBag,
  Package,
  Users,
  Bell,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Filter,
  MoveDown,
  MoveUp,
  BookOpen,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import {
  fetchOrders,
  apiUpdateOrderStatus,
  apiCancelOrder,
  fetchNotifications,
  apiMarkNotificationsRead,
} from "../services/api";

const MENU_ITEMS = [
  { id: "products", icon: ShoppingBag, label: "Produtos" },
  { id: "orders", icon: Package, label: "Pedidos" },
  { id: "notifications", icon: Bell, label: "Notificações" },
  { id: "account", icon: Settings, label: "Configurações" },
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

const ADMIN_TABS = ["products", "orders", "notifications", "account"];

export function Admin() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { products, createProduct, updateProduct, deleteProduct, categories } = useProducts();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(() =>
    tabFromUrl && ADMIN_TABS.includes(tabFromUrl) ? tabFromUrl : "products"
  );
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
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
    else if (!isAdmin) {
      toast.error("Acesso restrito a administradores.");
      navigate("/profile");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  useEffect(() => {
    if (tabFromUrl && ADMIN_TABS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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

  const handleCancelOrder = async (orderId) => {
    try {
      await apiCancelOrder(orderId);
      toast.success("Pedido cancelado com sucesso.");
      loadOrders();
    } catch (e) {
      toast.error(e.message || "Erro ao cancelar pedido.");
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
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-60 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 space-y-1 sticky top-24">
              {MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchParams(item.id === "products" ? {} : { tab: item.id });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={18} /> {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <ArrowLeft size={16} className="rotate-180" /> Sair da conta
              </button>
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
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                      <h3 className="font-bold text-[#0A192F] mb-4">
                        {editingProduct ? "Editar Produto" : "Novo Produto"}
                      </h3>
                      <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Título *"
                            value={productForm.title}
                            onChange={(e) =>
                              setProductForm({ ...productForm, title: e.target.value })
                            }
                            className="p-3 border rounded-lg text-sm"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Autor *"
                            value={productForm.author}
                            onChange={(e) =>
                              setProductForm({ ...productForm, author: e.target.value })
                            }
                            className="p-3 border rounded-lg text-sm"
                            required
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Preço *"
                            value={productForm.price}
                            onChange={(e) =>
                              setProductForm({ ...productForm, price: e.target.value })
                            }
                            className="p-3 border rounded-lg text-sm"
                            required
                          />
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Preço anterior (opcional)"
                            value={productForm.originalPrice}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                originalPrice: e.target.value,
                              })
                            }
                            className="p-3 border rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Categoria *"
                            value={productForm.category}
                            onChange={(e) =>
                              setProductForm({ ...productForm, category: e.target.value })
                            }
                            className="p-3 border rounded-lg text-sm"
                            required
                          />
                          <select
                            value={productForm.type}
                            onChange={(e) =>
                              setProductForm({ ...productForm, type: e.target.value })
                            }
                            className="p-3 border rounded-lg text-sm"
                          >
                            {PRODUCT_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Estoque"
                            value={productForm.stock}
                            onChange={(e) =>
                              setProductForm({ ...productForm, stock: e.target.value })
                            }
                            className="p-3 border rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="URL da imagem"
                            value={productForm.image}
                            onChange={(e) =>
                              setProductForm({ ...productForm, image: e.target.value })
                            }
                            className="p-3 border rounded-lg text-sm"
                          />
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Descrição"
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              description: e.target.value,
                            })
                          }
                          className="w-full p-3 border rounded-lg text-sm resize-none"
                        />
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={productForm.isNew}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  isNew: e.target.checked,
                                })
                              }
                              className="rounded"
                            />{" "}
                            Novo
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={productForm.isBestSeller}
                              onChange={(e) =>
                                setProductForm({
                                  ...productForm,
                                  isBestSeller: e.target.checked,
                                })
                              }
                              className="rounded"
                            />{" "}
                            Best Seller
                          </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={resetProductForm}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 text-sm"
                          >
                            {editingProduct ? "Salvar alterações" : "Cadastrar"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
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
                <h2 className="text-xl font-bold text-[#0A192F]">Gestão de Pedidos</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Acompanhe pedidos realizados no site.
                </p>

                {orders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum pedido encontrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">
                            Pedido
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">
                            Data
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">
                            Entrega
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => {
                          const statusRaw = (order.status || "processando").toLowerCase();
                          const statusOpt =
                            ORDER_STATUS_OPTIONS.find((opt) => opt.value === statusRaw) || null;
                          const statusLabel = statusOpt?.label || statusRaw;
                          const badgeClasses = `inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusOpt?.color || "bg-gray-100 text-gray-600"
                            }`;

                          const dateValue =
                            order.date || order.created_at || order.createdAt || null;
                          const dateDisplay = dateValue
                            ? new Date(dateValue).toLocaleString("pt-BR")
                            : "—";

                          const totalValue =
                            typeof order.total === "number"
                              ? order.total
                              : typeof order.subtotal === "number"
                                ? order.subtotal
                                : 0;

                          const deliveryMethod =
                            order.delivery_method || order.deliveryMethod || "shipping";
                          const pickupAddress =
                            order.pickup_address || order.pickupAddress || null;
                          const shippingInfo =
                            order.shipping_info || order.shippingInfo || null;
                          const shippingCost =
                            typeof order.shipping_cost === "number"
                              ? order.shipping_cost
                              : typeof order.shippingCost === "number"
                                ? order.shippingCost
                                : 0;
                          const items = order.items || [];
                          const subtotal =
                            typeof order.subtotal === "number" ? order.subtotal : totalValue;

                          let entregaLabel = "Entrega não informada";
                          if (deliveryMethod === "pickup") {
                            entregaLabel = "Retirada no local";
                          } else if (deliveryMethod === "digital") {
                            entregaLabel = "Entrega digital";
                          } else {
                            entregaLabel = shippingInfo?.service || "Entrega (Correios)";
                          }

                          let nextStatus = null;
                          let nextLabel = "";
                          if (statusRaw === "processando") {
                            nextStatus = "confirmado";
                            nextLabel = "Confirmar pedido";
                          } else if (statusRaw === "confirmado") {
                            nextStatus = "enviado";
                            nextLabel = "Marcar como enviado";
                          } else if (statusRaw === "enviado") {
                            nextStatus = "concluido";
                            nextLabel = "Concluir pedido";
                          }

                          const isTerminal =
                            statusRaw === "cancelado" || statusRaw === "concluido";

                          return (
                            <React.Fragment key={order.id}>
                              <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-[#0A192F]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedOrderId(
                                        expandedOrderId === order.id ? null : order.id,
                                      )
                                    }
                                    className="flex items-center gap-2 text-left"
                                  >
                                    {expandedOrderId === order.id ? (
                                      <ChevronDown className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="truncate">{order.id}</span>
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {dateDisplay}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-[#0A192F]">
                                  R$ {totalValue.toFixed(2).replace(".", ",")}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {entregaLabel}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center justify-between gap-3 w-full">
                                    <div>
                                      <span className={badgeClasses}>{statusLabel}</span>
                                    </div>

                                    {!isTerminal && (
                                      <div className="flex items-center gap-2 ml-auto">
                                        {nextStatus && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleUpdateOrderStatus(order.id, nextStatus)
                                            }
                                            className="min-w-[140px] px-3 py-1.5 text-[11px] font-semibold rounded-md border border-[#00C2FF] text-[#00C2FF] bg-white hover:bg-[#00C2FF] hover:text-white hover:border-[#00C2FF] transition-colors"
                                          >
                                            {nextLabel || "Avançar etapa"}
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => setPendingCancelOrderId(order.id)}
                                          className="min-w-[110px] px-2.5 py-1.5 text-[11px] font-semibold rounded-md border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {expandedOrderId === order.id && (
                                <tr className="bg-gray-50/70">
                                  <td colSpan={5} className="px-6 py-4 text-xs text-gray-700">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-[#0A192F] mb-2">
                                          Itens do pedido
                                        </h4>
                                        {items.length === 0 ? (
                                          <p className="text-gray-500">
                                            Nenhum item encontrado para este pedido.
                                          </p>
                                        ) : (
                                          <ul className="space-y-1">
                                            {items.map((item) => (
                                              <li
                                                key={item.id}
                                                className="flex items-center justify-between gap-2"
                                              >
                                                <span className="truncate">
                                                  {item.title}
                                                  {item.author ? ` (${item.author})` : ""} x
                                                  {item.quantity}
                                                </span>
                                                <span className="font-semibold">
                                                  R$ {(
                                                    (item.price || 0) * (item.quantity || 1)
                                                  )
                                                    .toFixed(2)
                                                    .replace(".", ",")}
                                                </span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>

                                      <div className="w-full md:w-64 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span>Subtotal</span>
                                          <span className="font-semibold">
                                            R$ {subtotal.toFixed(2).replace(".", ",")}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Frete</span>
                                          <span className="font-semibold">
                                            R$ {shippingCost.toFixed(2).replace(".", ",")}
                                          </span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-1 border-t border-gray-200 mt-1">
                                          <span>Total</span>
                                          <span>
                                            R$ {totalValue.toFixed(2).replace(".", ",")}
                                          </span>
                                        </div>

                                        <div className="pt-3 text-xs text-gray-600 space-y-1">
                                          <p>
                                            <span className="font-semibold">
                                              Forma de entrega:
                                            </span>{" "}
                                            {entregaLabel}
                                          </p>
                                          {pickupAddress && (
                                            <p>
                                              <span className="font-semibold">
                                                Endereço para retirada:
                                              </span>{" "}
                                              {pickupAddress}
                                            </p>
                                          )}
                                          {!pickupAddress && shippingInfo?.service && (
                                            <p>
                                              <span className="font-semibold">Serviço:</span>{" "}
                                              {shippingInfo.service}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {pendingCancelOrderId && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                      <h3 className="text-lg font-bold text-[#0A192F] mb-2">
                        Cancelar pedido
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Tem certeza de que deseja cancelar o pedido{" "}
                        <span className="font-semibold">{pendingCancelOrderId}</span>? Esta ação
                        não pode ser desfeita.
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

            {/* ─── ACCOUNT / SETTINGS ─── */}
            {activeTab === "account" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-[#0A192F] mb-2">
                  Configurações da Conta
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Atualize seus dados básicos de acesso ao painel administrativo.
                </p>
                <form
                  className="space-y-4 max-w-lg"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome"
                      className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      defaultValue={user?.name?.split(" ")[0] || ""}
                    />
                    <input
                      type="text"
                      placeholder="Sobrenome"
                      className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      defaultValue={user?.name?.split(" ").slice(1).join(" ") || ""}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="E-mail"
                    className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50"
                    defaultValue={user?.email || ""}
                    disabled
                  />
                  <input
                    type="password"
                    placeholder="Nova Senha"
                    className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar Nova Senha"
                    className="p-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#0A192F] text-white font-bold rounded-lg hover:bg-[#0A192F]/90 transition-colors"
                  >
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
