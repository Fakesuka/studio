'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type {
  Order,
  CartItem,
  SellerProfile,
  Product,
  Shop,
  DriverProfile,
  MarketplaceOrder,
  CustomerInfo,
} from '@/lib/types';
import { api } from '@/lib/api';
import { initTelegramWebApp, isTelegramWebApp, isDevMode } from '@/lib/telegram';

// Mock data for development mode
const mockDriverProfile: DriverProfile = {
  id: 'dev-driver-1',
  name: 'Тест Водитель',
  vehicle: 'Toyota Camry',
  services: ['Отогрев авто', 'Доставка топлива'],
  legalStatus: 'Самозанятый',
  balance: 5000,
};

const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderId: 'SAHA-0001',
    userId: 'user-1',
    service: 'Отогрев авто',
    location: 'ул. Ленина, 15',
    description: 'Машина не заводится, нужна помощь',
    price: 2500,
    date: new Date().toISOString(),
    status: 'Ищет исполнителя',
  },
  {
    id: 'order-2',
    orderId: 'SAHA-0002',
    userId: 'user-2',
    service: 'Доставка топлива',
    location: 'пр. Мира, 42',
    description: 'Закончился бензин, нужно 20 литров АИ-95',
    price: 1500,
    date: new Date(Date.now() - 3600000).toISOString(),
    status: 'Ищет исполнителя',
  },
];

export type UserRole = 'client' | 'driver';

interface AppContextType {
  orders: Order[];
  activeClientOrder: Order | null;
  activeDriverOrder: Order | null;
  createServiceRequest: (data: any) => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  getCartItemQuantity: (productId: string) => number;
  isContextLoading: boolean;
  isSeller: boolean;
  sellerProfile: SellerProfile | null;
  registerAsSeller: (
    profile: Omit<SellerProfile, 'id' | 'balance' | 'agreement'>
  ) => Promise<void>;
  products: Product[];
  shops: Shop[];
  addProduct: (productData: Omit<Product, 'id' | 'shopId'>) => Promise<void>;
  updateProduct: (
    productId: string,
    productData: Partial<Omit<Product, 'id' | 'shopId'>>
  ) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateShop: (shopId: string, data: Partial<Shop>) => Promise<void>;
  isDriver: boolean;
  driverProfile: DriverProfile | null;
  registerAsDriver: (
    profile: Omit<DriverProfile, 'id' | 'balance' | 'agreement'>
  ) => Promise<void>;
  marketplaceOrders: MarketplaceOrder[];
  placeMarketplaceOrder?: (details: {
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
  }) => Promise<void>;
  refreshData: () => Promise<void>;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  balance: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Check dev mode inside component to avoid SSR hydration mismatch
  const [isDevModeEnabled, setIsDevModeEnabled] = useState(false);

  // Initialize dev mode flag on client side only
  useEffect(() => {
    const devMode = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1');
    setIsDevModeEnabled(devMode);

    // If in dev mode, set mock data
    if (devMode) {
      setIsDriver(true);
      setDriverProfile(mockDriverProfile);
      setOrders(mockOrders);
      setBalance(5000);
      setIsContextLoading(false);
    }
  }, []);

  // Start with loading state, data will be set after mount
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isDriver, setIsDriver] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [marketplaceOrders, setMarketplaceOrders] = useState<MarketplaceOrder[]>([]);
  const [balance, setBalance] = useState(0);

  // Load saved role from localStorage or default to 'client'
  const [currentRole, setCurrentRoleState] = useState<UserRole>('client');

  // Load role from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userRole');
      if (saved === 'client' || saved === 'driver') {
        setCurrentRoleState(saved);
      }
    }
  }, []);

  // Save role to localStorage when it changes
  const setCurrentRole = useCallback((role: UserRole) => {
    setCurrentRoleState(role);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role);
    }
  }, []);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isTelegramWebApp()) {
        initTelegramWebApp();
      }
    }
  }, []);

  const normalizeCartData = (cartData: any): CartItem[] => {
    if (!cartData) return [];
    if (Array.isArray(cartData)) return cartData;
    if (Array.isArray(cartData.items)) return cartData.items;
    if (Array.isArray(cartData.cart)) return cartData.cart;
    return [];
  };

  const getCartItemId = (item: CartItem & { product?: Product; productId?: string }) =>
    item.product?.id ?? item.productId ?? item.id;

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsContextLoading(true);

      // In dev mode without backend, use mock data
      const useDevMockData = isDevMode();

      try {
        // Load user profile
        const profile = await api.getProfile() as any;
        setIsDriver(profile.isDriver);
        setIsSeller(profile.isSeller);
        setDriverProfile(profile.driverProfile);
        setSellerProfile(profile.sellerProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        if (useDevMockData) {
          console.log('[DEV] Using mock driver profile');
          setIsDriver(true);
          setDriverProfile(mockDriverProfile);
        }
      }

      // Load balance
      try {
        const balanceData = await api.getBalance() as any;
        setBalance(balanceData.balance || 0);
      } catch (error) {
        console.error('Error loading balance:', error);
        setBalance(useDevMockData ? 5000 : 0);
      }

      // Load shops and products
      try {
        const [shopsData, productsData] = await Promise.all([
          api.getShops(),
          api.getProducts(),
        ]);
        setShops(shopsData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error loading shops/products:', error);
        if (useDevMockData) {
          setShops([]);
          setProducts([]);
        }
      }

      // Load orders
      try {
        const ordersData = await api.getMyOrders();
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        if (useDevMockData) {
          console.log('[DEV] Using mock orders');
          setOrders(mockOrders);
        }
      }

      // Load cart
      try {
        const cartData = await api.getCart();
        setCart(normalizeCartData(cartData));
      } catch (error) {
        console.error('Error loading cart:', error);
        if (useDevMockData) {
          setCart([]);
        }
      }

      // Load marketplace orders
      try {
        const marketplaceOrdersData = await api.getMarketplaceOrders();
        setMarketplaceOrders(marketplaceOrdersData || []);
      } catch (error) {
        console.error('Error loading marketplace orders:', error);
        if (useDevMockData) {
          setMarketplaceOrders([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsContextLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip loading data in dev mode - mock data is already set
    if (!isDevModeEnabled) {
      loadData();
    }
  }, [loadData, isDevModeEnabled]);

  const createServiceRequest = async (data: any) => {
    try {
      const newOrder = await api.createOrder({
        service: data.serviceType,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        photo: data.photo,
        price: data.suggestedPrice,
      });
      setOrders((prev) => [...prev, newOrder]);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const updatedOrder = await api.acceptOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updatedOrder : o))
      );
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  };

  const completeOrder = async (orderId: string) => {
    try {
      const result = await api.completeOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? result.order : o))
      );
      // Refresh driver profile to update balance
      const profile = await api.getProfile();
      setDriverProfile(profile.driverProfile);
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  };

  const activeClientOrder = (orders || []).find((o) => o.status === 'В процессе') || null;
  const activeDriverOrder = (orders || []).find(
    (o) => o.driverId && o.status === 'В процессе'
  ) || null;

  const addToCart = async (productId: string) => {
    try {
      const addResult = await api.addToCart(productId, 1);
      const cartData = await api.getCart();
      const normalized = normalizeCartData(cartData);
      if (normalized.length > 0) {
        setCart(normalized);
      } else if (addResult) {
        setCart(prev => {
          const existing = prev.find(item => getCartItemId(item) === productId);
          if (existing) {
            return prev.map(item =>
              getCartItemId(item) === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
      } else {
        await api.updateCartItem(productId, quantity);
        const cartData = await api.getCart();
        setCart(normalizeCartData(cartData));
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await api.removeFromCart(productId);
      setCart(prev =>
        prev.filter(item => getCartItemId(item) !== productId)
      );
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const getCartItemQuantity = useCallback(
    (productId: string) => {
      const item = cart.find((item) => getCartItemId(item) === productId);
      return item ? item.quantity : 0;
    },
    [cart]
  );

  const addProduct = async (productData: Omit<Product, 'id' | 'shopId'>) => {
    try {
      const newProduct = await api.addProduct(productData);
      setProducts((prev) => [...prev, newProduct]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (
    productId: string,
    productData: Partial<Omit<Product, 'id' | 'shopId'>>
  ) => {
    try {
      const updatedProduct = await api.updateProduct(productId, productData);
      setProducts((prev) =>
        prev.map((product) => (product.id === productId ? updatedProduct : product))
      );
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const updateShop = async (shopId: string, data: Partial<Shop>) => {
    try {
      const updatedShop = await api.updateShop(shopId, data);
      setShops(prev =>
        prev.map(shop => (shop.id === shopId ? updatedShop : shop))
      );
    } catch (error) {
      console.error('Error updating shop:', error);
      throw error;
    }
  };

  const registerAsSeller = async (
    profile: Omit<SellerProfile, 'id' | 'balance' | 'agreement'>
  ) => {
    try {
      const result = await api.registerAsSeller(profile);
      setIsSeller(true);
      setSellerProfile(result.sellerProfile);
      setShops((prev) => [...prev, result.shop]);
    } catch (error) {
      console.error('Error registering as seller:', error);
      throw error;
    }
  };

  const registerAsDriver = async (
    profile: Omit<DriverProfile, 'id' | 'balance' | 'agreement'>
  ) => {
    try {
      const newDriverProfile = await api.registerAsDriver(profile);
      setIsDriver(true);
      setDriverProfile(newDriverProfile);
    } catch (error) {
      console.error('Error registering as driver:', error);
      throw error;
    }
  };

  const placeMarketplaceOrder = async (details: {
    customer: CustomerInfo;
    items: CartItem[];
    total: number;
  }) => {
    try {
      const order = await api.placeMarketplaceOrder({
        customerName: details.customer.name,
        customerPhone: details.customer.phone,
        customerAddress: details.customer.address,
        items: details.items.map((item) => ({
          productId: (item as CartItem & { product?: Product; productId?: string }).product?.id
            || (item as CartItem & { product?: Product; productId?: string }).productId
            || item.id,
          quantity: item.quantity,
        })),
      });
      setMarketplaceOrders((prev) => [...prev, order]);
      setCart([]);
    } catch (error) {
      console.error('Error placing marketplace order:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        activeClientOrder,
        activeDriverOrder,
        createServiceRequest,
        acceptOrder,
        completeOrder,
        isContextLoading,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        getCartItemQuantity,
        isSeller,
        sellerProfile,
        registerAsSeller,
        products,
        shops,
        addProduct,
        updateProduct,
        deleteProduct,
        updateShop,
        isDriver,
        driverProfile,
        registerAsDriver,
        marketplaceOrders,
        placeMarketplaceOrder,
        refreshData,
        currentRole,
        setCurrentRole,
        balance,
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
