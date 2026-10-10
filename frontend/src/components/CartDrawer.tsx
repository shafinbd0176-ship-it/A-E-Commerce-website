import React, { useState } from 'react';
import { useCart } from '../context/CartContext.js';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Leaf, ShieldCheck, Tag } from 'lucide-react';
import { DISCOUNT_CODES } from '@shared/constants/index.js';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, applyDiscount } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (DISCOUNT_CODES[code]) {
      applyDiscount(code);
    } else {
      setCouponError('Invalid coupon code. Try SECONDLIFE10 or EARTH2026');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-100">Your Circular Cart</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Environmental Impact Banner */}
          {cart && cart.items.length > 0 && (
            <div className="bg-emerald-950/40 border-b border-emerald-500/20 px-5 py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Leaf className="w-4 h-4" />
                <span>E-Waste Diverted: <strong>{cart.totalEWasteDivertedKg} kg</strong></span>
              </div>
              <div className="text-slate-400 font-mono">
                CO₂ Saved: {cart.totalCO2SavedKg} kg
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {!cart || cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-semibold text-slate-200 mb-1">Your cart is currently empty</p>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  Explore our reconstructed workstations, restored headphones, and vintage mods.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex gap-3 items-center justify-between"
                >
                  <img
                    src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-lg bg-slate-900"
                  />

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{item.product.title}</h4>
                    <div className="text-[11px] text-cyan-400 font-mono mt-0.5">${item.unitPrice.toFixed(2)}</div>
                    <div className="text-[10px] text-emerald-400/90 font-mono mt-0.5">
                      {item.product.rebuildInfo?.eWasteDivertedKg || 1.5}kg e-waste diverted
                    </div>
                  </div>

                  {/* Quantity and Delete Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-semibold text-slate-200 px-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Checkout */}
          {cart && cart.items.length > 0 && (
            <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-4">
              {/* Discount Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Discount code (e.g. EARTH2026)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 uppercase font-mono"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
                {cart.discountCode && (
                  <p className="text-[11px] text-emerald-400">Coupon &apos;{cart.discountCode}&apos; active (-${cart.discountAmount.toFixed(2)})</p>
                )}
              </form>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-mono">${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span className="font-mono">-${cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Carbon-Neutral Shipping</span>
                  <span className="text-slate-200 font-mono">
                    {cart.estimatedShipping === 0 ? 'FREE' : `$${cart.estimatedShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total</span>
                  <span className="text-cyan-400 font-mono text-base">${cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onCheckout();
                }}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                Proceed to Sustainable Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>30-Day Money Back & Certified Repair Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
