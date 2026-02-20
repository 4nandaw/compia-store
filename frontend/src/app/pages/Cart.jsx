import { Link } from "react-router";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  const hasFreeShipping = cartTotal >= 200;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-20">
        <ShoppingBag size={64} className="text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Seu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8">Parece que você ainda não adicionou nenhum item.</p>
        <Link
          to="/shop"
          className="px-8 py-3 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all shadow-lg shadow-blue-200"
        >
          Começar a Comprar
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#0A192F] mb-8">Carrinho de Compras</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row items-center justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#0A192F] truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.author}</p>
                    <p className="text-sm text-[#00C2FF] mt-1">{item.type === 'ebook' ? 'E-book (Digital)' : 'Físico'}</p>
                  </div>

                  <div className="flex items-center gap-6 mt-4 sm:mt-0">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium text-[#0A192F]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                        disabled={item.stock <= item.quantity}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right min-w-[5rem]">
                      <p className="font-bold text-[#0A192F]">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">
                          {item.quantity}x R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-700 underline mt-4 inline-block"
            >
              Limpar carrinho
            </button>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#0A192F] mb-6">Resumo do Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span className={hasFreeShipping ? "text-[#00C2FF]" : "text-gray-600"}>
                    {hasFreeShipping ? "Grátis" : "A calcular"}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-[#0A192F]">
                  <span>Total</span>
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="w-full block text-center px-6 py-4 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all shadow-lg shadow-blue-200 mb-4 flex items-center justify-center gap-2"
              >
                Finalizar Compra
                <ArrowRight size={20} />
              </Link>
              
              <Link
                to="/shop"
                className="w-full block text-center px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
