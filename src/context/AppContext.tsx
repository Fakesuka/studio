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
  ServiceType,
} from '@/lib/types';
import { mockProducts, mockShops, mockProviders } from '@/lib/data';

interface AppContextType {
  orders: Order[];
  activeClientOrder: Order | null;
  createServiceRequest: (data: any) => void;
  acceptOrder: (orderId: string) => void;
  completeOrder: (orderId: string) => void;
  cart: CartItem[];
  addToCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  getCartItemQuantity: (productId: string) => number;
  isContextLoading: boolean;
  isSeller: boolean;
  sellerProfile: SellerProfile | null;
  registerAsSeller: (
    profile: Omit<SellerProfile, 'id' | 'balance'>
  ) => void;
  products: Product[];
  shops: Shop[];
  addProduct: (productData: Omit<Product, 'id' | 'shopId'>) => void;
  deleteProduct: (productId: string) => void;
  isDriver: boolean;
  driverProfile: DriverProfile | null;
  registerAsDriver: (profile: Omit<DriverProfile, 'id' | 'balance'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isDriver, setIsDriver] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(
    null
  );
  const [isContextLoading, setIsContextLoading] = useState(true);

  const MOCK_USER_ID = 'self';

  useEffect(() => {
    try {
      const storedOrders = window.localStorage.getItem('orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      const cartItems = window.localStorage.getItem('cart');
      if (cartItems) setCart(JSON.parse(cartItems));

      const isSellerItem = window.localStorage.getItem('isSeller');
      if (isSellerItem) setIsSeller(JSON.parse(isSellerItem));

      const sellerProfileItem = window.localStorage.getItem('sellerProfile');
      if (sellerProfileItem) setSellerProfile(JSON.parse(sellerProfileItem));

      const productsItem = window.localStorage.getItem('products');
      setProducts(productsItem ? JSON.parse(productsItem) : mockProducts);

      const shopsItem = window.localStorage.getItem('shops');
      setShops(shopsItem ? JSON.parse(shopsItem) : mockShops);

      const isDriverItem = window.localStorage.getItem('isDriver');
      if (isDriverItem) setIsDriver(JSON.parse(isDriverItem));

      const driverProfileItem = window.localStorage.getItem('driverProfile');
      if (driverProfileItem) setDriverProfile(JSON.parse(driverProfileItem));
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
    }
    setIsContextLoading(false);
  }, []);

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      window.localStorage.setItem('orders', JSON.stringify(newOrders));
    } catch (error) {
      console.error('Failed to save orders to localStorage', error);
    }
  };

  const createServiceRequest = (data: any) => {
    const newOrder: Order = {
      id: `SAHA-${Math.floor(Math.random() * 9000) + 1000}`,
      userId: MOCK_USER_ID,
      service: data.serviceType as ServiceType,
      location: data.location,
      description: data.description,
      price: data.suggestedPrice,
      date: new Date().toISOString(),
      status: 'Ищет исполнителя',
      photo: data.photo,
    };
    saveOrders([...orders, newOrder]);
  };

  const acceptOrder = (orderId: string) => {
    if (!driverProfile) return;
    const newOrders = orders.map(o =>
      o.id === orderId
        ? {
            ...o,
            status: 'В процессе' as const,
            driverId: driverProfile.id,
            provider: {
              id: driverProfile.id,
              name: driverProfile.name,
              vehicle: driverProfile.vehicle,
              avatarUrl: 'https://picsum.photos/seed/driver-self/100/100', // Placeholder
              rating: 5.0, // Placeholder
              distance: 0, // Placeholder
            },
            arrivalTime: Math.floor(Math.random() * 10) + 5,
          }
        : o
    );
    saveOrders(newOrders);
  };

  const completeOrder = (orderId: string) => {
    const newOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'Завершен' as const } : o
    );
    saveOrders(newOrders);
  };

  const activeClientOrder =
    orders.find(o => o.userId === MOCK_USER_ID && o.status === 'В процессе') ||
    null;

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      window.localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Failed to save cart to localStorage', error);
    }
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      window.localStorage.setItem('products', JSON.stringify(newProducts));
    } catch (error) {
      console.error('Failed to save products to localStorage', error);
    }
  };

  const saveShops = (newShops: Shop[]) => {
    setShops(newShops);
    try {
      window.localStorage.setItem('shops', JSON.stringify(newShops));
    } catch (error) {
      console.error('Failed to save shops to localStorage', error);
    }
  };

  const addToCart = (productId: string) => {
    const productToAdd = products.find(p => p.id === productId);
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

  const addProduct = (productData: Omit<Product, 'id' | 'shopId'>) => {
    const userShop = shops.find(shop => shop.userId === MOCK_USER_ID);
    if (!userShop) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      shopId: userShop.id,
      ...productData,
    };
    saveProducts([...products, newProduct]);
  };

  const deleteProduct = (productId: string) => {
    const newProducts = products.filter(p => p.id !== productId);
    saveProducts(newProducts);
  };

  const registerAsSeller = (
    profile: Omit<SellerProfile, 'id' | 'balance'>
  ) => {
    const newSellerProfile = { ...profile, id: MOCK_USER_ID, balance: 0 };
    setIsSeller(true);
    setSellerProfile(newSellerProfile);

    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      name: profile.storeName,
      description: profile.storeDescription,
      type: profile.type,
      address: profile.address,
      workingHours: profile.workingHours,
      userId: MOCK_USER_ID,
      imageUrl: 'https://picsum.photos/seed/newshop/200/200',
      imageHint: 'store front',
      bannerUrl: 'https://picsum.photos/seed/newshop-banner/800/200',
      bannerHint: 'store banner',
    };
    saveShops([...shops, newShop]);

    try {
      window.localStorage.setItem('isSeller', JSON.stringify(true));
      window.localStorage.setItem(
        'sellerProfile',
        JSON.stringify(newSellerProfile)
      );
    } catch (error) {
      console.error('Failed to save seller data to localStorage', error);
    }
  };

  const registerAsDriver = (
    profile: Omit<DriverProfile, 'id' | 'balance'>
  ) => {
    const newDriverProfile = { ...profile, id: 'driver-self', balance: 0 };
    setIsDriver(true);
    setDriverProfile(newDriverProfile);
    try {
      window.localStorage.setItem('isDriver', JSON.stringify(true));
      window.localStorage.setItem(
        'driverProfile',
        JSON.stringify(newDriverProfile)
      );
    } catch (error) {
      console.error('Failed to save driver data to localStorage', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        activeClientOrder,
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
        deleteProduct,
        isDriver,
        driverProfile,
        registerAsDriver,
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
