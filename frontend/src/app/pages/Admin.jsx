import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, Filter, X, Save } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { toast } from "sonner";

export function Admin() {
  const { products, categories, createProduct, updateProduct, deleteProduct } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
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
    rating: "",
    reviewsCount: "",
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
        rating: product.rating?.toString() || "",
        reviewsCount: product.reviewsCount?.toString() || "",
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
        rating: "",
        reviewsCount: "",
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
      rating: formData.rating ? parseFloat(formData.rating) : 0,
      reviewsCount: formData.reviewsCount ? parseInt(formData.reviewsCount) : 0,
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A192F]">Gestão de Catálogo</h1>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação (0-5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="4.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Avaliações
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reviewsCount}
                      onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C2FF]"
                      placeholder="0"
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
