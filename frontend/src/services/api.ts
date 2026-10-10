/**
 * SecondLife Frontend API Client Service
 */

import {
  ApiResponse,
  Product,
  Category,
  Cart,
  Order,
  Review,
  WishlistItem,
  SupportTicket,
  User,
  SystemHealthStatus,
  ProductFilterQuery
} from '@shared/types/index.js';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem('sl_token') : null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('sl_token', token);
      else localStorage.removeItem('sl_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  }

  // Authentication
  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.data!.token);
    return res.data!;
  }

  public async register(payload: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<{ user: User; token: string }> {
    const res = await this.request<ApiResponse<{ user: User; token: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.data!.token);
    return res.data!;
  }

  public async getMe(): Promise<User> {
    const res = await this.request<ApiResponse<User>>('/auth/me');
    return res.data!;
  }

  public async updateProfile(payload: Partial<User>): Promise<User> {
    const res = await this.request<ApiResponse<User>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return res.data!;
  }

  // Categories
  public async getCategories(): Promise<Category[]> {
    const res = await this.request<ApiResponse<Category[]>>('/categories');
    return res.data || [];
  }

  // Products
  public async getProducts(filters: ProductFilterQuery = {}): Promise<{ products: Product[]; total: number; totalPages: number }> {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.inStockOnly) params.append('inStockOnly', 'true');
    if (filters.featured) params.append('featured', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<ApiResponse<Product[]>>(`/products${query}`);
    return {
      products: res.data || [],
      total: res.meta?.total || 0,
      totalPages: res.meta?.totalPages || 1
    };
  }

  public async getProductBySlugOrId(slugOrId: string): Promise<Product> {
    const res = await this.request<ApiResponse<Product>>(`/products/${slugOrId}`);
    return res.data!;
  }

  // Cart
  public async getCart(discountCode?: string): Promise<Cart> {
    const query = discountCode ? `?discountCode=${encodeURIComponent(discountCode)}` : '';
    const res = await this.request<ApiResponse<Cart>>(`/cart${query}`);
    return res.data!;
  }

  public async addToCart(productId: string, quantity = 1, selectedSpecs?: Record<string, string>): Promise<void> {
    await this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, selectedSpecs })
    });
  }

  public async updateCartQuantity(itemId: string, quantity: number): Promise<void> {
    await this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  public async removeFromCart(itemId: string): Promise<void> {
    await this.request(`/cart/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  public async clearCart(): Promise<void> {
    await this.request('/cart', {
      method: 'DELETE'
    });
  }

  // Checkout & Orders
  public async checkout(payload: {
    shippingAddress: any;
    paymentMethod: string;
    paymentMethodToken?: string;
    discountCode?: string;
    notes?: string;
  }): Promise<any> {
    const res = await this.request<ApiResponse<any>>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  }

  public async getMyOrders(): Promise<Order[]> {
    const res = await this.request<ApiResponse<Order[]>>('/orders/my-orders');
    return res.data || [];
  }

  public async getOrder(idOrNumber: string): Promise<Order> {
    const res = await this.request<ApiResponse<Order>>(`/orders/${idOrNumber}`);
    return res.data!;
  }

  // Reviews
  public async getReviews(productId: string): Promise<Review[]> {
    const res = await this.request<ApiResponse<Review[]>>(`/reviews/products/${productId}`);
    return res.data || [];
  }

  public async submitReview(productId: string, rating: number, title: string, comment: string): Promise<void> {
    await this.request(`/reviews/products/${productId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, title, comment })
    });
  }

  // Wishlist
  public async getWishlist(): Promise<WishlistItem[]> {
    const res = await this.request<ApiResponse<WishlistItem[]>>('/wishlist');
    return res.data || [];
  }

  public async toggleWishlist(productId: string): Promise<{ inWishlist: boolean }> {
    const res = await this.request<ApiResponse<{ inWishlist: boolean }>>('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    return (res as any);
  }

  // Support
  public async getMyTickets(): Promise<SupportTicket[]> {
    const res = await this.request<ApiResponse<SupportTicket[]>>('/support/my-tickets');
    return res.data || [];
  }

  public async createTicket(payload: { subject: string; category: string; priority: string; message: string; orderId?: string }): Promise<any> {
    const res = await this.request<ApiResponse<any>>('/support', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  }

  public async addTicketMessage(ticketId: string, message: string): Promise<any> {
    const res = await this.request<ApiResponse<any>>(`/support/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    return res.data;
  }

  // Addresses
  public async getAddresses(): Promise<any[]> {
    const res = await this.request<ApiResponse<any[]>>('/addresses');
    return res.data || [];
  }

  public async createAddress(payload: any): Promise<any> {
    const res = await this.request<ApiResponse<any>>('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  }

  // Admin APIs
  public async getAdminHealth(): Promise<SystemHealthStatus> {
    const res = await this.request<ApiResponse<SystemHealthStatus>>('/admin/health');
    return res.data!;
  }

  public async getAdminCustomers(search?: string): Promise<any[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await this.request<ApiResponse<any[]>>(`/admin/customers${query}`);
    return res.data || [];
  }

  public async toggleCustomerStatus(customerId: string, isActive: boolean): Promise<void> {
    await this.request(`/admin/customers/${customerId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    });
  }

  public async getAdminOrders(status?: string, search?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<ApiResponse<any[]>>(`/orders/admin/all${query}`);
    return res.data || [];
  }

  public async updateAdminOrderStatus(orderId: string, status: string, trackingNumber?: string, carrier?: string): Promise<void> {
    await this.request(`/orders/admin/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, trackingNumber, carrier })
    });
  }

  public async getAdminAuditLogs(): Promise<any> {
    const res = await this.request<ApiResponse<any>>('/admin/audit-logs');
    return res.data || [];
  }

  public async getAdminLowStock(): Promise<any[]> {
    const res = await this.request<ApiResponse<any[]>>('/admin/low-stock');
    return res.data || [];
  }

  public async createProduct(payload: any): Promise<any> {
    const res = await this.request<ApiResponse<any>>('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  }

  public async updateProduct(id: string, payload: any): Promise<any> {
    const res = await this.request<ApiResponse<any>>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return res.data;
  }

  public async archiveProduct(id: string): Promise<any> {
    const res = await this.request<ApiResponse<any>>(`/products/${id}`, {
      method: 'DELETE'
    });
    return res.data;
  }

  public async getAdminTickets(): Promise<any[]> {
    const res = await this.request<ApiResponse<any[]>>('/support/admin/all');
    return res.data || [];
  }

  public async updateAdminTicketStatus(ticketId: string, status: string, priority?: string): Promise<void> {
    await this.request(`/support/admin/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, priority })
    });
  }
}

export const api = new ApiClient();
