import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { getAuthenticatedUser, getAuthToken } from '../utils/authGuard';

const CartContext = createContext(null);

// Generate isolated localStorage key per user to prevent cross-account contamination
const getUserCartKey = (u) => {
  if (!u) return null;
  const uid = u.id || u.phone || u.email || 'user';
  return `zestmed_user_cart_${uid}`;
};

export const CartProvider = ({ children }) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const activeUserRef = useRef(null);

  // Initialize cart state strictly isolated per logged-in user
  const [cartItems, setCartItems] = useState(() => {
    try {
      // Purge legacy unnamespaced key so dummy or outdated cart items are completely wiped
      if (typeof window !== 'undefined') {
        localStorage.removeItem('zestmed_cart');
      }
    } catch (_) {}

    const authUser = getAuthenticatedUser();
    if (!authUser) return [];

    try {
      const key = getUserCartKey(authUser);
      const saved = key ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync / fetch cart whenever user changes or logs in
  useEffect(() => {
    const activeUser = user || getAuthenticatedUser();
    const currentUserId = activeUser?.id || activeUser?.phone || activeUser?.email || null;
    activeUserRef.current = currentUserId;

    // Purge legacy non-isolated key
    try {
      localStorage.removeItem('zestmed_cart');
    } catch (_) {}

    if (!currentUserId) {
      // User is logged out: cart count MUST be 0
      setCartItems([]);
      return;
    }

    // 1. Load user's isolated local storage cart
    const userKey = getUserCartKey(activeUser);
    let initialUserCart = [];
    try {
      const stored = userKey ? localStorage.getItem(userKey) : null;
      if (stored) {
        initialUserCart = JSON.parse(stored);
      }
    } catch (_) {
      initialUserCart = [];
    }
    setCartItems(Array.isArray(initialUserCart) ? initialUserCart : []);

    // 2. Fetch authenticated user's actual cart from backend / database
    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        // Ensure user hasn't switched during fetch
        if (activeUserRef.current === currentUserId && data?.success && Array.isArray(data.items)) {
          if (data.items.length > 0) {
            setCartItems(data.items);
            try {
              if (userKey) localStorage.setItem(userKey, JSON.stringify(data.items));
            } catch (_) {}
          } else if (initialUserCart.length > 0) {
            // Push existing local items for this user to backend
            fetch('/api/cart/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ items: initialUserCart })
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
    }
  }, [user]);

  // Helper to persist to user storage & backend
  const persistAndSyncCart = (updatedItems) => {
    const activeUser = user || getAuthenticatedUser();
    if (!activeUser) return;

    const userKey = getUserCartKey(activeUser);
    try {
      if (userKey) {
        localStorage.setItem(userKey, JSON.stringify(updatedItems));
      }
    } catch (_) {}

    const token = getAuthToken();
    if (token && typeof fetch !== 'undefined') {
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: updatedItems })
      }).catch(() => {});
    }
  };

  const addItem = (item, type = 'medicine', options = {}) => {
    // 1. Mandatory Login Check
    const activeUser = options.user || user || getAuthenticatedUser();
    if (!activeUser) {
      // Save pending cart item to resume immediately after login
      try {
        sessionStorage.setItem('zestmed_pending_cart_item', JSON.stringify({
          item,
          itemType: type,
          timestamp: Date.now()
        }));
      } catch (_) {}

      // Open Login Modal on the same page without navigating away
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zestmed:open-auth', {
          detail: { mode: 'login' }
        }));
      }
      return false;
    }

    // 2. Add to active user cart
    let updated;
    const existingIndex = cartItems.findIndex(i => i.id === item.id);
    if (existingIndex >= 0) {
      updated = cartItems.map((i, idx) => 
        idx === existingIndex ? { ...i, quantity: (Number(i.quantity) || 1) + 1 } : i
      );
      if (!options.silent) {
        addToast(`Updated quantity for "${item.name}"`, 'info');
      }
    } else {
      updated = [...cartItems, { ...item, itemType: type, quantity: 1 }];
      if (!options.silent) {
        addToast(`Added "${item.name}" to cart!`, 'success');
      }
    }

    setCartItems(updated);
    persistAndSyncCart(updated);
    return true;
  };

  const removeItem = (id) => {
    const item = cartItems.find(i => i.id === id);
    const updated = cartItems.filter(i => i.id !== id);
    setCartItems(updated);
    persistAndSyncCart(updated);
    if (item) {
      addToast(`Removed "${item.name}" from cart`, 'info');
    }
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    const updated = cartItems.map(i => i.id === id ? { ...i, quantity: newQty } : i);
    setCartItems(updated);
    persistAndSyncCart(updated);
  };

  const clearCart = () => {
    setCartItems([]);
    const activeUser = user || getAuthenticatedUser();
    if (activeUser) {
      const userKey = getUserCartKey(activeUser);
      try {
        if (userKey) localStorage.removeItem(userKey);
      } catch (_) {}

      const token = getAuthToken();
      if (token && typeof fetch !== 'undefined') {
        fetch('/api/cart/clear', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {});
      }
    }
    addToast('Cart cleared', 'info');
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const cartCount = totalItemsCount; // Alias for dashboard and other consumers

  const subtotal = cartItems.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);

  const totalMRP = cartItems.reduce((acc, item) => {
    const mrp = Number(item.mrp) || Number(item.price) || 0;
    return acc + (mrp * (Number(item.quantity) || 1));
  }, 0);

  const totalSavings = Math.max(0, totalMRP - subtotal);

  return (
    <CartContext.Provider value={{
      cartItems,
      addItem,
      addToCart: addItem, // Legacy alias compatibility
      removeItem,
      updateQuantity,
      clearCart,
      totalItemsCount,
      cartCount,
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
