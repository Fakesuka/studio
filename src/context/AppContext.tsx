'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Order } from '@/lib/types';

interface AppContextType {
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  return (
    <AppContext.Provider value={{ activeOrder, setActiveOrder }}>
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
