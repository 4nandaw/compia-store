import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Truck, MapPin, Download, Copy } from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { addNotification } from "../utils/notifications";
import { apiCreateOrder } from "../services/api";

const STORE_PICKUP_ADDRESS = "Av. Paulista, 1000 - São Paulo, SP. Seg a Sex, 9h às 18h.";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const GATEWAY_OPTIONS = [
  { value: "mercadopago", label: "Mercado Pago" },
  { value: "pagseguro", label: "PagSeguro" },
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
];

const CARD_BRAND_OPTIONS = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "MasterCard" },
  { value: "elo", label: "Elo" },
  { value: "amex", label: "Amex" },
  { value: "hipercard", label: "Hipercard" },
];

const REQUEST_TIMEOUT_MS = 15000;

export function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const hasPhysicalItems = cart.some((item) => item.type !== "ebook");
  const hasDigitalItems = cart.some((item) => item.type === "ebook");
  const hasMixedItems = hasPhysicalItems && hasDigitalItems;

  const [deliveryMethod, setDeliveryMethod] = useState("shipping"); // 'shipping' | 'pickup'
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateUf, setStateUf] = useState("");
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null); // { cost, days, service }
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [paymentGateway, setPaymentGateway] = useState("mercadopago");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardBrand, setCardBrand] = useState("visa");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState(null);

  const formattedCep = cep.length > 5 ? `${cep.slice(0, 5)}-${cep.slice(5, 8)}` : cep;

  // CEP de origem da loja (São Paulo - SP)
  const STORE_ORIGIN_CEP = "01310100";

  /**
   * Função para calcular frete usando API pública sem necessidade de credenciais
   * 
   * Esta implementação usa uma combinação de:
   * 1. API pública para obter informações de distância/região baseada em CEP
   * 2. Cálculo baseado em tabelas públicas conhecidas dos Correios
   * 
   * APIs públicas utilizadas:
   * - ViaCEP (já em uso): https://viacep.com.br/
   * - BrasilAPI: https://brasilapi.com.br/ (para informações de CEP)
   */
  const calculateShipping = async (destinationCep, cartItems) => {
    try {
      // Filtrar apenas produtos físicos para cálculo de frete
      const physicalItems = cartItems.filter((item) => item.type !== "ebook");

      // Se não há produtos físicos, não há frete
      if (physicalItems.length === 0) {
        return { cost: 0, days: 0, service: "Digital" };
      }

      // Se o TOTAL do carrinho (físicos + digitais) for >= R$ 200, frete grátis
      // Isso incentiva a compra de produtos digitais junto com físicos
      if (cartTotal >= 200) {
        return { cost: 0, days: 5, service: "PAC" };
      }

      // Calcular peso total aproximado (assumindo ~0.5kg por livro físico)
      const totalWeight = physicalItems.reduce((sum, item) => {
        return sum + item.quantity * 0.5; // ~0.5kg por livro físico
      }, 0);

      if (totalWeight === 0) {
        // Apenas e-books = sem frete
        return { cost: 0, days: 0, service: "Digital" };
      }

      // Obter informações do CEP de destino usando BrasilAPI (pública, sem credenciais)
      let destState = null;
      try {
        const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${destinationCep}`);
        if (brasilApiResponse.ok) {
          const brasilApiData = await brasilApiResponse.json();
          destState = brasilApiData.state;
        }
      } catch (error) {
        console.warn("Não foi possível obter dados do BrasilAPI, usando fallback");
      }

      // Obter informações do CEP de origem
      let originState = null;
      try {
        const originResponse = await fetch(`https://brasilapi.com.br/api/cep/v1/${STORE_ORIGIN_CEP}`);
        if (originResponse.ok) {
          const originData = await originResponse.json();
          originState = originData.state;
        }
      } catch (error) {
        console.warn("Não foi possível obter dados do CEP de origem");
      }

      // Calcular frete baseado em tabelas públicas conhecidas dos Correios
      // Valores aproximados baseados em tabelas públicas de 2024
      let baseCost = 0;
      let estimatedDays = 5;
      const service = "PAC";

      // Cálculo baseado em faixas de peso (tabela pública PAC)
      if (totalWeight <= 0.3) {
        baseCost = 8.50;
      } else if (totalWeight <= 0.5) {
        baseCost = 10.00;
      } else if (totalWeight <= 1) {
        baseCost = 12.50;
      } else if (totalWeight <= 2) {
        baseCost = 18.00;
      } else {
        baseCost = 18.00 + (totalWeight - 2) * 3.50; // R$ 3,50 por kg adicional acima de 2kg
      }

      // Ajuste por distância/estado
      if (originState && destState) {
        if (originState === destState) {
          // Mesmo estado = desconto de 15%
          baseCost = baseCost * 0.85;
          estimatedDays = 3;
        } else {
          // Estados diferentes = acréscimo de 20%
          baseCost = baseCost * 1.20;
          estimatedDays = 7;
        }
      }

      // Valores mínimos e máximos baseados em tabelas públicas
      baseCost = Math.max(8.50, Math.min(baseCost, 150.00)); // Mínimo R$ 8,50 e máximo R$ 150,00

      return {
        cost: Math.round(baseCost * 100) / 100, // Arredondar para 2 casas decimais
        days: estimatedDays,
        service: service,
      };
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      // Fallback: cálculo simplificado em caso de erro
      const totalWeight = cartItems.reduce((sum, item) => {
        if (item.type === "ebook") return sum;
        return sum + item.quantity * 0.5;
      }, 0);

      const fallbackCost = totalWeight > 0 ? Math.max(15.0, totalWeight * 10) : 0;
      return {
        cost: Math.round(fallbackCost * 100) / 100,
        days: 7,
        service: "PAC"
      };
    }
  };

  const handleCepChange = (event) => {
    const onlyDigits = event.target.value.replace(/\D/g, "").slice(0, 8);
    setCep(onlyDigits);
  };

  const handleCepBlur = async () => {
    if (deliveryMethod !== "shipping") return;
    if (!cep) return;
    if (cep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos.");
      return;
    }

    try {
      setIsCepLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) {
        toast.error("Não foi possível consultar o CEP. Tente novamente.");
        return;
      }

      const data = await response.json();
      if (data.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      const street = data.logradouro || "";
      const district = data.bairro || "";
      const composedAddress = [street, district].filter(Boolean).join(" - ");

      setAddress(composedAddress);
      setCity(data.localidade || "");
      setStateUf(data.uf || "");

      const shipping = await calculateShipping(cep, cart);
      setShippingCost(shipping.cost);
      setShippingInfo(shipping);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Verifique sua conexão e tente novamente.");
    } finally {
      setIsCepLoading(false);
    }
  };

  const effectiveShippingCost = deliveryMethod === "pickup" ? 0 : (shippingCost ?? 0);
  const effectiveShippingInfo = deliveryMethod === "pickup"
    ? { cost: 0, days: 0, service: "Retirada no local" }
    : shippingInfo;

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      setShippingCost(0);
      setShippingInfo({ cost: 0, days: 0, service: "Retirada no local" });
    } else {
      setShippingCost(null);
      setShippingInfo(null);
    }
  };

  const orderTotal = cartTotal + (hasPhysicalItems ? effectiveShippingCost : 0);

  const fetchWithTimeout = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const saveOrderAndNavigate = async (payment) => {
    const orderData = {
      items: cart.map(({ id, title, author, type, price, quantity, image }) => ({ id, title, author, type, price, quantity, image })),
      subtotal: cartTotal,
      shipping_cost: hasPhysicalItems ? effectiveShippingCost : 0,
      total: orderTotal,
      delivery_method: hasPhysicalItems ? deliveryMethod : "digital",
      shipping_info: hasPhysicalItems ? effectiveShippingInfo : null,
      pickup_address: deliveryMethod === "pickup" ? STORE_PICKUP_ADDRESS : null,
      customer: {
        name: customerName,
        email: customerEmail,
      },
      payment: {
        transactionId: payment.transaction_id,
        gateway: payment.gateway,
        method: payment.method,
        status: payment.status,
        pixKey: payment.pix?.pix_key ?? null,
      },
    };

    let order;
    try {
      // Criar pedido via API (persiste no MySQL + envia email de confirmação)
      order = await apiCreateOrder(orderData);
    } catch (e) {
      console.warn("Falha ao criar pedido via API, salvando localmente:", e);
      // Fallback: salvar localmente
      order = {
        ...orderData,
        id: `order-${Date.now()}`,
        date: new Date().toISOString(),
        status: "processando",
      };
    }

    // Backup local
    const orders = JSON.parse(localStorage.getItem("compia_orders") || "[]");
    orders.push(order);
    localStorage.setItem("compia_orders", JSON.stringify(orders));

    clearCart();
    toast.success("Pedido realizado com sucesso!");
    navigate("/order-success", { state: { order } });
  };

  const createPayment = async () => {
    const payload = {
      gateway: paymentGateway,
      method: paymentMethod,
      amount: Number(orderTotal.toFixed(2)),
      currency: "BRL",
      items: cart.map((item) => ({
        id: String(item.id),
        title: item.title,
        quantity: item.quantity,
        unit_price: Number(item.price),
      })),
      customer: {
        name: customerName,
        email: customerEmail,
      },
      card:
        paymentMethod === "card"
          ? {
            holder_name: cardHolderName,
            number: cardNumber,
            expiry: cardExpiry,
            cvv: cardCvv,
            brand: cardBrand,
          }
          : null,
    };

    const response = await fetchWithTimeout(`${API_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData?.detail || "Não foi possível processar o pagamento.";
      throw new Error(typeof detail === "string" ? detail : "Erro de validação no pagamento.");
    }

    return response.json();
  };

  const confirmPixPayment = async (transactionId) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payments/${transactionId}/confirm`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detail = errorData?.detail || "Falha ao confirmar pagamento PIX.";
      throw new Error(typeof detail === "string" ? detail : "Falha ao confirmar pagamento PIX.");
    }

    return response.json();
  };

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Informe o nome completo para continuar.");
      return;
    }

    if (!customerEmail.trim()) {
      toast.error("Informe um e-mail válido para continuar.");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardHolderName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        toast.error("Preencha todos os dados do cartão.");
        return;
      }
    }

    if (paymentMethod === "pix" && !pixPaymentData) {
      toast.info("Gere o PIX para visualizar QR Code e chave aleatória.");
    }

    try {
      setIsProcessingPayment(true);

      if (paymentMethod === "pix" && pixPaymentData?.transaction_id) {
        const confirmed = await confirmPixPayment(pixPaymentData.transaction_id);
        saveOrderAndNavigate({
          ...pixPaymentData,
          status: confirmed.status,
          message: confirmed.message,
        });
        return;
      }

      const paymentResult = await createPayment();

      if (paymentMethod === "pix") {
        setPixPaymentData(paymentResult);
        toast.success("PIX gerado! Escaneie o QR Code ou copie a chave aleatória.");
        return;
      }

      saveOrderAndNavigate(paymentResult);
    } catch (error) {
      console.error(error);
      if (error.name === "AbortError") {
        toast.error("Tempo limite excedido. Verifique se o backend está rodando em http://localhost:8000.");
        return;
      }
      if (error instanceof TypeError) {
        toast.error("Falha de conexão com o backend. Confira API/CORS e tente novamente.");
        return;
      }
      toast.error(error.message || "Erro ao processar pagamento.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPixPaymentData(null);
  };

  const handleCopyPixKey = async () => {
    if (!pixPaymentData?.pix?.pix_key) return;
    try {
      await navigator.clipboard.writeText(pixPaymentData.pix.pix_key);
      toast.success("Chave PIX copiada!");
    } catch {
      toast.error("Não foi possível copiar a chave PIX.");
    }
  };

  const confirmButtonText = isProcessingPayment
    ? "Processando..."
    : paymentMethod === "pix" && pixPaymentData
      ? "Confirmar pagamento PIX"
      : paymentMethod === "pix"
        ? "Gerar QR Code PIX"
        : "Pagar e concluir pedido";

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Carrinho vazio</h2>
        <Link to="/shop" className="text-[#00C2FF] hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar para a loja
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <Link to="/cart" className="text-[#00C2FF] hover:underline flex items-center gap-2 mb-8">
          <ArrowLeft size={20} /> Voltar ao carrinho
        </Link>

        <h1 className="text-3xl font-bold text-[#0A192F] mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Forma de entrega (apenas se tiver itens físicos) */}
            {hasPhysicalItems && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#0A192F] mb-4">Forma de Entrega</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${deliveryMethod === "shipping" ? "border-[#00C2FF] bg-[#00C2FF]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="delivery" value="shipping" checked={deliveryMethod === "shipping"} onChange={() => handleDeliveryMethodChange("shipping")} className="sr-only" />
                    <Truck className="w-6 h-6 text-[#00C2FF]" />
                    <div>
                      <span className="font-semibold text-[#0A192F]">Envio (Correios)</span>
                      <p className="text-sm text-gray-500">Entrega no endereço informado. Consulte frete pelo CEP abaixo.</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${deliveryMethod === "pickup" ? "border-[#00C2FF] bg-[#00C2FF]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === "pickup"} onChange={() => handleDeliveryMethodChange("pickup")} className="sr-only" />
                    <MapPin className="w-6 h-6 text-[#00C2FF]" />
                    <div>
                      <span className="font-semibold text-[#0A192F]">Retirada no local</span>
                      <p className="text-sm text-gray-500">Sem frete. Retire na loja.</p>
                    </div>
                  </label>
                </div>
                {deliveryMethod === "pickup" && (
                  <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                    <MapPin size={16} /> {STORE_PICKUP_ADDRESS}
                  </p>
                )}
              </div>
            )}

            {hasDigitalItems && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#0A192F] mb-2 flex items-center gap-2">
                  <Download size={20} /> E-books
                </h2>
                <p className="text-gray-600 text-sm">
                  Após a confirmação do pagamento, os e-books ficarão disponíveis na aba <strong>Downloads</strong> do seu perfil e um link de acesso será enviado por e-mail.
                </p>
              </div>
            )}

            {/* Informações de entrega (apenas quando há itens físicos) */}
            {hasPhysicalItems && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#0A192F] mb-4">
                  {deliveryMethod === "pickup" ? "Dados para contato" : "Informações de Entrega"}
                </h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      value={customerName}
                      onChange={(event) => {
                        setCustomerName(event.target.value);
                        if (!cardHolderName) setCardHolderName(event.target.value);
                      }}
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                    />
                  </div>
                  {deliveryMethod === "shipping" && (
                    <>
                      <input
                        type="text"
                        placeholder="Endereço"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF] disabled:bg-gray-100 disabled:text-gray-400"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        disabled={isCepLoading}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="CEP"
                          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                          value={formattedCep}
                          onChange={handleCepChange}
                          onBlur={handleCepBlur}
                          maxLength={9}
                        />
                        <input
                          type="text"
                          placeholder="Cidade"
                          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF] disabled:bg-gray-100 disabled:text-gray-400"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          disabled={isCepLoading}
                        />
                        <input
                          type="text"
                          placeholder="Estado"
                          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF] disabled:bg-gray-100 disabled:text-gray-400"
                          value={stateUf}
                          onChange={(event) => setStateUf(event.target.value)}
                          disabled={isCepLoading}
                        />
                      </div>
                    </>
                  )}
                </form>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#0A192F] mb-4">Informações de Pagamento</h2>
              <form className="space-y-4">
                {!hasPhysicalItems && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      value={customerName}
                      onChange={(event) => {
                        setCustomerName(event.target.value);
                        if (!cardHolderName) setCardHolderName(event.target.value);
                      }}
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gateway de pagamento</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    value={paymentGateway}
                    onChange={(event) => setPaymentGateway(event.target.value)}
                  >
                    {GATEWAY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "card" ? "border-[#00C2FF] bg-[#00C2FF]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => handlePaymentMethodChange("card")}
                      className="sr-only"
                    />
                    <span className="font-semibold text-[#0A192F]">Cartão</span>
                  </label>

                  <label className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "pix" ? "border-[#00C2FF] bg-[#00C2FF]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="pix"
                      checked={paymentMethod === "pix"}
                      onChange={() => handlePaymentMethodChange("pix")}
                      className="sr-only"
                    />
                    <span className="font-semibold text-[#0A192F]">PIX</span>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <>
                    <p className="text-sm text-gray-600">Bandeiras aceitas: Visa, MasterCard, Elo, Amex e Hipercard.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nome no cartão"
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                        value={cardHolderName}
                        onChange={(event) => setCardHolderName(event.target.value)}
                      />
                      <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                        value={cardBrand}
                        onChange={(event) => setCardBrand(event.target.value)}
                      >
                        {CARD_BRAND_OPTIONS.map((brand) => (
                          <option key={brand.value} value={brand.value}>
                            {brand.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Número do cartão"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, "").slice(0, 19))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Validade (MM/AA)"
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                        value={cardExpiry}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                          const value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                          setCardExpiry(value);
                        }}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="CVV"
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                        value={cardCvv}
                        onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                      />
                    </div>
                  </>
                )}

                {paymentMethod === "pix" && (
                  <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">Gere o PIX para visualizar QR Code e chave aleatória.</p>

                    {pixPaymentData?.pix && (
                      <>
                        <div className="flex justify-center">
                          <img
                            src={pixPaymentData.pix.qr_code_url}
                            alt="QR Code PIX"
                            className="w-52 h-52 rounded-lg border border-gray-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            Chave aleatória: <span className="font-semibold break-all">{pixPaymentData.pix.pix_key}</span>
                          </p>
                          <button
                            type="button"
                            onClick={handleCopyPixKey}
                            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                          >
                            <Copy size={16} /> Copiar chave PIX
                          </button>
                          <p className="text-xs text-gray-500">
                            Expira em: {new Date(pixPaymentData.pix.expires_at).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#0A192F] mb-6">Resumo do Pedido</h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.title} x{item.quantity}</span>
                    <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                {hasPhysicalItems && deliveryMethod !== "pickup" && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Frete{" "}
                      {hasMixedItems ? "(apenas produtos físicos)" : effectiveShippingInfo?.service && `(${effectiveShippingInfo.service})`}
                    </span>
                    <span>
                      {deliveryMethod === "shipping" && cartTotal >= 200
                        ? "Grátis"
                        : shippingCost === null
                          ? "A calcular"
                          : effectiveShippingCost === 0
                            ? "Grátis"
                            : `R$ ${effectiveShippingCost.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                )}
                {hasPhysicalItems && deliveryMethod === "shipping" && effectiveShippingInfo && effectiveShippingInfo.days > 0 && (
                  <p className="text-xs text-gray-500 text-right">
                    Prazo de entrega: {effectiveShippingInfo.days} {effectiveShippingInfo.days === 1 ? 'dia útil' : 'dias úteis'}
                  </p>
                )}
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    R$ {(
                      orderTotal
                    ).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isProcessingPayment}
                className="w-full px-6 py-4 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all shadow-lg"
              >
                {confirmButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
