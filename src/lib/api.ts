import { getTelegramInitData } from './telegram';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const initData = getTelegramInitData();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(initData && { 'X-Telegram-Init-Data': initData }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Users
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getBalance() {
    return this.request('/users/balance');
  }

  async registerAsDriver(data: any) {
    return this.request('/users/register-driver', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerAsSeller(data: any) {
    return this.request('/users/register-seller', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Orders
  async createOrder(data: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyOrders() {
    return this.request('/orders/my-orders');
  }

  async getAvailableOrders() {
    return this.request('/orders/available');
  }

  async getDriverOrders() {
    return this.request('/orders/driver-orders');
  }

  async acceptOrder(orderId: string) {
    return this.request(`/orders/${orderId}/accept`, {
      method: 'POST',
    });
  }

  async completeOrder(orderId: string) {
    return this.request(`/orders/${orderId}/complete`, {
      method: 'POST',
    });
  }

  async cancelOrder(orderId: string) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'POST',
    });
  }

  // Marketplace
  async getShops() {
    return this.request('/marketplace/shops');
  }

  async getShopById(shopId: string) {
    return this.request(`/marketplace/shops/${shopId}`);
  }

  async getProducts() {
    return this.request('/marketplace/products');
  }

  async getProductById(productId: string) {
    return this.request(`/marketplace/products/${productId}`);
  }

  async addProduct(data: any) {
    return this.request('/marketplace/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(productId: string, data: any) {
    return this.request(`/marketplace/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/marketplace/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getCart() {
    return this.request('/marketplace/cart');
  }

  async addToCart(productId: string, quantity: number) {
    return this.request('/marketplace/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request(`/marketplace/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request(`/marketplace/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async placeMarketplaceOrder(data: any) {
    return this.request('/marketplace/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMarketplaceOrders() {
    return this.request('/marketplace/orders');
  }

  async getSellerOrders() {
    return this.request('/marketplace/seller/orders');
  }
}

export const api = new ApiClient(API_URL);
