import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES } from '../data/mockData';
import { toast } from 'sonner';

const ProductContext = createContext(undefined);

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories] = useState(CATEGORIES);
  const [reviews, setReviews] = useState({});

  // Carregar produtos do localStorage ou usar dados iniciais
  useEffect(() => {
    const savedProducts = localStorage.getItem('compia_products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Erro ao carregar produtos:", e);
        setProducts(INITIAL_PRODUCTS);
      }
    } else {
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  // Salvar produtos no localStorage sempre que houver mudança
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('compia_products', JSON.stringify(products));
    }
  }, [products]);

  // Carregar / salvar avaliações de produtos
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

  const createProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      rating: productData.rating || 0,
      reviewsCount: productData.reviewsCount || 0,
      isNew: productData.isNew || false,
      isBestSeller: productData.isBestSeller || false,
    };
    setProducts((prev) => [...prev, newProduct]);
    toast.success(`Produto "${newProduct.title}" cadastrado com sucesso!`);
    return newProduct;
  };

  const updateProduct = (id, productData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
    toast.success(`Produto atualizado com sucesso!`);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produto excluído com sucesso!");
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
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getReviewsForProduct,
        addReviewToProduct,
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
