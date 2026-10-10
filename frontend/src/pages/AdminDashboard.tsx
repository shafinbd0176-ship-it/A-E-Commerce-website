import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  SystemHealthStatus,
  Product,
  Category,
  ProductCondition
} from '@shared/types/index.js';
import { PRODUCT_CONDITIONS } from '@shared/constants/index.js';
import {
  Activity,
  Package,
  ShoppingCart,
  Users,
  Headphones,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Send,
  ShieldCheck,
  Search
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'health' | 'products' | 'orders' | 'customers' | 'support' | 'audit'>('health');

  // State Data
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodPrice, setProdPrice] = useState<number>(499);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number>(899);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodCondition, setProdCondition] = useState<ProductCondition>('RECONSTRUCTED_MINT');
  const [prodStock, setProdStock] = useState<number>(5);
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodDonorDevice, setProdDonorDevice] = useState('Enterprise Server Decommission 2021');
  const [prodSalvagedParts, setProdSalvagedParts] = useState('Intel Xeon CPU, Server Motherboard, Aluminum Fin Heatsinks');
  const [prodNewUpgrades, setProdNewUpgrades] = useState('Gen4 NVMe SSD, Nichicon Capacitors, Liquid Cooler');
  const [prodEWasteKg, setProdEWasteKg] = useState<number>(3.5);
  const [prodCO2Kg, setProdCO2Kg] = useState<number>(45.0);
  const [prodImageUrl, setProdImageUrl] = useState('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80');

  // Support Reply state
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [healthData, prodRes, catData, orderData, customerData, ticketData, auditData, lowStock] = await Promise.all([
        api.getAdminHealth(),
        api.getProducts({ limit: 50 }),
        api.getCategories(),
        api.getAdminOrders(),
        api.getAdminCustomers(),
        api.getAdminTickets(),
        api.getAdminAuditLogs(),
        api.getAdminLowStock()
      ]);

      setHealth(healthData);
      setProducts(prodRes.products);
      setCategories(catData);
      setOrders(orderData);
      setCustomers(customerData);
      setTickets(ticketData);
      setAuditLogs(auditData);
      setLowStockItems(lowStock);
      if (catData.length > 0 && !prodCategoryId) {
        setProdCategoryId(catData[0].id);
      }
    } catch (err) {
      console.error('[Admin] Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: prodTitle,
        shortDescription: prodShortDesc,
        description: prodDesc,
        price: Number(prodPrice),
        originalRetailPrice: Number(prodOriginalPrice),
        categoryId: prodCategoryId,
        condition: prodCondition,
        stockQuantity: Number(prodStock),
        images: [{ url: prodImageUrl, alt: prodTitle, isPrimary: true }],
        rebuildInfo: {
          originalDonorDevice: prodDonorDevice,
          salvagedParts: prodSalvagedParts.split(',').map(s => s.trim()),
          newUpgradesAdded: prodNewUpgrades.split(',').map(s => s.trim()),
          eWasteDivertedKg: Number(prodEWasteKg),
          co2SavedKg: Number(prodCO2Kg),
          warrantyMonths: 24,
          technicianNotes: 'Ultrasonic cleansed and 72-hr stress torture certified.'
        }
      };

      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
      } else {
        await api.createProduct(payload);
      }

      setIsProductModalOpen(false);
      setEditingProductId(null);
      await loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdTitle(prod.title);
    setProdPrice(prod.price);
    setProdOriginalPrice(prod.originalRetailPrice || prod.price * 1.5);
    setProdCategoryId(prod.categoryId);
    setProdCondition(prod.condition);
    setProdStock(prod.stockQuantity);
    setProdShortDesc(prod.shortDescription);
    setProdDesc(prod.description);
    setProdDonorDevice(prod.rebuildInfo?.originalDonorDevice || '');
    setProdSalvagedParts(prod.rebuildInfo?.salvagedParts?.join(', ') || '');
    setProdNewUpgrades(prod.rebuildInfo?.newUpgradesAdded?.join(', ') || '');
    setProdEWasteKg(prod.rebuildInfo?.eWasteDivertedKg || 2.0);
    setProdCO2Kg(prod.rebuildInfo?.co2SavedKg || 30.0);
    setProdImageUrl(prod.images?.[0]?.url || '');
    setIsProductModalOpen(true);
  };

  const handleArchiveProduct = async (id: string) => {
    if (!confirm('Are you sure you want to archive this circular product from the active catalog?')) return;
    try {
      await api.archiveProduct(id);
      await loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNum?: string) => {
    try {
      await api.updateAdminOrderStatus(orderId, status, trackingNum || 'SL-EXP-9921', 'SecondLife EcoExpress');
      await loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCustomer = async (customerId: string, currentActive: boolean) => {
    try {
      await api.toggleCustomerStatus(customerId, !currentActive);
      await loadAllAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendAdminReply = async (ticketId: string) => {
    if (!adminReplyText.trim()) return;
    try {
      await api.addTicketMessage(ticketId, adminReplyText);
      await api.updateAdminTicketStatus(ticketId, 'WAITING_ON_CUSTOMER');
      setAdminReplyText('');
      await loadAllAdminData();
      setSelectedTicket(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> SecondLife Chief Engineering Console
          </div>
          <h1 className="text-2xl font-extrabold text-white">Platform Administration & Logistics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time diagnostics, modular catalog management, order pipeline, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllAdminData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh Diagnostic Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingProductId(null);
              setProdTitle('');
              setProdShortDesc('');
              setProdDesc('');
              setIsProductModalOpen(true);
            }}
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-glow-cyan"
          >
            <Plus className="w-4 h-4" /> Add Rebuilt Hardware
          </button>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto gap-1">
        {[
          { id: 'health', label: 'System Health & Telemetry', icon: Activity },
          { id: 'products', label: 'Circular Inventory & Catalog', icon: Package },
          { id: 'orders', label: 'Order Dispatch Pipeline', icon: ShoppingCart },
          { id: 'customers', label: 'Customer Management', icon: Users },
          { id: 'support', label: 'Repair & Support Tickets', icon: Headphones },
          { id: 'audit', label: 'Security Audit Logs', icon: FileText }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === t.id ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM HEALTH & TELEMETRY */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* KPI Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Total Revenue</div>
              <div className="text-2xl font-bold font-mono text-white">${health?.metrics?.totalRevenue?.toFixed(2) || '0.00'}</div>
              <div className="text-[10px] text-emerald-400 font-mono">Processed via Payment Abstraction</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">E-Waste Diverted</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{health?.metrics?.eWasteTotalDivertedKg || '0.0'} kg</div>
              <div className="text-[10px] text-slate-400 font-mono">CO₂: {health?.metrics?.co2TotalSavedKg || '0.0'} kg</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Active Hardware Orders</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">{health?.metrics?.activeOrders || '0'}</div>
              <div className="text-[10px] text-slate-400 font-mono">Total Products: {health?.metrics?.totalProducts || '0'}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-xs text-slate-400 font-mono uppercase">Registered Customers</div>
              <div className="text-2xl font-bold font-mono text-purple-400">{health?.metrics?.totalCustomers || '0'}</div>
              <div className="text-[10px] text-slate-400 font-mono">With verified credentials</div>
            </div>
          </div>

          {/* Real Service Diagnostics Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" /> Modular Service Diagnostics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">REST API Gateway</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {health?.services?.api?.status}
                  </span>
                </div>
                <div className="text-slate-400">Response Latency: <span className="font-mono text-cyan-400 font-bold">{health?.services?.api?.responseTimeMs}ms</span></div>
                <div className="text-slate-400">Uptime: <span className="font-mono text-slate-200">{health?.uptimeSeconds}s</span></div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Relational Database</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {health?.services?.database?.status}
                  </span>
                </div>
                <div className="text-slate-400">Engine: <span className="font-mono text-slate-200">{health?.services?.database?.type}</span></div>
                <div className="text-slate-400">Connection Pool: <span className="font-mono text-slate-200">Active</span></div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">AI Recommendation Service</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {health?.services?.pythonRecommendation?.status}
                  </span>
                </div>
                <div className="text-slate-400">Framework: <span className="font-mono text-slate-200">Python FastAPI</span></div>
                <div className="text-slate-400">Similarity Scoring: <span className="font-mono text-slate-200">Active</span></div>
              </div>
            </div>
          </div>

          {/* Low Stock Warning Alert Table */}
          {lowStockItems.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" /> Low-Stock Restocked Alerts (Stock &le; 3)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {lowStockItems.map((it) => (
                  <div key={it.id} className="p-3 bg-slate-950 rounded-xl border border-amber-500/20 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-200 truncate max-w-[180px]">{it.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</div>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 font-mono font-bold">
                      {it.stock_quantity} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS INVENTORY */}
      {activeTab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Circular Hardware Catalog ({products.length})</h2>
              <p className="text-xs text-slate-400">Add, edit rebuild specs, update stock quantities, or archive items.</p>
            </div>
            <button
              onClick={() => {
                setEditingProductId(null);
                setProdTitle('');
                setProdShortDesc('');
                setProdDesc('');
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register New Rebuilt Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Product Title & SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Condition Grade</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Stock</th>
                  <th className="p-3.5">E-Waste Saved</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100 max-w-xs truncate">{prod.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{prod.sku}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">{prod.category?.name || 'Hardware'}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {prod.condition}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-100 font-bold">${prod.price.toFixed(2)}</td>
                    <td className="p-3.5 font-mono font-bold">
                      <span className={prod.stockQuantity <= 3 ? 'text-amber-400' : 'text-emerald-400'}>
                        {prod.stockQuantity}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-emerald-400">
                      {prod.rebuildInfo?.eWasteDivertedKg || 1.5} kg
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 rounded-lg transition-colors"
                        title="Edit Rebuild Info"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchiveProduct(prod.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-lg transition-colors"
                        title="Archive Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS DISPATCH PIPELINE */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Order Bench & Shipping Dispatch Pipeline</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Order Number</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Total Charged</th>
                  <th className="p-3.5">Pipeline Status</th>
                  <th className="p-3.5">Tracking Number</th>
                  <th className="p-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">{ord.orderNumber}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-500">{ord.customerEmail}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">${ord.totalAmount?.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{ord.trackingNumber || 'Unassigned'}</td>
                    <td className="p-3.5 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-mono"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="QUALITY_BENCH_TESTING">QUALITY_BENCH_TESTING</option>
                        <option value="PACKAGING">PACKAGING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Registered Customer Base ({customers.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Customer Name & Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Total Orders</th>
                  <th className="p-3.5">Lifetime Spend</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Toggle Account</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{c.firstName} {c.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.email}</div>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400 uppercase text-[10px]">{c.role}</td>
                    <td className="p-3.5 font-mono text-slate-200">{c.orderCount} orders</td>
                    <td className="p-3.5 font-mono font-bold text-white">${c.lifetimeSpend?.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {c.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleCustomer(c.id, c.isActive)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${c.isActive ? 'bg-rose-950/60 text-rose-400 hover:bg-rose-900/80' : 'bg-emerald-950/60 text-emerald-400'}`}
                      >
                        {c.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT INBOX */}
      {activeTab === 'support' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Technician & Customer Service Inbox ({tickets.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((t) => (
              <div key={t.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400">{t.ticket_number}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400">
                    {t.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-200 text-sm">{t.subject}</h4>
                <div className="text-[11px] text-slate-400">
                  From: {t.first_name} {t.last_name} ({t.user_email})
                </div>

                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type official technician reply..."
                    value={selectedTicket?.id === t.id ? adminReplyText : ''}
                    onFocus={() => setSelectedTicket(t)}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                  />
                  <button
                    onClick={() => handleSendAdminReply(t.id)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white">Security & Administrative Action Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Target Entity</th>
                  <th className="p-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3.5 text-slate-200">{log.userName} ({log.userRole})</td>
                    <td className="p-3.5 text-cyan-400 font-bold">{log.action}</td>
                    <td className="p-3.5 text-slate-300">{log.entityType} #{log.entityId}</td>
                    <td className="p-3.5 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsProductModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">
              {editingProductId ? 'Edit Rebuilt Hardware Profile' : 'Register New Reconstructed Hardware'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    placeholder="e.g. SecondLife Titan Workstation"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Category</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Craft Condition Grade</label>
                  <select
                    value={prodCondition}
                    onChange={(e) => setProdCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    {Object.keys(PRODUCT_CONDITIONS).map((k) => (
                      <option key={k} value={k}>{PRODUCT_CONDITIONS[k as ProductCondition].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Original Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodOriginalPrice}
                    onChange={(e) => setProdOriginalPrice(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">E-Waste Diverted (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={prodEWasteKg}
                    onChange={(e) => setProdEWasteKg(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">Donor Hardware Source</label>
                  <input
                    type="text"
                    value={prodDonorDevice}
                    onChange={(e) => setProdDonorDevice(e.target.value)}
                    placeholder="e.g. Dell PowerEdge Server Rack 2021"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">Salvaged Parts (comma-separated)</label>
                  <input
                    type="text"
                    value={prodSalvagedParts}
                    onChange={(e) => setProdSalvagedParts(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">New Modern Upgrades (comma-separated)</label>
                  <input
                    type="text"
                    value={prodNewUpgrades}
                    onChange={(e) => setProdNewUpgrades(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={prodShortDesc}
                    onChange={(e) => setProdShortDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-300 mb-1">Detailed Hardware Rebuild Narrative</label>
                  <textarea
                    rows={3}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-glow-cyan"
                >
                  {editingProductId ? 'Update Hardware' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
