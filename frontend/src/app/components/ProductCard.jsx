import { Link } from "react-router";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "../context/CartContext";

export function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#00C2FF]/30 h-full">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-[#00C2FF] text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md z-10">
            Novo
          </span>
        )}
        {product.isBestSeller && (
          <span className="absolute top-3 right-3 bg-[#0A192F] text-[#00C2FF] text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md z-10 border border-[#00C2FF]/20">
            Best Seller
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-medium uppercase tracking-wide">
           <span className="text-[#00C2FF]">{product.category}</span>
           <span>•</span>
           <span>{product.type === 'ebook' ? 'E-Book' : product.type === 'kit' ? 'Kit' : 'Livro'}</span>
        </div>

        <h3 className="text-lg font-bold text-[#0A192F] line-clamp-2 mb-1 group-hover:text-[#00C2FF] transition-colors">
          {product.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-3">{product.author}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                className={i < Math.floor(product.rating) ? "" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">
            ({product.reviewsCount} {product.reviewsCount === 1 ? "avaliação" : "avaliações"})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
             {product.originalPrice && (
               <span className="text-xs text-gray-400 line-through">
                 R$ {product.originalPrice.toFixed(2).replace('.', ',')}
               </span>
             )}
             <span className="text-xl font-bold text-[#0A192F]">
               R$ {product.price.toFixed(2).replace('.', ',')}
             </span>
          </div>

          <button
            onClick={handleAddToCart}
            className="p-3 rounded-full bg-gray-100 text-[#0A192F] hover:bg-[#00C2FF] hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95"
            title="Adicionar ao Carrinho"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </Link>
  );
}
