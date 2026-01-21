'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Order, CartItem } from '@/lib/types';
import { mockProducts } from '@/lib/data';

interface AppContextType {
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  cart: CartItem[];
  addToCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  getCartItemQuantity: (productId: string) => number;
  isContextLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isContextLoading, setIsContextLoading] = useState(true);

  // On initial client-side render, load data from localStorage
  useEffect(() => {
    try {
      const activeOrderItem = window.localStorage.getItem('activeOrder');
      if (activeOrderItem) {
        setActiveOrderState(JSON.parse(activeOrderItem));
      }
      const cartItems = window.localStorage.getItem('cart');
      if (cartItems) {
        setCart(JSON.parse(cartItems));
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      localStorage.removeItem('activeOrder');
      localStorage.removeItem('cart');
    }
    setIsContextLoading(false); // Loading is complete
  }, []);

  const setActiveOrder = (order: Order | null) => {
    setActiveOrderState(order);
    try {
      if (order) {
        window.localStorage.setItem('activeOrder', JSON.stringify(order));
      } else {
        window.localStorage.removeItem('activeOrder');
      }
    } catch (error) {
      console.error('Failed to save active order to localStorage', error);
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      window.localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  };

  const addToCart = (productId: string) => {
    const productToAdd = mockProducts.find(p => p.id === productId);
    if (!productToAdd) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
      updateCartItemQuantity(productId, existingItem.quantity + 1);
    } else {
      saveCart([...cart, { ...productToAdd, quantity: 1 }]);
    }
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const newCart = cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      saveCart(newCart);
    }
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  };

  const getCartItemQuantity = useCallback(
    (productId: string) => {
      const item = cart.find(item => item.id === productId);
      return item ? item.quantity : 0;
    },
    [cart]
  );

  return (
    <AppContext.Provider
      value={{
        activeOrder,
        setActiveOrder,
        isContextLoading,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        getCartItemQuantity,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
