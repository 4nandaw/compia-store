import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Filter, ChevronDown } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { ProductCard } from "../components/ProductCard";

export function Shop() {
  const { products, categories } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Get filters from URL
  const selectedCategory = searchParams.get("category");
  const selectedType = searchParams.get("type");
  const sortOrder = searchParams.get("sort") || "featured";

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      const categoryMatch = categories.find((c) => c.id === selectedCategory);
      const categoryName = categoryMatch ? categoryMatch.name : selectedCategory;
      result = result.filter(
        (p) =>
          p.category === categoryName ||
          p.category.toLowerCase().includes(categoryName.toLowerCase())
      );
    }

    if (selectedType) {
      result = result.filter((p) => p.type === selectedType);
    }

    // Sort Logic
    switch (sortOrder) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
        break;
      case "best_selling":
        result.sort((a, b) => (a.isBestSeller === b.isBestSeller ? 0 : a.isBestSeller ? -1 : 1));
        break;
      default:
        break;
    }

    return result;
  }, [products, categories, selectedCategory, selectedType, sortOrder]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0A192F]">Catálogo</h1>
            <p className="text-gray-500 mt-1">
              {filteredProducts.length} produtos encontrados
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <Filter size={16} /> Filtros
            </button>
            
            <div className="relative flex-1 md:flex-none">
              <select
                className="w-full md:w-48 appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-[#00C2FF]"
                value={sortOrder}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                <option value="featured">Destaques</option>
                <option value="newest">Mais Recentes</option>
                <option value="best_selling">Mais Vendidos</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-full md:w-64 ${isMobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-bold text-[#0A192F] text-lg">Filtros</h3>
              
              {/* Category Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Categoria</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={cat.id}
                        checked={selectedCategory === cat.id}
                        onChange={(e) => handleFilterChange("category", e.target.checked ? cat.id : null)}
                        className="text-[#00C2FF] focus:ring-[#00C2FF]"
                      />
                      <span className="text-sm text-gray-600">{cat.name}</span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleFilterChange("category", null)}
                    className="text-xs text-[#00C2FF] hover:underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Tipo</h4>
                <div className="space-y-2">
                  {['book', 'ebook', 'kit'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={selectedType === type}
                        onChange={(e) => handleFilterChange("type", e.target.checked ? type : null)}
                        className="text-[#00C2FF] focus:ring-[#00C2FF]"
                      />
                      <span className="text-sm text-gray-600">
                        {type === 'ebook' ? 'E-Book' : type === 'kit' ? 'Kit' : 'Livro'}
                      </span>
                    </label>
                  ))}
                  <button
                    onClick={() => handleFilterChange("type", null)}
                    className="text-xs text-[#00C2FF] hover:underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
