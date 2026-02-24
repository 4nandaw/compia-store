import { useParams, Link } from "react-router";
import { useState } from "react";
import { Star, Truck, Shield, Check, ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";

export function ProductDetail() {
  const { id } = useParams();
  const { products, getProductById, getReviewsForProduct, addReviewToProduct } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAuthor, setReviewAuthor] = useState("");
  
  const product = getProductById(id);
  const productReviews = product ? getReviewsForProduct(product.id) : [];

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-[#0A192F] mb-4">Produto não encontrado</h2>
        <Link to="/shop" className="text-[#00C2FF] hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Voltar para a loja
        </Link>
      </div>
    );
  }

  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
        addToCart(product);
    }
  };

  const handleSubmitReview = (event) => {
    event.preventDefault();
    if (!product) return;
    addReviewToProduct(product.id, {
      rating: Number(reviewRating),
      comment: reviewComment,
      author: reviewAuthor,
    });
    setReviewComment("");
    setReviewRating("5");
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#00C2FF]">Início</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#00C2FF]">Loja</Link>
            <span>/</span>
            <span className="text-[#0A192F] font-medium truncate">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative group">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-[#00C2FF] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Lançamento
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-[#00C2FF] font-medium text-sm uppercase tracking-wide bg-[#00C2FF]/10 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A192F] mb-2 leading-tight">
              {product.title}
            </h1>
            
            <p className="text-lg text-gray-500 mb-2 font-medium">
              por <span className="text-[#0A192F]">{product.author}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4 font-semibold text-[#0A192F]">
              {product.type === "ebook"
                ? "E-book"
                : product.type === "kit"
                ? "Kit (livro + materiais digitais)"
                : "Livro físico"}
            </p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                    className={i < Math.floor(product.rating) ? "" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-gray-500">
                ({product.reviewsCount} {product.reviewsCount === 1 ? "avaliação" : "avaliações"})
              </span>
            </div>

            <div className="mb-6">
              {product.originalPrice && (
                <p className="text-gray-400 line-through mb-1">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </p>
              )}
              <p className="text-4xl font-bold text-[#0A192F]">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <label className="font-medium text-gray-700">Quantidade:</label>
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium text-[#0A192F]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-gray-500">{product.stock} em estoque</span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full px-8 py-4 bg-[#00C2FF] text-white font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mb-4"
            >
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </button>

            {/* Features */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck size={20} className="text-[#00C2FF]" />
                <span className="text-sm">Frete grátis para compras acima de R$ 200</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Shield size={20} className="text-[#00C2FF]" />
                <span className="text-sm">Compra 100% segura</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Check size={20} className="text-[#00C2FF]" />
                <span className="text-sm">Garantia de qualidade COMPIA</span>
              </div>
            </div>
          </div>
        </div>

          {/* Avaliações do Produto */}
          <div className="mt-16 border-t border-gray-200 pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div>
                <h2 className="text-2xl font-bold text-[#0A192F] mb-3">Avaliações</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Nota média:{" "}
                  <span className="font-semibold text-[#0A192F]">
                    {Number(product.rating || 0).toFixed(1)} / 5
                  </span>{" "}
                  ({product.reviewsCount} {product.reviewsCount === 1 ? "avaliação" : "avaliações"})
                </p>
                <form onSubmit={handleSubmitReview} className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-sm font-semibold text-[#0A192F]">Deixe sua avaliação</h3>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">Sua nota</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    >
                      <option value="5">5 - Excelente</option>
                      <option value="4">4 - Muito bom</option>
                      <option value="3">3 - Bom</option>
                      <option value="2">2 - Regular</option>
                      <option value="1">1 - Ruim</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">Seu nome (opcional)</label>
                    <input
                      type="text"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="Como você quer aparecer"
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-700">Comentário</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      placeholder="Conte como foi sua experiência com este produto..."
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00C2FF] resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-[#00C2FF] text-white text-sm font-bold rounded-lg hover:bg-[#00C2FF]/90 transition-colors"
                  >
                    Enviar avaliação
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2">
                {productReviews.length === 0 ? (
                  <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6">
                    Ainda não há avaliações cadastradas neste ambiente. Assim que clientes enviarem
                    suas opiniões, elas aparecerão aqui.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productReviews
                      .slice()
                      .reverse()
                      .map((review) => (
                        <div
                          key={review.id}
                          className="border border-gray-100 rounded-xl p-4 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    fill={i < review.rating ? "currentColor" : "none"}
                                    className={i < review.rating ? "" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {review.author || "Cliente COMPIA"}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {review.createdAt
                                ? new Date(review.createdAt).toLocaleDateString("pt-BR")
                                : ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-[#0A192F] mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
