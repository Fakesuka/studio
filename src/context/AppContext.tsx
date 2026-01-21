'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Order, CartItem, SellerProfile, Product, Shop } from '@/lib/types';
import { mockProducts, mockShops } from '@/lib/data';

interface AppContextType {
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  cart: CartItem[];
  addToCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  getCartItemQuantity: (productId: string) => number;
  isContextLoading: boolean;
  isSeller: boolean;
  sellerProfile: SellerProfile | null;
  registerAsSeller: (profile: SellerProfile) => void;
  products: Product[];
  shops: Shop[];
  addProduct: (productData: Omit<Product, 'id' | 'shopId'>) => void;
  deleteProduct: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isContextLoading, setIsContextLoading] = useState(true);

  const MOCK_USER_ID = 'self';

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
      const isSellerItem = window.localStorage.getItem('isSeller');
      if (isSellerItem) {
        setIsSeller(JSON.parse(isSellerItem));
      }
      const sellerProfileItem = window.localStorage.getItem('sellerProfile');
      if (sellerProfileItem) {
        setSellerProfile(JSON.parse(sellerProfileItem));
      }
      const productsItem = window.localStorage.getItem('products');
      setProducts(productsItem ? JSON.parse(productsItem) : mockProducts);

      const shopsItem = window.localStorage.getItem('shops');
      setShops(shopsItem ? JSON.parse(shopsItem) : mockShops);
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      localStorage.clear(); // Clear all keys on error
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

  const registerAsSeller = (profile: SellerProfile) => {
    setIsSeller(true);
    setSellerProfile(profile);

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
      window.localStorage.setItem('sellerProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save seller data to localStorage', error);
    }
  };

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
        isSeller,
        sellerProfile,
        registerAsSeller,
        products,
        shops,
        addProduct,
        deleteProduct,
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
