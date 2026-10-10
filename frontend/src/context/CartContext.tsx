import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart } from '@shared/types/index.js';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.js';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number, specs?: Record<string, string>) => Promise<void>;
  updateQuantity: (itemId: string, qty: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<string | undefined>(undefined);

  const refreshCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart(appliedDiscount);
      setCart(data);
    } catch {
      // ignore empty cart err
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user, appliedDiscount]);

  const addToCart = async (productId: string, quantity = 1, specs?: Record<string, string>) => {
    await api.addToCart(productId, quantity, specs);
    await refreshCart();
    setIsCartOpen(true);
  };

  const updateQuantity = async (itemId: string, qty: number) => {
    await api.updateCartQuantity(itemId, qty);
    await refreshCart();
  };

  const removeFromCart = async (itemId: string) => {
    await api.removeFromCart(itemId);
    await refreshCart();
  };

  const applyDiscount = async (code: string) => {
    setAppliedDiscount(code);
  };

  const clearCart = async () => {
    await api.clearCart();
    await refreshCart();
  };

  const itemCount = cart?.items.reduce((acc, it) => acc + it.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      applyDiscount,
      clearCart,
      refreshCart,
      itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
