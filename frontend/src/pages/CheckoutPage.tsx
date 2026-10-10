import React, { useState } from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Leaf,
  ArrowRight,
  AlertCircle,
  Package,
  Lock,
  Sparkles
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shipping details form
  const [recipientName, setRecipientName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim());
  const [streetAddress1, setStreetAddress1] = useState('742 Evergreen Terrace');
  const [streetAddress2, setStreetAddress2] = useState('Suite 4B');
  const [city, setCity] = useState('Springfield');
  const [stateOrProvince, setStateOrProvince] = useState('OR');
  const [postalCode, setPostalCode] = useState('97477');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 019-2834');

  // Payment details form
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [paymentToken, setPaymentToken] = useState('tok_sandbox_success');

  // Order Confirmation Result
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !streetAddress1 || !city || !postalCode) {
      setError('Please fill in all required shipping address fields');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderPayload = {
        shippingAddress: {
          recipientName,
          streetAddress1,
          streetAddress2,
          city,
          stateOrProvince,
          postalCode,
          country,
          phone
        },
        paymentMethod: 'SecondLife Secure Digital Pay (Encrypted)',
        paymentMethodToken: paymentToken,
        discountCode: cart?.discountCode,
        notes: 'Handle with care - certified restored precision electronics'
      };

      const result = await api.checkout(orderPayload);
      setConfirmedOrder(result);
      await refreshCart();
      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Payment or order processing failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation' && confirmedOrder) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow-emerald animate-in zoom-in-95">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono font-bold">
            Order Confirmed & Bench Scheduled
          </span>
          <h1 className="text-3xl font-extrabold text-white">
            Thank you, {recipientName}!
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your circular hardware order has been verified. Our technicians are preparing thermal verification and carbon-neutral packaging.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <div className="text-slate-400 font-mono">Order Number:</div>
              <div className="text-sm font-bold text-cyan-400 font-mono">{confirmedOrder.orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 font-mono">Total Charged:</div>
              <div className="text-base font-bold text-white font-mono">${confirmedOrder.totalAmount?.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 font-mono text-[10px]">Payment Reference</div>
              <div className="text-slate-200 font-mono text-[11px] truncate">{confirmedOrder.transactionReference}</div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
              <div className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                <Leaf className="w-3 h-3" /> E-Waste Diverted
              </div>
              <div className="text-emerald-300 font-mono text-xs font-bold">{confirmedOrder.eWasteDivertedKg} kg</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('account', { tab: 'orders' })}
            className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-glow-cyan"
          >
            Track in My Orders
          </button>
          <button
            onClick={() => onNavigate('catalog')}
            className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Checkout Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Sustainable Hardware Checkout</h1>
          <p className="text-xs text-slate-400 mt-0.5">Zero e-waste certified order fulfillment</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded-lg ${step === 'shipping' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
            1. Shipping
          </span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 'payment' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
            2. Payment
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Area (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          {step === 'shipping' ? (
            <form onSubmit={handleProceedToPayment} className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                <Truck className="w-4 h-4" /> Shipping & Delivery Information
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Full Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={streetAddress1}
                  onChange={(e) => setStreetAddress1(e.target.value)}
                  placeholder="742 Evergreen Terrace"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Apartment, Suite, Unit (Optional)</label>
                <input
                  type="text"
                  value={streetAddress2}
                  onChange={(e) => setStreetAddress2(e.target.value)}
                  placeholder="Suite 4B"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Portland"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">State / Province</label>
                  <input
                    type="text"
                    required
                    value={stateOrProvince}
                    onChange={(e) => setStateOrProvince(e.target.value)}
                    placeholder="OR"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="97201"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Phone Number for Delivery Updates</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-glow-cyan flex items-center justify-center gap-2 mt-4"
              >
                Continue to Payment Method <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <CreditCard className="w-4 h-4" /> Payment Provider Abstraction
                </div>
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Edit Address
                </button>
              </div>

              {/* Sandbox Card Simulation Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                  <span>SANDBOX TEST CARD ENVIRONMENT</span>
                  <Lock className="w-3.5 h-3.5" />
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Expires</label>
                    <input
                      type="text"
                      required
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">CVC</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                {/* Simulation Token Selectors */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Simulation Scenarios:</span>
                  <button
                    type="button"
                    onClick={() => setPaymentToken('tok_sandbox_success')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      paymentToken === 'tok_sandbox_success' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ✓ Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentToken('tok_chargeDeclined')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      paymentToken === 'tok_chargeDeclined' ? 'bg-rose-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    ✗ Simulate Decline
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-glow-cyan flex items-center justify-center gap-2"
              >
                {loading ? 'Authorizing & Bench Scheduling...' : `Authorize & Place Order ($${cart?.total.toFixed(2)})`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Right Summary (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" /> Order Items Summary
          </h3>

          <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto space-y-2">
            {cart?.items.map((item) => (
              <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="font-mono text-cyan-400 font-bold">{item.quantity}x</span>
                  <span className="text-slate-300 truncate">{item.product.title}</span>
                </div>
                <span className="font-mono text-slate-100">${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-200 font-mono">${cart?.subtotal.toFixed(2)}</span>
            </div>
            {cart && cart.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({cart.discountCode})</span>
                <span className="font-mono">-${cart.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Carbon-Neutral Shipping</span>
              <span className="text-slate-200 font-mono">{cart?.estimatedShipping === 0 ? 'FREE' : `$${cart?.estimatedShipping.toFixed(2)}`}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
              <span>Total Due</span>
              <span className="text-cyan-400 font-mono text-base">${cart?.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-400 font-mono flex items-center gap-2">
            <Leaf className="w-4 h-4 shrink-0" />
            <span>This order diverts <strong>{cart?.totalEWasteDivertedKg} kg</strong> of hazardous e-waste from landfills.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
