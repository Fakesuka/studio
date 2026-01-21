'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import type { Order } from '@/lib/types';

interface AppContextType {
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  isContextLoading: boolean; // To let consumers know when data is ready
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
  const [isContextLoading, setIsContextLoading] = useState(true);

  // On initial client-side render, load the active order from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem('activeOrder');
      if (item) {
        setActiveOrderState(JSON.parse(item));
      }
    } catch (error) {
      // If parsing fails, just continue with a null order
      console.error('Failed to load active order from localStorage', error);
      localStorage.removeItem('activeOrder');
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

  return (
    <AppContext.Provider
      value={{ activeOrder, setActiveOrder, isContextLoading }}
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
