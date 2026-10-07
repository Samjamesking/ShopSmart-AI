import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const CartWishlistContext = createContext();

export function CartWishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
      loadAlerts();
    } else {
      setWishlist([]);
      setAlerts([]);
    }
  }, [user]);

  const loadWishlist = async () => {
    try {
      const data = await api.getWishlist();
      setWishlist(data || []);
    } catch (e) {
      console.error("Failed to load wishlist", e);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await api.getPriceDropAlerts();
      setAlerts(data || []);
    } catch (e) {
      console.error("Failed to load alerts", e);
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.some(item => item.product_id === productId || item.product?.id === productId);
  };

  const toggleWishlist = async (product) => {
    if (!product) return;
    const exists = isWishlisted(product.id);
    if (exists) {
      try {
        await api.removeFromWishlist(product.id);
        setWishlist(prev => prev.filter(item => item.product_id !== product.id && item.product?.id !== product.id));
      } catch (e) {
        console.error("Remove from wishlist error", e);
      }
    } else {
      try {
        await api.addToWishlist(product.id, Math.round(product.price * 0.9));
        setWishlist(prev => [
          ...prev,
          {
            id: Date.now(),
            product_id: product.id,
            target_price: Math.round(product.price * 0.9),
            alert_enabled: true,
            product
          }
        ]);
        triggerConfetti();
      } catch (e) {
        console.error("Add to wishlist error", e);
      }
    }
  };

  const isComparing = (productId) => {
    return compareList.some(item => item.id === productId);
  };

  const toggleCompare = (product) => {
    if (!product) return;
    if (isComparing(product.id)) {
      setCompareList(prev => prev.filter(p => p.id !== product.id));
    } else {
      if (compareList.length >= 4) {
        alert("You can compare up to 4 products at once.");
        return;
      }
      setCompareList(prev => [...prev, product]);
    }
  };

  const clearCompare = () => setCompareList([]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2563eb', '#38bdf8', '#818cf8', '#ec4899']
      });
    } catch {}
  };

  return (
    <CartWishlistContext.Provider value={{
      wishlist,
      compareList,
      alerts,
      isWishlisted,
      toggleWishlist,
      isComparing,
      toggleCompare,
      clearCompare,
      triggerConfetti,
      refreshWishlist: loadWishlist
    }}>
      {children}
    </CartWishlistContext.Provider>
  );
}

export function useCartWishlist() {
  return useContext(CartWishlistContext);
}
