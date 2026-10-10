/**
 * SecondLife - Core Shared Domain Types & Interfaces
 */

export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductCondition = 
  | 'RECONSTRUCTED_MINT'     // Upgraded/Rebuilt with premium modifications
  | 'EXCELLENT_RESTORED'     // Fully cleaned, recapped, tested & bench-certified
  | 'CREATIVE_REPURPOSED'    // Vintage/E-waste artfully converted into new utility
  | 'PERFORMANCE_REFURBISHED'; // Industrial refurbishment with new consumables

export interface RebuildMetadata {
  originalDonorDevice: string;
  donorYear?: number;
  salvagedParts: string[];
  newUpgradesAdded: string[];
  eWasteDivertedKg: number;
  co2SavedKg: number;
  benchmarksScore?: string;
  technicianNotes?: string;
  warrantyMonths: number;
}

export interface ProductSpec {
  name: string;
  value: string;
  group?: 'Performance' | 'Connectivity' | 'Materials' | 'Audio' | 'Display' | 'General';
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  iconName?: string;
  parentId?: string;
  productCount?: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  originalRetailPrice?: number;
  categoryId: string;
  category?: Category;
  condition: ProductCondition;
  stockQuantity: number;
  sku: string;
  images: ProductImage[];
  specs: ProductSpec[];
  rebuildInfo: RebuildMetadata;
  isFeatured: boolean;
  isArchived: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  selectedSpecs?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  estimatedShipping: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  totalEWasteDivertedKg: number;
  totalCO2SavedKg: number;
}

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'PAYMENT_PROCESSING'
  | 'CONFIRMED'
  | 'QUALITY_BENCH_TESTING'
  | 'PACKAGING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  condition: ProductCondition;
  rebuildNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  totalEWasteDivertedKg: number;
  totalCO2SavedKg: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  rating: number; // 1 to 5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  user?: User;
  orderId?: string;
  subject: string;
  category: 'PRODUCT_INQUIRY' | 'ORDER_TRACKING' | 'REPAIR_WARRANTY' | 'RETURN_REFUND' | 'TECHNICAL_ASSISTANCE' | 'OTHER';
  priority: TicketPriority;
  status: TicketStatus;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'PRODUCT' | 'ORDER' | 'USER' | 'INVENTORY' | 'SUPPORT' | 'SYSTEM';
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface SystemHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimeSeconds: number;
  timestamp: string;
  services: {
    api: { status: 'UP' | 'DOWN'; responseTimeMs: number };
    database: { status: 'UP' | 'DOWN'; type: string; poolActive: number };
    cache: { status: 'UP' | 'DOWN' | 'DISABLED'; engine: string };
    pythonRecommendation: { status: 'UP' | 'DOWN' | 'STANDBY'; latencyMs?: number };
  };
  metrics: {
    totalProducts: number;
    activeOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    eWasteTotalDivertedKg: number;
    co2TotalSavedKg: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ProductFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'sustainability';
  featured?: boolean;
}
