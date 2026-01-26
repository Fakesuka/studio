import { getTelegramInitData } from './telegram';
import { safeErrorLog } from './error-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Функция для очистки данных от несериализуемых значений
function serializeData(data: any): string {
  const cleanedData = cleanData(data);
  console.log('[API] Serialized data:', cleanedData);
  
  // Дополнительная проверка
  try {
    const result = JSON.stringify(cleanedData);
    return result;
  } catch (error) {
    console.error('[API] JSON.stringify failed even after cleaning');
    console.error('[API] Error:', error instanceof Error ? error.message : String(error));

    // Экстренное решение: отправляем только примитивные значения
    const emergencyData = extractPrimitives(data);
    console.log('[API] Emergency fallback data:', emergencyData);
    return JSON.stringify(emergencyData);
  }
}

function extractPrimitives(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => extractPrimitives(item)).filter(item => item !== undefined);
  }
  
  if (typeof data === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      
      if (typeof value === 'string' || 
          typeof value === 'number' || 
          typeof value === 'boolean' ||
          value === null) {
        result[key] = value;
      } else if (Array.isArray(value)) {
        const arr = extractPrimitives(value);
        if (arr.length > 0) {
          result[key] = arr;
        }
      } else if (typeof value === 'object' && value !== null) {
        const obj = extractPrimitives(value);
        if (Object.keys(obj).length > 0) {
          result[key] = obj;
        }
      }
    }
    return result;
  }
  
  // Примитивные типы
  if (typeof data === 'string' || 
      typeof data === 'number' || 
      typeof data === 'boolean') {
    return data;
  }
  
  return null;
}

function cleanData(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => cleanData(item)).filter(item => item !== undefined);
  }
  
  if (typeof data === 'object') {
    // Преобразуем Date в строку
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // Обрабатываем File/Blob - пропускаем или преобразуем в информацию
    if (data instanceof File || data instanceof Blob) {
      console.warn('[API] File/Blob object found, cannot serialize directly');
      return {
        name: data.name,
        type: data.type,
        size: data.size,
        lastModified: data.lastModified,
        _type: 'FileInfo'
      };
    }
    
    // Пропускаем функции
    if (typeof data === 'function') {
      console.warn('[API] Function found, skipping');
      return undefined;
    }
    
    // Для DOM элементов и других специфичных объектов
    if (data.nodeType !== undefined || data instanceof HTMLElement) {
      console.warn('[API] DOM element found, skipping');
      return undefined;
    }
    
    // Для React рефов
    if (data.current !== undefined && typeof data === 'object') {
      console.warn('[API] React ref found, skipping');
      return undefined;
    }
    
    // Проверяем, не является ли это прокси (React состояние)
    if (typeof data === 'object' && 
        (data.constructor?.name === 'Proxy' || 
         data[Symbol.toStringTag] === 'Observable')) {
      console.warn('[API] Proxy/Observable found, extracting values');
      // Пытаемся получить простые значения
      const simpleObj: any = {};
      for (const key in data) {
        if (typeof data[key] !== 'function') {
          simpleObj[key] = cleanData(data[key]);
        }
      }
      return simpleObj;
    }
    
    // Рекурсивно очищаем объект
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Пропускаем undefined
      if (value === undefined) continue;
      
      // Пропускаем символы
      if (typeof key === 'symbol') continue;
      
      const cleanedValue = cleanData(value);
      
      // Если значение стало undefined после очистки - пропускаем
      if (cleanedValue !== undefined) {
        result[key] = cleanedValue;
      }
    }
    
    return result;
  }
  
  // Примитивные типы оставляем как есть
  return data;
}

// Вспомогательная функция для валидации данных перед отправкой
export function validateDataForApi(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  function checkValue(value: any, path: string = '') {
    if (value === undefined) {
      errors.push(`${path} содержит undefined`);
      return;
    }
    
    if (typeof value === 'function') {
      errors.push(`${path} является функцией`);
      return;
    }
    
    if (value instanceof HTMLElement) {
      errors.push(`${path} является DOM элементом`);
      return;
    }
    
    if (value instanceof Date) {
      // Date объекты допустимы, они будут преобразованы
      return;
    }
    
    if (value instanceof File || value instanceof Blob) {
      errors.push(`${path} является File/Blob объектом`);
      return;
    }
    
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, `${path}[${index}]`);
      });
      return;
    }
    
    if (typeof value === 'object' && value !== null) {
      for (const [key, val] of Object.entries(value)) {
        checkValue(val, path ? `${path}.${key}` : key);
      }
      return;
    }
  }
  
  checkValue(data);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const initData = getTelegramInitData();

    console.log(`[API] Request to ${endpoint}`, {
      method: options.method || 'GET',
      body: options.body,
      hasInitData: !!initData,
      timestamp: new Date().toISOString()
    });

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(initData && { 'X-Telegram-Init-Data': initData }),
      ...options.headers,
    };

    // Валидация тела запроса, если оно есть
    if (options.body) {
      try {
        // Пытаемся распарсить для логирования
        const bodyObj = JSON.parse(options.body as string);
        const validation = validateDataForApi(bodyObj);
        if (!validation.isValid) {
          console.warn(`[API] Validation warnings for ${endpoint}:`, validation.errors);
        }
      } catch (e) {
        // Не проблема, если не JSON
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      console.log(`[API] Response from ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error(`[API] Error from ${endpoint}:`, errorData);
        
        // Создаем более информативную ошибку
        const error = new Error(errorData.error || errorData.message || errorData.details || `HTTP ${response.status}`);
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      const data = await response.json();
      console.log(`[API] Success from ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`[API] Exception for ${endpoint}`);
      safeErrorLog(error);

      // Добавляем дополнительную информацию об ошибке
      if (error instanceof Error) {
        (error as any).endpoint = endpoint;
        (error as any).timestamp = new Date().toISOString();
      }

      throw error;
    }
  }

  // Users
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: any) {
    console.log('[API] updateProfile called with data:', data);
    const validation = validateDataForApi(data);
    if (!validation.isValid) {
      console.warn('[API] updateProfile validation warnings:', validation.errors);
    }

    return this.request('/users/profile', {
      method: 'PUT',
      body: serializeData(data),
    });
  }

  async getBalance() {
    return this.request('/users/balance');
  }

  async registerAsDriver(data: any) {
    console.log('[API] registerAsDriver called with data:', data);
    return this.request('/users/register-driver', {
      method: 'POST',
      body: serializeData(data),
    });
  }

  async registerAsSeller(data: any) {
    console.log('[API] registerAsSeller called with data:', data);
    return this.request('/users/register-seller', {
      method: 'POST',
      body: serializeData(data),
    });
  }

  // Orders
  async createOrder(data: any) {
    console.log('[API] createOrder called with data:', data);
    return this.request('/orders', {
      method: 'POST',
      body: serializeData(data),
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
    console.log('[API] addProduct called with data:', data);
    return this.request('/marketplace/products', {
      method: 'POST',
      body: serializeData(data),
    });
  }

  async updateProduct(productId: string, data: any) {
    console.log('[API] updateProduct called with data:', data);
    return this.request(`/marketplace/products/${productId}`, {
      method: 'PUT',
      body: serializeData(data),
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
      body: serializeData({ productId, quantity }),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.request(`/marketplace/cart/${productId}`, {
      method: 'PUT',
      body: serializeData({ quantity }),
    });
  }

  async removeFromCart(productId: string) {
    return this.request(`/marketplace/cart/${productId}`, {
      method: 'DELETE',
    });
  }

  async placeMarketplaceOrder(data: any) {
    console.log('[API] placeMarketplaceOrder called with data:', data);
    return this.request('/marketplace/orders', {
      method: 'POST',
      body: serializeData(data),
    });
  }

  async getMarketplaceOrders() {
    return this.request('/marketplace/orders');
  }

  async getSellerOrders() {
    return this.request('/marketplace/seller/orders');
  }

  // Утилита для тестирования сериализации
  testSerialization(data: any): { success: boolean; error?: string; serialized?: string } {
    try {
      const serialized = serializeData(data);
      return { success: true, serialized };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // ===== PAYMENTS =====
  async createTopUpPayment(amount: number) {
    console.log('[API] createTopUpPayment called with amount:', amount);
    return this.request('/payments/create', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async checkPaymentStatus(paymentId: string) {
    return this.request(`/payments/${paymentId}/status`);
  }

  async getTransactions() {
    return this.request('/payments/transactions');
  }

  async requestWithdrawal(amount: number, method: string, details: any) {
    return this.request('/payments/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, method, details }),
    });
  }

  // ===== REVIEWS =====
  async createReview(orderId: string, rating: number, comment: string) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ orderId, rating, comment }),
    });
  }

  async getUserReviews(userId: string) {
    return this.request(`/reviews/user/${userId}`);
  }

  async getMyReviews() {
    return this.request('/reviews/my-reviews');
  }

  async canReviewOrder(orderId: string) {
    return this.request(`/reviews/can-review/${orderId}`);
  }

  // ===== CHAT =====
  async getConversations() {
    return this.request('/chat/conversations');
  }

  async getUnreadCount() {
    return this.request('/chat/unread-count');
  }

  async getChatMessages(orderId: string) {
    return this.request(`/chat/${orderId}/messages`);
  }

  async sendChatMessage(orderId: string, content: string) {
    return this.request(`/chat/${orderId}/send`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // ===== BONUSES & PROMOCODES =====
  async applyPromocode(code: string) {
    return this.request('/bonuses/apply-promocode', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async confirmPromocodeUsage(code: string, orderId: string) {
    return this.request('/bonuses/confirm-promocode-usage', {
      method: 'POST',
      body: JSON.stringify({ code, orderId }),
    });
  }

  async getReferralLink() {
    return this.request('/bonuses/referral-link');
  }

  async registerReferral(referralCode: string) {
    return this.request('/bonuses/register-referral', {
      method: 'POST',
      body: JSON.stringify({ referralCode }),
    });
  }

  // ===== ANALYTICS =====
  async getDriverAnalytics() {
    return this.request('/analytics/driver');
  }

  async getSellerAnalytics() {
    return this.request('/analytics/seller');
  }

  async getTopDrivers() {
    return this.request('/analytics/top-drivers');
  }

  // ===== ADMIN =====
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getAllUsers() {
    return this.request('/admin/users');
  }

  async makeAdmin(userId: string) {
    return this.request(`/admin/users/${userId}/make-admin`, {
      method: 'POST',
    });
  }

  async removeAdmin(userId: string) {
    return this.request(`/admin/users/${userId}/remove-admin`, {
      method: 'POST',
    });
  }

  async getPendingDrivers() {
    return this.request('/admin/drivers/pending');
  }

  async verifyDriver(driverId: string) {
    return this.request(`/admin/drivers/${driverId}/verify`, {
      method: 'POST',
    });
  }

  async unverifyDriver(driverId: string) {
    return this.request(`/admin/drivers/${driverId}/unverify`, {
      method: 'POST',
    });
  }

  async getPendingSellers() {
    return this.request('/admin/sellers/pending');
  }

  async verifySeller(sellerId: string) {
    return this.request(`/admin/sellers/${sellerId}/verify`, {
      method: 'POST',
    });
  }

  async unverifySeller(sellerId: string) {
    return this.request(`/admin/sellers/${sellerId}/unverify`, {
      method: 'POST',
    });
  }

  async getPendingProducts() {
    return this.request('/admin/products/pending');
  }

  async approveProduct(productId: string) {
    return this.request(`/admin/products/${productId}/approve`, {
      method: 'POST',
    });
  }

  async unapproveProduct(productId: string) {
    return this.request(`/admin/products/${productId}/unapprove`, {
      method: 'POST',
    });
  }

  async adminDeleteProduct(productId: string) {
    return this.request(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getAllOrders() {
    return this.request('/admin/orders');
  }

  // Admin: Create promocode
  async createPromocode(data: {
    code: string;
    type: string;
    value: number;
    maxUses?: number;
    expiresAt?: string;
  }) {
    return this.request('/bonuses/promocodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllPromocodes() {
    return this.request('/bonuses/promocodes');
  }
}

// Создаем экземпляр API с улучшенной обработкой ошибок
export const api = new ApiClient(API_URL);
