import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { getAuthenticatedUser, getAuthToken } from '../utils/authGuard';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState(() => {
    // Only load saved cart for authenticated users
    const authUser = getAuthenticatedUser();
    if (!authUser) return [];

    try {
      const saved = localStorage.getItem('zestmed_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Keep cart in localStorage only when authenticated
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('zestmed_cart', JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('zestmed_cart');
        if (cartItems.length > 0) {
          setCartItems([]);
        }
      }
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems, user]);

  const addItem = (item, type = 'medicine', options = {}) => {
    // 1. Mandatory Login Check
    const activeUser = user || getAuthenticatedUser();
    if (!activeUser) {
      // Save pending cart item to resume immediately after login
      try {
        sessionStorage.setItem('zestmed_pending_cart_item', JSON.stringify({
          item,
          itemType: type,
          timestamp: Date.now()
        }));
      } catch (_) {}

      addToast('Please login to add items to your cart', 'info');

      // Open Login Modal on the same page without navigating away
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zestmed:open-auth', {
          detail: { mode: 'login' }
        }));
      }
      return false;
    }

    // 2. Add to active user cart
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        addToast(`Updated quantity for "${item.name}"`, 'info');
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      addToast(`Added "${item.name}" to cart!`, 'success');
      return [...prev, { ...item, itemType: type, quantity: 1 }];
    });

    // 3. Notify protected Node.js backend
    try {
      const token = getAuthToken();
      if (token && typeof fetch !== 'undefined') {
        fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ item, type })
        }).catch(() => {});
      }
    } catch (_) {}

    return true;
  };

  const removeItem = (id) => {
    const item = cartItems.find(i => i.id === id);
    setCartItems(prev => prev.filter(i => i.id !== id));
    if (item) {
      addToast(`Removed "${item.name}" from cart`, 'info');
    }
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
  };

  const clearCart = () => {
    setCartItems([]);
    addToast('Cart cleared', 'info');
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const totalMRP = cartItems.reduce((acc, item) => {
    const mrp = item.mrp || item.price;
    return acc + (mrp * item.quantity);
  }, 0);

  const totalSavings = Math.max(0, totalMRP - subtotal);

  return (
    <CartContext.Provider value={{
      cartItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItemsCount,
      subtotal,
      totalMRP,
      totalSavings,
      isDrawerOpen,
      openCart: () => setIsDrawerOpen(true),
      closeCart: () => setIsDrawerOpen(false),
      toggleCart: () => setIsDrawerOpen(prev => !prev),
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
