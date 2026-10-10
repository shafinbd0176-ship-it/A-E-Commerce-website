import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { api } from '../services/api.js';
import { Order, SupportTicket, WishlistItem, Address } from '@shared/types/index.js';
import {
  Package,
  Heart,
  Headphones,
  MapPin,
  User as UserIcon,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Plus,
  Trash2,
  Leaf,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AccountPageProps {
  initialTab?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded Order Card
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // New Support Ticket Modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'PRODUCT_INQUIRY' | 'TECHNICAL_ASSISTANCE' | 'REPAIR_WARRANTY'>('TECHNICAL_ASSISTANCE');
  const [ticketMessage, setTicketMessage] = useState('');

  // Active Ticket Reply
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Profile Edit
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderData, ticketData, wishData, addrData] = await Promise.all([
        api.getMyOrders(),
        api.getMyTickets(),
        api.getWishlist(),
        api.getAddresses()
      ]);
      setOrders(orderData);
      setTickets(ticketData);
      setWishlist(wishData);
      setAddresses(addrData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTicket({
        subject: ticketSubject,
        category: ticketCategory,
        priority: 'MEDIUM',
        message: ticketMessage
      });
      setIsTicketModalOpen(false);
      setTicketSubject('');
      setTicketMessage('');
      const updatedTickets = await api.getMyTickets();
      setTickets(updatedTickets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendTicketReply = async (ticketId: string) => {
    const text = replyTextMap[ticketId];
    if (!text || text.trim().length === 0) return;

    try {
      await api.addTicketMessage(ticketId, text);
      setReplyTextMap(prev => ({ ...prev, [ticketId]: '' }));
      const updatedTickets = await api.getMyTickets();
      setTickets(updatedTickets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({ firstName, lastName, phone });
      await refreshUser();
      setProfileMsg('Profile credentials updated successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Account Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold text-2xl">
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 uppercase">
                {user?.role} account
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTicketModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-xl border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5" /> Open Repair / Tech Ticket
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto gap-1">
        {[
          { id: 'orders', label: 'My Orders & Rebuilds', icon: Package },
          { id: 'support', label: 'Support & Repair Tickets', icon: Headphones },
          { id: 'wishlist', label: 'Saved Wishlist', icon: Heart },
          { id: 'profile', label: 'Profile Settings', icon: UserIcon }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === t.id ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Order History & Rebuild Bench Tracking</h2>
          {orders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No previous hardware orders found</p>
              <p className="text-xs text-slate-400">Your reconstructed equipment orders and benchmark certificates will appear here.</p>
              <button onClick={() => onNavigate('catalog')} className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs">
                Explore Catalog
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all">
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-cyan-400">{order.orderNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} circular item(s)
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-white">${order.totalAmount.toFixed(2)}</div>
                        <div className="text-[11px] text-emerald-400 font-mono">{order.totalEWasteDivertedKg}kg e-waste diverted</div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 bg-slate-950/60 border-t border-slate-800 space-y-4 text-xs">
                      {/* Tracking Progress Timeline */}
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="text-slate-300 font-semibold mb-3">Rebuild & Dispatch Pipeline Status:</div>
                        <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                            ✓ Confirmed
                          </div>
                          <div className={`p-2 rounded-lg font-mono font-semibold ${
                            ['QUALITY_BENCH_TESTING', 'PACKAGING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            Bench Testing
                          </div>
                          <div className={`p-2 rounded-lg font-mono font-semibold ${
                            ['SHIPPED', 'DELIVERED'].includes(order.status)
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            Dispatched
                          </div>
                          <div className={`p-2 rounded-lg font-mono font-semibold ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            Delivered
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((it) => (
                          <div key={it.id} className="p-3 bg-slate-900 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img src={it.productImage} alt={it.productTitle} className="w-12 h-12 object-cover rounded-lg bg-slate-950" />
                              <div>
                                <div className="font-semibold text-slate-200">{it.productTitle}</div>
                                <div className="text-[11px] text-slate-400">{it.rebuildNotes}</div>
                              </div>
                            </div>
                            <div className="text-right font-mono font-semibold text-slate-100">
                              {it.quantity}x • ${(it.unitPrice * it.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-slate-400 text-[11px]">
                        Shipping to: {order.shippingAddress.recipientName}, {order.shippingAddress.streetAddress1}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB CONTENT: SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Technician & Repair Support Desk</h2>
              <p className="text-xs text-slate-400">Direct line to our hardware restoration specialists and warranty claims.</p>
            </div>
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-3.5 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs shadow-glow-cyan"
            >
              + New Ticket
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Headphones className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No active support conversations</p>
              <p className="text-xs text-slate-400">Need custom repasting, bench assistance or warranty repair? Open a ticket anytime.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{t.ticketNumber}</span>
                    <span className="font-semibold text-slate-200">{t.subject}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    t.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    {t.status}
                  </span>
                </div>

                {/* Conversation Thread */}
                <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                  {t.messages?.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl max-w-[85%] ${
                        m.senderRole === 'admin' || m.senderRole === 'super_admin'
                          ? 'ml-auto bg-cyan-950/60 border border-cyan-500/30 text-cyan-100'
                          : 'bg-slate-950 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span className="font-bold text-slate-200">{m.senderName}</span>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="leading-relaxed">{m.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                {t.status !== 'CLOSED' && (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type reply to technician..."
                      value={replyTextMap[t.id] || ''}
                      onChange={(e) => setReplyTextMap(prev => ({ ...prev, [t.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendTicketReply(t.id);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-xs"
                    />
                    <button
                      onClick={() => handleSendTicketReply(t.id)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Saved Circular Items ({wishlist.length})</h2>
          {wishlist.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Heart className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No bookmarked electronics</p>
              <button onClick={() => onNavigate('catalog')} className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((it) => (
                <div key={it.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between text-xs">
                  <div className="flex gap-3">
                    <img src={it.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'} alt={it.product.title} className="w-16 h-16 object-cover rounded-xl bg-slate-950" />
                    <div>
                      <h4 className="font-bold text-slate-100 line-clamp-2">{it.product.title}</h4>
                      <div className="text-cyan-400 font-mono font-bold mt-1">${it.product.price?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onNavigate('product-detail', { slug: it.product.slug })}
                      className="flex-1 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-center"
                    >
                      View Rebuild
                    </button>
                    <button
                      onClick={async () => {
                        await api.toggleWishlist(it.productId);
                        setWishlist(w => w.filter(x => x.id !== it.id));
                      }}
                      className="p-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-xl text-xs">
          <h2 className="text-lg font-bold text-white">Profile Credentials & Contact Info</h2>
          {profileMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-300">
              {profileMsg}
            </div>
          )}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-glow-cyan"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Support Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsTicketModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 z-10 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white">Create Repair & Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-1">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-medium"
                >
                  <option value="TECHNICAL_ASSISTANCE">Technical / Bench Assistance</option>
                  <option value="REPAIR_WARRANTY">Warranty Claim & Repair</option>
                  <option value="PRODUCT_INQUIRY">Hardware Pedigree Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiring on thermal repasting upgrade"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide hardware details or bench requirements..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
