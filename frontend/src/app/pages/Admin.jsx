import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter, X, Save, Bell, ChevronRight, ChevronDown } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { toast } from "sonner";
import { getNotificationsByRole, markNotificationsAsReadByRole, addNotification } from "../utils/notifications";

export function Admin() {
  const { products, categories, createProduct, updateProduct, deleteProduct } = useProducts();
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'orders' | 'customers' | 'notifications'

  // Pedidos (gestão básica via localStorage)
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("compia_orders") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("compia_orders", JSON.stringify(orders));
  }, [orders]);

  const [pendingCancelOrderId, setPendingCancelOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const handleUpdateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
    toast.success("Status do pedido atualizado.");

    const order = orders.find((o) => o.id === orderId);
    if (order) {
      // Notificação para cliente sobre mudança de status (mensagens mais amigáveis)
      const statusLower = status.toLowerCase();
      let message = `O status do pedido ${orderId} foi atualizado.`;
      if (statusLower === "processando") {
        message = `Recebemos o pedido ${orderId} e ele está em processamento.`;
      } else if (statusLower === "confirmado") {
        message = `O pedido ${orderId} foi confirmado e será preparado para envio.`;
      } else if (statusLower === "enviado") {
        message = `Seu pedido ${orderId} foi enviado. Em breve você receberá mais detalhes de rastreio.`;
      } else if (statusLower === "concluido") {
        message = `O pedido ${orderId} foi concluído. Esperamos que você aproveite a leitura!`;
      } else if (statusLower === "cancelado") {
        message = `O pedido ${orderId} foi cancelado. Se tiver qualquer dúvida, entre em contato com nosso suporte.`;
      }

      addNotification({
        role: "customer",
        orderId,
        type: "order_status",
        message,
      });
    }
  };

  // Clientes (cadastro simples em localStorage)
  const [customers, setCustomers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("compia_customers") || "[]");
    } catch {
      return [];
    }
  });

  const [customerForm, setCustomerForm] = useState({
    id: null,
    name: "",
    email: "",
  });

  useEffect(() => {
    localStorage.setItem("compia_customers", JSON.stringify(customers));
  }, [customers]);

  // Notificações do admin
  const [adminNotifications, setAdminNotifications] = useState(() =>
    getNotificationsByRole("admin")
  );

  useEffect(() => {
    if (activeTab === "notifications") {
      const updated = markNotificationsAsReadByRole("admin");
      setAdminNotifications(updated.filter((n) => n.role === "admin"));
    }
  }, [activeTab]);

  const handleSubmitCustomer = (event) => {
    event.preventDefault();
    const name = customerForm.name.trim();
    const email = customerForm.email.trim();
    if (!name || !email) {
      toast.error("Informe nome e e-mail do cliente.");
      return;
    }
    setCustomers((prev) => {
      // Atualizar se já existir
      const exists = prev.find((c) => c.id === customerForm.id || c.email === email);
      if (exists) {
        return prev.map((c) =>
          c.id === exists.id
            ? { ...c, name, email }
            : c
        );
      }
      const now = new Date().toISOString();
      return [
        ...prev,
        {
          id: `cust-${Date.now()}`,
          name,
          email,
          createdAt: now,
        },
      ];
    });
    setCustomerForm({ id: null, name: "", email: "" });
    toast.success("Cliente salvo com sucesso.");
  };

  const handleEditCustomer = (customer) => {
    setCustomerForm({ id: customer.id, name: customer.name, email: customer.email });
  };

  const handleDeleteCustomer = (id) => {
    if (!window.confirm("Remover este cliente?")) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.info("Cliente removido.");
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state (sem avaliação manual)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    originalPrice: "",
    description: "",
    image: "",
    category: "",
    type: "book",
    stock: "",
    isNew: false,
    isBestSeller: false,
  });

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === categories.find(c => c.id === selectedCategory)?.name;
      const matchesType = !selectedType || product.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [products, searchTerm, selectedCategory, selectedType, categories]);

  const handleOpenForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || "",
        author: product.author || "",
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        description: product.description || "",
        image: product.image || "",
        category: categories.find(c => c.name === product.category)?.id || "",
        type: product.type || "book",
        stock: product.stock?.toString() || "",
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        author: "",
        price: "",
        originalPrice: "",
        description: "",
        image: "",
        category: "",
        type: "book",
        stock: "",
        isNew: false,
        isBestSeller: false,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData({
      title: "",
      author: "",
      price: "",
      originalPrice: "",
      description: "",
      image: "",
      category: "",
      type: "book",
      stock: "",
      isNew: false,
      isBestSeller: false,
      rating: "",
      reviewsCount: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const categoryName = categories.find(c => c.id === formData.category)?.name;
    if (!categoryName) {
      toast.error("Selecione uma categoria");
      return;
    }

    const productData = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      description: formData.description.trim(),
      image: formData.image.trim(),
      category: categoryName,
      type: formData.type,
      stock: parseInt(formData.stock) || 0,
      isNew: formData.isNew,
      isBestSeller: formData.isBestSeller,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      createProduct(productData);
    }
    
    handleCloseForm();
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${title}"?`)) {
      deleteProduct(id);
    }
  };
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#0A192F]">Painel Administrativo</h1>
            <p className="text-gray-500 mt-1">Gerencie catálogo, pedidos e clientes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "products"
                ? "border-[#00C2FF] text-[#00C2FF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Produtos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "orders"
                ? "border-[#00C2FF] text-[#00C2FF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Pedidos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "customers"
                ? "border-[#00C2FF] text-[#00C2FF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Clientes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === "notifications"
                ? "border-[#00C2FF] text-[#00C2FF]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell size={16} className="inline mr-1" />
            Notificações
          </button>
        </div>

        {/* Gestão de Produtos */}
        {activeTab === "products" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#0A192F]">Gestão de Catálogo</h2>
                <p className="text-gray-500 mt-1">Cadastre, edite e gerencie os produtos da loja</p>
              </div>
              <button
                onClick={() => handleOpenForm()}
                className="px-6 py-3 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Novo Produto
              </button>
            </div>

            {/* Filtros e Busca */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar por título ou autor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                >
                  <option value="">Todos os tipos</option>
                  <option value="book">Livro</option>
                  <option value="ebook">E-book</option>
                  <option value="kit">Kit</option>
                </select>
              </div>
            </div>

            {/* Lista de Produtos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Imagem</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Produto</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Categoria</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Preço</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estoque</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          Nenhum produto encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-16 h-20 object-cover rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-[#0A192F]">{product.title}</p>
                              <p className="text-sm text-gray-500">{product.author}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              {product.type === 'ebook' ? 'E-book' : product.type === 'kit' ? 'Kit' : 'Livro'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-[#0A192F]">
                                R$ {product.price.toFixed(2).replace('.', ',')}
                              </p>
                              {product.originalPrice && (
                                <p className="text-xs text-gray-400 line-through">
                                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              product.stock > 10 
                                ? 'bg-green-100 text-green-700' 
                                : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.stock} unidades
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenForm(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id, product.title)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Gestão de Pedidos */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A192F]">Gestão de Pedidos</h2>
                <p className="text-gray-500 text-sm">Acompanhe pedidos realizados no site.</p>
              </div>
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                Nenhum pedido registrado ainda.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Pedido</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Entrega</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.slice().reverse().map((order) => (
                      <React.Fragment key={order.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-[#0A192F]">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOrderId(
                                  expandedOrderId === order.id ? null : order.id
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
                            {order.date ? new Date(order.date).toLocaleString("pt-BR") : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                            R$ {(order.total ?? 0).toFixed(2).replace(".", ",")}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {order.deliveryMethod === "pickup"
                              ? "Retirada no local"
                              : order.deliveryMethod === "digital"
                              ? "Entrega digital"
                              : "Envio (Correios)"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center justify-between gap-3 w-full">
                              <div>
                                {(() => {
                                  const rawStatus = (order.status || "processando").toLowerCase();
                                  let badgeClasses =
                                    "inline-flex px-3 py-1 rounded-full text-xs font-bold ";
                                  let label = "";
                                  if (rawStatus === "cancelado") {
                                    badgeClasses += "bg-red-100 text-red-700";
                                    label = "Cancelado";
                                  } else if (rawStatus === "concluido") {
                                    badgeClasses += "bg-green-100 text-green-700";
                                    label = "Concluído";
                                  } else if (rawStatus === "enviado") {
                                    badgeClasses += "bg-orange-100 text-orange-700";
                                    label = "Enviado";
                                  } else if (rawStatus === "confirmado") {
                                    badgeClasses += "bg-blue-100 text-blue-700";
                                    label = "Confirmado";
                                  } else {
                                    // processando ou qualquer outro
                                    badgeClasses += "bg-yellow-100 text-yellow-700";
                                    label = "Processando";
                                  }
                                  return <span className={badgeClasses}>{label}</span>;
                                })()}
                              </div>

                              {(() => {
                                const status = (order.status || "processando").toLowerCase();
                                if (status === "cancelado" || status === "concluido") {
                                  return null;
                                }

                                let nextStatus = null;
                                let nextLabel = "";
                                if (status === "processando") {
                                  nextStatus = "confirmado";
                                  nextLabel = "Confirmar pedido";
                                } else if (status === "confirmado") {
                                  nextStatus = "enviado";
                                  nextLabel = "Marcar como enviado";
                                } else if (status === "enviado") {
                                  nextStatus = "concluido";
                                  nextLabel = "Concluir pedido";
                                }

                                return (
                                  <div className="flex items-center gap-2 ml-auto">
                                    {nextStatus && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateOrderStatus(order.id, nextStatus)}
                                        className="min-w-[140px] px-3 py-1.5 text-[11px] font-semibold rounded-md border border-[#00C2FF] text-[#00C2FF] bg-white hover:bg-[#00C2FF] hover:text-white hover:border-[#00C2FF] transition-colors"
                                      >
                                        {nextLabel || "Avançar etapa"}
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setPendingCancelOrderId(order.id)}
                                      className="min-w-[100px] px-2.5 py-1.5 text-[11px] font-semibold rounded-md border border-red-200 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>

                        {expandedOrderId === order.id && (
                          <tr className="bg-gray-50/70">
                            <td colSpan="5" className="px-6 py-4 text-xs text-gray-700">
                              <div className="space-y-3">
                                <div>
                                  <p className="font-semibold text-[#0A192F] mb-2 text-sm">
                                    Itens do pedido
                                  </p>
                                  <ul className="space-y-1.5">
                                    {(order.items || []).map((item) => (
                                      <li
                                        key={item.id}
                                        className="flex justify-between gap-4"
                                      >
                                        <span className="truncate max-w-[60%]">
                                          {item.title}{" "}
                                          <span className="text-[11px] text-gray-500">
                                            (
                                            {item.type === "ebook"
                                              ? "E-book"
                                              : item.type === "kit"
                                              ? "Kit"
                                              : "Livro"}
                                            )
                                          </span>
                                          {" x"}
                                          {item.quantity}
                                        </span>
                                        <span className="font-medium">
                                          R$ {(item.price * item.quantity)
                                            .toFixed(2)
                                            .replace(".", ",")}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-gray-600">
                                  <div>
                                    <p>Subtotal</p>
                                    <p className="font-semibold text-[#0A192F]">
                                      R$ {(order.subtotal ?? 0)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                    </p>
                                  </div>
                                  <div>
                                    <p>Frete</p>
                                    <p className="font-semibold text-[#0A192F]">
                                      {order.deliveryMethod === "pickup" ||
                                      order.deliveryMethod === "digital"
                                        ? "—"
                                        : (order.shippingCost ?? 0) === 0
                                        ? "Grátis"
                                        : `R$ ${(order.shippingCost ?? 0)
                                            .toFixed(2)
                                            .replace(".", ",")}`}
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
                                  {order.shippingInfo?.days > 0 &&
                                    order.deliveryMethod !== "pickup" && (
                                      <div>
                                        <p>Prazo estimado</p>
                                        <p className="font-semibold text-[#0A192F]">
                                          {order.shippingInfo.days}{" "}
                                          {order.shippingInfo.days === 1
                                            ? "dia útil"
                                            : "dias úteis"}
                                        </p>
                                      </div>
                                    )}
                                </div>
                                {order.deliveryMethod === "pickup" &&
                                  order.pickupAddress && (
                                    <div className="text-[11px] text-gray-600">
                                      <p className="font-semibold text-[#0A192F] mb-1">
                                        Endereço para retirada
                                      </p>
                                      <p>{order.pickupAddress}</p>
                                    </div>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal de confirmação de cancelamento (admin) */}
        {pendingCancelOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-[#0A192F] mb-2">Cancelar pedido</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tem certeza de que deseja cancelar o pedido{" "}
                <span className="font-semibold">{pendingCancelOrderId}</span>? Esta ação não pode
                ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPendingCancelOrderId(null);
                    setPendingCancelPrevStatus(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Manter pedido
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingCancelOrderId) {
                      handleUpdateOrderStatus(pendingCancelOrderId, "cancelado");
                    }
                    setPendingCancelOrderId(null);
                    setPendingCancelPrevStatus(null);
                  }}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Confirmar cancelamento
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Gestão de Clientes */}
        {activeTab === "customers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
              <h2 className="text-xl font-bold text-[#0A192F] mb-4">
                {customerForm.id ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmitCustomer}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  {customerForm.id && (
                    <button
                      type="button"
                      onClick={() => setCustomerForm({ id: null, name: "", email: "" })}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00C2FF] text-white rounded-lg text-sm font-semibold hover:bg-[#00C2FF]/90"
                  >
                    <Save size={14} className="inline mr-1" />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-[#0A192F] mb-4">Lista de Clientes</h2>
              {customers.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhum cliente cadastrado ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">E-mail</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Cadastrado em</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-[#0A192F]">{customer.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {customer.createdAt
                              ? new Date(customer.createdAt).toLocaleDateString("pt-BR")
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditCustomer(customer)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomer(customer.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notificações do Admin */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-[#0A192F] mb-4 flex items-center gap-2">
              <Bell size={18} /> Notificações de Pedidos
            </h2>
            {adminNotifications.length === 0 ? (
              <p className="text-sm text-gray-500">
                Nenhuma notificação de pedidos para exibir no momento.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {adminNotifications
                  .slice()
                  .reverse()
                  .map((n) => (
                    <li
                      key={n.id}
                      className={`border border-gray-100 rounded-lg px-4 py-3 flex items-start justify-between gap-3 ${
                        n.read ? "bg-white" : "bg-[#00C2FF]/5"
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
                        <span className="text-[11px] text-gray-500 whitespace-nowrap">
                          Pedido: <span className="font-semibold">{n.orderId}</span>
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {/* Modal de Formulário */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0A192F]">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="Ex: Inteligência Artificial: Uma Abordagem Moderna"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Autor *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="Ex: Stuart Russell & Peter Norvig"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    >
                      <option value="book">Livro Físico</option>
                      <option value="ebook">E-book</option>
                      <option value="kit">Kit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço Original (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="Opcional (para produtos em promoção)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estoque *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Imagem *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF] resize-none"
                      placeholder="Descrição detalhada do produto..."
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        className="w-4 h-4 text-[#00C2FF] border-gray-300 rounded focus:ring-[#00C2FF]"
                      />
                      <span className="text-sm font-medium text-gray-700">Produto Novo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isBestSeller}
                        onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                        className="w-4 h-4 text-[#00C2FF] border-gray-300 rounded focus:ring-[#00C2FF]"
                      />
                      <span className="text-sm font-medium text-gray-700">Mais Vendido</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-6 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all flex items-center gap-2"
                  >
                    <Save size={18} />
                    {editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
