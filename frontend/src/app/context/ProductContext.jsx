import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATEGORIES } from '../data/mockData';
import { toast } from 'sonner';
import {
  fetchProducts as apiFetchProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
} from '../services/api';

const ProductContext = createContext(undefined);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories] = useState(CATEGORIES);
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);

  // Carregar produtos da API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiFetchProducts();
      setProducts(data);
    } catch (e) {
      console.error("Erro ao carregar produtos da API:", e);
      // Fallback: tentar localStorage
      try {
        const saved = localStorage.getItem('compia_products');
        if (saved) setProducts(JSON.parse(saved));
      } catch {
        /* silencioso */
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar / salvar avaliações de produtos (mantém localStorage)
  useEffect(() => {
    const savedReviews = localStorage.getItem('compia_reviews');
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Erro ao carregar avaliações:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('compia_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const createProduct = async (productData) => {
    try {
      // Mapeia os campos para snake_case para a API
      const apiData = {
        title: productData.title,
        author: productData.author,
        price: parseFloat(productData.price) || 0,
        original_price: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
        description: productData.description || "",
        image: productData.image || "",
        category: productData.category,
        type: productData.type || "book",
        stock: parseInt(productData.stock) || 0,
        is_new: productData.isNew || false,
        is_best_seller: productData.isBestSeller || false,
      };
      const newProduct = await apiCreateProduct(apiData);
      setProducts((prev) => [...prev, newProduct]);
      toast.success(`Produto "${newProduct.title}" cadastrado com sucesso!`);
      return newProduct;
    } catch (e) {
      toast.error(e.message || "Erro ao cadastrar produto.");
      throw e;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const apiData = {};
      if (productData.title !== undefined) apiData.title = productData.title;
      if (productData.author !== undefined) apiData.author = productData.author;
      if (productData.price !== undefined) apiData.price = parseFloat(productData.price) || 0;
      if (productData.originalPrice !== undefined) apiData.original_price = productData.originalPrice ? parseFloat(productData.originalPrice) : null;
      if (productData.description !== undefined) apiData.description = productData.description;
      if (productData.image !== undefined) apiData.image = productData.image;
      if (productData.category !== undefined) apiData.category = productData.category;
      if (productData.type !== undefined) apiData.type = productData.type;
      if (productData.stock !== undefined) apiData.stock = parseInt(productData.stock) || 0;
      if (productData.isNew !== undefined) apiData.is_new = productData.isNew;
      if (productData.isBestSeller !== undefined) apiData.is_best_seller = productData.isBestSeller;

      const updated = await apiUpdateProduct(id, apiData);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(`Produto atualizado com sucesso!`);
    } catch (e) {
      toast.error(e.message || "Erro ao atualizar produto.");
      throw e;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto excluído com sucesso!");
    } catch (e) {
      toast.error(e.message || "Erro ao excluir produto.");
      throw e;
    }
  };

  const getProductById = (id) => {
    return products.find((p) => p.id === id);
  };

  const getReviewsForProduct = (productId) => {
    return reviews[productId] || [];
  };

  const addReviewToProduct = (productId, { rating, comment, author }) => {
    const safeRating = Math.min(5, Math.max(1, Number(rating) || 0));
    if (!safeRating || !comment.trim()) {
      toast.error('Preencha a avaliação e o comentário.');
      return;
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      productId,
      rating: safeRating,
      comment: comment.trim(),
      author: author?.trim() || 'Cliente COMPIA',
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => {
      const existing = prev[productId] || [];
      const updated = [...existing, newReview];
      return { ...prev, [productId]: updated };
    });

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const existing = reviews[productId] || [];
        const all = [...existing, newReview];
        const avg =
          all.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) /
          (all.length || 1);
        return {
          ...p,
          rating: Number.isFinite(avg) ? avg : 0,
          reviewsCount: all.length,
        };
      })
    );

    toast.success('Avaliação registrada com sucesso!');
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getReviewsForProduct,
        addReviewToProduct,
        refreshProducts: loadProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
